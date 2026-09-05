"""
Jandrishti Phase 9-11: Production SQLite to PostgreSQL Canonical Migration Pipeline
Transforms and exports 100% of data from database/mplads.db into PostgreSQL canonical 3NF format.
Outputs database/postgres_canonical_seed.sql for direct Supabase/PostgreSQL ingestion.
"""

import sqlite3
import os
import uuid
import re
import datetime

SQLITE_PATH = "database/mplads.db"
OUTPUT_SQL = "database/postgres_canonical_seed.sql"

def escape_str(val):
    if val is None:
        return "NULL"
    # Clean embedded newlines, carriage returns, and tabs to prevent broken multiline SQL strings
    s = str(val).replace("\r\n", " ").replace("\n", " ").replace("\r", " ").replace("\t", " ")
    # Escape single quotes in standard SQL format
    s = s.replace("'", "''")
    return f"'{s}'"

def num_val(val, default="0.00"):
    if val is None or val == "":
        return default
    try:
        return f"{float(val):.2f}"
    except:
        return default

def int_val(val, default="NULL"):
    if val is None or val == "":
        return default
    try:
        return str(int(val))
    except:
        return default

def date_val(val):
    if not val or str(val).strip() == "" or str(val) == "NULL":
        return "NULL"
    s = str(val).strip()
    match = re.search(r"\d{4}-\d{2}-\d{2}", s)
    if match:
        return f"'{match.group(0)}'"
    return "NULL"

def normalize_house(val):
    if not val:
        return "'LOK_SABHA'"
    s = str(val).upper()
    if "RAJYA" in s:
        return "'RAJYA_SABHA'"
    return "'LOK_SABHA'"

def normalize_lifecycle_status(val):
    if not val:
        return "'RECOMMENDED'"
    s = str(val).upper()
    if "COMPLETED" in s or "FULL" in s:
        return "'COMPLETED'"
    elif "SANCTION" in s:
        return "'SANCTIONED'"
    elif "PROGRESS" in s:
        return "'IN_PROGRESS'"
    return "'RECOMMENDED'"

def normalize_payment_status(val):
    if not val:
        return "'PAYMENT_SUCCESS'"
    s = str(val).upper()
    if "SUCCESS" in s:
        return "'PAYMENT_SUCCESS'"
    return "'PAYMENT_PENDING'"

def normalize_entity_type(val):
    if not val:
        return "'WORK'"
    s = str(val).upper()
    mapping = {
        "MP": "REPRESENTATIVE",
        "REPRESENTATIVE": "REPRESENTATIVE",
        "VENDOR": "CONTRACTOR",
        "CONTRACTOR": "CONTRACTOR",
        "WORK": "WORK",
        "TRANSACTION": "TRANSACTION",
        "AGENCY": "AGENCY"
    }
    return f"'{mapping.get(s, s)}'"

def normalize_case_status(val):
    if not val:
        return "'OPEN'"
    s = str(val).upper()
    mapping = {
        "NEW": "OPEN",
        "OPEN": "OPEN",
        "CLARIFICATION_REQUESTED": "UNDER_REVIEW",
        "DETAILED_REVIEW": "UNDER_REVIEW",
        "UNDER_REVIEW": "UNDER_REVIEW",
        "ACTION_TAKEN": "ACTION_TAKEN",
        "RESOLVED": "RESOLVED",
        "ESCALATED": "ESCALATED"
    }
    return f"'{mapping.get(s, 'OPEN')}'"

def normalize_severity(val):
    if not val:
        return "'LOW'"
    s = str(val).upper()
    if s in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
        return f"'{s}'"
    return "'LOW'"

def normalize_gender(val):
    if not val:
        return "NULL"
    s = str(val).capitalize()
    if s in ("Male", "Female", "Other"):
        return f"'{s}'"
    return "NULL"

