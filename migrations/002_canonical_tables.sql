-- =============================================================================
-- JANDRISHTI PRODUCTION MIGRATION 002: CANONICAL DOMAIN TABLES
-- =============================================================================

-- 1. States & Union Territories Master
CREATE TABLE IF NOT EXISTS public.states (
    state_id SMALLINT PRIMARY KEY,
    lgd_state_code TEXT NOT NULL UNIQUE,
    name_en TEXT NOT NULL UNIQUE,
    state_type TEXT NOT NULL CHECK (state_type IN ('STATE', 'UNION_TERRITORY')),
    census_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Local Government Directory Standard Districts
CREATE TABLE IF NOT EXISTS public.districts (
    district_id INTEGER PRIMARY KEY, -- LGD Code
    state_id SMALLINT NOT NULL REFERENCES public.states(state_id) ON DELETE RESTRICT,
    district_name TEXT NOT NULL,
    centroid GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_districts_state ON public.districts(state_id);
CREATE INDEX IF NOT EXISTS idx_districts_geom ON public.districts USING GIST(centroid);

-- 3. Parliamentary Constituencies Master (Lok Sabha)
CREATE TABLE IF NOT EXISTS public.constituencies (
    constituency_id INTEGER PRIMARY KEY,
    state_id SMALLINT NOT NULL REFERENCES public.states(state_id) ON DELETE RESTRICT,
    constituency_name TEXT NOT NULL,
    constituency_number SMALLINT,
    reservation_type TEXT NOT NULL DEFAULT 'GEN' CHECK (reservation_type IN ('GEN', 'SC', 'ST')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_constituencies_state ON public.constituencies(state_id);
CREATE INDEX IF NOT EXISTS idx_constituencies_name ON public.constituencies(constituency_name);

-- 4. Political Parties Master
CREATE TABLE IF NOT EXISTS public.political_parties (
    party_id SMALLSERIAL PRIMARY KEY,
    party_abbreviation TEXT NOT NULL UNIQUE,
    party_full_name TEXT NOT NULL,
    eci_recognition TEXT NOT NULL DEFAULT 'NATIONAL' CHECK (eci_recognition IN ('NATIONAL', 'STATE', 'UNRECOGNIZED', 'OTHER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Parliamentarians (Representatives)
CREATE TABLE IF NOT EXISTS public.representatives (
    representative_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_internal_id TEXT NOT NULL UNIQUE, -- e.g. INTERNAL_MP_001
    canonical_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    current_party_id SMALLINT REFERENCES public.political_parties(party_id) ON DELETE SET NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', NULL)),
    date_of_birth DATE,
    profession TEXT,
    official_email TEXT,
    personal_email TEXT,
    contact_phone TEXT,
    delhi_address TEXT,
    permanent_address TEXT,
    photo_storage_path TEXT,
    photo_source_url TEXT,
    sansad_mp_code INTEGER UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_rep_norm_name ON public.representatives(normalized_name);
CREATE INDEX IF NOT EXISTS idx_rep_party ON public.representatives(current_party_id);
CREATE INDEX IF NOT EXISTS idx_rep_sansad_code ON public.representatives(sansad_mp_code);

-- 6. Representative Parliamentary Terms
CREATE TABLE IF NOT EXISTS public.representative_terms (
    term_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representative_id UUID NOT NULL REFERENCES public.representatives(representative_id) ON DELETE CASCADE,
    house TEXT NOT NULL CHECK (house IN ('LOK_SABHA', 'RAJYA_SABHA')),
    lok_sabha_term SMALLINT,
    state_id SMALLINT NOT NULL REFERENCES public.states(state_id) ON DELETE RESTRICT,
    constituency_id INTEGER REFERENCES public.constituencies(constituency_id) ON DELETE RESTRICT, -- Nullable for Rajya Sabha
    term_start_date DATE,
    term_end_date DATE,
    is_sitting BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_terms_rep ON public.representative_terms(representative_id);
CREATE INDEX IF NOT EXISTS idx_terms_house ON public.representative_terms(house);
CREATE INDEX IF NOT EXISTS idx_terms_state ON public.representative_terms(state_id);
CREATE INDEX IF NOT EXISTS idx_terms_const ON public.representative_terms(constituency_id);

-- 7. Parliamentary Entitlement Allocations
CREATE TABLE IF NOT EXISTS public.parliamentary_allocations (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    representative_id UUID NOT NULL REFERENCES public.representatives(representative_id) ON DELETE CASCADE,
    term_id UUID REFERENCES public.representative_terms(term_id) ON DELETE SET NULL,
    fiscal_year TEXT NOT NULL,
    statutory_quota NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    released_amount NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    source_checkpoint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_alloc_rep ON public.parliamentary_allocations(representative_id);
CREATE INDEX IF NOT EXISTS idx_alloc_fy ON public.parliamentary_allocations(fiscal_year);

-- 8. Implementing District Authorities / Agencies
CREATE TABLE IF NOT EXISTS public.implementing_agencies (
    agency_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_name_raw TEXT,
    agency_name_normalized TEXT NOT NULL UNIQUE,
    district_id INTEGER REFERENCES public.districts(district_id) ON DELETE SET NULL,
    state_id SMALLINT REFERENCES public.states(state_id) ON DELETE SET NULL,
    nodal_office_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_agency_norm_name ON public.implementing_agencies(agency_name_normalized);
CREATE INDEX IF NOT EXISTS idx_agency_dist ON public.implementing_agencies(district_id);

-- 9. Contractors / Vendors Master
CREATE TABLE IF NOT EXISTS public.contractors (
    contractor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_vendor_id TEXT NOT NULL UNIQUE, -- e.g. INTERNAL_VND_00001
    trade_name_raw TEXT,
    trade_name_normalized TEXT NOT NULL,
    state_id SMALLINT REFERENCES public.states(state_id) ON DELETE SET NULL,
    gstin TEXT UNIQUE,
    pan_hash TEXT,
    hhi_score NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_vnd_norm_name ON public.contractors(trade_name_normalized);
CREATE INDEX IF NOT EXISTS idx_vnd_state ON public.contractors(state_id);
CREATE INDEX IF NOT EXISTS idx_vnd_risk ON public.contractors(risk_level);

-- 10. Public Infrastructure Works
CREATE TABLE IF NOT EXISTS public.infrastructure_works (
    work_id BIGINT PRIMARY KEY, -- Official Work ID preserved
    representative_id UUID NOT NULL REFERENCES public.representatives(representative_id) ON DELETE RESTRICT,
    term_id UUID REFERENCES public.representative_terms(term_id) ON DELETE SET NULL,
    agency_id UUID REFERENCES public.implementing_agencies(agency_id) ON DELETE SET NULL,
    district_id INTEGER REFERENCES public.districts(district_id) ON DELETE SET NULL,
    constituency_id INTEGER REFERENCES public.constituencies(constituency_id) ON DELETE SET NULL,
    state_id SMALLINT NOT NULL REFERENCES public.states(state_id) ON DELETE RESTRICT,
    category_code TEXT NOT NULL,
    description_raw TEXT,
    description_clean TEXT NOT NULL,
    lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('RECOMMENDED', 'SANCTIONED', 'IN_PROGRESS', 'COMPLETED')),
    recommended_amount NUMERIC(18,2),
    recommendation_date DATE,
    sanctioned_amount NUMERIC(18,2),
    sanction_date DATE,
    final_disbursed_amount NUMERIC(18,2),
    completion_date DATE,
    location_point GEOMETRY(Point, 4326),
    village_name TEXT,
    block_name TEXT,
    gram_panchayat TEXT,
    assigned_contractor_name TEXT,
    has_geo_photos BOOLEAN NOT NULL DEFAULT FALSE,
    match_confidence NUMERIC(4,3) NOT NULL DEFAULT 1.000,
    match_method TEXT NOT NULL DEFAULT 'EXACT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_works_coords CHECK (
        location_point IS NULL OR (
            ST_X(location_point) BETWEEN 68.0 AND 98.0 AND
            ST_Y(location_point) BETWEEN 6.0 AND 38.0
        )
    )
);
CREATE INDEX IF NOT EXISTS idx_works_rep ON public.infrastructure_works(representative_id);
CREATE INDEX IF NOT EXISTS idx_works_status ON public.infrastructure_works(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_works_cat ON public.infrastructure_works(category_code);
CREATE INDEX IF NOT EXISTS idx_works_state ON public.infrastructure_works(state_id);
CREATE INDEX IF NOT EXISTS idx_works_dist ON public.infrastructure_works(district_id);
CREATE INDEX IF NOT EXISTS idx_works_spatial ON public.infrastructure_works USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_works_fts ON public.infrastructure_works USING GIN(to_tsvector('english', description_clean));

-- 11. Treasury Disbursement Vouchers
CREATE TABLE IF NOT EXISTS public.treasury_vouchers (
    voucher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_transaction_id TEXT NOT NULL UNIQUE, -- e.g. TXN_000001
    representative_id UUID NOT NULL REFERENCES public.representatives(representative_id) ON DELETE RESTRICT,
    contractor_id UUID NOT NULL REFERENCES public.contractors(contractor_id) ON DELETE RESTRICT,
    work_id BIGINT REFERENCES public.infrastructure_works(work_id) ON DELETE SET NULL, -- Nullable to preserve unlinked vouchers
    official_voucher_no TEXT,
    disbursement_amount NUMERIC(18,2) NOT NULL,
    expenditure_date DATE,
    payment_status TEXT NOT NULL DEFAULT 'PAYMENT_SUCCESS' CHECK (payment_status IN ('PAYMENT_SUCCESS', 'PAYMENT_PENDING')),
    is_march_rush BOOLEAN NOT NULL DEFAULT FALSE,
    activity_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_tx_rep ON public.treasury_vouchers(representative_id);
CREATE INDEX IF NOT EXISTS idx_tx_contractor ON public.treasury_vouchers(contractor_id);
CREATE INDEX IF NOT EXISTS idx_tx_work ON public.treasury_vouchers(work_id);
CREATE INDEX IF NOT EXISTS idx_tx_date ON public.treasury_vouchers(expenditure_date);
CREATE INDEX IF NOT EXISTS idx_tx_compound ON public.treasury_vouchers(representative_id, payment_status, expenditure_date);

-- 12. Future Field Verifications / Citizen Audits
CREATE TABLE IF NOT EXISTS public.field_verifications (
    verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id BIGINT NOT NULL REFERENCES public.infrastructure_works(work_id) ON DELETE CASCADE,
    inspector_user_id UUID, -- References auth.users(id)
    inspection_timestamp TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    geo_location GEOMETRY(Point, 4326),
    physical_milestone_status TEXT NOT NULL CHECK (physical_milestone_status IN ('NOT_STARTED', 'IN_PROGRESS_FOUNDATION', 'IN_PROGRESS_STRUCTURE', 'COMPLETED_OPERATIONAL')),
    signboard_present BOOLEAN NOT NULL DEFAULT FALSE,
    photo_storage_path TEXT,
    verification_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (verification_status IN ('PENDING_REVIEW', 'APPROVED_OFFICIAL', 'FLAGGED_MISMATCH')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_verif_work ON public.field_verifications(work_id);
CREATE INDEX IF NOT EXISTS idx_verif_user ON public.field_verifications(inspector_user_id);
