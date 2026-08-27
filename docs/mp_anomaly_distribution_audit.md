# SIH26102 — MP Anomaly Distribution & Overlap Audit Report (v5.1)

**Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Audit Target:** MP Anomaly Flag Distribution & Multi-Rule Overlap  
**Status:** Audit Complete  

---

## 1. Executive Summary: Why 133 of 543 MPs (24.49%) Are Flagged

An in-depth statistical audit of the MP anomaly detection results revealed that **133 distinct MPs (24.49%)** are flagged across **143 total flag instances**.

### Key Finding:
The 24.49% flag rate is **NOT caused by a single overly broad rule or loose threshold**. Rather, it represents the empirical union of **three distinct rule dimensions that show low empirical overlap in the current dataset**:
1. **Procurement Concentration Risk (`HIGH_VENDOR_CONCENTRATION`)**: Captures 72 MPs (13.26%) where a single vendor captured $\ge 60\%$ of the MP's total recorded expenditure or $\text{Vendor HHI} \ge 3,500$.
2. **Fund Stagnation Risk (`MP_UTILIZATION_EXTREME_OUTLIER`)**: Captures 38 MPs (7.00%) with severe under-utilization ($\le 5.0\%$ spent out of $\ge \text{₹10 Crore}$ allocation).
3. **Treasury Bottleneck Risk (`UNUSUAL_PENDING_PAYMENT_RATIO`)**: Captures 33 MPs (6.08%) with unusually high pending transaction ratios ($\ge 15\%$ pending payments with $\ge 10$ pending vouchers).

Because these three rule dimensions show low empirical overlap in the current dataset (only 10 MPs trigger two rules simultaneously), their union across 543 MPs yields 133 distinct MPs.

---

## 2. Descriptive Metric Distributions Across All 543 MPs

| Metric Name | Min | P10 | P25 (Q1) | Median (P50) | Mean | P75 (Q3) | P90 | P95 | P99 | Max |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `vendor_hhi` | 0.00 | 258.42 | 512.30 | **1,069.89** | 1,842.15 | 2,410.50 | 4,853.66 | 6,668.66 | 9,840.10 | 10,000.00 |
| `top_vendor_share_pct`| 0.00% | 8.45% | 14.10% | **21.84%** | 29.85% | 38.60% | 65.45% | 79.68% | 98.40% | 100.00% |
| `pending_payment_rate_pct`| 0.00% | 0.00% | 0.00% | **1.74%** | 4.82% | 5.20% | 12.90% | 19.89% | 48.20% | 94.83% |
| `utilization_pct` | 0.00% | 7.10% | 18.40% | **32.23%** | 33.85% | 48.20% | 59.65% | 65.26% | 78.40% | 93.98% |
| `completion_rate_pct` | 0.00% | 5.20% | 14.80% | **26.58%** | 31.40% | 44.50% | 61.15% | 69.71% | 85.20% | 96.39% |
| `transaction_count` | 0 | 12 | 38 | **90** | 151.5 | 198 | 330 | 521 | 984 | 1,471 |
| `pending_payments_count`| 0 | 0 | 0 | **2** | 4.8 | 6 | 17 | 25 | 48 | 121 |

---

## 3. Individual Rule Analysis & Threshold Justifications

### Rule 1: `HIGH_VENDOR_CONCENTRATION`
- **Threshold Applied:** $\text{Transaction Count} \ge 10 \quad \land \quad (\text{Vendor HHI} \ge 3,500 \quad \lor \quad \text{Top Vendor Share} \ge 60.0\%)$
- **Exact Denominator:** MP's total recorded expenditure ($\sum \text{Expenditure Amount}$).
- **MPs Flagged:** **72 MPs (13.26%)**
- **Threshold Justification:**
  - In economic antitrust guidelines (U.S. DOJ / FTC standards), an $\text{HHI} > 2,500$ indicates a *"Highly Concentrated Market"*.
  - We applied a conservative threshold of $\text{HHI} \ge 3,500$ (representing the 88th percentile among MPs) or a single vendor capturing $\ge 60\%$ of the MP's total recorded expenditure (national median is 21.84%).
  - Flagged MPs disbursed the vast majority of public works funding to 1 or 2 primary contractors.

### Rule 2: `MP_UTILIZATION_EXTREME_OUTLIER`
- **Threshold Applied:** $\text{Allocated Amount} \ge \text{₹10,00,00,000} \quad \land \quad \text{Utilization \%} \le 5.0\%$
- **MPs Flagged:** **38 MPs (7.00%)**
- **Threshold Justification:**
  - Across the 18th Lok Sabha tenure, the national median utilization is 32.23%.
  - MPs with $\le 5.0\%$ utilization despite having $\ge \text{₹10 Crore}$ in available parliamentary funds represent extreme fiscal stagnation (bottom 7th percentile).

### Rule 3: `UNUSUAL_PENDING_PAYMENT_RATIO`
- **Threshold Applied:** $\text{Transaction Count} \ge 20 \quad \land \quad \text{Pending Payment Rate} \ge 15.0\% \quad \land \quad \text{Pending Count} \ge 10$
- **MPs Flagged:** **33 MPs (6.08%)**
- **Threshold Justification:**
  - National median pending payment rate is 1.74% (Q3 is 5.20%).
  - MPs with $\ge 15.0\%$ pending vouchers and $\ge 10$ unresolved disbursements represent the top 6th percentile of administrative and treasury bottlenecks.

---

## 4. Rule Overlap & Intersection Matrix

### Multi-Rule Triggering Breakdown:
- **MPs Triggering Exactly 1 Rule:** **123 MPs (22.65%)**
- **MPs Triggering Exactly 2 Rules:** **10 MPs (1.84%)**
- **MPs Triggering All 3 Rules:** **0 MPs (0.00%)**
- **Total Distinct Flagged MPs:** **133 MPs (24.49%)**

### Pairwise Intersection Matrix:
| Rule Name | High Vendor Concentration (72) | MP Stagnant Utilization (38) | Unusual Pending Payment (33) |
| :--- | :--- | :--- | :--- |
| **High Vendor Concentration (72)** | **72** | 2 | 7 |
| **MP Stagnant Utilization (38)** | 2 | **38** | 1 |
| **Unusual Pending Payment (33)** | 7 | 1 | **33** |

### Conclusion:
These 3 rule dimensions show low empirical overlap in the current dataset. They capture distinct operational concerns (procurement concentration vs fiscal dormancy vs payment bottlenecks) rather than redundant duplicates.
