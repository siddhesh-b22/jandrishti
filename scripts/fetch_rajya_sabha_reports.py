import os
import sys
import json
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

client = httpx.Client(verify=False, timeout=60.0, follow_redirects=True)
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

tile_keys = [
    "Allocated Limit for Hon'ble MPs",
    "Expenditure on Completed and On-going Works as on Date",
    "Works Recommended",
    "Works Sanctioned",
    "Works Completed",
    "Amount consented for Calamity",
]

# Test formats for combo: ["0", "0", "0", "1"], "0,0,0,1"
os.makedirs("data/raw/rajya_sabha", exist_ok=True)

for k in tile_keys:
    print(f"\n==================================================")
    print(f"FETCHING REPORT FOR TILE: {k}")
    print(f"==================================================")
    
    url = "https://www.mplads.mospi.gov.in/rest/PreLoginDashboardData/getTilesReportData"
    
    for combo_val in [["0", "0", "0", "1"], "0,0,0,1"]:
        payload = {"combo": combo_val, "key": k}
        try:
            r = client.post(url, headers=headers, json=payload)
            print(f"POST getTilesReportData (combo={combo_val}) -> Status {r.status_code}, Length {len(r.content)} bytes")
            if r.status_code == 200 and len(r.content) > 10:
                safe_name = k.replace(" ", "_").replace("'", "").lower()
                out_path = os.path.join("data/raw/rajya_sabha", f"rajya_sabha_report_{safe_name}.json")
                with open(out_path, "wb") as f:
                    f.write(r.content)
                data = r.json()
                print(f"  SUCCESS! Received data of type {type(data)}")
                if isinstance(data, list):
                    print(f"  Count: {len(data)} items")
                    if len(data) > 0:
                        print("  Sample row:", data[0])
                        print("  Columns:", list(data[0].keys()) if isinstance(data[0], dict) else "N/A")
                elif isinstance(data, dict):
                    print("  Keys:", list(data.keys()))
                    print("  Sample:", str(data)[:300])
                break
        except Exception as e:
            print(f"  Error: {e}")
