# JanDrishti SIH26102 Working Scenario

## Scenario: Citizen reports a suspected MPLADS irregularity

This scenario uses only four operational roles:

1. **Citizen**
2. **District Authority**
3. **State Authority**
4. **National Authority / MoSPI**

The scenario demonstrates how a citizen report becomes a verified, escalated and publicly tracked administrative action.

---

## AI anomaly scenario

### Example

JanDrishti detects a Pune library work with:

- High expenditure but low physical progress
- Execution duration above the category benchmark
- A nearby work with a similar description
- Elevated vendor concentration

The AI combines these signals into a prioritisation alert:

```text
Risk score: 78/100
Severity: HIGH
Result: Potential anomaly — human review required
```

This is a review signal, not a confirmed fraud finding.

### AI anomaly flowchart

```mermaid
flowchart TD
    A[Validated MPLADS data] --> B[AI analysis]
    B --> B1[Cost and payment signals]
    B --> B2[Progress and delay signals]
    B --> B3[Duplicate-work signals]
    B --> B4[Vendor concentration signals]
    B1 --> C[Explainable risk score]
    B2 --> C
    B3 --> C
    B4 --> C
    C --> D{Review required?}
    D -- No --> E[Continue monitoring]
    D -- Yes --> F[Create AI alert]
    F --> G[District Authority opens Inspect 360°]
    G --> H[District creates or links review case]
    H --> I[Evidence and physical verification]
    I --> J{Issue confirmed?}
    J -- No --> K[Record explanation and close]
    J -- Yes --> L[District assigns corrective action]
    L --> M{Repeated or serious pattern?}
    M -- No --> N[District monitors completion]
    M -- Yes --> O[State Authority reviews escalation]
    O --> P{Systemic or national concern?}
    P -- No --> N
    P -- Yes --> Q[National Authority / MoSPI oversees action]
    Q --> N
    N --> R[Publish permitted outcome]
    K --> R
```

### AI anomaly role hand-off

```text
AI detects and explains
    ↓
District Authority investigates
    ↓
State Authority coordinates repeated or serious cases
    ↓
National Authority / MoSPI oversees systemic issues
    ↓
District completes corrective action
    ↓
Public outcome is published
```

---

## Role 1: Citizen

### Citizen sees

- Public work description
- Work location
- Sanctioned and reported expenditure
- Completion status
- Public case/report status

### Citizen action

1. Opens the Public Transparency Portal.
2. Searches for an MPLADS work.
3. Observes a possible discrepancy:
   - Work does not exist at the displayed location.
   - Work is abandoned or delayed.
   - Physical quality does not match the displayed status.
   - Public expenditure appears inconsistent with visible progress.
4. Selects **Report Ground Discrepancy**.
5. Chooses a report category.
6. Adds description, location and optional photograph.
7. Submits the report.

### System response

- Generates a report ID.
- Stores the timestamp and work reference.
- Sets status to `SUBMITTED`.
- Sends the report to the District Authority queue.

---

## Role 2: District Authority

### District Authority sees

- Citizen report
- Work record and source provenance
- Existing AI anomaly signals
- Related alerts and review cases
- Submitted description, location and photograph

### District Authority action

1. Performs initial triage.
2. Checks whether the report is complete.
3. Links it to an existing AI alert or creates a review case.
4. Requests clarification if information is insufficient.
5. Reviews sanctions, payments, progress and completion records.
6. Requests supporting records from the responsible implementing office.
7. Dispatches physical verification when required.
8. Records the inspection result.
9. Assigns corrective action if an issue is confirmed.
10. Closes the report with evidence or escalates it to State Authority.

### Possible decisions

```text
NOT_SUBSTANTIATED
NEEDS_CLARIFICATION
VERIFIED_DISCREPANCY
CORRECTIVE_ACTION
ESCALATED_TO_STATE
RESOLVED
```

---

## Role 3: State Authority

### State Authority sees

