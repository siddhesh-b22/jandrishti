import os
import sys
import re

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

for fn in ["preLoginDashboard.js", "poptable.js", "graph.js", "rajyasaba.js", "loksaba.js"]:
    with open(f"data/raw/rajya_sabha/{fn}", "r", encoding="utf-8") as f:
        content = f.read()
    
    # decode unicode escapes
    decoded = content.encode("utf-8").decode("unicode-escape", errors="ignore")
    
    # find all occurrences of ajax
    matches = [m.start() for m in re.finditer(r"ajax", decoded, re.IGNORECASE)]
    print(f"File {fn}: {len(matches)} occurrences of 'ajax'")
    for i, pos in enumerate(matches):
        snippet = decoded[max(0, pos-100):min(len(decoded), pos+350)]
        print(f"  [{i+1}] {snippet.replace(chr(10), ' ')}")
