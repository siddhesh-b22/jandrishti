import os
import sys
import json
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.makedirs("data/raw/rajya_sabha/state_metrics", exist_ok=True)

with open("data/raw/rajya_sabha/rajya_sabha_getStateData.json", "r", encoding="utf-8") as f:
    states = json.load(f)

print(f"Total States to fetch for Rajya Sabha: {len(states)}")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=UTF-8",
    "Origin": "https://www.mplads.mospi.gov.in",
    "Referer": "https://www.mplads.mospi.gov.in/digigov/dashboard.html",
}

def fetch_state(s):
    s_id = s.get("STATE_ID")
    s_name = s.get("STATE_NAME")
    combo = f"{s_id},0,0,1"
    url = "https://www.mplads.mospi.gov.in/rest/PreLoginDashboardData/getTilesData"
    
    client = httpx.Client(verify=False, timeout=20.0)
    for attempt in range(3):
        try:
            r = client.post(url, headers=headers, json={"uname": combo})
            if r.status_code == 200:
                data = r.json()
                out_record = {
                    "state_id": s_id,
                    "state_name": s_name,
                    "house": "RAJYA_SABHA",
                    "combo": combo,
                    "metrics": data
                }
                out_path = os.path.join("data/raw/rajya_sabha/state_metrics", f"rs_state_{s_id}.json")
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(out_record, f, indent=2)
                return out_record
        except Exception:
            pass
    return None

state_results = []
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(fetch_state, s): s for s in states}
    for future in as_completed(futures):
        res = future.result()
        if res:
            state_results.append(res)

with open("data/raw/rajya_sabha/all_rs_state_metrics.json", "w", encoding="utf-8") as f:
    json.dump(state_results, f, indent=2)

print(f"State metrics fetch complete: {len(state_results)}/36 states fetched.")
