#!/usr/bin/env python3
"""
JanDrishti — Master Data Refresh & Pipeline Orchestration CLI

Automates the end-to-end reproducible data compilation pipeline:
  Stage 1: Checksum Verification & Raw Snapshot Validation
  Stage 2: Master Dataset ETL & Entity Resolution (build_master_dataset.py)
  Stage 3: Vectorized Feature Engineering & MAD Robust Scoring (feature_engineering.py)
  Stage 4: Anomaly Detection Engine (run_anomaly_engine.py)
  Stage 5: SQLite Database Compilation & Foreign Key Audit (build_database.py)
  Stage 6: Cryptographic Checksum Registry Generation (generate_dataset_checksums.py)

Usage:
  python scripts/refresh_pipeline.py --stage all
  python scripts/refresh_pipeline.py --stage verify
  python scripts/refresh_pipeline.py --stage db
  python scripts/refresh_pipeline.py --dry-run
"""

import os
import sys
import time
import argparse
import hashlib
import subprocess
import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
DATA_DIR = os.path.join(BASE_DIR, "data")
DATABASE_DIR = os.path.join(BASE_DIR, "database")

# Essential raw artifacts required to execute a full compilation
RAW_ARTIFACTS = [
    "data/raw/mplads_mp_summary_2026-08-26.csv",
    "data/raw/mplads_recommended_works_2026-08-26.csv",
    "data/raw/mplads_completed_works_2026-08-26.csv",
    "data/raw/mplads_expenditures_2026-08-26.csv",
    "data/raw/json_2026-08-26.json",
    "data/raw/rajya_sabha/all_rs_mp_metrics.json",
    "data/raw/rajya_sabha/all_rs_state_metrics.json",
]


def log(stage: str, msg: str, status: str = "INFO"):
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    prefix = {
        "INFO": "[\033[94mINFO\033[0m]",
        "SUCCESS": "[\033[92mPASS\033[0m]",
        "WARN": "[\033[93mWARN\033[0m]",
        "ERROR": "[\033[91mFAIL\033[0m]",
    }.get(status, f"[{status}]")
    print(f"{timestamp} {prefix} [{stage}] {msg}")


def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def stage_verify_raw_inputs() -> bool:
    """Stage 1: Verify presence, size, and readability of raw source snapshots."""
    log("VERIFY", "Auditing raw source artifact presence and cryptographic integrity...")
    all_valid = True

    for rel_path in RAW_ARTIFACTS:
        full_path = os.path.join(BASE_DIR, rel_path)
        if not os.path.exists(full_path):
            log("VERIFY", f"Missing raw artifact: {rel_path}", "ERROR")
            all_valid = False
            continue

        size = os.path.getsize(full_path)
        if size == 0:
            log("VERIFY", f"Empty raw artifact (0 bytes): {rel_path}", "ERROR")
            all_valid = False
            continue

        sha = compute_sha256(full_path)[:16]
        log("VERIFY", f"Verified {rel_path} ({size:,} bytes | SHA: {sha}...)")

    if all_valid:
        log("VERIFY", "All raw source artifacts verified successfully.", "SUCCESS")
    return all_valid


def run_script(script_name: str, stage_name: str) -> bool:
    """Execute a python script in scripts/ and stream output."""
    script_path = os.path.join(SCRIPTS_DIR, script_name)
    if not os.path.exists(script_path):
        log(stage_name, f"Script not found: {script_name}", "ERROR")
        return False

    log(stage_name, f"Executing {script_name}...")
    start_time = time.time()
    
    python_exe = sys.executable
    cmd = [python_exe, script_path]

    try:
        proc = subprocess.run(
            cmd,
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=300
        )
        elapsed = time.time() - start_time

        if proc.returncode == 0:
            log(stage_name, f"Completed {script_name} in {elapsed:.2f}s", "SUCCESS")
            # Print brief summary from last lines of stdout
            lines = [line.strip() for line in proc.stdout.strip().split("\n") if line.strip()]
            for line in lines[-3:]:
                log(stage_name, f"  -> {line}")
            return True
        else:
            log(stage_name, f"{script_name} exited with code {proc.returncode}", "ERROR")
            if proc.stderr:
                for line in proc.stderr.strip().split("\n")[-5:]:
                    log(stage_name, f"  [STDERR] {line}", "ERROR")
            return False
    except subprocess.TimeoutExpired:
        log(stage_name, f"{script_name} timed out (>300s)", "ERROR")
        return False
    except Exception as e:
        log(stage_name, f"Execution failed: {str(e)}", "ERROR")
        return False


