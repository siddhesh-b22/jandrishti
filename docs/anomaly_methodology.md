# SIH26102 — Explainable Anomaly Detection Methodology

**Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**System Role:** Analytical Decision-Support Platform (Non-Adjudicative)  
**Target Output:** `data/processed/anomaly_results.csv`  

---

## 1. Ethical & Legal Terminology Standards

The SIH26102 Anomaly Detection Engine operates under strict public-sector audit standards:

> [!CAUTION]
> **Strict Neutrality & Non-Accusatory Rule:**
> An anomaly score indicates a statistical or operational outlier requiring administrative review. It is **never** legal proof of fraud, corruption, illegality, or intentional wrongdoing.
> 
> The platform generates **transparent, mathematically reproducible, and non-accusatory explanations suitable for analytical review and audit.**
> 
> **Permitted Terminology:**
> - `ANOMALY`
> - `UNUSUAL_PATTERN`
> - `REQUIRES_REVIEW`
> - `HIGH_RISK_INDICATOR`
> - `STATISTICAL_OUTLIER`
> 
> **Strictly Prohibited Terminology:**
> - *"Fraud detected"*, *"Corrupt MP"*, *"Illegal procurement"*, *"Guilty contractor"*

---

## 2. Two-Tier Detection Architecture

```text
                               ┌──────────────────────────────────────────────┐
                               │           ENGINEERED FEATURES                │
                               │  (Work, Transaction, MP, Vendor Matrices)    │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
                       ▼                                                             ▼
         ┌───────────────────────────┐                                 ┌───────────────────────────┐
         │          TIER 1           │                                 │          TIER 2           │
         │ Transparent Deterministic │                                 │  Two-Feature Unsupervised │
         │   Statistical & Rules     │                                 │   ML (Isolation Forest)   │
         │   (MAD Z-Score, HHI)      │                                 │  (Log-Amount, Length)     │
         └─────────────┬─────────────┘                                 └─────────────┬─────────────┘
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │     EXPLAINABILITY ENGINE   │
                                       │  - Human-Readable Sentence  │
                                       │  - 15 Traceability Columns  │
                                       │  - Exact Delta / Metrics    │
                                       │  - Severity & Score (0..1)  │
                                       └──────────────┬──────────────┘
                                                      │
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │    data/processed/          │
                                       │    anomaly_results.csv      │
                                       └─────────────────────────────┘
```

---

## 3. Detailed Anomaly Type Specifications & Mathematical Formulas

### 3.1 `UNUSUALLY_HIGH_RECOMMENDED_AMOUNT`
- **Entity Type:** `WORK`
- **Detection Logic:**
  $$\text{Recommended Amount} \ge \text{₹50,00,000} \quad \land \quad \text{Percentile}_{\text{cat}} \ge 0.99 \quad \land \quad \text{Z}_{\text{robust}} \ge 3.5$$
- **Score Calculation:**
  $$\text{Score} = \min\left(1.0, \, 0.70 + (\text{Z}_{\text{robust}} - 3.5) \times 0.05\right)$$
- **Severity:** `CRITICAL` if $\ge \text{₹2,00,00,000}$ else `HIGH`.
- **Explainable Template:**
  > *"Recommended amount of ₹{Amount} is in the {Percentile}th percentile for '{Category}' ({Z} robust standard deviations above category median)."*

---

### 3.2 `UNUSUAL_COST_VARIANCE`
- **Entity Type:** `WORK` (Full lifecycle works only)
- **Detection Logic:**
  $$|\text{Cost Variance \%}| \ge 40.0\% \quad \lor \quad |\text{Final Amount} - \text{Recommended Amount}| \ge \text{₹10,00,00,000}$$
- **Score Calculation:**
  $$\text{Score} = \min\left(1.0, \, 0.65 + |\text{Cost Variance \%}| \times 0.003\right)$$
- **Severity:** `HIGH` if $|\Delta \%| \ge 75\%$ or $|\Delta ₹| \ge \text{₹25,00,000}$ else `MEDIUM`.
- **Explainable Template:**
  > *"Final completed cost (₹{Final}) {escalated above / reduced below} original recommended amount (₹{Recommended}) by {Variance %}% (variance: ₹{Variance Amount})."*

---

### 3.3 `UNUSUALLY_LONG_COMPLETION_DURATION`
- **Entity Type:** `WORK` (Full lifecycle works only)
- **Detection Logic:**
  $$\text{Duration in Days} \ge 500 \text{ days} \quad (\approx 16.5 \text{ months})$$
- **Score Calculation:**
  $$\text{Score} = \min\left(1.0, \, 0.60 + (\text{Days} - 500) \times 0.001\right)$$
- **Severity:** `HIGH` if $\text{Days} \ge 700$ else `MEDIUM`.
- **Explainable Template:**
  > *"Execution duration from recommendation to completion was {Days} days (~{Months} months)."*

---

### 3.4 `UNUSUALLY_HIGH_EXPENDITURE_TRANSACTION`
- **Entity Type:** `TRANSACTION`
- **Detection Logic:**
  $$\text{Expenditure Amount} \ge \text{₹50,00,000} \quad \land \quad \text{Z}_{\text{robust, activity}} \ge 3.5$$
