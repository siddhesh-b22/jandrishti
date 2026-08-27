# SIH26102 — Rajya Sabha Financial & Operational Reconciliation Report

**Audit Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Standard:** Double-Entry Mathematical Reconciliation & Provenance Verification  
**Status:** **₹0.00 MONETARY VARIANCE (LOK SABHA, RAJYA SABHA & COMBINED)**  

---

## 1. Reporting Window & Snapshot Lineage

> [!IMPORTANT]
> **Cross-House Snapshot Lineage:**
> Cross-house totals are a **reporting-window aggregation**, not a simultaneous single-source snapshot:
> - **Lok Sabha Data Snapshot:** 2026-08-25 (Cumulative 18th Lok Sabha public portal export)
> - **Rajya Sabha Data Snapshot:** 2026-08-26 (MoSPI eSAKSHI live API extraction)

---

## 2. Lok Sabha Financial Reconciliation

- **Source Dataset:** MoSPI Official 18th Lok Sabha Summary & Allocation Master Export
- **Raw Source Total Allocated:** ₹83,06,21,04,294.53 (₹8,306.21 Crore)
- **Database `mps` Table Sum:** ₹83,06,21,04,294.53
- **Database `allocations` Table Sum:** ₹83,06,21,04,294.53
- **Monetary Variance:** **₹0.00**
- **Raw Source Total Expenditure:** ₹27,19,13,90,292.45 (₹2,719.14 Crore)
- **Database `mps` Total Expenditure:** ₹27,19,13,90,292.45
- **Monetary Variance:** **₹0.00**

---

## 3. Rajya Sabha Financial Reconciliation

- **Source Dataset:** MoSPI Official eSAKSHI Portal `getTilesData` Macro & Member REST API
- **Official Portal Macro Allocated Limit:** ₹33,61,33,47,899.82 (₹3,361.33 Crore)
- **Sum of 235 Member Tile Allocations:** ₹33,61,33,47,899.82
- **Database `mps` (house='Rajya Sabha') Sum:** ₹33,61,33,47,899.82
- **Monetary Variance:** **₹0.00**
- **Official Portal Macro Expenditure:** ₹12,28,32,01,022.69 (₹1,228.32 Crore)
- **Sum of 235 Member Tile Expenditures:** ₹12,28,32,01,022.69
- **Database `mps` (house='Rajya Sabha') Sum:** ₹12,28,32,01,022.69
- **Monetary Variance:** **₹0.00**

---

## 4. Bicameral Verification & Reconciliation Matrix

| Parameter | 18th Lok Sabha | Rajya Sabha | Combined Parliament | Official Source Totals | Reconciliation Variance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Members (MPs)** | 543 | 235 | **778** | 778 | **0 (Exact)** |
| **Allocated Limits** | ₹83,06,21,04,294.53 | ₹33,61,33,47,899.82 | **₹1,16,67,54,52,194.35** | ₹1,16,67,54,52,194.35 | **₹0.00 (Exact)** |
| **Total Expenditure** | ₹27,19,13,90,292.45 | ₹12,28,32,01,022.69 | **₹39,47,45,91,315.14** | ₹39,47,45,91,315.14 | **₹0.00 (Exact)** |
| **Unspent Balance** | ₹55,87,07,14,002.08 | ₹21,33,01,46,877.13 | **₹77,20,08,60,879.21** | ₹77,20,08,60,879.21 | **₹0.00 (Exact)** |
| **National Utilization** | 32.74% | 36.54% | **33.83%** | 33.83% | **0.00% (Exact)** |
| **Recommended Works** | 68,872 | 24,656 | **93,528** | 93,528 | **0 (Exact)** |
| **Completed Works** | 33,746 | 9,855 | **43,601** | 43,601 | **0 (Exact)** |
| **National Completion** | 49.00% | 39.97% | **46.62%** | 46.62% | **0.00% (Exact)** |
| **Physical Work Items (Granular)** | 102,437 | Not in Export | **102,437 (LS Only)** | 102,437 | **0 (No Fabrication)** |
| **Payment Vouchers (Granular)** | 82,296 | Not in Export | **82,296 (LS Only)** | 82,296 | **0 (No Fabrication)** |
| **Vendors / Contractors (Granular)**| 22,377 | Not in Export | **22,377 (LS Only)** | 22,377 | **0 (No Fabrication)** |
| **Explainable Flags** | 1,804 | 27 | **1,831** | 1,831 | **100% Traceable** |

---

## 5. Granularity Disclosures

1. **Granular Physical Works:** Lok Sabha provides 102,437 line-item project records with category, description, and status. Rajya Sabha public exports provide member-level aggregated counts (24,656 recommended, 9,855 completed, 19,202 sanctioned). No granular works are fabricated for Rajya Sabha.
2. **Granular Payment Vouchers:** Lok Sabha provides 82,296 payment transactions to 22,377 vendors. Rajya Sabha public exports provide member-level financial totals.
3. **Double-Counting Prevention:** Transactions are linked to MPs and Vendors, never artificially linked to physical works.
