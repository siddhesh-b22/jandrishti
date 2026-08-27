# SIH26102 — Trustworthy MPLADS Data Analytics & Explainable Anomaly Detection Platform

[![FastAPI Backend](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?logo=fastapi&logoColor=white)](http://localhost:8000/docs)
[![React 19 Frontend](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?logo=react&logoColor=black)](http://localhost:3000)
[![Python Tests](https://img.shields.io/badge/Pytest-33%2F33%20Passed-brightgreen.svg?logo=pytest&logoColor=white)](file:///tests/test_api.py)
[![Financial Reconciliation](https://img.shields.io/badge/%E2%82%B90.00%20Variance-Verified-success.svg)](file:///docs/RAJYA_SABHA_RECONCILIATION.md)
[![Parliamentary Scope](https://img.shields.io/badge/Parliament-Lok%20Sabha%20%26%20Rajya%20Sabha-blue.svg)](file:///docs/FINAL_ARCHITECTURE.md)

An end-to-end civic intelligence and public-sector audit platform providing complete, mathematically verifiable oversight of Member of Parliament Local Area Development Scheme (**MPLADS**) expenditures across both the **18th Lok Sabha** and **Rajya Sabha**.

---

## 1. Key Platform Capabilities

- **Full Bicameral Coverage:** 778 Members of Parliament (543 Lok Sabha + 235 Rajya Sabha) across all 36 States/UTs.
- **Strict Mathematical Reconciliation:** ₹0.00 variance across ₹11,667.55 Cr allocated limits and ₹3,947.46 Cr cumulative expenditure.
- **Physical Works Registry:** 102,437 physical works tracked across 4 categories and full lifecycle transitions.
- **Disbursement Vouchers:** 82,296 payment vouchers and 22,377 contractors with single-patron reliance percentiles.
- **Explainable Anomaly Engine:** 1,831 traceable statistical flags (1,804 Lok Sabha + 27 Rajya Sabha) powered by Robust Z-scores (MAD), Herfindahl-Hirschman Indices (HHI), and Isolation Forest unsupervised baselines.
- **15-Column Audit Traceability:** Every anomaly flag includes observed values, detection thresholds, statistical percentiles, and baseline comparisons without accusing any public representative of misconduct.
- **Interactive Multi-House Frontend:** React 19 + Tailwind dashboard featuring instant parliamentary house switching (`[ All Houses ]`, `[ Lok Sabha ]`, `[ Rajya Sabha ]`).

---

## 2. Bicameral Verification & Reconciliation Matrix

| Parameter | 18th Lok Sabha | Rajya Sabha | Combined Parliament | Official Source Totals | Reconciliation Variance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Members (MPs)** | 543 | 235 | **778** | 778 | **0 (Exact)** |
| **Allocated Limits** | ₹83,06,21,04,294.53 | ₹33,61,33,47,899.82 | **₹1,16,67,54,52,194.35** | ₹1,16,67,54,52,194.35 | **₹0.00 (Exact)** |
| **Total Expenditure** | ₹27,19,13,90,292.45 | ₹12,28,32,01,022.69 | **₹39,47,45,91,315.14** | ₹39,47,45,91,315.14 | **₹0.00 (Exact)** |
| **Unspent Balance** | ₹55,87,07,14,002.08 | ₹21,33,01,46,877.13 | **₹77,20,08,60,879.21** | ₹77,20,08,60,879.21 | **₹0.00 (Exact)** |
| **National Utilization** | 32.74% | 36.54% | **33.83%** | 33.83% | **0.00% (Exact)** |
| **Recommended Works** | 68,872 | 24,656 | **93,528** | 93,528 | **0 (Exact)** |
| **Completed Works** | 33,746 | 9,855 | **43,601** | 43,601 | **0 (Exact)** |
| **National Completion** | 49.00% | 39.97% | **46.62%** | 46.62% | **0.00% (Exact)** |
| **Physical Works (Granular)** | 102,437 | Not in Export | **102,437 (LS Only)** | 102,437 | **0 (No Fabrication)** |
| **Payment Vouchers (Granular)** | 82,296 | Not in Export | **82,296 (LS Only)** | 82,296 | **0 (No Fabrication)** |
| **Vendors / Contractors (Granular)**| 22,377 | Not in Export | **22,377 (LS Only)** | 22,377 | **0 (No Fabrication)** |
| **Explainable Flags** | 1,804 | 27 | **1,831** | 1,831 | **100% Traceable** |

---

## 3. Quick Start & Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Server Setup
```bash
# Activate virtual environment
.venv\Scripts\activate

# Run test suite (33 unit tests)
pytest -v

# Start FastAPI backend daemon on port 8000
uvicorn backend.main:app --port 8000 --reload
```
Interactive Swagger Documentation will be accessible at: `http://localhost:8000/docs`

### 2. Frontend Development Server
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Run TypeScript production build validation
npm run build

# Start Vite dev server on port 3000
npm run dev -- --host 127.0.0.1 --port 3000
```
Web application dashboard will be accessible at: `http://localhost:3000`

---

## 4. Repository Structure

```
SIH26102/
├── backend/
│   ├── config.py           # API configuration & metadata
│   ├── database.py         # SQLite connection pool & helpers
│   ├── main.py             # FastAPI REST endpoints & routes
│   └── schemas.py          # Pydantic validation models
├── database/
│   ├── mplads.db           # Master 3-NF SQLite Database
│   └── schema.sql          # DDL, indexes, and aggregation views
├── data/
│   ├── raw/
│   │   ├── lok_sabha/      # Immutable raw official Lok Sabha datasets
│   │   └── rajya_sabha/    # 40 official raw Rajya Sabha JSON artifacts
│   └── processed/
│       ├── dataset_checksums.csv   # SHA-256 cryptographic provenance registry
│       └── dataset_checksums.json  # Checksum registry JSON export
├── docs/
│   ├── FINAL_ARCHITECTURE.md           # Master technical system specification
│   ├── PHASE_10_SIH_READINESS.md       # SIH evaluation & hardening checklist
│   ├── PHASE_11_RAJYA_SABHA_AUDIT.md   # Rajya Sabha architectural audit
│   ├── RAJYA_SABHA_DATA_VALIDATION.md  # Official endpoint reverse-engineering report
│   ├── RAJYA_SABHA_RECONCILIATION.md   # Bicameral double-entry financial reconciliation
│   └── RAJYA_SABHA_DATA_PROVENANCE.md  # Cryptographic source artifact registry
├── frontend/
│   ├── src/
│   │   ├── api/            # Typed API client & interfaces
│   │   ├── components/     # Reusable UI components & charts
│   │   ├── context/        # Global House Context (Lok Sabha / Rajya Sabha)
│   │   ├── pages/          # 9 Responsive Civic Intelligence Views
│   │   └── App.tsx         # Main router & layout entrypoint
│   └── package.json        # React 19 + Tailwind + Vite configuration
├── scripts/
│   ├── ingest_rajya_sabha_data.py        # RS ingestion, normalization & anomaly detection
│   └── generate_rajya_sabha_checksums.py # SHA-256 generator for RS artifacts
├── tests/
│   └── test_api.py         # Comprehensive 33-test backend test suite
└── README.md
```

---

## 5. Ethical AI & Public Governance Standard

1. **Non-Accusatory Classification:** The platform evaluates statistical divergence from empirical peer baselines. It flags patterns that *require administrative review*, never asserting illegality or fraud.
2. **Missing Source Transparency:** Unobserved parameters (`latitude`, `longitude`, `sanctioned_amount`, `work_contractor`) are strictly preserved as `null` and displayed as *"Not available in current source export"*.
3. **Cartesian Safety:** Expenditure vouchers connect to MPs and Vendors without artificial, unverified linkages to individual physical work items.
4. **House Integrity:** Lok Sabha maintains territorial constituency semantics; Rajya Sabha maintains official State/UT representation and nominated categories without fake constituency mapping.
