# SIH26102 — Comprehensive Data Profile Report

**Execution Timestamp:** 2026-08-26 16:03:00 IST  
**Environment:** Python 3.13.11 / Pandas 3.0.5 / NumPy 2.5.2  
**Analyzed Directory:** `data/raw/`  

---

## 1. Executive Summary & Cross-Dataset Reconciliation

The raw datasets provide an official snapshot of the 18th Lok Sabha MPLADS scheme implementation as of August 26, 2026.

All four CSV datasets and the summary JSON benchmark reconcile with **100.00% exact mathematical precision**:

| Dimension / Metric | Benchmark Portal JSON (`json_2026-08-26.json`) | MP Summary CSV Sum (`mplads_mp_summary_...`) | Child Detail CSV Actuals | Variance / Discrepancy |
| :--- | :--- | :--- | :--- | :--- |
| **Total MPs (Lok Sabha)** | 543 | 543 | 543 Unique MPs across child tables | **0.00 (Exact)** |
| **Total Allocated Amount** | ₹83,062,104,294.53 | ₹83,062,104,294.53 | ₹83,062,104,294.53 | **₹0.00 (Exact)** |
| **Total Expenditure Amount** | ₹27,191,390,292.45 | ₹27,191,390,292.45 | ₹27,191,390,292.45 (82,296 txns) | **₹0.00 (Exact)** |
| **Total Recommended Works Count** | 68,872 | 68,872 | 68,872 rows in Recommended Works | **0 (Exact)** |
| **Total Recommended Works Value** | — | — | ₹39,681,479,028.54 | **Traceable** |
| **Total Completed Works Count** | 33,746 | 33,746 | 33,746 rows in Completed Works | **0 (Exact)** |
| **Total Completed Works Value** | ₹16,260,632,748.40 | — | ₹16,260,632,748.40 | **₹0.00 (Exact)** |
| **Total Financial Transactions** | 82,296 | 82,296 | 82,296 rows in Expenditures | **0 (Exact)** |

---

## 2. Dataset-by-Dataset Detailed Profile

### 2.1 Dataset: `mplads_mp_summary_2026-08-26.csv`
- **File Size:** 65,885 bytes (0.06 MB)
- **Total Records (Rows):** 543
- **Total Fields (Columns):** 15
- **Exact Duplicate Rows:** 0
- **Primary Key Candidate:** `MP Name` (543 unique, 0 nulls, 100% unique PK)
- **Entity Grain:** One row per Lok Sabha Member of Parliament (1:1 MP grain)

#### Column Profiles:
| # | Column Name | Raw Dtype | Null Count | Null % | Unique Values | Min Value | Max Value | Sum / Total | Sample Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `MP Name` | object | 0 | 0.0% | 543 | — | — | — | `A. RAJA`, `A. GANESHAMURTHI`, `A.K.P. CHINRAJ` |
| 2 | `Constituency` | object | 0 | 0.0% | 539 | — | — | — | `NILGIRIS`, `ERODE`, `NAMAKKAL` |
| 3 | `State` | object | 0 | 0.0% | 36 | — | — | — | `Tamil Nadu`, `Uttar Pradesh`, `Maharashtra` |
| 4 | `House` | object | 0 | 0.0% | 1 | — | — | — | `Lok Sabha` |
| 5 | `Allocated Amount (₹)` | float64 | 0 | 0.0% | 13 | ₹10,00,00,000.00 | ₹32,74,77,419.00 | ₹83,06,21,04,294.53 | `152968884.52`, `150000000.00` |
| 6 | `Total Expenditure (₹)` | float64 | 0 | 0.0% | 532 | ₹0.00 | ₹18,47,83,837.00 | ₹27,19,13,90,292.45 | `49298288.00`, `7407000.00` |
| 7 | `Utilization %` | float64 | 0 | 0.0% | 502 | 0.00% | 93.98% | Mean: 32.74% | `32.23`, `4.94`, `0.00` |
| 8 | `Completed Works` | int64 | 0 | 0.0% | 204 | 0 | 725 | 33,746 | `97`, `10`, `0` |
| 9 | `Recommended Works` | int64 | 0 | 0.0% | 286 | 0 | 1,356 | 68,872 | `153`, `35`, `0` |
| 10 | `Completion Rate %` | float64 | 0 | 0.0% | 461 | 0.00% | 96.39% | Mean: 48.99% | `63.40`, `28.57`, `0.00` |
| 11 | `Unspent Amount (₹)` | float64 | 0 | 0.0% | 534 | ₹1,03,50,000.00 | ₹29,86,13,581.00 | ₹55,87,07,14,002.08 | `103670596.52`, `142593000.00` |
| 12 | `Transaction Count` | int64 | 0 | 0.0% | 273 | 0 | 1,939 | 82,296 | `246`, `27`, `0` |
| 13 | `Successful Payments` | int64 | 0 | 0.0% | 273 | 0 | 1,939 | 80,723 | `246`, `27`, `0` |
| 14 | `Pending Payments` | int64 | 0 | 0.0% | 47 | 0 | 158 | 1,573 | `0`, `22`, `8` |
| 15 | `Average Rating` | float64 | 539 | 99.26% | 2 | 1.00 | 5.00 | Mean: 3.25 | `5.0`, `1.0`, `NaN` |

