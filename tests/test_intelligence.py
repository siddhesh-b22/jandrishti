import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_duplicate_works_endpoint():
    response = client.get("/api/intelligence/duplicates?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        item = data[0]
        assert "pair_id" in item
        assert "similarity_score" in item
        assert "work_a" in item
        assert "work_b" in item
        assert "reasons" in item
        assert item["similarity_score"] >= 0.50

def test_progress_mismatch_endpoint():
    response = client.get("/api/intelligence/progress-mismatch?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    if len(data["items"]) > 0:
        item = data["items"][0]
        assert "financial_progress_pct" in item
        assert "physical_progress_pct" in item
        assert "divergence_index" in item
        assert item["divergence_index"] >= 0

def test_delay_predictions_endpoint():
    response = client.get("/api/intelligence/delay-predictions?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    if len(data["items"]) > 0:
        item = data["items"][0]
        assert "delay_probability" in item
        assert "category_benchmark_days" in item
        assert "schedule_deviation_ratio" in item
        assert 0.0 <= item["delay_probability"] <= 1.0

def test_work_intelligence_profile_endpoint():
    response = client.get("/api/intelligence/works/1/profile")
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        data = response.json()
        assert "progress" in data
        assert "delay_prediction" in data
        assert "compliance" in data
        assert "risk_assessment" in data
        assert "overall_score" in data["risk_assessment"]

def test_data_quality_endpoint():
    response = client.get("/api/intelligence/data-quality")
    assert response.status_code == 200
    data = response.json()
    assert "overall_health_score" in data
    assert data["overall_health_score"] > 80.0
    assert "metrics" in data
    assert data["metrics"]["total_works_audited"] == 102437
    assert data["metrics"]["total_vouchers_audited"] == 82296

def test_case_management_lifecycle():
    # 1. List cases
    list_res = client.get("/api/cases?limit=10")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 5
    first_case_id = list_data["items"][0]["case_id"]

    # 2. Get case detail
    detail_res = client.get(f"/api/cases/{first_case_id}")
    assert detail_res.status_code == 200
    case_detail = detail_res.json()
    assert case_detail["case_id"] == first_case_id
    assert "audit_trail" in case_detail

    # 3. Create a new case
    new_case_payload = {
        "entity_type": "WORK",
        "entity_id": "999999",
        "title": "Automated Unit Test Risk Case",
        "severity": "HIGH",
        "risk_score": 85.0,
        "category": "TEST_CATEGORY",
        "assigned_to": "Test Auditor",
        "assigned_role": "DISTRICT_AUTHORITY",
        "notes": "Testing programmatic case creation."
    }
    create_res = client.post("/api/cases", json=new_case_payload)
    assert create_res.status_code == 201
    created_case = create_res.json()
    new_id = created_case["case_id"]
    assert created_case["status"] == "NEW"

    # 4. Patch status
    patch_res = client.patch(f"/api/cases/{new_id}", json={
        "new_status": "UNDER_REVIEW",
        "user": "Senior Auditor",
        "role": "MINISTRY_OFFICIAL",
        "notes": "Audit initiated by ministry."
    })
    assert patch_res.status_code == 200
    patched_case = patch_res.json()
    assert patched_case["status"] == "UNDER_REVIEW"

    # 5. Check global audit trail
    trail_res = client.get("/api/cases/audit-trail?limit=10")
    assert trail_res.status_code == 200
    trail_data = trail_res.json()
    assert len(trail_data) > 0
    assert any(log["case_id"] == new_id for log in trail_data)
