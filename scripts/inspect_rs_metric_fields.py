import os
import sys
import json
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("data/raw/rajya_sabha/all_rs_mp_metrics.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total raw RS MP records: {len(data)}")

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

total_alloc = 0.0
total_exp = 0.0
total_rec_works = 0
total_comp_works = 0
total_sanc_works = 0

sample_mps = []

for item in data:
    mp_id = item["source_mp_id"]
    caption = item["caption"]
    state_name = item["state_name"]
    metrics = item["metrics"]
    
    # parse caption: "Shri S Niranjan Reddy (2022-28)"
    m = re.match(r"^(.*?)\s*\((.*?)\)$", caption)
    if m:
        name = m.group(1).strip()
        tenure = m.group(2).strip()
    else:
        name = caption.strip()
        tenure = "Unknown"
        
    alloc_arr = metrics.get("Allocated Limit for Hon'ble MPs", ["0", "0"])
    exp_arr = metrics.get("Expenditure on Completed and On-going Works as on Date", ["0", "0"])
    rec_arr = metrics.get("Works Recommended", ["0", "0"])
    comp_arr = metrics.get("Works Completed", ["0", "0"])
    sanc_arr = metrics.get("Works Sanctioned", ["0", "0"])
    cal_arr = metrics.get("Amount consented for Calamity", ["0", "0"])
    
    alloc_amt = clean_amt(alloc_arr[0])
    exp_amt = clean_amt(exp_arr[0])
    rec_cnt = int(rec_arr[0]) if rec_arr and rec_arr[0].isdigit() else 0
    rec_amt = clean_amt(rec_arr[1]) if len(rec_arr) > 1 else 0.0
    comp_cnt = int(comp_arr[0]) if comp_arr and comp_arr[0].isdigit() else 0
    comp_amt = clean_amt(comp_arr[1]) if len(comp_arr) > 1 else 0.0
    sanc_cnt = int(sanc_arr[0]) if sanc_arr and sanc_arr[0].isdigit() else 0
    sanc_amt = clean_amt(sanc_arr[1]) if len(sanc_arr) > 1 else 0.0
    cal_amt = clean_amt(cal_arr[1]) if len(cal_arr) > 1 else 0.0
    
    total_alloc += alloc_amt
    total_exp += exp_amt
    total_rec_works += rec_cnt
    total_comp_works += comp_cnt
    total_sanc_works += sanc_cnt
    
    sample_mps.append({
        "source_mp_id": mp_id,
        "name": name,
        "tenure": tenure,
        "state": state_name,
        "allocated_amount": alloc_amt,
        "total_expenditure": exp_amt,
        "recommended_works_count": rec_cnt,
        "completed_works_count": comp_cnt,
        "sanctioned_works_count": sanc_cnt,
        "calamity_amount": cal_amt
    })

print(f"\n==================================================")
print(f"SUM OF 235 RAJYA SABHA MPS:")
print(f"Total Allocated: ₹{total_alloc:,.2f} ({total_alloc/1e7:,.2f} Cr)")
print(f"Total Expenditure: ₹{total_exp:,.2f} ({total_exp/1e7:,.2f} Cr)")
print(f"Total Recommended Works: {total_rec_works:,}")
print(f"Total Completed Works: {total_comp_works:,}")
print(f"Total Sanctioned Works: {total_sanc_works:,}")
print(f"==================================================")
print("Sample first 3 parsed MPs:")
for s in sample_mps[:3]:
    print(" ", s)
