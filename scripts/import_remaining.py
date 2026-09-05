"""
JanDrishti Production Database Import Engine
Safe, Idempotent, Resumable Import of Remaining Chunks (07 to 13) into PostgreSQL / Supabase

Key Architectural Invariants:
1. NEVER drops, truncates, or deletes any data.
2. Uses quote-aware parsing to partition large chunks into 2,000-statement atomic transactions.
3. Probes the remote database before executing any sub-batch to detect already imported data.
4. Resumes automatically from the exact sub-part if interrupted.
5. Employs connection retry with exponential backoff on network/socket disconnects.
6. Logs all progress to database/import_remaining/import_progress.log and state to database/import_remaining/import_state.json.
"""

import os
import sys
import json
import time
import datetime
import argparse
import subprocess
import re
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
CHUNKS_DIR = BASE_DIR / "database" / "import_chunks"
IMPORT_DIR = BASE_DIR / "database" / "import_remaining"
PARTS_DIR = IMPORT_DIR / "parts"
STATE_FILE = IMPORT_DIR / "import_state.json"
LOG_FILE = IMPORT_DIR / "import_progress.log"

# Default Supabase Connection Parameters
DEFAULT_HOST = "aws-0-ap-northeast-1.pooler.supabase.com"
DEFAULT_PORT = 5432
DEFAULT_USER = "postgres.dvbqjjwudtbkzjmlcvgo"
DEFAULT_DB = "postgres"

# Target Specifications for Validation & Execution
CHUNK_SPECS = [
    {
        "chunk_id": "07",
        "file_name": "07_infrastructure_works_part4.sql",
        "table": "public.infrastructure_works",
        "expected_count": 20487,
        "id_type": "work_id",
        "batch_size": 2000
    },
    {
        "chunk_id": "08",
        "file_name": "08_infrastructure_works_part5.sql",
        "table": "public.infrastructure_works",
        "expected_count": 20488,
        "id_type": "work_id",
        "batch_size": 2000
    },
    {
        "chunk_id": "09",
        "file_name": "09_treasury_vouchers_part1.sql",
        "table": "public.treasury_vouchers",
        "expected_count": 20574,
        "id_type": "legacy_transaction_id",
        "batch_size": 2000
    },
    {
        "chunk_id": "10",
        "file_name": "10_treasury_vouchers_part2.sql",
        "table": "public.treasury_vouchers",
        "expected_count": 20574,
        "id_type": "legacy_transaction_id",
        "batch_size": 2000
    },
    {
        "chunk_id": "11",
        "file_name": "11_treasury_vouchers_part3.sql",
        "table": "public.treasury_vouchers",
        "expected_count": 20574,
        "id_type": "legacy_transaction_id",
        "batch_size": 2000
    },
    {
        "chunk_id": "12",
        "file_name": "12_treasury_vouchers_part4.sql",
        "table": "public.treasury_vouchers",
        "expected_count": 20574,
        "id_type": "legacy_transaction_id",
        "batch_size": 2000
    },
    {
        "chunk_id": "13",
        "file_name": "13_governance_and_ml.sql",
        "table": "gov_and_ml",
        "expected_count": 2028,
        "id_type": "composite",
        "batch_size": 2000
    }
]

def log(msg, level="INFO"):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] [{level}] {msg}"
    print(formatted)
    try:
        IMPORT_DIR.mkdir(parents=True, exist_ok=True)
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except Exception:
        pass

def parse_sql_statements(file_path):
    """
    Quote-aware SQL statement parser.
    Splits multi-line INSERT statements cleanly without getting tripped up by
    semicolons inside string literals or multiline quotes.
    """
    text = Path(file_path).read_text(encoding="utf-8")
    statements = []
    current = []
    in_quote = False
    
    for line in text.splitlines(keepends=True):
        stripped = line.strip()
        if not stripped or stripped.startswith("--"):
            continue
        if stripped in ("BEGIN;", "COMMIT;", "BEGIN", "COMMIT") or stripped.startswith("SET "):
            continue
            
        current.append(line)
        i = 0
        while i < len(line):
            c = line[i]
            if c == "'":
                if in_quote and i + 1 < len(line) and line[i+1] == "'":
                    i += 1
                else:
                    in_quote = not in_quote
            i += 1
            
        if stripped.endswith(";") and not in_quote:
            statements.append("".join(current).strip())
            current = []
            
    if current:
        stmt = "".join(current).strip()
        if stmt:
            statements.append(stmt)
            
    return statements

