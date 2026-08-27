# 🇮🇳 JanDrishti — Production Deployment Guide & Operations Manual
### *Civic Data Intelligence Platform · $0 Initial Hosting Setup · Read-Only Immutable Dataset*

---

## 🌟 01. Architecture Overview

JanDrishti is designed as a decoupled, zero-cost ($0) architecture utilizing free cloud tiers with automatic HTTPS, edge CDN distribution, and embedded read-only high-performance SQLite data access.

```
                               ┌──────────────────────────────────────────────┐
                               │                 CITIZEN / USER               │
                               └──────────────────────┬───────────────────────┘
                                                      │ (HTTPS / SSL)
                                                      ▼
                       ┌──────────────────────────────────────────────────────────────┐
                       │          FRONTEND (Vercel / Netlify / Render Static)          │
                       │          - Global Edge CDN, 0ms Cold Start                   │
                       │          - SPA Routing via vercel.json rewrite rule          │
                       │          - Environment: VITE_API_URL                         │
                       └──────────────────────────────┬───────────────────────────────┘
                                                      │ (Public API Requests)
                                                      ▼
                       ┌──────────────────────────────────────────────────────────────┐
                       │          BACKEND (Render Web Service / Fly.io / Koyeb)       │
                       │          - FastAPI + Uvicorn (Production Server)             │
                       │          - CORS: Dynamic origin whitelisting                 │
                       │          - Health: /api/health & /api/health/db              │
                       └──────────────────────────────┬───────────────────────────────┘
                                                      │
                                                      ▼
                       ┌──────────────────────────────────────────────────────────────┐
                       │                   PRODUCTION DATABASE                        │
                       │          - Storage: Immutable Read-Only SQLite (156.84 MB)   │
                       │          - Mode: PRAGMA query_only = ON (Zero write locks)   │
                       │          - Authoritative: 778 MPs, 102K Works, 1,831 Signals │
                       └──────────────────────────────────────────────────────────────┘
```

---

## 📊 02. Single Source of Truth Metrics (Data Snapshot: 26 August 2026)

| Dimension | Value | Validation Standard |
| :--- | :--- | :--- |
| **Parliamentary Representatives** | **778 Members** | 543 Lok Sabha + 235 Rajya Sabha |
| **Territorial Scope** | **28 States & 8 UTs** | 36 Territorial Units of India |
| **Physical Infrastructure Works** | **102,437 Works** | 61,842 Completed Works (49.0% completion velocity) |
| **Treasury Disbursements** | **82,296 Vouchers** | **₹0.00 Mathematical Reconciliation Variance** |
| **Registered Contractors** | **22,377 Vendors** | Concentration Percentiles & Patron Reliance |
| **MAD Statistical Signals** | **1,831 Signals** | 21 Critical, 614 High, 209 Medium, 987 Low |
| **Total Allocation Corpus** | **₹11,667.55 Cr** | ₹8,306.21 Cr Lok Sabha + ₹3,361.33 Cr Rajya Sabha |
| **Total Disbursed Funds** | **₹3,947.25 Cr** | Reconciled line-item voucher totals |

---

## 🚀 03. Step-by-Step Deployment Instructions

### Option A: 1-Click Multi-Service Deployment via Render (Recommended $0 Setup)

Render can deploy both the Backend Web Service and Frontend Static Site simultaneously using the included `render.yaml` blueprint.

1. **Push your repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: production release ready for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/jandrishti.git
   git branch -M main
   git push -u origin main
   ```
2. **Log in to [Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** → **Blueprint**.
4. Select your `jandrishti` repository.
5. Render will automatically detect `render.yaml` and provision:
   - **`jandrishti-api`** (Python Web Service running `backend.main:app`).
   - **`jandrishti-web`** (Static Site publishing `frontend/dist`).
6. Click **Apply**. Both services will build and deploy with free automatic HTTPS!

---

### Option B: Frontend on Vercel + Backend on Render / Railway

For the fastest edge CDN delivery, host the frontend on **Vercel** and the backend on **Render**:

#### Step 1: Deploy Backend on Render
1. In Render, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --no-cache-dir -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT --workers 2`
   - **Plan**: `Free`
   - **Environment Variables**:
     - `PYTHON_VERSION`: `3.13.0`
     - `DATABASE_PATH`: `database/mplads.db`
     - `CORS_ORIGINS`: `*` (or your frontend Vercel domain)
4. Click **Create Web Service**.
5. Once live, note your backend URL (e.g. `https://jandrishti-api.onrender.com`).
6. Verify: `https://jandrishti-api.onrender.com/api/health/db`.

#### Step 2: Deploy Frontend on Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your `jandrishti` GitHub repo.
4. Set **Root Directory**: `frontend`.
5. Set **Environment Variables**:
   - `VITE_API_URL`: `https://jandrishti-api.onrender.com` (your deployed backend URL)
6. Click **Deploy**.
7. Vercel will build the frontend with zero errors and provide your public URL (e.g. `https://jandrishti.vercel.app`).

---

## 🔒 04. Environment Variables Reference

### Backend (Server-Side Only)
| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8000` | Port for Uvicorn server |
| `DATABASE_PATH` | `database/mplads.db` | Relative or absolute path to SQLite file |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed frontend origins |

### Frontend (Client-Side Safe)
| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `""` (same origin) | Public HTTPS base URL of backend API service |

---

## ⚡ 05. Free Tier Limitations & Behaviors

1. **Render Free Tier Cold Starts**:
   - Free instances spin down after 15 minutes of inactivity.
   - The first request after sleep takes approximately **50–60 seconds** to initialize.
   - The frontend includes built-in animated skeletons and retry banners.
2. **Immutable Read-Only Storage**:
   - The database is embedded in the deployment artifact and opened with `PRAGMA query_only = ON`.
   - To update datasets in the future, update `database/mplads.db`, verify metrics, and push a new release commit.

---

## 🛠️ 06. Local Verification Commands

```bash
# 1. Run Backend Locally
.venv\Scripts\uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 2. Run Frontend Locally
cd frontend && npm run dev

# 3. Execute Automated Test Suite
.venv\Scripts\pytest -q

# 4. Production Build Test
cd frontend && npm run build
```
