-- =============================================================================
-- SQLite-compatible views over the canonical Supabase schema
-- plus writable alerts / review-case adapters and demo login identities.
-- Split markers are consumed by backend/database.py
-- =============================================================================

-- SPLIT
CREATE SCHEMA IF NOT EXISTS compat;

-- SPLIT
CREATE TABLE IF NOT EXISTS compat.alerts (
    alert_id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    assigned_to TEXT DEFAULT 'Unassigned',
    assigned_role TEXT DEFAULT 'DISTRICT_AUTHORITY',
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    reviewer_comment TEXT DEFAULT ''
);

-- SPLIT
CREATE INDEX IF NOT EXISTS idx_alerts_project ON compat.alerts(project_id);

-- SPLIT
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON compat.alerts(severity);

-- SPLIT
CREATE INDEX IF NOT EXISTS idx_alerts_status ON compat.alerts(status);

-- SPLIT
ALTER TABLE gov.audit_trail ADD COLUMN IF NOT EXISTS actor_display_name TEXT;

-- SPLIT
CREATE OR REPLACE VIEW compat.mps AS
SELECT
    r.legacy_internal_id AS internal_mp_id,
    r.canonical_name AS mp_name_raw,
    r.normalized_name AS mp_name_normalized,
    COALESCE(c.constituency_name, s.name_en, 'UNKNOWN') AS constituency_raw,
    UPPER(COALESCE(c.constituency_name, s.name_en, 'UNKNOWN')) AS constituency_normalized,
    COALESCE(s.name_en, 'UNKNOWN') AS state_raw,
    UPPER(COALESCE(s.name_en, 'UNKNOWN')) AS state_normalized,
    CASE t.house
        WHEN 'LOK_SABHA' THEN 'Lok Sabha'
        WHEN 'RAJYA_SABHA' THEN 'Rajya Sabha'
        ELSE COALESCE(t.house, 'Lok Sabha')
    END AS house,
    COALESCE(alloc.allocated_amount, 0)::double precision AS allocated_amount,
    COALESCE(vouch.total_expenditure, 0)::double precision AS total_expenditure,
    GREATEST(0, COALESCE(alloc.allocated_amount, 0) - COALESCE(vouch.total_expenditure, 0))::double precision AS unspent_amount,
    CASE WHEN COALESCE(alloc.allocated_amount, 0) > 0
        THEN ROUND(((COALESCE(vouch.total_expenditure, 0) / alloc.allocated_amount) * 100)::numeric, 2)::double precision
        ELSE 0
    END AS utilization_pct,
    COALESCE(wrk.recommended_works_count, 0)::integer AS recommended_works_count,
    COALESCE(wrk.completed_works_count, 0)::integer AS completed_works_count,
    CASE WHEN COALESCE(wrk.recommended_works_count, 0) > 0
        THEN ROUND(((COALESCE(wrk.completed_works_count, 0)::numeric / wrk.recommended_works_count) * 100)::numeric, 2)::double precision
        ELSE 0
    END AS completion_rate_pct,
    COALESCE(vouch.transaction_count, 0)::integer AS transaction_count,
    COALESCE(vouch.successful_payments_count, 0)::integer AS successful_payments_count,
    COALESCE(vouch.pending_payments_count, 0)::integer AS pending_payments_count,
    NULL::double precision AS average_rating,
    'supabase'::text AS source_dataset,
    'canonical'::text AS source_file,
    CURRENT_DATE::text AS source_download_date,
    r.created_at::text AS pipeline_created_at,
    r.official_email AS email,
    r.contact_phone AS contact_number,
    r.photo_source_url AS photo_url,
    p.party_abbreviation AS party,
    p.party_full_name AS party_name_full,
    r.profession,
    r.delhi_address,
    r.permanent_address,
    r.gender,
    r.date_of_birth::text AS dob,
    r.sansad_mp_code::text AS official_system_id