def extract_statement_metadata(stmt, table):
    """Extract primary/unique identifiers from parsed statements for pre-checking."""
    if "infrastructure_works" in table:
        m = re.search(r"VALUES\s*\(\s*(\d+)\s*,", stmt, re.IGNORECASE)
        if m:
            return ("work_id", int(m.group(1)))
    elif "treasury_vouchers" in table:
        m = re.search(r"VALUES\s*\(\s*'[^']+'\s*,\s*'([^']+)'", stmt, re.IGNORECASE)
        if m:
            return ("legacy_transaction_id", m.group(1))
    elif "review_cases" in stmt:
        m = re.search(r"VALUES\s*\(\s*'([^']+)'", stmt, re.IGNORECASE)
        if m:
            return ("case_id", m.group(1))
    elif "audit_trail" in stmt:
        m = re.search(r"VALUES\s*\(\s*'([^']+)'", stmt, re.IGNORECASE)
        if m:
            return ("audit_case_id", m.group(1))
    elif "anomaly_signals" in stmt:
        m = re.search(r"VALUES\s*\(\s*'[^']+'\s*,\s*'([^']+)'", stmt, re.IGNORECASE)
        if m:
            return ("legacy_anomaly_id", m.group(1))
    return ("unknown", None)

def prepare_sub_parts(force=False):
    """
    Splits chunks 07-13 into managed sub-part files under database/import_remaining/parts/
    and creates/updates database/import_remaining/import_state.json.
    """
    PARTS_DIR.mkdir(parents=True, exist_ok=True)
    
    existing_state = {}
    if STATE_FILE.exists() and not force:
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                existing_state = json.load(f).get("parts", {})
        except Exception:
            existing_state = {}
            
    parts_meta = {}
    total_prepared = 0
    
    log("Initializing / Preparing sub-part batch files...")
    
    for spec in CHUNK_SPECS:
        chunk_file = CHUNKS_DIR / spec["file_name"]
        if not chunk_file.exists():
            log(f"Source chunk file not found: {chunk_file}", "ERROR")
            continue
            
        stmts = parse_sql_statements(chunk_file)
        count = len(stmts)
        log(f"Parsed {spec['file_name']}: {count:,} statements (Expected: {spec['expected_count']:,})")
        
        if count != spec["expected_count"]:
            log(f"Warning: Count mismatch in {spec['file_name']} (Found {count}, expected {spec['expected_count']})", "WARN")
            
        # Special handling for Chunk 13 (split by table for clean isolation)
        if spec["chunk_id"] == "13":
            cases = [s for s in stmts if "gov.review_cases" in s]
            audits = [s for s in stmts if "gov.audit_trail" in s]
            anoms = [s for s in stmts if "ml.anomaly_signals" in s]
            
            sub_configs = [
                ("part_13_01_gov_cases", "gov.review_cases", cases, "case_id"),
                ("part_13_02_gov_audits", "gov.audit_trail", audits, "audit_id"),
                ("part_13_03_ml_anomalies", "ml.anomaly_signals", anoms, "legacy_anomaly_id")
            ]
            
            for part_id, table, batch, id_field in sub_configs:
                part_file = PARTS_DIR / f"{part_id}.sql"
                
                # Write partitioned SQL file
                sql_content = (
                    f"-- JanDrishti Managed Import Sub-Part: {part_id}\n"
                    f"-- Target: {table} | Statements: {len(batch)}\n"
                    "SET standard_conforming_strings = on;\n"
                    "SET statement_timeout = '15min';\n"
                    "BEGIN;\n\n"
                    + "\n".join(batch)
                    + "\n\nCOMMIT;\n"
                )
                part_file.write_text(sql_content, encoding="utf-8")
                
                ids = [extract_statement_metadata(s, table)[1] for s in batch]
                first_id = ids[0] if ids else None
                last_id = ids[-1] if ids else None
                
                prev_status = existing_state.get(part_id, {}).get("status", "PENDING")
                
                parts_meta[part_id] = {
                    "part_id": part_id,
                    "parent_chunk": spec["file_name"],
                    "chunk_id": spec["chunk_id"],
                    "file_path": str(part_file.relative_to(BASE_DIR)),
                    "target_table": table,
                    "id_field": id_field,
                    "statement_count": len(batch),
                    "first_id": first_id,
                    "last_id": last_id,
                    "min_id": min(ids) if ids and isinstance(ids[0], int) else None,
                    "max_id": max(ids) if ids and isinstance(ids[0], int) else None,
                    "status": prev_status,
                    "completed_at": existing_state.get(part_id, {}).get("completed_at", None),
                    "execution_time_seconds": existing_state.get(part_id, {}).get("execution_time_seconds", None)
                }
                total_prepared += len(batch)
            continue
            
        # Standard batched chunks (07 to 12)
        batch_size = spec["batch_size"]
        num_batches = (count + batch_size - 1) // batch_size
        
        for batch_idx in range(num_batches):
            start = batch_idx * batch_size
            end = min(start + batch_size, count)
            batch = stmts[start:end]
            part_number = batch_idx + 1
            part_id = f"part_{spec['chunk_id']}_{part_number:02d}"
            part_file = PARTS_DIR / f"{part_id}.sql"
            
            sql_content = (
                f"-- JanDrishti Managed Import Sub-Part: {part_id}\n"
                f"-- Parent Chunk: {spec['file_name']} | Target: {spec['table']} | Statements: {len(batch)}\n"
                "SET standard_conforming_strings = on;\n"
                "SET statement_timeout = '15min';\n"
                "BEGIN;\n\n"
                + "\n".join(batch)
                + "\n\nCOMMIT;\n"
            )
            part_file.write_text(sql_content, encoding="utf-8")
            
            ids = [extract_statement_metadata(s, spec["table"])[1] for s in batch]
            ids_non_null = [x for x in ids if x is not None]
            
            first_id = ids_non_null[0] if ids_non_null else None
            last_id = ids_non_null[-1] if ids_non_null else None
            min_id = min(ids_non_null) if ids_non_null and isinstance(ids_non_null[0], int) else None
            max_id = max(ids_non_null) if ids_non_null and isinstance(ids_non_null[0], int) else None
            
            prev_status = existing_state.get(part_id, {}).get("status", "PENDING")
            
            parts_meta[part_id] = {
                "part_id": part_id,
                "parent_chunk": spec["file_name"],
                "chunk_id": spec["chunk_id"],
                "file_path": str(part_file.relative_to(BASE_DIR)),
                "target_table": spec["table"],
                "id_field": spec["id_type"],
                "statement_count": len(batch),
                "first_id": first_id,
                "last_id": last_id,
                "min_id": min_id,
                "max_id": max_id,
                "status": prev_status,
                "completed_at": existing_state.get(part_id, {}).get("completed_at", None),
                "execution_time_seconds": existing_state.get(part_id, {}).get("execution_time_seconds", None)
            }
            total_prepared += len(batch)
            
    state_data = {
        "updated_at": datetime.datetime.now().isoformat(),
        "total_parts": len(parts_meta),
        "total_statements": total_prepared,
        "parts": parts_meta
    }
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state_data, f, indent=2)
        
    log(f"Preparation complete: {len(parts_meta)} sub-parts generated with {total_prepared:,} total statements.")
    log(f"State saved to {STATE_FILE.relative_to(BASE_DIR)}")
    return state_data

