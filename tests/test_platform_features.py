"""
Tests for JanDrishti MPLADS Platform Features:
- RBAC with 4 Primary Roles (Ministry Admin, State Nodal Authority, District Authority, MP)
- Data Ingestion & Validation Workflow (Upload, Preview, Error Detection, Confirmation)
- Transparent Multi-Tier Risk Engine & On-Demand Explainable Assessment
- Alert System Lifecycle (List, Detail, Acknowledge, Assign, Comment, Resolve)
- Role Dashboards (National, State, District, MP, Trends)
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# -------------------------------------------------------------
# 1. RBAC & CREDENTIALS
# -------------------------------------------------------------

def test_rbac_roles_and_tokens():
    # Ministry Admin
    res_min = client.get("/api/dashboards/national", headers={"X-Demo-Role": "MINISTRY_ADMIN"})
    assert res_min.status_code == 200
    assert res_min.json()["scope"] == "NATIONAL_MOSPI"

    # State Nodal Authority
    res_state = client.get("/api/dashboards/state/MAHARASHTRA", headers={"X-Demo-Role": "STATE_NODAL_AUTHORITY"})
    assert res_state.status_code == 200
    assert res_state.json()["scope"] == "STATE_NODAL_AUTHORITY"

    # District Authority
    res_dist = client.get("/api/dashboards/district/PUNE", headers={"X-Demo-Role": "DISTRICT_AUTHORITY"})
    assert res_dist.status_code == 200
    assert res_dist.json()["scope"] == "DISTRICT_AUTHORITY"

    # Member of Parliament — Pune constituency (Murlidhar Mohol)
    res_mp = client.get("/api/dashboards/mp/INTERNAL_MP_278", headers={"X-Demo-Role": "MP"})
    assert res_mp.status_code == 200
    assert res_mp.json()["scope"] == "MEMBER_OF_PARLIAMENT"


# -------------------------------------------------------------
# 2. DATA INGESTION & VALIDATION WORKFLOW (Req 5)
# -------------------------------------------------------------

def test_ingest_template_download():
    res = client.get("/api/ingest/template")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "project_id,project_name,state,district" in res.text

def test_ingest_validation_detects_errors():
    # Test batch with intentional errors
    test_rows = [
        {
            "project_id": "TEST_INVALID_01",
            "project_name": "Test Drainage",
            "state": "MAHARASHTRA",
            "district": "PUNE",
            "sanctioned_amount": 1000000.0,
            "expenditure": -50000.0,  # Negative expenditure
            "physical_progress": 30.0
        },
        {
            "project_id": "",  # Missing project ID
            "project_name": "Test Road",
            "state": "MAHARASHTRA",
            "district": "PUNE",
            "sanctioned_amount": 500000.0,
            "expenditure": 200000.0,
            "physical_progress": 150.0  # Invalid progress > 100
        },
        {
            "project_id": "TEST_VALID_02",
            "project_name": "Test Solar Lighting",
            "state": "MAHARASHTRA",
            "district": "PUNE",
            "sanctioned_amount": 800000.0,
            "expenditure": 750000.0,
            "physical_progress": 95.0
        }
    ]

    res = client.post(
        "/api/ingest/validate-json",
        json=test_rows,
        headers={"X-Demo-Role": "DISTRICT_AUTHORITY"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] == 3
    assert data["valid_count"] == 1
    assert data["invalid_count"] == 2
    assert data["error_count"] >= 2
    assert any(i["error_type"] == "NEGATIVE_EXPENDITURE" for i in data["issues"])
    assert any(i["error_type"] == "MISSING_PROJECT_ID" for i in data["issues"])
    assert any(i["error_type"] == "INVALID_PROGRESS_RANGE" for i in data["issues"])

def test_ingest_sample_demo_batch():
    res = client.post(
        "/api/ingest/sample-demo",
        headers={"X-Demo-Role": "DISTRICT_AUTHORITY"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] >= 5
    assert data["valid_count"] >= 4
    assert data["batch_id"].startswith("BATCH-")

def test_ingest_confirm_workflow():
    # 1. Validate sample batch
    val_res = client.post(
        "/api/ingest/sample-demo",
        headers={"X-Demo-Role": "DISTRICT_AUTHORITY"}
    )
    batch_id = val_res.json()["batch_id"]

    # 2. Confirm import
    conf_res = client.post(
        "/api/ingest/confirm",
        json={"batch_id": batch_id},
        headers={"X-Demo-Role": "DISTRICT_AUTHORITY"}
    )
    assert conf_res.status_code == 200
    data = conf_res.json()
    assert data["imported_count"] >= 4
    assert data["alerts_created"] >= 1
    assert data["status"] == "COMPLETED"


# -------------------------------------------------------------
# 3. RISK ENGINE & ON-DEMAND ASSESSMENT (Req 6, 8, 9, 10, 11, 12)
# -------------------------------------------------------------

def test_get_and_update_risk_weights():
    # Get config
    res = client.get("/api/config/risk-weights")
    assert res.status_code == 200
    data = res.json()
    assert "weights" in data
    assert "rule_violation" in data["weights"]

    # Update weights
    update_res = client.post(
        "/api/config/risk-weights",
        json={"weights": {"rule_violation": 0.30, "statistical_anomaly": 0.20, "ml_isolation_forest": 0.10, "delay_risk": 0.15, "cost_deviation": 0.10, "expenditure_progress_mismatch": 0.15}},
        headers={"X-Demo-Role": "MINISTRY_ADMIN"}
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["weights"]["rule_violation"] == 0.30

def test_assess_work_risk_on_demand():
    works_res = client.get("/api/works?limit=1")
    assert works_res.status_code == 200
    work_id = works_res.json()["items"][0]["work_id"]
    res = client.post(f"/api/works/{work_id}/assess-risk")
    assert res.status_code == 200
    data = res.json()
    assert "risk_score" in data
    assert 0 <= data["risk_score"] <= 100
    assert data["risk_level"] in ("LOW", "MEDIUM", "HIGH", "CRITICAL")
    assert "explainable_reasons" in data
    assert len(data["explainable_reasons"]) > 0
    assert "ml_anomaly" in data
    assert "disclaimer" in data



# -------------------------------------------------------------
# 4. ALERTS & INVESTIGATION LIFECYCLE (Req 13, 18, 22)
# -------------------------------------------------------------

def test_list_alerts():
    res = client.get("/api/alerts?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert data["total"] > 0
    item = data["items"][0]
    assert "alert_id" in item
    assert "severity" in item
    assert "evidence_parsed" in item

def test_alert_lifecycle_workflow():
    # 1. Get alert
    list_res = client.get("/api/alerts?limit=1")
    alert_id = list_res.json()["items"][0]["alert_id"]

    # 2. Detail
    det_res = client.get(f"/api/alerts/{alert_id}")
    assert det_res.status_code == 200
    assert det_res.json()["alert_id"] == alert_id
    assert "audit_trail" in det_res.json()

    # 3. Acknowledge and Assign
    patch_res = client.patch(
        f"/api/alerts/{alert_id}",
        json={
            "status": "UNDER_INVESTIGATION",
            "assigned_to": "Executive Engineer (Nodal Office)",
            "reviewer_comment": "Site verification team assigned to inspect road layers."
        },
        headers={"X-Demo-Role": "DISTRICT_AUTHORITY"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "UNDER_INVESTIGATION"
    assert patch_res.json()["assigned_to"] == "Executive Engineer (Nodal Office)"

    # 4. Mark Resolved
    resolve_res = client.patch(
        f"/api/alerts/{alert_id}",
        json={
            "status": "RESOLVED",
            "reviewer_comment": "Physical milestone verified on site. Rectification complete."
        },
        headers={"X-Demo-Role": "DISTRICT_AUTHORITY"}
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"
    assert resolve_res.json()["resolved_at"] is not None

def test_alerts_summary():
    res = client.get("/api/alerts/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_alerts" in data
    assert "by_severity" in data
    assert "by_status" in data


# -------------------------------------------------------------
# 5. ROLE DASHBOARDS & TRENDS (Req 14, 15)
# -------------------------------------------------------------

def test_national_dashboard():
    res = client.get("/api/dashboards/national")
    assert res.status_code == 200
    data = res.json()
    assert data["scope"] == "NATIONAL_MOSPI"
    assert "kpis" in data
    assert data["kpis"]["total_projects"] > 0
    assert "state_comparisons" in data
    assert len(data["state_comparisons"]) > 0

def test_state_dashboard():
    res = client.get("/api/dashboards/state/MAHARASHTRA")
    assert res.status_code == 200
    data = res.json()
    assert data["scope"] == "STATE_NODAL_AUTHORITY"
    assert data["state"] == "MAHARASHTRA"
    assert "summary" in data
    assert "districts" in data
    assert "high_risk_projects" in data

def test_district_dashboard():
    res = client.get("/api/dashboards/district/PUNE")
    assert res.status_code == 200
    data = res.json()
    assert data["scope"] == "DISTRICT_AUTHORITY"
    assert data["district"] == "PUNE"
    assert "mp_info" in data
    assert "works" in data

def test_mp_dashboard():
    # Pune MP — Murlidhar Mohol (INTERNAL_MP_278)
    res = client.get("/api/dashboards/mp/INTERNAL_MP_278")
    assert res.status_code == 200
    data = res.json()
    assert data["scope"] == "MEMBER_OF_PARLIAMENT"
    assert "mp_profile" in data
    assert "works" in data

def test_dashboard_trends():
    res = client.get("/api/dashboards/trends?period=monthly")
    assert res.status_code == 200
    data = res.json()
    assert "expenditure_timeline" in data
    assert "completion_timeline" in data
    assert "anomaly_distribution" in data
    assert "alert_lifecycle_distribution" in data
