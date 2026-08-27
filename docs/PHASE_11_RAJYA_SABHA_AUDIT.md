# SIH26102 — Phase 11: Rajya Sabha Architecture & Integration Audit

**Audit Date:** 2026-08-26  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Objective:** Extend from *18th Lok Sabha MPLADS Analytics* to *MPLADS Analytics — Lok Sabha & Rajya Sabha*  
**Status:** **AUDIT COMPLETE — OFFICIAL RAJYA SABHA SOURCES DISCOVERED & VERIFIED**  

---

## 1. Existing Lok Sabha Architecture & Baseline

The existing platform operates with 100% verified Lok Sabha data:
- **House:** 18th Lok Sabha ($543$ Members)
- **Monetary Aggregates:** ₹8,306.21 Cr Allocated Limit, ₹2,719.14 Cr Expenditure
- **Physical Works:** $102,437$ records ($68,872$ active recommendations, $33,746$ legacy completions)
- **Financial Vouchers:** $82,296$ payment transactions across $22,377$ unique vendors
- **Anomaly Detection:** $1,804$ explainable flags across 15 traceable columns (MAD robust Z-score, HHI, Isolation Forest)
- **Database Engine:** SQLite 3-NF in Write-Ahead Logging (`WAL`) mode with thread-safety

---

## 2. Official Rajya Sabha Data Sources Discovered

Using direct HTTP session probing against the official Ministry of Statistics and Programme Implementation (MoSPI) **eSAKSHI Portal** (`https://www.mplads.mospi.gov.in`), we discovered and verified the following official REST endpoints:

| # | Official Portal REST Endpoint | Request Method & Payload | Data Provided | Discovered Entity Count |
| :- | :--- | :--- | :--- | :--- |
| 1 | `/rest/PreLoginDashboardData/getTilesData` | `POST {"uname": "0,0,0,1"}` | Rajya Sabha Macro KPI Tiles (Allocation, Expenditure, Works Recommended, Works Sanctioned, Works Completed, Calamity Consent) | **1 Macro Record** |
| 2 | `/rest/PreLoginDashboardData/getTotalMPData` | `POST {"uname": "0,0,0,1"}` | Total Active Rajya Sabha Members count | **235 Active Members** |
| 3 | `/rest/PreLoginDashboardData/getStateData` | `POST {}` | 36 States & Union Territories reference dictionary | **36 States/UTs** |
| 4 | `/rest/PreLoginDashboardData/getMpNamesData` | `POST {"state_combo": "<state_id>,1,"}` | Full Member Directory by State with official Member ID, Caption, and Term | **235 Member Records** |
| 5 | `/rest/PreLoginDashboardData/getTilesData` | `POST {"uname": "<state_id>,0,<mp_id>,1"}` | Individual Member-level Financial and Work Totals (Allocated Limit, Expenditure, Recommended, Sanctioned, Completed, Calamity) | **235 Member Profiles** |
| 6 | `/rest/PreLoginDashboardData/getTilesData` | `POST {"uname": "<state_id>,0,0,1"}` | State-level Rajya Sabha Aggregations | **36 State Profiles** |

---

## 3. Discovered Source Fields & Normalization Mapping

