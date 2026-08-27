import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.environ.get(
    "DATABASE_PATH",
    os.path.join(BASE_DIR, "database", "mplads.db")
)

# Application Metadata (No SIH branding — Pure JanDrishti Civic Data Intelligence)
API_TITLE = "JanDrishti — Civic Data Intelligence REST API"
API_VERSION = "1.0.0"
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
