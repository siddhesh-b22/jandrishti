"""
JanDrishti — Automated Tests for Universal Official Data Discovery, Snapshots & Change Detection
"""

from fastapi.testclient import TestClient
from backend.main import app
from backend.data_sources.source_registry import source_registry_service
from backend.data_sources.connector import ResilientConnector

client = TestClient(app)

def test_source_registry_service():
    sources = source_registry_service.list_sources()
    assert len(sources) >= 9
    summary = source_registry_service.get_source_health_summary()
    assert summary["total_registered_sources"] >= 9
    assert summary["public_access_rate_pct"] < 100.0

def test_discovered_sources_endpoint():
    res = client.get("/api/sources/discovered")
    assert res.status_code == 200
    data = res.json()
    assert data["total_sources"] >= 9
    assert "health_summary" in data
    assert len(data["sources"]) >= 9
    # Verify presence of e-SAKSHI macro endpoint
    esakshi = [s for s in data["sources"] if s["source_id"] == "SRC_MOSPI_TILES"]
    assert len(esakshi) == 1
    assert esakshi[0]["public_access"] is True
    assert esakshi[0]["tier"] == "TIER_1_API"
    assert esakshi[0]["verification_status"] == "VERIFIED_LIVE"

def test_discovered_sources_filtered():
    res = client.get("/api/sources/discovered?tier=TIER_1_API")
    assert res.status_code == 200
    data = res.json()
    assert data["total_sources"] >= 4
    for s in data["sources"]:
        assert s["tier"] == "TIER_1_API"

def test_historical_snapshots_endpoint():
    res = client.get("/api/snapshots")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 3
    snap = data["items"][0]
    assert "snapshot_id" in snap
    assert "checksum_sha256" in snap
    assert "record_count" in snap

def test_change_events_endpoint():
    res = client.get("/api/changes?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 100
    assert len(data["items"]) == 10
    evt = data["items"][0]
    assert "event_id" in evt
    assert "change_type" in evt
    assert "severity" in evt
    assert "finding_summary" in evt

def test_change_events_filtered_type():
    res = client.get("/api/changes?change_type=COST_REVISED&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    for it in data["items"]:
        assert it["change_type"] == "COST_REVISED"

def test_reconciliation_endpoint():
    res = client.get("/api/reconciliation")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 35
    assert data["matched_count"] >= 30
    assert data["gap_count"] >= 2
    rec = data["items"][0]
    assert "reconciliation_id" in rec
    assert "status" in rec
    assert "variance_summary" in rec

def test_work_risk_summary_endpoint():
    res = client.get("/api/works/817/risk-summary")
    assert res.status_code == 200
    data = res.json()
    assert data["work_id"] == 817
    assert "overall_risk_level" in data
    assert "risk_score" in data
    assert "headline_finding" in data
    assert "statutory_citations" in data
    assert "recommended_action" in data

def test_resilient_connector_cache():
    connector = ResilientConnector(min_interval_seconds=0.01, cache_ttl_seconds=10.0)
    # Put manual item in cache
    cache_key = "GET:https://example.gov.in/test:None"
    connector._cache[cache_key] = {
        "data": {"status": "ok", "cached": True},
        "timestamp": 9999999999.0
    }
    result = connector.fetch_json("https://example.gov.in/test", method="GET", use_cache=True)
    assert result["cached"] is True

def test_lgd_districts_endpoint():
    res = client.get("/api/lgd/districts?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 500
    assert len(data["items"]) == 10
    dist = data["items"][0]
    assert "lgd_district_code" in dist
    assert "lgd_state_code" in dist
    assert "district_name" in dist

def test_mp_crosswalk_endpoint():
    # Pick first MP from mps table
    res = client.get("/api/mps/INTERNAL_MP_001/crosswalk")
    assert res.status_code == 200
    data = res.json()
    assert data["internal_mp_id"] == "INTERNAL_MP_001"
    assert "mospi_internal_id" in data
    assert "official_caption" in data
    assert "verified_source" in data

def test_mp_crosswalk_not_found():
    res = client.get("/api/mps/INVALID_MP_99999/crosswalk")
    assert res.status_code == 404

def test_snapshot_sync_citizen_forbidden():
    # Calling POST /api/snapshots/sync as CITIZEN role receives HTTP 403 Forbidden
    res = client.post("/api/snapshots/sync", headers={"X-Demo-Role": "CITIZEN"})
    assert res.status_code == 403