| Entity | Official Source Field | Normalized Database Field | Data Type | Safe Mapping Semantics |
| :--- | :--- | :--- | :--- | :--- |
| **House** | eSAKSHI House `1` | `house` | `VARCHAR(20)` | `'RAJYA_SABHA'` |
| **MP / Member** | `ID` | `source_member_id` | `BIGINT` | Official eSAKSHI MP ID (e.g. `3017196`) |
| **MP / Member** | Internal Surrogate | `mp_id` | `VARCHAR(50)` | Generated ID (e.g. `INTERNAL_RS_MP_001` .. `235`) |
| **MP / Member** | `CAPTION` (parsed) | `mp_name` | `VARCHAR(200)` | Member Name (e.g. `Shri S Niranjan Reddy`) |
| **MP / Member** | `CAPTION` (tenure) | `tenure_term` | `VARCHAR(50)` | Term (e.g. `2022-28`, `2024-30`) |
| **MP / Member** | `STATE_NAME` | `state` | `VARCHAR(100)` | State/UT Representation |
| **MP / Member** | Representation | `constituency` | `VARCHAR(100)` | State/UT representation or `"Nominated"` |
| **MP / Member** | Nomination Status | `member_type` | `VARCHAR(50)` | `"Elected"` or `"Nominated"` |
| **Allocation** | `Allocated Limit for Hon'ble MPs` | `allocated_amount` | `DOUBLE` | ₹ exact limit from official tile |
| **Expenditure** | `Expenditure on Completed/On-going` | `total_expenditure` | `DOUBLE` | ₹ exact expenditure from official tile |
| **Physical Work** | `Works Recommended` (count & amt) | `recommended_works_count`, `recommended_amount` | `INT`, `DOUBLE` | Official project count and proposed cost |
| **Physical Work** | `Works Sanctioned` (count & amt) | `sanctioned_works_count`, `sanctioned_amount` | `INT`, `DOUBLE` | Official project count and sanction cost |
| **Physical Work** | `Works Completed` (count & amt) | `completed_works_count`, `completed_amount` | `INT`, `DOUBLE` | Official project count and completion cost |
| **Calamity** | `Amount consented for Calamity` | `calamity_consent_amount` | `DOUBLE` | ₹ exact calamity contribution |

---

## 4. Fields That Do NOT Exist in Public Export (Strict Non-Fabrication)

In compliance with strict data governance rules:
1. **No Constituency for Rajya Sabha:** Rajya Sabha members represent entire States/UTs or are Nominated by the President of India. We store `State / UT Representation` and NEVER fabricate a false territorial Lok Sabha constituency.
2. **No Unverified Transaction-to-Work Links:** No artificial transaction $\rightarrow$ work foreign keys are synthesized.
3. **Missing Work-Level Coordinates:** Work coordinates (`latitude`, `longitude`), `village`, `block`, and `contractor` remain `NULL` with the transparent disclosure: *"Not available in current source export"*.
4. **No Synthetic Work Records:** Individual work records are only stored where official source records exist. Macro work metrics (`recommended_works_count`, `completed_works_count`, `sanctioned_works_count`) are preserved faithfully at the MP and State grains.

---

## 5. Proposed Database Schema Extension (Zero Lok Sabha Regressions)

Add a `house` column with check constraint `CHECK (house IN ('LOK_SABHA', 'RAJYA_SABHA'))` across:
- `mps` (`house VARCHAR(20) DEFAULT 'LOK_SABHA' NOT NULL`)
- `allocations` (`house VARCHAR(20) DEFAULT 'LOK_SABHA' NOT NULL`)
- `works` (`house VARCHAR(20) DEFAULT 'LOK_SABHA' NOT NULL`)
- `transactions` (`house VARCHAR(20) DEFAULT 'LOK_SABHA' NOT NULL`)
- `anomalies` (`house VARCHAR(20) DEFAULT 'LOK_SABHA' NOT NULL`)
- `v_state_summary` (Rebuilt to support `house` filtering and combined state rollups)

---

## 6. Proposed API & Frontend Changes

1. **`GET /api/houses`**: Returns list of supported parliamentary houses (`LOK_SABHA`, `RAJYA_SABHA`).
2. **`GET /api/stats`**: Extended to return combined totals along with `lok_sabha` and `rajya_sabha` breakdown objects.
3. **House Filter Parameters**: Added optional `?house=LOK_SABHA` or `?house=RAJYA_SABHA` to `/api/mps`, `/api/works`, `/api/anomalies`, `/api/states`, `/api/transactions`, `/api/vendors`.
4. **Global House Selector**: React context offering `All Houses`, `Lok Sabha`, and `Rajya Sabha` persisting across all navigation tabs.
