"""
Jandrishti Production Seed Splitter
Splits database/postgres_canonical_seed.sql into sequential, dependency-ordered,
transaction-isolated chunks in database/import_chunks/
"""

import os
import re

SOURCE_SEED = "database/postgres_canonical_seed.sql"
OUTPUT_DIR = "database/import_chunks"
MANIFEST_FILE = os.path.join(OUTPUT_DIR, "IMPORT_MANIFEST.md")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Chunk Definitions
# Format: (chunk_filename, table_targets, max_records_per_subchunk)
CHUNKS_CONFIG = [
    {
        "filename": "01_lookup_master.sql",
        "description": "Root lookups: States, Political Parties, Constituencies",
        "tables": ["public.states", "public.political_parties", "public.constituencies"],
        "max_records": None
    },
    {
        "filename": "02_representatives_master.sql",
        "description": "Representatives, Terms, and Parliamentary Allocations",
        "tables": ["public.representatives", "public.representative_terms", "public.parliamentary_allocations"],
        "max_records": None
    },
    {
        "filename": "03_contractors.sql",
        "description": "Verified Contractors Master",
        "tables": ["public.contractors"],
        "max_records": None
    },
    {
        "filename": "04_infrastructure_works_part1.sql",
        "description": "Infrastructure Works (Part 1 of 5)",
        "tables": ["public.infrastructure_works"],
        "slice": (0, 20488)
    },
    {
        "filename": "05_infrastructure_works_part2.sql",
        "description": "Infrastructure Works (Part 2 of 5)",
        "tables": ["public.infrastructure_works"],
        "slice": (20488, 40975)
    },
    {
        "filename": "06_infrastructure_works_part3.sql",
        "description": "Infrastructure Works (Part 3 of 5)",
        "tables": ["public.infrastructure_works"],
        "slice": (40975, 61462)
    },
    {
        "filename": "07_infrastructure_works_part4.sql",
        "description": "Infrastructure Works (Part 4 of 5)",
        "tables": ["public.infrastructure_works"],
        "slice": (61462, 81949)
    },
    {
        "filename": "08_infrastructure_works_part5.sql",
        "description": "Infrastructure Works (Part 5 of 5)",
        "tables": ["public.infrastructure_works"],
        "slice": (81949, 102437)
    },
    {
        "filename": "09_treasury_vouchers_part1.sql",
        "description": "Treasury Vouchers (Part 1 of 4)",
        "tables": ["public.treasury_vouchers"],
        "slice": (0, 20574)
    },
    {
        "filename": "10_treasury_vouchers_part2.sql",
        "description": "Treasury Vouchers (Part 2 of 4)",
        "tables": ["public.treasury_vouchers"],
        "slice": (20574, 41148)
    },
    {
        "filename": "11_treasury_vouchers_part3.sql",
        "description": "Treasury Vouchers (Part 3 of 4)",
        "tables": ["public.treasury_vouchers"],
        "slice": (41148, 61722)
    },
    {
        "filename": "12_treasury_vouchers_part4.sql",
        "description": "Treasury Vouchers (Part 4 of 4)",
        "tables": ["public.treasury_vouchers"],
        "slice": (61722, 82296)
    },
    {
        "filename": "13_governance_and_ml.sql",
        "description": "Administrative Review Cases, Audit Trail & ML Anomaly Signals",
        "tables": ["gov.review_cases", "gov.audit_trail", "ml.anomaly_signals"],
        "max_records": None
    }
]