FROM public.representatives r
LEFT JOIN LATERAL (
    SELECT tt.*
    FROM public.representative_terms tt
    WHERE tt.representative_id = r.representative_id
    ORDER BY tt.is_sitting DESC, tt.term_start_date DESC NULLS LAST
    LIMIT 1
) t ON TRUE
LEFT JOIN public.states s ON s.state_id = t.state_id
LEFT JOIN public.constituencies c ON c.constituency_id = t.constituency_id
LEFT JOIN public.political_parties p ON p.party_id = r.current_party_id
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(a.statutory_quota), 0) AS allocated_amount
    FROM public.parliamentary_allocations a
    WHERE a.representative_id = r.representative_id
) alloc ON TRUE
LEFT JOIN LATERAL (
    SELECT
        COUNT(*)::integer AS recommended_works_count,
        COUNT(*) FILTER (WHERE w.lifecycle_status = 'COMPLETED')::integer AS completed_works_count
    FROM public.infrastructure_works w
    WHERE w.representative_id = r.representative_id
) wrk ON TRUE
LEFT JOIN LATERAL (
    SELECT
        COUNT(*)::integer AS transaction_count,
        COUNT(*) FILTER (WHERE tv.payment_status = 'PAYMENT_SUCCESS')::integer AS successful_payments_count,
        COUNT(*) FILTER (WHERE tv.payment_status = 'PAYMENT_PENDING')::integer AS pending_payments_count,
        COALESCE(SUM(tv.disbursement_amount) FILTER (WHERE tv.payment_status = 'PAYMENT_SUCCESS'), 0) AS total_expenditure
    FROM public.treasury_vouchers tv
    WHERE tv.representative_id = r.representative_id
) vouch ON TRUE;

-- SPLIT
CREATE OR REPLACE VIEW compat.works AS
SELECT
    w.work_id,
    r.legacy_internal_id AS internal_mp_id,
    r.canonical_name AS mp_name_raw,
    r.normalized_name AS mp_name_normalized,
    COALESCE(c.constituency_name, s.name_en) AS constituency_raw,
    UPPER(COALESCE(c.constituency_name, s.name_en, 'UNKNOWN')) AS constituency_normalized,
    s.name_en AS state_raw,
    UPPER(COALESCE(s.name_en, 'UNKNOWN')) AS state_normalized,
    CASE t.house
        WHEN 'LOK_SABHA' THEN 'Lok Sabha'
        WHEN 'RAJYA_SABHA' THEN 'Rajya Sabha'
        ELSE COALESCE(t.house, 'Lok Sabha')
    END AS house,
    w.category_code AS category_raw,
    w.category_code AS category_normalized,
    w.description_raw AS work_description_raw,
    w.description_clean AS work_description_normalized,
    ia.agency_name_raw AS ida_raw,
    COALESCE(ia.agency_name_normalized, 'UNKNOWN') AS ida_normalized,
    w.lifecycle_status,
    w.recommended_amount::double precision AS recommended_amount,
    w.recommendation_date::text AS recommendation_date,
    EXTRACT(YEAR FROM w.recommendation_date)::integer AS recommendation_year,
    EXTRACT(MONTH FROM w.recommendation_date)::integer AS recommendation_month,
    COALESCE(w.final_disbursed_amount, w.sanctioned_amount, 0)::double precision AS final_amount,
    w.completion_date::text AS completed_date,
    EXTRACT(YEAR FROM w.completion_date)::integer AS completion_year,
    EXTRACT(MONTH FROM w.completion_date)::integer AS completion_month,
    CASE
        WHEN w.completion_date IS NOT NULL AND w.recommendation_date IS NOT NULL
            THEN (w.completion_date - w.recommendation_date)
        ELSE NULL
    END::integer AS duration_days,
    (COALESCE(w.final_disbursed_amount, 0) - COALESCE(w.recommended_amount, 0))::double precision AS cost_variance_amount,
    CASE WHEN COALESCE(w.recommended_amount, 0) > 0
        THEN ROUND((((COALESCE(w.final_disbursed_amount, 0) - w.recommended_amount) / w.recommended_amount) * 100)::numeric, 2)::double precision
        ELSE 0
    END AS cost_variance_pct,
    CASE WHEN w.has_geo_photos THEN 1 ELSE 0 END AS has_images,
    NULL::double precision AS average_rating,
    w.sanctioned_amount::double precision AS sanctioned_amount,
    w.sanction_date::text AS sanction_date,
    CASE WHEN w.location_point IS NOT NULL THEN ST_Y(w.location_point) ELSE NULL END AS latitude,
    CASE WHEN w.location_point IS NOT NULL THEN ST_X(w.location_point) ELSE NULL END AS longitude,
    w.village_name AS village,
    w.block_name AS block,
    w.gram_panchayat,
    w.assigned_contractor_name AS work_contractor,
    NULL::double precision AS fund_released,
    NULL::double precision AS district_treasury_utilization,
    'canonical'::text AS source_files,
    w.match_method,
    w.match_confidence::double precision AS match_confidence,
    w.created_at::text AS pipeline_created_at
