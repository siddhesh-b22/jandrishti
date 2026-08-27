import os
import sys
import re
import json
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

client = httpx.Client(verify=False, timeout=20.0, follow_redirects=True)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

print("Fetching /digigov/dashboard.html ...")
r = client.get("https://www.mplads.mospi.gov.in/digigov/dashboard.html", headers=headers)
print(f"Status: {r.status_code}, Final URL: {r.url}, Length: {len(r.text)} bytes")

with open("data/raw/rajya_sabha/dashboard.html", "w", encoding="utf-8") as f:
    f.write(r.text)

# Search for scripts
scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', r.text)
print("\nScripts found in dashboard.html:")
for s in scripts:
    print("  -", s)

# Find terms: getTilesData, getStateData, etc.
for term in ["getTilesData", "getStateData", "getFilesReportData", "getFilesData", "getTilesReportData", "getConstituencyData", "Rajya Sabha", "Lok Sabha", "Allocated Limit"]:
    matches = len(re.findall(re.escape(term), r.text, re.IGNORECASE))
    print(f"Term '{term}': {matches} occurrences in dashboard.html")