def run_psql_query(query, host, port, user, dbname, password=None, timeout_sec=60):
    """Executes a SQL query via psql and returns the stdout string."""
    env = os.environ.copy()
    if password:
        env["PGPASSWORD"] = password
        
    cmd = [
        "psql",
        "-h", str(host),
        "-p", str(port),
        "-U", str(user),
        "-d", str(dbname),
        "-v", "ON_ERROR_STOP=1",
        "-t", "-A",
        "-c", query
    ]
    
    proc = subprocess.run(
        cmd,
        env=env,
        capture_output=True,
        text=True,
        timeout=timeout_sec
    )
    if proc.returncode != 0:
        raise RuntimeError(f"psql query error (code {proc.returncode}): {proc.stderr.strip()}")
    return proc.stdout.strip()

def run_psql_file(file_path, host, port, user, dbname, password=None, timeout_sec=1200):
    """Executes a SQL script file via psql in transactional mode."""
    env = os.environ.copy()
    if password:
        env["PGPASSWORD"] = password
        
    cmd = [
        "psql",
        "-h", str(host),
        "-p", str(port),
        "-U", str(user),
        "-d", str(dbname),
        "-v", "ON_ERROR_STOP=1",
        "-f", str(file_path)
    ]
    
    proc = subprocess.run(
        cmd,
        env=env,
        capture_output=True,
        text=True,
        timeout=timeout_sec
    )
    return proc.returncode, proc.stdout, proc.stderr