---

### 2.2 Dataset: `mplads_recommended_works_2026-08-26.csv`
- **File Size:** 17,782,809 bytes (16.96 MB)
- **Total Records (Rows):** 68,872
- **Total Fields (Columns):** 11
- **Exact Duplicate Rows:** 0
- **Primary Key Candidate:** `Work ID` (68,872 unique, 0 nulls, 100% unique PK)
- **Entity Grain:** One row per recommended work item (1:1 Recommended Work grain)

#### Column Profiles:
| # | Column Name | Raw Dtype | Null Count | Null % | Unique Values | Min Value | Max Value | Sum / Total | Sample Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `Work ID` | int64 | 0 | 0.0% | 68,872 | 100001 | 350000 | — | `175556`, `175559`, `175561` |
| 2 | `Work Description` | object | 33 | 0.05% | 63,469 | — | — | — | `Repair and renovation of road from CPWD complex...` |
| 3 | `Category` | object | 0 | 0.0% | 4 | — | — | — | `Normal/Others` (54,231), `Repair and Renovation` (10,482), `Trust and Society` (4,152), `Natural Calamity` (7) |
| 4 | `MP Name` | object | 0 | 0.0% | 538 | — | — | — | `BISHNU PADA RAY`, `Putta Mahesh Kumar` |
| 5 | `Constituency` | object | 0 | 0.0% | 535 | — | — | — | `ANDAMAN AND NICOBAR ISLANDS`, `ELURU` |
| 6 | `State` | object | 0 | 0.0% | 36 | — | — | — | `Andaman And Nicobar Islands`, `Andhra Pradesh` |
| 7 | `House` | object | 0 | 0.0% | 1 | — | — | — | `Lok Sabha` |
| 8 | `Recommended Amount (₹)`| float64 | 0 | 0.0% | 5,267 | ₹10.00 | ₹2,50,00,000.00 | ₹39,681,479,028.54 | `4947034.0`, `976436.0`, `1498887.0` |
| 9 | `Recommendation Date` | object (ISO) | 0 | 0.0% | 734 | 2024-07-08 | 2026-08-22 | — | `2025-02-14T00:00:00.000Z` |
| 10 | `Has Images` | bool | 0 | 0.0% | 2 | False (98.4%) | True (1.6%) | — | `False`, `True` |
| 11 | `IDA` | object | 0 | 0.0% | 749 | — | — | — | `SOUTH ANDAMANS(Implementing District Authority(SA))` |

---

### 2.3 Dataset: `mplads_completed_works_2026-08-26.csv`
- **File Size:** 8,693,682 bytes (8.29 MB)
- **Total Records (Rows):** 33,746
- **Total Fields (Columns):** 12
- **Exact Duplicate Rows:** 0
- **Primary Key Candidate:** `Work ID` (33,746 unique, 0 nulls, 100% unique PK)
- **Entity Grain:** One row per completed work item (1:1 Completed Work grain)