FROM public.infrastructure_works w
JOIN public.representatives r ON r.representative_id = w.representative_id
JOIN public.states s ON s.state_id = w.state_id
LEFT JOIN public.constituencies c ON c.constituency_id = w.constituency_id
LEFT JOIN public.implementing_agencies ia ON ia.agency_id = w.agency_id
LEFT JOIN LATERAL (
    SELECT tt.house
    FROM public.representative_terms tt
    WHERE tt.representative_id = r.representative_id
    ORDER BY tt.is_sitting DESC, tt.term_start_date DESC NULLS LAST
    LIMIT 1
) t ON TRUE;

-- SPLIT
CREATE OR REPLACE VIEW compat.transactions AS
SELECT
    tv.legacy_transaction_id AS internal_transaction_id,
    r.legacy_internal_id AS internal_mp_id,
    ct.legacy_vendor_id AS internal_vendor_id,
    r.canonical_name AS mp_name_raw,
    r.normalized_name AS mp_name_normalized,
    COALESCE(c.constituency_name, s.name_en) AS constituency_raw,
    UPPER(COALESCE(c.constituency_name, s.name_en, 'UNKNOWN')) AS constituency_normalized,
    s.name_en AS state_raw,
    UPPER(COALESCE(s.name_en, 'UNKNOWN')) AS state_normalized,
    CASE term.house
        WHEN 'LOK_SABHA' THEN 'Lok Sabha'
        WHEN 'RAJYA_SABHA' THEN 'Rajya Sabha'
        ELSE COALESCE(term.house, 'Lok Sabha')
    END AS house,
    ct.trade_name_raw AS vendor_name_raw,
    ct.trade_name_normalized AS vendor_name_normalized,
    COALESCE(tv.activity_description, 'UNSPECIFIED') AS activity_description_raw,
    UPPER(COALESCE(tv.activity_description, 'UNSPECIFIED')) AS activity_description_normalized,
    NULL::text AS ida_raw,
    'UNKNOWN'::text AS ida_normalized,
    tv.disbursement_amount::double precision AS expenditure_amount,
    tv.expenditure_date::text AS expenditure_date,
    EXTRACT(YEAR FROM tv.expenditure_date)::integer AS expenditure_year,
    EXTRACT(MONTH FROM tv.expenditure_date)::integer AS expenditure_month,
    tv.payment_status,
    NULL::double precision AS activity_amount_percentile,
    NULL::double precision AS activity_amount_robust_zscore,
    NULL::double precision AS transaction_to_mp_total_exp_pct,
    'supabase'::text AS source_dataset,
    'canonical'::text AS source_file,
    CURRENT_DATE::text AS source_download_date,
    'CANONICAL'::text AS match_method,
    tv.created_at::text AS pipeline_created_at
