"""
Generates clean, white-theme, perfectly formatted SVGs for Miro.
Can be dragged and dropped directly onto a Miro canvas without any dark background or overlapping lines.
"""

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG1_OUT = os.path.join(BASE_DIR, "Miro_Flowchart_1_Architecture.svg")
SVG2_OUT = os.path.join(BASE_DIR, "Miro_Flowchart_2_Governance_Lifecycle.svg")
SVG3_OUT = os.path.join(BASE_DIR, "Miro_Flowchart_3_Forensic_Pipeline.svg")

# -------------------------------------------------------------------------
# SVG 1: Full Architecture (Clean White Theme, Horizontal 5 Tiers)
# -------------------------------------------------------------------------
SVG1 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 500" width="100%" height="100%" style="background:#ffffff; font-family:'Inter', sans-serif;">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.06"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b"/>
    </marker>
    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#0284c7"/>
    </marker>
  </defs>

  <!-- TITLE -->
  <text x="40" y="45" font-size="20" font-weight="800" fill="#0f172a">JanDrishti — Full System 5-Tier Architecture</text>
  <text x="40" y="68" font-size="12" fill="#64748b">Direct Miro Drag &amp; Drop Vector • Clean Light Theme • Zero-Overlap Pipeline</text>

  <!-- TIER 1: CLIENT -->
  <rect x="40" y="90" width="230" height="370" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="40" y="90" width="230" height="36" rx="10" fill="#e0f2fe"/>
  <rect x="40" y="116" width="230" height="10" fill="#e0f2fe"/>
  <text x="55" y="114" font-size="12" font-weight="700" fill="#0369a1">TIER 1: CLIENT (React 19)</text>

  <rect x="55" y="140" width="200" height="65" rx="6" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="68" y="162" font-size="11" font-weight="700" fill="#1e293b">Public Citizen Portal</text>
  <text x="68" y="180" font-size="9.5" fill="#64748b">Overview &amp; MP Explorer</text>
  <text x="68" y="194" font-size="9" font-family="monospace" fill="#0284c7">OverviewPage.tsx</text>

  <rect x="55" y="215" width="200" height="65" rx="6" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="68" y="237" font-size="11" font-weight="700" fill="#1e293b">Statutory Workspaces</text>
  <text x="68" y="255" font-size="9.5" fill="#64748b">MP, DM, State, Auditor</text>
  <text x="68" y="269" font-size="9" font-family="monospace" fill="#0284c7">workspaces/*.tsx</text>

  <rect x="55" y="290" width="200" height="65" rx="6" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="68" y="312" font-size="11" font-weight="700" fill="#1e293b">Intelligence Hub</text>
  <text x="68" y="330" font-size="9.5" fill="#64748b">Anomalies &amp; Cartels</text>
  <text x="68" y="344" font-size="9" font-family="monospace" fill="#0284c7">AnomalyCenter.tsx</text>

  <rect x="55" y="365" width="200" height="75" rx="6" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/>
  <text x="68" y="387" font-size="11" font-weight="700" fill="#0369a1">Axios HTTP Interceptor</text>
  <text x="68" y="405" font-size="9.5" fill="#64748b">Injects Bearer JWT Token</text>
  <text x="68" y="420" font-size="9" font-family="monospace" fill="#0284c7">frontend/src/api/client.ts</text>

  <!-- CONNECTOR T1 -> T2 -->
  <path d="M 270 402 L 310 402 L 310 200 L 315 200" fill="none" stroke="#0284c7" stroke-width="2" marker-end="url(#arrow-blue)"/>
  <rect x="270" y="270" width="40" height="20" rx="3" fill="#ffffff" stroke="#cbd5e1"/>
  <text x="273" y="284" font-size="8.5" font-family="monospace" fill="#0284c7">JWT</text>

  <!-- TIER 2: GATEWAY -->
  <rect x="320" y="90" width="230" height="370" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="320" y="90" width="230" height="36" rx="10" fill="#e0e7ff"/>
  <rect x="320" y="116" width="230" height="10" fill="#e0e7ff"/>
  <text x="335" y="114" font-size="12" font-weight="700" fill="#3730a3">TIER 2: GATEWAY &amp; AUTH</text>

  <rect x="335" y="140" width="200" height="65" rx="6" fill="#ffffff" stroke="#a5b4fc" stroke-width="1.5"/>
  <text x="348" y="162" font-size="11" font-weight="700" fill="#1e293b">FastAPI Gateway</text>
  <text x="348" y="180" font-size="9.5" fill="#64748b">95+ REST endpoints (/api/v1)</text>
  <text x="348" y="194" font-size="9" font-family="monospace" fill="#4338ca">backend/main.py</text>

  <rect x="335" y="215" width="200" height="65" rx="6" fill="#ffffff" stroke="#a5b4fc" stroke-width="1.5"/>
  <text x="348" y="237" font-size="11" font-weight="700" fill="#1e293b">JWT Auth Verifier</text>
  <text x="348" y="255" font-size="9.5" fill="#64748b">Unpacks Role, State, MP ID</text>
  <text x="348" y="269" font-size="9" font-family="monospace" fill="#4338ca">backend/auth.py</text>

  <rect x="335" y="290" width="200" height="65" rx="6" fill="#ffffff" stroke="#a5b4fc" stroke-width="1.5"/>
  <text x="348" y="312" font-size="11" font-weight="700" fill="#1e293b">RBAC / ABAC Interceptor</text>
  <text x="348" y="330" font-size="9.5" fill="#64748b">Enforces Jurisdiction Boundary</text>
  <text x="348" y="344" font-size="9" font-family="monospace" fill="#4338ca">backend/rbac_abac.py</text>

  <rect x="335" y="365" width="200" height="75" rx="6" fill="#ffffff" stroke="#6366f1" stroke-width="2"/>
  <text x="348" y="387" font-size="11" font-weight="700" fill="#3730a3">Territorial Scoping</text>
  <text x="348" y="405" font-size="9.5" fill="#64748b">Builds WHERE SQL Clause</text>
  <text x="348" y="420" font-size="9" font-family="monospace" fill="#4338ca">backend/scope.py</text>

  <!-- CONNECTOR T2 -> T3 -->
  <path d="M 550 402 L 590 402 L 590 200 L 595 200" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- TIER 3: GOVERNANCE & BUSINESS -->
  <rect x="600" y="90" width="230" height="370" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="600" y="90" width="230" height="36" rx="10" fill="#fae8ff"/>
  <rect x="600" y="116" width="230" height="10" fill="#fae8ff"/>
  <text x="615" y="114" font-size="12" font-weight="700" fill="#86198f">TIER 3: GOVERNANCE</text>

  <rect x="615" y="140" width="200" height="65" rx="6" fill="#ffffff" stroke="#f0abfc" stroke-width="1.5"/>
  <text x="628" y="162" font-size="11" font-weight="700" fill="#1e293b">Workflow State Machine</text>
  <text x="628" y="180" font-size="9.5" fill="#64748b">Guarantees legal transitions</text>
  <text x="628" y="194" font-size="9" font-family="monospace" fill="#a21caf">backend/workflow.py</text>

  <rect x="615" y="215" width="200" height="65" rx="6" fill="#ffffff" stroke="#f0abfc" stroke-width="1.5"/>
  <text x="628" y="237" font-size="11" font-weight="700" fill="#1e293b">Gov Operations Service</text>
  <text x="628" y="255" font-size="9.5" fill="#64748b">Sanctions, Tenders, MB books</text>
  <text x="628" y="269" font-size="9" font-family="monospace" fill="#a21caf">backend/gov_service.py</text>

  <rect x="615" y="290" width="200" height="65" rx="6" fill="#ffffff" stroke="#f0abfc" stroke-width="1.5"/>
  <text x="628" y="312" font-size="11" font-weight="700" fill="#1e293b">Forensic Audit Docket</text>
  <text x="628" y="330" font-size="9.5" fill="#64748b">Case Escalation to CAG</text>
  <text x="628" y="344" font-size="9" font-family="monospace" fill="#a21caf">backend/cases.py</text>

  <rect x="615" y="365" width="200" height="75" rx="6" fill="#ffffff" stroke="#c026d3" stroke-width="2"/>
  <text x="628" y="387" font-size="11" font-weight="700" fill="#86198f">Chained Audit Logger</text>
  <text x="628" y="405" font-size="9.5" fill="#64748b">Tamper-Proof Audit Trail</text>
  <text x="628" y="420" font-size="9" font-family="monospace" fill="#a21caf">backend/audit_logger.py</text>

  <!-- CONNECTOR T3 -> T4 -->
  <path d="M 830 200 L 875 200" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- TIER 4: FORENSICS -->
  <rect x="880" y="90" width="230" height="370" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="880" y="90" width="230" height="36" rx="10" fill="#fee2e2"/>
  <rect x="880" y="116" width="230" height="10" fill="#fee2e2"/>
  <text x="895" y="114" font-size="12" font-weight="700" fill="#991b1b">TIER 4: FORENSIC ENGINES</text>

  <rect x="895" y="140" width="200" height="65" rx="6" fill="#ffffff" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="908" y="162" font-size="11" font-weight="700" fill="#1e293b">Benford's Law (20%)</text>
  <text x="908" y="180" font-size="9.5" fill="#64748b">First-Digit Log Frequency</text>
  <text x="908" y="194" font-size="9" font-family="monospace" fill="#b91c1c">Chi-Square p &lt; 0.05</text>

  <rect x="895" y="215" width="200" height="65" rx="6" fill="#ffffff" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="908" y="237" font-size="11" font-weight="700" fill="#1e293b">Semantic Duplicate (35%)</text>
  <text x="908" y="255" font-size="9.5" fill="#64748b">Levenshtein &amp; Jaccard</text>
  <text x="908" y="269" font-size="9" font-family="monospace" fill="#b91c1c">Similarity &gt; 0.85</text>

  <rect x="895" y="290" width="200" height="65" rx="6" fill="#ffffff" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="908" y="312" font-size="11" font-weight="700" fill="#1e293b">Cartelization HHI (25%)</text>
  <text x="908" y="330" font-size="9.5" fill="#64748b">Vendor Concentration</text>
  <text x="908" y="344" font-size="9" font-family="monospace" fill="#b91c1c">HHI Index &gt; 2500</text>

  <rect x="895" y="365" width="200" height="75" rx="6" fill="#ffffff" stroke="#ef4444" stroke-width="2"/>
  <text x="908" y="387" font-size="11" font-weight="700" fill="#991b1b">Composite Risk Calculator</text>
  <text x="908" y="405" font-size="9.5" fill="#64748b">Weighted Score 0 - 100</text>
  <text x="908" y="420" font-size="9" font-family="monospace" fill="#b91c1c">Score &gt;= 75 &rarr; CAG Lock</text>

  <!-- CONNECTOR T3/T4 -> T5 -->
  <path d="M 830 402 L 1150 402 L 1150 200 L 1155 200" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- TIER 5: STORAGE -->
  <rect x="1160" y="90" width="200" height="370" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow)"/>
  <rect x="1160" y="90" width="200" height="36" rx="10" fill="#dcfce7"/>
  <rect x="1160" y="116" width="200" height="10" fill="#dcfce7"/>
  <text x="1175" y="114" font-size="12" font-weight="700" fill="#166534">TIER 5: DUAL DATABASE</text>

  <rect x="1175" y="140" width="170" height="85" rx="6" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
  <text x="1188" y="165" font-size="11" font-weight="700" fill="#1e293b">Primary Cloud DB</text>
  <text x="1188" y="185" font-size="9.5" fill="#64748b">Supabase PostgreSQL</text>
  <text x="1188" y="200" font-size="9" fill="#15803d">AWS Tokyo • Relational</text>
  <text x="1188" y="214" font-size="9" font-family="monospace" fill="#15803d">PostgREST API</text>

  <rect x="1175" y="245" width="170" height="85" rx="6" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
  <text x="1188" y="270" font-size="11" font-weight="700" fill="#1e293b">Local Resilient DB</text>
  <text x="1188" y="290" font-size="9.5" fill="#64748b">SQLite 3 Fallback</text>
  <text x="1188" y="305" font-size="9" fill="#15803d">Zero-Config Offline</text>
  <text x="1188" y="319" font-size="9" font-family="monospace" fill="#15803d">database/mplads.db</text>

  <rect x="1175" y="350" width="170" height="90" rx="6" fill="#ffffff" stroke="#22c55e" stroke-width="2"/>
  <text x="1188" y="375" font-size="11" font-weight="700" fill="#166534">Unified DB Driver</text>
  <text x="1188" y="395" font-size="9.5" fill="#64748b">Transparent Switching</text>
  <text x="1188" y="410" font-size="9" font-family="monospace" fill="#15803d">backend/db_engine.py</text>
  <text x="1188" y="425" font-size="9" fill="#166534">Auto-Reconnect &amp; Sync</text>

</svg>
"""

# -------------------------------------------------------------------------
# SVG 2: Governance Lifecycle (No Overlapping Lines, Clear Decision Trees)
# -------------------------------------------------------------------------
SVG2 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 520" width="100%" height="100%" style="background:#ffffff; font-family:'Inter', sans-serif;">
  <defs>
    <filter id="shadow2" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
    <marker id="arr-gray" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b"/>
    </marker>
    <marker id="arr-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#16a34a"/>
    </marker>
    <marker id="arr-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#dc2626"/>
    </marker>
  </defs>

  <!-- HEADER -->
  <text x="40" y="40" font-size="20" font-weight="800" fill="#0f172a">JanDrishti — Statutory Governance Lifecycle (MP to Citizen)</text>
  <text x="40" y="62" font-size="12" fill="#64748b">Zero Overlap • Explicit Decision Diamonds • Clear Color-Coded Branching Paths</text>

  <!-- STEP 1: MP DRAFT -->
  <rect x="40" y="90" width="170" height="90" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="2" filter="url(#shadow2)"/>
  <text x="52" y="112" font-size="10" font-weight="800" fill="#15803d">STEP 1: MP DRAFT</text>
  <text x="52" y="130" font-size="11" font-weight="700" fill="#0f172a">Initiate Proposal</text>
  <text x="52" y="146" font-size="9" fill="#64748b">Title, Sector, GPS</text>
  <text x="52" y="160" font-size="9" fill="#15803d">Cost &lt;= &#x20B9;5 Crore</text>
  <rect x="52" y="165" width="50" height="12" rx="3" fill="#0f172a"/>
  <text x="56" y="174" font-size="8" font-family="monospace" fill="#38bdf8">DRAFT</text>

  <!-- ARROW 1 -> 2 -->
  <path d="M 210 135 L 245 135" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-gray)"/>

  <!-- STEP 2: MP SUBMIT -->
  <rect x="250" y="90" width="170" height="90" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="2" filter="url(#shadow2)"/>
  <text x="262" y="112" font-size="10" font-weight="800" fill="#15803d">STEP 2: MP SUBMIT</text>
  <text x="262" y="130" font-size="11" font-weight="700" fill="#0f172a">Statutory Lock</text>
  <text x="262" y="146" font-size="9" fill="#dc2626">MP Edit Rights Revoked</text>
  <text x="262" y="160" font-size="9" fill="#64748b">Dispatched to DM</text>
  <rect x="262" y="165" width="70" height="12" rx="3" fill="#0284c7"/>
  <text x="266" y="174" font-size="8" font-family="monospace" fill="#ffffff">SUBMITTED</text>

  <!-- ARROW 2 -> DECISION 1 -->
  <path d="M 420 135 L 465 135" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-gray)"/>

  <!-- DECISION 1: DISTRICT SCRUTINY -->
  <polygon points="530,90 600,135 530,180 460,135" fill="#fef9c3" stroke="#eab308" stroke-width="2" filter="url(#shadow2)"/>
  <text x="495" y="130" font-size="10" font-weight="800" fill="#854d0e">DISTRICT</text>
  <text x="488" y="145" font-size="9" font-weight="700" fill="#854d0e">SCRUTINY</text>

  <!-- BRANCH 1A: RETURNED (UP AND BACK TO STEP 1) -->
  <path d="M 530 90 L 530 75 L 125 75 L 125 85" fill="none" stroke="#ea580c" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arr-red)"/>
  <rect x="280" y="65" width="140" height="18" rx="4" fill="#ffedd5" stroke="#fdba74"/>
  <text x="285" y="78" font-size="8.5" font-weight="700" fill="#c2410c">Defect &rarr; RETURNED FOR FIX</text>

  <!-- BRANCH 1B: REJECTED (DOWN) -->
  <path d="M 530 180 L 530 230" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-red)"/>
  <rect x="445" y="235" width="170" height="55" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="455" y="253" font-size="9.5" font-weight="800" fill="#991b1b">PROHIBITED WORK</text>
  <text x="455" y="268" font-size="9" fill="#64748b">Violates MoSPI Negative List</text>
  <rect x="455" y="272" width="55" height="12" rx="3" fill="#b91c1c"/>
  <text x="458" y="281" font-size="8" font-family="monospace" fill="#ffffff">REJECTED</text>

  <!-- BRANCH 1C: PASS TO STATE (RIGHT) -->
  <path d="M 600 135 L 645 135" fill="none" stroke="#16a34a" stroke-width="2" marker-end="url(#arr-green)"/>
  <text x="605" y="125" font-size="8.5" font-weight="700" fill="#16a34a">PASS</text>

  <!-- DECISION 2: STATE SANCTION -->
  <polygon points="715,90 785,135 715,180 645,135" fill="#fef9c3" stroke="#eab308" stroke-width="2" filter="url(#shadow2)"/>
  <text x="688" y="130" font-size="10" font-weight="800" fill="#854d0e">STATE</text>
  <text x="682" y="145" font-size="9" font-weight="700" fill="#854d0e">SANCTION</text>

  <!-- BRANCH 2A: REJECTED (DOWN) -->
  <path d="M 715 180 L 715 230" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-red)"/>
  <rect x="635" y="235" width="160" height="55" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="645" y="253" font-size="9.5" font-weight="800" fill="#991b1b">QUOTA EXCEEDED</text>
  <text x="645" y="268" font-size="9" fill="#64748b">State Fiscal Deficit</text>
  <rect x="645" y="272" width="55" height="12" rx="3" fill="#b91c1c"/>
  <text x="648" y="281" font-size="8" font-family="monospace" fill="#ffffff">REJECTED</text>

  <!-- BRANCH 2B: SANCTIONED (RIGHT) -->
  <path d="M 785 135 L 830 135" fill="none" stroke="#16a34a" stroke-width="2" marker-end="url(#arr-green)"/>
  <text x="790" y="125" font-size="8.5" font-weight="700" fill="#16a34a">AS/FS</text>

  <!-- STEP 4: SANCTIONED -->
  <rect x="835" y="90" width="160" height="90" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="2" filter="url(#shadow2)"/>
  <text x="847" y="112" font-size="10" font-weight="800" fill="#15803d">STEP 4: SANCTION</text>
  <text x="847" y="130" font-size="11" font-weight="700" fill="#0f172a">AS/FS Order Issued</text>
  <text x="847" y="146" font-size="9" fill="#64748b">Funds Committed in DB</text>
  <text x="847" y="160" font-size="9" fill="#15803d">Treasury Earmark</text>
  <rect x="847" y="165" width="70" height="12" rx="3" fill="#15803d"/>
  <text x="851" y="174" font-size="8" font-family="monospace" fill="#ffffff">SANCTIONED</text>

  <!-- ARROW 4 -> 5 -->
  <path d="M 995 135 L 1030 135" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-gray)"/>

  <!-- STEP 5: TENDERING -->
  <rect x="1035" y="90" width="160" height="90" rx="8" fill="#eff6ff" stroke="#93c5fd" stroke-width="2" filter="url(#shadow2)"/>
  <text x="1047" y="112" font-size="10" font-weight="800" fill="#1d4ed8">STEP 5: TENDERING</text>
  <text x="1047" y="130" font-size="11" font-weight="700" fill="#0f172a">Contractor Award</text>
  <text x="1047" y="146" font-size="9" fill="#64748b">PWD / ZP mobilizes</text>
  <text x="1047" y="160" font-size="9" fill="#1d4ed8">Work Order Issued</text>
  <rect x="1047" y="165" width="75" height="12" rx="3" fill="#4f46e5"/>
  <text x="1051" y="174" font-size="8" font-family="monospace" fill="#ffffff">IN_PROGRESS</text>

  <!-- LOWER PIPELINE: EXECUTION & VERIFICATION (CONNECTED VIA RIGHT BUS) -->
  <path d="M 1195 135 L 1240 135 L 1240 380 L 1195 380" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-gray)"/>

  <!-- STEP 6: MILESTONES (LOWER RIGHT) -->
  <rect x="1015" y="335" width="175" height="90" rx="8" fill="#eff6ff" stroke="#93c5fd" stroke-width="2" filter="url(#shadow2)"/>
  <text x="1027" y="357" font-size="10" font-weight="800" fill="#1d4ed8">STEP 6: MILESTONES</text>
  <text x="1027" y="375" font-size="11" font-weight="700" fill="#0f172a">Ground Execution</text>
  <text x="1027" y="391" font-size="9" fill="#64748b">25% &rarr; 50% &rarr; 75% &rarr; 100%</text>
  <text x="1027" y="405" font-size="9" fill="#1d4ed8">Measurement Book Signed</text>
  <rect x="1027" y="410" width="75" height="12" rx="3" fill="#4f46e5"/>
  <text x="1031" y="419" font-size="8" font-family="monospace" fill="#ffffff">IN_PROGRESS</text>

  <!-- ARROW 6 -> 7 -->
  <path d="M 1015 380 L 975 380" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-gray)"/>

  <!-- STEP 7: DISBURSEMENT -->
  <rect x="795" y="335" width="175" height="90" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="2" filter="url(#shadow2)"/>
  <text x="807" y="357" font-size="10" font-weight="800" fill="#15803d">STEP 7: VOUCHER</text>
  <text x="807" y="375" font-size="11" font-weight="700" fill="#0f172a">Final Disbursement</text>
  <text x="807" y="391" font-size="9" fill="#64748b">Treasury Voucher in DB</text>
  <text x="807" y="405" font-size="9" fill="#15803d">Amounts Immutable Lock</text>
  <rect x="807" y="410" width="70" height="12" rx="3" fill="#0d9488"/>
  <text x="811" y="419" font-size="8" font-family="monospace" fill="#ffffff">COMPLETED</text>

  <!-- ARROW 7 -> 8 -->
  <path d="M 795 380 L 755 380" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-gray)"/>

  <!-- STEP 8: GEO-TAGGED PHOTOS -->
  <rect x="575" y="335" width="175" height="90" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="2" filter="url(#shadow2)"/>
  <text x="587" y="357" font-size="10" font-weight="800" fill="#15803d">STEP 8: GEO-TAG</text>
  <text x="587" y="375" font-size="11" font-weight="700" fill="#0f172a">Site Photo Verified</text>
  <text x="587" y="391" font-size="9" fill="#64748b">GPS Coordinates stamped</text>
  <text x="587" y="405" font-size="9" fill="#15803d">Inspection Plaque Made</text>
  <rect x="587" y="410" width="60" height="12" rx="3" fill="#16a34a"/>
  <text x="591" y="419" font-size="8" font-family="monospace" fill="#ffffff">VERIFIED</text>

  <!-- ARROW 8 -> 9 -->
  <path d="M 575 380 L 535 380" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-gray)"/>

  <!-- STEP 9: CITIZEN OPEN AUDIT -->
  <rect x="355" y="335" width="175" height="90" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" filter="url(#shadow2)"/>
  <text x="367" y="357" font-size="10" font-weight="800" fill="#475569">STEP 9: PUBLIC AUDIT</text>
  <text x="367" y="375" font-size="11" font-weight="700" fill="#0f172a">Citizen Verification</text>
  <text x="367" y="391" font-size="9" fill="#64748b">Scan QR Code Plaque</text>
  <text x="367" y="405" font-size="9" fill="#0284c7">File Discrepancy Report</text>
  <rect x="367" y="410" width="75" height="12" rx="3" fill="#334155"/>
  <text x="371" y="419" font-size="8" font-family="monospace" fill="#ffffff">OPEN_AUDIT</text>

</svg>
"""

# -------------------------------------------------------------------------
# SVG 3: Pre-Disbursement Forensic Intelligence Pipeline
# -------------------------------------------------------------------------
SVG3 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 480" width="100%" height="100%" style="background:#ffffff; font-family:'Inter', sans-serif;">
  <defs>
    <filter id="shadow3" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.08"/>
    </filter>
    <marker id="arr-m" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b"/>
    </marker>
  </defs>

  <!-- TITLE -->
  <text x="40" y="40" font-size="20" font-weight="800" fill="#0f172a">JanDrishti — Pre-Disbursement Forensic Intelligence &amp; Anti-Fraud Pipeline</text>
  <text x="40" y="62" font-size="12" fill="#64748b">Zero-Overlap Layout • 5 Parallel Mathematical Engines • Clear Threshold Escalations</text>

  <!-- INPUT -->
  <rect x="40" y="90" width="220" height="340" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow3)"/>
  <rect x="40" y="90" width="220" height="36" rx="10" fill="#e0f2fe"/>
  <text x="55" y="114" font-size="12" font-weight="800" fill="#0369a1">1. INGESTED VOUCHER</text>
  
  <rect x="55" y="140" width="190" height="80" rx="6" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="68" y="162" font-size="11" font-weight="700" fill="#1e293b">Transaction Data</text>
  <text x="68" y="180" font-size="9" fill="#64748b">Voucher: &#x20B9;24,80,000</text>
  <text x="68" y="195" font-size="9" fill="#64748b">Contractor: Apex Infratech</text>
  <text x="68" y="210" font-size="9" fill="#64748b">Location: Ward 4, Block X</text>

  <rect x="55" y="235" width="190" height="80" rx="6" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="68" y="257" font-size="11" font-weight="700" fill="#1e293b">Historical Ledger</text>
  <text x="68" y="275" font-size="9" fill="#64748b">102,437 Reconciled Assets</text>
  <text x="68" y="290" font-size="9" fill="#64748b">82,296 Vouchers</text>
  <text x="68" y="305" font-size="9" fill="#64748b">22,377 Contractors</text>

  <!-- FAN OUT ARROWS TO 5 ENGINES -->
  <path d="M 260 260 L 320 120" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 260 260 L 320 190" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 260 260 L 320 260" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 260 260 L 320 330" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 260 260 L 320 400" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>

  <!-- 5 PARALLEL ENGINES -->
  <rect x="330" y="90" width="380" height="60" rx="6" fill="#fdf4ff" stroke="#f0abfc" stroke-width="1.5" filter="url(#shadow3)"/>
  <text x="345" y="112" font-size="11" font-weight="800" fill="#a21caf">1. Benford's Law Engine (Weight: 20%)</text>
  <text x="345" y="128" font-size="9.5" fill="#64748b">Log-frequency test on first digits: P(d) = log10(1 + 1/d) &bull; Chi-Square p &lt; 0.05</text>
  <text x="345" y="142" font-size="9" font-family="monospace" fill="#c026d3">backend/intelligence.py::benford_analysis()</text>

  <rect x="330" y="160" width="380" height="60" rx="6" fill="#fdf4ff" stroke="#f0abfc" stroke-width="1.5" filter="url(#shadow3)"/>
  <text x="345" y="182" font-size="11" font-weight="800" fill="#a21caf">2. Semantic Work Matcher (Weight: 35%)</text>
  <text x="345" y="198" font-size="9.5" fill="#64748b">Levenshtein &amp; Jaccard overlap on project titles in same Gram Panchayat &bull; Score &gt; 0.85</text>
  <text x="345" y="212" font-size="9" font-family="monospace" fill="#c026d3">backend/intelligence.py::duplicate_detection()</text>

  <rect x="330" y="230" width="380" height="60" rx="6" fill="#fdf4ff" stroke="#f0abfc" stroke-width="1.5" filter="url(#shadow3)"/>
  <text x="345" y="252" font-size="11" font-weight="800" fill="#a21caf">3. Vendor Cartelization (Weight: 25%)</text>
  <text x="345" y="268" font-size="9.5" fill="#64748b">Herfindahl-Hirschman Index: HHI = &Sigma; (Market Share)&sup2; &bull; HHI &gt; 2500 monopoly</text>
  <text x="345" y="282" font-size="9" font-family="monospace" fill="#c026d3">backend/intelligence.py::cartel_analysis()</text>

  <rect x="330" y="300" width="380" height="60" rx="6" fill="#fdf4ff" stroke="#f0abfc" stroke-width="1.5" filter="url(#shadow3)"/>
  <text x="345" y="322" font-size="11" font-weight="800" fill="#a21caf">4. Expenditure Velocity Engine (Weight: 20%)</text>
  <text x="345" y="338" font-size="9.5" fill="#64748b">Z-Score outlier test on spend timestamps: Z = (Spend - &mu;) / &sigma; &bull; Z &gt; 3.0 March rush</text>
  <text x="345" y="352" font-size="9" font-family="monospace" fill="#c026d3">backend/intelligence.py::velocity_spikes()</text>

  <rect x="330" y="370" width="380" height="60" rx="6" fill="#fdf4ff" stroke="#f0abfc" stroke-width="1.5" filter="url(#shadow3)"/>
  <text x="345" y="392" font-size="11" font-weight="800" fill="#a21caf">5. Predictive Delay Model (Auxiliary)</text>
  <text x="345" y="408" font-size="9.5" fill="#64748b">Random Forest Regressor estimating expected completion based on district track record</text>
  <text x="345" y="422" font-size="9" font-family="monospace" fill="#c026d3">backend/intelligence.py::delay_prediction()</text>

  <!-- FAN IN ARROWS TO COMPOSITE -->
  <path d="M 710 120 L 780 260" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 710 190 L 780 260" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 710 260 L 780 260" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 710 330 L 780 260" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 710 400 L 780 260" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arr-m)"/>

  <!-- COMPOSITE CALCULATOR -->
  <rect x="790" y="190" width="220" height="140" rx="8" fill="#fef9c3" stroke="#eab308" stroke-width="2" filter="url(#shadow3)"/>
  <text x="805" y="215" font-size="11" font-weight="800" fill="#854d0e">COMPOSITE RISK ENGINE</text>
  <text x="805" y="235" font-size="9.5" fill="#64748b">Risk Score =</text>
  <text x="805" y="250" font-size="9" font-family="monospace" fill="#854d0e">(0.35 &times; Dupe) +</text>
  <text x="805" y="264" font-size="9" font-family="monospace" fill="#854d0e">(0.25 &times; HHI) +</text>
  <text x="805" y="278" font-size="9" font-family="monospace" fill="#854d0e">(0.20 &times; Benford) +</text>
  <text x="805" y="292" font-size="9" font-family="monospace" fill="#854d0e">(0.20 &times; Velocity)</text>
  <text x="805" y="315" font-size="9.5" font-weight="700" fill="#854d0e">Formula Range: 0 - 100</text>

  <!-- ARROWS TO THRESHOLDS -->
  <path d="M 1010 230 L 1070 140" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 1010 260 L 1070 260" fill="none" stroke="#ea580c" stroke-width="2" marker-end="url(#arr-m)"/>
  <path d="M 1010 290 L 1070 380" fill="none" stroke="#16a34a" stroke-width="2" marker-end="url(#arr-m)"/>

  <!-- THRESHOLD OUTCOMES -->
  <rect x="1080" y="90" width="280" height="100" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="2" filter="url(#shadow3)"/>
  <text x="1095" y="115" font-size="12" font-weight="800" fill="#dc2626">🚨 CRITICAL: Risk Score &gt;= 75</text>
  <text x="1095" y="133" font-size="9.5" fill="#1e293b">&bull; Auto-escalate case in review_cases</text>
  <text x="1095" y="148" font-size="9.5" fill="#1e293b">&bull; Queued in CAG Auditor Workspace</text>
  <text x="1095" y="163" font-size="9.5" fill="#1e293b">&bull; Real-time Alert sent to Ministry Admin</text>
  <text x="1095" y="178" font-size="9.5" font-weight="700" fill="#dc2626">&bull; Immediate payment lock recommended</text>

  <rect x="1080" y="210" width="280" height="100" rx="8" fill="#fffbeb" stroke="#f59e0b" stroke-width="2" filter="url(#shadow3)"/>
  <text x="1095" y="235" font-size="12" font-weight="800" fill="#d97706">⚠️ ADVISORY: Risk Score 45 - 74</text>
  <text x="1095" y="253" font-size="9.5" fill="#1e293b">&bull; Flagged on District Collector dashboard</text>
  <text x="1095" y="268" font-size="9.5" fill="#1e293b">&bull; Executive Engineer explanation needed</text>
  <text x="1095" y="283" font-size="9.5" fill="#1e293b">&bull; Physical site inspection scheduled</text>
  <text x="1095" y="298" font-size="9.5" font-weight="700" fill="#d97706">&bull; Enhanced voucher scrutiny applied</text>

  <rect x="1080" y="330" width="280" height="100" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2" filter="url(#shadow3)"/>
  <text x="1095" y="355" font-size="12" font-weight="800" fill="#16a34a">✅ NORMAL: Risk Score &lt; 45</text>
  <text x="1095" y="373" font-size="9.5" fill="#1e293b">&bull; Standard statutory audit clearance</text>
  <text x="1095" y="388" font-size="9.5" fill="#1e293b">&bull; Treasury voucher disbursed normally</text>
  <text x="1095" y="403" font-size="9.5" fill="#1e293b">&bull; Recorded in public expenditure ledger</text>
  <text x="1095" y="418" font-size="9.5" font-weight="700" fill="#16a34a">&bull; Routine compliance verification</text>

</svg>
"""

def generate():
    print(f"[*] Writing SVG 1: {SVG1_OUT}")
    with open(SVG1_OUT, "w", encoding="utf-8") as f:
        f.write(SVG1)
    print(f"[*] Writing SVG 2: {SVG2_OUT}")
    with open(SVG2_OUT, "w", encoding="utf-8") as f:
        f.write(SVG2)
    print(f"[*] Writing SVG 3: {SVG3_OUT}")
    with open(SVG3_OUT, "w", encoding="utf-8") as f:
        f.write(SVG3)
    print("[+] All 3 SVGs generated successfully!")

if __name__ == "__main__":
    generate()
