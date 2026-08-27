import os
import sys
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("data/raw/rajya_sabha/preLoginDashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

# Search for printTilesData implementation
print_tiles_idx = js.find("printTilesData")
if print_tiles_idx != -1:
    print("Found printTilesData in preLoginDashboard.js:")
    snippet = js[print_tiles_idx:print_tiles_idx + 1500]
    print(snippet)

with open("data/raw/rajya_sabha/poptable.js", "r", encoding="utf-8") as f:
    js_pop = f.read()

tiles_rep_idx = js_pop.find("getTilesReportData")
if tiles_rep_idx != -1:
    print("\nFound getTilesReportData in poptable.js:")
    snippet = js_pop[max(0, tiles_rep_idx - 200):tiles_rep_idx + 800]
    print(snippet)
