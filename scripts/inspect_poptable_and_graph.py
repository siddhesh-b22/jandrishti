import os
import sys
import re
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

for filename in ["poptable.js", "graph.js"]:
    path = f"data/raw/rajya_sabha/{filename}"
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()
        
    rev_matches = re.findall(r'"([^"]+)"\.split\(""\)\.reverse\(\)\.join\(""\)', code)
    print(f"\n==================================================")
    print(f"Reversed strings in {filename} ({len(rev_matches)}):")
    print(f"==================================================")
    for s in sorted(set(rev_matches)):
        rev = s[::-1]
        if "/rest/" in rev or "rest" in rev.lower() or "data" in rev.lower() or "get" in rev.lower():
            print("  ->", rev)
