import os
from pathlib import Path
from urllib.parse import quote_plus

def _load_env_file(filepath: str):
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k and k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if os.environ.get("JANDRISHTI_USE_SQLITE") != "1":
    _load_env_file(os.path.join(BASE_DIR, ".env"))

DATABASE_PATH = os.environ.get(
    "DATABASE_PATH",
    os.path.join(BASE_DIR, "database", "mplads.db")
)
DB_PATH = DATABASE_PATH


def _build_database_url():
    if os.environ.get("JANDRISHTI_USE_SQLITE") == "1":
        return None
    explicit = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DB_URL")
    if explicit:
        explicit = explicit.strip().strip("'\"")
        # Normalize postgres:// to postgresql://
        if explicit.startswith("postgres://"):
            explicit = "postgresql://" + explicit[len("postgres://"):]
        # Remove literal brackets if user copied [YOUR-PASSWORD] with brackets: :[pass]@ -> :pass@
        import re
        explicit = re.sub(r":\[([^\]]+)\]@", r":\1@", explicit)
        # Ensure sslmode is present for remote Supabase connections
        if "supabase" in explicit and "sslmode" not in explicit:
            sep = "&" if "?" in explicit else "?"
            explicit = f"{explicit}{sep}sslmode=require"
        return explicit
    password = os.environ.get("SUPABASE_DB_PASSWORD") or os.environ.get("PGPASSWORD")
    if not password:
        return None
    password = password.strip().strip("'\"")
    if password.startswith("[") and password.endswith("]"):
        password = password[1:-1]
    host = os.environ.get("SUPABASE_DB_HOST", "aws-0-ap-northeast-1.pooler.supabase.com")
    port = os.environ.get("SUPABASE_DB_PORT", "5432")
    user = os.environ.get("SUPABASE_DB_USER", "postgres.dvbqjjwudtbkzjmlcvgo")
    dbname = os.environ.get("SUPABASE_DB_NAME", "postgres")
    return (
        f"postgresql://{quote_plus(user)}:{quote_plus(password)}"
        f"@{host}:{port}/{dbname}?sslmode=require"
    )


DATABASE_URL = _build_database_url()
USING_POSTGRES = bool(DATABASE_URL)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get(
    "SUPABASE_ANON_KEY",
    os.environ.get("SUPABASE_PUBLISHABLE_KEY", ""),
)
SUPABASE_PUBLISHABLE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY", SUPABASE_ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    os.environ.get("SUPABASE_SECRET_KEY", ""),
)
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY", SUPABASE_SERVICE_ROLE_KEY)
SUPABASE_JWKS_URL = os.environ.get("SUPABASE_JWKS_URL", "")

# Storage Buckets
STORAGE_BUCKET_REPRESENTATIVES = os.environ.get("STORAGE_BUCKET_REPRESENTATIVES", "representatives")
STORAGE_BUCKET_INSPECTIONS = os.environ.get("STORAGE_BUCKET_INSPECTIONS", "field-inspections")
STORAGE_BUCKET_EVIDENCE = os.environ.get("STORAGE_BUCKET_EVIDENCE", "audit-evidence")

# Application Metadata (No SIH branding — Pure JanDrishti Civic Data Intelligence)
API_TITLE = "JanDrishti — Civic Data Intelligence REST API"
API_VERSION = "1.0.1"
DATA_SNAPSHOT_DATE = "26 August 2026"

API_DESCRIPTION = """
## JanDrishti — Civic Data Intelligence REST API
### Data Snapshot — 26 August 2026

An open public data intelligence API providing deterministic, double-entry verified tracking of Indian Parliamentary Local Area Development allocations, physical infrastructure delivery, treasury disbursement vouchers, and statistical anomaly detection.

### Core Datasets & Authoritative Verification Metrics:
- **Parliamentary Representatives:** 778 MPs (543 Lok Sabha + 235 Rajya Sabha).
- **Territorial Geography:** 28 States & 8 Union Territories (36 Territorial Units).
- **Physical Works Delivered:** 102,437 distinct public projects.
- **Treasury Disbursements:** 82,296 line-item treasury vouchers with ₹0.00 reconciliation variance.
- **Contractor Intelligence:** 22,377 contractors and single-patron reliance percentiles.
- **MAD Statistical Signals:** 1,831 objective, non-accusatory analytical audit flags (21 Critical, 614 High, 209 Medium, 987 Low).
"""
