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

print("Initializing session...")
r_init = client.get("https://www.mplads.mospi.gov.in/digigov/dashboard.html", headers={"User-Agent": headers["User-Agent"]})

# Load the discovered Rajya Sabha MPs
with open("data/raw/rajya_sabha/rajya_sabha_mps_all.json", "r", encoding="utf-8") as f:
    mps = json.load(f)

print(f"Testing MP-level tiles retrieval for first 3 Rajya Sabha MPs out of {len(mps)}...")

for m in mps[:3]:
    mp_id = m["ID"]
    caption = m["CAPTION"]
    state_id = m["state_id"]
    state_name = m["state_name"]
    
    combo = f"{state_id},0,{mp_id},1"
    url = "https://www.mplads.mospi.gov.in/rest/PreLoginDashboardData/getTilesData"
    try:
        r = client.post(url, headers=headers, json={"uname": combo})
        print(f"\nMP: {caption} ({state_name}, ID {mp_id}) -> combo '{combo}'")
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print("Response:", json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error for MP {mp_id}: {e}")
