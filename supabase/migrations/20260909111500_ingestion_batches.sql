CREATE TABLE IF NOT EXISTS gov.ingestion_batches (
    batch_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES gov.source_registry(source_id) ON DELETE RESTRICT,
    dataset_name TEXT NOT NULL,
    source_effective_date DATE,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    checksum_sha256 TEXT NOT NULL,
    record_count INTEGER NOT NULL DEFAULT 0,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'FETCHED',
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS gov.source_health (
    source_id TEXT PRIMARY KEY REFERENCES gov.source_registry(source_id) ON DELETE CASCADE,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    last_success_at TIMESTAMPTZ,
    last_batch_id TEXT,
    status TEXT NOT NULL,
    http_status INTEGER,
    error_message TEXT
);
