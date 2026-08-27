-- ====================================================================
-- SIH26102 — MPLADS Normalized Relational Database Schema (SQLite)
-- Schema Version: 1.0 (Phase 7 Prototype)
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. DATA SOURCES & PROVENANCE
CREATE TABLE IF NOT EXISTS data_sources (
    source_id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_url TEXT,
    dataset_name TEXT NOT NULL,
    download_date TEXT NOT NULL,
    description TEXT NOT NULL,
    record_count INTEGER NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

-- 2. MEMBERS OF PARLIAMENT (MP MASTER)
-- Note: internal_mp_id (e.g. INTERNAL_MP_001) is an internal pipeline identifier, not an official government ID.
CREATE TABLE IF NOT EXISTS mps (
    internal_mp_id TEXT PRIMARY KEY,
    mp_name_raw TEXT NOT NULL,
    mp_name_normalized TEXT NOT NULL,
    constituency_raw TEXT NOT NULL,
    constituency_normalized TEXT NOT NULL,
    state_raw TEXT NOT NULL,
    state_normalized TEXT NOT NULL,
    house TEXT NOT NULL DEFAULT 'Lok Sabha',
    allocated_amount REAL NOT NULL,
    total_expenditure REAL NOT NULL,
    unspent_amount REAL NOT NULL,
    utilization_pct REAL NOT NULL,
    recommended_works_count INTEGER NOT NULL,
    completed_works_count INTEGER NOT NULL,
    completion_rate_pct REAL NOT NULL,
    transaction_count INTEGER NOT NULL,
    successful_payments_count INTEGER NOT NULL,
    pending_payments_count INTEGER NOT NULL,
    average_rating REAL,
    source_dataset TEXT NOT NULL,
    source_file TEXT NOT NULL,
    source_download_date TEXT NOT NULL,
    pipeline_created_at TEXT NOT NULL
);

-- 3. ALLOCATIONS & FISCAL LIMITS
CREATE TABLE IF NOT EXISTS allocations (
    internal_mp_id TEXT PRIMARY KEY,
    mp_name_normalized TEXT NOT NULL,
    constituency_normalized TEXT NOT NULL,
    state_normalized TEXT NOT NULL,
    allocated_amount REAL NOT NULL,
    total_expenditure REAL NOT NULL,
    unspent_amount REAL NOT NULL,
    utilization_pct REAL NOT NULL,
    source_dataset TEXT NOT NULL,
    source_file TEXT NOT NULL,
    source_download_date TEXT NOT NULL,
    pipeline_created_at TEXT NOT NULL,
    FOREIGN KEY (internal_mp_id) REFERENCES mps(internal_mp_id) ON DELETE CASCADE
);

-- 4. VENDORS & CONTRACTORS (DERIVED VENDOR MASTER)
-- Note: internal_vendor_id is an internal pipeline identifier.
CREATE TABLE IF NOT EXISTS vendors (
    internal_vendor_id TEXT PRIMARY KEY,
    vendor_name_raw TEXT NOT NULL,
    vendor_name_normalized TEXT NOT NULL UNIQUE,
    total_received_amount REAL NOT NULL,
    total_transaction_count INTEGER NOT NULL,
    unique_mps_served INTEGER NOT NULL,
    unique_states_served INTEGER NOT NULL,
    primary_state TEXT,
    primary_activity TEXT,
    primary_mp_id TEXT,
    primary_mp_name TEXT,
    single_mp_reliance_pct REAL NOT NULL,
    vendor_revenue_percentile REAL,
    vendor_revenue_robust_zscore REAL,
    average_ticket_size REAL,
    source_dataset TEXT NOT NULL,
    source_file TEXT NOT NULL,
    source_download_date TEXT NOT NULL,
    pipeline_created_at TEXT NOT NULL
);

-- 5. PHYSICAL WORKS (WORK MASTER)
-- Note: Represents distinct physical works (1:1 work grain).
CREATE TABLE IF NOT EXISTS works (
    work_id INTEGER PRIMARY KEY,
    internal_mp_id TEXT NOT NULL,
    mp_name_raw TEXT NOT NULL,
    mp_name_normalized TEXT NOT NULL,
    constituency_raw TEXT,
    constituency_normalized TEXT NOT NULL,
    state_raw TEXT,
    state_normalized TEXT NOT NULL,
    house TEXT NOT NULL DEFAULT 'Lok Sabha',
    category_raw TEXT,
    category_normalized TEXT NOT NULL,
    work_description_raw TEXT,
    work_description_normalized TEXT,
    ida_raw TEXT,
    ida_normalized TEXT NOT NULL,
    lifecycle_status TEXT NOT NULL,
    recommended_amount REAL,
    recommendation_date TEXT,
    recommendation_year INTEGER,
    recommendation_month INTEGER,
    final_amount REAL,
    completed_date TEXT,
    completion_year INTEGER,
    completion_month INTEGER,
    duration_days INTEGER,
    cost_variance_amount REAL,
    cost_variance_pct REAL,
    has_images INTEGER NOT NULL DEFAULT 0,
    average_rating REAL,
    -- Unavailable government fields explicitly declared NULL
    sanctioned_amount REAL,
    sanction_date TEXT,
    latitude REAL,
    longitude REAL,
    village TEXT,
    block TEXT,
    gram_panchayat TEXT,
    work_contractor TEXT,
    fund_released REAL,
    district_treasury_utilization REAL,
    source_files TEXT NOT NULL,
    match_method TEXT NOT NULL,
    match_confidence REAL NOT NULL,
    pipeline_created_at TEXT NOT NULL,
    FOREIGN KEY (internal_mp_id) REFERENCES mps(internal_mp_id) ON DELETE CASCADE
);

-- 6. EXPENDITURE TRANSACTIONS (1:1 VOUCHER GRAIN)
-- Note: Foreign keys link to mps and vendors. NO FK to works because public export lacks Work ID in expenditures.
CREATE TABLE IF NOT EXISTS transactions (
    internal_transaction_id TEXT PRIMARY KEY,
    internal_mp_id TEXT NOT NULL,
    internal_vendor_id TEXT NOT NULL,
    mp_name_raw TEXT NOT NULL,
    mp_name_normalized TEXT NOT NULL,
    constituency_raw TEXT,
    constituency_normalized TEXT NOT NULL,
    state_raw TEXT,
    state_normalized TEXT NOT NULL,
    house TEXT NOT NULL DEFAULT 'Lok Sabha',
    vendor_name_raw TEXT NOT NULL,
    vendor_name_normalized TEXT NOT NULL,
    activity_description_raw TEXT NOT NULL,
    activity_description_normalized TEXT NOT NULL,
    ida_raw TEXT,
    ida_normalized TEXT NOT NULL,
    expenditure_amount REAL NOT NULL,
    expenditure_date TEXT NOT NULL,
    expenditure_year INTEGER,
    expenditure_month INTEGER,
    payment_status TEXT NOT NULL,
    activity_amount_percentile REAL,
    activity_amount_robust_zscore REAL,
    transaction_to_mp_total_exp_pct REAL,
    source_dataset TEXT NOT NULL,
    source_file TEXT NOT NULL,
    source_download_date TEXT NOT NULL,
    match_method TEXT NOT NULL,
    pipeline_created_at TEXT NOT NULL,
    FOREIGN KEY (internal_mp_id) REFERENCES mps(internal_mp_id) ON DELETE CASCADE,
    FOREIGN KEY (internal_vendor_id) REFERENCES vendors(internal_vendor_id) ON DELETE CASCADE
);

-- 7. EXPLAINABLE ANOMALIES & AUDIT FLAGS
CREATE TABLE IF NOT EXISTS anomalies (
    anomaly_id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL, -- 'WORK', 'MP', 'TRANSACTION', 'VENDOR'
    entity_id TEXT NOT NULL,
    anomaly_type TEXT NOT NULL,
    anomaly_score REAL NOT NULL,
    severity TEXT NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    reason TEXT NOT NULL,
    supporting_metrics TEXT NOT NULL,
    detection_method TEXT NOT NULL,
    threshold_value TEXT,
    observed_value TEXT,
    percentile REAL,
    robust_zscore REAL,
    baseline_reference TEXT,
    generated_at TEXT NOT NULL
);

-- ====================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING & API RESPONSES
-- ====================================================================

-- MP Indexes
CREATE INDEX IF NOT EXISTS idx_mps_state ON mps(state_normalized);
CREATE INDEX IF NOT EXISTS idx_mps_constituency ON mps(constituency_normalized);
CREATE INDEX IF NOT EXISTS idx_mps_utilization ON mps(utilization_pct);

-- Works Indexes
CREATE INDEX IF NOT EXISTS idx_works_mp_id ON works(internal_mp_id);
CREATE INDEX IF NOT EXISTS idx_works_state ON works(state_normalized);
CREATE INDEX IF NOT EXISTS idx_works_constituency ON works(constituency_normalized);
CREATE INDEX IF NOT EXISTS idx_works_category ON works(category_normalized);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_works_rec_amount ON works(recommended_amount);
CREATE INDEX IF NOT EXISTS idx_works_final_amount ON works(final_amount);
CREATE INDEX IF NOT EXISTS idx_works_rec_year ON works(recommendation_year);
CREATE INDEX IF NOT EXISTS idx_works_comp_year ON works(completion_year);

-- Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_tx_mp_id ON transactions(internal_mp_id);
CREATE INDEX IF NOT EXISTS idx_tx_vendor_id ON transactions(internal_vendor_id);
CREATE INDEX IF NOT EXISTS idx_tx_state ON transactions(state_normalized);
CREATE INDEX IF NOT EXISTS idx_tx_amount ON transactions(expenditure_amount);
CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(expenditure_date);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(payment_status);

-- Vendors Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_revenue ON vendors(total_received_amount);
CREATE INDEX IF NOT EXISTS idx_vendors_primary_mp ON vendors(primary_mp_id);
CREATE INDEX IF NOT EXISTS idx_vendors_reliance ON vendors(single_mp_reliance_pct);

-- Anomalies Indexes
CREATE INDEX IF NOT EXISTS idx_anom_entity ON anomalies(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_anom_type ON anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_anom_severity ON anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_anom_score ON anomalies(anomaly_score);

-- ====================================================================
-- VIEWS: CONTROLLED ANALYTICAL AGGREGATIONS & METRIC LAYERS
-- ====================================================================

-- View 1: Works with non-additive MP reference metadata explicitly prefixed
CREATE VIEW IF NOT EXISTS v_works_with_mp_ref AS
SELECT 
    w.*,
    m.allocated_amount AS mp_level_ref_allocated_amount,
    m.total_expenditure AS mp_level_ref_total_expenditure,
    m.utilization_pct AS mp_level_ref_utilization_pct,
    m.completion_rate_pct AS mp_level_ref_completion_rate_pct
FROM works w
JOIN mps m ON w.internal_mp_id = m.internal_mp_id;

-- View 2: State-level macro roll-up derived strictly from 1:1 MP table
CREATE VIEW IF NOT EXISTS v_state_summary AS
SELECT 
    state_normalized AS state,
    COUNT(DISTINCT internal_mp_id) AS total_mps,
    SUM(allocated_amount) AS total_allocated_amount,
    SUM(total_expenditure) AS total_expenditure,
    SUM(unspent_amount) AS total_unspent_amount,
    ROUND((SUM(total_expenditure) / SUM(allocated_amount)) * 100.0, 2) AS state_utilization_pct,
    SUM(recommended_works_count) AS total_recommended_works,
    SUM(completed_works_count) AS total_completed_works,
    ROUND((CAST(SUM(completed_works_count) AS REAL) / NULLIF(SUM(recommended_works_count), 0)) * 100.0, 2) AS state_completion_rate_pct,
    SUM(transaction_count) AS total_transactions,
    SUM(successful_payments_count) AS total_successful_payments,
    SUM(pending_payments_count) AS total_pending_payments
FROM mps
GROUP BY state_normalized;

-- View 3: Constituency summary derived from MP master
CREATE VIEW IF NOT EXISTS v_constituency_summary AS
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
FROM mps;
