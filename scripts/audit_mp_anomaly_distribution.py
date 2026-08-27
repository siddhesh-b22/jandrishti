import os
import sys
import json
import numpy as np
import pandas as pd

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

PROCESSED_DIR = "data/processed"
FEATURES_DIR = "data/features"
DOCS_DIR = "docs"

print("==================================================")
print("SIH26102 — MP ANOMALY DISTRIBUTION & OVERLAP AUDIT")
print("==================================================")

df_mpf = pd.read_csv(os.path.join(FEATURES_DIR, "mp_features.csv"), low_memory=False)
df_anom = pd.read_csv(os.path.join(PROCESSED_DIR, "anomaly_results.csv"), low_memory=False)

mp_anoms = df_anom[df_anom["entity_type"] == "MP"].copy()

# 1. Distribution analysis of core metrics across all 543 MPs
metrics = [
    "vendor_hhi",
    "top_vendor_share_pct",
    "pending_payment_rate_pct",
    "utilization_pct",
    "completion_rate_pct",
    "transaction_count",
    "pending_payments_count"
]

print("\n--- Descriptive Distribution Across All 543 MPs ---")
dist_rows = []
for m in metrics:
    s = df_mpf[m].dropna()
    d = {
        "Metric": m,
        "Min": round(float(s.min()), 2),
        "P10": round(float(s.quantile(0.10)), 2),
        "P25 (Q1)": round(float(s.quantile(0.25)), 2),
        "Median (P50)": round(float(s.quantile(0.50)), 2),
        "Mean": round(float(s.mean()), 2),
        "P75 (Q3)": round(float(s.quantile(0.75)), 2),
        "P90": round(float(s.quantile(0.90)), 2),
        "P95": round(float(s.quantile(0.95)), 2),
        "P99": round(float(s.quantile(0.99)), 2),
        "Max": round(float(s.max()), 2)
    }
    dist_rows.append(d)
    print(f"  {m:30s}: Min={d['Min']:>8.2f}, Med={d['Median (P50)']:>8.2f}, P90={d['P90']:>8.2f}, P95={d['P95']:>8.2f}, Max={d['Max']:>8.2f}")

df_dist = pd.DataFrame(dist_rows)

# 2. Breakdown of MP flags by rule
rule_counts = mp_anoms["anomaly_type"].value_counts()
print("\n--- MP Anomaly Counts by Individual Rule ---")
for k, v in rule_counts.items():
    print(f"  {k:35s}: {v} flags ({v/543*100:.2f}% of MPs)")

# 3. Rule Overlap Analysis (How many MPs flagged by 1, 2, or 3 rules)
flags_per_mp = mp_anoms.groupby("entity_id")["anomaly_type"].apply(list)
mp_flag_counts = flags_per_mp.apply(len).value_counts().sort_index()

print("\n--- Number of Rules Triggered per Flagged MP ---")
for n_rules, count in mp_flag_counts.items():
    print(f"  Triggered {n_rules} rule(s): {count} MPs ({count/543*100:.2f}% of total 543 MPs)")

total_unique_flagged_mps = len(flags_per_mp)
print(f"\nTotal Distinct Flagged MPs: {total_unique_flagged_mps} / 543 ({total_unique_flagged_mps/543*100:.2f}%)")

# 4. Pairwise Rule Overlap Matrix
types = list(rule_counts.index)
overlap_matrix = pd.DataFrame(0, index=types, columns=types)

for t1 in types:
    mps_t1 = set(mp_anoms[mp_anoms["anomaly_type"] == t1]["entity_id"])
    for t2 in types:
        mps_t2 = set(mp_anoms[mp_anoms["anomaly_type"] == t2]["entity_id"])
        inter = len(mps_t1.intersection(mps_t2))
        overlap_matrix.loc[t1, t2] = inter

print("\n--- Pairwise Rule Overlap Matrix ---")
print(overlap_matrix.to_string())

# Save metrics to JSON for markdown doc generation
audit_meta = {
    "distributions": dist_rows,
    "rule_counts": rule_counts.to_dict(),
    "overlap_counts": mp_flag_counts.to_dict(),
    "pairwise_overlap": overlap_matrix.to_dict(),
    "total_unique_flagged_mps": total_unique_flagged_mps,
    "total_mps": 543,
    "flagged_percentage": round(total_unique_flagged_mps / 543 * 100, 2)
}

with open(os.path.join(PROCESSED_DIR, "mp_anomaly_audit_meta.json"), "w", encoding="utf-8") as jf:
    json.dump(audit_meta, jf, indent=2)

print("\nMP Distribution Audit Complete.")
