import os
import sys
import re
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("data/raw/rajya_sabha/landingpage.js", "r", encoding="utf-8") as f:
    code = f.read()

# Find all reversed strings
matches = re.findall(r'"([^"]+)"\.split\(""\)\.reverse\(\)\.join\(""\)', code)
print(f"Total reversed strings found: {len(matches)}")
unique_reversed = sorted(set(matches))

endpoints = []
for s in unique_reversed:
    rev = s[::-1]
    endpoints.append(rev)
    if "rest" in rev.lower() or "data" in rev.lower() or "get" in rev.lower() or "report" in rev.lower():
        print("  -", rev)

# Also search for standard string patterns like /rest/...
standard_urls = re.findall(r'["\'](/rest/[^"\']+)["\']', code)
print(f"\nStandard /rest/ URLs found: {len(standard_urls)}")
for u in set(standard_urls):
    print("  -", u)

with open("data/raw/rajya_sabha/discovered_endpoints.json", "w", encoding="utf-8") as out:
    json.dump({"reversed_endpoints": endpoints, "standard_urls": list(set(standard_urls))}, out, indent=2)