- State-wide citizen reports
- District review cases
- Repeated anomaly categories
- Common work, vendor or agency patterns
- Overdue unresolved cases

### State Authority action

1. Reviews cases escalated by districts.
2. Compares the issue across districts.
3. Checks whether the same pattern is repeated.
4. Directs additional district verification.
5. Coordinates a state-level review when needed.
6. Monitors corrective-action deadlines.
7. Closes state-level escalation when resolved.
8. Escalates systemic or serious cases to National Authority / MoSPI.

### Escalation triggers

- Same pattern in multiple districts.
- Repeated complaints about the same work or agency.
- High-value financial exposure.
- District action overdue.
- Possible systemic implementation weakness.

---

## Role 4: National Authority / MoSPI

### National Authority sees

- National and state-level report trends
- Serious escalations
- District and state resolution performance
- Cross-state anomaly patterns
- Source health and data freshness

### National Authority action

1. Reviews systemic or high-severity escalations.
2. Compares states and districts.
3. Issues monitoring directions or advisories.
4. Selects cases for national review or audit.
5. Directs State Authority to complete corrective action.
6. Refers matters to the competent audit or investigation authority when required.
7. Tracks closure and publishes permitted public outcomes.

---

## Citizen report flowchart

```mermaid
flowchart TD
    A[Citizen opens Public Transparency Portal] --> B[Searches MPLADS work]
    B --> C[Reviews public status, expenditure and location]
    C --> D[Reports ground discrepancy]
    D --> E[Adds category, description, location and optional photo]
    E --> F{Report details valid?}
    F -- No --> G[Citizen corrects missing or invalid details]
    G --> E
    F -- Yes --> H[Report submitted]
    H --> I[Report ID generated]
    I --> J[District Authority receives report]
    J --> K{District triage}
    K -- Incomplete --> L[Request clarification from Citizen]
    L --> M[Citizen adds information]
    M --> J
    K -- Duplicate report --> N[Link to existing case]
    K -- Relevant report --> O[District reviews records and AI signals]
    N --> P[Citizen receives linked-case status]
    O --> Q{Physical verification required?}
    Q -- No --> R[District records explanation]
    Q -- Yes --> S[District conducts inspection]
    S --> T{Discrepancy verified?}
    T -- No --> R
    T -- Yes --> U[District assigns corrective action]
    U --> V{Repeated, serious or cross-district pattern?}
    V -- No --> W[District monitors corrective action]
    V -- Yes --> X[State Authority reviews escalation]
    X --> Y{Systemic or national concern?}
    Y -- No --> W
    Y -- Yes --> Z[National Authority / MoSPI directs national action]
    Z --> W
    R --> AA[Close with explanation and evidence]
    W --> AB{Action completed and verified?}
    AB -- No --> W
    AB -- Yes --> AC[Close with corrective-action evidence]
    AA --> AD[Publish permitted public status]
    AC --> AD
    AD --> AE[Citizen tracks report outcome]

    classDef citizen fill:#eef0f5,stroke:#65718a,color:#191b1f;
    classDef district fill:#e5f2ef,stroke:#1c7369,color:#191b1f;
    classDef state fill:#fce8df,stroke:#c65a32,color:#191b1f;
    classDef decision fill:#f4efe8,stroke:#8d735e,color:#191b1f;

    class A,B,C,D,E,G,M,P,AE citizen;
    class J,L,N,O,R,S,U,W,AA,AC,AD district;
    class X,Z state;
    class F,K,Q,T,V,Y,AB decision;
```

---

## Role hand-off flowchart

```mermaid
flowchart LR
    C[Citizen<br/>Reports discrepancy] --> D[District Authority<br/>Triage and verify]
    D -->|Clarification required| C
    D -->|Resolved locally| C2[Citizen<br/>Tracks public outcome]
    D -->|Repeated or serious pattern| S[State Authority<br/>Compare districts and direct action]
    S -->|District action required| D
    S -->|Systemic or national concern| N[National Authority / MoSPI<br/>Oversight and escalation]
    N -->|Direction and monitoring| S
    S --> C2
    N --> C2
```

