# SIH26102 — Reproducibility & Pipeline Execution Guide

**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Target Environment:** Python 3.10+ & Node.js 18+  
**Determinism Guarantee:** 100% Reproducible end-to-end pipeline with zero randomness drift  

---

## 1. End-to-End Pipeline Execution Order

To rebuild the entire platform from the raw public government exports to the interactive web frontend, execute the following commands in exact sequence:

```bash
# ---------------------------------------------------------
# Step 1: Environment Setup
# ---------------------------------------------------------
python -m venv .venv
.venv\Scripts\activate            # Windows (or source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt

# ---------------------------------------------------------
# Step 2: Data Normalization & Entity Reconciliation (Phases 3 & 4)
# ---------------------------------------------------------
python scripts/generate_normalized_dataset.py
# Input:  data/raw/ (5 raw source files)
# Output: data/processed/mp_master.csv, allocation_master.csv, work_master.csv,
#         expenditure_master.csv, vendor_master.csv, mplads_master_dataset.csv
# Target: 543 MPs, 102,437 Works, 82,296 Transactions, 22,377 Vendors

# ---------------------------------------------------------
# Step 3: Feature Engineering (Phase 5)
# ---------------------------------------------------------
python scripts/generate_features.py
# Input:  data/processed/ master tables
# Output: data/features/work_features.csv, transaction_features.csv,
#         mp_features.csv, vendor_features.csv

# ---------------------------------------------------------
# Step 4: Explainable Anomaly Detection Engine (Phase 5.1)
# ---------------------------------------------------------
python scripts/generate_anomalies.py
# Input:  data/features/ matrices
# Output: data/processed/anomaly_results.csv (1,804 traceable flags with 15 columns)

# ---------------------------------------------------------
# Step 5: Relational Database Architecture (Phase 7)
# ---------------------------------------------------------
python scripts/build_database.py
# Input:  database/schema.sql, data/processed/ CSV files
# Output: database/mplads.db (SQLite 3-NF database with 7 tables & 18 indexes)

# ---------------------------------------------------------
# Step 6: Backend API Verification (Phase 8)
# ---------------------------------------------------------
pytest -v
# Executes 25 API test cases against database/mplads.db (Target: 25/25 PASSED)

# ---------------------------------------------------------
# Step 7: Live UI & API Integration Audit (Phase 9.1)
# ---------------------------------------------------------
python scripts/audit_ui_integration.py
# Validates live endpoints, response schemas, and 8 sample explainability records

# ---------------------------------------------------------
# Step 8: Frontend Build & Compilation (Phase 9)
# ---------------------------------------------------------
cd frontend
npm install
npm run build
# Target: 0 TypeScript errors, 0 build failures
```

---

## 2. Deterministic Verification Checkpoints

| Checkpoint | Target Entity / Metric | Expected Value | Verification Command |
| :--- | :--- | :--- | :--- |
| **MP Master Count** | Total MPs | `543` | `SELECT COUNT(*) FROM mps;` $\rightarrow 543$ |
| **Works Master Count** | Total Physical Works | `102,437` | `SELECT COUNT(*) FROM works;` $\rightarrow 102,437$ |
| **Expenditure Count** | Total Transactions | `82,296` | `SELECT COUNT(*) FROM transactions;` $\rightarrow 82,296$ |
| **Vendor Count** | Total Contractors | `22,377` | `SELECT COUNT(*) FROM vendors;` $\rightarrow 22,377$ |
| **Anomaly Flags** | Traceable Anomalies | `1,804` | `SELECT COUNT(*) FROM anomalies;` $\rightarrow 1,804$ |
| **Financial Reconciliation** | Total Allocated Funds | `₹83,062,104,294.53` | `SELECT SUM(allocated_amount) FROM allocation_master;` |
| **Financial Reconciliation** | Total Expenditures | `₹27,191,390,292.45` | `SELECT SUM(total_expenditure) FROM allocation_master;` |

---

## 3. Dataset Checksums Verification

To verify that the processed dataset outputs match the validated SIH snapshot hashes exactly, run:

```bash
python scripts/generate_dataset_checksums.py
```
Compare generated hashes against [`docs/DATA_PROVENANCE.md`](file:///d:/SIH26102/docs/DATA_PROVENANCE.md).
