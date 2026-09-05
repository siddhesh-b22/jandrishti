"""
JanDrishti — Live Government Snapshot Poller & Change Detection Synchronizer
Queries verified official e-SAKSHI REST endpoints, performs historical comparisons,
and appends immutable snapshot audit records and detected change events.
"""

import os
import sqlite3
import json
import hashlib
import datetime
import argparse
from typing import Dict, Any, Tuple, Optional
from backend.data_sources.connector import government_connector

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "database", "mplads.db")

MOSPI_TILES_URL = "https://www.mplads.mospi.gov.in/rest/PreLoginDashboardData/getTilesData"
MOSPI_HEADERS = {
    "Origin": "https://www.mplads.mospi.gov.in",
    "Referer": "https://www.mplads.mospi.gov.in/digigov/dashboard.html",
}


def parse_clean_currency(val: str) -> float:
    """Parse Indian numbering currency string (e.g. ' 33,61,33,47,899.82') to float."""
    if not val:
        return 0.0
    clean = val.replace("\xa0", "").replace(",", "").strip()
    try:
        return float(clean)
    except ValueError:
        return 0.0


def parse_clean_int(val: str) -> int:
    """Parse integer string with commas to int."""
    if not val:
        return 0
    clean = val.replace(",", "").strip()
    try:
        return int(clean)
    except ValueError:
        return 0


class MacroSnapshotPoller:
    """Periodically fetches and records live official reporting snapshots."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    def fetch_live_macro_metrics(self) -> Dict[str, Any]:
        """Fetch live national macro metrics from MoSPI e-SAKSHI getTilesData."""
        data = None
        try:
            # Query for All Parliament (0,0,0,0)
            data = government_connector.fetch_json(
                url=MOSPI_TILES_URL,
                method="POST",
                headers=MOSPI_HEADERS,
                json_payload={"uname": "0,0,0,0"},
                use_cache=False  # Always fresh for poller
            )
        except Exception:
            pass
        
        if not data or not isinstance(data, dict):
            # Fallback to Rajya Sabha scope if All returned empty
            try:
                data = government_connector.fetch_json(
                    url=MOSPI_TILES_URL,
                    method="POST",
                    headers=MOSPI_HEADERS,
                    json_payload={"uname": "0,0,0,1"},
                    use_cache=False
                )
            except Exception as e:
                raise RuntimeError(f"Failed to retrieve live telemetry from e-SAKSHI getTilesData: {e}")

        if not data or not isinstance(data, dict):
            raise RuntimeError("e-SAKSHI returned empty or non-dict response")

        # Parse observed metrics
        alloc_raw = data.get("Allocated Limit for Hon'ble MPs", ["0.0", "0.0 Cr"])
        exp_raw = data.get("Expenditure on Completed and On-going Works as on Date", ["0.0", "0.0 Cr"])
        rec_raw = data.get("Works Recommended", ["0", "0.0", "0.0 Cr"])
        comp_raw = data.get("Works Completed", ["0", "0.0", "0.0 Cr"])
        sanc_raw = data.get("Works Sanctioned", ["0", "0.0", "0.0 Cr"])

        return {
            "allocated_limit": parse_clean_currency(alloc_raw[0] if isinstance(alloc_raw, list) else str(alloc_raw)),
            "expenditure": parse_clean_currency(exp_raw[0] if isinstance(exp_raw, list) else str(exp_raw)),
            "works_recommended": parse_clean_int(rec_raw[0] if isinstance(rec_raw, list) else str(rec_raw)),
            "works_completed": parse_clean_int(comp_raw[0] if isinstance(comp_raw, list) else str(comp_raw)),
            "works_sanctioned": parse_clean_int(sanc_raw[0] if isinstance(sanc_raw, list) else str(sanc_raw)),
            "raw_response": data,
            "fetched_at": datetime.datetime.now().isoformat()
        }

    def sync_snapshot(self) -> Tuple[bool, str, Dict[str, Any]]:
        """Sync live data, store snapshot, and generate change events if deltas exist."""
        metrics = self.fetch_live_macro_metrics()
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()

        observed_at = datetime.datetime.now()
        today_str = observed_at.date().isoformat()
        # A live observation is immutable: never reuse a day-level identifier.
        snap_id = f"SNAP_{observed_at.strftime('%Y_%m_%d_%H%M%S')}_LIVE"
        now_str = observed_at.isoformat()

        # Check latest existing snapshot
        last_snap = cur.execute("""
        SELECT snapshot_id, record_count, checksum_sha256, notes
        FROM historical_snapshots
        WHERE entity_type = 'MACRO'
        ORDER BY snapshot_date DESC LIMIT 1
        """).fetchone()

        payload_bytes = json.dumps(metrics["raw_response"], sort_keys=True).encode("utf-8")
        checksum = hashlib.sha256(payload_bytes).hexdigest()

        # Insert new snapshot
        cur.execute("""
        INSERT OR REPLACE INTO historical_snapshots (
            snapshot_id, source_id, snapshot_date, entity_type,
            record_count, checksum_sha256, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            snap_id,
            "SRC_MOSPI_TILES",
            today_str,
            "MACRO",
            metrics["works_completed"],
            checksum,
            f"Live MoSPI e-SAKSHI PreLogin Telemetry: {metrics['works_completed']:,} completed works, ₹{(metrics['expenditure'] / 1e7):.2f} Cr spent.",
            now_str
        ))

        # Check for change events compared to previous record
        changes_detected = []
        if last_snap:
            prev_completed = last_snap[1]
            diff_completed = metrics["works_completed"] - prev_completed
            if diff_completed != 0:
                event_id = f"CHG_{observed_at.strftime('%Y%m%d_%H%M%S')}_MACRO_COMP"
                finding = f"National physical completed works count changed by {diff_completed:+,} works from previous benchmark ({prev_completed:,} → {metrics['works_completed']:,})."
                severity = "INFO" if abs(diff_completed) < 500 else "MEDIUM"
                
                cur.execute("""
                INSERT OR REPLACE INTO change_events (
                    event_id, snapshot_id, entity_type, entity_id,
                    entity_name, change_type, field_name, old_value,
                    new_value, change_magnitude, severity, finding_summary, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event_id,
                    snap_id,
                    "MACRO",
                    "NATIONAL_PARLIAMENT",
                    "National MPLADS Portfolio",
                    "STATUS_ADVANCED",
                    "works_completed",
                    str(prev_completed),
                    str(metrics["works_completed"]),
                    float(diff_completed),
                    severity,
                    finding,
                    now_str
                ))
                changes_detected.append(finding)

        conn.commit()
        conn.close()

        summary = {
            "snapshot_id": snap_id,
            "checksum": checksum[:16],
            "works_completed": metrics["works_completed"],
            "expenditure_cr": round(metrics["expenditure"] / 1e7, 2),
            "changes_detected": changes_detected
        }

        return True, snap_id, summary


macro_poller = MacroSnapshotPoller()


def main():
    parser = argparse.ArgumentParser(description="JanDrishti Live Snapshot Poller CLI")
    parser.add_argument("--sync", action="store_true", help="Fetch live metrics and update snapshot ledger")
    args = parser.parse_args()

    print("Executing JanDrishti Live Snapshot Poller...")
    try:
        success, snap_id, summary = macro_poller.sync_snapshot()
        print(f"SUCCESS: Recorded snapshot {snap_id}")
        print(json.dumps(summary, indent=2))
    except Exception as e:
        print(f"FAILED: {e}")


if __name__ == "__main__":
    main()
