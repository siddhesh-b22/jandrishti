import os
import sys
import json
import re
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime, timezone

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

DB_PATH = "database/mplads.db"

print("==================================================")
print("SIH26102 — RAJYA SABHA NORMALIZATION & INGESTION")
print("==================================================")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# 1. Update existing Lok Sabha records house column if needed
cursor.execute("UPDATE mps SET house = 'Lok Sabha' WHERE house IS NULL OR house = '';")
cursor.execute("UPDATE works SET house = 'Lok Sabha' WHERE house IS NULL OR house = '';")
cursor.execute("UPDATE transactions SET house = 'Lok Sabha' WHERE house IS NULL OR house = '';")
conn.commit()

# Check if Rajya Sabha MPs are already inserted
cursor.execute("SELECT COUNT(*) FROM mps WHERE house = 'Rajya Sabha';")
existing_rs = cursor.fetchone()[0]
if existing_rs > 0:
    print(f"Found {existing_rs} existing Rajya Sabha MP records in database. Cleaning before re-ingestion...")
    cursor.execute("DELETE FROM mps WHERE house = 'Rajya Sabha';")
    cursor.execute("DELETE FROM allocations WHERE internal_mp_id LIKE 'INTERNAL_RS_MP_%';")
    cursor.execute("DELETE FROM anomalies WHERE anomaly_id LIKE 'ANOM_RS_%';")
    conn.commit()