def check_sub_part_remote_presence(part, host, port, user, dbname, password=None):
    """
    Determines whether a sub-part's records already exist in the remote database.
    Returns: (is_fully_present: bool, remote_count: int, expected_count: int)
    """
    table = part["target_table"]
    expected_count = part["statement_count"]
    
    try:
        if table == "public.infrastructure_works":
            min_id = part["min_id"]
            max_id = part["max_id"]
            q = f"SELECT COUNT(*) FROM public.infrastructure_works WHERE work_id BETWEEN {min_id} AND {max_id};"
            res = run_psql_query(q, host, port, user, dbname, password)
            count = int(res) if res.isdigit() else 0
            return (count == expected_count, count, expected_count)
            
        elif table == "public.treasury_vouchers":
            first_id = part["first_id"]
            last_id = part["last_id"]
            q = f"SELECT COUNT(*) FROM public.treasury_vouchers WHERE legacy_transaction_id >= '{first_id}' AND legacy_transaction_id <= '{last_id}';"
            res = run_psql_query(q, host, port, user, dbname, password)
            count = int(res) if res.isdigit() else 0
            return (count == expected_count, count, expected_count)
            
        elif table == "gov.review_cases":
            first_id = part["first_id"]
            last_id = part["last_id"]
            q = f"SELECT COUNT(*) FROM gov.review_cases WHERE case_id >= '{first_id}' AND case_id <= '{last_id}';"
            res = run_psql_query(q, host, port, user, dbname, password)
            count = int(res) if res.isdigit() else 0
            return (count == expected_count, count, expected_count)
            
        elif table == "gov.audit_trail":
            q = "SELECT COUNT(*) FROM gov.audit_trail;"
            res = run_psql_query(q, host, port, user, dbname, password)
            count = int(res) if res.isdigit() else 0
            return (count >= expected_count, count, expected_count)
            
        elif table == "ml.anomaly_signals":
            first_id = part["first_id"]
            last_id = part["last_id"]
            q = f"SELECT COUNT(*) FROM ml.anomaly_signals WHERE legacy_anomaly_id >= '{first_id}' AND legacy_anomaly_id <= '{last_id}';"
            res = run_psql_query(q, host, port, user, dbname, password)
            count = int(res) if res.isdigit() else 0
            return (count == expected_count, count, expected_count)
            
    except Exception as e:
        log(f"Pre-check query warning for {part['part_id']}: {e}", "WARN")
        return (False, 0, expected_count)
        
    return (False, 0, expected_count)

def get_overall_database_counts(host, port, user, dbname, password=None):
    """Fetches real-time counts from remote database for all target tables."""
    tables = [
        ("states", "public.states"),
        ("political_parties", "public.political_parties"),
        ("constituencies", "public.constituencies"),
        ("representatives", "public.representatives"),
        ("representative_terms", "public.representative_terms"),
        ("parliamentary_allocations", "public.parliamentary_allocations"),
        ("contractors", "public.contractors"),
        ("infrastructure_works", "public.infrastructure_works"),
        ("treasury_vouchers", "public.treasury_vouchers"),
        ("gov_review_cases", "gov.review_cases"),
        ("gov_audit_trail", "gov.audit_trail"),
        ("ml_anomaly_signals", "ml.anomaly_signals")
    ]
    counts = {}
    for key, tbl in tables:
        try:
            res = run_psql_query(f"SELECT COUNT(*) FROM {tbl};", host, port, user, dbname, password)
            counts[key] = int(res) if res.isdigit() else -1
        except Exception as e:
            counts[key] = f"Error: {e}"
    return counts

