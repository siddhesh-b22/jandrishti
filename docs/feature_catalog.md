# SIH26102 — Engineered Feature Catalog

**Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Status:** Canonical Feature Catalog (Phase 5.1 Verified)  
**Output Files:** `data/features/work_features.csv`, `data/features/mp_features.csv`, `data/features/vendor_features.csv`, `data/features/transaction_features.csv`

---

## 1. Feature Architecture & Classification Taxonomy

All features are explicitly categorized into four distinct functional tiers:
- **Tier A (Source-Derived):** Extracted directly from official government exports.
- **Tier B (Calculated / Normalized):** Temporally, mathematically, or textually derived from source data with deterministic formulas.
- **Tier C (Anomaly Metrics):** Robust Z-scores, percentiles, and concentration indices.
- **Tier D (Risk Scores & Indicators):** Calibrated multi-factor risk scores ($0.0 \dots 1.0$) with plain-language, non-accusatory reasons.

---

## 2. Work-Level Feature Matrix (`data/features/work_features.csv`)
**Entity Grain:** 1 row per unique physical work item (102,437 rows, 31 columns)

| Feature Name | Tier | Data Type | Unit / Range | Mathematical Formula / Derivation | Description & Provenance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `work_id` | A | `int64` | Discrete ID | Official Source | Government Work Identifier (Primary Key) |
| `internal_mp_id` | B | `string` | `INTERNAL_MP_001..543` | Pipeline Surrogate | Internal reference to Member of Parliament |
| `category_normalized` | B | `string` | 4 classes | Normalized string | Standardized Category (`Normal/Others`, `Repair and Renovation`, `Trust and Society`, `Natural Calamity`) |
| `recommended_amount` | A | `float64` | ₹ (INR) | Official Source | Initial proposed project cost (Null for completed-only works) |
| `recommendation_year` | B | `int` | $2024 \dots 2026$ | `YEAR(recommendation_date)` | Calendar year of MP recommendation |
| `recommendation_month` | B | `int` | $1 \dots 12$ | `MONTH(recommendation_date)` | Calendar month of MP recommendation |
| `recommendation_quarter`| B | `int` | $1 \dots 4$ | `QUARTER(recommendation_date)`| Fiscal/calendar quarter of recommendation |
| `category_rec_amount_percentile` | C | `float64` | $0.0 \dots 1.0$ | $\text{Rank}(Amount) / N_{\text{category}}$ | Percentile rank of recommended cost within category |
| `rec_amount_category_robust_zscore`| C | `float64` | Z-score ($\mathbb{R}$) | $\frac{0.6745 \times (x - \text{Median}_{\text{cat}})}{\text{MAD}_{\text{cat}}}$ | Robust Z-score against category median and MAD |
| `final_amount` | A | `float64` | ₹ (INR) | Official Source | Final audited project expenditure upon completion |
| `completion_year` | B | `int` | $2024 \dots 2026$ | `YEAR(completed_date)` | Calendar year of work completion |
| `completion_month` | B | `int` | $1 \dots 12$ | `MONTH(completed_date)` | Calendar month of work completion |
| `category_final_amount_percentile`| C | `float64` | $0.0 \dots 1.0$ | $\text{Rank}(Final) / N_{\text{category}}$ | Percentile rank of final cost within category |
| `final_amount_category_robust_zscore`| C | `float64` | Z-score ($\mathbb{R}$) | $\frac{0.6745 \times (x - \text{Median}_{\text{cat}})}{\text{MAD}_{\text{cat}}}$ | Robust Z-score of completed cost within category |
| `duration_days` | B | `int64` | Days ($18 \dots 721$) | $\text{Date}_{\text{comp}} - \text{Date}_{\text{rec}}$ | Duration in calendar days (Populated for 181 full lifecycle works) |
| `cost_variance_amount` | B | `float64` | ₹ (INR) | $\text{Final Amount} - \text{Recommended Amount}$ | Absolute cost variance upon project completion |
| `cost_variance_pct` | B | `float64` | % | $\frac{\text{Final} - \text{Recommended}}{\text{Recommended}} \times 100$ | Relative cost variance percentage |
| `has_images` | A | `bool` | `True`/`False` | Official Source | Photographic evidence presence flag |
| `description_char_length` | B | `int` | Characters | $\text{LEN}(\text{Description})$ | Work description character length |
| `description_word_count` | B | `int` | Words | $\text{Count}(\text{Words})$ | Work description word count |