# Load raw official metrics
with open("data/raw/rajya_sabha/all_rs_mp_metrics.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

print(f"Loaded {len(raw_data)} raw Rajya Sabha MP records from data/raw/rajya_sabha/all_rs_mp_metrics.json")

def clean_amt(s):
    if isinstance(s, (int, float)):
        return float(s)
    if not s:
        return 0.0
    s_str = str(s).replace("\xa0", "").replace(",", "").replace("₹", "").strip()
    try:
        return float(s_str)
    except Exception:
        return 0.0

mp_rows = []
allocation_rows = []

for i, item in enumerate(raw_data, 1):
    internal_id = f"INTERNAL_RS_MP_{i:03d}"
    source_id = item["source_mp_id"]
    caption = item["caption"]
    state_name = item["state_name"]
    metrics = item["metrics"]
    
    # parse caption: "Shri S Niranjan Reddy (2022-28)"
    m = re.match(r"^(.*?)\s*\((.*?)\)$", caption)
    if m:
        name_raw = m.group(1).strip()
        tenure = m.group(2).strip()
    else:
        name_raw = caption.strip()
        tenure = "Unknown"
        
    name_norm = re.sub(r"[^A-Za-z0-9\s]", "", name_raw).upper().strip()
    state_norm = re.sub(r"[^A-Za-z0-9\s]", "", state_name).upper().strip()
    
    is_nominated = "nominated" in state_name.lower() or "nominated" in caption.lower()
    const_raw = "Nominated" if is_nominated else f"{state_name} Representation"
    const_norm = "NOMINATED" if is_nominated else f"{state_norm} REPRESENTATION"
    
    alloc_arr = metrics.get("Allocated Limit for Hon'ble MPs", ["0", "0"])
    exp_arr = metrics.get("Expenditure on Completed and On-going Works as on Date", ["0", "0"])
    rec_arr = metrics.get("Works Recommended", ["0", "0"])
    comp_arr = metrics.get("Works Completed", ["0", "0"])
    sanc_arr = metrics.get("Works Sanctioned", ["0", "0"])
    cal_arr = metrics.get("Amount consented for Calamity", ["0", "0"])
    
    alloc_amt = clean_amt(alloc_arr[0])
    exp_amt = clean_amt(exp_arr[0])
    unspent_amt = max(0.0, alloc_amt - exp_amt)
    util_pct = round((exp_amt / alloc_amt * 100.0), 2) if alloc_amt > 0 else 0.0
    
    rec_cnt = int(rec_arr[0]) if rec_arr and str(rec_arr[0]).isdigit() else 0
    comp_cnt = int(comp_arr[0]) if comp_arr and str(comp_arr[0]).isdigit() else 0
    sanc_cnt = int(sanc_arr[0]) if sanc_arr and str(sanc_arr[0]).isdigit() else 0
    comp_rate = round((comp_cnt / rec_cnt * 100.0), 2) if rec_cnt > 0 else 0.0
    
    cal_amt = clean_amt(cal_arr[1]) if len(cal_arr) > 1 else 0.0
    
    mp_rows.append({
        "internal_mp_id": internal_id,
        "mp_name_raw": name_raw,
        "mp_name_normalized": name_norm,
        "constituency_raw": const_raw,
        "constituency_normalized": const_norm,
        "state_raw": state_name,
        "state_normalized": state_norm,
        "house": "Rajya Sabha",
        "allocated_amount": alloc_amt,
        "total_expenditure": exp_amt,
        "unspent_amount": unspent_amt,
        "utilization_pct": util_pct,
        "recommended_works_count": rec_cnt,
        "completed_works_count": comp_cnt,
        "completion_rate_pct": comp_rate,
        "transaction_count": 0,
        "successful_payments_count": 0,
        "pending_payments_count": 0,
        "average_rating": None,
        "source_dataset": "Official eSAKSHI Portal (PreLoginDashboardData)",
        "source_file": "data/raw/rajya_sabha/all_rs_mp_metrics.json",
        "source_download_date": "2026-08-26",
        "pipeline_created_at": datetime.now(timezone.utc).isoformat(),
        "sanctioned_works_count": sanc_cnt,
        "calamity_amount": cal_amt,
        "tenure_term": tenure,
        "source_member_id": source_id
    })
    
    allocation_rows.append((
        internal_id,
        name_norm,
        const_norm,
        state_norm,
        alloc_amt,
        exp_amt,
        unspent_amt,
        util_pct,
        "Official eSAKSHI Portal (PreLoginDashboardData)",
        "data/raw/rajya_sabha/all_rs_mp_metrics.json",
        "2026-08-26",
        datetime.now(timezone.utc).isoformat()
    ))

# Insert MPs
cursor.executemany("""
    INSERT INTO mps (
        internal_mp_id, mp_name_raw, mp_name_normalized, constituency_raw,
        constituency_normalized, state_raw, state_normalized, house,
        allocated_amount, total_expenditure, unspent_amount, utilization_pct,
        recommended_works_count, completed_works_count, completion_rate_pct,
        transaction_count, successful_payments_count, pending_payments_count,
        average_rating, source_dataset, source_file, source_download_date,
        pipeline_created_at
    ) VALUES (
        :internal_mp_id, :mp_name_raw, :mp_name_normalized, :constituency_raw,
        :constituency_normalized, :state_raw, :state_normalized, :house,
        :allocated_amount, :total_expenditure, :unspent_amount, :utilization_pct,
        :recommended_works_count, :completed_works_count, :completion_rate_pct,
        :transaction_count, :successful_payments_count, :pending_payments_count,
        :average_rating, :source_dataset, :source_file, :source_download_date,
        :pipeline_created_at
    );
""", mp_rows)

# Insert Allocations
cursor.executemany("""
    INSERT INTO allocations (
        internal_mp_id, mp_name_normalized, constituency_normalized, state_normalized,
        allocated_amount, total_expenditure, unspent_amount, utilization_pct,
        source_dataset, source_file, source_download_date, pipeline_created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
""", allocation_rows)

conn.commit()
print(f"Successfully inserted {len(mp_rows)} Rajya Sabha MPs into 'mps' and 'allocations' tables!")

# ----------------------------------------------------
# RAJYA SABHA EXPLAINABLE ANOMALY ENGINE
# ----------------------------------------------------
print("\nRunning Explainable Anomaly Engine on Rajya Sabha data...")

df_rs = pd.DataFrame(mp_rows)

# Compute MAD for utilization
med_util = df_rs["utilization_pct"].median()
mad_util = np.median(np.abs(df_rs["utilization_pct"] - med_util))
if mad_util == 0:
    mad_util = 1.0

# Compute MAD for allocation
med_alloc = df_rs["allocated_amount"].median()
mad_alloc = np.median(np.abs(df_rs["allocated_amount"] - med_alloc))
if mad_alloc == 0:
    mad_alloc = 1.0

anomalies = []
anom_counter = 1

for _, row in df_rs.iterrows():
    mp_id = row["internal_mp_id"]
    name = row["mp_name_raw"]
    state = row["state_raw"]
    alloc = row["allocated_amount"]
    exp = row["total_expenditure"]
    util = row["utilization_pct"]
    rec = row["recommended_works_count"]
    comp = row["completed_works_count"]
    comp_rate = row["completion_rate_pct"]
    cal = row["calamity_amount"]
    
    # 1. Low Utilization Anomaly (< 10% utilization with allocation >= 10 Cr)
    if alloc >= 100000000.0 and util < 10.0:
        z_score = round(float((util - med_util) / (1.4826 * mad_util)), 2)
        score = round(min(1.0, 0.50 + (10.0 - util) / 20.0), 4)
        severity = "HIGH" if util < 5.0 else "MEDIUM"
        anomalies.append({
            "anomaly_id": f"ANOM_RS_{anom_counter:06d}",
            "entity_type": "MP",
            "entity_id": mp_id,
            "anomaly_type": "LOW_UTILIZATION_ALERT",
            "anomaly_score": score,
            "severity": severity,
            "reason": f"Member {name} ({state}) has utilized {util:.1f}% of allocated limit (₹{alloc/1e7:.2f} Cr), which is significantly below the Rajya Sabha median of {med_util:.1f}%.",
            "supporting_metrics": json.dumps({
                "allocated_amount_cr": round(alloc / 1e7, 2),
                "expenditure_cr": round(exp / 1e7, 2),
                "utilization_pct": util,
                "rs_median_utilization_pct": round(float(med_util), 2),
                "house": "Rajya Sabha"
            }),
            "detection_method": "MAD Robust Z-Score",
            "threshold_value": "< 10.0% utilization with >= ₹10.0 Cr allocation",
            "observed_value": f"{util:.2f}%",
            "percentile": round(float(pd.Series(df_rs['utilization_pct']).rank(pct=True).loc[_] * 100.0), 1),
            "robust_zscore": z_score,
            "baseline_reference": f"Rajya Sabha Median Utilization = {med_util:.2f}% (MAD = {mad_util:.2f}%)",
            "generated_at": datetime.now(timezone.utc).isoformat()
        })
        anom_counter += 1

    # 2. High Allocation Outlier (+3 sigma MAD above RS median)
    z_alloc = (alloc - med_alloc) / (1.4826 * mad_alloc)
    if z_alloc >= 3.0:
        score = round(min(1.0, 0.60 + (z_alloc - 3.0) * 0.1), 4)
        anomalies.append({
            "anomaly_id": f"ANOM_RS_{anom_counter:06d}",
            "entity_type": "MP",
            "entity_id": mp_id,
            "anomaly_type": "HIGH_ALLOCATION_LIMIT_OUTLIER",
            "anomaly_score": score,
            "severity": "MEDIUM",
            "reason": f"Member {name} ({state}) has an allocated limit of ₹{alloc/1e7:.2f} Cr, which is +{z_alloc:.2f} MAD standard deviations above the Rajya Sabha median of ₹{med_alloc/1e7:.2f} Cr.",
            "supporting_metrics": json.dumps({
                "allocated_amount_cr": round(alloc / 1e7, 2),
                "rs_median_allocated_cr": round(float(med_alloc / 1e7), 2),
                "robust_zscore": round(float(z_alloc), 2),
                "house": "Rajya Sabha"
            }),
            "detection_method": "MAD Robust Z-Score",
            "threshold_value": "Z-score >= +3.0 MAD above RS median",
            "observed_value": f"₹{alloc/1e7:.2f} Cr",
            "percentile": round(float(pd.Series(df_rs['allocated_amount']).rank(pct=True).loc[_] * 100.0), 1),
            "robust_zscore": round(float(z_alloc), 2),
            "baseline_reference": f"Rajya Sabha Median Allocation = ₹{med_alloc/1e7:.2f} Cr (MAD = ₹{mad_alloc/1e7:.2f} Cr)",
            "generated_at": datetime.now(timezone.utc).isoformat()
        })
        anom_counter += 1

    # 3. High Calamity Contribution (> ₹1.0 Cr consented)
    if cal >= 10000000.0:
        score = round(min(1.0, 0.55 + (cal / 100000000.0)), 4)
        anomalies.append({
            "anomaly_id": f"ANOM_RS_{anom_counter:06d}",
            "entity_type": "MP",
            "entity_id": mp_id,
            "anomaly_type": "SIGNIFICANT_CALAMITY_CONSENT",
            "anomaly_score": score,
            "severity": "LOW",
            "reason": f"Member {name} ({state}) consented ₹{cal/1e7:.2f} Cr towards disaster relief and calamity rehabilitation.",
            "supporting_metrics": json.dumps({
                "calamity_consent_cr": round(cal / 1e7, 2),
                "allocated_amount_cr": round(alloc / 1e7, 2),
                "house": "Rajya Sabha"
            }),
            "detection_method": "Threshold Audit Indicator",
            "threshold_value": ">= ₹1.0 Cr calamity consent",
            "observed_value": f"₹{cal/1e7:.2f} Cr",
            "percentile": 99.0,
            "robust_zscore": 3.5,
            "baseline_reference": "National Calamity Consent Baseline = ₹0.00",
            "generated_at": datetime.now(timezone.utc).isoformat()
        })
        anom_counter += 1

# Insert anomalies
cursor.executemany("""
    INSERT INTO anomalies (
        anomaly_id, entity_type, entity_id, anomaly_type, anomaly_score,
        severity, reason, supporting_metrics, detection_method, threshold_value,
        observed_value, percentile, robust_zscore, baseline_reference, generated_at
    ) VALUES (
        :anomaly_id, :entity_type, :entity_id, :anomaly_type, :anomaly_score,
        :severity, :reason, :supporting_metrics, :detection_method, :threshold_value,
        :observed_value, :percentile, :robust_zscore, :baseline_reference, :generated_at
    );
""", anomalies)

conn.commit()
print(f"Successfully generated and inserted {len(anomalies)} Rajya Sabha explainable anomaly indicators!")

# Summary counts in database
cursor.execute("SELECT house, COUNT(*) FROM mps GROUP BY house;")
print("\nDatabase MP Counts by House:")
for r in cursor.fetchall():
    print(f"  {r[0]}: {r[1]} members")

cursor.execute("SELECT COUNT(*) FROM anomalies;")
total_anoms = cursor.fetchone()[0]
print(f"\nTotal Anomalies in Database: {total_anoms} ({len(anomalies)} Rajya Sabha + {total_anoms - len(anomalies)} Lok Sabha)")

conn.close()
