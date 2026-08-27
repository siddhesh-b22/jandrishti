import os
import sys
import datetime
import numpy as np
import pandas as pd

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

PROCESSED_DIR = "data/processed"
FEATURES_DIR = "data/features"
os.makedirs(FEATURES_DIR, exist_ok=True)

FEATURE_TIMESTAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()

print("==================================================")
print("SIH26102 — VECTORIZED FEATURE ENGINEERING PIPELINE")
print(f"Timestamp: {FEATURE_TIMESTAMP}")
print("==================================================")

# ---------------------------------------------------------
# 1. LOAD NORMALIZED MASTER TABLES
# ---------------------------------------------------------
print("\n[1/5] Loading normalized master datasets...")
df_mp = pd.read_csv(os.path.join(PROCESSED_DIR, "mp_master.csv"), low_memory=False)
df_work = pd.read_csv(os.path.join(PROCESSED_DIR, "work_master.csv"), low_memory=False)
df_exp = pd.read_csv(os.path.join(PROCESSED_DIR, "expenditure_master.csv"), low_memory=False)
df_vendor = pd.read_csv(os.path.join(PROCESSED_DIR, "vendor_master.csv"), low_memory=False)

def calc_robust_zscore(series):
    median = series.median()
    mad = (series - median).abs().median()
    if mad == 0 or pd.isna(mad):
        std = series.std()
        if std == 0 or pd.isna(std):
            return pd.Series(0.0, index=series.index)
        return (series - series.mean()) / std
    return 0.6745 * (series - median) / mad

# ---------------------------------------------------------
# 2. WORK-LEVEL FEATURE ENGINEERING
# ---------------------------------------------------------
print("\n[2/5] Engineering Work-Level Features...")

df_wf = df_work.copy()

df_wf["rec_datetime"] = pd.to_datetime(df_wf["recommendation_date"], errors="coerce")
df_wf["comp_datetime"] = pd.to_datetime(df_wf["completed_date"], errors="coerce")

df_wf["recommendation_year"] = df_wf["rec_datetime"].dt.year
df_wf["recommendation_month"] = df_wf["rec_datetime"].dt.month
df_wf["recommendation_quarter"] = df_wf["rec_datetime"].dt.quarter

df_wf["completion_year"] = df_wf["comp_datetime"].dt.year
df_wf["completion_month"] = df_wf["comp_datetime"].dt.month
df_wf["completion_quarter"] = df_wf["comp_datetime"].dt.quarter

df_wf["category_rec_amount_percentile"] = df_wf.groupby("category_normalized")["recommended_amount"].rank(pct=True)
df_wf["category_final_amount_percentile"] = df_wf.groupby("category_normalized")["final_amount"].rank(pct=True)

df_wf["rec_amount_category_robust_zscore"] = df_wf.groupby("category_normalized", group_keys=False)["recommended_amount"].apply(calc_robust_zscore)
df_wf["final_amount_category_robust_zscore"] = df_wf.groupby("category_normalized", group_keys=False)["final_amount"].apply(calc_robust_zscore)

df_wf["description_char_length"] = df_wf["work_description_normalized"].fillna("").astype(str).str.len()
df_wf["description_word_count"] = df_wf["work_description_normalized"].fillna("").astype(str).apply(lambda s: len(s.split()))

work_features = df_wf[[
    "work_id",
    "internal_mp_id",
    "mp_name_normalized",
    "constituency_normalized",
    "state_normalized",
    "category_normalized",
    "ida_normalized",
    "lifecycle_status",
    "recommended_amount",
    "recommendation_date",
    "recommendation_year",
    "recommendation_month",
    "recommendation_quarter",
    "category_rec_amount_percentile",
    "rec_amount_category_robust_zscore",
    "final_amount",
    "completed_date",
    "completion_year",
    "completion_month",
    "completion_quarter",
    "category_final_amount_percentile",
    "final_amount_category_robust_zscore",
    "duration_days",
    "cost_variance_amount",
    "cost_variance_pct",
    "has_images",
    "description_char_length",
    "description_word_count",
    "match_method",
    "match_confidence"
]].copy()

work_features["feature_generated_at"] = FEATURE_TIMESTAMP
work_features.to_csv(os.path.join(FEATURES_DIR, "work_features.csv"), index=False, encoding="utf-8-sig")
print(f"  Saved work_features.csv ({len(work_features):,} rows, {len(work_features.columns)} columns)")

# ---------------------------------------------------------
# 3. TRANSACTION-LEVEL FEATURE ENGINEERING
# ---------------------------------------------------------
print("\n[3/5] Engineering Transaction-Level Features...")

df_tf = df_exp.copy()
df_tf["exp_datetime"] = pd.to_datetime(df_tf["expenditure_date"], errors="coerce")

