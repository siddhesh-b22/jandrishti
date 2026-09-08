# JanDrishti — White Theme Miro Copy-Paste Flowcharts & SVG Files

> **Option 1 (Recommended - 100% Beautiful in Miro):**  
> Simply **drag and drop** the `.svg` files directly from your file explorer onto your Miro canvas! They render with crisp vectors, pure white backgrounds, clean colors, and **zero overlapping lines**:
> - 📄 [`Miro_Flowchart_1_Architecture.svg`](file:///d:/SIH26102/Miro_Flowchart_1_Architecture.svg)
> - 📄 [`Miro_Flowchart_2_Governance_Lifecycle.svg`](file:///d:/SIH26102/Miro_Flowchart_2_Governance_Lifecycle.svg)
> - 📄 [`Miro_Flowchart_3_Forensic_Pipeline.svg`](file:///d:/SIH26102/Miro_Flowchart_3_Forensic_Pipeline.svg)
>
> **Option 2 (Mermaid Copy-Paste into Miro):**  
> In Miro, open the **Mermaid tool** (Toolbar &rarr; `+` More tools &rarr; Mermaid), paste any code block below, and click **Create diagram**. These blocks are formatted in **pure White Theme** with **zero overlapping lines**.

---

## 📋 FLOWCHART 1: Full System 5-Tier Architecture (White Theme)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#0f172a', 'primaryBorderColor': '#0284c7', 'lineColor': '#64748b', 'background': '#ffffff', 'secondaryColor': '#f8fafc', 'tertiaryColor': '#ffffff'}}}%%
flowchart LR
    %% TIER 1
    subgraph T1["Tier 1: React 19 Frontend"]
        C1["Citizen Portal\n(Overview & MP Explorer)"]
        C2["Role Workspaces\n(MP, DM, State, Auditor)"]
        C3["Axios Interceptor\n(Bearer JWT Token)"]
        C1 --> C3
        C2 --> C3
    end

    %% TIER 2
    subgraph T2["Tier 2: FastAPI Gateway"]
        G1["FastAPI Gateway Router\n(backend/main.py)"]
        G2["JWT Auth & Role Extraction\n(backend/auth.py)"]
        G3["RBAC / ABAC Interceptor\n(backend/rbac_abac.py)"]
        G4["Jurisdiction SQL Scoping\n(backend/scope.py)"]
        G1 --> G2 --> G3 --> G4
    end

    %% TIER 3
    subgraph T3["Tier 3: Governance Engine"]
        B1["Workflow State Machine\n(backend/workflow.py)"]
        B2["Gov Operations Service\n(backend/gov_service.py)"]
        B3["Audit Case Docket\n(backend/cases.py)"]
        B4["Chained Audit Logger\n(backend/audit_logger.py)"]
        B1 --> B2
        B2 -.-> B4
        B3 -.-> B4
    end

    %% TIER 4
    subgraph T4["Tier 4: Forensics (0-100)"]
        F1["Benford's First-Digit Law\n(Chi-Square p < 0.05)"]
        F2["Semantic Duplicate Matcher\n(Jaccard > 0.85 & Levenshtein)"]
        F3["Vendor Cartelization HHI\n(Concentration Index > 2500)"]
        F4["Composite Risk Engine\n(Score >= 75 -> CAG Escalation)"]
        F1 --> F4
        F2 --> F4
        F3 --> F4
    end

    %% TIER 5
    subgraph T5["Tier 5: Dual Database"]
        D1["Supabase PostgreSQL\n(Primary Cloud DB)"]
        D2["SQLite 3 (mplads.db)\n(Resilient Local Failover)"]
        D3["Unified DB Driver\n(backend/db_engine.py)"]
        D3 --> D1
        D3 --> D2
    end

    %% CLEAN FORWARD CONNECTORS (NO OVERLAPS)
    C3 -->|HTTP + JWT| G1
    G4 -->|Validated Scope| B1
    G4 -->|Forensic Query| F1
    B2 -->|Commit Record| D3
    F4 -->|High Risk Case| B3
```

---

## 📋 FLOWCHART 2: Statutory Governance Lifecycle (White Theme - Linear Pipeline)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#0f172a', 'primaryBorderColor': '#16a34a', 'lineColor': '#64748b', 'background': '#ffffff'}}}%%
flowchart TD
    %% LINEAR GOVERNANCE FLOW (NO CROSSING LINES)
    N1["1. MP Drafts Proposal\nTitle, Sector, GPS, Cost <= ₹5 Cr\n(Status: DRAFT)"]
    N2["2. MP Submits Proposal\nStatutory Edit Lock Applied\n(Status: SUBMITTED)"]
    N3{"3. District Collector Scrutiny\nExecutive Engineer Feasibility Check"}

    N1 --> N2 --> N3

    %% DISTRICT DECISION BRANCHES
    N3_RET["Branch A: Defective Estimates\nReturned to MP with remarks\n(Status: RETURNED_FOR_CORRECTION)"]
    N3_REJ["Branch B: Prohibited Works\nViolates MoSPI Prohibited List\n(Status: REJECTED - Terminal)"]
    N4{"4. State Planning Department\nState Allocation Quota Review\n(Status: STATE_REVIEW)"}

    N3 -->|Defect / Land Issue| N3_RET
    N3_RET -.->|MP Re-justifies & Modifies| N1
    N3 -->|Prohibited Work| N3_REJ
    N3 -->|Feasible| N4

    %% STATE DECISION BRANCHES
    N4_REJ["Branch A: Quota Exhausted\nState Fiscal Limit Exceeded\n(Status: REJECTED - Terminal)"]
    N5["5. AS/FS Sanction Order\nFinancial Commitment Earmarked in DB\n(Status: SANCTIONED)"]

    N4 -->|Budget Overdrawn| N4_REJ
    N4 -->|Quota Approved| N5

    %% EXECUTION & VERIFICATION
    N6["6. Tendering & Contractor Award\nWork order issued to PWD / Zilla Parishad\n(Status: IN_PROGRESS)"]
    N7["7. Ground Milestone Tracking\n25% (Foundation) -> 50% -> 75% -> 100%\nMeasurement Book Signed on Ground"]
    N8["8. Final Treasury Disbursement\nVoucher generated in transactions table\nFinancial amounts permanently locked\n(Status: COMPLETED)"]
    N9["9. Geo-Tagged Photographic Verification\nTamper-proof latitude/longitude photos uploaded\nAsset Plaque with QR Code Registered\n(Status: VERIFIED)"]
    N10["10. Public Open Ledger Audit\nCitizens inspect on map & report discrepancies\n(Status: PUBLIC_AUDIT)"]

    N5 --> N6 --> N7 --> N8 --> N9 --> N10
```

---

## 📋 FLOWCHART 3: Pre-Disbursement Forensic Intelligence Pipeline (White Theme)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#0f172a', 'primaryBorderColor': '#c026d3', 'lineColor': '#64748b', 'background': '#ffffff'}}}%%
flowchart TD
    VOUCHER["Ingested Voucher Record\nAmount, Contractor, Location, Timestamp"]

    VOUCHER --> E1["1. Benford's Law (Weight: 20%)\nLog-frequency first-digit test\nChi-Square p < 0.05"]
    VOUCHER --> E2["2. Semantic Duplication (Weight: 35%)\nJaccard > 0.85 & Levenshtein < 3\nFlags double-funding in same Gram Panchayat"]
    VOUCHER --> E3["3. Vendor Cartelization (Weight: 25%)\nHerfindahl-Hirschman Index HHI > 2500\nFlags contractor monopoly in constituency"]
    VOUCHER --> E4["4. Velocity Outlier (Weight: 20%)\nZ-Score > 3.0 on spend timestamp\nFlags March-rush fund dumping"]

    CALC["Composite Risk Calculator\nRisk = (0.35 x Dupe) + (0.25 x HHI) + (0.20 x Benford) + (0.20 x Velocity)"]

    E1 --> CALC
    E2 --> CALC
    E3 --> CALC
    E4 --> CALC

    CALC --> EVAL{"Evaluate Composite Risk Score"}

    R_HIGH["🚨 CRITICAL: Score >= 75\n1. Auto-create case in review_cases\n2. Escalate to CAG Auditor Docket\n3. Real-time alert to Ministry Admin\n4. Recommended payment freeze"]
    R_MED["⚠️ ADVISORY: Score 45 - 74\n1. Flagged on District Collector dashboard\n2. Executive Engineer explanation required\n3. Enhanced voucher scrutiny"]
    R_LOW["✅ NORMAL: Score < 45\nStandard treasury disbursement cleared"]

    EVAL -->|High Risk| R_HIGH
    EVAL -->|Medium Risk| R_MED
    EVAL -->|Low Risk| R_LOW
```
