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

endpoints = [
    "getTilesData",
    "getStateData",
    "getTilesReportData",
    "getFilesReportData",
    "getFilesData",
    "getConstituencyData",
    "getTotalMPData",
]

# Payloads to test:
# "0,0,0,1" -> Rajya Sabha
# "0,0,0,2" -> Lok Sabha
# "0,0,0,0" -> All

os.makedirs("data/raw/rajya_sabha", exist_ok=True)

results_summary = {}

for house_code, house_name in [("0,0,0,1", "rajya_sabha"), ("0,0,0,2", "lok_sabha"), ("0,0,0,0", "all_houses")]:
    print(f"\n==================================================")
    print(f"QUERYING OFFICIAL PORTAL FOR {house_name.upper()} (uname={house_code})")
    print(f"==================================================")
    
    for ep in endpoints:
        url = f"https://www.mplads.mospi.gov.in/rest/PreLoginDashboardData/{ep}"
        payload = {"uname": house_code}
        try:
            r = client.post(url, headers=headers, json=payload)
            print(f"POST {ep} (status {r.status_code}, length {len(r.content)} bytes)")
            if r.status_code == 200:
                filename = f"{house_name}_{ep}.json"
                out_path = os.path.join("data/raw/rajya_sabha", filename)
                with open(out_path, "wb") as f:
                    f.write(r.content)
                try:
                    data = r.json()
                    results_summary[f"{house_name}_{ep}"] = {
                        "status": 200,
                        "type": str(type(data)),
                        "len": len(data),
                        "keys_or_sample": list(data.keys()) if isinstance(data, dict) else (data[:2] if len(data) > 0 else [])
                    }
                    if isinstance(data, dict):
                        print(f"  Keys: {list(data.keys())}")
                        for k, v in list(data.items())[:3]:
                            print(f"    {k}: {v}")
                    elif isinstance(data, list):
                        print(f"  List count: {len(data)} items")
                        if len(data) > 0:
                            print(f"    Sample item: {data[0]}")
                except Exception:
                    print(f"  Response text snippet: {r.text[:150]}")
            else:
                print(f"  Failed: {r.status_code} {r.text[:100]}")
        except Exception as e:
            print(f"  Error on {ep}: {e}")

with open("data/raw/rajya_sabha/api_query_results_summary.json", "w", encoding="utf-8") as sum_f:
    json.dump(results_summary, sum_f, indent=2)
