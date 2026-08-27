import os
import sys
import hashlib
import json
import pandas as pd

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def compute_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

raw_dir = "data/raw/rajya_sabha"
files = sorted([os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if os.path.isfile(os.path.join(raw_dir, f))])

print(f"Computing SHA-256 for {len(files)} raw Rajya Sabha artifacts...")

rs_checksums = []
for fpath in files:
    fname = os.path.relpath(fpath, ".").replace("\\", "/")
    size_bytes = os.path.getsize(fpath)
    size_mb = round(size_bytes / (1024 * 1024), 2)
    sha = compute_sha256(fpath)
    rs_checksums.append({
        "file_path": fname,
        "description": f"Raw Official Rajya Sabha Artifact: {os.path.basename(fpath)}",
        "file_size_bytes": size_bytes,
        "file_size_mb": size_mb,
        "sha256": sha
    })
    print(f"  {os.path.basename(fpath)} ({size_bytes:,} bytes) -> {sha[:16]}...")

# Load existing checksums
existing_csv = "data/processed/dataset_checksums.csv"
if os.path.exists(existing_csv):
    df_existing = pd.read_csv(existing_csv)
    # Filter out existing rajya_sabha files to avoid duplication
    df_existing = df_existing[~df_existing["file_path"].str.contains("rajya_sabha", case=False, na=False)]
    df_new = pd.concat([df_existing, pd.DataFrame(rs_checksums)], ignore_index=True)
else:
    df_new = pd.DataFrame(rs_checksums)

df_new.to_csv("data/processed/dataset_checksums.csv", index=False)

# JSON format
with open("data/processed/dataset_checksums.json", "w", encoding="utf-8") as f:
    json.dump(df_new.to_dict(orient="records"), f, indent=2)

print(f"\nSuccessfully updated dataset_checksums.csv and dataset_checksums.json!")
print(f"Total tracked datasets across Lok Sabha and Rajya Sabha: {len(df_new)}")
