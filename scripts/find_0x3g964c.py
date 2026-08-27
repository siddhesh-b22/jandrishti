import os
import sys

with open("data/raw/rajya_sabha/preLoginDashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

idx = js.find("_0x3g964c")
print(f"Index: {idx}")
snippet = js[max(0, idx - 50):min(len(js), idx + 2500)]
print("Snippet:\n", snippet)
