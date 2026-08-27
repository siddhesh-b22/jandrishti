import os
import sys
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("data/raw/rajya_sabha/poptable.js", "r", encoding="utf-8") as f:
    js = f.read()

# Search for all $.ajax or $.post or $.get
ajax_matches = re.findall(r'\$\.ajax\((.*?)\);', js, re.DOTALL)
print(f"Total $.ajax calls in poptable.js: {len(ajax_matches)}")
for i, m in enumerate(ajax_matches):
    print(f"\n--- Ajax Call #{i+1} ---")
    # find URLs in m
    urls = re.findall(r'"([^"]+)"\.split\(""\)\.reverse\(\)\.join\(""\)', m)
    deob = [u[::-1] for u in urls]
    print("Reversed strings in call:", deob)
    print("Snippet:", m[:300].replace("\n", " "))

with open("data/raw/rajya_sabha/preLoginDashboard.js", "r", encoding="utf-8") as f:
    js_dash = f.read()

ajax_dash = re.findall(r'\$\.ajax\((.*?)\);', js_dash, re.DOTALL)
print(f"\nTotal $.ajax calls in preLoginDashboard.js: {len(ajax_dash)}")
for i, m in enumerate(ajax_dash):
    print(f"\n--- Dash Ajax Call #{i+1} ---")
    urls = re.findall(r'"([^"]+)"\.split\(""\)\.reverse\(\)\.join\(""\)', m)
    deob = [u[::-1] for u in urls]
    print("Reversed strings in call:", deob)
    print("Snippet:", m[:300].replace("\n", " "))
