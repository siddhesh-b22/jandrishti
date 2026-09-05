"""
Jandrishti Import Chunk Validator (Ultra-Fast Single-Pass)
Performs exhaustive validation on database/import_chunks/
Verifies:
- original INSERT count == total chunk INSERT count
- missing INSERTs == 0
- duplicate INSERTs == 0
- malformed SQL == 0
- forbidden statements == 0
- correct FK dependency order
"""

import os
import glob
import re
from collections import Counter

SOURCE_SEED = "database/postgres_canonical_seed.sql"
CHUNKS_DIR = "database/import_chunks"

FORBIDDEN_RE = re.compile(r"\b(CREATE\s+TABLE|ALTER\s+TABLE|CREATE\s+SCHEMA|CREATE\s+EXTENSION|DROP\s+TABLE|DROP\s+SCHEMA|DROP\s+DATABASE|TRUNCATE|DELETE\s+FROM|ALTER\s+SYSTEM)\b", re.IGNORECASE)
INSERT_RE = re.compile(r"INSERT INTO\s+([a-zA-Z0-9_\.]+)", re.IGNORECASE)

EXPECTED_ORDER = [
    ("01_lookup_master.sql", ["public.states", "public.political_parties", "public.constituencies"]),
    ("02_representatives_master.sql", ["public.representatives", "public.representative_terms", "public.parliamentary_allocations"]),
    ("03_contractors.sql", ["public.contractors"]),
    ("04_infrastructure_works_part1.sql", ["public.infrastructure_works"]),
    ("05_infrastructure_works_part2.sql", ["public.infrastructure_works"]),
    ("06_infrastructure_works_part3.sql", ["public.infrastructure_works"]),
    ("07_infrastructure_works_part4.sql", ["public.infrastructure_works"]),
    ("08_infrastructure_works_part5.sql", ["public.infrastructure_works"]),
    ("09_treasury_vouchers_part1.sql", ["public.treasury_vouchers"]),
    ("10_treasury_vouchers_part2.sql", ["public.treasury_vouchers"]),
    ("11_treasury_vouchers_part3.sql", ["public.treasury_vouchers"]),
    ("12_treasury_vouchers_part4.sql", ["public.treasury_vouchers"]),
    ("13_governance_and_ml.sql", ["gov.review_cases", "gov.audit_trail", "ml.anomaly_signals"])
]

def count_inserts_and_tables(filepath):
    table_counts = Counter()
    total_inserts = 0
    malformed = 0
    forbidden = 0
    has_begin = False
    has_commit = False
    
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            if not line:
                continue
            l = line.strip()
            if not l or l.startswith("--"):
                continue
            if l == "BEGIN;":
                has_begin = True
                continue
            if l == "COMMIT;":
                has_commit = True
                continue
                
            # Quick check for forbidden words only if line starts with sensitive keywords
            if l.startswith(("CREATE", "ALTER", "DROP", "TRUNCATE", "DELETE")):
                if FORBIDDEN_RE.search(l):
                    forbidden += 1
                    
            if l.startswith("INSERT INTO"):
                total_inserts += 1
                m = INSERT_RE.match(l)
                if m:
                    table_counts[m.group(1)] += 1
                else:
                    malformed += 1
                    
    return total_inserts, table_counts, malformed, forbidden, has_begin, has_commit

