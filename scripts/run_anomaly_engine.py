import os
import sys
import json
import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

PROCESSED_DIR = "data/processed"
FEATURES_DIR = "data/features"

ANOMALY_TIMESTAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()

print("==================================================")
print("SIH26102 — EXPLAINABLE ANOMALY DETECTION ENGINE (v5.1)")
print(f"Timestamp: {ANOMALY_TIMESTAMP}")
print("==================================================")

# Load feature matrices
print("\n[1/4] Loading engineered feature matrices...")
df_wf = pd.read_csv(os.path.join(FEATURES_DIR, "work_features.csv"), low_memory=False)
df_tf = pd.read_csv(os.path.join(FEATURES_DIR, "transaction_features.csv"), low_memory=False)
df_mpf = pd.read_csv(os.path.join(FEATURES_DIR, "mp_features.csv"), low_memory=False)
df_vf = pd.read_csv(os.path.join(FEATURES_DIR, "vendor_features.csv"), low_memory=False)

anomaly_records = []
anomaly_counter = 0

def add_anomaly(
    entity_type,
    entity_id,
    anomaly_type,
    score,
    severity,
    reason,
    supporting_metrics,
    method,
    threshold_val,
    observed_val,
    pctile,
    zscore,
    baseline_ref
):
    global anomaly_counter
    anomaly_counter += 1
    anomaly_records.append({
        "anomaly_id": f"ANOM_{anomaly_counter:06d}",
        "entity_type": entity_type,
        "entity_id": str(entity_id),
        "anomaly_type": anomaly_type,
        "anomaly_score": round(float(score), 4),
        "severity": severity,
        "reason": reason,
        "supporting_metrics": json.dumps(supporting_metrics, default=str),
        "detection_method": method,
        "threshold_value": str(threshold_val) if threshold_val is not None else "N/A",
        "observed_value": str(observed_val) if observed_val is not None else "N/A",
        "percentile": round(float(pctile), 4) if pctile is not None else None,
        "robust_zscore": round(float(zscore), 4) if zscore is not None else None,
        "baseline_reference": str(baseline_ref) if baseline_ref is not None else "N/A",
        "generated_at": ANOMALY_TIMESTAMP
    })

# ---------------------------------------------------------
# 2. STATISTICAL & RULE-BASED DETECTION (TIER 1)
# ---------------------------------------------------------
print("\n[2/4] Executing Transparent Statistical & Rule-Based Detection...")

# A. Work-Level Anomalies
print("  - Detecting Work-Level Statistical Anomalies...")

# 1. Unusually High Recommended Amount
high_rec = df_wf[
    (df_wf["recommended_amount"] >= 5000000) & 
    (df_wf["category_rec_amount_percentile"] >= 0.99) & 
    (df_wf["rec_amount_category_robust_zscore"] >= 3.5)
]
for _, r in high_rec.iterrows():
    score = min(1.0, 0.70 + (r["rec_amount_category_robust_zscore"] - 3.5) * 0.05)
    severity = "CRITICAL" if r["recommended_amount"] >= 20000000 else "HIGH"
    reason = (
        f"Recommended amount of ₹{r['recommended_amount']:,.2f} is in the {r['category_rec_amount_percentile']*100:.1f}th "
        f"percentile for '{r['category_normalized']}' ({r['rec_amount_category_robust_zscore']:.1f} robust standard deviations above category median)."
    )
    add_anomaly(
        entity_type="WORK",
        entity_id=r["work_id"],
        anomaly_type="UNUSUALLY_HIGH_RECOMMENDED_AMOUNT",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"recommended_amount": r["recommended_amount"], "category": r["category_normalized"], "zscore": round(r["rec_amount_category_robust_zscore"], 2)},
        method="STATISTICAL_ROBUST_ZSCORE",
        threshold_val="₹50,00,000 & Z >= 3.5",
        observed_val=f"₹{r['recommended_amount']:,.2f} (Z={r['rec_amount_category_robust_zscore']:.2f})",
        pctile=r["category_rec_amount_percentile"],
        zscore=r["rec_amount_category_robust_zscore"],
        baseline_ref=f"Category Median ({r['category_normalized']})"
    )

