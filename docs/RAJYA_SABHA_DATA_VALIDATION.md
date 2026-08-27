# SIH26102 — Rajya Sabha Data Validation & Integrity Report

**Validation Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Scope:** Rajya Sabha Data Ingestion, Relational Integrity, and Anomaly Validation  
**Status:** **100% VALIDATED (0 DUPLICATES • 0 FK VIOLATIONS • ₹0.00 RECONCILIATION VARIANCE)**  

---

## 1. Source Record Ingestion Summary

| Entity Grain | Official Source Dataset | Raw Artifact Count | Ingested Database Count | Reconciliation Status |
| :--- | :--- | :---: | :---: | :---: |
| **Rajya Sabha Members** | `PreLoginDashboardData/getMpNamesData` | 235 | 235 | **100% (0 Missing, 0 Duplicates)** |
| **Rajya Sabha Allocations** | `PreLoginDashboardData/getTilesData` | 235 | 235 | **100% (₹0.00 Variance)** |
| **Rajya Sabha State Rollups** | `PreLoginDashboardData/getStateData` | 36 | 36 | **100% (36 States/UTs)** |
| **Rajya Sabha Anomalies** | Analytical Engine (`MAD Robust Z-Score`) | 27 | 27 | **100% (15 Traceable Columns)** |

---

## 2. Relational Integrity & Schema Validation Checks

1. **Primary Key Uniqueness:**
   - `mps.internal_mp_id`: 235 unique keys (`INTERNAL_RS_MP_001` through `INTERNAL_RS_MP_235`). Zero collisions with existing Lok Sabha IDs (`INTERNAL_MP_001` .. `543`).
   - `allocations.internal_mp_id`: 235 unique 1:1 foreign keys matching `mps.internal_mp_id`.
2. **Foreign Key Integrity:**
   - 0 orphan allocation records.
   - 0 foreign key constraint violations under `PRAGMA foreign_keys = ON;`.
3. **Data Quality & Null Discipline:**
   - `house`: 100% populated with `'Rajya Sabha'` (or `'Lok Sabha'`).
   - Non-existent fields (Lok Sabha-style territorial constituency, work coordinates, contractors) are stored as `NULL` or explicitly disclosed as `State Representation` / `Nominated`.
   - Zero fabricated relationships.

---

## 3. Financial Aggregate Reconciliation

| House Dimension | Metric Category | Source Portal Total | Database Aggregation | Variance |
| :--- | :--- | :--- | :--- | :--- |
| **Rajya Sabha** | Allocated Limit | ₹33,61,33,47,899.82 | ₹33,61,33,47,899.82 | **₹0.00** |
| **Rajya Sabha** | Total Expenditure | ₹12,28,32,01,022.69 | ₹12,28,32,01,022.69 | **₹0.00** |
| **Rajya Sabha** | Recommended Works | 24,656 | 24,656 | **0 Works** |
| **Rajya Sabha** | Completed Works | 9,855 | 9,855 | **0 Works** |
| **Rajya Sabha** | Sanctioned Works | 19,202 | 19,202 | **0 Works** |
| **Lok Sabha** | Allocated Limit | ₹83,06,21,04,294.53 | ₹83,06,21,04,294.53 | **₹0.00** |
| **Lok Sabha** | Total Expenditure | ₹27,19,13,90,292.45 | ₹27,19,13,90,292.45 | **₹0.00** |
| **Combined (All)** | **Total Allocated Limit** | **₹1,16,67,54,52,194.35** | **₹1,16,67,54,52,194.35** | **₹0.00** |
| **Combined (All)** | **Total Expenditure** | **₹39,47,45,91,315.14** | **₹39,47,45,91,315.14** | **₹0.00** |

---

## 4. Anomaly Engine Output

The Rajya Sabha anomaly engine generated 27 explainable analytical review indicators:
- **Low Utilization Alerts:** 18 members with allocation $\ge \text{₹}10.0\text{ Cr}$ and utilization $< 10.0\%$.
- **High Allocation Limit Outliers:** 7 members with allocation limit $> +3.0\sigma$ MAD above the Rajya Sabha median of ₹14.70 Cr.
- **Significant Calamity Consents:** 2 members who consented $> \text{₹}1.0\text{ Cr}$ towards disaster relief.

All 27 flags adhere strictly to transparent, non-accusatory civic audit language (*"Analytical Risk Indicator — Requires Review"*).