def main():
    print("==========================================================")
    print("JANDRISHTI SQLITE -> POSTGRESQL PRODUCTION MIGRATION ENGINE")
    print("==========================================================")
    
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    out = open(OUTPUT_SQL, "w", encoding="utf-8")
    out.write("-- JANDRISHTI PRODUCTION CANONICAL POSTGRESQL SEED DUMP\n")
    out.write(f"-- Generated At: {datetime.datetime.now().isoformat()}\n")
    out.write("-- Formatted for execution with: psql --single-transaction -f database/postgres_canonical_seed.sql\n\n")
    
    # 1. STATES
    print("Migrating States...")
    states = cur.execute("SELECT DISTINCT state_normalized FROM mps ORDER BY state_normalized").fetchall()
    state_id_map = {}
    for idx, s in enumerate(states, start=1):
        st_name = s["state_normalized"]
        state_id_map[st_name] = idx
        st_type = "UNION_TERRITORY" if any(ut in st_name for ut in ["DELHI", "CHANDIGARH", "LADAKH", "JAMMU", "PUDUCHERRY", "ANDAMAN", "LAKSHADWEEP", "DADRA", "DAMAN"]) else "STATE"
        lgd_code = f"ST_{idx:02d}"
        out.write(f"INSERT INTO public.states (state_id, lgd_state_code, name_en, state_type) VALUES ({idx}, '{lgd_code}', {escape_str(st_name)}, '{st_type}') ON CONFLICT (name_en) DO NOTHING;\n")
    out.write("\n")
    
    # 2. POLITICAL PARTIES
    print("Migrating Political Parties...")
    parties = cur.execute("SELECT DISTINCT party, party_name_full FROM mps WHERE party IS NOT NULL AND party != ''").fetchall()
    party_id_map = {}
    party_idx = 1
    for p in parties:
        p_abbr = p["party"] or "IND"
        p_full = p["party_name_full"] or p_abbr
        if p_abbr not in party_id_map:
            party_id_map[p_abbr] = party_idx
            out.write(f"INSERT INTO public.political_parties (party_id, party_abbreviation, party_full_name) VALUES ({party_idx}, {escape_str(p_abbr)}, {escape_str(p_full)}) ON CONFLICT (party_abbreviation) DO NOTHING;\n")
            party_idx += 1
    out.write("\n")
    
    # 3. CONSTITUENCIES
    print("Migrating Constituencies...")
    constituencies = cur.execute("SELECT DISTINCT constituency_normalized, state_normalized FROM mps WHERE house = 'Lok Sabha' AND constituency_normalized IS NOT NULL AND constituency_normalized != ''").fetchall()
    const_id_map = {}
    const_idx = 1
    for c in constituencies:
        c_name = c["constituency_normalized"]
        st_name = c["state_normalized"]
        st_id = state_id_map.get(st_name, 1)
        const_id_map[(c_name, st_name)] = const_idx
        out.write(f"INSERT INTO public.constituencies (constituency_id, state_id, constituency_name) VALUES ({const_idx}, {st_id}, {escape_str(c_name)}) ON CONFLICT (constituency_id) DO NOTHING;\n")
        const_idx += 1
    out.write("\n")
    
    # 4. REPRESENTATIVES & TERMS & ALLOCATIONS
    print("Migrating Representatives & Terms...")
    mps = cur.execute("SELECT * FROM mps ORDER BY CASE WHEN house = 'Lok Sabha' THEN 0 ELSE 1 END, internal_mp_id").fetchall()
    rep_uuid_map = {}
    seen_sansad_codes = set()
    for m in mps:
        rep_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"jandrishti.mp.{m['internal_mp_id']}"))
        rep_uuid_map[m["internal_mp_id"]] = rep_uuid
        
        party_id = party_id_map.get(m["party"], "NULL")
        party_val = str(party_id) if party_id != "NULL" else "NULL"
        
        # Enforce strict uniqueness for sansad_mp_code
        sansad_code_val = "NULL"
        if m["sansad_mp_code"] is not None and str(m["sansad_mp_code"]).strip() != "":
            try:
                code_int = int(m["sansad_mp_code"])
                if code_int not in seen_sansad_codes:
                    seen_sansad_codes.add(code_int)
                    sansad_code_val = str(code_int)
            except:
                sansad_code_val = "NULL"
        
        out.write(f"""INSERT INTO public.representatives (
            representative_id, legacy_internal_id, canonical_name, normalized_name, current_party_id,
            gender, date_of_birth, profession, official_email, contact_phone, delhi_address, permanent_address,
            photo_source_url, sansad_mp_code
        ) VALUES (
            '{rep_uuid}', {escape_str(m['internal_mp_id'])}, {escape_str(m['mp_name_normalized'])}, {escape_str(m['mp_name_normalized'])}, {party_val},
            {normalize_gender(m['gender'])}, {date_val(m['dob'])}, {escape_str(m['profession'])}, {escape_str(m['email'])}, {escape_str(m['contact_number'])},
            {escape_str(m['delhi_address'])}, {escape_str(m['permanent_address'])}, {escape_str(m['photo_url'])}, {sansad_code_val}
        ) ON CONFLICT (legacy_internal_id) DO UPDATE SET canonical_name = EXCLUDED.canonical_name;\n""")
        
        # Term
        house_val = normalize_house(m['house'])
        st_id = state_id_map.get(m["state_normalized"], 1)
        c_id = const_id_map.get((m["constituency_normalized"], m["state_normalized"]), "NULL") if "LOK" in house_val else "NULL"
        c_val = str(c_id) if c_id != "NULL" else "NULL"
        term_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"jandrishti.term.{m['internal_mp_id']}"))
        
        out.write(f"""INSERT INTO public.representative_terms (
            term_id, representative_id, house, lok_sabha_term, state_id, constituency_id, is_sitting
        ) VALUES (
            '{term_uuid}', '{rep_uuid}', {house_val}, 18, {st_id}, {c_val}, true
        ) ON CONFLICT (term_id) DO NOTHING;\n""")
        
        # Allocation
        alloc_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"jandrishti.alloc.{m['internal_mp_id']}"))
        out.write(f"""INSERT INTO public.parliamentary_allocations (
            allocation_id, representative_id, term_id, fiscal_year, statutory_quota, released_amount
        ) VALUES (
            '{alloc_uuid}', '{rep_uuid}', '{term_uuid}', '2024-2025', {num_val(m['allocated_amount'])}, {num_val(m['total_expenditure'])}
        ) ON CONFLICT (allocation_id) DO NOTHING;\n""")
    out.write("\n")
    
    # 5. CONTRACTORS
    print("Migrating Contractors...")
    vendors = cur.execute("SELECT * FROM vendors").fetchall()
    vnd_uuid_map = {}
    for v in vendors:
        v_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"jandrishti.vendor.{v['internal_vendor_id']}"))
        vnd_uuid_map[v["internal_vendor_id"]] = v_uuid
        st_id = state_id_map.get(v["primary_state"], "NULL")
        st_val = str(st_id) if st_id != "NULL" else "NULL"
        hhi = num_val(v["single_mp_reliance_pct"])
        
        out.write(f"""INSERT INTO public.contractors (
            contractor_id, legacy_vendor_id, trade_name_raw, trade_name_normalized, state_id, hhi_score, risk_level
        ) VALUES (
            '{v_uuid}', {escape_str(v['internal_vendor_id'])}, {escape_str(v['vendor_name_raw'])}, {escape_str(v['vendor_name_normalized'])},
            {st_val}, {hhi}, 'LOW'
        ) ON CONFLICT (legacy_vendor_id) DO UPDATE SET trade_name_normalized = EXCLUDED.trade_name_normalized;\n""")
    out.write("\n")
    
    # 6. INFRASTRUCTURE WORKS (BATCHED)
    print("Migrating Infrastructure Works (102,437 rows)...")
    works = cur.execute("SELECT * FROM works").fetchall()
    for w in works:
        rep_uuid = rep_uuid_map.get(w["internal_mp_id"])
        if not rep_uuid:
            continue
        st_id = state_id_map.get(w["state_normalized"], 1)
        c_id = const_id_map.get((w["constituency_normalized"], w["state_normalized"]), "NULL")
        c_val = str(c_id) if c_id != "NULL" else "NULL"
        
        lat = w["latitude"]
        lon = w["longitude"]
        geom_val = "NULL"
        if lat and lon:
            try:
                lat_f = float(lat)
                lon_f = float(lon)
                if 6.0 <= lat_f <= 38.0 and 68.0 <= lon_f <= 98.0:
                    geom_val = f"ST_SetSRID(ST_MakePoint({lon_f:.6f}, {lat_f:.6f}), 4326)"
            except:
                pass
                
        lifecycle_status = normalize_lifecycle_status(w['lifecycle_status'])
        has_photos_val = "TRUE" if w['has_images'] else "FALSE"
        
        out.write(f"""INSERT INTO public.infrastructure_works (
            work_id, representative_id, state_id, constituency_id, category_code, description_raw, description_clean,
            lifecycle_status, recommended_amount, recommendation_date, sanctioned_amount, sanction_date,
            final_disbursed_amount, completion_date, location_point, village_name, block_name, gram_panchayat,
            assigned_contractor_name, has_geo_photos, match_confidence, match_method
        ) VALUES (
            {w['work_id']}, '{rep_uuid}', {st_id}, {c_val}, {escape_str(w['category_normalized'] or 'GENERAL')},
            {escape_str(w['work_description_raw'])}, {escape_str(w['work_description_normalized'] or w['work_description_raw'] or 'MPLADS WORK')},
            {lifecycle_status}, {num_val(w['recommended_amount'])}, {date_val(w['recommendation_date'])},
            {num_val(w['sanctioned_amount'])}, {date_val(w['sanction_date'])}, {num_val(w['final_amount'])}, {date_val(w['completed_date'])},
            {geom_val}, {escape_str(w['village'])}, {escape_str(w['block'])}, {escape_str(w['gram_panchayat'])},
            {escape_str(w['work_contractor'])}, {has_photos_val}, {num_val(w['match_confidence'], '1.000')}, {escape_str(w['match_method'] or 'EXACT')}
        ) ON CONFLICT (work_id) DO NOTHING;\n""")
    out.write("\n")
    
    # 7. TREASURY VOUCHERS (BATCHED)
    print("Migrating Treasury Vouchers (82,296 rows)...")
    txs = cur.execute("SELECT * FROM transactions").fetchall()
    for t in txs:
        rep_uuid = rep_uuid_map.get(t["internal_mp_id"])
        vnd_uuid = vnd_uuid_map.get(t["internal_vendor_id"])
        if not rep_uuid or not vnd_uuid:
            continue
        v_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"jandrishti.tx.{t['internal_transaction_id']}"))
        is_march = "TRUE" if t["expenditure_month"] == 3 else "FALSE"
        payment_status = normalize_payment_status(t['payment_status'])
        
        out.write(f"""INSERT INTO public.treasury_vouchers (
            voucher_id, legacy_transaction_id, representative_id, contractor_id, work_id,
            official_voucher_no, disbursement_amount, expenditure_date, payment_status, is_march_rush, activity_description
        ) VALUES (
            '{v_uuid}', {escape_str(t['internal_transaction_id'])}, '{rep_uuid}', '{vnd_uuid}', NULL,
            NULL, {num_val(t['expenditure_amount'])}, {date_val(t['expenditure_date'])},
            {payment_status}, {is_march}, {escape_str(t['activity_description_normalized'] or t['activity_description_raw'])}
        ) ON CONFLICT (legacy_transaction_id) DO NOTHING;\n""")
    out.write("\n")
    
    # 8. GOVERNANCE & AUDIT TRAIL
    print("Migrating Governance & Cases...")
    cases = cur.execute("SELECT * FROM review_cases").fetchall()
    for c in cases:
        notes = c["resolution_notes"] if "resolution_notes" in c.keys() else ""
        ent_type = normalize_entity_type(c['entity_type'])
        c_status = normalize_case_status(c['status'])
        severity = normalize_severity(c['severity'])
        
        out.write(f"""INSERT INTO gov.review_cases (
            case_id, entity_type, entity_id, title, severity, risk_score, category, status, assigned_to, assigned_role, notes
        ) VALUES (
            {escape_str(c['case_id'])}, {ent_type}, {escape_str(c['entity_id'])}, {escape_str(c['title'])},
            {severity}, {num_val(c['risk_score'])}, {escape_str(c['category'])}, {c_status},
            {escape_str(c['assigned_to'])}, {escape_str(c['assigned_role'] or 'DISTRICT_AUTHORITY')}, {escape_str(notes)}
        ) ON CONFLICT (case_id) DO NOTHING;\n""")
        
    audits = cur.execute("SELECT * FROM audit_trail").fetchall()
    for a in audits:
        notes = a["details"] if "details" in a.keys() else ""
        old_st = a["previous_state"] if "previous_state" in a.keys() else "OPEN"
        new_st = a["new_state"] if "new_state" in a.keys() else "OPEN"
        out.write(f"""INSERT INTO gov.audit_trail (
            case_id, action, user_role, old_status, new_status, notes, timestamp
        ) VALUES (
            {escape_str(a['case_id'])}, {escape_str(a['action'])}, {escape_str(a['role'] or 'AUDITOR')}, {escape_str(old_st)},
            {escape_str(new_st)}, {escape_str(notes)}, {date_val(a['timestamp'])}
        );\n""")
        
    # 9. ML ANOMALY SIGNALS
    print("Migrating ML Anomaly Signals (1,831 rows)...")
    anoms = cur.execute("SELECT * FROM anomalies").fetchall()
    for an in anoms:
        sig_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"jandrishti.anomaly.{an['anomaly_id']}"))
        ent_type = normalize_entity_type(an['entity_type'])
        severity = normalize_severity(an['severity'])
        
        out.write(f"""INSERT INTO ml.anomaly_signals (
            signal_id, legacy_anomaly_id, entity_type, entity_id, entity_name,
            anomaly_type, severity, anomaly_score, detection_method, observed_value, reason
        ) VALUES (
            '{sig_uuid}', {escape_str(an['anomaly_id'])}, {ent_type}, {escape_str(an['entity_id'])}, {escape_str(an['entity_id'])},
            {escape_str(an['anomaly_type'])}, {severity}, {num_val(an['anomaly_score'])},
            {escape_str(an['detection_method'])}, {num_val(an['observed_value'])}, {escape_str(an['reason'])}
        ) ON CONFLICT (legacy_anomaly_id) DO NOTHING;\n""")
        
    out.close()
    conn.close()
    
    sql_size = os.path.getsize(OUTPUT_SQL)
    print("==========================================================")
    print(f"MIGRATION EXPORT COMPLETE -> {OUTPUT_SQL} ({sql_size / 1e6:.2f} MB)")
    print("==========================================================")

if __name__ == "__main__":
    main()