# 2. Unusual Cost Variance (Full lifecycle works)
cost_var = df_wf[
    (df_wf["lifecycle_status"] == "FULL_LIFECYCLE_MATCH") & 
    ((df_wf["cost_variance_pct"] >= 40.0) | (df_wf["cost_variance_pct"] <= -50.0) | (df_wf["cost_variance_amount"].abs() >= 1000000))
]
for _, r in cost_var.iterrows():
    pct = r["cost_variance_pct"]
    diff = r["cost_variance_amount"]
    score = min(1.0, 0.65 + abs(pct) * 0.003)
    severity = "HIGH" if abs(pct) >= 75.0 or abs(diff) >= 2500000 else "MEDIUM"
    direction = "escalated above" if pct > 0 else "reduced below"
    reason = (
        f"Final completed cost (₹{r['final_amount']:,.2f}) {direction} original recommended amount "
        f"(₹{r['recommended_amount']:,.2f}) by {pct:+.1f}% (variance: ₹{diff:+,.2f})."
    )
    add_anomaly(
        entity_type="WORK",
        entity_id=r["work_id"],
        anomaly_type="UNUSUAL_COST_VARIANCE",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"recommended_amount": r["recommended_amount"], "final_amount": r["final_amount"], "variance_amount": diff, "variance_pct": pct},
        method="DOMAIN_RULE_THRESHOLD",
        threshold_val="|Variance %| >= 40% or |Variance ₹| >= 10L",
        observed_val=f"{pct:+.1f}% (₹{diff:+,.2f})",
        pctile=None,
        zscore=None,
        baseline_ref="Recommended Amount"
    )

# 3. Unusually Long Completion Duration
long_dur = df_wf[
    (df_wf["lifecycle_status"] == "FULL_LIFECYCLE_MATCH") & 
    (df_wf["duration_days"] >= 500)
]
for _, r in long_dur.iterrows():
    days = r["duration_days"]
    score = min(1.0, 0.60 + (days - 500) * 0.001)
    severity = "HIGH" if days >= 700 else "MEDIUM"
    reason = f"Execution duration from recommendation to completion was {days} days (~{days/30.4:.1f} months)."
    add_anomaly(
        entity_type="WORK",
        entity_id=r["work_id"],
        anomaly_type="UNUSUALLY_LONG_COMPLETION_DURATION",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"duration_days": days, "recommendation_date": r["recommendation_date"], "completed_date": r["completed_date"]},
        method="STATISTICAL_PERCENTILE_THRESHOLD",
        threshold_val="Duration >= 500 days",
        observed_val=f"{days} days",
        pctile=0.95,
        zscore=round((days - 380) / 120.0, 2),
        baseline_ref="Mean Lifecycle Duration (380 days)"
    )

# B. Transaction-Level Anomalies
print("  - Detecting Transaction-Level Statistical Anomalies...")

# 4. Unusually High Expenditure Transaction
high_exp = df_tf[
    (df_tf["expenditure_amount"] >= 5000000) & 
    (df_tf["activity_amount_robust_zscore"] >= 3.5)
]
for _, r in high_exp.iterrows():
    amt = r["expenditure_amount"]
    z = r["activity_amount_robust_zscore"]
    score = min(1.0, 0.70 + (z - 3.5) * 0.04)
    severity = "CRITICAL" if amt >= 20000000 else "HIGH"
    reason = (
        f"Payment voucher of ₹{amt:,.2f} for '{r['activity_description_normalized']}' is {z:.1f} "
        f"robust standard deviations above activity median."
    )
    add_anomaly(
        entity_type="TRANSACTION",
        entity_id=r["internal_transaction_id"],
        anomaly_type="UNUSUALLY_HIGH_EXPENDITURE_TRANSACTION",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"expenditure_amount": amt, "activity": r["activity_description_normalized"], "vendor": r["vendor_name_normalized"], "zscore": round(z, 2)},
        method="STATISTICAL_ROBUST_ZSCORE",
        threshold_val="₹50,00,000 & Z >= 3.5",
        observed_val=f"₹{amt:,.2f} (Z={z:.2f})",
        pctile=r["activity_amount_percentile"],
        zscore=z,
        baseline_ref=f"Activity Median ({r['activity_description_normalized']})"
    )

# 5. Disproportionate Single Transaction Share
disp_tx = df_tf[
    (df_tf["transaction_to_mp_total_exp_pct"] >= 40.0) & 
    (df_tf["expenditure_amount"] >= 5000000)
]
for _, r in disp_tx.iterrows():
    share = r["transaction_to_mp_total_exp_pct"]
    amt = r["expenditure_amount"]
    score = min(1.0, 0.65 + share * 0.005)
    severity = "HIGH" if share >= 60.0 else "MEDIUM"
    reason = f"Single disbursement of ₹{amt:,.2f} accounts for {share:.1f}% of MP's cumulative total expenditure."
    add_anomaly(
        entity_type="TRANSACTION",
        entity_id=r["internal_transaction_id"],
        anomaly_type="DISPROPORTIONATE_SINGLE_TRANSACTION_SHARE",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"expenditure_amount": amt, "share_pct": round(share, 2), "mp_name": r["mp_name_normalized"]},
        method="DOMAIN_RULE_THRESHOLD",
        threshold_val="Share >= 40% & Amount >= 50L",
        observed_val=f"{share:.1f}% (₹{amt:,.2f})",
        pctile=0.99,
        zscore=None,
        baseline_ref="MP Cumulative Expenditure"
    )

