from pathlib import Path
import re

files = sorted(Path("database/import_chunks/06_parts").glob("part_*.sql"))

total = 0

for p in files:
    text = p.read_text(encoding="utf-8")
    count = len(re.findall(r"^\s*INSERT\s+INTO\s+", text, re.IGNORECASE | re.MULTILINE))
    total += count
    print(f"{p.name}: {count:,} INSERTs")

print(f"\nTOTAL: {total:,} INSERTs")
