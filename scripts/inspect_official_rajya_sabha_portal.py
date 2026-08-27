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
    "Accept": "*/*",
}

print("Fetching /libs/simplegrid/landingpage.js...")
r_js = client.get("https://www.mplads.mospi.gov.in/libs/simplegrid/landingpage.js", headers=headers)
print(f"JS Status: {r_js.status_code}, Length: {len(r_js.text)} bytes")

with open("data/raw/rajya_sabha/landingpage.js", "w", encoding="utf-8") as f:
    f.write(r_js.text)

# Search for all URLs and ajax calls in landingpage.js
ajax_calls = re.findall(r'url:\s*["\']([^"\']+)["\']', r_js.text)
print("\nAjax URLs found in landingpage.js:")
for u in set(ajax_calls):
    print("  -", u)

# Search for function definitions
functions = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', r_js.text)
print("\nFunctions found in landingpage.js:")
for fn in functions:
    print("  -", fn)

# Find references to Rajya Sabha
print("\nRajya Sabha occurrences in landingpage.js:")
for line in r_js.text.splitlines():
    if "rajya" in line.lower() or "house" in line.lower() or "tile" in line.lower():
        print("  >", line.strip()[:100])
