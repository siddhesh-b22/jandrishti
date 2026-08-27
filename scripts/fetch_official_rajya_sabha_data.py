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
}

print("Initializing session on https://www.mplads.mospi.gov.in/ ...")
r_init = client.get("https://www.mplads.mospi.gov.in/", headers={"User-Agent": headers["User-Agent"]})
print("Session initialized. Cookies:", client.cookies)

endpoints_to_query = [
    ("/rest/PreLoginDashboardData/getTotalMPData", {"house": "Rajya Sabha"}, "rajya_sabha_total_mp_data.json"),
    ("/rest/PreLoginDashboardData/getTotalMPData", {"house": "Lok Sabha"}, "lok_sabha_total_mp_data.json"),
    ("/rest/PreLoginDashboardData/getTotalMPData", {}, "all_houses_total_mp_data.json"),
    ("/rest/PreLoginDashboardData/getfiles", {"house": "Rajya Sabha"}, "rajya_sabha_files.json"),
    ("/rest/PreLoginCitizenWorkRcmdRest/getComboStateData", {}, "combo_state_data.json"),
]

for ep, payload, out_filename in endpoints_to_query:
    url = f"https://www.mplads.mospi.gov.in{ep}"
    try:
        r = client.post(url, headers=headers, json=payload)
        print(f"POST {ep} {payload} -> {r.status_code} ({len(r.content)} bytes)")
        if r.status_code == 200:
            out_path = os.path.join("data/raw/rajya_sabha", out_filename)
            with open(out_path, "wb") as f:
                f.write(r.content)
            try:
                data = r.json()
                print(f"  Success: Parsed JSON with keys/items: {list(data.keys()) if isinstance(data, dict) else len(data)}")
                if isinstance(data, dict):
                    print("  Preview:", str(data)[:250])
            except Exception:
                print(f"  Non-JSON response snippet: {r.text[:200]}")
        else:
            print(f"  Failed status {r.status_code}: {r.text[:200]}")
    except Exception as e:
        print(f"  Error on {ep}: {e}")
