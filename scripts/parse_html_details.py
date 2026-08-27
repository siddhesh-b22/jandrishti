import os
import sys
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("data/raw/rajya_sabha/home_page.html", "r", encoding="utf-8") as f:
    html = f.read()

links = re.findall(r'href=["\']([^"\']+)["\']', html)
print("Links found:")
for l in set(links):
    if not l.startswith("#") and not l.startswith("javascript"):
        print("  -", l)

# Look for ids and classes
element_ids = re.findall(r'id=["\']([^"\']+)["\']', html)
print("\nElement IDs related to Rajya / House / Dashboard / Tiles:")
for eid in set(element_ids):
    if any(k in eid.lower() for k in ["rajya", "house", "tile", "dash", "state", "mp", "table"]):
        print("  -", eid)
