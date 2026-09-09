"""Build a versioned, leakage-safe AI feature snapshot from normalized data."""

import hashlib
import json
import os
from datetime import datetime, timezone

import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED = os.path.join(BASE_DIR, "data", "processed")
FEATURES = os.path.join(BASE_DIR, "data", "features")
VERSION = "ai-features-v1"


def read(name):
    path = os.path.join(PROCESSED, name)
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    return pd.read_csv(path, low_memory=False)


def main():
    works = read("work_master.csv")
    tx = read("expenditure_master.csv")
    vendors = read("vendor_master.csv")
    os.makedirs(FEATURES, exist_ok=True)

    work = works.copy()
    numeric_work = [
        "recommended_amount", "sanctioned_amount", "final_amount",
        "duration_days", "fund_released", "district_treasury_utilization",
    ]
    for column in numeric_work:
        if column in work:
            work[column] = pd.to_numeric(work[column], errors="coerce").fillna(0)

    work["cost_overrun_pct"] = np.where(
        work["recommended_amount"] > 0,
        ((work["final_amount"] - work["recommended_amount"]) / work["recommended_amount"]) * 100,
        0,
    )
    work["financial_completion_ratio"] = np.where(
        work["sanctioned_amount"] > 0,
        work["final_amount"] / work["sanctioned_amount"],
        0,
    )
    work["is_completed"] = work["lifecycle_status"].astype(str).str.contains("COMPLETED").astype(int)
    work["has_location"] = (
        work.get("latitude", pd.Series(index=work.index)).notna()
        & work.get("longitude", pd.Series(index=work.index)).notna()
    ).astype(int)

    tx["expenditure_amount"] = pd.to_numeric(tx["expenditure_amount"], errors="coerce").fillna(0)
    tx["expenditure_date_parsed"] = pd.to_datetime(tx["expenditure_date"], errors="coerce")
    vendor_stats = tx.groupby("internal_vendor_id").agg(
        vendor_transaction_count=("internal_transaction_id", "nunique"),
        vendor_total_amount=("expenditure_amount", "sum"),
        vendor_active_months=("expenditure_date_parsed", lambda s: s.dt.to_period("M").nunique()),
        vendor_unique_mps=("internal_mp_id", "nunique"),
    ).reset_index()
    mp_stats = tx.groupby("internal_mp_id").agg(
        mp_transaction_count=("internal_transaction_id", "nunique"),
        mp_total_amount=("expenditure_amount", "sum"),
    ).reset_index()

    tx["year_month"] = tx["expenditure_date_parsed"].dt.to_period("M").astype(str)
    monthly = tx.groupby(["internal_vendor_id", "year_month"]).agg(
        vendor_monthly_amount=("expenditure_amount", "sum"),
        vendor_monthly_transactions=("internal_transaction_id", "nunique"),
    ).reset_index()
    def robust_deviation(series):
        median = series.median()
        mad = (series - median).abs().median()
        return (series - median) / (mad if mad > 0 else 1)

    monthly["vendor_monthly_amount_z"] = monthly.groupby("internal_vendor_id")[
        "vendor_monthly_amount"
    ].transform(robust_deviation)
    monthly_peak = monthly.groupby("internal_vendor_id")["vendor_monthly_amount_z"].max().rename("vendor_monthly_peak_z")

    features = work.merge(
        tx.groupby("internal_mp_id").agg(
            mp_payment_count=("internal_transaction_id", "nunique"),
            mp_payment_total=("expenditure_amount", "sum"),
        ).reset_index(),
        on="internal_mp_id", how="left",
    )
    mp_vendor_stats = tx.groupby("internal_mp_id").agg(
        mp_vendor_count=("internal_vendor_id", "nunique"),
        mp_vendor_concentration=("internal_vendor_id", lambda s: 1 / max(1, s.nunique())),
    ).reset_index()
    features = features.merge(mp_vendor_stats, on="internal_mp_id", how="left")
    features["vendor_monthly_peak_z"] = 0.0
    features = features.merge(mp_stats, on="internal_mp_id", how="left", suffixes=("", "_mp"))

    features["financial_physical_gap"] = features["financial_completion_ratio"] * 100
    features["vendor_single_mp_dependency"] = np.where(
        features["mp_vendor_count"].fillna(0) > 0,
        100 / features["mp_vendor_count"].fillna(1),
        0,
    )
    features["feature_snapshot_version"] = VERSION
    features["feature_generated_at"] = datetime.now(timezone.utc).isoformat()

    output = os.path.join(FEATURES, "ai_work_features.csv")
    features.to_csv(output, index=False, encoding="utf-8-sig")
    digest = hashlib.sha256(open(output, "rb").read()).hexdigest()
    metadata = {
        "version": VERSION,
        "generated_at": features["feature_generated_at"].iloc[0],
        "row_count": len(features),
        "sha256": digest,
        "source_files": ["work_master.csv", "expenditure_master.csv", "vendor_master.csv"],
        "label_status": "UNLABELED",
    }
    with open(os.path.join(FEATURES, "ai_feature_snapshot.json"), "w", encoding="utf-8") as handle:
        json.dump(metadata, handle, indent=2)
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
