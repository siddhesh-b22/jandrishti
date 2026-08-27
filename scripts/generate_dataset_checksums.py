import os
import sys
import hashlib
import json
import pandas as pd

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def compute_sha256(filepath: str) -> str:
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

files_to_hash = [
    # Raw Datasets
    ("data/raw/mplads_mp_summary_2026-08-26.csv", "Raw MP Summary Export"),
    ("data/raw/mplads_recommended_works_2026-08-26.csv", "Raw Recommended Works Export"),
    ("data/raw/mplads_completed_works_2026-08-26.csv", "Raw Completed Works Export"),
    ("data/raw/mplads_expenditures_2026-08-26.csv", "Raw Financial Expenditures Export"),
    ("data/raw/json_2026-08-26.json", "Raw Portal Summary API JSON"),
    
    # Processed Normalized Master Tables
    ("data/processed/mp_master.csv", "Processed MP Master (543 rows)"),
    ("data/processed/allocation_master.csv", "Processed Allocation Master (543 rows)"),
    ("data/processed/work_master.csv", "Processed Work Master (102,437 rows)"),
    ("data/processed/expenditure_master.csv", "Processed Expenditure Master (82,296 rows)"),
    ("data/processed/vendor_master.csv", "Processed Vendor Master (22,377 rows)"),
    ("data/processed/mplads_master_dataset.csv", "Processed Master Dataset (102,437 rows)"),
    ("data/processed/anomaly_results.csv", "Traceable Anomaly Results (1,804 rows)"),
    
    # Feature Matrices
    ("data/features/work_features.csv", "Engineered Work Features (102,437 rows)"),
    ("data/features/transaction_features.csv", "Engineered Transaction Features (82,296 rows)"),
    ("data/features/mp_features.csv", "Engineered MP Features (543 rows)"),
    ("data/features/vendor_features.csv", "Engineered Vendor Features (22,377 rows)"),
    
    # SQLite Database
    ("database/mplads.db", "SQLite 3 Normalized Database"),
]

checksum_records = []
print("==================================================")
print("SIH26102 — DATASET CHECKSUM & INTEGRITY GENERATOR")
print("==================================================")

for rel_path, desc in files_to_hash:
    if os.path.exists(rel_path):
        size_bytes = os.path.getsize(rel_path)
        sha = compute_sha256(rel_path)
        checksum_records.append({
            "file_path": rel_path,
            "description": desc,
            "file_size_bytes": size_bytes,
            "file_size_mb": round(size_bytes / (1024 * 1024), 2),
            "sha256": sha
        })
        print(f"  {rel_path:45s} : {sha[:16]}... ({size_bytes:,} bytes)")
    else:
        print(f"  WARNING: File not found: {rel_path}")

df_checksums = pd.DataFrame(checksum_records)
df_checksums.to_csv("data/processed/dataset_checksums.csv", index=False)

with open("data/processed/dataset_checksums.json", "w", encoding="utf-8") as jf:
    json.dump(checksum_records, jf, indent=2)

print("\nSaved checksums to data/processed/dataset_checksums.csv and dataset_checksums.json")