- **Score Calculation:**
  $$\text{Score} = \min\left(1.0, \, 0.70 + (\text{Z}_{\text{robust}} - 3.5) \times 0.04\right)$$
- **Severity:** `CRITICAL` if $\ge \text{₹2,00,00,000}$ else `HIGH`.
- **Explainable Template:**
  > *"Payment voucher of ₹{Amount} for '{Activity}' is {Z} robust standard deviations above activity median."*

---

### 3.5 `DISPROPORTIONATE_SINGLE_TRANSACTION_SHARE`
- **Entity Type:** `TRANSACTION`
- **Detection Logic:**
  $$\frac{\text{Voucher Amount}}{\text{MP Total Cumulative Expenditure}} \ge 40.0\% \quad \land \quad \text{Amount} \ge \text{₹50,00,000}$$
- **Severity:** `HIGH` if $\text{Share} \ge 60\%$ else `MEDIUM`.
- **Explainable Template:**
  > *"Single disbursement of ₹{Amount} accounts for {Share %}% of MP's cumulative total expenditure."*

---

### 3.6 `HIGH_VENDOR_CONCENTRATION`
- **Entity Type:** `MP`
- **Detection Logic:**
  $$\text{Transaction Count} \ge 10 \quad \land \quad \left(\text{Vendor HHI} \ge 3500 \quad \lor \quad \text{Top Vendor Share} \ge 60.0\%\right)$$
- **Severity:** `HIGH` if $\text{Top Share} \ge 75\%$ or $\text{HHI} \ge 5000$ else `MEDIUM`.
- **Explainable Template:**
  > *"Disproportionately concentrated procurement: Top vendor captured {Top Share %}% of MP's total expenditure (Vendor HHI: {HHI} across {Count} transactions)."*

---

### 3.7 `UNUSUAL_PENDING_PAYMENT_RATIO`
- **Entity Type:** `MP`
- **Detection Logic:**
  $$\text{Transaction Count} \ge 20 \quad \land \quad \text{Pending Payment Rate} \ge 15.0\% \quad \land \quad \text{Pending Count} \ge 10$$
- **Severity:** `HIGH` if $\text{Rate} \ge 30\%$ else `MEDIUM`.
- **Explainable Template:**
  > *"High unresolved payment rate: {Rate %}% of transactions ({Pending Count} pending out of {Total Count} total)."*

---

### 3.8 `MP_UTILIZATION_EXTREME_OUTLIER`
- **Entity Type:** `MP`
- **Detection Logic:**
  $$\text{Allocated Amount} \ge \text{₹10,00,00,000} \quad \land \quad \text{Utilization \%} \le 5.0\%$$
- **Severity:** `MEDIUM` if $\le 2.0\%$ else `LOW`.
- **Explainable Template:**
  > *"Fund stagnation risk: MP has utilized only {Utilization %}% of allocated ₹{Allocated Amount}."*

---

### 3.9 `VENDOR_SINGLE_MP_DOMINANCE`
- **Entity Type:** `VENDOR`
- **Detection Logic:**
  $$\text{Total Revenue} \ge \text{₹2,00,00,000} \quad \land \quad \text{Single MP Reliance} \ge 95.0\%$$
- **Severity:** `HIGH` if $\text{Revenue} \ge \text{₹5,00,00,000}$ else `MEDIUM`.
- **Explainable Template:**
  > *"High single-patron reliance: Vendor received ₹{Revenue} with {Reliance %}% of revenue originating exclusively from MP '{MP Name}'."*

---

### 3.10 `MULTIVARIATE_WORK_OUTLIER` (Two-Feature Unsupervised ML Baseline)
- **Entity Type:** `WORK`
- **Model:** `IsolationForest(n_estimators=100, contamination=0.015, random_state=42)`
- **Input Features:** `[\log(1 + \text{Recommended Amount}), \text{Description Character Length}]`
- **Severity:** `LOW` (Baseline ML statistical marker).
- **Explainable Template:**
  > *"Two-feature multivariate outlier identified by Isolation Forest baseline (Score: {Score}; Recommended: ₹{Amount}; Description Length: {Length} chars)."*

---

## 4. 15-Column Traceable Anomaly Schema

Every anomaly record in `data/processed/anomaly_results.csv` contains:
1. `anomaly_id`: Unique identifier (`ANOM_000001` ... `ANOM_001804`)
2. `entity_type`: `WORK`, `MP`, `TRANSACTION`, `VENDOR`
3. `entity_id`: Foreign key linking to master tables (`work_id`, `internal_mp_id`, `internal_transaction_id`, `internal_vendor_id`)
4. `anomaly_type`: Standardized categorical classification
5. `anomaly_score`: Continuous normalized severity score ($0.0 \dots 1.0$)
6. `severity`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
7. `reason`: Full human-readable analytical sentence
8. `supporting_metrics`: JSON object of exact parameters
9. `detection_method`: Mathematical/algorithmic rule designation
10. `threshold_value`: Exact decision boundary applied
11. `observed_value`: Exact value recorded for the entity
12. `percentile`: Empirical population percentile (nullable)
13. `robust_zscore`: MAD-based robust standard deviations (nullable)
14. `baseline_reference`: Benchmark cohort description
15. `generated_at`: ISO timestamp tracking the execution run
