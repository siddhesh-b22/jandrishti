-- =============================================================================
-- JANDRISHTI PRODUCTION MIGRATION 004: ML & VECTOR STORE SCHEMA
-- =============================================================================

-- 1. ML Model Runs
CREATE TABLE IF NOT EXISTS ml.model_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    input_snapshot_id UUID REFERENCES gov.historical_snapshots(snapshot_id) ON DELETE SET NULL,
    execution_start TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    execution_end TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    records_processed INTEGER,
    anomalies_flagged INTEGER
);

-- 2. Anomaly Signals (1,831 Statistical MAD Outliers)
CREATE TABLE IF NOT EXISTS ml.anomaly_signals (
    signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_anomaly_id TEXT UNIQUE, -- e.g. ANOM_000001
    entity_type TEXT NOT NULL CHECK (entity_type IN ('WORK', 'REPRESENTATIVE', 'CONTRACTOR', 'TRANSACTION', 'AGENCY')),
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    state_id SMALLINT REFERENCES public.states(state_id) ON DELETE SET NULL,
    anomaly_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    anomaly_score NUMERIC(6,2) NOT NULL,
    detection_method TEXT NOT NULL,
    baseline_metric TEXT,
    observed_value NUMERIC(18,2),
    expected_value NUMERIC(18,2),
    reason TEXT NOT NULL,
    statutory_citation TEXT,
    run_id UUID REFERENCES ml.model_runs(run_id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS idx_sig_entity ON ml.anomaly_signals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sig_type ON ml.anomaly_signals(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_sig_sev ON ml.anomaly_signals(severity);
CREATE INDEX IF NOT EXISTS idx_sig_score ON ml.anomaly_signals(anomaly_score);

-- 3. Work Vector Embeddings (384-dimensional all-MiniLM-L6-v2)
CREATE TABLE IF NOT EXISTS ml.work_embeddings (
    work_id BIGINT PRIMARY KEY REFERENCES public.infrastructure_works(work_id) ON DELETE CASCADE,
    embedding_model TEXT NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    embedding_vector VECTOR(384) NOT NULL,
    token_count INTEGER,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
-- HNSW Vector Index for sub-5ms cosine similarity
CREATE INDEX IF NOT EXISTS idx_work_vec_hnsw ON ml.work_embeddings USING hnsw (embedding_vector vector_cosine_ops) WITH (m = 16, ef_construction = 64);
