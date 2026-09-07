"""
JanDrishti — Architecture & Workflow Visual Board Generator
White Theme Edition for Miro & PDF Presentations.
"""

import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_OUT = os.path.join(BASE_DIR, "JanDrishti_Architecture_and_Workflow.html")
PDF_OUT = os.path.join(BASE_DIR, "JanDrishti_Architecture_and_Workflow.pdf")

SVG1_PATH = os.path.join(BASE_DIR, "Miro_Flowchart_1_Architecture.svg")
SVG2_PATH = os.path.join(BASE_DIR, "Miro_Flowchart_2_Governance_Lifecycle.svg")
SVG3_PATH = os.path.join(BASE_DIR, "Miro_Flowchart_3_Forensic_Pipeline.svg")

with open(SVG1_PATH, "r", encoding="utf-8") as f:
    SVG1_RAW = f.read()

with open(SVG2_PATH, "r", encoding="utf-8") as f:
    SVG2_RAW = f.read()

with open(SVG3_PATH, "r", encoding="utf-8") as f:
    SVG3_RAW = f.read()

HTML_CONTENT = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JanDrishti — Architecture &amp; Governance Miro Canvas (White Theme)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

  @page {{
    size: A4 landscape;
    margin: 8mm 8mm 10mm 8mm;
    @bottom-right {{
      content: counter(page);
    }}
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0f172a;
    background: #ffffff;
    line-height: 1.4;
    font-size: 11.5px;
    padding: 20px;
  }}

  .canvas-wrapper {{
    max-width: 1400px;
    margin: 0 auto;
  }}

  .page-break {{
    page-break-before: always;
    margin-top: 30px;
  }}

  /* WHITE THEME TOOLBAR */
  .miro-toolbar {{
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  }}

  .logo-block {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}

  .logo-icon {{
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 900;
    color: white;
  }}

  .logo-text h1 {{
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
  }}

  .logo-text p {{
    font-size: 11px;
    color: #64748b;
  }}

  .badge-cluster {{
    display: flex;
    gap: 8px;
  }}

  .chip {{
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}

  .chip-blue {{ background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; }}
  .chip-green {{ background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }}
  .chip-purple {{ background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff; }}

  /* WHITE THEME BOARD CONTAINER */
  .board-container {{
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }}

  .board-header {{
    margin-bottom: 14px;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 8px;
  }}

  .board-header h2 {{
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
  }}

  .board-header p {{
    font-size: 11.5px;
    color: #64748b;
  }}

  .svg-canvas {{
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
  }}

  .svg-canvas svg {{
    width: 100%;
    height: auto;
    display: block;
  }}

  /* TABLE */
  .white-table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    color: #334155;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    border: 1.5px solid #cbd5e1;
    margin-top: 14px;
  }}

  .white-table th {{
    background: #f8fafc;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 9px 12px;
    border-bottom: 2px solid #cbd5e1;
  }}

  .white-table td {{
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }}

  .white-table tr:nth-child(even) td {{
    background: #f8fafc;
  }}

  code {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    color: #0284c7;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }}
</style>
</head>
<body>

<div class="canvas-wrapper">

  <!-- TOP BAR -->
  <div class="miro-toolbar">
    <div class="logo-block">
      <div class="logo-icon">👁️</div>
      <div class="logo-text">
        <h1>JanDrishti — Architecture &amp; Governance Miro Canvas</h1>
        <p>Problem Statement ID: SIH26102 | Clean White Theme for Miro Presentation</p>
      </div>
    </div>
    <div class="badge-cluster">
      <span class="chip chip-blue">React 19 + FastAPI</span>
      <span class="chip chip-green">100% Zero-Overlap Vectors</span>
      <span class="chip chip-purple">Miro Drag &amp; Drop Ready</span>
    </div>
  </div>

  <!-- BOARD 1: FULL ARCHITECTURE -->
  <div class="board-container">
    <div class="board-header">
      <h2>🏛️ Board 1: Full System 5-Tier Data Flow &amp; Technology Architecture</h2>
      <p>Clean white theme with zero overlapping lines. Ready to drag and drop directly into Miro.</p>
    </div>
    <div class="svg-canvas">
      {SVG1_RAW}
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BOARD 2: GOVERNANCE LIFECYCLE -->
  <div class="board-container">
    <div class="board-header">
      <h2>🔄 Board 2: Statutory Governance Lifecycle (MP to Citizen Verification)</h2>
      <p>Explicit decision diamonds, defect loops, and state quota checks without any crossing lines.</p>
    </div>
    <div class="svg-canvas">
      {SVG2_RAW}
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BOARD 3: FORENSIC INTELLIGENCE -->
  <div class="board-container">
    <div class="board-header">
      <h2>🧠 Board 3: Pre-Disbursement Forensic Intelligence &amp; Anti-Fraud Pipeline</h2>
      <p>5 parallel statistical algorithms feeding into a composite vulnerability score with automated threshold actions.</p>
    </div>
    <div class="svg-canvas">
      {SVG3_RAW}
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BOARD 4: AUTHORITY MATRIX -->
  <div class="board-container">
    <div class="board-header">
      <h2>🛡️ Board 4: Statutory Authority Matrix (Separation of Powers)</h2>
      <p>Demarcation of administrative rights and statutory restrictions across Indian public finance tiers.</p>
    </div>

    <table class="white-table">
      <thead>
        <tr>
          <th style="width: 15%;">Role &amp; Rank</th>
          <th style="width: 18%;">Jurisdiction Scope</th>
          <th style="width: 33%;">Statutory Powers (Allowed)</th>
          <th style="width: 34%;">Strict Restrictions (Prohibited)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong style="color:#b91c1c;">RANK 1: MINISTRY_ADMIN</strong><br/>Central MoSPI</td>
          <td>Pan-India<br/>(National Corpus)</td>
          <td>View all 36 States, configure system risk weights, approve central dockets, manage system users, national audit review.</td>
          <td>Cannot modify ground milestone records; cannot bypass district techno-feasibility scrutiny.</td>
        </tr>
        <tr>
          <td><strong style="color:#c2410c;">RANK 2: STATE_NODAL</strong><br/>State Planning Dept</td>
          <td>Designated State<br/>(<code>user.state</code>)</td>
          <td>Review district dockets, grant statutory Financial Sanction (AS/FS), reject non-compliant works, monitor state budget quotas.</td>
          <td>Cannot access, approve, or modify records of any other Indian State.</td>
        </tr>
        <tr>
          <td><strong style="color:#a16207;">RANK 3: DISTRICT_AUTHORITY</strong><br/>District Collector / DM</td>
          <td>Designated District<br/>(<code>user.district</code>)</td>
          <td>Techno-economic scrutiny, tender floating, contractor assignment, milestone updates, geo-tagged photo uploads, release final payment.</td>
          <td>Cannot recommend works; cannot sanction outside district; cannot modify treasury transaction values directly.</td>
        </tr>
        <tr>
          <td><strong style="color:#15803d;">RANK 4: MP</strong><br/>Lok Sabha / Rajya Sabha</td>
          <td>Parliamentary Seat<br/>(<code>user.mp_id</code>)</td>
          <td>Draft and submit work recommendations within &#x20B9;5 Crore entitlement; track execution velocity; view constituency ledger.</td>
          <td>Locked from editing after submission; cannot approve works; cannot access other MPs' dockets.</td>
        </tr>
        <tr>
          <td><strong style="color:#4338ca;">RANK 5: STATUTORY AUDITOR</strong><br/>CAG / Independent</td>
          <td>National Mandate<br/>(Independent Oversight)</td>
          <td>Inspect Benford flags, cartel HHI scores, duplicate work dockets; create forensic audit cases; flag transactions for recovery.</td>
          <td>Read-only to financial ledgers; cannot disburse, approve, or alter financial figures.</td>
        </tr>
        <tr>
          <td><strong style="color:#475569;">RANK 6: CITIZEN</strong><br/>General Public</td>
          <td>Open Public<br/>(National Read-Only)</td>
          <td>Inspect all works on interactive maps; search MP utilization; scan QR code plaques on physical assets; submit ground discrepancy feedback.</td>
          <td>Zero mutation power on official records; cannot edit or sanction works.</td>
        </tr>
      </tbody>
    </table>
  </div>

</div>

</body>
</html>
"""

def generate_pdf():
    print(f"[*] Writing White-Theme HTML blueprint to: {HTML_OUT}")
    with open(HTML_OUT, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)
    print(f"[+] HTML generated ({len(HTML_CONTENT)} bytes)")

    # Find Chrome or Edge
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    browser = None
    for c in candidates:
        if os.path.exists(c):
            browser = c
            break

    if not browser:
        print("[-] Error: No Chrome or Edge executable found to render PDF.")
        sys.exit(1)

    print(f"[*] Using browser engine: {browser}")
    file_url = f"file:///{HTML_OUT.replace(os.sep, '/')}"
    
    cmd = [
        browser,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_OUT}",
        file_url
    ]
    
    print(f"[*] Compiling White-Theme landscape PDF: {PDF_OUT} ...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[-] Browser returned code {res.returncode}: {res.stderr}")
        sys.exit(res.returncode)

    if os.path.exists(PDF_OUT):
        size = os.path.getsize(PDF_OUT)
        print(f"[SUCCESS] White-Theme PDF successfully created: {PDF_OUT} ({size:,} bytes)")
    else:
        print("[-] PDF compilation failed: output file not found.")
        sys.exit(1)

if __name__ == "__main__":
    generate_pdf()