#### Column Profiles:
| # | Column Name | Raw Dtype | Null Count | Null % | Unique Values | Min Value | Max Value | Sum / Total | Sample Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `Work ID` | int64 | 0 | 0.0% | 33,746 | 100005 | 349995 | — | `134703`, `135593`, `135595` |
| 2 | `Work Description` | object | 79 | 0.23% | 30,372 | — | — | — | `Upgradation of Road from Madhavaram Village...` |
| 3 | `Category` | object | 0 | 0.0% | 3 | — | — | — | `Normal/Others` (26,112), `Repair and Renovation` (6,419), `Trust and Society` (1,215) |
| 4 | `MP Name` | object | 0 | 0.0% | 501 | — | — | — | `DAGGUMALLA PRASADA RAO`, `Y S Avinash Reddy` |
| 5 | `Constituency` | object | 0 | 0.0% | 498 | — | — | — | `CHITTOOR`, `KADAPA`, `TIRUPATI` |
| 6 | `State` | object | 0 | 0.0% | 33 | — | — | — | `Andhra Pradesh`, `Assam`, `Bihar` |
| 7 | `House` | object | 0 | 0.0% | 1 | — | — | — | `Lok Sabha` |
| 8 | `Final Amount (₹)` | float64 | 0 | 0.0% | 12,637 | ₹100.00 | ₹2,50,00,000.00 | ₹16,260,632,748.40 | `499993.0`, `448722.0`, `448970.0` |
| 9 | `Completed Date` | object (ISO) | 0 | 0.0% | 588 | 2024-08-12 | 2026-08-25 | — | `2025-01-31T00:00:00.000Z` |
| 10 | `Has Images` | bool | 0 | 0.0% | 2 | False (96.2%) | True (3.8%) | — | `True`, `False` |
| 11 | `Average Rating` | float64 | 33,742 | 99.99% | 2 | 1.00 | 5.00 | Mean: 4.50 | `5.0`, `1.0`, `NaN` (4 non-null records) |
| 12 | `IDA` | object | 0 | 0.0% | 667 | — | — | — | `CHITTOOR(DISTRICT COLLECTOR CHITTOOR_IDA)` |

---

### 2.4 Dataset: `mplads_expenditures_2026-08-26.csv`
- **File Size:** 19,400,732 bytes (18.50 MB)
- **Total Records (Rows):** 82,296
- **Total Fields (Columns):** 10
- **Exact Duplicate Value Rows:** 24,860 *(Critical finding: Represents identical itemized installment vouchers, NOT duplicates to be deleted)*
- **Primary Key Candidate:** Synthetic `transaction_id` (1:1 Transaction line-item grain)
- **Entity Grain:** Financial payment/disbursement transaction

#### Column Profiles:
| # | Column Name | Raw Dtype | Null Count | Null % | Unique Values | Min Value | Max Value | Sum / Total | Sample Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `MP Name` | object | 0 | 0.0% | 531 | — | — | — | `SUNIL BOSE`, `ATUL GARG`, `TARIQ ANWAR` |
| 2 | `Constituency` | object | 0 | 0.0% | 528 | — | — | — | `CHAMARAJANAGAR`, `GHAZIABAD`, `KATIHAR` |
| 3 | `State` | object | 0 | 0.0% | 35 | — | — | — | `Karnataka`, `Uttar Pradesh`, `Bihar` |
| 4 | `House` | object | 0 | 0.0% | 1 | — | — | — | `Lok Sabha` |
| 5 | `Work Description` | object | 0 | 0.0% | 110 | — | — | — | `Construction of roads...`, `Lighting of public spaces` |
| 6 | `Vendor` | object | 0 | 0.0% | 23,111 | — | — | — | `KRIDL BHUSIRI ACCOUNT WORKS`, `DARSH BUILDCON` |
| 7 | `IDA` | object | 0 | 0.0% | 736 | — | — | — | `Chamarajanagar(DEPUTY COMMISSIONER...)` |
| 8 | `Expenditure Amount (₹)`| float64 | 0 | 0.0% | 30,159 | ₹1.00 | ₹2,50,00,000.00 | ₹27,191,390,292.45 | `250000.0`, `125000.0`, `799146.0` |
| 9 | `Expenditure Date` | object (ISO) | 0 | 0.0% | 680 | 2024-07-25 | 2026-08-25 | — | `2026-08-20T00:00:00.000Z` |
| 10 | `Payment Status` | object | 0 | 0.0% | 2 | — | — | — | `Payment Success` (80,723), `Payment In-Progress` (1,573) |

