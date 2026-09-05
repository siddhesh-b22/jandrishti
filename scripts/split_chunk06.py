from pathlib import Path

src = Path("database/import_chunks/06_infrastructure_works_part3.sql")
outdir = Path("database/import_chunks/06_parts")
outdir.mkdir(exist_ok=True)

text = src.read_text(encoding="utf-8")

# Extract INSERT statements safely.
statements = []
current = []
in_quote = False
escaped = False

for line in text.splitlines():
    stripped = line.strip()

    if not stripped:
        continue

    if stripped.startswith("SET ") or stripped in ("BEGIN", "COMMIT"):
        continue

    current.append(line)

    for ch in line:
        if ch == "'" and not escaped:
            in_quote = not in_quote
        escaped = (ch == "\\" and not escaped)

    if line.rstrip().endswith(";") and not in_quote:
        statements.append("\n".join(current))
        current = []
        escaped = False

if current:
    statements.append("\n".join(current))

print(f"Found {len(statements):,} INSERT statements")

# Remove old parts if they exist
for old in outdir.glob("part_*.sql"):
    old.unlink()

chunk_size = 2000

for start in range(0, len(statements), chunk_size):
    part_number = start // chunk_size + 1
    batch = statements[start:start + chunk_size]

    output = (
        "SET standard_conforming_strings = on;\n"
        "SET statement_timeout = '30min';\n"
        "BEGIN;\n"
        + "\n".join(batch)
        + "\nCOMMIT;\n"
    )

    path = outdir / f"part_{part_number:02d}.sql"
    path.write_text(output, encoding="utf-8")

    print(f"Created {path} -> {len(batch):,} INSERTs")

print("\nDONE")