df_tf["expenditure_year"] = df_tf["exp_datetime"].dt.year
df_tf["expenditure_month"] = df_tf["exp_datetime"].dt.month
df_tf["expenditure_quarter"] = df_tf["exp_datetime"].dt.quarter

df_tf["activity_amount_percentile"] = df_tf.groupby("activity_description_normalized")["expenditure_amount"].rank(pct=True)
df_tf["activity_amount_robust_zscore"] = df_tf.groupby("activity_description_normalized", group_keys=False)["expenditure_amount"].apply(calc_robust_zscore)

df_tf["state_activity_key"] = df_tf["state_normalized"] + " || " + df_tf["activity_description_normalized"]
df_tf["state_activity_amount_robust_zscore"] = df_tf.groupby("state_activity_key", group_keys=False)["expenditure_amount"].apply(calc_robust_zscore)

mp_total_map = df_mp.set_index("internal_mp_id")["total_expenditure"].to_dict()
df_tf["mp_total_expenditure"] = df_tf["internal_mp_id"].map(mp_total_map)
df_tf["transaction_to_mp_total_exp_pct"] = np.where(
    df_tf["mp_total_expenditure"] > 0,
    (df_tf["expenditure_amount"] / df_tf["mp_total_expenditure"]) * 100.0,
    0.0
)

transaction_features = df_tf[[
    "internal_transaction_id",
    "internal_mp_id",
    "internal_vendor_id",
    "mp_name_normalized",
    "constituency_normalized",
    "state_normalized",
    "vendor_name_normalized",
    "activity_description_normalized",
    "ida_normalized",
    "expenditure_amount",
    "expenditure_date",
    "expenditure_year",
    "expenditure_month",
    "expenditure_quarter",
    "payment_status",
    "activity_amount_percentile",
    "activity_amount_robust_zscore",
    "state_activity_amount_robust_zscore",
    "transaction_to_mp_total_exp_pct"
]].copy()

transaction_features["feature_generated_at"] = FEATURE_TIMESTAMP
transaction_features.to_csv(os.path.join(FEATURES_DIR, "transaction_features.csv"), index=False, encoding="utf-8-sig")
print(f"  Saved transaction_features.csv ({len(transaction_features):,} rows, {len(transaction_features.columns)} columns)")

# ---------------------------------------------------------
# 4. MP-LEVEL FEATURE ENGINEERING (VECTORIZED HHI)
# ---------------------------------------------------------
print("\n[4/5] Engineering MP-Level Features...")

df_mpf = df_mp.copy()

df_mpf["pending_works_count"] = df_mpf["recommended_works_count"] - df_mpf["completed_works_count"]
df_mpf["successful_payment_rate_pct"] = np.where(
    df_mpf["transaction_count"] > 0,
    (df_mpf["successful_payments_count"] / df_mpf["transaction_count"]) * 100.0,
    100.0
)
df_mpf["pending_payment_rate_pct"] = np.where(
    df_mpf["transaction_count"] > 0,
    (df_mpf["pending_payments_count"] / df_mpf["transaction_count"]) * 100.0,
    0.0
)
df_mpf["average_transaction_amount"] = np.where(
    df_mpf["transaction_count"] > 0,
    df_mpf["total_expenditure"] / df_mpf["transaction_count"],
    0.0
)

# Vectorized HHI per MP
mp_vendor_sums = df_exp.groupby(["internal_mp_id", "internal_vendor_id"])["expenditure_amount"].sum().reset_index()
mp_total_sums = mp_vendor_sums.groupby("internal_mp_id")["expenditure_amount"].sum().reset_index().rename(columns={"expenditure_amount": "mp_sum"})
mp_vendor_sums = mp_vendor_sums.merge(mp_total_sums, on="internal_mp_id")
mp_vendor_sums["share_pct"] = (mp_vendor_sums["expenditure_amount"] / mp_vendor_sums["mp_sum"]) * 100.0
mp_vendor_sums["share_sq"] = mp_vendor_sums["share_pct"] ** 2

mp_hhi = mp_vendor_sums.groupby("internal_mp_id").agg(
    vendor_hhi=("share_sq", "sum"),
    top_vendor_share_pct=("share_pct", "max"),
    distinct_vendor_count=("internal_vendor_id", "count")
).reset_index()

df_mpf = df_mpf.merge(mp_hhi, on="internal_mp_id", how="left")
df_mpf["vendor_hhi"] = df_mpf["vendor_hhi"].fillna(0.0).round(2)
df_mpf["top_vendor_share_pct"] = df_mpf["top_vendor_share_pct"].fillna(0.0).round(2)
df_mpf["distinct_vendor_count"] = df_mpf["distinct_vendor_count"].fillna(0).astype(int)

df_mpf["utilization_percentile"] = df_mpf["utilization_pct"].rank(pct=True)
df_mpf["completion_rate_percentile"] = df_mpf["completion_rate_pct"].rank(pct=True)
df_mpf["vendor_hhi_percentile"] = df_mpf["vendor_hhi"].rank(pct=True)

