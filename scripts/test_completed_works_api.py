import os
import sys
import json
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

client = httpx.Client(verify=False, timeout=20.0, follow_redirects=True)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=UTF-8",
}

with open("data/raw/rajya_sabha/rajya_sabha_mps_all.json", "r", encoding="utf-8") as f:
    mps = json.load(f)

for m in mps[:5]:
    mp_id = m["ID"]
    caption = m["CAPTION"]
    print(f"\nTesting getAllCompletedWorkByMP for MP: {caption} (ID {mp_id})")
    for payload in [{"mpId": mp_id}, {"mp_id": mp_id}, {"id": mp_id}, {"uname": str(mp_id)}]:
        try:
            r = client.post("https://www.mplads.mospi.gov.in/rest/PreLoginCitizenWorkRcmdRest/getAllCompletedWorkByMP", headers=headers, json=payload)
            print(f"  Payload {payload} -> Status {r.status_code}, Length {len(r.content)} bytes")
            if r.status_code == 200 and len(r.content) > 10:
                print("  Sample:", r.text[:200])
        except Exception as e:
            print(f"  Error: {e}")