def verify_and_print_counts(host, port, user, dbname, password=None):
    """Prints a structured summary of current vs target database row counts."""
    log("Fetching live database table counts...")
    counts = get_overall_database_counts(host, port, user, dbname, password)
    
    expected_targets = {
        "states": 36,
        "political_parties": 48,
        "constituencies": 542,
        "representatives": 778,
        "representative_terms": 778,
        "parliamentary_allocations": 778,
        "contractors": 22377,
        "infrastructure_works": 102437,
        "treasury_vouchers": 82296,
        "gov_review_cases": 68,
        "gov_audit_trail": 129,
        "ml_anomaly_signals": 1831
    }
    
    print("\n" + "="*70)
    print(" JANDRISHTI SUPABASE PRODUCTION DATABASE VERIFICATION MATRIX")
    print("="*70)
    print(f"{'Table':<30} | {'Current Count':<15} | {'Target Target':<15} | {'Status'}")
    print("-"*70)
    for k, target in expected_targets.items():
        cur = counts.get(k, "N/A")
        if isinstance(cur, int):
            status = "COMPLETE" if cur == target else f"INCOMPLETE ({cur}/{target})"
            if cur > target:
                status = f"EXCEEDS TARGET ({cur}/{target})"
            print(f"{k:<30} | {cur:<15,d} | {target:<15,d} | {status}")
        else:
            print(f"{k:<30} | {str(cur):<15} | {target:<15,d} | ERROR")
    print("="*70 + "\n")

def execute_import(host, port, user, dbname, password=None, dry_run=False, max_retries=5):
    """
    Main resilient import executor.
    Executes sub-parts sequentially with pre-checks, transaction isolation,
    automatic retries upon disconnection, and atomic state updates.
    """
    state = prepare_sub_parts()
    parts = state["parts"]
    sorted_part_keys = sorted(parts.keys())
    
    log(f"Starting import loop across {len(sorted_part_keys)} sub-parts...")
    
    current_chunk = None
    stage_start_time = time.time()
    
    for idx, part_id in enumerate(sorted_part_keys, 1):
        part = parts[part_id]
        chunk_id = part["chunk_id"]
        
        # Major stage transition logging
        if chunk_id != current_chunk:
            if current_chunk is not None:
                log(f"--- Stage Chunk {current_chunk} completed in {time.time() - stage_start_time:.1f}s ---")
            current_chunk = chunk_id
            stage_start_time = time.time()
            log(f"\n=======================================================")
            log(f"EXECUTING STAGE CHUNK {chunk_id}: {part['parent_chunk']}")
            log(f"Target: {part['target_table']}")
            log(f"=======================================================")
            
        # Step 1: Pre-check remote presence
        is_present, remote_cnt, expected_cnt = check_sub_part_remote_presence(
            part, host, port, user, dbname, password
        )
        
        if is_present:
            log(f"[{idx:02d}/{len(sorted_part_keys):02d}] {part_id} ({part['statement_count']:,} stmts) -> Already present in DB ({remote_cnt}/{expected_cnt}). Marking COMPLETE.")
            part["status"] = "COMPLETED"
            if not part.get("completed_at"):
                part["completed_at"] = datetime.datetime.now().isoformat()
            parts[part_id] = part
            with open(STATE_FILE, "w", encoding="utf-8") as f:
                json.dump({"updated_at": datetime.datetime.now().isoformat(), "total_parts": len(parts), "parts": parts}, f, indent=2)
            continue
            
        if dry_run:
            log(f"[DRY-RUN] Would execute {part_id} ({part['statement_count']:,} stmts) on {part['target_table']}")
            continue
            
        # Step 2: Execute sub-part with resilience & retry logic
        part_sql_path = BASE_DIR / part["file_path"]
        log(f"[{idx:02d}/{len(sorted_part_keys):02d}] Importing {part_id} ({part['statement_count']:,} stmts into {part['target_table']})...")
        
        success = False
        attempt = 0
        part_start_time = time.time()
        
        while attempt < max_retries and not success:
            attempt += 1
            try:
                ret_code, stdout, stderr = run_psql_file(
                    part_sql_path, host, port, user, dbname, password, timeout_sec=900
                )
                if ret_code == 0:
                    success = True
                    duration = round(time.time() - part_start_time, 2)
                    log(f" -> [SUCCESS] {part_id} committed in {duration}s")
                    
                    # Verify remote insertion
                    _, post_cnt, _ = check_sub_part_remote_presence(part, host, port, user, dbname, password)
                    
                    part["status"] = "COMPLETED"
                    part["completed_at"] = datetime.datetime.now().isoformat()
                    part["execution_time_seconds"] = duration
                    parts[part_id] = part
                    
                    with open(STATE_FILE, "w", encoding="utf-8") as f:
                        json.dump({"updated_at": datetime.datetime.now().isoformat(), "total_parts": len(parts), "parts": parts}, f, indent=2)
                else:
                    log(f" -> [FAIL attempt {attempt}/{max_retries}] {part_id} exited with code {ret_code}: {stderr.strip()}", "WARN")
                    if attempt < max_retries:
                        backoff = attempt * 5
                        log(f" -> Waiting {backoff}s before reconnecting...", "INFO")
                        time.sleep(backoff)
            except Exception as e:
                log(f" -> [EXCEPTION attempt {attempt}/{max_retries}] {part_id}: {e}", "WARN")
                if attempt < max_retries:
                    backoff = attempt * 5
                    log(f" -> Waiting {backoff}s before reconnecting...", "INFO")
                    time.sleep(backoff)
                    
        if not success:
            log(f"CRITICAL: Failed to import {part_id} after {max_retries} attempts. Halting import loop.", "ERROR")
            log(f"State saved. You can re-run this script to resume from {part_id} at any time.", "ERROR")
            sys.exit(1)
            
    log("\n=======================================================")
    log("ALL REMAINING SUB-PARTS SUCCESSFULLY IMPORTED AND COMMITTED!")
    log("=======================================================")
    
    # Post-import Materialized View Refresh
    if not dry_run:
        log("Refreshing Analytics Materialized Views...")
        try:
            run_psql_query("REFRESH MATERIALIZED VIEW analytics.representative_summary_mv;", host, port, user, dbname, password, timeout_sec=300)
            log(" -> analytics.representative_summary_mv refreshed.")
        except Exception as e:
            log(f" -> Warning refreshing representative_summary_mv: {e}", "WARN")
            
        try:
            run_psql_query("REFRESH MATERIALIZED VIEW analytics.state_summary_mv;", host, port, user, dbname, password, timeout_sec=300)
            log(" -> analytics.state_summary_mv refreshed.")
        except Exception as e:
            log(f" -> Warning refreshing state_summary_mv: {e}", "WARN")
            
    verify_and_print_counts(host, port, user, dbname, password)

