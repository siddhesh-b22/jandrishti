-- =============================================================================
-- JANDRISHTI PRODUCTION MIGRATION 005: ANALYTICS MATERIALIZED VIEWS
-- =============================================================================

-- 1. Representative Performance Materialized View (Safely Pre-aggregated)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.representative_summary_mv AS
WITH works_agg AS (
    SELECT 
        representative_id,
        COUNT(work_id) AS recommended_works_count,
        COUNT(CASE WHEN lifecycle_status = 'COMPLETED' THEN 1 END) AS completed_works_count,
        COALESCE(SUM(recommended_amount), 0.00) AS total_recommended_amount,
        COALESCE(SUM(sanctioned_amount), 0.00) AS total_sanctioned_amount,
        COALESCE(SUM(final_disbursed_amount), 0.00) AS completed_works_value
    FROM public.infrastructure_works
    GROUP BY representative_id
),
vouchers_agg AS (
    SELECT 
        representative_id,
        COUNT(voucher_id) AS transaction_count,
        COUNT(CASE WHEN payment_status = 'PAYMENT_SUCCESS' THEN 1 END) AS successful_payments_count,
        COUNT(CASE WHEN payment_status = 'PAYMENT_PENDING' THEN 1 END) AS pending_payments_count,
        COALESCE(SUM(CASE WHEN payment_status = 'PAYMENT_SUCCESS' THEN disbursement_amount ELSE 0.00 END), 0.00) AS total_expenditure
    FROM public.treasury_vouchers
    GROUP BY representative_id
)
SELECT 
    r.representative_id,
    r.legacy_internal_id,
    r.canonical_name,
    r.normalized_name,
    p.party_abbreviation AS party,
    p.party_full_name,
    t.house,
    s.name_en AS state_name,
    c.constituency_name,
    COALESCE(a.statutory_quota, 0.00) AS allocated_amount,
    COALESCE(v.total_expenditure, 0.00) AS total_expenditure,
    GREATEST(0.00, COALESCE(a.statutory_quota, 0.00) - COALESCE(v.total_expenditure, 0.00)) AS unspent_amount,
    ROUND(
        (COALESCE(v.total_expenditure, 0.00) / NULLIF(COALESCE(a.statutory_quota, 0.00), 0.00)) * 100, 
        2
    ) AS utilization_pct,
    COALESCE(w.recommended_works_count, 0) AS recommended_works_count,
    COALESCE(w.completed_works_count, 0) AS completed_works_count,
    ROUND(
        (COALESCE(w.completed_works_count, 0)::numeric / NULLIF(COALESCE(w.recommended_works_count, 0), 0)) * 100,
        2
    ) AS completion_rate_pct,
    COALESCE(v.transaction_count, 0) AS transaction_count,
    COALESCE(v.successful_payments_count, 0) AS successful_payments_count,
    COALESCE(v.pending_payments_count, 0) AS pending_payments_count,
    r.photo_source_url AS photo_url,
    r.official_email AS email,
    r.contact_phone AS contact_number,
    r.delhi_address,
    r.permanent_address,
    r.gender,
    r.date_of_birth AS dob,
    r.profession,
    r.sansad_mp_code
FROM public.representatives r
LEFT JOIN public.representative_terms t ON t.representative_id = r.representative_id AND t.is_sitting = TRUE
LEFT JOIN public.political_parties p ON p.party_id = r.current_party_id
LEFT JOIN public.states s ON s.state_id = t.state_id
LEFT JOIN public.constituencies c ON c.constituency_id = t.constituency_id
LEFT JOIN public.parliamentary_allocations a ON a.representative_id = r.representative_id
LEFT JOIN works_agg w ON w.representative_id = r.representative_id
LEFT JOIN vouchers_agg v ON v.representative_id = r.representative_id
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rep_summary_mv_pk ON analytics.representative_summary_mv(representative_id);
CREATE INDEX IF NOT EXISTS idx_rep_summary_mv_state ON analytics.representative_summary_mv(state_name);
CREATE INDEX IF NOT EXISTS idx_rep_summary_mv_party ON analytics.representative_summary_mv(party);

-- 2. State-Level Aggregation Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.state_summary_mv AS
SELECT 
    s.state_id,
    s.name_en AS state_name,
    COUNT(DISTINCT r.representative_id) AS total_mps,
    COALESCE(SUM(r.allocated_amount), 0.00) AS total_allocated,
    COALESCE(SUM(r.total_expenditure), 0.00) AS total_expenditure,
    COALESCE(SUM(r.recommended_works_count), 0) AS total_works_recommended,
    COALESCE(SUM(r.completed_works_count), 0) AS total_works_completed,
    ROUND(
        (COALESCE(SUM(r.total_expenditure), 0.00) / NULLIF(COALESCE(SUM(r.allocated_amount), 0.00), 0.00)) * 100,
        2
    ) AS state_utilization_pct
FROM public.states s
LEFT JOIN analytics.representative_summary_mv r ON r.state_name = s.name_en
GROUP BY s.state_id, s.name_en
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_state_summary_mv_pk ON analytics.state_summary_mv(state_id);
