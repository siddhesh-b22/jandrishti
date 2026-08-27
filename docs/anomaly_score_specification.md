# SIH26102 — Anomaly Scoring & Calibration Specification (v5.1)

**Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Document Purpose:** Mathematical specification of the continuous $[0.0, 1.0]$ anomaly scoring engine and severity calibration  

---

## 1. Mathematical Scoring Principles

The anomaly score $S \in [0.0, 1.0]$ provides a calibrated scalar metric of statistical divergence from expected administrative and financial baselines.

1. **Piecewise Bounded Linear Scaling:**
   Every anomaly detector uses an established base score ($S_{\text{base}} \in [0.60, 0.70]$) for records meeting the minimum detection threshold, with proportional scaling above the threshold capped at $1.00$.
2. **Robust Z-Score Normalization:**
   Where standard deviations are used, the engine relies on the Median Absolute Deviation (MAD) to prevent outlier masking:
   $$Z_{\text{robust}} = \frac{0.6745 \times (x - \text{median})}{\text{MAD}} \quad \text{where } \text{MAD} = \text{median}(|x - \text{median}|)$$
3. **Deterministic Reproducibility:**
   All scores are calculated through pure deterministic formulas with zero stochastic noise.

---

## 2. Exact Scoring Formulas by Anomaly Detector

### 2.1 Work Cost Outlier (`UNUSUALLY_HIGH_RECOMMENDED_AMOUNT`)
- **Inputs:** `rec_amount_category_robust_zscore` ($Z$), `recommended_amount` ($A$)
- **Base Score:** $0.70$
- **Formula:**
  $$S = \min\left(1.0, \, 0.70 + (Z - 3.5) \times 0.05\right)$$
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{CRITICAL} \iff A \ge \text{₹2,00,00,000}$
  - $\text{Severity} = \mathbf{HIGH} \iff A < \text{₹2,00,00,000}$

---

### 2.2 Work Cost Variance (`UNUSUAL_COST_VARIANCE`)
- **Inputs:** `cost_variance_pct` ($V_{\%}$), `cost_variance_amount` ($V_{₹}$)
- **Base Score:** $0.65$
- **Formula:**
  $$S = \min\left(1.0, \, 0.65 + |V_{\%}| \times 0.003\right)$$
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{HIGH} \iff |V_{\%}| \ge 75.0\% \lor |V_{₹}| \ge \text{₹25,00,000}$
  - $\text{Severity} = \mathbf{MEDIUM} \iff \text{otherwise}$

---

### 2.3 Execution Duration Outlier (`UNUSUALLY_LONG_COMPLETION_DURATION`)
- **Inputs:** `duration_days` ($D$)
- **Base Score:** $0.60$
- **Formula:**
  $$S = \min\left(1.0, \, 0.60 + (D - 500) \times 0.001\right)$$
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{HIGH} \iff D \ge 700 \text{ days}$
  - $\text{Severity} = \mathbf{MEDIUM} \iff D < 700 \text{ days}$

---

### 2.4 Transaction Outlier (`UNUSUALLY_HIGH_EXPENDITURE_TRANSACTION`)
- **Inputs:** `activity_amount_robust_zscore` ($Z$), `expenditure_amount` ($A$)
- **Base Score:** $0.70$
- **Formula:**
  $$S = \min\left(1.0, \, 0.70 + (Z - 3.5) \times 0.04\right)$$
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{CRITICAL} \iff A \ge \text{₹2,00,00,000}$
  - $\text{Severity} = \mathbf{HIGH} \iff A < \text{₹2,00,00,000}$

---

### 2.5 Single Transaction Share (`DISPROPORTIONATE_SINGLE_TRANSACTION_SHARE`)
- **Inputs:** `transaction_to_mp_total_exp_pct` ($P = \frac{\text{Amount}}{\text{MP Total Recorded Expenditure}} \times 100$)
- **Base Score:** $0.65$
- **Formula:**
  $$S = \min\left(1.0, \, 0.65 + P \times 0.005\right)$$
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{HIGH} \iff P \ge 60.0\%$
  - $\text{Severity} = \mathbf{MEDIUM} \iff P < 60.0\%$

