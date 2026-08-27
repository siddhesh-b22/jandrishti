import os
import sys
import json
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

client = httpx.Client(verify=False, timeout=30.0, follow_redirects=True)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=UTF-8",
    "Origin": "https://www.mplads.mospi.gov.in",
    "Referer": "https://www.mplads.mospi.gov.in/digigov/dashboard.html",
}

print("Initializing session on https://www.mplads.mospi.gov.in/digigov/dashboard.html ...")
r_init = client.get("https://www.mplads.mospi.gov.in/digigov/dashboard.html", headers={"User-Agent": headers["User-Agent"]})
print("Session Cookies:", client.cookies)

# 1. Fetch States
r_states = client.post("https://www.mplads.mospi.gov.in/rest/PreLoginDashboardData/getStateData", headers=headers, json={})
states = r_states.json()
print(f"Total States fetched: {len(states)}")

# 2. For each state, fetch Rajya Sabha MPs (house=1)
all_rs_mps = []
rs_mps_by_state = {}

for s in states:
    s_id = s.get("STATE_ID")
    s_name = s.get("STATE_NAME")
    
    # Try various tenure combinations:
    # "state_id,house_id,tenure_id" e.g. f"{s_id},1," or f"{s_id},1,0" or f"{s_id},1,7"
    for tenure_id in ["", "0", "7"]:
        state_combo = f"{s_id},1,{tenure_id}" if tenure_id else f"{s_id},1,"
        url = "https://www.mplads.mospi.gov.in/rest/PreLoginDashboardData/getMpNamesData"
        try:
            r_mp = client.post(url, headers=headers, json={"state_combo": state_combo})
            if r_mp.status_code == 200:
                mp_list = r_mp.json()
                if mp_list and len(mp_list) > 0:
                    print(f"State {s_name} (ID {s_id}, combo '{state_combo}'): {len(mp_list)} Rajya Sabha MPs")
                    for m in mp_list:
                        m["state_id"] = s_id
                        m["state_name"] = s_name
                        m["house"] = "RAJYA_SABHA"
                    rs_mps_by_state[s_name] = mp_list
                    all_rs_mps.extend(mp_list)
                    break
        except Exception as e:
            print(f"Error for {s_name}: {e}")

print(f"\n==================================================")
print(f"TOTAL RAJYA SABHA MP RECORDS DISCOVERED: {len(all_rs_mps)}")
print(f"==================================================")

os.makedirs("data/raw/rajya_sabha", exist_ok=True)
with open("data/raw/rajya_sabha/rajya_sabha_mps_by_state.json", "w", encoding="utf-8") as f:
    json.dump(rs_mps_by_state, f, indent=2)

with open("data/raw/rajya_sabha/rajya_sabha_mps_all.json", "w", encoding="utf-8") as f:
    json.dump(all_rs_mps, f, indent=2)

if len(all_rs_mps) > 0:
    print("Sample Rajya Sabha MP:", all_rs_mps[0])
