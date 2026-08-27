import os
import sys
import json
import time
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.makedirs("data/raw/rajya_sabha/mp_metrics", exist_ok=True)

with open("data/raw/rajya_sabha/rajya_sabha_mps_all.json", "r", encoding="utf-8") as f:
    mps = json.load(f)

print(f"Total Rajya Sabha MPs to fetch: {len(mps)}")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=UTF-8",
    "Origin": "https://www.mplads.mospi.gov.in",
    "Referer": "https://www.mplads.mospi.gov.in/digigov/dashboard.html",
}

def fetch_mp(m):
    mp_id = m["ID"]
    caption = m["CAPTION"]
    state_id = m["state_id"]
    state_name = m["state_name"]
    combo = f"{state_id},0,{mp_id},1"
    url = "https://www.mplads.mospi.gov.in/rest/PreLoginDashboardData/getTilesData"
    
    client = httpx.Client(verify=False, timeout=20.0)
    for attempt in range(3):
        try:
            r = client.post(url, headers=headers, json={"uname": combo})
            if r.status_code == 200:
                data = r.json()
                out_record = {
                    "source_mp_id": mp_id,
                    "caption": caption,
                    "state_id": state_id,
                    "state_name": state_name,
                    "house": "RAJYA_SABHA",
                    "combo": combo,
                    "metrics": data
                }
                out_path = os.path.join("data/raw/rajya_sabha/mp_metrics", f"rs_mp_{mp_id}.json")
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(out_record, f, indent=2)
                return out_record
        except Exception:
            time.sleep(0.5)
    return None

all_results = []
success_count = 0
failed_count = 0

with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(fetch_mp, m): m for m in mps}
    for future in as_completed(futures):
        res = future.result()
        if res:
            success_count += 1
            all_results.append(res)
            if success_count % 25 == 0 or success_count == len(mps):
                print(f"Progress: {success_count}/{len(mps)} Rajya Sabha MPs fetched successfully.")
        else:
            failed_count += 1
            m = futures[future]
            print(f"Failed to fetch MP {m['ID']} ({m['CAPTION']})")

with open("data/raw/rajya_sabha/all_rs_mp_metrics.json", "w", encoding="utf-8") as f:
    json.dump(all_results, f, indent=2)

print(f"\n==================================================")
print(f"FETCH COMPLETE: {success_count} succeeded, {failed_count} failed.")
print(f"==================================================")
