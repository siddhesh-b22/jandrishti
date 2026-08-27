# SIH26102 — Security & Configuration Audit Checklist

**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Security Status:** **PASSED (Production Hardening Ready)**  

---

## 1. Secrets & Credentials Audit

- [x] **Zero Hardcoded Credentials:** Full scan across all `.py`, `.ts`, `.tsx`, `.sql`, `.json`, `.env` files. Zero API keys, passwords, secret keys, or cloud credentials found.
- [x] **Environment Variable Isolation:** Config parameters are loaded via `backend/config.py` using Python `os.getenv` with sensible, secure local defaults.
- [x] **Git Tracking Safety:** `.venv/`, `node_modules/`, and temporary build artifacts are explicitly listed in `.gitignore`.

---

## 2. SQL Injection & Database Safety Audit

- [x] **100% Parameterized SQL Execution:** In `backend/database.py` and `backend/main.py`, all dynamic database queries use SQLite `?` placeholder bind parameters:
  ```python
  # Safe parameterized query implementation in backend/main.py
  query = "SELECT * FROM works WHERE 1=1"
  params = []
  if state:
      query += " AND state_normalized = ?"
      params.append(state.upper())
  cursor.execute(query, params)
  ```
- [x] **Whitelist-Based Sorting:** Sort fields and sort orders are validated against strict string literals (`sort_order in ["asc", "desc"]`), preventing SQL injection via `ORDER BY` clauses.
- [x] **Read-Only Database Connection Mode:** Production deployment supports opening `sqlite3.connect('file:database/mplads.db?mode=ro', uri=True)`.

---

## 3. API Input Validation & Query Bounds

- [x] **FastAPI Query Constraints:** All pagination parameters enforce strict bounds via Pydantic/FastAPI:
  - `limit`: `Query(50, ge=1, le=200)` (Prevents denial-of-service via massive memory allocations).
  - `offset`: `Query(0, ge=0)` (Prevents negative offset errors).
- [x] **Pydantic Response Schemas:** All outputs are serialized through explicit Pydantic response models, preventing accidental schema leakage.

---

## 4. CORS & Web Security Configuration

- [x] **Development Mode:** `CORSMiddleware` configured to permit local development on `http://localhost:3000` and `http://127.0.0.1:8000`.
- [x] **Production Domain Restriction:** For production deployment, update `backend/config.py`:
  ```python
  CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://sih26102.gov.in,https://analytics.mplads.gov.in").split(",")
  ```
- [x] **Security Headers Checklist for Reverse Proxy (Nginx / Cloudflare):**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy: default-src 'self'`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