FROM public.treasury_vouchers tv
JOIN public.representatives r ON r.representative_id = tv.representative_id
JOIN public.contractors ct ON ct.contractor_id = tv.contractor_id
LEFT JOIN LATERAL (
    SELECT tt.house, tt.state_id, tt.constituency_id
    FROM public.representative_terms tt
    WHERE tt.representative_id = r.representative_id
    ORDER BY tt.is_sitting DESC, tt.term_start_date DESC NULLS LAST
    LIMIT 1
) term ON TRUE
LEFT JOIN public.states s ON s.state_id = term.state_id
LEFT JOIN public.constituencies c ON c.constituency_id = term.constituency_id;

-- SPLIT
CREATE OR REPLACE VIEW compat.vendors AS
SELECT
    ct.legacy_vendor_id AS internal_vendor_id,
    ct.trade_name_raw AS vendor_name_raw,
    ct.trade_name_normalized AS vendor_name_normalized,
    COALESCE(agg.total_received_amount, 0)::double precision AS total_received_amount,
    COALESCE(agg.total_transaction_count, 0)::integer AS total_transaction_count,
    COALESCE(agg.unique_mps_served, 0)::integer AS unique_mps_served,
    COALESCE(agg.unique_states_served, 0)::integer AS unique_states_served,
    s.name_en AS primary_state,
    NULL::text AS primary_activity,
    agg.primary_mp_id,
    agg.primary_mp_name,
    COALESCE(agg.single_mp_reliance_pct, 0)::double precision AS single_mp_reliance_pct,
    NULL::double precision AS vendor_revenue_percentile,
    NULL::double precision AS vendor_revenue_robust_zscore,
    CASE WHEN COALESCE(agg.total_transaction_count, 0) > 0
        THEN (agg.total_received_amount / agg.total_transaction_count)::double precision
        ELSE 0
    END AS average_ticket_size,
    'supabase'::text AS source_dataset,
    'canonical'::text AS source_file,
    CURRENT_DATE::text AS source_download_date,
    ct.created_at::text AS pipeline_created_at
FROM public.contractors ct
LEFT JOIN public.states s ON s.state_id = ct.state_id
LEFT JOIN LATERAL (
    SELECT
        COALESCE(SUM(tv.disbursement_amount), 0) AS total_received_amount,
        COUNT(*)::integer AS total_transaction_count,
        COUNT(DISTINCT tv.representative_id)::integer AS unique_mps_served,
        COUNT(DISTINCT t.state_id)::integer AS unique_states_served,
        (
            SELECT r2.legacy_internal_id
            FROM public.treasury_vouchers tv2
            JOIN public.representatives r2 ON r2.representative_id = tv2.representative_id
            WHERE tv2.contractor_id = ct.contractor_id
            GROUP BY r2.legacy_internal_id
            ORDER BY SUM(tv2.disbursement_amount) DESC
            LIMIT 1
        ) AS primary_mp_id,
        (
            SELECT r2.normalized_name
            FROM public.treasury_vouchers tv2
            JOIN public.representatives r2 ON r2.representative_id = tv2.representative_id
            WHERE tv2.contractor_id = ct.contractor_id
            GROUP BY r2.normalized_name
            ORDER BY SUM(tv2.disbursement_amount) DESC
            LIMIT 1
        ) AS primary_mp_name,
        CASE WHEN SUM(tv.disbursement_amount) > 0 THEN ROUND((
            (
                (
                    SELECT SUM(tv3.disbursement_amount)
                    FROM public.treasury_vouchers tv3
                    WHERE tv3.contractor_id = ct.contractor_id
                      AND tv3.representative_id = (
                          SELECT tv4.representative_id
                          FROM public.treasury_vouchers tv4
                          WHERE tv4.contractor_id = ct.contractor_id
                          GROUP BY tv4.representative_id
                          ORDER BY SUM(tv4.disbursement_amount) DESC
                          LIMIT 1
                      )
                ) / SUM(tv.disbursement_amount) * 100
            )::numeric
        ), 2) ELSE 0 END AS single_mp_reliance_pct
    FROM public.treasury_vouchers tv
    LEFT JOIN public.representative_terms t ON t.representative_id = tv.representative_id AND t.is_sitting = TRUE
    WHERE tv.contractor_id = ct.contractor_id
) agg ON TRUE;

