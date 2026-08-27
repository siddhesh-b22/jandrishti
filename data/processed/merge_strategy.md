# SIH26102 — Relational Architecture & Merge Strategy

**Date:** 2026-08-26  
**Status:** PROPOSED & FULLY VALIDATED (Awaiting User Sign-Off)  
**Author:** Lead AI Software Architect & Data Engineer  

---

## 1. Core Architectural Strategy

### The Fundamental Principle:
The official MPLADS public data exists across **three distinct entity grains**:
1. **MP / Constituency Grain (1 row per MP, 543 total)**: Allocations, macro budgets, cumulative expenditures, completion rates.
2. **Work Grain (1 row per Physical Work Item, 102,437 total across recommended + completed)**: Physical recommendations, categories, scopes, completion records, IDAs.
3. **Transaction Grain (1 row per Financial Voucher, 82,296 total)**: Vendor payments, payment status (Success / In-Progress), disbursement dates, IDAs.

```text
                        ┌───────────────────────────────┐
                        │           MP MASTER           │
                        │    (543 Lok Sabha MPs)        │
                        │  PK: mp_id (e.g. MP_001..543) │
                        │  Natural Key: mp_name         │
                        └──────────────┬────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │ 1:N                      │ 1:N                      │ 1:N
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│   ALLOCATION MASTER   │  │      WORK MASTER      │  │  EXPENDITURE MASTER   │
│ (Allocations & Limits)│  │ (102,437 Unique Works)│  │ (82,296 Transactions) │
│ PK: mp_id             │  │ PK: work_id (int64)   │  │ PK: transaction_id    │
│ FK: mp_id             │  │ FK: mp_id             │  │ FK: mp_id, vendor_id  │
└───────────────────────┘  └───────────────────────┘  └───────────┬───────────┘
                                                                  │ M:1
                                                                  ▼
                                                      ┌───────────────────────┐
                                                      │     VENDOR MASTER     │
                                                      │ (23,111 Unique Vendors│
                                                      │ PK: vendor_id         │
                                                      └───────────────────────┘
```

> [!CAUTION]
> **Why a single flat CSV joining Works and Expenditures is strictly prohibited:**
> `mplads_expenditures_...` does NOT contain `Work ID`. If transactions were joined to works on `(MP Name, Description)`, a work would be multiplied by hundreds of unrelated transactions sharing the same broad description (e.g., 20,783 road transactions cross-joined with 30,000 road works).
> This would cause severe artificial inflation (multiplying ₹27.19B into hundreds of billions of rupees) and violate Critical Rules 12, 13, and 14.

---

## 2. Comprehensive Join Specifications

### 2.1 Join Plan 1: MP Summary $\rightarrow$ Works (Recommended & Completed)
- **Source Tables:** `mplads_mp_summary_2026-08-26.csv` (Left) $\rightarrow$ `mplads_recommended_works_...` & `mplads_completed_works_...` (Right)
- **Join Key:** `mp_name_normalized` (`UPPER(TRIM(MP Name))`)
- **Cardinality:** `1 : N` (One MP has $0 \dots 1,356$ works)
- **Key Overlap & Integrity:**
  - Recommended Works: 538 / 538 MPs match (100.00% match rate, 0 unmatched records).
  - Completed Works: 501 / 501 MPs match (100.00% match rate, 0 unmatched records).
  - 5 MPs have 0 recommended works recorded; 42 MPs have 0 completed works recorded.
- **Duplication Risk:** Zero (Parent MP record is referenced via `mp_id` Foreign Key).
- **Match Confidence:** `1.00 (Exact Official Name Match)`.

---

### 2.2 Join Plan 2: Recommended Works $\leftrightarrow$ Completed Works (Lifecycle Integration)
- **Source Tables:** `mplads_recommended_works_...` (68,872 rows) $\leftrightarrow$ `mplads_completed_works_...` (33,746 rows)
- **Join Key:** `Work ID` (Exact integer primary key)
- **Cardinality:** `1 : 1` on exact `Work ID` match
- **Expected Overlap Analysis:**
  - Exact `Work ID` Intersection: **181 Works**
    - For these 181 records: Lifecycle status is `FULL_LIFECYCLE_MATCH` (`is_completed = True`, `recommended_amount` and `final_amount` both present, duration calculated as `completed_date - recommendation_date`).
  - Unmatched Recommended Works: **68,691 Works**
    - Status: `RECOMMENDED_IN_PROGRESS` (`is_completed = False`, `final_amount = NULL`, `completed_date = NULL`).
  - Unmatched Completed Works: **33,565 Works**
    - Status: `COMPLETED_ONLY` (`is_completed = True`, `recommended_amount = NULL`, `recommendation_date = NULL`, `final_amount` present).
- **Total Unified Works in `work_master`:** `68,691 + 181 + 33,565 = 102,437 Works`.
- **Fuzzy Matching Protocol:**
  - A strict secondary fuzzy check (MP match + TF-IDF cosine similarity $\ge 0.95$ on Work Description) will be generated as a separate candidate review table (`data/processed/fuzzy_work_candidates.csv`).
  - **Rule Enforcement:** Per Rule 8 and 10, low/medium-confidence fuzzy matches will NOT be forced into the master dataset; they will remain separate records with `match_confidence = 0.0` or flagged for human review.

---

### 2.3 Join Plan 3: MP Summary $\rightarrow$ Expenditures
- **Source Tables:** `mplads_mp_summary_2026-08-26.csv` (Left) $\rightarrow$ `mplads_expenditures_2026-08-26.csv` (Right)
- **Join Key:** `mp_name_normalized` (`UPPER(TRIM(MP Name))`)
- **Cardinality:** `1 : N` (One MP has $0 \dots 1,939$ transactions)
- **Key Overlap & Integrity:**
  - 531 / 531 unique MP names in expenditures match the MP Summary (100.00% match rate).
  - 12 MPs have 0 expenditures recorded.
  - Per-MP expenditure sums match the MP Summary `Total Expenditure (₹)` to ₹0.00 variance across all 543 MPs.
