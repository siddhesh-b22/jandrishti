# SIH26102 — Final Forensic Verification & Audit Matrix
## Phase 11.1 SIH Submission Readiness Report

**Platform:** MPLADS Analytics — Lok Sabha & Rajya Sabha  
**Audit Date:** 2026-08-26  
**Auditor:** SIH26102 Automated Forensic Pipeline & Anti-Fabrication Validator  
**Scope:** Full Bicameral Parliament (18th Lok Sabha & Rajya Sabha)  
**Standard:** Source-Derived Truth, Zero-Fabrication, Non-Accusatory Governance  

---

## 1. Forensic Verification Matrix

| CATEGORY | RESULT | EVIDENCE | STATUS |
| :--- | :--- | :--- | :--- |
| **Official Rajya Sabha source** | De-obfuscated & queried official MoSPI eSAKSHI public endpoints | Preserved raw JSON artifacts in `data/raw/rajya_sabha/` (40 files) with SHA-256 hashes in `data/processed/dataset_checksums.csv` | **VERIFIED** |
| **Member reconciliation** | 235 Rajya Sabha MPs + 543 Lok Sabha MPs = 778 Total MPs | Source: 235, DB: 235, Variance: **0** (`SELECT COUNT(*) FROM mps WHERE house = 'Rajya Sabha'`) | **VERIFIED (₹0.00 / 0 Variance)** |
| **Allocation reconciliation** | ₹33,61,33,47,899.82 (RS) + ₹83,06,21,04,294.53 (LS) = ₹1,16,67,54,52,194.35 | Raw RS Sum: ₹33,61,33,47,899.82, DB: ₹33,61,33,47,899.82, Variance: **₹0.00** | **VERIFIED (₹0.00 Variance)** |
| **Expenditure reconciliation**| ₹12,28,32,01,022.69 (RS) + ₹27,19,13,90,292.45 (LS) = ₹39,47,45,91,315.14 | Raw RS Sum: ₹12,28,32,01,022.69, DB: ₹12,28,32,01,022.69, Variance: **₹0.00** | **VERIFIED (₹0.00 Variance)** |
| **Works aggregate reconciliation** | 24,656 Recommended & 9,855 Completed works across 235 RS MPs | Source: 24,656 Rec / 9,855 Comp, DB: 24,656 Rec / 9,855 Comp, Variance: **0 works** | **VERIFIED (0 Variance)** |
| **House dimension** | Fully normalized `house` field in `mps` (`'Lok Sabha'`, `'Rajya Sabha'`) | 543 Lok Sabha MPs (territorial constituencies), 235 Rajya Sabha MPs (State/UT / Nominated) | **VERIFIED** |
| **Rajya Sabha anomalies** | 27 explainable risk indicators generated from empirical distributions | 18 Low Utilization, 7 High Allocation, 2 Calamity Consent flags with full 15-column traceability | **VERIFIED (100% Explainable)** |
| **Granular works limitation** | Rajya Sabha granular work items stored as `NULL` / not fabricated | Granular physical works in DB: Lok Sabha = 102,437, Rajya Sabha = 0 (Explicitly disclosed in UI) | **VERIFIED (No Fabrication)** |
| **Transaction limitation** | Rajya Sabha granular payment vouchers stored as `NULL` / not fabricated | Granular vouchers in DB: Lok Sabha = 82,296, Rajya Sabha = 0 (Explicitly disclosed in UI) | **VERIFIED (No Fabrication)** |
| **Vendor limitation** | Rajya Sabha granular vendor linkages stored as `NULL` / not fabricated | Granular vendors in DB: Lok Sabha = 22,377, Rajya Sabha = 0 (Explicitly disclosed in UI) | **VERIFIED (No Fabrication)** |
| **API tests** | 33/33 Pytest test cases passed across all endpoints & houses | `pytest -v` executed with 0 failures; handles `ALL`, `LOK_SABHA`, `RAJYA_SABHA`, pagination, 422 bounds | **VERIFIED (33/33 Passed)** |
| **Frontend tests** | All 9 pages render cleanly with 0 console errors & responsive house switcher | Tested on `http://127.0.0.1:3000/` across All Houses, Lok Sabha, and Rajya Sabha views | **VERIFIED (0 Errors)** |
| **Production build** | TypeScript + Vite production build compiles without errors | `npm run build` completed in 17.06s with exit code 0 (`dist/index.html`, `dist/assets/`) | **VERIFIED** |
| **Anti-fabrication compliance**| No fake GPS coordinates, no fake work IDs, no fake transaction-work links | Unobserved parameters preserved as `NULL` and rendered with provenance badges | **VERIFIED** |
| **Non-accusatory governance** | Neutral audit terminology (*"Analytical Risk Indicator — Requires Review"*) | No claims of fraud, corruption, or guilt anywhere in code, API, or frontend | **VERIFIED** |

---

## 2. Reporting Window & Snapshot Disclosure

> [!NOTE]
> **Cross-House Snapshot Lineage:**
> Cross-house combined totals represent a **reporting-window aggregation**, not a simultaneous single-source snapshot:
> - **Lok Sabha Snapshot:** 2026-08-25 (Cumulative 18th Lok Sabha public portal export)
> - **Rajya Sabha Snapshot:** 2026-08-26 (MoSPI eSAKSHI live API extraction)

---

## 3. Granularity & Provenance Disclosures

To prevent misleading claims, the platform strictly enforces the following semantic categorizations across all documentation, API responses, and frontend cards:

1. **Member-Level Totals (Bicameral Aggregate):**
   - Total Members: 778 MPs (543 Lok Sabha + 235 Rajya Sabha)
   - Total Allocated Limits: ₹1,16,67,54,52,194.35 (₹8,306.21 Cr LS + ₹3,361.33 Cr RS)
   - Total Cumulative Expenditure: ₹39,47,45,91,315.14 (₹2,719.14 Cr LS + ₹1,228.32 Cr RS)
   - Member-Level Recommended Works: 93,528 works (68,872 LS + 24,656 RS)
   - Member-Level Completed Works: 43,601 works (33,746 LS + 9,855 RS)

2. **Granular Datasets (Lok Sabha Source Only):**
   - Granular Physical Works: **Lok Sabha = 102,437**, **Rajya Sabha = Not available in current source export**
   - Granular Disbursement Vouchers: **Lok Sabha = 82,296**, **Rajya Sabha = Not available in current source export**
   - Granular Contractors / Vendors: **Lok Sabha = 22,377**, **Rajya Sabha = Not available in current source export**

3. **Traceable Explainable Anomalies:**
   - Total Active Indicators: **1,831 flags** (1,804 Lok Sabha + 27 Rajya Sabha)
   - Traceability: 100% backed by 15-column mathematical audit trail (observed metric, detection threshold, MAD Robust Z-score, empirical percentile, supporting JSON).

---

## 4. Final SIH Submission Statement

**Defensible Technical Claim:**  
> *"Bicameral MPLADS analytics with source-aware granularity and explicit data limitations."*