-- SPLIT
CREATE OR REPLACE VIEW compat.anomalies AS
SELECT
    COALESCE(a.legacy_anomaly_id, a.signal_id::text) AS anomaly_id,
    CASE WHEN a.entity_type = 'REPRESENTATIVE' THEN 'MP' ELSE a.entity_type END AS entity_type,
    a.entity_id,
    a.anomaly_type,
    a.anomaly_score::double precision AS anomaly_score,
    a.severity,
    a.reason,
    COALESCE(a.baseline_metric, '{}') AS supporting_metrics,
    a.detection_method,
    a.expected_value::text AS threshold_value,
    a.observed_value::text AS observed_value,
    NULL::double precision AS percentile,
    NULL::double precision AS robust_zscore,
    a.statutory_citation AS baseline_reference,
    a.generated_at::text AS generated_at
FROM ml.anomaly_signals a;

-- SPLIT
CREATE OR REPLACE VIEW compat.review_cases AS
SELECT
    c.case_id,
    c.entity_type,
    c.entity_id,
    c.title,
    c.severity,
    c.risk_score::double precision AS risk_score,
    c.category,
    c.status,
    c.assigned_to,
    c.assigned_role,
    c.created_at::text AS created_at,
    c.updated_at::text AS updated_at,
    COALESCE(c.notes, '') AS resolution_notes
FROM gov.review_cases c;

-- SPLIT
CREATE OR REPLACE VIEW compat.audit_trail AS
SELECT
    t.audit_id AS log_id,
    t.case_id,
    t.action,
    COALESCE(t.actor_display_name, 'Authorized Official') AS performed_by,
    t.user_role AS role,
    t.timestamp::text AS timestamp,
    COALESCE(t.notes, '') AS details,
    COALESCE(t.old_status, '') AS previous_state,
    COALESCE(t.new_status, '') AS new_state
FROM gov.audit_trail t;

-- SPLIT
CREATE OR REPLACE FUNCTION public.review_cases_instead_of()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO gov.review_cases (
            case_id, entity_type, entity_id, title, severity, risk_score, category, status,
            assigned_to, assigned_role, notes, created_at, updated_at
        ) VALUES (
            NEW.case_id, NEW.entity_type, NEW.entity_id, NEW.title, NEW.severity, NEW.risk_score, NEW.category,
            COALESCE(NEW.status, 'NEW'), COALESCE(NEW.assigned_to, 'Unassigned'),
            COALESCE(NEW.assigned_role, 'DISTRICT_AUTHORITY'), COALESCE(NEW.resolution_notes, ''),
            COALESCE(NEW.created_at::timestamptz, clock_timestamp()),
            COALESCE(NEW.updated_at::timestamptz, clock_timestamp())
        )
        ON CONFLICT (case_id) DO NOTHING;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE gov.review_cases SET
            status = COALESCE(NEW.status, status),
            assigned_to = COALESCE(NEW.assigned_to, assigned_to),
            notes = COALESCE(NEW.resolution_notes, notes),
            updated_at = clock_timestamp()
        WHERE case_id = OLD.case_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;

-- SPLIT
DROP TRIGGER IF EXISTS review_cases_instead_of_ins ON compat.review_cases;

-- SPLIT
CREATE TRIGGER review_cases_instead_of_ins
INSTEAD OF INSERT ON compat.review_cases
FOR EACH ROW EXECUTE FUNCTION public.review_cases_instead_of();

-- SPLIT
DROP TRIGGER IF EXISTS review_cases_instead_of_upd ON compat.review_cases;

-- SPLIT
CREATE TRIGGER review_cases_instead_of_upd
INSTEAD OF UPDATE ON compat.review_cases
FOR EACH ROW EXECUTE FUNCTION public.review_cases_instead_of();