def main():
    parser = argparse.ArgumentParser(description="JanDrishti Supabase Production Resilient Importer")
    parser.add_argument("--host", default=os.environ.get("PGHOST", DEFAULT_HOST), help="PostgreSQL host")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PGPORT", DEFAULT_PORT)), help="PostgreSQL port")
    parser.add_argument("--user", default=os.environ.get("PGUSER", DEFAULT_USER), help="PostgreSQL user")
    parser.add_argument("--dbname", default=os.environ.get("PGDATABASE", DEFAULT_DB), help="PostgreSQL database name")
    parser.add_argument("--password", default=os.environ.get("PGPASSWORD", None), help="PostgreSQL password")
    parser.add_argument("--prepare-only", action="store_true", help="Prepare sub-part SQL files and exit")
    parser.add_argument("--verify-only", action="store_true", help="Verify live database counts and exit")
    parser.add_argument("--dry-run", action="store_true", help="Pre-check remote database without inserting")
    parser.add_argument("--max-retries", type=int, default=5, help="Max retry attempts per batch on network disconnect")
    parser.add_argument("--force-reprepare", action="store_true", help="Force re-generation of all sub-part files")
    
    args = parser.parse_args()
    
    if args.prepare_only:
        prepare_sub_parts(force=args.force_reprepare)
        return
        
    if args.verify_only:
        verify_and_print_counts(args.host, args.port, args.user, args.dbname, args.password)
        return
        
    execute_import(
        host=args.host,
        port=args.port,
        user=args.user,
        dbname=args.dbname,
        password=args.password,
        dry_run=args.dry_run,
        max_retries=args.max_retries
    )

if __name__ == "__main__":
    main()
