# SIH26102 — Frontend Architecture Document

**System Version:** `v1.0.0` (Phase 9 Prototype)  
**Problem Statement:** SIH26102 (Trustworthy MPLADS Data Analytics & Anomaly Detection Platform)  
**Framework Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS + Lucide Icons + Recharts  

---

## 1. Architectural Principles & UX Design System

The SIH26102 frontend is designed as a **public-accountability and audit-intelligence portal**. It emphasizes data integrity, transparency, explainability, and non-accusatory governance:

1. **Decoupled API-First Architecture:** The client consumes only the FastAPI REST endpoints (`/api/*`). It never accesses raw CSVs or backend databases directly.
2. **Provenance Labeling:** Every metric in the UI carries an explicit classification:
   - `[SOURCE-DERIVED]`: Extracted directly from official government exports.
   - `[CALCULATED METRIC]`: Deterministically computed rates (e.g. utilization %, completion rate).
   - `[ANALYTICAL FEATURE]`: Economic/statistical features (e.g. Herfindahl-Hirschman Index, percentiles).
   - `[AUDIT RISK INDICATOR]`: Calibrated outlier flags indicating patterns requiring review.
3. **Strict Truthfulness & Missing Field Handling:** Parameters not present in official exports (`latitude`, `longitude`, `sanctioned_amount`, `work_contractor`) are explicitly labeled as *"Not available in current source export"*, rather than fabricated or marked as "Unknown".
4. **Server-Side Scalability:** To handle 102,437 works, 82,296 transactions, and 22,377 vendors smoothly in the browser, all search, filtering, and pagination are executed server-side via SQLite indexes.

---

## 2. Directory Structure

```text
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── main.tsx                # Entry point mounting React DOM
    ├── App.tsx                 # Route tree definitions (React Router 7)
    ├── index.css               # Tailwind directives and custom scrollbars
    ├── api/
    │   ├── types.ts            # Pydantic-synchronized TypeScript interfaces
    │   └── client.ts           # Centralized HTTP fetch client
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx      # Top navigation with live API connectivity status
    │   │   ├── Footer.tsx      # Provenance disclaimers & legal notice
    │   │   └── Layout.tsx      # Responsive page wrapper
    │   ├── common/
    │   │   ├── Badge.tsx       # Severity, Lifecycle, and Category badges
    │   │   ├── ProvenanceBadge.tsx # Visual classification badges
    │   │   ├── KpiCard.tsx     # KPI summary cards with icons
    │   │   ├── LoadingSkeleton.tsx # Skeleton loading animation
    │   │   ├── ErrorDisplay.tsx# Error state with retry action
    │   │   ├── EmptyState.tsx  # Empty result state
    │   │   └── Pagination.tsx  # Accessible pagination bar
    │   └── charts/
    │       ├── AllocationVsExpChart.tsx
    │       ├── WorkCategoryChart.tsx
    │       └── AnomalySeverityChart.tsx
    └── pages/
        ├── OverviewPage.tsx    # 1. Macro KPIs, charts, and navigation hubs
        ├── WorkExplorerPage.tsx# 2. 102,437 Works registry with server filters
        ├── WorkDetailPage.tsx  # 3. Work detail & analytical risk card
        ├── AnomalyCenterPage.tsx # 4. Explainable Anomaly Intelligence Hub
        ├── MpExplorerPage.tsx  # 5. 543 Lok Sabha MPs directory
        ├── MpDetailPage.tsx    # 6. Detailed MP analytical profile
        ├── VendorExplorerPage.tsx # 7. 22,377 Contractors footprint
        ├── TransactionExplorerPage.tsx # 8. 82,296 Payment vouchers
        ├── StatesPage.tsx      # 9. 36 States/UTs performance roll-ups
        └── MethodologyPage.tsx # 10. Pipeline lineage & limitations disclosure
```

---

## 3. Core Pages & Capabilities

| Page Route | Page Component | Target Capabilities & Features |
| :--- | :--- | :--- |
| `/` | `OverviewPage` | National aggregates (₹83.06B allocated, ₹27.19B expenditure, 32.74% utilization), top state comparisons, anomaly ratio donut, work categories. |
| `/works` | `WorkExplorerPage` | Server-side searchable registry of 102,437 physical works, filtered by State, Category, Lifecycle Status, and Amount. |
| `/works/:workId` | `WorkDetailPage` | Detailed 1:1 physical work profile, execution duration, and **Analytical Risk Indicator Card** with mathematical explanation if flagged. |
| `/anomalies` | `AnomalyCenterPage` | Interactive risk intelligence hub. Filters by Severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), Entity Type (`WORK`, `MP`, `TRANSACTION`, `VENDOR`), and Anomaly Type. Includes expandable 15-column traceability details. |
| `/mps` | `MpExplorerPage` | 543 Lok Sabha MPs directory with utilization sorting and state filters. |
| `/mps/:mpId` | `MpDetailPage` | In-depth MP analytical profile: Macro Allocation & Utilization, Physical Works Execution, Payment Transactions, and Top Contractor Procurement Share. |
| `/vendors` | `VendorExplorerPage` | 22,377 contractors directory with single-patron reliance filters and risk indicators. |
| `/transactions` | `TransactionExplorerPage`| 82,296 line-item disbursement vouchers search with payment clearance filters. |
| `/states` | `StatesPage` | 36 States and Union Territories macro leaderboard derived from `v_state_summary`. |
| `/methodology` | `MethodologyPage` | Interactive end-to-end data lineage, mathematical scoring formulas (MAD Z-scores, HHI), and official data limitations. |

---

## 4. How to Run Locally

### 1. Start FastAPI Backend:
```bash
.venv\Scripts\uvicorn backend.main:app --reload --port 8000
```

### 2. Start React + Vite Frontend:
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your web browser.
