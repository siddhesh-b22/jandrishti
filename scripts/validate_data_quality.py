"""Validate normalized MPLADS datasets before database publication."""

import os
import sys
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")


def load_csv(name):
    path = os.path.join(PROCESSED_DIR, name)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Required normalized dataset is missing: {path}")
    return pd.read_csv(path, low_memory=False)


def require_unique(df, column, dataset):
    if column not in df.columns:
        raise ValueError(f"{dataset} is missing required column '{column}'")
    missing = int(df[column].isna().sum())
    duplicates = int(df[column].duplicated(keep=False).sum())
    if missing or duplicates:
        raise ValueError(
            f"{dataset}.{column} failed identity checks: "
            f"{missing} missing, {duplicates} duplicate rows"
        )


def require_non_negative(df, columns, dataset):
    for column in columns:
        if column not in df.columns:
            continue
        invalid = int((pd.to_numeric(df[column], errors="coerce") < 0).sum())
        if invalid:
            raise ValueError(f"{dataset}.{column} contains {invalid} negative values")


def main():
    mp = load_csv("mp_master.csv")
    allocations = load_csv("allocation_master.csv")
    works = load_csv("work_master.csv")
    expenditure = load_csv("expenditure_master.csv")
    vendors = load_csv("vendor_master.csv")

    require_unique(mp, "internal_mp_id", "mp_master")
    require_unique(allocations, "internal_mp_id", "allocation_master")
    require_unique(works, "work_id", "work_master")
    require_unique(expenditure, "internal_transaction_id", "expenditure_master")
    require_unique(vendors, "internal_vendor_id", "vendor_master")

    require_non_negative(
        works,
        ["recommended_amount", "sanctioned_amount", "final_amount"],
        "work_master",
    )
    require_non_negative(
        expenditure,
        ["expenditure_amount"],
        "expenditure_master",
    )

    if "duration_days" in works.columns:
        invalid_duration = int((pd.to_numeric(works["duration_days"], errors="coerce") < 0).sum())
        if invalid_duration:
            raise ValueError(f"work_master.duration_days contains {invalid_duration} negative values")

    mp_ids = set(mp["internal_mp_id"].astype(str))
    orphan_works = set(works["internal_mp_id"].dropna().astype(str)) - mp_ids
    orphan_tx = set(expenditure["internal_mp_id"].dropna().astype(str)) - mp_ids
    if orphan_works or orphan_tx:
        raise ValueError(
            f"Referential integrity failed: {len(orphan_works)} orphan works, "
            f"{len(orphan_tx)} orphan transactions"
        )

    print(
        "Data quality validation passed: "
        f"{len(mp):,} MPs, {len(works):,} works, "
        f"{len(expenditure):,} transactions, {len(vendors):,} vendors."
    )


if __name__ == "__main__":
    try:
        main()
    except (FileNotFoundError, ValueError) as exc:
        print(f"DATA QUALITY FAILED: {exc}", file=sys.stderr)
        raise SystemExit(1)
