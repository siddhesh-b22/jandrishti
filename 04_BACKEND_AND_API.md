# SIH26102 — Backend and API Specification

## Architecture

Frontend
→ Own REST API
→ Database
→ Processed MPLADS data + analytics

Do not make the browser directly consume raw CSV files.

## Recommended stack
- Python
- FastAPI
- SQLite for first prototype
- PostgreSQL for production if required

## Suggested endpoints

```text
GET /api/health
GET /api/stats
GET /api/mps
GET /api/mps/{mp_id}
GET /api/works
GET /api/works/{work_id}
GET /api/anomalies
GET /api/anomalies/{work_id}
GET /api/vendors
GET /api/constituencies
GET /api/states
```

Use pagination and filtering for large datasets.

## API rules
- Validate inputs.
- Return consistent JSON.
- Use null for missing values.
- Never return fabricated values.
- Do not expose filesystem paths.
- Keep ETL scripts separate from the API server.
- Do not hard-code dashboard statistics into the frontend.

## Refresh model

```text
new raw source
→ ETL
→ validation
→ database refresh
→ API serves updated data
```
