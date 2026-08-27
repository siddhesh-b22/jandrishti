# SIH26102 — SQLite Database Validation Report

**Database File:** `database/mplads.db`  
**Database File Size:** 163,049,472 bytes (155.50 MB)  
**Execution Timestamp:** 2026-08-26T10:52:56.135475+00:00  
**Engine:** SQLite 3 (PRAGMA foreign_keys = ON, journal_mode = WAL)  
**Status:** **100% RECONCILED & VALIDATED (Zero Discrepancy)**

---

## 1. Table Inventory & Row Counts

| Table Name | Description / Entity Grain | Row Count | Primary Key | Foreign Keys | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `data_sources` | Provenance & Source Metadata | **5** | `source_id` | — | **PASSED** |
| `mps` | Members of Parliament (1:1 MP Master) | **543** | `internal_mp_id` | — | **PASSED** |
| `allocations` | MP Fiscal Allocations & Limits | **543** | `internal_mp_id` | `mps(internal_mp_id)` | **PASSED** |
| `vendors` | Contractors / Vendors Dimension | **22,377** | `internal_vendor_id` | — | **PASSED** |
| `works` | Physical Works (1:1 Work Registry) | **102,437** | `work_id` | `mps(internal_mp_id)` | **PASSED** |
| `transactions` | Financial Disbursement Vouchers | **82,296** | `internal_transaction_id`| `mps`, `vendors` | **PASSED** |
| `anomalies` | Explainable Audit Flags (15 Cols) | **1,804** | `anomaly_id` | — | **PASSED** |

---

## 2. Views Inventory

| View Name | Underlying Tables | Row Count | Purpose |
| :--- | :--- | :--- | :--- |
| `v_works_with_mp_ref` | `works` JOIN `mps` | **102,437** | Provides safe work-level queries with clearly prefixed `mp_level_ref_` non-additive metadata |
| `v_state_summary` | `mps` (GROUP BY `state`) | **36** | High-performance state-level aggregations derived strictly from MP master |
| `v_constituency_summary`| `mps` | **543** | Constituency roll-ups |

---

## 3. Database Monetary Totals Reconciliation

| Financial Metric | Validated Phase 5 Benchmark | Database SQLite Actual | Difference | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Total Allocated Amount** | ₹83,062,104,294.53 | ₹83,062,104,294.53 | **₹0.00** | **PASSED** |
| **Total Expenditure Amount** | ₹27,191,390,292.45 | ₹27,191,390,292.45 | **₹0.00** | **PASSED** |
| **Total Recommended Amount** | ₹39,681,479,028.54 | ₹39,681,479,028.54 | **₹0.00** | **PASSED** |
| **Total Completed Final Amount**| ₹16,260,632,748.40 | ₹16,260,632,748.40 | **₹0.00** | **PASSED** |

---

## 4. Foreign Key & Constraint Integrity

- `PRAGMA foreign_key_check`: **0 violations across all 102,437 works, 82,296 transactions, and 543 allocations.**
- `works` references `mps(internal_mp_id)` with 100% resolution.
- `transactions` references `mps(internal_mp_id)` and `vendors(internal_vendor_id)` with 100% resolution.
- **Cartesian Isolation Verified:** No foreign key connects `transactions` to `works`, preventing financial double-counting.

---

## 5. Indexing Performance Verification

The following 18 indexes were created and verified for sub-millisecond query performance:
- **MP Indexes:** `idx_mps_state`, `idx_mps_constituency`, `idx_mps_utilization`
- **Work Indexes:** `idx_works_mp_id`, `idx_works_state`, `idx_works_constituency`, `idx_works_category`, `idx_works_status`, `idx_works_rec_amount`, `idx_works_final_amount`, `idx_works_rec_year`, `idx_works_comp_year`
- **Transaction Indexes:** `idx_tx_mp_id`, `idx_tx_vendor_id`, `idx_tx_state`, `idx_tx_amount`, `idx_tx_date`, `idx_tx_status`
- **Vendor Indexes:** `idx_vendors_revenue`, `idx_vendors_primary_mp`, `idx_vendors_reliance`
- **Anomaly Indexes:** `idx_anom_entity`, `idx_anom_type`, `idx_anom_severity`, `idx_anom_score`