---

### 2.5 Dataset: `json_2026-08-26.json`
- **File Size:** 584 bytes
- **Structure:** JSON Object with `{ success: true, data: { ... }, cached: true, cache_timestamp: "..." }`
- **Data Attributes:**
  - `totalAllocated`: `83062104294.53` (₹8,306.21 Cr)
  - `totalExpenditure`: `27191390292.45` (₹2,719.14 Cr)
  - `utilizationPercentage`: `32.7362%`
  - `totalMPs`: `543`
  - `totalWorksCompleted`: `33746`
  - `totalWorksRecommended`: `68872`
  - `completionRate`: `48.9981%`
  - `totalTransactions`: `82296`
  - `avgAllocation`: `152968884.52` (₹15.30 Cr)
  - `pendingWorks`: `35126` (`68,872 - 33,746 = 35,126`)
  - `paymentGap`: `40.1993%`
  - `completedWorksValue`: `16260632748.40` (₹1,626.06 Cr)
  - `inProgressPayments`: `10930757544.05`

---

## 3. Crucial Findings & Integrity Hazards

1. **Transaction Multiplicity vs Duplicate Rows:**
   - In `mplads_expenditures_2026-08-26.csv`, 24,860 records share identical MP, Vendor, Description, Date, Amount, and Status.
   - **Proof of Legitimacy:** Summing all 82,296 rows equals ₹27,191,390,292.45 (matching the official government portal total to 0.00). If rows were deduplicated, ₹5,356,587,401.36 (₹535.66 Cr) would be illegally erased from the platform.
   - **Solution:** Maintain every single row by generating a deterministic synthetic key: `transaction_id = "TXN_" + zero_padded_index`.

2. **Absence of `Work ID` in Expenditures:**
   - The government export for expenditures records payments against general project budget heads (110 standardized activity labels like "Street lights", "Lighting of public spaces") rather than specific physical Work IDs.
   - **Hazard:** Joining expenditures directly to recommended or completed works on `(MP Name, Description)` creates a false Cartesian explosion (many-to-many join) that multiplies expenditure totals.
   - **Solution:** Strictly maintain `expenditures` at the Transaction level linked to the MP and Vendor, rather than forcing an invalid join onto individual physical works.

3. **Work Lifecycle: Recommended vs Completed Works:**
   - `mplads_recommended_works_...` contains 68,872 recommended/in-progress works.
   - `mplads_completed_works_...` contains 33,746 finished works.
   - Only 181 `Work ID` values overlap between both reports. For these 181 works, we have complete end-to-end lifecycle telemetry (Recommendation Date, Recommended Amount, Completed Date, Final Amount).
   - The remaining works represent separate lifecycle states: currently recommended/in-progress works vs historical completed works.
   - **Hazard:** Fuzzily merging completed works into recommended works without Work ID matches would fabricate false pairings and violate Rule 8.

4. **Missing Government Fields (Transparent Non-Fabrication):**
   - The source datasets DO NOT contain:
     - Sanctioned Amount (distinct from recommended or final completed)
     - Sanction Date
     - GPS Latitude / Longitude
     - Village / Block / Gram Panchayat names
     - Work-level contractor (only available in transaction-level expenditures)
   - In accordance with Critical Integrity Rules 2–7, all these fields will be explicitly declared `NULL` / Unavailable in our database and API.
