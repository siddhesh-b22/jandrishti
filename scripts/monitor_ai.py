"""Evaluate deterministic AI fixtures and monitor feature drift between snapshots."""

import argparse
import json
import os
import sqlite3
from datetime import datetime, timezone

import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEATURES_DIR = os.path.join(BASE_DIR, "data", "features")
DB_PATH = os.path.join(BASE_DIR, "database", "mplads.db")
MONITORED_COLUMNS = [
    "cost_overrun_pct",
    "duration_days",
    "financial_completion_ratio",
    "mp_payment_total",
    "vendor_single_mp_dependency",
]


def distribution(frame):
    return {
        column: {
            "count": int(frame[column].notna().sum()),
            "mean": float(frame[column].mean()),
            "std": float(frame[column].std() or 0),
            "p50": float(frame[column].quantile(0.50)),
            "p95": float(frame[column].quantile(0.95)),
        }
        for column in MONITORED_COLUMNS
        if column in frame
    }


def psi(expected, actual, bins=10):
    edges = np.unique(np.quantile(expected, np.linspace(0, 1, bins + 1)))
    if len(edges) < 3:
        return 0.0
    expected_counts, _ = np.histogram(expected, bins=edges)
    actual_counts, _ = np.histogram(actual, bins=edges)
    expected_pct = np.maximum(expected_counts / max(1, len(expected)), 1e-6)
    actual_pct = np.maximum(actual_counts / max(1, len(actual)), 1e-6)
    return float(np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct)))


def evaluate_fixtures():
    fixtures = [
        {"name": "normal", "cost_overrun_pct": 4, "duration_days": 180, "financial_completion_ratio": 0.95, "expected": False},
        {"name": "cost_overrun", "cost_overrun_pct": 65, "duration_days": 180, "financial_completion_ratio": 1.2, "expected": True},
        {"name": "delayed", "cost_overrun_pct": 5, "duration_days": 620, "financial_completion_ratio": 0.8, "expected": True},
        {"name": "payment_mismatch", "cost_overrun_pct": 8, "duration_days": 210, "financial_completion_ratio": 1.5, "expected": True},
    ]
    results = []
    for fixture in fixtures:
        detected = (
            fixture["cost_overrun_pct"] >= 40
            or fixture["duration_days"] >= 500
            or fixture["financial_completion_ratio"] > 1.25
        )
        results.append({**fixture, "detected": detected, "passed": detected == fixture["expected"]})
    return results


def main():
    parser = argparse.ArgumentParser(description="Evaluate AI fixtures and monitor feature drift")
    parser.add_argument("--baseline", help="Optional baseline feature CSV")
    args = parser.parse_args()
    current_path = os.path.join(FEATURES_DIR, "ai_work_features.csv")
    current = pd.read_csv(current_path, low_memory=False)
    baseline_path = args.baseline or os.path.join(FEATURES_DIR, "ai_feature_baseline.csv")
    baseline_exists = os.path.isfile(baseline_path)
    baseline = pd.read_csv(baseline_path, low_memory=False) if baseline_exists else current

    drift = {}
    for column in MONITORED_COLUMNS:
        if column in current and column in baseline:
            drift[column] = round(psi(baseline[column].dropna().to_numpy(), current[column].dropna().to_numpy()), 6)
    fixtures = evaluate_fixtures()
    report = {
        "report_version": "ai-monitor-v1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "feature_snapshot_version": str(current.get("feature_snapshot_version", pd.Series(["unknown"])).iloc[0]),
        "baseline_available": baseline_exists,
        "drift_status": "DRIFT_REVIEW" if any(value >= 0.20 for value in drift.values()) else "STABLE",
        "psi_by_feature": drift,
        "fixture_summary": {
            "passed": sum(item["passed"] for item in fixtures),
            "total": len(fixtures),
            "status": "PASS" if all(item["passed"] for item in fixtures) else "FAIL",
        },
        "fixtures": fixtures,
        "thresholds": {"psi_review": 0.20, "psi_significant": 0.25},
        "limitations": [
            "Fixtures validate deterministic signal wiring, not real-world fraud accuracy.",
            "No supervised performance metrics are reported until human-reviewed labels exist.",
        ],
    }
    with open(os.path.join(FEATURES_DIR, "ai_monitoring_report.json"), "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    if not baseline_exists:
        current.to_csv(baseline_path, index=False)

    if os.path.isfile(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            """CREATE TABLE IF NOT EXISTS ai_model_runs (
                model_run_id TEXT PRIMARY KEY,
                model_name TEXT NOT NULL,
                model_version TEXT NOT NULL,
                feature_snapshot_version TEXT NOT NULL,
                training_status TEXT NOT NULL,
                metrics_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL
            )"""
        )
        conn.execute(
            """INSERT OR REPLACE INTO ai_model_runs
            (model_run_id, model_name, model_version, feature_snapshot_version,
             training_status, metrics_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                "MONITOR_" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S"),
                "JanDrishti Risk Ensemble", "risk-engine-v2",
                report["feature_snapshot_version"], report["fixture_summary"]["status"],
                json.dumps({"psi": drift, "fixtures": report["fixture_summary"]}),
                report["created_at"],
            ),
        )
        conn.commit()
        conn.close()
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
