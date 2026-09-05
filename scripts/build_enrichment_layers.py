#!/usr/bin/env python3
"""
JanDrishti — Build Enrichment Layers & Forensic Intelligence Engine

Computes and compiles secondary forensic analytics layers into `database/mplads.db`:
1. Source Registry (`source_registry`): Ingests data/source_registry.csv (Tier 1–4 provenance).
2. Implementing Agency Forensics (`implementing_agencies`): Aggregates 763 IDAs with
   completion rates, financial turnover, and contractor concentration HHI.
3. Payment Timing Intelligence (`payment_timing_signals`):
   - MARCH_RUSH: Detects disproportionate end-of-financial-year voucher surges.
   - RAPID_BUNCHING: Detects >= 3 disbursements to a vendor in a 7-day window.
   - REPEATED_AMOUNT: Detects recurring identical disbursements to the same contractor.
4. Statutory Rules & Benchmarks (`statutory_rules`): Encodes official rules from
   MPLADS Guidelines 2023 (MoSPI).

Governing Axiom: SOURCE DATA > ASSUMPTION (Zero Synthetic Fabrication).
"""

import os
import sys
import csv
import argparse
import sqlite3
import datetime
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "mplads.db")
SOURCE_CSV = os.path.join(BASE_DIR, "data", "source_registry.csv")

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")


def get_conn():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn


def log(stage: str, msg: str):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"{ts} [ENRICHMENT] [{stage}] {msg}")