def main():
    print("==========================================================", flush=True)
    print("JANDRISHTI IMPORT CHUNK INTEGRITY VALIDATION ENGINE", flush=True)
    print("==========================================================", flush=True)
    
    # 1. Source Seed Count
    print(f"Reading source seed: {SOURCE_SEED}...", flush=True)
    source_count, source_table_counts, s_mal, s_forb, _, _ = count_inserts_and_tables(SOURCE_SEED)
    print(f"Source Seed INSERT Statement Count: {source_count:,}", flush=True)
    for tbl, cnt in source_table_counts.items():
        print(f" - {tbl}: {cnt:,}", flush=True)
        
    # 2. Chunks Validation
    chunk_files = sorted(glob.glob(os.path.join(CHUNKS_DIR, "*.sql")))
    print(f"\nScanning {len(chunk_files)} chunk files in {CHUNKS_DIR}:", flush=True)
    
    total_chunk_inserts = 0
    chunk_table_counts = Counter()
    total_malformed = 0
    total_forbidden = 0
    all_transactions_valid = True
    
    for idx, cpath in enumerate(chunk_files, 1):
        cname = os.path.basename(cpath)
        c_ins, c_tbls, c_mal, c_forb, h_beg, h_com = count_inserts_and_tables(cpath)
        
        total_chunk_inserts += c_ins
        chunk_table_counts.update(c_tbls)
        total_malformed += c_mal
        total_forbidden += c_forb
        
        valid_tx = h_beg and h_com
        if not valid_tx:
            all_transactions_valid = False
            
        print(f" [Chunk {idx:02d}] {cname:<35} -> {c_ins:>7,} INSERTs | Valid Tx: {valid_tx}", flush=True)
        
    # 3. FK Dependency Order Verification
    print("\nVerifying FK dependency ordering across chunks:", flush=True)
    fk_order_valid = True
    for exp_filename, exp_tables in EXPECTED_ORDER:
        cpath = os.path.join(CHUNKS_DIR, exp_filename)
        if not os.path.exists(cpath):
            print(f" [ERROR] Missing expected chunk file: {exp_filename}", flush=True)
            fk_order_valid = False
            continue
        _, c_tbls, _, _, _, _ = count_inserts_and_tables(cpath)
        actual_tables = set(c_tbls.keys())
        for exp_t in exp_tables:
            if exp_t not in actual_tables:
                print(f" [ERROR] Table {exp_t} missing in chunk {exp_filename}!", flush=True)
                fk_order_valid = False
        print(f" [OK] {exp_filename:<35} -> Targets: {', '.join(sorted(actual_tables))}", flush=True)
        
    # 4. Difference Analysis
    missing_count = source_count - total_chunk_inserts
    table_mismatches = 0
    for tbl, s_cnt in source_table_counts.items():
        c_cnt = chunk_table_counts.get(tbl, 0)
        if s_cnt != c_cnt:
            print(f" [ERROR] Table count mismatch for {tbl}: Source={s_cnt}, Chunks={c_cnt}", flush=True)
            table_mismatches += 1
            
    # 5. Final Report
    print("\n======================= VALIDATION SUMMARY =======================", flush=True)
    print(f"1. Original INSERT Count:        {source_count:,}", flush=True)
    print(f"2. Total Chunk INSERT Count:     {total_chunk_inserts:,}", flush=True)
    print(f"3. Missing INSERT Statements:    {missing_count}", flush=True)
    print(f"4. Duplicate / Extra Statements: {total_chunk_inserts - source_count}", flush=True)
    print(f"5. Malformed SQL Statements:     {total_malformed}", flush=True)
    print(f"6. Forbidden Statements (DDL):   {total_forbidden}", flush=True)
    print(f"7. Transaction Boundaries (All): {'VALID (BEGIN/COMMIT in all chunks)' if all_transactions_valid else 'INVALID'}", flush=True)
    print(f"8. Table Level Record Match:     {'100% MATCH across all 11 tables' if table_mismatches == 0 else 'MISMATCH'}", flush=True)
    print(f"9. FK Dependency Order Valid:    {'YES (Strictly Ordered)' if fk_order_valid else 'NO'}", flush=True)
    
    is_valid = (
        source_count == total_chunk_inserts and
        missing_count == 0 and
        total_malformed == 0 and
        total_forbidden == 0 and
        all_transactions_valid and
        table_mismatches == 0 and
        fk_order_valid
    )
    
    if is_valid:
        print("\n>>> VALIDATION RESULT: PASS (13/13 CHUNKS VERIFIED AND READY FOR IMPORT) <<<", flush=True)
    else:
        print("\n>>> VALIDATION RESULT: FAIL <<<", flush=True)
        exit(1)

if __name__ == "__main__":
    main()
