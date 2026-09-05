#!/usr/bin/env python3
"""Apply the 2026-09-02 source-verification status without deleting registry records."""

import csv
import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "mplads.db"
SOURCE_CSV = BASE_DIR / "data" / "source_registry.csv"


def main() -> None:
    if not DB_PATH.exists() or not SOURCE_CSV.exists():
        raise SystemExit("Database or source registry CSV is missing.")

    with SOURCE_CSV.open(encoding="utf-8", newline="") as source_file:
        rows = list(csv.DictReader(source_file))

    conn = sqlite3.connect(DB_PATH)
    try:
        existing_ids = {
            row[0] for row in conn.execute("SELECT source_id FROM source_registry")
        }
        csv_ids = {row["source_id"] for row in rows}
        if existing_ids != csv_ids:
            raise SystemExit(
                "Refusing audit update: CSV and database source IDs differ. "
                "No records were changed."
            )

        for row in rows:
            conn.execute(
                """
                UPDATE source_registry
                SET source_name = ?, organization = ?, url = ?, data_type = ?,
                    update_frequency = ?, trust_tier = ?, status = ?,
                    license_or_access_note = ?
                WHERE source_id = ?
                """,
                (
                    row["source_name"], row["organization"], row["url"],
                    row["data_type"], row["update_frequency"], row["trust_tier"],
                    row["status"], row["license_or_access_note"], row["source_id"],
                ),
            )
        conn.commit()
    finally:
        conn.close()

    print(f"Updated verification status for {len(rows)} existing source records; no records deleted.")


if __name__ == "__main__":
    main()
