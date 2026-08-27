# SIH26102 — Anomaly Engine Validation & Methodology Report (v5.1)

**Execution Timestamp:** 2026-08-26 16:17:43 UTC  
**Engine Script:** `scripts/run_anomaly_engine.py`  
**Compliance Standard:** Transparent, mathematically reproducible, and non-accusatory explanations suitable for analytical review and audit  

---

## 1. Executive Summary

The Anomaly Detection Engine operates as a decision-support and audit-prioritization system using a two-tier architecture:
1. **Tier 1 (Primary Deterministic Detection):** Transparent, explainable statistical rules based on Median Absolute Deviations (MAD), empirical percentiles, and economic concentration indices (Herfindahl-Hirschman Index).
2. **Tier 2 (Two-Feature Unsupervised ML Baseline):** `IsolationForest` fitted on continuous joint features `[\log(1 + \text{recommended\_amount}), \text{description\_char\_length}]` to discover multi-feature distribution outliers.

Every flagged record carries a human-readable, mathematically grounded explanation with 15 traceability columns. Zero entities are labeled as "corrupt" or "fraudulent".

---

## 2. Quantitative Anomaly Breakdown

- **Total Anomaly Flags:** **1,804**
- **Unique Works Flagged:** **1,415** out of 102,437 (1.38%)
- **Unique Transactions Flagged:** **135** out of 82,296 (0.16%)
- **Unique MPs Flagged:** **133** out of 543 (24.49%) across 143 flag instances *(See `docs/mp_anomaly_distribution_audit.md` for complete distribution audit)*
- **Unique Vendors Flagged:** **111** out of 22,377 (0.50%)

### Severity Distribution:
| Severity Level | Anomaly Count | Percentage of Flags | Recommended Operational Action |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | **21** | 1.16% | Priority manual administrative audit |
| **HIGH** | **602** | 33.37% | Priority inspection & procurement review |
| **MEDIUM** | **203** | 11.25% | Routine monitoring & documentation check |
| **LOW** | **978** | 54.21% | Baseline statistical & ML distribution exploration |

---

## 3. Anomaly Type Distribution & Explainability Formats

| Anomaly Type | Flagged Count | Typical Plain-Language Explanation Formula |
| :--- | :--- | :--- |
| `UNUSUALLY_HIGH_RECOMMENDED_AMOUNT` | **416** | *"Recommended amount of ₹X is in the 99.8th percentile for category Y (Z robust standard deviations above median)."* |
| `UNUSUALLY_HIGH_EXPENDITURE_TRANSACTION` | **132** | *"Payment voucher of ₹X for activity Y is Z robust standard deviations above activity median."* |
| `HIGH_VENDOR_CONCENTRATION` | **72** | *"Disproportionately concentrated procurement: Top vendor captured X% of MP's total expenditure (Vendor HHI: Y across N transactions)."* |
| `VENDOR_SINGLE_MP_DOMINANCE` | **111** | *"High single-patron reliance: Vendor received ₹X with Y% of revenue originating exclusively from a single MP."* |
| `UNUSUAL_PENDING_PAYMENT_RATIO` | **33** | *"High unresolved payment rate: X% of transactions (N pending out of M total)."* |
| `UNUSUAL_COST_VARIANCE` | **2** | *"Final completed cost (₹X) escalated above/reduced below recommended amount (₹Y) by Z%."* |
| `UNUSUALLY_LONG_COMPLETION_DURATION` | **38** | *"Execution duration from recommendation to completion was N days (~M months)."* |
| `DISPROPORTIONATE_SINGLE_TRANSACTION_SHARE` | **3** | *"Single disbursement of ₹X accounts for Y% of MP's cumulative expenditure."* |
| `MP_UTILIZATION_EXTREME_OUTLIER` | **38** | *"Fund stagnation risk: MP has utilized only X% of allocated ₹Y."* |
| `MULTIVARIATE_WORK_OUTLIER` | **959** | *"Two-feature multivariate outlier identified by Isolation Forest baseline (Score: S; Recommended: ₹X; Description Length: N chars)."* |

---

## 4. Two-Feature Unsupervised ML Baseline Performance

- **Input Features:** `[\log(1 + \text{recommended\_amount}), \text{description\_char\_length}]`
- **Contamination Rate:** $1.5\%$ ($1,029$ works flagged)
- **High-Confidence Intersection with Statistical Rules:** **70 works** (15.42% cross-validation agreement)
- **Standalone ML Flags:** **959 works** cataloged as `MULTIVARIATE_WORK_OUTLIER` with `Severity: LOW`.
- *(See `docs/ml_baseline_limitations.md` for detailed hyperparameter and limitation disclosures)*
