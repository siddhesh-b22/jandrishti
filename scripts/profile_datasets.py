import os
import sys
import json
import pandas as pd
import numpy as np

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"
os.makedirs(PROCESSED_DIR, exist_ok=True)

files = [
    "mplads_mp_summary_2026-08-26.csv",
    "mplads_recommended_works_2026-08-26.csv",
    "mplads_completed_works_2026-08-26.csv",
    "mplads_expenditures_2026-08-26.csv",
    "json_2026-08-26.json"
]

profile_rows = []
detailed_reports = {}

print("==================================================")
print("COMPREHENSIVE DATASET PROFILING & RELATIONSHIP ANALYSIS")
print("==================================================")

dfs = {}

for f in files:
    filepath = os.path.join(RAW_DIR, f)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    file_size_bytes = os.path.getsize(filepath)
    file_size_mb = file_size_bytes / (1024 * 1024)
    print(f"\n==========================================")
    print(f"Dataset: {f}")
    print(f"File Size: {file_size_bytes:,} bytes ({file_size_mb:.2f} MB)")
    print(f"==========================================")
    
    if f.endswith(".json"):
        with open(filepath, "r", encoding="utf-8") as jf:
            jdata = json.load(jf)
        detailed_reports[f] = {
            "type": "json",
            "size_bytes": file_size_bytes,
            "size_mb": file_size_mb,
            "content": jdata
        }
        for k, v in jdata.get("data", {}).items():
            profile_rows.append({
                "dataset_name": f,
                "file_type": "JSON",
                "file_size_bytes": file_size_bytes,
                "file_size_mb": round(file_size_mb, 4),
                "row_count": 1,
                "column_count": len(jdata.get("data", {})),
                "column_name": k,
                "data_type": type(v).__name__,
                "null_count": 0 if v is not None else 1,
                "null_percentage": 0.0 if v is not None else 100.0,
                "unique_count": 1,
                "sample_values": str(v),
                "min_val": str(v) if isinstance(v, (int, float)) else "N/A",
                "max_val": str(v) if isinstance(v, (int, float)) else "N/A",
                "sum_val": str(v) if isinstance(v, (int, float)) else "N/A"
            })
        print(f"JSON Top-Level Keys: {list(jdata.keys())}")
        print(f"JSON Data Fields: {json.dumps(jdata.get('data', {}), indent=2)}")
        continue
    
    # CSV loading
    df = pd.read_csv(filepath, low_memory=False)
    dfs[f] = df
    row_count, col_count = df.shape
    duplicate_rows = df.duplicated().sum()
    
    print(f"Row Count: {row_count:,}")
    print(f"Column Count: {col_count}")
    print(f"Exact Duplicate Rows: {duplicate_rows}")
    print("\nColumns and Inferred Types:")
    
    report = {
        "type": "csv",
        "size_bytes": file_size_bytes,
        "size_mb": file_size_mb,
        "row_count": row_count,
        "col_count": col_count,
        "duplicate_rows": int(duplicate_rows),
        "columns": {}
    }
    
    for col in df.columns:
        series = df[col]
        null_count = int(series.isna().sum())
        null_pct = round((null_count / row_count) * 100, 2)
        unique_count = int(series.nunique(dropna=True))
        
        # sample non-null values
        samples = series.dropna().unique()[:3].tolist()
        sample_str = "; ".join([str(s) for s in samples])
        
        # Check if numeric
        cleaned_str = series.astype(str).str.replace("₹", "").str.replace(",", "").str.strip()
        numeric_series = pd.to_numeric(cleaned_str, errors="coerce")
        valid_numeric_count = numeric_series.notna().sum()
        is_numeric = (valid_numeric_count > 0.5 * len(series.dropna())) if len(series.dropna()) > 0 else False
        
        min_val, max_val, sum_val = "N/A", "N/A", "N/A"
        if is_numeric and valid_numeric_count > 0:
            min_val = f"{numeric_series.min():.4f}"
            max_val = f"{numeric_series.max():.4f}"
            sum_val = f"{numeric_series.sum():.4f}"
        
        col_info = {
            "name": col,
            "dtype": str(series.dtype),
            "null_count": null_count,
            "null_percentage": null_pct,
            "unique_count": unique_count,
            "samples": sample_str,
            "min_val": min_val,
            "max_val": max_val,
            "sum_val": sum_val
        }
        report["columns"][col] = col_info
        
        profile_rows.append({
            "dataset_name": f,
            "file_type": "CSV",
            "file_size_bytes": file_size_bytes,
            "file_size_mb": round(file_size_mb, 4),
            "row_count": row_count,
            "column_count": col_count,
            "column_name": col,
            "data_type": str(series.dtype),
            "null_count": null_count,
            "null_percentage": null_pct,
            "unique_count": unique_count,
            "sample_values": sample_str,
            "min_val": min_val,
            "max_val": max_val,
            "sum_val": sum_val
        })
        
        print(f"  - {col}: dtype={series.dtype}, nulls={null_count} ({null_pct}%), unique={unique_count:,}, samples=[{sample_str[:80]}]")
    
    detailed_reports[f] = report

