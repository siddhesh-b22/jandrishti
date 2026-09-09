-- Record source integrity and validation state for every published dataset.
ALTER TABLE gov.historical_snapshots
    ADD COLUMN IF NOT EXISTS source_effective_date DATE,
    ADD COLUMN IF NOT EXISTS validation_status TEXT NOT NULL DEFAULT 'UNVALIDATED';

COMMENT ON COLUMN gov.historical_snapshots.sha256_hash IS
    'SHA-256 checksum of the immutable source artifact.';
