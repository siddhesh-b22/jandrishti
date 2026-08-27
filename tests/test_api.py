import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# 1. Health & Stats Tests
def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "connected" in data["database"]
    assert data["version"] == "1.0.0"

def test_health_db_endpoint():
    response = client.get("/api/health/db")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "connected"
    assert data["storage_mode"] == "read_only_immutable_sqlite"
    assert data["metrics"]["mps"] == 778
    assert data["metrics"]["works"] == 102437
    assert data["metrics"]["transactions"] == 82296
    assert data["metrics"]["vendors"] == 22377
    assert data["metrics"]["anomalies"] == 1831
    assert data["metrics"]["reconciliation_variance"] == "₹0.00"

def test_houses_endpoint():
    response = client.get("/api/houses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    codes = [h["code"] for h in data]
    assert "ALL" in codes
    assert "LOK_SABHA" in codes
    assert "RAJYA_SABHA" in codes

def test_stats_endpoint():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_mps"] == 778
    assert data["total_transactions"] == 82296
    assert data["total_vendors"] == 22377
    assert data["total_anomalies"] == 1831
    assert "house_breakdown" in data
    assert data["house_breakdown"]["lok_sabha"]["total_mps"] == 543
    assert data["house_breakdown"]["rajya_sabha"]["total_mps"] == 235
    assert abs(data["house_breakdown"]["lok_sabha"]["total_allocated"] - 83062104294.53) < 1.0
    assert abs(data["house_breakdown"]["rajya_sabha"]["total_allocated"] - 33613347899.82) < 1.0

def test_stats_endpoint_filtered_ls():
    response = client.get("/api/stats?house=LOK_SABHA")
    assert response.status_code == 200
    data = response.json()
    assert data["total_mps"] == 543
    assert abs(data["total_allocated_amount"] - 83062104294.53) < 1.0

def test_stats_endpoint_filtered_rs():
    response = client.get("/api/stats?house=RAJYA_SABHA")
    assert response.status_code == 200
    data = response.json()
    assert data["total_mps"] == 235
    assert abs(data["total_allocated_amount"] - 33613347899.82) < 1.0

# 2. MP Endpoints Tests
def test_list_mps_default():
    response = client.get("/api/mps?limit=10&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 778
    assert len(data["items"]) == 10

def test_list_mps_filter_lok_sabha():
    response = client.get("/api/mps?house=LOK_SABHA&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 543
    for item in data["items"]:
        assert item["house"] == "Lok Sabha"

def test_list_mps_filter_rajya_sabha():
    response = client.get("/api/mps?house=RAJYA_SABHA&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 235
    for item in data["items"]:
        assert item["house"] == "Rajya Sabha"

def test_list_mps_filter_state():
    response = client.get("/api/mps?state=DELHI&house=LOK_SABHA")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 7
    for item in data["items"]:
        assert item["state_normalized"] == "DELHI"

def test_get_mp_detail_valid():
    response = client.get("/api/mps/INTERNAL_MP_001")
    assert response.status_code == 200
    data = response.json()
    assert data["internal_mp_id"] == "INTERNAL_MP_001"
    assert "top_vendors" in data
    assert "anomalies" in data

def test_get_rs_mp_detail_valid():
    response = client.get("/api/mps/INTERNAL_RS_MP_001")
    assert response.status_code == 200
    data = response.json()
    assert data["internal_mp_id"] == "INTERNAL_RS_MP_001"
    assert data["house"] == "Rajya Sabha"

def test_get_mp_detail_not_found():
    response = client.get("/api/mps/NONEXISTENT_MP_999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

# 3. Works Endpoints Tests
def test_list_works_pagination():
    response = client.get("/api/works?limit=25&offset=50")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 102437
    assert len(data["items"]) == 25

def test_list_works_filter_category():
    response = client.get("/api/works?category=Normal/Others&limit=10")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["category_normalized"] == "Normal/Others"

def test_get_work_detail_valid():
    response = client.get("/api/works/303957")
    assert response.status_code == 200
    data = response.json()
    assert data["work_id"] == 303957
    assert "mp_details" in data
    assert "anomalies" in data

def test_get_work_detail_not_found():
    response = client.get("/api/works/999999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

# 4. Transactions Endpoints Tests
def test_list_transactions_filter_mp():
    response = client.get("/api/transactions?mp_id=INTERNAL_MP_001&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert item["internal_mp_id"] == "INTERNAL_MP_001"

def test_get_transaction_detail_valid():
    response = client.get("/api/transactions/TXN_000001")
    assert response.status_code == 200
    data = response.json()
    assert data["internal_transaction_id"] == "TXN_000001"
    assert "anomalies" in data

def test_get_transaction_detail_not_found():
    response = client.get("/api/transactions/INVALID_TXN_999999")
    assert response.status_code == 404

# 5. Vendors Endpoints Tests
def test_list_vendors_filter_revenue():
    response = client.get("/api/vendors?min_revenue=10000000&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert item["total_received_amount"] >= 10000000

def test_get_vendor_detail_valid():
    response = client.get("/api/vendors/INTERNAL_VND_00001")
    assert response.status_code == 200
    data = response.json()
    assert data["internal_vendor_id"] == "INTERNAL_VND_00001"
    assert "recent_transactions" in data
    assert "anomalies" in data

def test_get_vendor_detail_not_found():
    response = client.get("/api/vendors/INVALID_VND_99999")
    assert response.status_code == 404

# 6. Anomalies Endpoints Tests
def test_list_anomalies_filter_severity():
    response = client.get("/api/anomalies?severity=CRITICAL")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 21
    for item in data["items"]:
        assert item["severity"] == "CRITICAL"
        assert "supporting_metrics" in item
        assert isinstance(item["supporting_metrics"], dict)

def test_list_anomalies_rajya_sabha():
    response = client.get("/api/anomalies?house=RAJYA_SABHA")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 27
    for item in data["items"]:
        assert item["anomaly_id"].startswith("ANOM_RS_")

def test_get_anomaly_detail_valid():
    response = client.get("/api/anomalies/ANOM_000001")
    assert response.status_code == 200
    data = response.json()
    assert data["anomaly_id"] == "ANOM_000001"
    assert data["detection_method"] != ""
    assert data["generated_at"] != ""

def test_get_anomaly_detail_not_found():
    response = client.get("/api/anomalies/INVALID_ANOM_999999")
    assert response.status_code == 404

# 7. Metadata / Aggregation Dimensions Tests
def test_states_endpoint():
    response = client.get("/api/states")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 36
    total_mps = sum(item["total_mps"] for item in data)
    assert total_mps == 778

def test_states_endpoint_rajya_sabha():
    response = client.get("/api/states?house=RAJYA_SABHA")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 32
    total_mps = sum(item["total_mps"] for item in data)
    assert total_mps == 235

def test_constituencies_endpoint():
    response = client.get("/api/constituencies?state=DELHI")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 7

def test_categories_endpoint():
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    total_works = sum(item["total_works"] for item in data)
    assert total_works == 102437

# 8. Validation & Boundary Tests
def test_invalid_query_limit_boundary():
    response = client.get("/api/works?limit=500")
    assert response.status_code == 422

def test_invalid_sort_order():
    response = client.get("/api/mps?sort_order=invalid_direction")
    assert response.status_code == 422

def test_empty_results_query():
    response = client.get("/api/works?search=XYZ_NON_EXISTENT_STRING_999")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["items"]) == 0