# Export data_profile.csv
profile_df = pd.DataFrame(profile_rows)
profile_df.to_csv(os.path.join(PROCESSED_DIR, "data_profile.csv"), index=False, encoding="utf-8-sig")
print(f"\nSaved data profile CSV to {os.path.join(PROCESSED_DIR, 'data_profile.csv')}")

print("\n==================================================")
print("CROSS-DATASET RELATIONSHIP & KEY ANALYSIS")
print("==================================================")

# Analysis of Work IDs across datasets
rw_df = dfs.get("mplads_recommended_works_2026-08-26.csv")
cw_df = dfs.get("mplads_completed_works_2026-08-26.csv")
exp_df = dfs.get("mplads_expenditures_2026-08-26.csv")
mp_df = dfs.get("mplads_mp_summary_2026-08-26.csv")

rel_analysis = {}

if rw_df is not None and cw_df is not None and exp_df is not None:
    print("\n--- Identifying Work ID columns ---")
    rw_work_col = [c for c in rw_df.columns if "work" in c.lower() and ("id" in c.lower() or "no" in c.lower() or "code" in c.lower())]
    cw_work_col = [c for c in cw_df.columns if "work" in c.lower() and ("id" in c.lower() or "no" in c.lower() or "code" in c.lower())]
    exp_work_col = [c for c in exp_df.columns if "work" in c.lower() and ("id" in c.lower() or "no" in c.lower() or "code" in c.lower())]
    
    print(f"Recommended Works work id candidate cols: {rw_work_col}")
    print(f"Completed Works work id candidate cols: {cw_work_col}")
    print(f"Expenditures work id candidate cols: {exp_work_col}")
    
    # Detailed Key overlap
    for rw_c in rw_work_col:
        for cw_c in cw_work_col:
            rw_keys = set(rw_df[rw_c].dropna().astype(str).str.strip())
            cw_keys = set(cw_df[cw_c].dropna().astype(str).str.strip())
            inter = rw_keys.intersection(cw_keys)
            print(f"Overlap between Recommended[{rw_c}] ({len(rw_keys):,}) and Completed[{cw_c}] ({len(cw_keys):,}): {len(inter):,} ({len(inter)/len(cw_keys)*100:.2f}% of completed)")
            rel_analysis[f"RW_{rw_c}_vs_CW_{cw_c}"] = {
                "rw_count": len(rw_keys),
                "cw_count": len(cw_keys),
                "intersection": len(inter),
                "cw_in_rw_pct": len(inter)/len(cw_keys)*100 if len(cw_keys)>0 else 0
            }
            
    for exp_c in exp_work_col:
        for rw_c in rw_work_col:
            exp_keys = set(exp_df[exp_c].dropna().astype(str).str.strip())
            rw_keys = set(rw_df[rw_c].dropna().astype(str).str.strip())
            inter = exp_keys.intersection(rw_keys)
            print(f"Overlap between Expenditures[{exp_c}] ({len(exp_keys):,}) and Recommended[{rw_c}] ({len(rw_keys):,}): {len(inter):,} ({len(inter)/len(exp_keys)*100:.2f}% of exp)")
            rel_analysis[f"EXP_{exp_c}_vs_RW_{rw_c}"] = {
                "exp_count": len(exp_keys),
                "rw_count": len(rw_keys),
                "intersection": len(inter),
                "exp_in_rw_pct": len(inter)/len(exp_keys)*100 if len(exp_keys)>0 else 0
            }

    for exp_c in exp_work_col:
        for cw_c in cw_work_col:
            exp_keys = set(exp_df[exp_c].dropna().astype(str).str.strip())
            cw_keys = set(cw_df[cw_c].dropna().astype(str).str.strip())
            inter = exp_keys.intersection(cw_keys)
            print(f"Overlap between Expenditures[{exp_c}] ({len(exp_keys):,}) and Completed[{cw_c}] ({len(cw_keys):,}): {len(inter):,} ({len(inter)/len(exp_keys)*100:.2f}% of exp)")
            rel_analysis[f"EXP_{exp_c}_vs_CW_{cw_c}"] = {
                "exp_count": len(exp_keys),
                "cw_count": len(cw_keys),
                "intersection": len(inter),
                "exp_in_cw_pct": len(inter)/len(exp_keys)*100 if len(exp_keys)>0 else 0
            }