---

## 3. Transaction-Level Feature Matrix (`data/features/transaction_features.csv`)
**Entity Grain:** 1 row per financial transaction voucher (82,296 rows, 20 columns)

| Feature Name | Tier | Data Type | Unit / Range | Mathematical Formula / Derivation | Description & Provenance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `internal_transaction_id` | B | `string` | `TXN_000001..082296` | Synthetic PK | Unique transaction voucher identifier |
| `internal_mp_id` | B | `string` | `INTERNAL_MP_001..543` | FK | Foreign key to MP |
| `internal_vendor_id` | B | `string` | `INTERNAL_VND_00001..` | FK | Foreign key to Vendor |
| `expenditure_amount` | A | `float64` | ₹ (INR) | Official Source | Financial disbursement amount |
| `expenditure_year` | B | `int` | $2024 \dots 2026$ | `YEAR(expenditure_date)` | Calendar year of disbursement |
| `expenditure_month` | B | `int` | $1 \dots 12$ | `MONTH(expenditure_date)` | Calendar month of disbursement |
| `payment_status` | A | `string` | 2 states | Official Source | `"Payment Success"` or `"Payment In-Progress"` |
| `activity_amount_percentile` | C | `float64` | $0.0 \dots 1.0$ | $\text{Rank}(Amt) / N_{\text{activity}}$ | Percentile rank within broad budget head (110 activities) |
| `activity_amount_robust_zscore`| C | `float64` | Z-score ($\mathbb{R}$) | $\frac{0.6745 \times (x - \text{Median}_{\text{act}})}{\text{MAD}_{\text{act}}}$ | Robust outlier score within activity description |
| `state_activity_amount_robust_zscore`| C| `float64` | Z-score ($\mathbb{R}$) | $\frac{0.6745 \times (x - \text{Median}_{s,a})}{\text{MAD}_{s,a}}$ | Robust outlier score within State + Activity cluster |
| `transaction_to_mp_total_exp_pct` | C | `float64` | $0.0 \dots 100.0\%$ | $\frac{\text{Amount}}{\text{MP Total Recorded Expenditure}} \times 100$ | Share of MP's cumulative expenditure in single voucher |

---

## 4. MP-Level Feature Matrix (`data/features/mp_features.csv`)
**Entity Grain:** 1 row per Member of Parliament (543 rows, 30 columns)

