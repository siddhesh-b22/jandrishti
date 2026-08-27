# SIH26102 — Project Inventory & State Assessment

**Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Lead AI Software Architect & Engineering Assessment**

---

## 1. Project Structure

The project has been organized into a robust, modular directory layout adhering to strict data governance, immutability of raw inputs, and separation of concerns:

```text
SIH26102/
├── .venv/                               # Dedicated Python 3.13 virtual environment
├── data/
│   ├── raw/                             # Immutable raw government datasets (DO NOT MODIFY)
│   │   ├── json_2026-08-26.json
│   │   ├── mplads_completed_works_2026-08-26.csv
│   │   ├── mplads_expenditures_2026-08-26.csv
│   │   ├── mplads_mp_summary_2026-08-26.csv
│   │   └── mplads_recommended_works_2026-08-26.csv
│   ├── processed/                       # Profiling metadata, reports, and future normalized/master tables
│   │   ├── data_profile.csv
│   │   ├── data_profile_report.md
│   │   ├── merge_strategy.md
│   │   ├── profiling_meta.json
│   │   └── relationship_meta.json
│   └── features/                        # Engineered feature matrices (Phase 5)
├── docs/                                # Project documentation, architecture, and data models
│   ├── project_inventory.md
│   └── data_model.md                    (Upcoming in Phase 3)
├── scripts/                             # Reproducible ETL, profiling, and validation scripts
│   ├── profile_datasets.py
│   ├── deep_diagnostics.py
│   └── verify_mp_reconciliation.py
├── backend/                             # FastAPI application & SQLite/Postgres persistence (Phase 7-8)
├── frontend/                            # Next.js/React responsive dashboard (Phase 9)
├── 00_PROJECT_CONTEXT.md                # Project background specification
├── 01_DATA_PIPELINE.md                  # Authoritative ETL pipeline directives
├── 02_MASTER_DATASET_SPEC.md            # Canonical master dataset rules & constraints
├── 03_ANALYTICS_AND_ANOMALY.md          # Anomaly engine & explainability rules
├── 04_BACKEND_AND_API.md                # REST API architecture specification
├── 05_FRONTEND_REQUIREMENTS.md          # Web UI & dashboard design requirements
├── 06_AGENT_RULES.md                    # Core operational constraints & integrity rules
├── README.md                            # Antigravity instruction pack index
└── requirements.txt                     # Frozen Python environment dependencies
```

---

## 2. Discovered Datasets

All raw datasets located in `data/raw/` were verified for byte-integrity and profiled:

| Dataset Name | File Format | File Size | Exact Rows | Exact Columns | Primary Key / Grain | Key Reconciled Metrics |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `mplads_mp_summary_2026-08-26.csv` | CSV (UTF-8) | 65.8 KB (65,885 B) | 543 | 15 | `MP Name` (1:1 MP grain) | 543 Lok Sabha MPs; ₹83.06B Allocated; ₹27.19B Total Expenditure; 68,872 Recommended Works; 33,746 Completed Works; 82,296 Transactions |
| `mplads_recommended_works_2026-08-26.csv` | CSV (UTF-8) | 16.96 MB (17,782,809 B) | 68,872 | 11 | `Work ID` (1:1 Recommended Work) | 68,872 unique Work IDs across 538 MPs; Total Recommended Value: ₹39,681,479,028.54; 4 Categories; 749 IDAs |
| `mplads_completed_works_2026-08-26.csv` | CSV (UTF-8) | 8.29 MB (8,693,682 B) | 33,746 | 12 | `Work ID` (1:1 Completed Work) | 33,746 unique Work IDs across 501 MPs; Total Completed Value: ₹16,260,632,748.40; 3 Categories; 667 IDAs |
| `mplads_expenditures_2026-08-26.csv` | CSV (UTF-8) | 18.50 MB (19,400,732 B) | 82,296 | 10 | Transaction Grain (`transaction_id`) | 82,296 transactions across 531 MPs & 23,111 Vendors; Total Expenditure: ₹27,191,390,292.45; ₹26.21B Success / ₹984M In-Progress |
| `json_2026-08-26.json` | JSON (UTF-8) | 584 B | 1 (Object) | 12 attributes | Portal Summary Cache | Benchmark summary totals directly from the official MPLADS portal |