-- SPLIT
CREATE OR REPLACE FUNCTION public.audit_trail_instead_of()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO gov.audit_trail (
        case_id, action, actor_display_name, user_role, notes, old_status, new_status, timestamp
    ) VALUES (
        NEW.case_id, NEW.action, NEW.performed_by, NEW.role, NEW.details,
        NEW.previous_state, NEW.new_state,
        COALESCE(NEW.timestamp::timestamptz, clock_timestamp())
    );
    RETURN NEW;
END;
$$;

-- SPLIT
DROP TRIGGER IF EXISTS audit_trail_instead_of_ins ON compat.audit_trail;

-- SPLIT
CREATE TRIGGER audit_trail_instead_of_ins
INSTEAD OF INSERT ON compat.audit_trail
FOR EACH ROW EXECUTE FUNCTION public.audit_trail_instead_of();

-- SPLIT
CREATE OR REPLACE VIEW compat.v_state_summary AS
SELECT
    state_normalized AS state,
    COUNT(DISTINCT internal_mp_id) AS total_mps,
    SUM(allocated_amount) AS total_allocated_amount,
    SUM(total_expenditure) AS total_expenditure,
    SUM(unspent_amount) AS total_unspent_amount,
    ROUND(((SUM(total_expenditure) / NULLIF(SUM(allocated_amount), 0)) * 100.0)::numeric, 2) AS state_utilization_pct,
    SUM(recommended_works_count) AS total_recommended_works,
    SUM(completed_works_count) AS total_completed_works,
    ROUND(((SUM(completed_works_count)::numeric / NULLIF(SUM(recommended_works_count), 0)) * 100.0)::numeric, 2) AS state_completion_rate_pct,
    SUM(transaction_count) AS total_transactions,
    SUM(successful_payments_count) AS total_successful_payments,
    SUM(pending_payments_count) AS total_pending_payments
FROM compat.mps
GROUP BY state_normalized;

-- SPLIT
CREATE OR REPLACE VIEW compat.v_constituency_summary AS
SELECT
    constituency_normalized AS constituency,
    state_normalized AS state,
    internal_mp_id,
    mp_name_normalized AS mp_name,
    allocated_amount,
    total_expenditure,
    unspent_amount,
    utilization_pct,
    recommended_works_count,
    completed_works_count,
    completion_rate_pct,
    transaction_count
FROM compat.mps;

-- SPLIT
CREATE OR REPLACE VIEW compat.implementing_agencies AS
SELECT
    ia.agency_id::text AS agency_id,
    ia.agency_name_normalized AS agency_name,
    COALESCE(s.name_en, 'UNKNOWN') AS state,
    0 AS total_works,
    0 AS completed_works,
    0 AS in_progress_works,
    0::double precision AS completion_rate_pct,
    0::double precision AS total_expenditure,
    0 AS total_transactions,
    0 AS unique_vendors,
    0::double precision AS vendor_hhi,
    NULL::text AS top_vendor_name,
    0::double precision AS top_vendor_share_pct,
    NULL::double precision AS avg_duration_days,
    'LOW'::text AS risk_level,
    ia.created_at::text AS generated_at
FROM public.implementing_agencies ia
LEFT JOIN public.states s ON s.state_id = ia.state_id;

-- SPLIT
CREATE OR REPLACE VIEW compat.source_registry AS
SELECT
    s.source_id,
    s.source_name,
    COALESCE(s.authority_tier, '') AS organization,
    COALESCE(s.official_base_url, '') AS url,
    COALESCE(s.freshness_frequency, '') AS data_type,
    COALESCE(s.freshness_frequency, '') AS update_frequency,
    COALESCE(s.authority_tier, 'TIER_2') AS trust_tier,
    s.status,
    COALESCE(s.legal_basis, '') AS license_or_access_note
FROM gov.source_registry s;

-- SPLIT
CREATE OR REPLACE VIEW compat.statutory_rules AS
SELECT
    r.rule_id,
    r.rule_code,
    r.title,
    r.statutory_source AS governing_document,
    COALESCE(r.enacted_date::text, '') AS clause_reference,
    ''::text AS statutory_threshold,
    r.legal_text AS description,
    'NATIONAL'::text AS enforcement_level
FROM gov.statutory_rules r;