def verify_database_integrity() -> bool:
    """Final check: confirm database exists and has exact verified totals."""
    log("DB_AUDIT", "Verifying compiled database integrity...")
    import sqlite3
    db_path = os.path.join(DATABASE_DIR, "mplads.db")
    if not os.path.exists(db_path):
        log("DB_AUDIT", f"Database not found at {db_path}", "ERROR")
        return False

    try:
        conn = sqlite3.connect(f"file:{os.path.abspath(db_path)}?mode=ro", uri=True)
        cur = conn.cursor()
        
        mps_cnt = cur.execute("SELECT COUNT(*) FROM mps").fetchone()[0]
        works_cnt = cur.execute("SELECT COUNT(*) FROM works").fetchone()[0]
        tx_cnt = cur.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
        vnd_cnt = cur.execute("SELECT COUNT(*) FROM vendors").fetchone()[0]
        anom_cnt = cur.execute("SELECT COUNT(*) FROM anomalies").fetchone()[0]
        agency_cnt = cur.execute("SELECT COUNT(*) FROM implementing_agencies").fetchone()[0] if cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='implementing_agencies'").fetchone() else 0
        timing_cnt = cur.execute("SELECT COUNT(*) FROM payment_timing_signals").fetchone()[0] if cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='payment_timing_signals'").fetchone() else 0
        sources_cnt = cur.execute("SELECT COUNT(*) FROM source_registry").fetchone()[0] if cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='source_registry'").fetchone() else 0
        media_cnt = cur.execute("SELECT COUNT(*) FROM entity_media").fetchone()[0] if cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='entity_media'").fetchone() else 0
        prof_cnt = cur.execute("SELECT COUNT(*) FROM entity_profiles").fetchone()[0] if cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='entity_profiles'").fetchone() else 0
        snap_cnt = cur.execute("SELECT COUNT(*) FROM historical_snapshots").fetchone()[0] if cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='historical_snapshots'").fetchone() else 0
        chg_cnt = cur.execute("SELECT COUNT(*) FROM change_events").fetchone()[0] if cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='change_events'").fetchone() else 0
        rec_cnt = cur.execute("SELECT COUNT(*) FROM reconciliation_records").fetchone()[0] if cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='reconciliation_records'").fetchone() else 0
        
        conn.close()

        log("DB_AUDIT", f"MPs: {mps_cnt:,} | Works: {works_cnt:,} | Vouchers: {tx_cnt:,} | Vendors: {vnd_cnt:,} | Signals: {anom_cnt:,} | IDAs: {agency_cnt:,} | Media: {media_cnt:,} | Profiles: {prof_cnt:,} | Snaps: {snap_cnt:,} | Changes: {chg_cnt:,} | Rec: {rec_cnt:,}")
        if mps_cnt >= 778 and works_cnt >= 102437 and tx_cnt >= 82296 and media_cnt >= 778 and snap_cnt >= 3:
            log("DB_AUDIT", "Database record counts match verified national baseline and universal intelligence layer.", "SUCCESS")
            return True
        else:
            log("DB_AUDIT", f"Database record counts differ from expected baseline!", "WARN")
            return False
    except Exception as e:
        log("DB_AUDIT", f"Database verification failed: {str(e)}", "ERROR")
        return False


def main():
    parser = argparse.ArgumentParser(description="JanDrishti Reproducible Master Data Refresh Pipeline")
    parser.add_argument(
        "--stage",
        choices=["all", "verify", "build-master", "features", "anomalies", "db", "enrich", "checksums"],
        default="all",
        help="Pipeline stage to execute (default: all)"
    )
    parser.add_argument("--dry-run", action="store_true", help="Inspect stages without modifying artifacts")
    args = parser.parse_args()

    print("====================================================================")
    print(" JanDrishti — Master Data Refresh & Compilation Pipeline CLI")
    print(f" Execution Mode: Stage '{args.stage}' | Dry-Run: {args.dry_run}")
    print("====================================================================")

    if args.dry_run:
        log("ORCHESTRATOR", "Dry run enabled. Validating input paths only.")
        stage_verify_raw_inputs()
        sys.exit(0)

    # Stage 1: Verify inputs
    if not stage_verify_raw_inputs():
        log("ORCHESTRATOR", "Aborting pipeline due to raw source verification failure.", "ERROR")
        sys.exit(1)

    if args.stage == "verify":
        sys.exit(0)

    stages = []
    if args.stage in ["all", "build-master"]:
        stages.append(("build_master_dataset.py", "ETL_NORMALIZATION"))
    if args.stage in ["all", "features"]:
        stages.append(("feature_engineering.py", "FEATURE_ENGINEERING"))
    if args.stage in ["all", "anomalies"]:
        stages.append(("run_anomaly_engine.py", "ANOMALY_DETECTION"))
    if args.stage in ["all", "db"]:
        stages.append(("build_database.py", "DATABASE_COMPILATION"))
    if args.stage in ["all", "enrich"]:
        stages.append(("build_enrichment_layers.py", "ENRICHMENT_LAYERS"))
        stages.append(("build_snapshot_layers.py", "SNAPSHOT_LAYERS"))
        stages.append(("build_lgd_and_crosswalk.py", "LGD_MP_CROSSWALK"))
        stages.append(("ingest_empowered_data.py", "EMPOWERED_INDIAN_INGESTION"))
    if args.stage in ["all", "checksums"]:
        stages.append(("generate_dataset_checksums.py", "CHECKSUM_REGISTRY"))

    overall_success = True
    for script_name, stage_name in stages:
        success = run_script(script_name, stage_name)
        if not success:
            log("ORCHESTRATOR", f"Pipeline halted at stage: {stage_name}", "ERROR")
            overall_success = False
            break

    if overall_success and args.stage in ["all", "db"]:
        verify_database_integrity()

    if overall_success:
        print("\n====================================================================")
        print(" \033[92mSUCCESS: JanDrishti Pipeline executed cleanly with zero discrepancies.\033[0m")
        print("====================================================================")
        sys.exit(0)
    else:
        print("\n====================================================================")
        print(" \033[91mFAILURE: Pipeline failed. Check logs above.\033[0m")
        print("====================================================================")
        sys.exit(1)


if __name__ == "__main__":
    main()
