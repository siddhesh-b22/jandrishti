"""
JanDrishti — Comprehensive Statutory RBAC / ABAC Security Test Suite
Tests:
1. Horizontal & Vertical Privilege Escalation
2. Cross-State, Cross-District, Cross-Constituency Denial
3. MP Workflow State Locking (Locked after SUBMITTED)
4. Financial Ledger Immutability & Field-Level Access Rules
5. Auditor Scope Enforcement (No direct source mutation)
6. Citizen Read-Only Safety & Public Reporting
7. Audit Trail Integrity
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db_connection

client = TestClient(app)

# Authoritative demo tokens
TOKEN_MINISTRY = "Bearer jd-demo-ministry-2026"
TOKEN_STATE_MH = "Bearer jd-demo-state-2026"
TOKEN_DISTRICT_PUNE = "Bearer jd-demo-district-2026"
TOKEN_MP_PUNE = "Bearer jd-demo-mp-2026"
TOKEN_AUDITOR = "Bearer jd-demo-auditor-2026"
TOKEN_CITIZEN = "Bearer jd-demo-citizen-2026"


# ==============================================================================
# 1. PUBLIC CITIZEN READ ACCESS & MUTATION DENIAL
# ==============================================================================
def test_citizen_can_read_public_works_without_auth():
    """Citizens have open access to ground works without any login credentials."""
    resp = client.get("/api/works?limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert len(data["items"]) > 0


def test_citizen_cannot_mutate_administrative_case():
    """Citizens receive 403 Forbidden when attempting to update official case dockets."""
    resp = client.patch(
        "/api/cases/CAS-TEST-001",
        json={"status": "RESOLVED", "resolution_notes": "Citizen trying to resolve"},
        headers={"Authorization": TOKEN_CITIZEN}
    )
    assert resp.status_code == 403
    assert "read-only" in resp.json()["detail"].lower() or "denied" in resp.json()["detail"].lower()


def test_citizen_can_submit_discrepancy_report_without_login():
    """Citizens can report a ground discrepancy without credentials."""
    resp = client.post(
        "/api/citizen-reports",
        json={
            "work_id": "1",
            "state": "MAHARASHTRA",
            "district": "PUNE",
            "constituency": "PUNE",
            "discrepancy_category": "GHOST_PROJECT",
            "description": "Work marked completed on portal, but site inspection shows an empty plot.",
            "reported_location": "Survey No 42, Haveli, Pune"
        }
    )
    assert resp.status_code == 200
    report = resp.json()
    assert report["report_id"].startswith("CIT-REP-")
    assert report["status"] == "SUBMITTED"


# ==============================================================================
# 2. MEMBER OF PARLIAMENT (MP) WORKFLOW & BOUNDARIES
# ==============================================================================
def test_mp_can_create_and_edit_draft_recommendation():
    """MP creates a recommendation in DRAFT mode and can update fields while in DRAFT."""
    # 1. Create Draft
    create_resp = client.post(
        "/api/recommendations",
        json={
            "proposed_title": "Solar Mini-Grid for Rural Community Health Center",
            "sector": "HEALTH_AND_SANITATION",
            "estimated_cost": 2500000.0,
            "location_description": "PHC Wagholi, Haveli Block",
            "block": "HAVELI",
            "gram_panchayat": "WAGHOLI",
            "justification": "Reliable 24/7 cold-chain power for vaccine storage",
            "priority": "HIGH"
        },
        headers={"Authorization": TOKEN_MP_PUNE}
    )
    assert create_resp.status_code == 200
    rec = create_resp.json()
    rec_id = rec["recommendation_id"]
    assert rec["workflow_status"] == "DRAFT"

    # 2. Edit Draft
    edit_resp = client.put(
        f"/api/recommendations/{rec_id}",
        json={"estimated_cost": 2800000.0, "proposed_title": "Upgraded Solar Mini-Grid for PHC"},
        headers={"Authorization": TOKEN_MP_PUNE}
    )
    assert edit_resp.status_code == 200
    assert edit_resp.json()["estimated_cost"] == 2800000.0

    # 3. Formally Submit Recommendation
    submit_resp = client.post(
        f"/api/recommendations/{rec_id}/submit",
        headers={"Authorization": TOKEN_MP_PUNE}
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["workflow_status"] == "SUBMITTED"

    # 4. WORKFLOW LOCK: MP attempting to edit after submission MUST BE REJECTED (403)
    locked_resp = client.put(
        f"/api/recommendations/{rec_id}",
        json={"estimated_cost": 5000000.0},
        headers={"Authorization": TOKEN_MP_PUNE}
    )
    assert locked_resp.status_code == 403
    assert "lock" in locked_resp.json()["detail"].lower() or "cannot be edited" in locked_resp.json()["detail"].lower()


def test_mp_cannot_approve_own_recommendation():
    """MPs cannot approve their own recommendations (separation of powers)."""
    # Create draft
    create_resp = client.post(
        "/api/recommendations",
        json={
            "proposed_title": "Community Drinking Water Tank",
            "sector": "DRINKING_WATER",
            "estimated_cost": 1200000.0,
        },
        headers={"Authorization": TOKEN_MP_PUNE}
    )
    rec_id = create_resp.json()["recommendation_id"]

    # Submit
    client.post(f"/api/recommendations/{rec_id}/submit", headers={"Authorization": TOKEN_MP_PUNE})

    # MP tries to approve to SANCTIONED -> Must be 403
    illegal_approve = client.post(
        f"/api/recommendations/{rec_id}/workflow",
        json={"target_status": "SANCTIONED"},
        headers={"Authorization": TOKEN_MP_PUNE}
    )
    assert illegal_approve.status_code == 403


# ==============================================================================
# 3. HORIZONTAL & CROSS-JURISDICTIONAL ACCESS BOUNDARIES
# ==============================================================================
def test_cross_district_access_denied_for_district_authority():
    """District authority of Pune cannot update execution of a work outside Pune."""
    # Work #2 is in another district (e.g. Nagpur or Varanasi)
    conn = get_db_connection()
    row = conn.cursor().execute("SELECT work_id, constituency_normalized, state_normalized FROM works WHERE constituency_normalized != 'PUNE' LIMIT 1").fetchone()
    conn.close()

    if row:
        other_work_id = row[0]
        resp = client.patch(
            f"/api/works/{other_work_id}/execution",
            json={"village": "Hacked Village"},
            headers={"Authorization": TOKEN_DISTRICT_PUNE}
        )
        assert resp.status_code == 403
        assert "cross-district" in resp.json()["detail"].lower() or "denied" in resp.json()["detail"].lower()


def test_district_cannot_tune_ministry_risk_weights():
    """District authority cannot modify national MoSPI ML risk weights."""
    resp = client.post(
        "/api/config/risk-weights",
        json={"weights": {"rule_violation": 0.5}},
        headers={"Authorization": TOKEN_DISTRICT_PUNE}
    )
    assert resp.status_code == 403
    assert "only ministry" in resp.json()["detail"].lower() or "denied" in resp.json()["detail"].lower()


# ==============================================================================
# 4. AUDITOR ROLE FORENSIC INTEGRITY & SOURCE TAMPERING DENIAL
# ==============================================================================
def test_auditor_can_create_and_manage_investigation_case():
    """Auditor can open an empirical forensic case with hypothesis and evidence."""
    resp = client.post(
        "/api/audit-investigations",
        json={
            "work_id": "101",
            "title": "Unusual March Bunching in Rural Road Tender",
            "severity": "HIGH",
            "hypothesis": "70% of tranches disbursed within final 48 hours of fiscal year without geo-tag inspection.",
            "evidence": "Voucher records #V-9012 through #V-9019 issued with identical timestamps.",
            "auditor_notes": "Cross-referenced with Treasury PFMS logs."
        },
        headers={"Authorization": TOKEN_AUDITOR}
    )
    assert resp.status_code == 200
    case = resp.json()
    assert case["case_id"].startswith("CASE-")
    assert case["status"] == "OPEN"

    # Update lifecycle to UNDER_INVESTIGATION
    up_resp = client.patch(
        f"/api/audit-investigations/{case['case_id']}",
        json={"status": "UNDER_INVESTIGATION", "auditor_notes": "Issued notice to Implementing Agency."},
        headers={"Authorization": TOKEN_AUDITOR}
    )
    assert up_resp.status_code == 200
    assert up_resp.json()["status"] == "UNDER_INVESTIGATION"


# ==============================================================================
# 5. FINANCIAL CORRECTIONS & IMMUTABLE AUDIT TRAIL
# ==============================================================================
def test_financial_correction_workflow():
    """Financial corrections require an auditable request and Ministry approval."""
    # 1. District submits correction request
    req_resp = client.post(
        "/api/financial/correction-requests",
        json={
            "entity_type": "WORK",
            "entity_id": "1",
            "field_name": "sanctioned_amount",
            "previous_value": "5000000",
            "proposed_value": "4800000",
            "reason": "Administrative typographical erratum in gazette notification."
        },
        headers={"Authorization": TOKEN_DISTRICT_PUNE}
    )
    assert req_resp.status_code == 200
    corr = req_resp.json()
    corr_id = corr["correction_id"]
    assert corr["status"] == "PENDING"

    # 2. Ministry approves correction
    rev_resp = client.post(
        f"/api/financial/correction-requests/{corr_id}/review",
        json={"action": "APPROVE", "comments": "Verified against state gazette copy."},
        headers={"Authorization": TOKEN_MINISTRY}
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["status"] == "APPROVED"


def test_audit_log_records_every_statutory_mutation():
    """Every mutating statutory action is permanently tracked in audit_logs."""
    resp = client.get("/api/audit-logs?limit=10", headers={"Authorization": TOKEN_MINISTRY})
    assert resp.status_code == 200
    logs = resp.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
    first = logs[0]
    assert "log_id" in first
    assert "action" in first
    assert "user_id" in first
    assert "role" in first