df_mpf["utilization_robust_zscore"] = calc_robust_zscore(df_mpf["utilization_pct"])
df_mpf["completion_rate_robust_zscore"] = calc_robust_zscore(df_mpf["completion_rate_pct"])
df_mpf["vendor_hhi_robust_zscore"] = calc_robust_zscore(df_mpf["vendor_hhi"])
df_mpf["pending_payment_rate_robust_zscore"] = calc_robust_zscore(df_mpf["pending_payment_rate_pct"])

mp_features = df_mpf[[
    "internal_mp_id",
    "mp_name_normalized",
    "constituency_normalized",
    "state_normalized",
    "house",
    "allocated_amount",
    "total_expenditure",
    "unspent_amount",
    "utilization_pct",
    "utilization_percentile",
    "utilization_robust_zscore",
    "recommended_works_count",
    "completed_works_count",
    "pending_works_count",
    "completion_rate_pct",
    "completion_rate_percentile",
    "completion_rate_robust_zscore",
    "transaction_count",
    "successful_payments_count",
    "pending_payments_count",
    "successful_payment_rate_pct",
    "pending_payment_rate_pct",
    "pending_payment_rate_robust_zscore",
    "average_transaction_amount",
    "distinct_vendor_count",
    "vendor_hhi",
    "vendor_hhi_percentile",
    "vendor_hhi_robust_zscore",
    "top_vendor_share_pct"
]].copy()

mp_features["feature_generated_at"] = FEATURE_TIMESTAMP
mp_features.to_csv(os.path.join(FEATURES_DIR, "mp_features.csv"), index=False, encoding="utf-8-sig")
print(f"  Saved mp_features.csv ({len(mp_features)} rows, {len(mp_features.columns)} columns)")

# ---------------------------------------------------------
# 5. VENDOR-LEVEL FEATURE ENGINEERING (VECTORIZED RELIANCE)
# ---------------------------------------------------------
print("\n[5/5] Engineering Vendor-Level Features...")

df_vf = df_vendor.copy()

df_vf["average_ticket_size"] = np.where(
    df_vf["total_transaction_count"] > 0,
    df_vf["total_received_amount"] / df_vf["total_transaction_count"],
    0.0
)

# Vectorized vendor single MP reliance
vend_mp_sums = df_exp.groupby(["internal_vendor_id", "internal_mp_id", "mp_name_normalized"])["expenditure_amount"].sum().reset_index()
vend_totals = vend_mp_sums.groupby("internal_vendor_id")["expenditure_amount"].sum().reset_index().rename(columns={"expenditure_amount": "vend_total"})
vend_mp_sums = vend_mp_sums.merge(vend_totals, on="internal_vendor_id")
vend_mp_sums["mp_share_pct"] = (vend_mp_sums["expenditure_amount"] / vend_mp_sums["vend_total"]) * 100.0

# Top MP per vendor
top_mp_per_vendor = vend_mp_sums.sort_values(by=["internal_vendor_id", "expenditure_amount"], ascending=[True, False]).drop_duplicates(subset=["internal_vendor_id"])
top_mp_lookup = top_mp_per_vendor.rename(columns={
    "internal_mp_id": "primary_mp_id",
    "mp_name_normalized": "primary_mp_name",
    "mp_share_pct": "single_mp_reliance_pct"
})[["internal_vendor_id", "primary_mp_id", "primary_mp_name", "single_mp_reliance_pct"]]

df_vf = df_vf.merge(top_mp_lookup, on="internal_vendor_id", how="left")
df_vf["single_mp_reliance_pct"] = df_vf["single_mp_reliance_pct"].fillna(100.0).round(2)

df_vf["vendor_revenue_percentile"] = df_vf["total_received_amount"].rank(pct=True)
df_vf["vendor_revenue_robust_zscore"] = calc_robust_zscore(df_vf["total_received_amount"])

vendor_features = df_vf[[
    "internal_vendor_id",
    "vendor_name_normalized",
    "total_received_amount",
    "vendor_revenue_percentile",
    "vendor_revenue_robust_zscore",
    "total_transaction_count",
    "average_ticket_size",
    "unique_mps_served",
    "unique_states_served",
    "primary_state",
    "primary_activity",
    "primary_mp_id",
    "primary_mp_name",
    "single_mp_reliance_pct"
]].copy()

vendor_features["feature_generated_at"] = FEATURE_TIMESTAMP
vendor_features.to_csv(os.path.join(FEATURES_DIR, "vendor_features.csv"), index=False, encoding="utf-8-sig")
print(f"  Saved vendor_features.csv ({len(vendor_features):,} rows, {len(vendor_features.columns)} columns)")

print("\nVectorized Feature Engineering Pipeline successfully completed!")
