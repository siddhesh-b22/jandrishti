# SIH26102 — Hackathon Demonstration Script & Presentation Guide

**Session Duration:** 5 to 7 Minutes  
**Target Audience:** SIH Evaluation Panel & Technical Judges  
**Core Theme:** Trustworthy, Explainable, Non-Accusatory MPLADS Data Intelligence  

---

## 1. Top 5 Showcase Anomaly Records (Pre-Audited & Verified)

| # | Entity Grain | Entity ID | Anomaly Type | Severity | Score | Observed Metric | Key Audit Rationale for Judges |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **WORK** | `303957` | `UNUSUALLY_HIGH_RECOMMENDED_AMOUNT` | `CRITICAL` | `1.0000` | ₹2,50,00,000.00 | **99.9th percentile** in category 'Normal/Others' ($+8.24\sigma$ above category median of ₹3,00,000). |
| 2 | **MP** | `INTERNAL_MP_538` | `HIGH_VENDOR_CONCENTRATION` | `HIGH` | `0.9800` | 100.0% Top Vendor | Single contractor captured **100% of MP's ₹4.12 Cr expenditure** (HHI = 10,000 across 25 vouchers). |
| 3 | **MP** | `INTERNAL_MP_490` | `UNUSUAL_PENDING_PAYMENT_RATIO` | `HIGH` | `1.0000` | 70.8% Pending Rate | **17 out of 24 transaction vouchers** remain unresolved in pending status, highlighting an administrative bottleneck. |
| 4 | **TRANSACTION** | `TXN_005575` | `UNUSUALLY_HIGH_EXPENDITURE_TRANSACTION` | `CRITICAL` | `1.0000` | ₹2,47,00,000.00 | Single road voucher is **$+19.3\sigma$ robust standard deviations** above the activity median. |
| 5 | **VENDOR** | `INTERNAL_VND_00005` | `VENDOR_SINGLE_MP_DOMINANCE` | `HIGH` | `0.7730` | 100.0% Reliance | Contractor received **₹12.30 Cr in revenue**, with 100% originating exclusively from a single parliamentary patron. |

---

## 2. Step-by-Step Presentation Script

### Stage 1: Macro Governance & Financial Integrity (0:00 – 1:30)
- **Action:** Open `http://localhost:3000/` (Overview Dashboard).
- **Speaking Points:**
  > *"Respected Judges, welcome to the SIH26102 MPLADS Analytics Platform. Public expenditure accountability requires complete mathematical truthfulness. Our platform ingests 100% of official Government of India public exports for the 18th Lok Sabha, spanning 543 MPs, 102,437 physical works, 82,296 transaction vouchers, and 22,377 vendors."*
- **Key Visuals to Highlight:**
  - Point to the **Macro Financial KPI Cards**: Total Allocated Funds (₹8,306.21 Cr), Cumulative Expenditure (₹2,719.14 Cr), and National Fund Utilization (32.74%).
  - Highlight the **₹0.00 Reconciliation Variance badge**: Our relational 3-NF database matches the ministry portal benchmarks with zero monetary variance.
  - Explain our **Provenance Tags** (`[SOURCE-DERIVED]`, `[CALCULATED]`, `[ANALYTICAL]`, `[AUDIT RISK]`).

---

### Stage 2: Explainable Anomaly Center (1:30 – 3:00)
- **Action:** Click **"Anomaly Center"** in the top navigation bar (`/anomalies`).
- **Speaking Points:**
  > *"Rather than using opaque 'black-box' scoring, our platform operates on an explainable, 15-column mathematical framework. Crucially, our system is non-accusatory. We never claim an anomaly proves fraud or corruption; instead, our algorithms compute robust Z-scores via Median Absolute Deviation and market concentration indices to highlight statistical outliers that warrant administrative audit."*
- **Live Interaction:**
  1. Click the **"Critical Risk"** severity card (21 active flags).
  2. Filter by Entity Grain: **"WORK"**.
  3. Expand **Work #303957**: Show the plain-language explanation: *"Recommended amount of ₹2,50,00,000.00 is in the 99.9th percentile for 'Normal/Others' (+8.24 robust standard deviations above median)."*
  4. Expand the **Traceability JSON parameters**: Show exact threshold boundary, observed value, and category baseline.

---

### Stage 3: Work Drill-Down & MP Profile (3:00 – 4:30)
- **Action:** Click **"View WORK #303957"** to navigate to `/works/303957`.
- **Speaking Points:**
  > *"When an auditor inspects a work item, they see its full lifecycle. Here, the Analytical Risk Indicator card is prominently displayed with its calibrated score meter."*
- **Live Interaction:**
  1. Show that unobserved fields (`sanctioned_amount`, `latitude/longitude`) are strictly disclosed as *"Not available in current source export"*, rather than fabricated.
  2. Click on the MP's name to drill down to the **MP Analytical Profile** (`/mps/INTERNAL_MP_104`).
  3. Show **Section D: Top Contractor Procurement Footprint**, displaying the contractor disbursement share measured against the MP's total recorded expenditure.

---

### Stage 4: Procurement Concentration & Vendor Reliance (4:30 – 5:45)
- **Action:** Click **"Vendor Intel"** (`/vendors`) and filter by `Single-Patron Reliance ≥ 95%`.
- **Speaking Points:**
  > *"In public procurement, single-patron reliance is a recognized institutional risk. In our Vendor Explorer, we analyze 22,377 contractors. For instance, Vendor `INTERNAL_VND_00005` received ₹12.30 Crores in public disbursements, with 100% of revenue originating from a single MP."*
- **Action:** Click **"Transactions"** (`/transactions`) to showcase the 82,296 line-item vouchers.
  > *"Notice our relational safety notice: transactions connect to MPs and Vendors. We do not artificially synthesize a fake Work ID link where the source data does not supply one."*

---

### Stage 5: Data Lineage & Methodology Defense (5:45 – 6:30)
- **Action:** Click **"Methodology"** (`/methodology`).
- **Speaking Points:**
  > *"Every single step in our pipeline is transparent, reproducible, and verifiable. Our end-to-end lineage diagram traces raw data from collection to SQLite 3-NF normalization, robust MAD feature engineering, and our REST API. The entire system rebuilds with a single deterministic command."*

---

## 3. Potential Judge Questions & Suggested Answers

**Q1: How do you prevent Cartesian explosion or double-counting of MP funds?**  
> *"MP-level reference attributes (e.g. `allocated_amount`, `total_expenditure`) are stored in `allocation_master` and never summed across work rows. All state and national roll-ups are computed via `v_state_summary` which aggregates strictly at the MP grain."*

**Q2: Why doesn't your map plot exact GPS pins on villages?**  
> *"The official MPLADS public data export only provides district/IDA levels and does not contain verified latitude/longitude coordinates. In compliance with strict public-sector audit integrity, we never fabricate or simulate fake map coordinates."*

**Q3: Why did you use MAD (Median Absolute Deviation) instead of standard standard deviation?**  
> *"Public spending data is heavily right-skewed with extreme Pareto distributions. Standard mean and standard deviation are heavily corrupted by outliers. Robust Z-scores using MAD provide breakdown point resistance up to 50% contamination."*
