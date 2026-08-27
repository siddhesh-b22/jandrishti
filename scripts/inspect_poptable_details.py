import os
import sys
import re
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("data/raw/rajya_sabha/poptable.js", "r", encoding="utf-8") as f:
    js = f.read()

# Search for getTilesReportData calls
matches = [m.start() for m in re.finditer("getTilesReportData", js)]
print(f"Total getTilesReportData occurrences: {len(matches)}")

for i, pos in enumerate(matches):
    snippet = js[max(0, pos - 200):min(len(js), pos + 800)]
    print(f"\n--- Occurrence #{i+1} ---")
    print(snippet)

# Search for dataTables column definitions or column names
cols = re.findall(r'data:\s*["\']([^"\']+)["\']', js)
print(f"\nTable columns found in poptable.js ({len(cols)}):")
for c in set(cols):
    print("  ->", c)