- **Duplication Risk:** Zero.
- **Match Confidence:** `1.00 (Exact Official Name Match)`.

---

### 2.4 Join Plan 4: Expenditures $\rightarrow$ Vendor Master
- **Source Tables:** `mplads_expenditures_2026-08-26.csv` $\rightarrow$ `vendor_master` (Derived Dimension)
- **Join Key:** `vendor_name_normalized` (`UPPER(TRIM(Vendor))`)
- **Cardinality:** `N : 1` (Multiple transaction line-items map to one vendor)
- **Vendor Universe:** 23,111 unique vendors.
- **Match Confidence:** `1.00 (Exact String Normalization)`.

---

## 3. Master Dataset & Normalized Table Specifications

### 3.1 Table: `mp_master.csv`
- **Granularity:** 1 row per Lok Sabha MP (543 rows)
- **Columns:**
  - `mp_id` (PK, string, e.g. `MP_001` ... `MP_543`)
  - `mp_name` (string)
  - `constituency` (string)
  - `state` (string)
  - `house` (string, `Lok Sabha`)
  - `allocated_amount` (float64)
  - `total_expenditure` (float64)
  - `unspent_amount` (float64)
  - `utilization_pct` (float64)
  - `recommended_works_count` (int64)
  - `completed_works_count` (int64)
  - `completion_rate_pct` (float64)
  - `transaction_count` (int64)
  - `successful_payments_count` (int64)
  - `pending_payments_count` (int64)
  - `average_rating` (float64, nullable)

---

### 3.2 Table: `work_master.csv`
- **Granularity:** 1 row per unique Physical Work (102,437 rows)
- **Columns:**
  - `work_id` (PK, int64)
  - `mp_id` (FK, string)
  - `mp_name` (string)
  - `constituency` (string)
  - `state` (string)
  - `house` (string)
  - `work_description` (string, nullable)
  - `category` (string: `Normal/Others`, `Repair and Renovation`, `Trust and Society`, `Natural Calamity`)
  - `ida_name` (string)
  - `lifecycle_status` (string: `RECOMMENDED_IN_PROGRESS`, `COMPLETED_ONLY`, `FULL_LIFECYCLE_MATCH`)
  - `recommended_amount` (float64, nullable)
  - `recommendation_date` (ISO date string, nullable)
  - `final_amount` (float64, nullable)
  - `completed_date` (ISO date string, nullable)
  - `duration_days` (int64, nullable — populated for 181 full lifecycle works)
  - `cost_variance_amount` (float64, nullable — `final_amount - recommended_amount`)
  - `cost_variance_pct` (float64, nullable)
  - `has_images` (bool)
  - `average_rating` (float64, nullable)
  - `source_files` (string: `recommended_works`, `completed_works`, or `both`)
  - `match_confidence` (float64: `1.0` for exact Work ID)

---

### 3.3 Table: `expenditure_master.csv`
- **Granularity:** 1 row per financial transaction (82,296 rows)
- **Columns:**
  - `transaction_id` (PK, string, e.g. `TXN_000001` ... `TXN_082296`)
  - `mp_id` (FK, string)
  - `mp_name` (string)
  - `constituency` (string)
  - `state` (string)
  - `vendor_id` (FK, string)
  - `vendor_name` (string)
  - `activity_description` (string — broad standardized head)
  - `ida_name` (string)
  - `expenditure_amount` (float64)
  - `expenditure_date` (ISO date string)
  - `payment_status` (string: `Payment Success`, `Payment In-Progress`)
  - `source_file` (string: `mplads_expenditures_2026-08-26.csv`)

---

### 3.4 Table: `vendor_master.csv`
- **Granularity:** 1 row per unique vendor (23,111 rows)
- **Columns:**
  - `vendor_id` (PK, string, e.g. `VND_00001` ... `VND_23111`)
  - `vendor_name` (string)
  - `total_received_amount` (float64)
  - `total_transaction_count` (int64)
  - `unique_mps_served` (int64)
  - `unique_states_served` (int64)
  - `primary_state` (string)
  - `primary_activity` (string)

---

### 3.5 Analytical Master Dataset (`mplads_master_dataset.csv`)
To satisfy the user requirement for a canonical master file (`data/processed/mplads_master_dataset.csv`):
- It will represent the unified Work Registry (`work_master.csv`, 102,437 rows), enriched with MP-level reference metadata (MP details, constituency, state, total MP allocation, MP utilization percentage) via cleanly named columns (e.g. `mp_total_allocated_amount`, `mp_utilization_pct`) to **explicitly prevent confusion between MP-level totals and individual work-level amounts**.
- Unmatched completed works (33,565) and recommended works (68,691) will be fully preserved with exact provenance in `data/processed/unmatched_records.csv`.

---

## 4. Unavailable Fields (Declared NULL)

In strict adherence to Critical Rules 3, 4, 5, 6, and 7, the following fields are declared unavailable and will remain `NULL`:
1. `sanctioned_amount` $\rightarrow$ `NULL` (Never equated to recommended or final amount)
2. `sanction_date` $\rightarrow$ `NULL` (Never equated to recommendation or completed date)
3. `latitude` & `longitude` $\rightarrow$ `NULL` (Never guessed)
4. `village`, `block`, `gram_panchayat` $\rightarrow$ `NULL` (Only IDA district is provided)
5. `work_contractor` $\rightarrow$ `NULL` at the physical work level (Vendor is only available at the transaction level)
