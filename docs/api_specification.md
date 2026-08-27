# SIH26102 — REST API Specification

**API Version:** `v1.0.0`  
**Base URL:** `http://localhost:8000` (FastAPI + SQLite Engine)  
**OpenAPI Documentation:** `http://localhost:8000/docs` (Swagger UI) / `http://localhost:8000/redoc` (ReDoc)  
**Authentication:** None (Public Analytical Decision-Support Platform)  

---

## 1. Global API Standards

- **Response Format:** `application/json` (UTF-8)
- **Null Safety:** Missing/unobserved government fields return JSON `null` (never fabricated).
- **Pagination Standard:**
  - `limit`: Integer ($1 \dots 200$, default: $50$).
  - `offset`: Integer ($\ge 0$, default: $0$).
  - Response wrapper: `{"total": int, "limit": int, "offset": int, "items": [...]}`
- **MP Protection Standard:** Works responses do NOT sum MP reference attributes. Reference attributes (`mp_level_ref_`) are returned strictly as dimensional properties.
- **Error Responses:** Standard RFC-7807 problem details with descriptive `detail` message:
  - `404 Not Found`: Entity ID does not exist in master tables.
  - `422 Unprocessable Entity`: Invalid query parameters, pattern violations, or out-of-bound pagination.

---

## 2. Endpoints Reference

### 2.1 System & Macro Statistics