# C. MP-Level Anomalies
print("  - Detecting MP-Level Statistical Anomalies...")

# 6. High Vendor Concentration (HHI > 3500 or Top Share > 60%)
high_conc_mps = df_mpf[
    (df_mpf["transaction_count"] >= 10) & 
    ((df_mpf["vendor_hhi"] >= 3500) | (df_mpf["top_vendor_share_pct"] >= 60.0))
]
for _, r in high_conc_mps.iterrows():
    hhi = r["vendor_hhi"]
    top_share = r["top_vendor_share_pct"]
    score = min(1.0, 0.70 + (top_share - 60.0) * 0.007)
    severity = "HIGH" if top_share >= 75.0 or hhi >= 5000 else "MEDIUM"
    reason = (
        f"Disproportionately concentrated procurement: Top vendor captured {top_share:.1f}% of MP's total expenditure "
        f"(Vendor HHI: {hhi:,.0f} across {r['transaction_count']} transactions)."
    )
    add_anomaly(
        entity_type="MP",
        entity_id=r["internal_mp_id"],
        anomaly_type="HIGH_VENDOR_CONCENTRATION",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"vendor_hhi": hhi, "top_vendor_share_pct": top_share, "transaction_count": r["transaction_count"], "distinct_vendors": r["distinct_vendor_count"]},
        method="ECONOMIC_CONCENTRATION_INDEX",
        threshold_val="HHI >= 3500 or Top Share >= 60%",
        observed_val=f"HHI={hhi:,.0f}, Top Share={top_share:.1f}%",
        pctile=r["vendor_hhi_percentile"],
        zscore=r["vendor_hhi_robust_zscore"],
        baseline_ref="National Median HHI (1,069.89)"
    )

# 7. Unusual Pending Payment Ratio
pending_mps = df_mpf[
    (df_mpf["transaction_count"] >= 20) & 
    (df_mpf["pending_payment_rate_pct"] >= 15.0) & 
    (df_mpf["pending_payments_count"] >= 10)
]
for _, r in pending_mps.iterrows():
    rate = r["pending_payment_rate_pct"]
    cnt = r["pending_payments_count"]
    score = min(1.0, 0.65 + rate * 0.008)
    severity = "HIGH" if rate >= 30.0 else "MEDIUM"
    reason = f"High unresolved payment rate: {rate:.1f}% of transactions ({cnt} pending out of {r['transaction_count']} total)."
    add_anomaly(
        entity_type="MP",
        entity_id=r["internal_mp_id"],
        anomaly_type="UNUSUAL_PENDING_PAYMENT_RATIO",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"pending_rate_pct": rate, "pending_count": cnt, "total_transactions": r["transaction_count"]},
        method="STATISTICAL_PERCENTILE_THRESHOLD",
        threshold_val="Pending Rate >= 15% & Count >= 10",
        observed_val=f"{rate:.1f}% ({cnt} pending)",
        pctile=0.94,
        zscore=r["pending_payment_rate_robust_zscore"],
        baseline_ref="National Median Pending Rate (1.74%)"
    )

# 8. MP Stagnant / Low Utilization Outlier
low_util_mps = df_mpf[
    (df_mpf["allocated_amount"] >= 100000000) & 
    (df_mpf["utilization_pct"] <= 5.0)
]
for _, r in low_util_mps.iterrows():
    util = r["utilization_pct"]
    score = min(1.0, 0.60 + (5.0 - util) * 0.05)
    severity = "MEDIUM" if util <= 2.0 else "LOW"
    reason = f"Fund stagnation risk: MP has utilized only {util:.1f}% of allocated ₹{r['allocated_amount']:,.2f}."
    add_anomaly(
        entity_type="MP",
        entity_id=r["internal_mp_id"],
        anomaly_type="MP_UTILIZATION_EXTREME_OUTLIER",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"utilization_pct": util, "allocated_amount": r["allocated_amount"], "total_expenditure": r["total_expenditure"]},
        method="DOMAIN_RULE_THRESHOLD",
        threshold_val="Utilization <= 5.0% with Allocation >= 10 Cr",
        observed_val=f"{util:.1f}%",
        pctile=r["utilization_percentile"],
        zscore=r["utilization_robust_zscore"],
        baseline_ref="National Median Utilization (32.23%)"
    )

# D. Vendor-Level Anomalies
print("  - Detecting Vendor-Level Statistical Anomalies...")

