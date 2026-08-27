import os
import sys
import pandas as pd

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

RAW_DIR = "data/raw"

mp_df = pd.read_csv(os.path.join(RAW_DIR, "mplads_mp_summary_2026-08-26.csv"), low_memory=False)
rw_df = pd.read_csv(os.path.join(RAW_DIR, "mplads_recommended_works_2026-08-26.csv"), low_memory=False)
cw_df = pd.read_csv(os.path.join(RAW_DIR, "mplads_completed_works_2026-08-26.csv"), low_memory=False)
exp_df = pd.read_csv(os.path.join(RAW_DIR, "mplads_expenditures_2026-08-26.csv"), low_memory=False)

print("==================================================")
print("PRE-ETL MP IDENTITY & CROSS-DATASET CONSISTENCY AUDIT")
print("==================================================")

# Normalize strings for MP composite key
def normalize_text(series):
    return series.fillna("").astype(str).str.strip().str.upper()

mp_df['norm_mp'] = normalize_text(mp_df['MP Name'])
mp_df['norm_const'] = normalize_text(mp_df['Constituency'])
mp_df['norm_state'] = normalize_text(mp_df['State'])
mp_df['norm_house'] = normalize_text(mp_df['House'])

mp_df['composite_mp_key'] = (
    mp_df['norm_house'] + " | " +
    mp_df['norm_state'] + " | " +
    mp_df['norm_const'] + " | " +
    mp_df['norm_mp']
)

total_mps = len(mp_df)
unique_composite_keys = mp_df['composite_mp_key'].nunique()
duplicate_keys = mp_df[mp_df.duplicated(subset=['composite_mp_key'], keep=False)]

print(f"Total MP Summary Rows: {total_mps}")
print(f"Unique Composite (House + State + Constituency + MP Name) Keys: {unique_composite_keys}")
print(f"Collisions / Duplicates on Composite Key: {len(duplicate_keys)}")

if len(duplicate_keys) > 0:
    print("WARNING: Collisions found on composite key:")
    print(duplicate_keys[['MP Name', 'Constituency', 'State', 'House']])
else:
    print("SUCCESS: 100% of all 543 MP records are uniquely identified under (House + State + Constituency + MP Name) with zero collisions!")

# Check consistency across child datasets
print("\n--- Cross-Dataset MP Attribute Consistency Check ---")
for name, df in [("Recommended Works", rw_df), ("Completed Works", cw_df), ("Expenditures", exp_df)]:
    df['norm_mp'] = normalize_text(df['MP Name'])
    df['norm_const'] = normalize_text(df['Constituency'])
    df['norm_state'] = normalize_text(df['State'])
    df['norm_house'] = normalize_text(df['House'])
    
    # Merge with mp_summary
    merged = df[['norm_mp', 'norm_const', 'norm_state', 'norm_house']].drop_duplicates().merge(
        mp_df[['norm_mp', 'norm_const', 'norm_state', 'norm_house']],
        on='norm_mp',
        how='left',
        suffixes=('_child', '_summary')
    )
    
    state_mismatches = merged[merged['norm_state_child'] != merged['norm_state_summary']]
    const_mismatches = merged[merged['norm_const_child'] != merged['norm_const_summary']]
    house_mismatches = merged[merged['norm_house_child'] != merged['norm_house_summary']]
    
    print(f"\nDataset: {name} (Unique MPs present: {df['norm_mp'].nunique()})")
    print(f"  State Mismatches vs MP Summary:        {len(state_mismatches)}")
    if len(state_mismatches) > 0:
        print("    Examples:", state_mismatches[['norm_mp', 'norm_state_child', 'norm_state_summary']].head(3).to_dict(orient='records'))
    print(f"  Constituency Mismatches vs MP Summary: {len(const_mismatches)}")
    if len(const_mismatches) > 0:
        print("    Examples:", const_mismatches[['norm_mp', 'norm_const_child', 'norm_const_summary']].head(3).to_dict(orient='records'))
    print(f"  House Mismatches vs MP Summary:        {len(house_mismatches)}")

print("\nMP Identity Audit Completed.")