#### `GET /api/health`
Checks server and SQLite database connectivity.
- **Query Parameters:** None
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "database": "connected (543 MPs)",
    "version": "1.0.0",
    "timestamp": "2026-08-26T16:25:00Z"
  }
  ```

#### `GET /api/stats`
Returns validated national aggregates, utilization metrics, and anomaly counts.
- **Query Parameters:** None
- **Response (200 OK):**
  ```json
  {
    "total_mps": 543,
    "total_allocated_amount": 83062104294.53,
    "total_expenditure": 27191390292.45,
    "total_unspent_amount": 55870714002.08,
    "national_utilization_pct": 32.74,
    "total_recommended_works": 68872,
    "total_completed_works": 33746,
    "national_completion_rate_pct": 49.00,
    "total_transactions": 82296,
    "total_vendors": 22377,
    "total_anomalies": 1804,
    "critical_anomalies": 21,
    "high_anomalies": 602,
    "medium_anomalies": 203,
    "low_anomalies": 978
  }
  ```

---

### 2.2 Members of Parliament (MPs)

#### `GET /api/mps`
Retrieve paginated list of MPs with filtering and sorting.
- **Query Parameters:**
  - `state` (string): e.g. `MAHARASHTRA`
  - `constituency` (string): e.g. `NAGPUR`
  - `search` (string): Substring search on MP name or constituency
  - `min_utilization` (float): Minimum utilization % ($0.0 \dots 100.0$)
  - `max_utilization` (float): Maximum utilization % ($0.0 \dots 100.0$)
  - `sort_by` (string): `allocated_amount`, `total_expenditure`, `utilization_pct`, `completion_rate_pct`, `mp_name`, `state`
  - `sort_order` (string): `asc` or `desc` (default: `desc`)
  - `limit` (int): $1 \dots 200$ (default: $50$)
  - `offset` (int): $\ge 0$ (default: $0$)
- **Response (200 OK):**
  ```json
  {
    "total": 543,
    "limit": 10,
    "offset": 0,
    "items": [
      {
        "internal_mp_id": "INTERNAL_MP_001",
        "mp_name_raw": "SHRI NARENDRA MODI",
        "mp_name_normalized": "SHRI NARENDRA MODI",
        "constituency_raw": "VARANASI",
        "constituency_normalized": "VARANASI",
        "state_raw": "UTTAR PRADESH",
        "state_normalized": "UTTAR PRADESH",
        "house": "Lok Sabha",
        "allocated_amount": 175000000.0,
        "total_expenditure": 57480000.0,
        "unspent_amount": 117520000.0,
        "utilization_pct": 32.85,
        "recommended_works_count": 142,
        "completed_works_count": 89,
        "completion_rate_pct": 62.68,
        "transaction_count": 120,
        "successful_payments_count": 118,
        "pending_payments_count": 2,
        "average_rating": 4.5,
        "source_file": "mplads_mp_summary_2026-08-26.csv",
        "source_download_date": "2026-08-26",
        "pipeline_created_at": "2026-08-26T16:00:00Z"
      }
    ]
  }
  ```

#### `GET /api/mps/{mp_id}`
Retrieve detailed profile for a specific MP, including top 5 vendors and anomaly flags.
- **Path Parameters:** `mp_id` (e.g. `INTERNAL_MP_001` or normalized name)
- **Response (200 OK):** Full MP record with `top_vendors` and `anomalies` arrays.
- **Error (404 Not Found):** `{"detail": "MP 'INVALID_ID' not found."}`

---

### 2.3 Physical Works Registry

#### `GET /api/works`
Retrieve paginated works registry.
- **Query Parameters:**
  - `state`, `constituency`, `mp_id`, `category`, `lifecycle_status` (`RECOMMENDED_IN_PROGRESS`, `COMPLETED_ONLY`, `FULL_LIFECYCLE_MATCH`)
  - `recommendation_year`, `completion_year`
  - `min_amount`, `max_amount`
  - `search`: Substring search on work description
  - `sort_by`: `work_id`, `recommended_amount`, `final_amount`, `duration_days`
  - `sort_order`, `limit`, `offset`
- **Response (200 OK):** Paginated works list.

#### `GET /api/works/{work_id}`
Retrieve specific physical work with MP reference metadata and associated anomalies.
- **Path Parameters:** `work_id` (int, e.g. `303957`)
- **Response (200 OK):**
  ```json
  {
    "work_id": 303957,
    "internal_mp_id": "INTERNAL_MP_104",
    "mp_name_normalized": "SHRI JOHN DOE",
    "constituency_normalized": "EXAMPLE CONSTITUENCY",
    "state_normalized": "EXAMPLE STATE",
    "category_normalized": "Normal/Others",
    "work_description_normalized": "CONSTRUCTION OF COMMUNITY HALL",
    "lifecycle_status": "RECOMMENDED_IN_PROGRESS",
    "recommended_amount": 25000000.0,
    "recommendation_date": "2024-11-15",
    "final_amount": null,
    "completed_date": null,
    "has_images": false,
    "sanctioned_amount": null,
    "latitude": null,
    "longitude": null,
    "mp_details": { ... },
    "anomalies": [ ... ]
  }
  ```

---

### 2.4 Financial Transactions

#### `GET /api/transactions`
Retrieve paginated line-item disbursement vouchers.
- **Query Parameters:** `mp_id`, `vendor_id`, `state`, `payment_status`, `min_amount`, `max_amount`, `year`, `search`, `sort_by`, `sort_order`, `limit`, `offset`.

#### `GET /api/transactions/{transaction_id}`
Retrieve line-item voucher with vendor and anomaly context.

---

### 2.5 Vendors & Contractors

#### `GET /api/vendors`
Retrieve paginated contractor directory.
- **Query Parameters:** `state`, `min_revenue`, `max_revenue`, `min_reliance_pct`, `search`, `sort_by`, `sort_order`, `limit`, `offset`.

#### `GET /api/vendors/{vendor_id}`
Retrieve vendor profile with recent transactions and anomalies.

---

### 2.6 Explainable Anomalies

#### `GET /api/anomalies`
Retrieve explainable audit flags with 15 traceability columns.
- **Query Parameters:**
  - `entity_type`: `WORK`, `MP`, `TRANSACTION`, `VENDOR`
  - `severity`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
  - `anomaly_type`: e.g. `HIGH_VENDOR_CONCENTRATION`
  - `entity_id`: Filter by specific foreign key
  - `min_score`, `max_score`: $0.0 \dots 1.0$
  - `sort_by`: `anomaly_score`, `generated_at`
  - `sort_order`, `limit`, `offset`
- **Response (200 OK):**
  ```json
  {
    "total": 21,
    "limit": 50,
    "offset": 0,
    "items": [
      {
        "anomaly_id": "ANOM_000001",
        "entity_type": "WORK",
        "entity_id": "303957",
        "anomaly_type": "UNUSUALLY_HIGH_RECOMMENDED_AMOUNT",
        "anomaly_score": 1.0,
        "severity": "CRITICAL",
        "reason": "Recommended amount of ₹2,50,00,000.00 is in the 99.9th percentile for 'Normal/Others' (8.2 robust standard deviations above category median).",
        "supporting_metrics": {
          "recommended_amount": 25000000.0,
          "category": "Normal/Others",
          "zscore": 8.24
        },
        "detection_method": "STATISTICAL_ROBUST_ZSCORE",
        "threshold_value": "₹50,00,000 & Z >= 3.5",
        "observed_value": "₹25,000,000.00 (Z=8.24)",
        "percentile": 0.9992,
        "robust_zscore": 8.2415,
        "baseline_reference": "Category Median (Normal/Others)",
        "generated_at": "2026-08-26T16:17:43Z"
      }
    ]
  }
  ```

---

### 2.7 Aggregation & Metadata Dimensions

#### `GET /api/states`
Returns state-level macro performance summaries from view (`v_state_summary`).

#### `GET /api/constituencies`
Returns constituency-level roll-ups with state and MP mapping.

#### `GET /api/categories`
Returns summary statistics across work categories.
