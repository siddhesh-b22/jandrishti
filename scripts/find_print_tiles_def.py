import os
import sys

with open("data/raw/rajya_sabha/preLoginDashboard.js", "r", encoding="utf-8") as f:
    js = f.read()

idx = js.find("function printTilesData")
if idx == -1:
    idx = js.find("printTilesData=")
if idx == -1:
    idx = js.find("printTilesData =")
if idx == -1:
    idx = js.find("printTilesData(")
if idx == -1:
    idx = js.find("printTilesData")

print(f"Index: {idx}")
snippet = js[max(0, idx - 100):min(len(js), idx + 2000)]
print("Snippet:\n", snippet)