if mp_df is not None:
    print("\n--- Identifying MP-level columns across datasets ---")
    mp_name_cols_mp = [c for c in mp_df.columns if "mp" in c.lower() or "name" in c.lower()]
    print(f"MP Summary MP cols: {mp_name_cols_mp}")
    print(f"MP Summary cols: {list(mp_df.columns)}")
    
    mp_names_set = set(mp_df[mp_name_cols_mp[0]].dropna().astype(str).str.strip().str.upper()) if mp_name_cols_mp else set()
    
    for name, df in [("Recommended Works", rw_df), ("Completed Works", cw_df), ("Expenditures", exp_df)]:
        if df is not None:
            df_mp_cols = [c for c in df.columns if "mp" in c.lower() or "name" in c.lower() or "member" in c.lower()]
            print(f"{name} MP candidate cols: {df_mp_cols}")
            for c in df_mp_cols:
                df_mps = set(df[c].dropna().astype(str).str.strip().str.upper())
                inter = mp_names_set.intersection(df_mps)
                print(f"  Overlap with MP Summary on {c}: {len(inter):,} / {len(df_mps):,} unique values ({len(inter)/len(df_mps)*100:.2f}%)")

# Check cardinality and duplicate keys in datasets
print("\n--- Cardinality & Key Uniqueness Analysis ---")
for name, df in [("MP Summary", mp_df), ("Recommended Works", rw_df), ("Completed Works", cw_df), ("Expenditures", exp_df)]:
    if df is not None:
        print(f"\n{name} (Rows: {len(df):,}):")
        for col in df.columns:
            uniques = df[col].nunique(dropna=False)
            nulls = df[col].isna().sum()
            is_unique = (uniques == len(df)) and (nulls == 0)
            if uniques > len(df) * 0.5 or is_unique:
                print(f"  Candidate Key Col: '{col}' -> Unique values: {uniques:,} (Nulls: {nulls:,}, Is Pure PK: {is_unique})")

with open(os.path.join(PROCESSED_DIR, "relationship_meta.json"), "w", encoding="utf-8") as rf:
    json.dump(rel_analysis, rf, indent=2)

print("\nRelational key analysis complete.")