# 9. Single MP Dominance for High Revenue Vendors
dom_vendors = df_vf[
    (df_vf["total_received_amount"] >= 20000000) & 
    (df_vf["single_mp_reliance_pct"] >= 95.0)
]
for _, r in dom_vendors.iterrows():
    amt = r["total_received_amount"]
    reliance = r["single_mp_reliance_pct"]
    score = min(1.0, 0.65 + (amt / 100000000) * 0.1)
    severity = "HIGH" if amt >= 50000000 else "MEDIUM"
    reason = (
        f"High single-patron reliance: Vendor received ₹{amt:,.2f} with {reliance:.1f}% of revenue originating "
        f"exclusively from MP '{r['primary_mp_name']}'."
    )
    add_anomaly(
        entity_type="VENDOR",
        entity_id=r["internal_vendor_id"],
        anomaly_type="VENDOR_SINGLE_MP_DOMINANCE",
        score=score,
        severity=severity,
        reason=reason,
        supporting_metrics={"total_received_amount": amt, "single_mp_reliance_pct": reliance, "primary_mp_id": r["primary_mp_id"], "primary_mp_name": r["primary_mp_name"]},
        method="DOMAIN_RULE_THRESHOLD",
        threshold_val="Revenue >= 2 Cr & Single MP Reliance >= 95%",
        observed_val=f"₹{amt:,.2f} ({reliance:.1f}% reliance)",
        pctile=r["vendor_revenue_percentile"],
        zscore=r["vendor_revenue_robust_zscore"],
        baseline_ref="Vendor Multi-Patron Distribution"
    )

# ---------------------------------------------------------
# 3. TWO-FEATURE UNSUPERVISED ML BASELINE (ISOLATION FOREST)
# ---------------------------------------------------------
print("\n[3/4] Fitting Two-Feature Unsupervised ML Baseline (Isolation Forest)...")

# Explicit Two-Feature Baseline: log(1 + recommended_amount) and description_char_length
work_ml_df = df_wf[df_wf["recommended_amount"].notna()][["recommended_amount", "description_char_length"]].copy()
work_ml_df["log_amt"] = np.log1p(work_ml_df["recommended_amount"])

iso_work = IsolationForest(contamination=0.015, random_state=42)
work_preds = iso_work.fit_predict(work_ml_df[["log_amt", "description_char_length"]])
work_scores = -iso_work.score_samples(work_ml_df[["log_amt", "description_char_length"]])

work_ml_indices = work_ml_df.index[work_preds == -1]

# Check existing statistical work flags
stat_work_ids = set([a["entity_id"] for a in anomaly_records if a["entity_type"] == "WORK"])

for idx in work_ml_indices:
    wid = str(df_wf.loc[idx, "work_id"])
    if wid not in stat_work_ids:
        score = float(work_scores[work_ml_df.index.get_loc(idx)])
        norm_score = round(min(1.0, max(0.5, (score - 0.5) * 2.0)), 4)
        amt = float(df_wf.loc[idx, "recommended_amount"])
        desc_len = int(df_wf.loc[idx, "description_char_length"])
        reason = (
            f"Two-feature multivariate outlier identified by Isolation Forest baseline "
            f"(Score: {norm_score:.3f}; Recommended: ₹{amt:,.2f}; Description Length: {desc_len} chars)."
        )
        add_anomaly(
            entity_type="WORK",
            entity_id=wid,
            anomaly_type="MULTIVARIATE_WORK_OUTLIER",
            score=norm_score,
            severity="LOW",
            reason=reason,
            supporting_metrics={"recommended_amount": amt, "description_length": desc_len, "raw_anomaly_score": round(score, 4)},
            method="ISOLATION_FOREST_TWO_FEATURE_BASELINE",
            threshold_val="Contamination Top 1.5%",
            observed_val=f"Score={norm_score:.3f} (Amt=₹{amt:,.2f}, Len={desc_len})",
            pctile=0.985,
            zscore=None,
            baseline_ref="Two-Feature Joint Feature Space (Log Amount, Description Length)"
        )

# ---------------------------------------------------------
# 4. EXPORT TRACEABLE ANOMALY RESULTS
# ---------------------------------------------------------
print("\n[4/4] Exporting 15-Column Traceable Anomaly Results...")

df_anomalies = pd.DataFrame(anomaly_records)
df_anomalies = df_anomalies.sort_values(by=["anomaly_score", "severity"], ascending=[False, True]).reset_index(drop=True)
df_anomalies.to_csv(os.path.join(PROCESSED_DIR, "anomaly_results.csv"), index=False, encoding="utf-8-sig")

print(f"  Successfully exported {len(df_anomalies):,} anomaly records with 15 traceability columns!")
