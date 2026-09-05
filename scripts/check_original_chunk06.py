from pathlib import Path
import re

p = Path("database/import_chunks/06_infrastructure_works_part3.sql")
text = p.read_text(encoding="utf-8")

count = len(
    re.findall(
        r"^\s*INSERT\s+INTO\s+",
        text,
        re.IGNORECASE | re.MULTILINE
    )
)

print(f"Original Chunk 06 INSERTs: {count:,}")
print(f"File size: {p.stat().st_size:,} bytes")
