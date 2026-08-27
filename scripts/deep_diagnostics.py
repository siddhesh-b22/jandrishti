import os
import sys
import json
import pandas as pd
import numpy as np

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

RAW_DIR = "data/raw"

mp_df = pd.read_csv(os.path.join(RAW_DIR, "mplads_mp_summary_2026-08-26.csv"), low_memory=False)
rw_df = pd.read_csv(os.path.join(RAW_DIR, "mplads_recommended_works_2026-08-26.csv"), low_memory=False)
cw_df = pd.read_csv(os.path.join(RAW_DIR, "mplads_completed_works_2026-08-26.csv"), low_memory=False)
exp_df = pd.read_csv(os.path.join(RAW_DIR, "mplads_expenditures_2026-08-26.csv"), low_memory=False)

with open(os.path.join(RAW_DIR, "json_2026-08-26.json"), "r", encoding="utf-8") as jf:
    json_data = json.load(jf)["data"]

print("==================================================")
print("1. TOTALS RECONCILIATION VS PORTAL JSON SUMMARY")
print("==================================================")

print(f"JSON totalAllocated:         {json_data['totalAllocated']:,.2f}")
print(f"MP Summary Allocated Sum:    {mp_df['Allocated Amount (₹)'].sum():,.2f}")
print(f"Difference:                  {mp_df['Allocated Amount (₹)'].sum() - json_data['totalAllocated']:,.2f}")

print(f"\nJSON totalExpenditure:       {json_data['totalExpenditure']:,.2f}")
print(f"MP Summary Expenditure Sum:  {mp_df['Total Expenditure (₹)'].sum():,.2f}")
print(f"Expenditures CSV (Raw Sum):  {exp_df['Expenditure Amount (₹)'].sum():,.2f}")
exp_dedup = exp_df.drop_duplicates()
print(f"Expenditures CSV (Dedup Sum):{exp_dedup['Expenditure Amount (₹)'].sum():,.2f}")

print(f"\nJSON completedWorksValue:    {json_data['completedWorksValue']:,.2f}")
print(f"Completed Works CSV Sum:     {cw_df['Final Amount (₹)'].sum():,.2f}")
print(f"Difference:                  {cw_df['Final Amount (₹)'].sum() - json_data['completedWorksValue']:,.2f}")

print(f"\nRecommended Works CSV Sum:   {rw_df['Recommended Amount (₹)'].sum():,.2f}")

print(f"\nJSON inProgressPayments:     {json_data['inProgressPayments']:,.2f}")
in_prog_sum = exp_df[exp_df['Payment Status'] == 'Payment In-Progress']['Expenditure Amount (₹)'].sum()
print(f"Expenditures CSV In-Progress:{in_prog_sum:,.2f}")
success_sum = exp_df[exp_df['Payment Status'] == 'Payment Success']['Expenditure Amount (₹)'].sum()
print(f"Expenditures CSV Success:    {success_sum:,.2f}")

print(f"\nCounts Reconciliation:")
print(f"Total MPs: JSON={json_data['totalMPs']}, MP Summary={len(mp_df)}")
print(f"Total Recommended Works: JSON={json_data['totalWorksRecommended']}, MP Summary Sum={mp_df['Recommended Works'].sum()}, RW CSV={len(rw_df)}")
print(f"Total Completed Works: JSON={json_data['totalWorksCompleted']}, MP Summary Sum={mp_df['Completed Works'].sum()}, CW CSV={len(cw_df)}")
print(f"Total Transactions: JSON={json_data['totalTransactions']}, MP Summary Sum={mp_df['Transaction Count'].sum()}, Exp CSV={len(exp_df)}")

print("\n==================================================")
print("2. DATE RANGE ANALYSIS")
print("==================================================")
rw_dates = pd.to_datetime(rw_df['Recommendation Date'], errors='coerce')
cw_dates = pd.to_datetime(cw_df['Completed Date'], errors='coerce')
exp_dates = pd.to_datetime(exp_df['Expenditure Date'], errors='coerce')

print(f"Recommended Works Dates: Min={rw_dates.min()}, Max={rw_dates.max()}, Nulls={rw_dates.isna().sum()}")
print(f"Completed Works Dates:   Min={cw_dates.min()}, Max={cw_dates.max()}, Nulls={cw_dates.isna().sum()}")
print(f"Expenditures Dates:      Min={exp_dates.min()}, Max={exp_dates.max()}, Nulls={exp_dates.isna().sum()}")