| Feature Name | Tier | Data Type | Unit / Range | Mathematical Formula / Derivation | Description & Provenance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `internal_mp_id` | B | `string` | `INTERNAL_MP_001..543` | Primary Key | MP Surrogate Identifier |
| `allocated_amount` | A | `float64` | ₹ (INR) | Official Source | Total parliamentary fund allocated to MP |
| `total_expenditure` | A | `float64` | ₹ (INR) | Official Source | Total cumulative expenditure disbursed |
| `unspent_amount` | A | `float64` | ₹ (INR) | Official Source | Balance unspent fund in treasury |
| `utilization_pct` | A | `float64` | $0.0 \dots 93.98\%$ | $\frac{\text{Total Expenditure}}{\text{Allocated Amount}} \times 100$ | Macro fund utilization rate |
| `utilization_robust_zscore`| C | `float64` | Z-score ($\mathbb{R}$) | $\frac{0.6745 \times (x - \text{Median})}{\text{MAD}}$ | Relative utilization deviation among peers |
| `pending_works_count` | B | `int` | $0 \dots 1,300+$ | $\text{Recommended} - \text{Completed}$ | Backlog of ongoing / uncompleted works |
| `completion_rate_pct` | A | `float64` | $0.0 \dots 96.39\%$ | $\frac{\text{Completed}}{\text{Recommended}} \times 100$ | Physical work execution completion rate |
| `successful_payment_rate_pct`| B | `float64` | $0.0 \dots 100.0\%$ | $\frac{\text{Successful Txns}}{\text{Total Txns}} \times 100$ | Transaction clearance success rate |
| `pending_payment_rate_pct` | B | `float64` | $0.0 \dots 100.0\%$ | $\frac{\text{Pending Txns}}{\text{Total Txns}} \times 100$ | Payment bottleneck / in-progress rate |
| `average_transaction_amount`| B | `float64` | ₹ (INR) | $\frac{\text{Total Recorded Expenditure}}{\text{Total Txns}}$ | Mean voucher ticket size |
| `distinct_vendor_count` | B | `int` | $0 \dots 350+$ | $\text{COUNT(DISTINCT Vendors)}$ | Number of active contractors engaged by MP |
| `vendor_hhi` | C | `float64` | $0 \dots 10,000$ | $\sum (\text{Vendor Share of MP Recorded Expenditure}_i \%)^2$ | **Herfindahl-Hirschman Index** of procurement concentration |
| `top_vendor_share_pct` | C | `float64` | $0.0 \dots 100.0\%$ | $\max(\frac{\text{Vendor Expenditure}_i}{\text{MP Total Recorded Expenditure}} \times 100)$ | Share of MP's total recorded expenditure captured by #1 vendor |

---

## 5. Vendor-Level Feature Matrix (`data/features/vendor_features.csv`)
**Entity Grain:** 1 row per contractor / vendor (22,377 rows, 15 columns)

| Feature Name | Tier | Data Type | Unit / Range | Mathematical Formula / Derivation | Description & Provenance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `internal_vendor_id` | B | `string` | `INTERNAL_VND_00001..` | Primary Key | Vendor Surrogate Identifier |
| `total_received_amount` | B | `float64` | ₹ (INR) | $\sum \text{Transaction Amounts}$ | Cumulative revenue received from MPLADS |
| `vendor_revenue_percentile`| C | `float64` | $0.0 \dots 1.0$ | $\text{Rank}(\text{Revenue}) / N_{\text{vendors}}$ | National revenue percentile among all vendors |
| `total_transaction_count`| B | `int` | $1 \dots 1,900+$ | $\text{COUNT}(\text{Transactions})$ | Total payment vouchers received |
| `average_ticket_size` | B | `float64` | ₹ (INR) | $\frac{\text{Revenue}}{\text{Transactions}}$ | Mean payment voucher value |
| `unique_mps_served` | B | `int` | $1 \dots 20+$ | $\text{COUNT(DISTINCT MPs)}$ | Number of distinct parliamentary patrons |
| `unique_states_served` | B | `int` | $1 \dots 10+$ | $\text{COUNT(DISTINCT States)}$ | Geographical breadth of operations |
| `single_mp_reliance_pct`| C | `float64` | $0.0 \dots 100.0\%$ | $\frac{\text{Top MP Revenue}}{\text{Total Vendor Revenue}} \times 100$ | Degree of financial dependence on a single MP |
| `primary_mp_name` | B | `string` | MP Name | $\text{ArgMax}_{\text{MP}}(\text{Revenue})$ | Primary parliamentary patron name |

---

## 6. Protection of MP-Level Macro Reference Fields

> [!IMPORTANT]
> The fields `mp_level_ref_allocated_amount`, `mp_level_ref_total_expenditure`, `mp_level_ref_utilization_pct`, and `mp_level_ref_completion_rate_pct` in `mplads_master_dataset.csv` are **dimensional reference attributes**.
> They must **NEVER** be summed or averaged across work items in SQL or API aggregation pipelines.
