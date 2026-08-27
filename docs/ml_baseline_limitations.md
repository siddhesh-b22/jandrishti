# SIH26102 — Two-Feature Unsupervised ML Baseline & Limitations

**Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Target Algorithm:** `IsolationForest` Baseline Model  
**Status:** Baseline Established & Documented  

---

## 1. Baseline Model Definition: Two-Feature Unsupervised Isolation Forest

The machine learning component of the SIH26102 anomaly engine is explicitly implemented as a **Two-Feature Unsupervised Baseline** to provide an empirical comparative baseline against deterministic statistical rules.

### Input Features:
1. $x_1 = \log(1 + \text{recommended\_amount})$ — Log-transformed monetary value of the proposed work.
2. $x_2 = \text{description\_char\_length}$ — Character length of the official work description string.

### Model Hyperparameters:
- **Algorithm:** `sklearn.ensemble.IsolationForest`
- **Number of Estimators:** $100$
- **Contamination Rate:** $0.015$ ($1.5\%$ theoretical outlier fraction)
- **Random State:** $42$ (Deterministic seed)
- **Bootstrap:** `False`

---

## 2. Rationale & Justification for `description_char_length`

### Why `description_char_length` Was Included:
In public procurement and scheme administration, project descriptions often reflect proposal structure:
- **Extremely Short Descriptions ($\le 10$ characters):** May indicate vague, non-specific scope definitions (e.g., *"Road work"*, *"Lights"*).
- **Extremely Long Descriptions ($\ge 250$ characters):** May indicate combined/bundled multi-scope proposals or anomalous copy-pasting of administrative boilerplate.
- When paired with high monetary values in a joint 2D feature space, the algorithm isolates works located in sparse regions of the `(Amount, Detail)` distribution.

---

## 3. Methodological Limitations & Quality Safeguards

> [!WARNING]
> **Key Limitations of the Two-Feature ML Baseline:**
> 1. **Lack of Semantic Understanding:** Character length is purely structural and does not evaluate grammatical coherence, technical feasibility, or lexical validity.
> 2. **Unsupervised Nature (No Ground Truth Labels):** Because public government datasets lack verified positive fraud labels, unsupervised tree splits identify statistical sparsity, not intentional wrongdoing.
> 3. **Non-Determinism in Sub-sampling:** Although `random_state=42` ensures computational reproducibility, tree-partitioning algorithms can exhibit boundary variance.

### Safeguards Implemented:
1. **Low Severity Classification:** All flags generated exclusively by the Isolation Forest are classified strictly as **`Severity: LOW`** with anomaly type `MULTIVARIATE_WORK_OUTLIER`.
2. **Deterministic Priority:** The platform prioritizes explainable, deterministic statistical rules (MAD Z-scores, HHI) over unsupervised tree flags for core dashboard indicators.
3. **No Standalone Accusations:** ML anomaly flags are presented purely as data-quality and distribution exploration markers.