print("\n==================================================")
print("3. EXPENDITURE DUPLICATE ANALYSIS")
print("==================================================")
print(f"Total rows in Expenditures: {len(exp_df):,}")
print(f"Exact duplicate rows: {exp_df.duplicated().sum():,}")
print(f"Unique rows: {len(exp_dedup):,}")
print(f"Sum of raw expenditures matches JSON totalExpenditure exactly: {abs(exp_df['Expenditure Amount (₹)'].sum() - json_data['totalExpenditure']) < 1.0}")
print(f"Sum of raw expenditures: {exp_df['Expenditure Amount (₹)'].sum():,.2f}")
print(f"JSON totalExpenditure:   {json_data['totalExpenditure']:,.2f}")

# Check sample duplicate groups in expenditures
dup_groups = exp_df[exp_df.duplicated(keep=False)].sort_values(by=['MP Name', 'Vendor', 'Expenditure Amount (₹)', 'Expenditure Date'])
print("\nSample duplicate transaction rows (first 6 rows):")
print(dup_groups[['MP Name', 'Vendor', 'Work Description', 'Expenditure Amount (₹)', 'Expenditure Date', 'Payment Status']].head(6).to_string())

print("\n==================================================")
print("4. WORK ID OVERLAP & RELATIONSHIP ANALYSIS")
print("==================================================")
rw_ids = set(rw_df['Work ID'])
cw_ids = set(cw_df['Work ID'])
common_ids = rw_ids.intersection(cw_ids)
print(f"Recommended Work IDs: {len(rw_ids):,}")
print(f"Completed Work IDs:   {len(cw_ids):,}")
print(f"Common Work IDs:      {len(common_ids):,}")

# Inspect common Work ID records
if len(common_ids) > 0:
    sample_common = list(common_ids)[:5]
    print(f"\nSample Common Work IDs: {sample_common}")
    for wid in sample_common:
        r_rec = rw_df[rw_df['Work ID'] == wid].iloc[0]
        c_rec = cw_df[cw_df['Work ID'] == wid].iloc[0]
        print(f"\nWork ID: {wid}")
        print(f"  Recommended: MP={r_rec['MP Name']}, Amt={r_rec['Recommended Amount (₹)']}, Date={r_rec['Recommendation Date']}, Desc={str(r_rec['Work Description'])[:50]}")
        print(f"  Completed:   MP={c_rec['MP Name']}, Amt={c_rec['Final Amount (₹)']}, Date={c_rec['Completed Date']}, Desc={str(c_rec['Work Description'])[:50]}")

# Text matching analysis between Recommended and Completed works
print("\n==================================================")
print("5. FUZZY / TEXT MATCHING POTENTIAL (RECOMMENDED vs COMPLETED)")
print("==================================================")
# Check overlap on MP Name + Normalized Work Description
rw_clean_desc = rw_df['Work Description'].dropna().astype(str).str.strip().str.lower()
cw_clean_desc = cw_df['Work Description'].dropna().astype(str).str.strip().str.lower()

rw_desc_set = set(rw_clean_desc)
cw_desc_set = set(cw_clean_desc)
desc_overlap = rw_desc_set.intersection(cw_desc_set)
print(f"Unique Recommended Descriptions: {len(rw_desc_set):,}")
print(f"Unique Completed Descriptions:   {len(cw_desc_set):,}")
print(f"Exact Description Intersections: {len(desc_overlap):,}")

# Check composite (MP Name + Work Description)
rw_df['mp_norm'] = rw_df['MP Name'].astype(str).str.strip().str.upper()
cw_df['mp_norm'] = cw_df['MP Name'].astype(str).str.strip().str.upper()
rw_df['desc_norm'] = rw_df['Work Description'].astype(str).str.strip().str.lower()
cw_df['desc_norm'] = cw_df['Work Description'].astype(str).str.strip().str.lower()

rw_comp = set(rw_df['mp_norm'] + " || " + rw_df['desc_norm'])
cw_comp = set(cw_df['mp_norm'] + " || " + cw_df['desc_norm'])
comp_overlap = rw_comp.intersection(cw_comp)
print(f"Composite (MP + Description) exact overlap: {len(comp_overlap):,}")

print("\n==================================================")
print("6. EXPENDITURE DESCRIPTION ANALYSIS")
print("==================================================")
print(f"Top 10 Work Descriptions in Expenditures (Generic work types):")
print(exp_df['Work Description'].value_counts().head(10))

print("\nDiagnostics complete.")
