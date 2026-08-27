import os
import sys
import re

with open("data/raw/rajya_sabha/preLoginDashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

# decode unicode
decoded = js.encode("utf-8").decode("unicode-escape", errors="ignore")

# search for MpName change event
matches = [m.start() for m in re.finditer(r"MpName", decoded)]
print(f"Total MpName occurrences: {len(matches)}")
for i, pos in enumerate(matches):
    snippet = decoded[max(0, pos-100):min(len(decoded), pos+500)]
    print(f"\n--- Occurrence #{i+1} ---")
    print(snippet.replace(chr(10), " "))
