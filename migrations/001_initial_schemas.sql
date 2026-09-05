-- =============================================================================
-- JANDRISHTI PRODUCTION MIGRATION 001: EXTENSIONS & SCHEMAS
-- =============================================================================

-- Enable required extensions idempotently
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create isolated database schemas
CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS gov;
CREATE SCHEMA IF NOT EXISTS ml;
CREATE SCHEMA IF NOT EXISTS analytics;

COMMENT ON SCHEMA raw IS 'Immutable raw ingestion landing with SHA-256 integrity hashes';
COMMENT ON SCHEMA public IS 'Canonical core 3NF relational models for public infrastructure';
COMMENT ON SCHEMA gov IS 'Civic governance, provenance, case management, and append-only audit trail';
COMMENT ON SCHEMA ml IS 'Machine learning models, empirical outlier signals, and pgvector embeddings';
COMMENT ON SCHEMA analytics IS 'Pre-aggregated materialized views for sub-10ms UI dashboard responses';