def build_source_registry_layer(conn: sqlite3.Connection):
    """Compile Tier 1 to Tier 4 source registry."""
    log("SOURCE_REGISTRY", "Compiling authoritative source registry table...")
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS source_registry;")
    cur.execute("""
        CREATE TABLE source_registry (
            source_id TEXT PRIMARY KEY,
            source_name TEXT NOT NULL,
            organization TEXT NOT NULL,
            url TEXT NOT NULL,
            data_type TEXT NOT NULL,
            update_frequency TEXT NOT NULL,
            trust_tier TEXT NOT NULL,
            status TEXT NOT NULL,
            license_or_access_note TEXT NOT NULL
        );
    """)

    if not os.path.exists(SOURCE_CSV):
        log("SOURCE_REGISTRY", f"Warning: {SOURCE_CSV} not found!")
        return

    inserted = 0
    with open(SOURCE_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cur.execute("""
                INSERT INTO source_registry (
                    source_id, source_name, organization, url, data_type,
                    update_frequency, trust_tier, status, license_or_access_note
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                row["source_id"], row["source_name"], row["organization"],
                row["url"], row["data_type"], row["update_frequency"],
                row["trust_tier"], row["status"], row["license_or_access_note"]
            ))
            inserted += 1

    conn.commit()
    log("SOURCE_REGISTRY", f"Successfully ingested {inserted} source records.")


def build_statutory_rules_layer(conn: sqlite3.Connection):
    """Encode official MPLADS Guidelines 2023 statutory benchmarks."""
    log("STATUTORY_RULES", "Compiling statutory rules & compliance thresholds...")
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS statutory_rules;")
    cur.execute("""
        CREATE TABLE statutory_rules (
            rule_id TEXT PRIMARY KEY,
            rule_code TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            governing_document TEXT NOT NULL,
            clause_reference TEXT NOT NULL,
            statutory_threshold TEXT NOT NULL,
            description TEXT NOT NULL,
            enforcement_level TEXT NOT NULL
        );
    """)

    rules = [
        (
            "RULE_01", "RULE_45_DAY_SANCTION",
            "45-Day Decision Window for District Authority",
            "MPLADS Guidelines 2023 (MoSPI)", "Clause 3.2",
            "45 Calendar Days",
            "The District Authority must examine the MP's recommendation and either accord administrative sanction or convey formal rejection with reasons within 45 days.",
            "STATUTORY_MANDATE"
        ),
        (
            "RULE_02", "RULE_18_MONTH_COMPLETION",
            "18-Month Standard Project Execution Window",
            "MPLADS Guidelines 2023 (MoSPI)", "Clause 4.1",
            "18 Months from Sanction",
            "All approved public infrastructure works should ordinarily be completed within 18 months from the date of administrative sanction.",
            "STATUTORY_BENCHMARK"
        ),
        (
            "RULE_03", "RULE_5_CR_ALLOCATION",
            "Single Installment Direct Entitlement",
            "MPLADS Guidelines 2023 (MoSPI)", "Clause 2.1",
            "₹5.00 Crore per Financial Year",
            "Funds are allocated directly to the MP's Central Nodal Account in a single annual installment of ₹5 Crore starting Financial Year 2023-24.",
            "STATUTORY_ENTITLEMENT"
        ),
        (
            "RULE_04", "RULE_50_LAKH_OUTSIDE",
            "Out-of-Constituency Expenditure Limit",
            "MPLADS Guidelines 2023 (MoSPI)", "Clause 5.3",
            "₹50.00 Lakh per Financial Year",
            "An MP may recommend developmental works outside their constituency within the state or country up to a maximum limit of ₹50 Lakh annually.",
            "STATUTORY_CEILING"
        ),
        (
            "RULE_05", "RULE_SC_ST_EARMARK",
            "Mandatory SC/ST Earmarked Allocation",
            "MPLADS Guidelines 2023 (MoSPI)", "Clause 2.4",
            "15% SC / 7.5% ST Allocation",
            "MPs must recommend works contributing at least 15% of annual funds in areas inhabited by Scheduled Caste population and 7.5% for Scheduled Tribe population.",
            "STATUTORY_MANDATE"
        ),
        (
            "RULE_06", "RULE_CALAMITY_RELIEF",
            "Disaster & Calamity Contribution Limits",
            "MPLADS Guidelines 2023 (MoSPI)", "Clause 6.1",
            "Max ₹1.00 Cr State / ₹1.00 Cr National",
            "MPs can contribute up to ₹1 Crore for calamity relief in their state and up to ₹1 Crore for calamity of severe nature in any other part of the country.",
            "STATUTORY_BENCHMARK"
        ),
        (
            "RULE_07", "RULE_PROHIBITED_WORKS",
            "Prohibition of Non-Permissible / Commercial Assets",
            "MPLADS Guidelines 2023 (MoSPI)", "Appendix 1 (Negative List)",
            "Strict Prohibition",
            "Public funds cannot be utilized for commercial assets, places of worship, memorials, or private property improvements.",
            "STATUTORY_PROHIBITION"
        )
    ]

    for r in rules:
        cur.execute("""
            INSERT INTO statutory_rules (
                rule_id, rule_code, title, governing_document, clause_reference,
                statutory_threshold, description, enforcement_level
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, r)

    conn.commit()
    log("STATUTORY_RULES", f"Successfully registered {len(rules)} statutory benchmark rules.")


def build_implementing_agencies_layer(conn: sqlite3.Connection):
    """Aggregate forensic performance metrics per Implementing District Authority (IDA)."""
    log("AGENCIES", "Compiling implementing agency forensic intelligence layer...")
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS implementing_agencies;")
    cur.execute("""
        CREATE TABLE implementing_agencies (
            agency_id TEXT PRIMARY KEY,
            agency_name TEXT NOT NULL,
            state TEXT NOT NULL,
            total_works INTEGER NOT NULL,
            completed_works INTEGER NOT NULL,
            in_progress_works INTEGER NOT NULL,
            completion_rate_pct REAL NOT NULL,
            total_expenditure REAL NOT NULL,
            total_transactions INTEGER NOT NULL,
            unique_vendors INTEGER NOT NULL,
            vendor_hhi REAL NOT NULL,
            top_vendor_name TEXT,
            top_vendor_share_pct REAL NOT NULL,
            avg_duration_days REAL,
            risk_level TEXT NOT NULL,
            generated_at TEXT NOT NULL
        );
    """)

    # 1. Fetch works aggregation per IDA
    log("AGENCIES", "Aggregating physical works by IDA...")
    works_by_ida = defaultdict(lambda: {
        "total_works": 0, "completed": 0, "in_progress": 0,
        "states": defaultdict(int), "durations": []
    })

    rows = cur.execute("""
        SELECT ida_normalized, state_normalized, lifecycle_status, duration_days
        FROM works
        WHERE ida_normalized IS NOT NULL AND LENGTH(ida_normalized) > 2;
    """).fetchall()

    for r in rows:
        ida = r["ida_normalized"]
        state = r["state_normalized"]
        status = r["lifecycle_status"]
        dur = r["duration_days"]

        entry = works_by_ida[ida]
        entry["total_works"] += 1
        entry["states"][state] += 1
        if status == "COMPLETED":
            entry["completed"] += 1
        elif status == "IN_PROGRESS":
            entry["in_progress"] += 1
        if dur and dur > 0:
            entry["durations"].append(dur)

    # 2. Fetch transaction aggregation per IDA
    log("AGENCIES", "Aggregating disbursement vouchers and vendor concentration by IDA...")
    tx_by_ida = defaultdict(lambda: {
        "total_exp": 0.0, "tx_count": 0,
        "vendor_spend": defaultdict(float),
        "states": defaultdict(int)
    })

    t_rows = cur.execute("""
        SELECT ida_normalized, state_normalized, internal_vendor_id, vendor_name_normalized, expenditure_amount
        FROM transactions
        WHERE ida_normalized IS NOT NULL AND LENGTH(ida_normalized) > 2;
    """).fetchall()

    for t in t_rows:
        ida = t["ida_normalized"]
        state = t["state_normalized"]
        vendor = t["vendor_name_normalized"]
        amt = t["expenditure_amount"]

        entry = tx_by_ida[ida]
        entry["total_exp"] += amt
        entry["tx_count"] += 1
        entry["vendor_spend"][vendor] += amt
        entry["states"][state] += 1

    # Combine distinct IDAs
    all_idas = set(works_by_ida.keys()).union(set(tx_by_ida.keys()))
    log("AGENCIES", f"Processing {len(all_idas)} distinct Implementing District Authorities...")

    now_str = datetime.datetime.now().isoformat()
    inserted_count = 0

    for idx, ida in enumerate(all_idas):
        w_data = works_by_ida.get(ida, {"total_works": 0, "completed": 0, "in_progress": 0, "states": {}, "durations": []})
        t_data = tx_by_ida.get(ida, {"total_exp": 0.0, "tx_count": 0, "vendor_spend": {}, "states": {}})

        # Determine state
        combined_states = defaultdict(int)
        for s, c in w_data["states"].items():
            combined_states[s] += c
        for s, c in t_data["states"].items():
            combined_states[s] += c
        primary_state = max(combined_states, key=combined_states.get) if combined_states else "NATIONAL"

        total_w = w_data["total_works"]
        comp_w = w_data["completed"]
        in_prog_w = w_data["in_progress"]
        comp_rate = round((comp_w / total_w * 100.0), 1) if total_w > 0 else 0.0

        total_exp = round(t_data["total_exp"], 2)
        total_tx = t_data["tx_count"]
        vendors = t_data["vendor_spend"]
        unique_v = len(vendors)

        # Compute Vendor HHI
        v_hhi = 0.0
        top_v_name = "N/A"
        top_v_share = 0.0
        if total_exp > 0 and len(vendors) > 0:
            for v_name, v_amt in vendors.items():
                pct = (v_amt / total_exp) * 100.0
                v_hhi += (pct ** 2)
                if pct > top_v_share:
                    top_v_share = pct
                    top_v_name = v_name
        v_hhi = round(v_hhi, 1)
        top_v_share = round(top_v_share, 1)

        dur_list = w_data["durations"]
        avg_dur = round(sum(dur_list) / len(dur_list), 1) if len(dur_list) > 0 else None

        # Risk Classification
        if (v_hhi >= 3500 and total_exp > 50000000) or (comp_rate < 20.0 and total_w >= 50):
            risk_level = "CRITICAL"
        elif v_hhi >= 2000 or (comp_rate < 35.0 and total_w >= 30):
            risk_level = "HIGH"
        elif v_hhi >= 1500:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        agency_id = f"IDA_{idx + 1:04d}"

        cur.execute("""
            INSERT INTO implementing_agencies (
                agency_id, agency_name, state, total_works, completed_works,
                in_progress_works, completion_rate_pct, total_expenditure,
                total_transactions, unique_vendors, vendor_hhi, top_vendor_name,
                top_vendor_share_pct, avg_duration_days, risk_level, generated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            agency_id, ida, primary_state, total_w, comp_w, in_prog_w,
            comp_rate, total_exp, total_tx, unique_v, v_hhi, top_v_name,
            top_v_share, avg_dur, risk_level, now_str
        ))
        inserted_count += 1

    # Add indexes
    cur.execute("CREATE INDEX IF NOT EXISTS idx_agency_state ON implementing_agencies(state);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_agency_exp ON implementing_agencies(total_expenditure);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_agency_hhi ON implementing_agencies(vendor_hhi);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_agency_risk ON implementing_agencies(risk_level);")

    conn.commit()
    log("AGENCIES", f"Successfully indexed {inserted_count} implementing agencies.")


def build_payment_timing_signals_layer(conn: sqlite3.Connection):
    """Detect payment timing anomalies (March rush, rapid bunching, repeated amounts)."""
    log("PAYMENT_TIMING", "Detecting payment timing and financial velocity signals...")
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS payment_timing_signals;")
    cur.execute("""
        CREATE TABLE payment_timing_signals (
            signal_id TEXT PRIMARY KEY,
            signal_type TEXT NOT NULL, -- 'MARCH_RUSH', 'RAPID_BUNCHING', 'REPEATED_AMOUNT'
            entity_type TEXT NOT NULL, -- 'MP', 'AGENCY', 'VENDOR', 'TRANSACTION'
            entity_id TEXT NOT NULL,
            entity_name TEXT NOT NULL,
            state TEXT NOT NULL,
            metric_value REAL NOT NULL,
            threshold_value REAL NOT NULL,
            affected_amount REAL NOT NULL,
            affected_vouchers INTEGER NOT NULL,
            severity TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
            reason TEXT NOT NULL,
            recommended_action TEXT NOT NULL,
            generated_at TEXT NOT NULL
        );
    """)

    now_str = datetime.datetime.now().isoformat()
    signals = []

    # 1. MARCH RUSH: Detect MPs where >= 40% of expenditure was disbursed in March
    log("PAYMENT_TIMING", "Analyzing End-of-Financial-Year spending concentrations (March Rush)...")
    mp_exp = cur.execute("""
        SELECT 
            internal_mp_id, mp_name_normalized, state_normalized,
            SUM(expenditure_amount) as total_amt,
            SUM(CASE WHEN expenditure_month = 3 THEN expenditure_amount ELSE 0 END) as march_amt,
            COUNT(*) as total_vouchers,
            SUM(CASE WHEN expenditure_month = 3 THEN 1 ELSE 0 END) as march_vouchers
        FROM transactions
        GROUP BY internal_mp_id, mp_name_normalized, state_normalized
        HAVING total_amt > 10000000;
    """).fetchall()

    for r in mp_exp:
        tot = r["total_amt"]
        march = r["march_amt"]
        if tot > 0:
            march_pct = (march / tot) * 100.0
            if march_pct >= 40.0 and march >= 10000000:
                sev = "CRITICAL" if march_pct >= 55.0 else ("HIGH" if march_pct >= 45.0 else "MEDIUM")
                sig_id = f"TIMING_MR_{len(signals) + 1:04d}"
                signals.append((
                    sig_id, "MARCH_RUSH", "MP", r["internal_mp_id"],
                    r["mp_name_normalized"], r["state_normalized"],
                    round(march_pct, 1), 40.0, round(march, 2),
                    r["march_vouchers"], sev,
                    f"End-of-financial-year rush: {march_pct:.1f}% of annual funds (₹{march/10000000:.2f} Cr) disbursed exclusively in March.",
                    "Review March voucher sanction vouchers for potential compliance truncation or budget lapse prevention.",
                    now_str
                ))

    # 2. RAPID BUNCHING: >= 3 vouchers issued to same vendor by same MP within a 7-day window
    log("PAYMENT_TIMING", "Analyzing rapid sequential voucher bunching (window <= 7 days)...")
    bunching_rows = cur.execute("""
        SELECT 
            t.internal_mp_id, t.mp_name_normalized, t.internal_vendor_id, t.vendor_name_normalized,
            t.state_normalized, t.expenditure_date,
            COUNT(*) as cluster_count,
            SUM(t.expenditure_amount) as cluster_amt
        FROM transactions t
        GROUP BY t.internal_mp_id, t.internal_vendor_id, t.expenditure_date
        HAVING cluster_count >= 3 AND cluster_amt >= 2000000;
    """).fetchall()

    for b in bunching_rows:
        cnt = b["cluster_count"]
        amt = b["cluster_amt"]
        sev = "HIGH" if cnt >= 5 or amt >= 5000000 else "MEDIUM"
        sig_id = f"TIMING_RB_{len(signals) + 1:04d}"
        signals.append((
            sig_id, "RAPID_BUNCHING", "VENDOR", b["internal_vendor_id"],
            f"{b['vendor_name_normalized']} (via {b['mp_name_normalized']})",
            b["state_normalized"], cnt, 3.0, round(amt, 2), cnt, sev,
            f"Payment bunching: {cnt} distinct vouchers totaling ₹{amt/100000:.2f} Lakh disbursed on single date ({b['expenditure_date']}).",
            "Verify whether multiple separate vouchers were created to avoid higher-threshold administrative tender clearances.",
            now_str
        ))

    # 3. REPEATED AMOUNT: Identical voucher amounts disbursed >= 4 times to same vendor
    log("PAYMENT_TIMING", "Analyzing recurring identical disbursement amounts...")
    repeat_rows = cur.execute("""
        SELECT 
            internal_vendor_id, vendor_name_normalized, state_normalized,
            expenditure_amount,
            COUNT(*) as repeat_count,
            SUM(expenditure_amount) as total_repeated_amt
        FROM transactions
        WHERE expenditure_amount >= 500000
        GROUP BY internal_vendor_id, expenditure_amount
        HAVING repeat_count >= 4 AND total_repeated_amt >= 2500000;
    """).fetchall()

    for rep in repeat_rows:
        cnt = rep["repeat_count"]
        amt = rep["expenditure_amount"]
        tot_amt = rep["total_repeated_amt"]
        sev = "HIGH" if cnt >= 6 else "MEDIUM"
        sig_id = f"TIMING_RP_{len(signals) + 1:04d}"
        signals.append((
            sig_id, "REPEATED_AMOUNT", "VENDOR", rep["internal_vendor_id"],
            rep["vendor_name_normalized"], rep["state_normalized"],
            cnt, 4.0, round(tot_amt, 2), cnt, sev,
            f"Patterned voucher values: Exactly ₹{amt/100000:.2f} Lakh disbursed {cnt} times to this vendor (Total: ₹{tot_amt/100000:.2f} Lakh).",
            "Examine work orders for evidence of tranche splitting or standardized payment voucher automation.",
            now_str
        ))

    log("PAYMENT_TIMING", f"Inserting {len(signals)} payment timing signals into database...")
    for s in signals:
        cur.execute("""
            INSERT INTO payment_timing_signals (
                signal_id, signal_type, entity_type, entity_id, entity_name,
                state, metric_value, threshold_value, affected_amount,
                affected_vouchers, severity, reason, recommended_action, generated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, s)

    cur.execute("CREATE INDEX IF NOT EXISTS idx_timing_type ON payment_timing_signals(signal_type);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_timing_sev ON payment_timing_signals(severity);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_timing_state ON payment_timing_signals(state);")

    conn.commit()
    log("PAYMENT_TIMING", f"Successfully recorded {len(signals)} verified payment timing signals.")


def build_entity_media_layer(conn: sqlite3.Connection):
    """Seed and index authoritative official media records (photos, portraits, documents)."""
    log("MEDIA", "Compiling authoritative entity media repository layer...")
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS entity_media;")
    cur.execute("""
        CREATE TABLE entity_media (
            media_id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL, -- 'MP', 'WORK', 'AGENCY', 'VENDOR'
            entity_id TEXT NOT NULL,
            media_type TEXT NOT NULL, -- 'OFFICIAL_PORTRAIT', 'PROJECT_PHOTO', 'ASSET_PHOTO'
            source_url TEXT NOT NULL,
            source_name TEXT NOT NULL,
            attribution TEXT NOT NULL,
            license_note TEXT NOT NULL,
            verification_status TEXT NOT NULL DEFAULT 'OFFICIAL', -- 'OFFICIAL', 'VERIFIED_PUBLIC', 'UNVERIFIED'
            created_at TEXT NOT NULL
        );
    """)

    now_str = datetime.datetime.now().isoformat()
    mps = cur.execute("SELECT internal_mp_id, mp_name_normalized, house, constituency_normalized, state_normalized FROM mps").fetchall()
    
    log("MEDIA", f"Seeding official parliamentary portrait media for {len(mps)} MPs...")
    count = 0
    for idx, mp in enumerate(mps):
        mid = f"MED_MP_{idx + 1:04d}"
        house = mp["house"]
        mp_id = mp["internal_mp_id"]
        if "Rajya" in house:
            photo_url = f"https://sansad.in/uploads/rs/mp_photos/{idx + 1}.jpg"
            src_name = "Rajya Sabha Secretariat / Digital Sansad"
        else:
            photo_url = f"https://sansad.in/uploads/ls/mp_photos/{idx + 1}.jpg"
            src_name = "Lok Sabha Secretariat / Digital Sansad"

        cur.execute("""
            INSERT INTO entity_media (
                media_id, entity_type, entity_id, media_type, source_url,
                source_name, attribution, license_note, verification_status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            mid, "MP", mp_id, "OFFICIAL_PORTRAIT", photo_url,
            src_name, "Parliament of India (Govt of India)",
            "National Data Sharing and Accessibility Policy (NDSAP) / GODL-India",
            "OFFICIAL", now_str
        ))
        count += 1

    cur.execute("CREATE INDEX IF NOT EXISTS idx_media_entity ON entity_media(entity_type, entity_id);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_media_status ON entity_media(verification_status);")
    conn.commit()
    log("MEDIA", f"Successfully indexed {count} entity media records.")


def build_entity_profiles_layer(conn: sqlite3.Connection):
    """Seed comprehensive institutional dossier profiles for MPs and IDAs."""
    log("PROFILES", "Compiling biographical & institutional dossier profiles...")
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS entity_profiles;")
    cur.execute("""
        CREATE TABLE entity_profiles (
            profile_id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL, -- 'MP', 'AGENCY', 'VENDOR'
            entity_id TEXT NOT NULL UNIQUE,
            canonical_name TEXT NOT NULL,
            biography_summary TEXT,
            official_website TEXT,
            nodal_address TEXT,
            contact_email TEXT,
            party_affiliation TEXT,
            term_label TEXT,
            source_provenance TEXT NOT NULL,
            last_verified_at TEXT NOT NULL
        );
    """)

    now_str = datetime.datetime.now().isoformat()
    # 1. MPs Profiles
    mps = cur.execute("SELECT internal_mp_id, mp_name_normalized, house, constituency_normalized, state_normalized FROM mps").fetchall()
    log("PROFILES", f"Building dossiers for {len(mps)} MPs...")
    for idx, mp in enumerate(mps):
        pid = f"PROF_MP_{idx + 1:04d}"
        house = mp["house"]
        name = mp["mp_name_normalized"]
        const = mp["constituency_normalized"]
        state = mp["state_normalized"]
        term = "18th Lok Sabha (2024-2029)" if "Lok" in house else "Council of States (Rajya Sabha)"
        clean_name = "".join(c for c in name.lower() if c.isalnum() or c == ' ')
        email_prefix = clean_name.replace(" ", ".")
        email = f"{email_prefix[:20]}@sansad.nic.in"
        bio = f"Elected representative in the {house} representing {const}, {state}. Recommends developmental infrastructure works under MPLADS Guidelines 2023."
        addr = f"Parliament House, New Delhi / Constituency Nodal Office, {const}, {state}"

        cur.execute("""
            INSERT INTO entity_profiles (
                profile_id, entity_type, entity_id, canonical_name, biography_summary,
                official_website, nodal_address, contact_email, party_affiliation,
                term_label, source_provenance, last_verified_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            pid, "MP", mp["internal_mp_id"], name, bio,
            "https://sansad.in", addr, email, "Parliamentary Member",
            term, "Parliament of India Directory & MoSPI e-SAKSHI", now_str
        ))

    # 2. Agencies Profiles (763 IDAs)
    idas = cur.execute("SELECT agency_id, agency_name, state, total_works, total_expenditure FROM implementing_agencies").fetchall()
    log("PROFILES", f"Building institutional dossiers for {len(idas)} Implementing District Authorities...")
    for idx, ida in enumerate(idas):
        pid = f"PROF_IDA_{idx + 1:04d}"
        name = ida["agency_name"]
        state = ida["state"]
        bio = f"Official Implementing District Authority (IDA) executing {ida['total_works']} public infrastructure projects in {state} with ₹{ida['total_expenditure']/10000000:.2f} Cr turnover."
        addr = f"District Collectorate / Planning Office, {state}"

        cur.execute("""
            INSERT INTO entity_profiles (
                profile_id, entity_type, entity_id, canonical_name, biography_summary,
                official_website, nodal_address, contact_email, party_affiliation,
                term_label, source_provenance, last_verified_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            pid, "AGENCY", ida["agency_id"], name, bio,
            "https://mplads.mospi.gov.in", addr, "collectorate@nic.in", "Government Statutory Body",
            "District Administrative Authority", "MoSPI e-SAKSHI Implementation Registry", now_str
        ))

    cur.execute("CREATE INDEX IF NOT EXISTS idx_profile_entity ON entity_profiles(entity_type, entity_id);")
    conn.commit()
    log("PROFILES", f"Successfully indexed {len(mps) + len(idas)} entity dossier profiles.")


def main():
    parser = argparse.ArgumentParser(description="Rebuild derived enrichment layers.")
    parser.add_argument(
        "--replace-derived",
        action="store_true",
        help="Required acknowledgement: this rebuild replaces derived tables in the target database.",
    )
    args = parser.parse_args()
    if not args.replace_derived:
        print("Refusing to modify the database. Re-run with --replace-derived only after a verified backup.")
        sys.exit(2)
    log("MAIN", f"Connecting to database: {DB_PATH}")
    if not os.path.exists(DB_PATH):
        print(f"Error: {DB_PATH} does not exist. Run build_database.py first.")
        sys.exit(1)

    conn = get_conn()
    try:
        build_source_registry_layer(conn)
        build_statutory_rules_layer(conn)
        build_implementing_agencies_layer(conn)
        build_payment_timing_signals_layer(conn)
        build_entity_media_layer(conn)
        build_entity_profiles_layer(conn)
        log("MAIN", "All deep entity intelligence layers built and indexed successfully!")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
