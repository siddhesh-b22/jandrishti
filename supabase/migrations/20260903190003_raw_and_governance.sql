-- =============================================================================
-- JANDRISHTI PRODUCTION MIGRATION 003: RAW INGESTION & GOVERNANCE SCHEMAS
-- =============================================================================

-- ==================== RAW SCHEMA ====================

CREATE TABLE IF NOT EXISTS raw.mospi_works_dump (
    raw_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_filename TEXT NOT NULL,
    source_line_number INTEGER,
    payload JSONB NOT NULL,
    payload_hash TEXT NOT NULL UNIQUE,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    processed_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (processed_status IN ('PENDING', 'VALIDATED', 'PROCESSED', 'FAILED')),
    processing_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_raw_works_gin ON raw.mospi_works_dump USING GIN(payload);

CREATE TABLE IF NOT EXISTS raw.mospi_transactions_dump (
    raw_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_filename TEXT NOT NULL,
    payload JSONB NOT NULL,
    payload_hash TEXT NOT NULL UNIQUE,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    processed_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (processed_status IN ('PENDING', 'VALIDATED', 'PROCESSED', 'FAILED')),
    processing_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_raw_tx_gin ON raw.mospi_transactions_dump USING GIN(payload);

CREATE TABLE IF NOT EXISTS raw.sansad_members_dump (
    raw_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mpsno INTEGER,
    payload JSONB NOT NULL,
    payload_hash TEXT NOT NULL UNIQUE,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_raw_sansad_gin ON raw.sansad_members_dump USING GIN(payload);

CREATE TABLE IF NOT EXISTS raw.field_submissions_dump (
    raw_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by_user_id UUID,
    payload JSONB NOT NULL,
    payload_hash TEXT NOT NULL UNIQUE,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ==================== GOV SCHEMA ====================

-- 1. Source Registry
CREATE TABLE IF NOT EXISTS gov.source_registry (
    source_id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    authority_tier TEXT NOT NULL,
    official_base_url TEXT,
    freshness_frequency TEXT NOT NULL,
    legal_basis TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Cryptographic Historical Snapshots
CREATE TABLE IF NOT EXISTS gov.historical_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    source_id TEXT REFERENCES gov.source_registry(source_id) ON DELETE SET NULL,
    dataset_name TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    total_records INTEGER NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    is_immutable BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_snap_dataset ON gov.historical_snapshots(dataset_name);

-- 3. Temporal Change Events
CREATE TABLE IF NOT EXISTS gov.change_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    delta_pct NUMERIC(8,2),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    source_id TEXT REFERENCES gov.source_registry(source_id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_change_entity ON gov.change_events(entity_type, entity_id);

-- 4. Statutory Rules (MPLADS 2023 Guidelines)
CREATE TABLE IF NOT EXISTS gov.statutory_rules (
    rule_id TEXT PRIMARY KEY,
    rule_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    legal_text TEXT NOT NULL,
    statutory_source TEXT NOT NULL,
    enacted_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Administrative Review Cases
CREATE TABLE IF NOT EXISTS gov.review_cases (
    case_id TEXT PRIMARY KEY, -- e.g. CASE_20260903_001
    entity_type TEXT NOT NULL CHECK (entity_type IN ('WORK', 'REPRESENTATIVE', 'CONTRACTOR', 'AGENCY')),
    entity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    risk_score NUMERIC(5,2) NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'ESCALATED')),
    assigned_to TEXT NOT NULL,
    assigned_role TEXT NOT NULL DEFAULT 'DISTRICT_AUTHORITY',
    created_by_user_id UUID, -- Will reference auth.users(id)
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_case_entity ON gov.review_cases(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_case_status ON gov.review_cases(status);
CREATE INDEX IF NOT EXISTS idx_case_severity ON gov.review_cases(severity);

-- 6. Append-Only Immutable Audit Trail
CREATE TABLE IF NOT EXISTS gov.audit_trail (
    audit_id BIGSERIAL PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES gov.review_cases(case_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    actor_user_id UUID, -- References auth.users(id)
    user_role TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_audit_case ON gov.audit_trail(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON gov.audit_trail(timestamp);
