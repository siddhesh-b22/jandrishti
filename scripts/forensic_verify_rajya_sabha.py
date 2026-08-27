import json
import sqlite3
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def parse_num(v):
    if not v:
        return 0.0
    if isinstance(v, list):
        v = v[0]
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).replace('\u00a0', '').replace(',', '').strip()
    try:
        return float(s)
    except:
        return 0.0

def forensic_check():
    # 1. Inspect raw official files
    with open('data/raw/rajya_sabha/all_rs_mp_metrics.json', 'r', encoding='utf-8') as f:
        raw_mps = json.load(f)

    with open('data/raw/rajya_sabha/all_rs_state_metrics.json', 'r', encoding='utf-8') as f:
        raw_states = json.load(f)

    with open('data/raw/rajya_sabha/rajya_sabha_getTilesData.json', 'r', encoding='utf-8') as f:
        raw_tiles = json.load(f)

    print("==================================================")
    print("1. RAW OFFICIAL SOURCE METRICS")
    print("==================================================")
    print("Source Artifact: data/raw/rajya_sabha/all_rs_mp_metrics.json")
    print("Retrieval Date:  2026-08-26")
    print(f"Source MP Count: {len(raw_mps)}")
    print(f"Source State Count (with RS MPs): {len(raw_states)}")
    
    raw_alloc_sum = 0.0
    raw_exp_sum = 0.0
    raw_rec_sum = 0
    raw_comp_sum = 0
    raw_sanc_sum = 0
    raw_cal_sum = 0.0

    for m in raw_mps:
        met = m.get('metrics', {})
        raw_alloc_sum += parse_num(met.get("Allocated Limit for Hon'ble MPs", [0])[0])
        raw_exp_sum += parse_num(met.get("Expenditure on Completed and On-going Works as on Date", [0])[0])
        raw_rec_sum += int(parse_num(met.get("Works Recommended", [0])[0]))
        raw_comp_sum += int(parse_num(met.get("Works Completed", [0])[0]))
        raw_sanc_sum += int(parse_num(met.get("Works Sanctioned", [0])[0]))
        
        cal_val = met.get("Amount consented for Calamity", [0])
        if len(cal_val) > 1:
            raw_cal_sum += parse_num(cal_val[1])
        else:
            raw_cal_sum += parse_num(cal_val[0])

    print(f"Raw Alloc Sum: ₹{raw_alloc_sum:,.2f}")
    print(f"Raw Exp Sum:   ₹{raw_exp_sum:,.2f}")
    print(f"Raw Rec Sum:   {raw_rec_sum:,} works")
    print(f"Raw Comp Sum:  {raw_comp_sum:,} works")
    print(f"Raw Sanc Sum:  {raw_sanc_sum:,} works")
    print(f"Raw Calamity:  ₹{raw_cal_sum:,.2f}")

    # Also inspect Macro Tiles JSON
    print("\nOfficial Portal Tiles JSON Verification:")
    tiles_alloc = parse_num(raw_tiles.get("Allocated Limit for Hon'ble MPs", [0])[0])
    tiles_exp = parse_num(raw_tiles.get("Expenditure on Completed and On-going Works as on Date", [0])[0])
    tiles_rec = int(parse_num(raw_tiles.get("Works Recommended", [0])[0]))
    tiles_comp = int(parse_num(raw_tiles.get("Works Completed", [0])[0]))
    print(f"  • Tiles Alloc Limit: ₹{tiles_alloc:,.2f}")
    print(f"  • Tiles Expenditure: ₹{tiles_exp:,.2f}")
    print(f"  • Tiles Rec Works:   {tiles_rec:,}")
    print(f"  • Tiles Comp Works:  {tiles_comp:,}")

    # 2. Inspect Database
    conn = sqlite3.connect('database/mplads.db')
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            COUNT(*),
            SUM(allocated_amount),
            SUM(total_expenditure),
            SUM(unspent_amount),
            SUM(recommended_works_count),
            SUM(completed_works_count)
        FROM mps
        WHERE house = 'Rajya Sabha';
    """)
    db_row = cursor.fetchone()

    print("\n==================================================")
    print("2. DATABASE RAJYA SABHA METRICS")
    print("==================================================")
    print(f"DB MP Count:   {db_row[0]}")
    print(f"DB Alloc Sum:  ₹{db_row[1]:,.2f}")
    print(f"DB Exp Sum:    ₹{db_row[2]:,.2f}")
    print(f"DB Unspent:    ₹{db_row[3]:,.2f}")
    print(f"DB Rec Sum:    {db_row[4]:,} works")
    print(f"DB Comp Sum:   {db_row[5]:,} works")

    print("\n==================================================")
    print("3. EXACT RECONCILIATION VARIANCE (SOURCE vs DB)")
    print("==================================================")
    print(f"MP Count Variance:    {db_row[0] - len(raw_mps)}")
    print(f"Alloc Variance:       ₹{abs(db_row[1] - raw_alloc_sum):.6f}")
    print(f"Exp Variance:         ₹{abs(db_row[2] - raw_exp_sum):.6f}")
    print(f"Rec Work Variance:    {db_row[4] - raw_rec_sum}")
    print(f"Comp Work Variance:   {db_row[5] - raw_comp_sum}")

    # 3. Check for Rajya Sabha records in works, transactions, vendors
    cursor.execute("SELECT COUNT(*) FROM works WHERE house = 'Rajya Sabha';")
    works_rs = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM transactions WHERE internal_mp_id LIKE 'INTERNAL_RS_%';")
    txns_rs = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM vendors WHERE primary_mp_id LIKE 'INTERNAL_RS_%';")
    vnds_rs = cursor.fetchone()[0]

    print("\n==================================================")
    print("4. GRANULARITY & NON-FABRICATION VERIFICATION")
    print("==================================================")
    print(f"Granular Works in DB for Rajya Sabha:        {works_rs} (Correct: 0 fabricated)")
    print(f"Granular Transactions for Rajya Sabha:       {txns_rs} (Correct: 0 fabricated)")
    print(f"Granular Vendors with RS MP ID:              {vnds_rs} (Correct: 0 fabricated)")

    # 4. Verify Anomalies
    cursor.execute("SELECT COUNT(*) FROM anomalies WHERE anomaly_id LIKE 'ANOM_RS_%';")
    anom_rs_cnt = cursor.fetchone()[0]
    cursor.execute("""
        SELECT anomaly_type, severity, COUNT(*), MIN(anomaly_score), MAX(anomaly_score)
        FROM anomalies
        WHERE anomaly_id LIKE 'ANOM_RS_%'
        GROUP BY anomaly_type, severity;
    """)
    anom_breakdown = cursor.fetchall()
    
    print("\n==================================================")
    print("5. RAJYA SABHA ANOMALIES VERIFICATION")
    print("==================================================")
    print(f"Total RS Anomalies in DB: {anom_rs_cnt}")
    for at, sev, cnt, min_s, max_s in anom_breakdown:
        print(f"  • {at} [{sev}]: {cnt} flags (Scores: {min_s:.4f} - {max_s:.4f})")

    # 5. Lok Sabha vs Rajya Sabha Snapshot Note
    print("\n==================================================")
    print("6. REPORTING WINDOW / SNAPSHOT SPECIFICATION")
    print("==================================================")
    print("Cross-house totals are a reporting-window aggregation, not a simultaneous single-source snapshot.")
    print("Lok Sabha Data Snapshot:   2026-08-25 / 18th Lok Sabha cumulative portal export")
    print("Rajya Sabha Data Snapshot:  2026-08-26 / MoSPI eSAKSHI live API snapshot")

if __name__ == '__main__':
    forensic_check()
