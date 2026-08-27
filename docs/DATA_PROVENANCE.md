# SIH26102 — Data Provenance & Dataset Registry

**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Target Period:** 18th Lok Sabha (2024–2026 Public Datasets)  
**Data Release Date:** 2026-08-26  
**Reconciliation Status:** **100% Validated (₹0.00 Variance against Official Portal Benchmarks)**  

---

## 1. Raw Source Datasets Inventory

All raw public exports were acquired from the official Government of India MPLADS portal (`https://mplads.gov.in/`) and are preserved in immutability in `data/raw/`:

| Dataset Identifier | Raw Filename | Source URL / Origin | Download Date | Record Count | File Size (Bytes) | SHA-256 Checksum |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SRC_MP_SUMMARY` | `mplads_mp_summary_2026-08-26.csv` | `https://mplads.gov.in/` | `2026-08-26` | **543** | 65,885 | `1a49fb26bae8f2425cf152643a60a7e6cf9cfc9d2f2d93e83949f50dfa12d1c0` |
| `SRC_REC_WORKS` | `mplads_recommended_works_2026-08-26.csv` | `https://mplads.gov.in/` | `2026-08-26` | **68,872** | 17,782,809 | `a5d613204b414d92a0e5b7fb607e4460dfdf870f7bb0d28399580b06ad72a392` |
| `SRC_COMP_WORKS` | `mplads_completed_works_2026-08-26.csv` | `https://mplads.gov.in/` | `2026-08-26` | **33,746** | 8,693,682 | `c745e55881912e5a430ad81fc20b66b7c9381ea54086ad33496c1411516e885d` |
| `SRC_EXPENDITURES` | `mplads_expenditures_2026-08-26.csv` | `https://mplads.gov.in/` | `2026-08-26` | **82,296** | 19,400,732 | `ab2bf1cb655260bc1c768926ea680e909a80572d4b9678170c0c7e2f5ff50b86` |
| `SRC_PORTAL_JSON` | `json_2026-08-26.json` | `https://mplads.gov.in/` | `2026-08-26` | **1** | 584 | `ae4a5193f2a0291a1e0b5d5d83626c71c6684aa5c1d68ae1dae185ae3c0c1b72` |

---

## 2. Processed Normalized Tables Inventory (`data/processed/`)

| Normalized Table | Entity Grain | Row Count | Primary Key | Foreign Key Links | SHA-256 Checksum |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `mp_master.csv` | 1 row per Member of Parliament | **543** | `internal_mp_id` | — | `d199258059427925c4efc1341c2c3102462e08e646272551cf4ba42ee6a5c102` |
| `allocation_master.csv` | 1 row per MP Fiscal Balance | **543** | `internal_mp_id` | `mps` | `42ba35697a1b83ce6f30a911c75c879e612f00f08e4ad2ad44a04d306b3fa122` |
| `work_master.csv` | 1 row per Physical Work Item | **102,437** | `work_id` | `mps` | `7ba3d88abcaaef15cf8231c51da2542a225e364942bc02a2080a2569b9101f30` |
| `expenditure_master.csv`| 1 row per Payment Voucher | **82,296** | `internal_transaction_id` | `mps`, `vendors` | `a1ceed27a58714ff94d4850fa919cbe353e6b2fe11f95beec9e7552945d82046` |
| `vendor_master.csv` | 1 row per Vendor / Contractor | **22,377** | `internal_vendor_id` | — | `f807a80c3da9f229fa1a3f01baeb9583b27b952bc03cb6477d9cbf6d071c77c6` |
| `mplads_master_dataset.csv`| Master Work Registry with MP Refs | **102,437** | `work_id` | `mps` | `e9a6c93447390bf5fa3569d95f87b8f9e20a0ee4a2754fa7b864a7c1328eb97e` |
| `anomaly_results.csv` | Explainable Audit Flags (15 Cols) | **1,804** | `anomaly_id` | Entities | `6090684f4270f3583cb3b5d95d10a26d744f434a94639cfc1a5563910c5da8dc` |

---

## 3. Financial Reconciliation Proof (Zero Tolerance Variance)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ METRIC                          OFFICIAL BENCHMARK           PLATFORM ACTUAL       VARIANCE │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Total Allocated Amount          ₹83,062,104,294.53        ₹83,062,104,294.53          ₹0.00 │
│ Total Cumulative Expenditure    ₹27,191,390,292.45        ₹27,191,390,292.45          ₹0.00 │
│ Total Recommended Works Value   ₹39,681,479,028.54        ₹39,681,479,028.54          ₹0.00 │
│ Total Completed Works Value     ₹16,260,632,748.40        ₹16,260,632,748.40          ₹0.00 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Entity Provenance & Surrogate ID Disclosures

1. **`internal_mp_id` (`INTERNAL_MP_001` ... `INTERNAL_MP_543`):** Pipeline surrogate primary key generated deterministically from `House + State + Constituency + normalized MP Name`. It is an internal identifier and not an official government ID.
2. **`internal_vendor_id` (`INTERNAL_VND_00001` ... `INTERNAL_VND_22377`):** Pipeline surrogate primary key generated from normalized vendor legal entities.
3. **`internal_transaction_id` (`TXN_000001` ... `TXN_082296`):** Pipeline surrogate voucher primary key.
4. **Relational Decoupling:** In the public government export, expenditure records have no `Work ID`. Transactions connect to MPs and Vendors, NOT physical works.
