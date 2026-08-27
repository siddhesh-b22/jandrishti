import os
import sys
import re
import json
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

client = httpx.Client(verify=False, timeout=25.0, follow_redirects=True)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
}

for rel in ["/libs/simplegrid/graph.js", "/libs/simplegrid/poptable.js"]:
    url = f"https://www.mplads.mospi.gov.in{rel}"
    try:
        r = client.get(url, headers=headers)
        print(f"Fetched {rel}: Status {r.status_code}, Length {len(r.text)} bytes")
        with open(f"data/raw/rajya_sabha/{os.path.basename(rel)}", "w", encoding="utf-8") as f:
            f.write(r.text)
    except Exception as e:
        print(f"Error {rel}: {e}")

# Inspect preLoginDashboard.js for AJAX endpoints
with open("data/raw/rajya_sabha/preLoginDashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

# Look for ajax calls in preLoginDashboard.js
rev_matches = re.findall(r'"([^"]+)"\.split\(""\)\.reverse\(\)\.join\(""\)', js)
print(f"\nReversed strings in preLoginDashboard.js ({len(rev_matches)}):")
for s in sorted(set(rev_matches)):
    rev = s[::-1]
    if any(k in rev.lower() for k in ["rest", "tile", "data", "state", "mp", "work", "exp"]):
        print("  ->", rev)
