"""
Jandrishti Phase 1: Machine-Readable Data Dictionary Generator
Generates comprehensive docs/data-dictionary.json and docs/data-dictionary.md
"""

import json
import os

os.makedirs('docs', exist_ok=True)

DATA_DICTIONARY = {
    "version": "1.0.0",
    "target_platform": "PostgreSQL 16 + PostGIS 3.4 + pgvector 0.7 (Supabase Enterprise)",
    "schemas": {
        "raw": "Immutable source dumps with SHA-256 payload hashes",
        "public": "Canonical core 3NF domain models",
        "gov": "Civic governance, provenance, case management, and append-only audit trail",
        "ml": "Outlier detection scores, model runs, and vector embeddings",
        "analytics": "Safe pre-aggregated materialized views for instant dashboard queries"
    },
    "tables": [
        # --- RAW SCHEMA ---
        {
            "schema": "raw",
            "table": "mospi_works_dump",
            "classification": "RAW",
            "description": "Raw unparsed MoSPI recommended and completed works records",
            "columns": [
                {"name": "raw_id", "type": "uuid", "pk": True, "nullable": False, "default": "gen_random_uuid()", "classification": "RAW", "description": "Surrogate primary key"},
                {"name": "source_filename", "type": "text", "pk": False, "nullable": False, "classification": "RAW", "description": "Origin file name"},
                {"name": "payload", "type": "jsonb", "pk": False, "nullable": False, "classification": "RAW", "description": "Verbatim raw row dictionary"},
                {"name": "payload_hash", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "RAW", "description": "SHA-256 hash for deduplication"},
                {"name": "ingested_at", "type": "timestamptz", "pk": False, "nullable": False, "default": "clock_timestamp()", "classification": "RAW", "description": "Ingestion timestamp"},
                {"name": "processed_status", "type": "text", "pk": False, "nullable": False, "default": "'PENDING'", "classification": "RAW", "description": "Validation status"}
            ]
        },
        {
            "schema": "raw",
            "table": "mospi_transactions_dump",
            "classification": "RAW",
            "description": "Raw unparsed MoSPI treasury disbursement vouchers",
            "columns": [
                {"name": "raw_id", "type": "uuid", "pk": True, "nullable": False, "default": "gen_random_uuid()", "classification": "RAW", "description": "Surrogate primary key"},
                {"name": "source_filename", "type": "text", "pk": False, "nullable": False, "classification": "RAW", "description": "Origin voucher file"},
                {"name": "payload", "type": "jsonb", "pk": False, "nullable": False, "classification": "RAW", "description": "Verbatim voucher payload"},
                {"name": "payload_hash", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "RAW", "description": "SHA-256 hash for deduplication"},
                {"name": "ingested_at", "type": "timestamptz", "pk": False, "nullable": False, "default": "clock_timestamp()", "classification": "RAW", "description": "Ingestion timestamp"},
                {"name": "processed_status", "type": "text", "pk": False, "nullable": False, "default": "'PENDING'", "classification": "RAW", "description": "Validation status"}
            ]
        },
        {
            "schema": "raw",
            "table": "sansad_members_dump",
            "classification": "RAW",
            "description": "Raw JSON responses from Sansad.in official member directory API",
            "columns": [
                {"name": "raw_id", "type": "uuid", "pk": True, "nullable": False, "default": "gen_random_uuid()", "classification": "RAW", "description": "Surrogate primary key"},
                {"name": "mpsno", "type": "integer", "pk": False, "nullable": True, "classification": "RAW", "description": "Official Sansad MP identifier"},
                {"name": "payload", "type": "jsonb", "pk": False, "nullable": False, "classification": "RAW", "description": "Complete JSON dictionary from Sansad API"},
                {"name": "payload_hash", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "RAW", "description": "SHA-256 hash"},
                {"name": "ingested_at", "type": "timestamptz", "pk": False, "nullable": False, "default": "clock_timestamp()", "classification": "RAW", "description": "Ingestion timestamp"}
            ]
        },
        # --- CANONICAL CORE (PUBLIC) ---
        {
            "schema": "public",
            "table": "states",
            "classification": "NORMALIZED",
            "description": "Canonical 28 States and 8 Union Territories of India",
            "columns": [
                {"name": "state_id", "type": "smallint", "pk": True, "nullable": False, "classification": "NORMALIZED", "description": "Canonical state number (1–36)"},
                {"name": "lgd_state_code", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "NORMALIZED", "description": "LGD standard state code"},
                {"name": "name_en", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "NORMALIZED", "description": "Official English state name"},
                {"name": "state_type", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "STATE or UNION_TERRITORY"}
            ]
        },
        {
            "schema": "public",
            "table": "districts",
            "classification": "NORMALIZED",
            "description": "Local Government Directory 763 Standardized Districts",
            "columns": [
                {"name": "district_id", "type": "integer", "pk": True, "nullable": False, "classification": "NORMALIZED", "description": "LGD district code (e.g. 101)"},
                {"name": "state_id", "type": "smallint", "pk": False, "nullable": False, "fk": "public.states(state_id)", "classification": "NORMALIZED", "description": "Parent state ID"},
                {"name": "district_name", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "Official district name"},
                {"name": "centroid", "type": "geometry(Point, 4326)", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Spatial centroid point"}
            ]
        },
        {
            "schema": "public",
            "table": "constituencies",
            "classification": "NORMALIZED",
            "description": "543 Lok Sabha Parliamentary Constituencies",
            "columns": [
                {"name": "constituency_id", "type": "integer", "pk": True, "nullable": False, "classification": "NORMALIZED", "description": "Canonical constituency number"},
                {"name": "state_id", "type": "smallint", "pk": False, "nullable": False, "fk": "public.states(state_id)", "classification": "NORMALIZED", "description": "State reference"},
                {"name": "constituency_name", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "Official constituency name"}
            ]
        },
        {
            "schema": "public",
            "table": "political_parties",
            "classification": "NORMALIZED",
            "description": "Registered Political Parties",
            "columns": [
                {"name": "party_id", "type": "smallint", "pk": True, "nullable": False, "classification": "NORMALIZED", "description": "Party primary identifier"},
                {"name": "party_abbreviation", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "NORMALIZED", "description": "Party acronym (BJP, INC, etc.)"},
                {"name": "party_full_name", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "Full party title"}
            ]
        },
        {
            "schema": "public",
            "table": "representatives",
            "classification": "NORMALIZED",
            "description": "Parliamentarians of India (778 Lok Sabha & Rajya Sabha MPs)",
            "columns": [
                {"name": "representative_id", "type": "uuid", "pk": True, "nullable": False, "default": "gen_random_uuid()", "classification": "NORMALIZED", "description": "Surrogate primary key"},
                {"name": "legacy_internal_id", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "NORMALIZED", "description": "Legacy ID (e.g. INTERNAL_MP_001)"},
                {"name": "canonical_name", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "Standardized representative name"},
                {"name": "current_party_id", "type": "smallint", "pk": False, "nullable": True, "fk": "public.political_parties(party_id)", "classification": "NORMALIZED", "description": "Party foreign key"},
                {"name": "gender", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Gender"},
                {"name": "date_of_birth", "type": "date", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "DOB"},
                {"name": "profession", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Profession"},
                {"name": "official_email", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Official email"},
                {"name": "personal_email", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Personal email"},
                {"name": "contact_phone", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Contact telephone/mobile"},
                {"name": "delhi_address", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Delhi residence address"},
                {"name": "permanent_address", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Constituency home address"},
                {"name": "photo_source_url", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Official portrait image URL"},
                {"name": "sansad_mp_code", "type": "integer", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Official Sansad ID"}
            ]
        },
        {
            "schema": "public",
            "table": "infrastructure_works",
            "classification": "SOURCE_OF_TRUTH",
            "description": "102,437 Public Physical Works sanctioned under MPLADS",
            "columns": [
                {"name": "work_id", "type": "bigint", "pk": True, "nullable": False, "classification": "SOURCE_OF_TRUTH", "description": "Canonical work numerical ID"},
                {"name": "representative_id", "type": "uuid", "pk": False, "nullable": False, "fk": "public.representatives(representative_id)", "classification": "NORMALIZED", "description": "Recommending MP"},
                {"name": "category_code", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "Standardized category (ROADS, HEALTH, etc.)"},
                {"name": "description_clean", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "Cleaned project scope"},
                {"name": "lifecycle_status", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "RECOMMENDED, SANCTIONED, IN_PROGRESS, COMPLETED"},
                {"name": "recommended_amount", "type": "numeric(18,2)", "pk": False, "nullable": True, "classification": "SOURCE_OF_TRUTH", "description": "Cost recommended by MP (₹)"},
                {"name": "sanctioned_amount", "type": "numeric(18,2)", "pk": False, "nullable": True, "classification": "SOURCE_OF_TRUTH", "description": "Legally sanctioned budget (₹)"},
                {"name": "final_disbursed_amount", "type": "numeric(18,2)", "pk": False, "nullable": True, "classification": "SOURCE_OF_TRUTH", "description": "Final recorded outlay (₹)"},
                {"name": "location_point", "type": "geometry(Point, 4326)", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "PostGIS coordinates"},
                {"name": "village_name", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Village / locality"},
                {"name": "gram_panchayat", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Gram Panchayat"},
                {"name": "block_name", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Block / Tehsil"},
                {"name": "assigned_contractor_name", "type": "text", "pk": False, "nullable": True, "classification": "NORMALIZED", "description": "Executing contractor name"}
            ]
        },
        {
            "schema": "public",
            "table": "treasury_vouchers",
            "classification": "SOURCE_OF_TRUTH",
            "description": "82,296 Line-Item Treasury Disbursement Vouchers",
            "columns": [
                {"name": "voucher_id", "type": "uuid", "pk": True, "nullable": False, "default": "gen_random_uuid()", "classification": "NORMALIZED", "description": "Surrogate primary key"},
                {"name": "legacy_transaction_id", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "SOURCE_OF_TRUTH", "description": "Legacy voucher code (e.g. TXN_000001)"},
                {"name": "representative_id", "type": "uuid", "pk": False, "nullable": False, "fk": "public.representatives(representative_id)", "classification": "NORMALIZED", "description": "Representative reference"},
                {"name": "work_id", "type": "bigint", "pk": False, "nullable": True, "fk": "public.infrastructure_works(work_id)", "classification": "NORMALIZED", "description": "Nullable FK for unlinked vouchers"},
                {"name": "disbursement_amount", "type": "numeric(18,2)", "pk": False, "nullable": False, "classification": "SOURCE_OF_TRUTH", "description": "Payment amount (₹)"},
                {"name": "expenditure_date", "type": "date", "pk": False, "nullable": True, "classification": "SOURCE_OF_TRUTH", "description": "Treasury release date"},
                {"name": "payment_status", "type": "text", "pk": False, "nullable": False, "classification": "SOURCE_OF_TRUTH", "description": "PAYMENT_SUCCESS / PAYMENT_PENDING"},
                {"name": "is_march_rush", "type": "boolean", "pk": False, "nullable": False, "default": "false", "classification": "DERIVED", "description": "March rush flag"}
            ]
        },
        {
            "schema": "public",
            "table": "contractors",
            "classification": "NORMALIZED",
            "description": "22,377 Contractors / Vendors executing public works",
            "columns": [
                {"name": "contractor_id", "type": "uuid", "pk": True, "nullable": False, "default": "gen_random_uuid()", "classification": "NORMALIZED", "description": "Surrogate primary key"},
                {"name": "legacy_vendor_id", "type": "text", "pk": False, "nullable": False, "unique": True, "classification": "NORMALIZED", "description": "Legacy vendor ID"},
                {"name": "trade_name_normalized", "type": "text", "pk": False, "nullable": False, "classification": "NORMALIZED", "description": "Cleaned trade name"},
                {"name": "state_id", "type": "smallint", "pk": False, "nullable": True, "fk": "public.states(state_id)", "classification": "NORMALIZED", "description": "Operating state"},
                {"name": "hhi_score", "type": "numeric(8,2)", "pk": False, "nullable": False, "default": "0.0", "classification": "DERIVED", "description": "HHI concentration score"},
                {"name": "risk_level", "type": "text", "pk": False, "nullable": False, "default": "'LOW'", "classification": "ML_OUTPUT", "description": "Risk category"}
            ]
        },
        # --- GOVERNANCE SCHEMA ---
        {
            "schema": "gov",
            "table": "review_cases",
            "classification": "GOVERNANCE",
            "description": "Administrative Review Cases with Supabase Auth Attribution",
            "columns": [
                {"name": "case_id", "type": "text", "pk": True, "nullable": False, "classification": "GOVERNANCE", "description": "Unique case code (CASE_YYYYMMDD_XXX)"},
                {"name": "entity_type", "type": "text", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "WORK, REPRESENTATIVE, CONTRACTOR, AGENCY"},
                {"name": "entity_id", "type": "text", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "Target entity ID"},
                {"name": "title", "type": "text", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "Case title"},
                {"name": "severity", "type": "text", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "CRITICAL, HIGH, MEDIUM, LOW"},
                {"name": "risk_score", "type": "numeric(5,2)", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "Multi-factor risk score"},
                {"name": "status", "type": "text", "pk": False, "nullable": False, "default": "'OPEN'", "classification": "GOVERNANCE", "description": "Case status"},
                {"name": "assigned_to", "type": "text", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "Assigned office"},
                {"name": "created_by_user_id", "type": "uuid", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "Supabase Auth user ID"}
            ]
        },
        {
            "schema": "gov",
            "table": "audit_trail",
            "classification": "GOVERNANCE",
            "description": "Append-Only Immutable Audit Log for Governance Operations",
            "columns": [
                {"name": "audit_id", "type": "bigserial", "pk": True, "nullable": False, "classification": "GOVERNANCE", "description": "Monotonic primary key"},
                {"name": "case_id", "type": "text", "pk": False, "nullable": False, "fk": "gov.review_cases(case_id)", "classification": "GOVERNANCE", "description": "Referenced case"},
                {"name": "action", "type": "text", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "Action taken"},
                {"name": "actor_user_id", "type": "uuid", "pk": False, "nullable": False, "classification": "GOVERNANCE", "description": "Authenticated user ID"},
                {"name": "old_status", "type": "text", "pk": False, "nullable": True, "classification": "GOVERNANCE", "description": "Previous state"},
                {"name": "new_status", "type": "text", "pk": False, "nullable": True, "classification": "GOVERNANCE", "description": "Target state"},
                {"name": "notes", "type": "text", "pk": False, "nullable": True, "classification": "GOVERNANCE", "description": "Auditor narrative notes"},
                {"name": "timestamp", "type": "timestamptz", "pk": False, "nullable": False, "default": "clock_timestamp()", "classification": "GOVERNANCE", "description": "Immutable event timestamp"}
            ]
        },
        # --- ML SCHEMA ---
        {
            "schema": "ml",
            "table": "anomaly_signals",
            "classification": "ML_OUTPUT",
            "description": "1,831 Objective Empirical Outliers Scored via Robust MAD",
            "columns": [
                {"name": "signal_id", "type": "uuid", "pk": True, "nullable": False, "default": "gen_random_uuid()", "classification": "ML_OUTPUT", "description": "Primary key"},
                {"name": "entity_type", "type": "text", "pk": False, "nullable": False, "classification": "ML_OUTPUT", "description": "Entity classification"},
                {"name": "entity_id", "type": "text", "pk": False, "nullable": False, "classification": "ML_OUTPUT", "description": "Entity foreign ID"},
                {"name": "anomaly_type", "type": "text", "pk": False, "nullable": False, "classification": "ML_OUTPUT", "description": "Flag code"},
                {"name": "severity", "type": "text", "pk": False, "nullable": False, "classification": "ML_OUTPUT", "description": "CRITICAL, HIGH, MEDIUM, LOW"},
                {"name": "anomaly_score", "type": "numeric(6,2)", "pk": False, "nullable": False, "classification": "ML_OUTPUT", "description": "Robust MAD score"},
                {"name": "reason", "type": "text", "pk": False, "nullable": False, "classification": "ML_OUTPUT", "description": "Explainable text"},
                {"name": "statutory_citation", "type": "text", "pk": False, "nullable": True, "classification": "ML_OUTPUT", "description": "MPLADS clause reference"}
            ]
        },
        {
            "schema": "ml",
            "table": "work_embeddings",
            "classification": "ML_OUTPUT",
            "description": "pgvector 384-dimensional dense semantic vectors (all-MiniLM-L6-v2)",
            "columns": [
                {"name": "work_id", "type": "bigint", "pk": True, "nullable": False, "fk": "public.infrastructure_works(work_id)", "classification": "ML_OUTPUT", "description": "Work reference"},
                {"name": "embedding_model", "type": "text", "pk": False, "nullable": False, "classification": "ML_OUTPUT", "description": "Model identifier"},
                {"name": "embedding_vector", "type": "vector(384)", "pk": False, "nullable": False, "classification": "ML_OUTPUT", "description": "pgvector dense embedding"},
                {"name": "updated_at", "type": "timestamptz", "pk": False, "nullable": False, "default": "clock_timestamp()", "classification": "ML_OUTPUT", "description": "Generation timestamp"}
            ]
        }
    ]
}

# Write JSON data dictionary
with open('docs/data-dictionary.json', 'w', encoding='utf-8') as f:
    json.dump(DATA_DICTIONARY, f, indent=2)

# Write Markdown data dictionary
md_content = ["# JANDRISHTI PRODUCTION DATA DICTIONARY\n\n"]
md_content.append(f"**Target Engine:** {DATA_DICTIONARY['target_platform']}\n\n")
md_content.append("## Schema Hierarchy\n")
for s, d in DATA_DICTIONARY['schemas'].items():
    md_content.append(f"- **`{s}`**: {d}\n")
md_content.append("\n---\n\n## Table Specifications\n")

for tbl in DATA_DICTIONARY['tables']:
    md_content.append(f"### `{tbl['schema']}.{tbl['table']}`\n")
    md_content.append(f"*{tbl['description']}* (Classification: **`{tbl['classification']}`**)\n\n")
    md_content.append("| Column | PostgreSQL Type | Nullable | PK | FK | Classification | Description |\n")
    md_content.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n")
    for c in tbl['columns']:
        md_content.append(f"| `{c['name']}` | `{c['type']}` | {'No' if not c.get('nullable', True) else 'Yes'} | {'Yes' if c.get('pk') else 'No'} | `{c.get('fk', '-')}` | `{c.get('classification', '-')}` | {c.get('description', '')} |\n")
    md_content.append("\n")

with open('docs/data-dictionary.md', 'w', encoding='utf-8') as f:
    f.writelines(md_content)

print("Generated docs/data-dictionary.json and docs/data-dictionary.md successfully.")
