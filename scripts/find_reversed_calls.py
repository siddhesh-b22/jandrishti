import os
import sys
import re

with open("data/raw/rajya_sabha/poptable.js", "r", encoding="utf-8") as f:
    js = f.read()

target = "getTilesReportData"[::-1]
print(f"Target reversed: {target}")

matches = [m.start() for m in re.finditer(target, js)]
print(f"Occurrences of {target}: {len(matches)}")

for i, pos in enumerate(matches):
    snippet = js[max(0, pos - 400):min(len(js), pos + 1000)]
    print(f"\n--- Occurrence #{i+1} ---")
    print(snippet)