def main():
    print("Reading and buffering statements from canonical seed...")
    statements_by_table = {}
    current_stmt_lines = []
    
    in_quote = False
    with open(SOURCE_SEED, "r", encoding="utf-8") as f:
        for line in f:
            l = line.strip()
            if not l or l.startswith("--"):
                continue
            if l == "BEGIN;" or l == "COMMIT;":
                continue
            
            # Track quote state across the line
            i = 0
            while i < len(line):
                c = line[i]
                if c == "'":
                    if in_quote and i + 1 < len(line) and line[i+1] == "'":
                        i += 1
                    else:
                        in_quote = not in_quote
                i += 1
                
            current_stmt_lines.append(line)
            if l.endswith(";") and not in_quote:
                full_stmt = "".join(current_stmt_lines)
                current_stmt_lines = []
                
                m = re.match(r"INSERT INTO\s+([a-zA-Z0-9_\.]+)", full_stmt.strip(), re.IGNORECASE)
                if m:
                    tbl = m.group(1)
                    if tbl not in statements_by_table:
                        statements_by_table[tbl] = []
                    statements_by_table[tbl].append(full_stmt)
                    
    total_buffered = sum(len(v) for v in statements_by_table.values())
    print(f"Total SQL statements buffered: {total_buffered:,}")
    for tbl, stmts in statements_by_table.items():
        print(f" - {tbl}: {len(stmts):,} statements")
        
    print("\nGenerating import chunks in database/import_chunks/...")
    manifest_rows = []
    cumulative_count = 0
    
    for idx, cfg in enumerate(CHUNKS_CONFIG, 1):
        filename = cfg["filename"]
        filepath = os.path.join(OUTPUT_DIR, filename)
        tables = cfg["tables"]
        desc = cfg["description"]
        
        chunk_stmts = []
        if "slice" in cfg:
            tbl = tables[0]
            start, end = cfg["slice"]
            chunk_stmts = statements_by_table[tbl][start:end]
        else:
            for tbl in tables:
                chunk_stmts.extend(statements_by_table.get(tbl, []))
                
        count = len(chunk_stmts)
        cumulative_count += count
        
        with open(filepath, "w", encoding="utf-8") as out:
            out.write(f"-- JANDRISHTI RESILIENT IMPORT CHUNK {idx:02d}: {filename}\n")
            out.write(f"-- Target: {desc}\n")
            out.write(f"-- Statement Count: {count:,}\n\n")
            out.write("SET standard_conforming_strings = on;\n")
            out.write("BEGIN;\n\n")
            for stmt in chunk_stmts:
                out.write(stmt)
                if not stmt.endswith("\n"):
                    out.write("\n")
            out.write("\nCOMMIT;\n")
            
        file_size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f" [Chunk {idx:02d}] {filename} -> {count:,} statements ({file_size_mb:.2f} MB)")
        
        manifest_rows.append({
            "order": idx,
            "filename": filename,
            "tables": ", ".join([f"`{t}`" for t in tables]),
            "description": desc,
            "count": count,
            "cumulative": cumulative_count,
            "size_mb": file_size_mb
        })
        
    print("\nWriting IMPORT_MANIFEST.md...")
    with open(MANIFEST_FILE, "w", encoding="utf-8") as mf:
        mf.write("# JANDRISHTI PRODUCTION DATABASE IMPORT MANIFEST\n\n")
        mf.write(f"**Total Chunks:** {len(CHUNKS_CONFIG)}  \n")
        mf.write(f"**Total INSERT Statements:** {cumulative_count:,}  \n")
        mf.write("**Execution Strategy:** Sequential atomic transactional chunks (`BEGIN; ... COMMIT;` per chunk)\n\n")
        mf.write("## Import Execution Sequence\n\n")
        mf.write("| Order | Filename | Target Table(s) | Description | INSERT Count | Cumulative Count | Size |\n")
        mf.write("| :---: | :--- | :--- | :--- | :---: | :---: | :---: |\n")
        for r in manifest_rows:
            mf.write(f"| **{r['order']:02d}** | [`{r['filename']}`](./{r['filename']}) | {r['tables']} | {r['description']} | {r['count']:,} | {r['cumulative']:,} | {r['size_mb']:.2f} MB |\n")
            
        mf.write("\n## Recommended Execution Commands\n\n")
        mf.write("Execute the chunks in order using PowerShell or Bash loop with automatic error halting:\n\n")
        mf.write("```powershell\n")
        mf.write("# PowerShell sequential import runner\n")
        mf.write("$chunks = Get-ChildItem -Path .\\database\\import_chunks\\*.sql | Sort-Object Name\n")
        mf.write("foreach ($chunk in $chunks) {\n")
        mf.write("    Write-Host \"[IMPORTING] $($chunk.Name)...\" -ForegroundColor Cyan\n")
        mf.write("    psql -h \"<POOLER-HOST>\" -p 5432 -U \"<POOLER-USERNAME>\" -d postgres -v ON_ERROR_STOP=1 -f $chunk.FullName\n")
        mf.write("    if ($LASTEXITCODE -ne 0) {\n")
        mf.write("        Write-Host \"[FAILED] $($chunk.Name) failed with exit code $LASTEXITCODE. Halting.\" -ForegroundColor Red\n")
        mf.write("        break\n")
        mf.write("    }\n")
        mf.write("    Write-Host \"[SUCCESS] $($chunk.Name) committed.\" -ForegroundColor Green\n")
        mf.write("}\n")
        mf.write("```\n\n")
        mf.write("### Post-Import Analytics Materialized View Refresh\n\n")
        mf.write("```sql\n")
        mf.write("REFRESH MATERIALIZED VIEW analytics.representative_summary_mv;\n")
        mf.write("REFRESH MATERIALIZED VIEW analytics.state_summary_mv;\n")
        mf.write("```\n")

    print(f"Manifest created at {MANIFEST_FILE}")

if __name__ == "__main__":
    main()