---

## Report status flow

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED: Citizen submits report
    SUBMITTED --> TRIAGE: District receives report
    TRIAGE --> CLARIFICATION_REQUIRED: Details missing
    CLARIFICATION_REQUIRED --> SUBMITTED: Citizen updates report
    TRIAGE --> UNDER_VERIFICATION: Report is relevant
    TRIAGE --> LINKED_TO_CASE: Existing case found
    LINKED_TO_CASE --> UNDER_VERIFICATION: District reviews linked case
    UNDER_VERIFICATION --> NOT_SUBSTANTIATED: Evidence does not confirm issue
    UNDER_VERIFICATION --> VERIFIED_DISCREPANCY: Issue confirmed
    VERIFIED_DISCREPANCY --> CORRECTIVE_ACTION: District assigns action
    CORRECTIVE_ACTION --> MONITORING: Action is in progress
    MONITORING --> RESOLVED: Action completed and verified
    VERIFIED_DISCREPANCY --> ESCALATED_TO_STATE: Serious or repeated pattern
    ESCALATED_TO_STATE --> MONITORING: State direction issued
    ESCALATED_TO_STATE --> ESCALATED_TO_NATIONAL: Systemic or national concern
    ESCALATED_TO_NATIONAL --> MONITORING: National direction issued
    NOT_SUBSTANTIATED --> CLOSED: Explanation recorded
    LINKED_TO_CASE --> CLOSED: Linked case resolved
    RESOLVED --> CLOSED: Public outcome published
    CLOSED --> [*]
```

---

## Four-role sequence diagram

```mermaid
sequenceDiagram
    participant C as Citizen
    participant D as District Authority
    participant S as State Authority
    participant N as National Authority / MoSPI

    C->>D: Submit report with description, location and optional photo
    D->>D: Validate report and inspect existing work/AI records
    alt Information missing
        D-->>C: Request clarification
        C->>D: Submit additional information
    else Report is relevant
        D->>D: Review records and perform physical verification
        alt Issue not confirmed
            D-->>C: Publish explanation and close report
        else Issue confirmed
            D->>D: Assign corrective action
            alt Local issue
                D-->>C: Publish corrective-action status
            else Repeated or serious pattern
                D->>S: Escalate case with evidence
                S->>S: Compare districts and direct action
                alt State-level resolution
                    S->>D: Issue district corrective direction
                    D-->>C: Publish outcome
                else Systemic or national concern
                    S->>N: Escalate state pattern
                    N->>S: Issue national oversight direction
                    S->>D: Coordinate corrective action
                    D-->>C: Publish permitted outcome
                end
            end
        end
    end
```

---

## Role-based demonstration script

### Citizen demonstration

1. Open the public portal.
2. Search for the Pune library work.
3. Submit a delayed-work or physical-mismatch report.
4. Upload an optional observation photograph.
5. Save the generated report ID.

### District demonstration

1. Login as District Authority.
2. Open the citizen report queue.
3. Review the report with the work record and AI signals.
4. Initiate or link a review case.
5. Record inspection and corrective-action status.

### State demonstration

1. Login as State Authority.
2. Filter escalated Maharashtra cases.
3. Compare the issue across districts.
4. Direct additional verification or escalate a repeated pattern.

### National demonstration

1. Login as National Authority / MoSPI.
2. Review state trends and serious escalations.
3. Issue an oversight direction.
4. Track state and district closure performance.

---

## Final four-role flow

```text
Citizen reports
    ↓
District validates, investigates and acts
    ↓
State compares, coordinates and escalates
    ↓
National authority oversees systemic issues
    ↓
District completes corrective action
    ↓
Citizen sees permitted public outcome
```

The core governance loop is:

```text
Citizen observation → District verification → State oversight
→ National monitoring → Corrective action → Public outcome
```
