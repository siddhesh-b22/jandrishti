-- Additive provenance fields for existing SQLite snapshots.
-- New databases receive these fields from database/schema.sql.
ALTER TABLE data_sources ADD COLUMN source_checksum_sha256 TEXT;
ALTER TABLE data_sources ADD COLUMN source_effective_date TEXT;
ALTER TABLE data_sources ADD COLUMN validation_status TEXT NOT NULL DEFAULT 'UNVALIDATED';