---

### 2.6 MP Vendor Concentration (`HIGH_VENDOR_CONCENTRATION`)
- **Inputs:** `top_vendor_share_pct` ($T_{\%} = \max(\frac{\text{Vendor Expenditure}_i}{\text{MP Total Recorded Expenditure}} \times 100)$), `vendor_hhi` ($\text{HHI}$)
- **Base Score:** $0.70$
- **Formula:**
  $$S = \min\left(1.0, \, 0.70 + (T_{\%} - 60.0) \times 0.007\right)$$
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{HIGH} \iff T_{\%} \ge 75.0\% \lor \text{HHI} \ge 5000$
  - $\text{Severity} = \mathbf{MEDIUM} \iff \text{otherwise}$

---

### 2.7 MP Pending Payment Bottleneck (`UNUSUAL_PENDING_PAYMENT_RATIO`)
- **Inputs:** `pending_payment_rate_pct` ($R_{\%}$)
- **Base Score:** $0.65$
- **Formula:**
  $$S = \min\left(1.0, \, 0.65 + R_{\%} \times 0.008\right)$$
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{HIGH} \iff R_{\%} \ge 30.0\%$
  - $\text{Severity} = \mathbf{MEDIUM} \iff R_{\%} < 30.0\%$

---

### 2.8 MP Fund Stagnation Outlier (`MP_UTILIZATION_EXTREME_OUTLIER`)
- **Inputs:** `utilization_pct` ($U_{\%}$)
- **Base Score:** $0.60$
- **Formula:**
  $$S = \min\left(1.0, \, 0.60 + (5.0 - U_{\%}) \times 0.05\right)$$
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{MEDIUM} \iff U_{\%} \le 2.0\%$
  - $\text{Severity} = \mathbf{LOW} \iff 2.0\% < U_{\%} \le 5.0\%$

---

### 2.9 Vendor Single-MP Dominance (`VENDOR_SINGLE_MP_DOMINANCE`)
- **Input Variable:** `total_received_amount` ($A$) in Indian Rupees (₹)
- **Secondary Condition:** `single_mp_reliance_pct` $\ge 95.0\%$
- **Base Score:** $0.65$
- **Scale Normalization Factor:** $100,000,000$ (₹10 Crore)
- **Coefficient:** $0.10$ per ₹10 Crore above zero
- **Exact Mathematical Formula:**
  $$S = \min\left(1.0, \, 0.65 + \left(\frac{A}{100,000,000}\right) \times 0.10\right)$$
- **Parameter Summary Table:**
  | Parameter | Value / Variable | Description |
  | :--- | :--- | :--- |
  | Input Variable | `total_received_amount` ($A$) | Cumulative vendor revenue from MPLADS |
  | Units | Indian Rupees (₹) | Currency metric |
  | Base Threshold | $A \ge \text{₹2,00,00,000}$ (₹2 Cr) & Reliance $\ge 95\%$ | Minimum trigger criteria |
  | Base Score | $0.65$ | Starting score at trigger point |
  | Scale Factor | $100,000,000$ (₹10 Cr) | Normalization divisor |
  | Scaling Coefficient | $0.10$ | Rate of score growth per scale unit |
  | Upper Bound | $1.00$ | Score ceiling ($\min(1.0, \dots)$) |
- **Severity Mapping:**
  - $\text{Severity} = \mathbf{HIGH} \iff A \ge \text{₹5,00,00,000}$
  - $\text{Severity} = \mathbf{MEDIUM} \iff A < \text{₹5,00,00,000}$

---

### 2.10 Baseline ML Multivariate Outliers (`MULTIVARIATE_WORK_OUTLIER`)
- **Inputs:** `IsolationForest.score_samples` ($S_{\text{raw}}$)
- **Formula:**
  $$S = \min\left(1.0, \, \max\left(0.50, \, (S_{\text{raw}} - 0.50) \times 2.0\right)\right)$$
- **Severity Mapping:** $\mathbf{LOW}$ (Exploratory statistical baseline flag).