---

## 3. Discovered Code & Tooling

1. **Active Python Environment:**
   - Python version: `3.13.11` (x86_64 Windows)
   - Virtual Environment: `.venv` configured in workspace root
   - Core libraries installed: `pandas 3.0.5`, `numpy 2.5.2`, `scikit-learn 1.9.0`, `scipy 1.18.1`
   - Dependency manifest: `requirements.txt`
2. **Active Node.js Environment:**
   - Node.js version: `v22.21.1`
   - npm version: `11.1.0`
3. **ETL & Diagnostic Scripts Created:**
   - `scripts/profile_datasets.py`: Automated scanning, type inference, null detection, currency cleaning, and schema profiling.
   - `scripts/deep_diagnostics.py`: Mathematical totals reconciliation vs portal summary JSON, duplicate analysis, and work ID intersection tests.
   - `scripts/verify_mp_reconciliation.py`: Per-MP cross-table 100% reconciliation verification across all 543 MPs.

---

## 4. Current Implementation Status

| Phase | Description | Status | Deliverables / Notes |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Project Inspection & Inventory | **COMPLETED** | `docs/project_inventory.md` generated; clean workspace layout established. |
| **Phase 1** | Data Profiling | **COMPLETED** | `data/processed/data_profile_report.md` & `data/processed/data_profile.csv` generated. |
| **Phase 2** | Relationship Analysis & Merge Strategy | **COMPLETED** | `data/processed/merge_strategy.md` generated; 100% mathematical reconciliation proved. |
| **Phase 3** | Data Model Design | **AWAITING APPROVAL** | Normalized relational schema drafted (MP, Work, Transaction, Vendor, Allocation). |
| **Phase 4** | Master Dataset / ETL Implementation | **AWAITING APPROVAL** | Python ETL pipeline ready to generate normalized master tables + analytical views. |
| **Phase 5** | Feature Engineering | **PENDING** | Cost ratios, duration metrics, vendor concentration metrics. |
| **Phase 6** | Explainable Anomaly Engine | **PENDING** | Statistical thresholds, Isolation Forest, text similarity matching with explainable reasons. |
| **Phase 7** | SQLite / Relational Database Setup | **PENDING** | Schema creation, indexes, foreign keys, views. |
| **Phase 8** | FastAPI Backend API | **PENDING** | REST endpoints for overview, MPs, works, anomalies, vendors, and filters. |
| **Phase 9** | React / Next.js Web Dashboard | **PENDING** | Public accountability UI, charts, drill-downs, work explorer, and methodology disclosures. |
| **Phase 10**| Future Data Extensibility & Testing | **PENDING** | Ingestion pipeline for future sanctions, GPS coordinates, and administrative releases. |

---

## 5. Proposed Implementation Roadmap

1. **Step A (Current Milestone):** Submit Data Profiling, Project Inventory, and Merge Strategy for User Review & Explicit Approval.
2. **Step B (Phase 3 & 4):** Implement modular ETL (`scripts/build_master_dataset.py`) producing `data/processed/mp_master.csv`, `data/processed/work_master.csv`, `data/processed/expenditure_master.csv`, `data/processed/vendor_master.csv`, and `data/processed/mplads_analytical_master.csv` with automated validation checks (`master_validation_report.md`).
3. **Step C (Phase 5 & 6):** Feature engineering and multi-dimensional Explainable Anomaly Detection Engine (`scripts/run_anomaly_engine.py`).
4. **Step D (Phase 7 & 8):** SQLite database creation with indexed tables/views and FastAPI backend implementation with comprehensive REST APIs.
5. **Step E (Phase 9 & 10):** Next.js dashboard UI implementation, end-to-end integration, performance tuning, and documentation.
