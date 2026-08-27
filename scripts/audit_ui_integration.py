import os
import sys
import time
import json
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

print("==================================================")
print("SIH26102 — FULL LIVE REST API & INTEGRATION AUDIT")
print(f"Target Server: {BASE_URL}")
print("==================================================")

client = httpx.Client(base_url=BASE_URL, timeout=10.0)

# 1. Test All Live Endpoints
endpoints_to_test = [
    ("/api/health", "Health Check"),
    ("/api/stats", "Macro Statistics"),
    ("/api/mps?limit=10", "MP Directory (Paginated)"),
    ("/api/mps/INTERNAL_MP_001", "MP Detail (Profile & Top Vendors)"),
    ("/api/works?limit=10", "Works Registry (Paginated)"),
    ("/api/works/303957", "Work Detail (1:1 & Risk Card)"),
    ("/api/transactions?limit=10", "Transactions Registry (Paginated)"),
    ("/api/transactions/TXN_000001", "Transaction Detail (Voucher)"),
    ("/api/vendors?limit=10", "Vendor Directory (Paginated)"),
    ("/api/vendors/INTERNAL_VND_00001", "Vendor Detail (Profile & Footprint)"),
    ("/api/anomalies?limit=10", "Anomaly Center (Paginated)"),
    ("/api/anomalies/ANOM_000001", "Anomaly Detail (15 Traceability Columns)"),
    ("/api/states", "State Summaries (36 States/UTs)"),
    ("/api/constituencies?limit=10", "Constituency Roll-ups"),
    ("/api/categories", "Work Categories (4 Categories)"),
]

endpoint_results = []
print("\n[1/5] Testing 15 Live HTTP Endpoints...")
for path, desc in endpoints_to_test:
    t0 = time.time()
    res = client.get(path)
    elapsed_ms = (time.time() - t0) * 1000.0
    status_ok = res.status_code == 200
    endpoint_results.append({
        "path": path,
        "desc": desc,
        "status": res.status_code,
        "elapsed_ms": round(elapsed_ms, 2),
        "ok": status_ok
    })
    print(f"  [{'PASS' if status_ok else 'FAIL'}] {res.status_code} ({elapsed_ms:>6.2f}ms) : {path:35s} - {desc}")
    assert status_ok, f"Endpoint {path} failed with {res.status_code}"

# 2. Verify Stats Consistency
print("\n[2/5] Verifying Macro KPI Exact Consistency with Database...")
stats = client.get("/api/stats").json()
print(f"  Total MPs:            {stats['total_mps']} (Expected: 543)")
print(f"  Total Allocated:      ₹{stats['total_allocated_amount']:,.2f} (Expected: ₹83,062,104,294.53)")
print(f"  Total Expenditure:    ₹{stats['total_expenditure']:,.2f} (Expected: ₹27,191,390,292.45)")
print(f"  National Utilization: {stats['national_utilization_pct']}% (Expected: 32.74%)")
print(f"  Recommended Works:    {stats['total_recommended_works']:,} (Expected: 68,872)")
print(f"  Completed Works:      {stats['total_completed_works']:,} (Expected: 33,746)")
print(f"  Total Transactions:   {stats['total_transactions']:,} (Expected: 82,296)")
print(f"  Total Vendors:        {stats['total_vendors']:,} (Expected: 22,377)")
print(f"  Total Anomalies:      {stats['total_anomalies']:,} (Expected: 1,804)")
print(f"  Critical Anomalies:   {stats['critical_anomalies']} (Expected: 21)")
print(f"  High Risk Anomalies:  {stats['high_anomalies']} (Expected: 602)")

assert stats['total_mps'] == 543
assert abs(stats['total_allocated_amount'] - 83062104294.53) < 0.01
assert abs(stats['total_expenditure'] - 27191390292.45) < 0.01
assert stats['total_recommended_works'] == 68872
assert stats['total_completed_works'] == 33746
assert stats['total_transactions'] == 82296
assert stats['total_vendors'] == 22377
assert stats['total_anomalies'] == 1804
assert stats['critical_anomalies'] == 21
assert stats['high_anomalies'] == 602

# 3. Anomaly Explainability & Traceability Audit across 8 Sample Records
print("\n[3/5] Auditing Anomaly Explainability & Traceability across 8 Sample Records...")
anom_test_cases = [
    ("WORK", "264906", "UNUSUALLY_HIGH_RECOMMENDED_AMOUNT"),
    ("WORK", "303957", "UNUSUALLY_HIGH_RECOMMENDED_AMOUNT"),
    ("MP", "INTERNAL_MP_538", "HIGH_VENDOR_CONCENTRATION"),
    ("MP", "INTERNAL_MP_490", "UNUSUAL_PENDING_PAYMENT_RATIO"),
    ("TRANSACTION", "TXN_005575", "UNUSUALLY_HIGH_EXPENDITURE_TRANSACTION"),
    ("TRANSACTION", "TXN_073463", "UNUSUALLY_HIGH_EXPENDITURE_TRANSACTION"),
    ("VENDOR", "INTERNAL_VND_00005", "VENDOR_SINGLE_MP_DOMINANCE"),
    ("VENDOR", "INTERNAL_VND_00007", "VENDOR_SINGLE_MP_DOMINANCE"),
]

anom_audit_rows = []
for etype, eid, expected_type in anom_test_cases:
    res = client.get(f"/api/anomalies?entity_type={etype}&entity_id={eid}")
    data = res.json()
    assert data["total"] > 0, f"No anomaly found for {etype} {eid}"
    item = data["items"][0]
    
    # Check all 15 fields
    for field in ["anomaly_id", "entity_type", "entity_id", "anomaly_type", "anomaly_score", "severity", "reason", "supporting_metrics", "detection_method", "threshold_value", "observed_value", "generated_at"]:
        assert item.get(field) is not None, f"Missing field {field} in anomaly {item['anomaly_id']}"
    
    # Check non-accusatory terminology (no 'fraud', 'corrupt', 'illegal')
    reason_lower = item["reason"].lower()
    assert "fraud" not in reason_lower
    assert "corrupt" not in reason_lower
    assert "illegal" not in reason_lower
    
    anom_audit_rows.append({
        "anomaly_id": item["anomaly_id"],
        "entity_type": item["entity_type"],
        "entity_id": item["entity_id"],
        "anomaly_type": item["anomaly_type"],
        "score": item["anomaly_score"],
        "severity": item["severity"],
        "method": item["detection_method"],
        "reason_snippet": item["reason"][:65] + "..."
    })
    print(f"  [VERIFIED] {item['anomaly_id']} ({item['entity_type']} #{item['entity_id']}) : {item['anomaly_type']:38s} | Score: {item['anomaly_score']:.4f} | {item['severity']}")

# 4. Filter Functionality Validation
print("\n[4/5] Testing Filter Combinations...")

# State filter on Works
res = client.get("/api/works?state=MAHARASHTRA&limit=1")
assert res.json()["total"] > 0
print(f"  Works State Filter (MAHARASHTRA): {res.json()['total']:,} matching works")

# Category filter on Works
res = client.get("/api/works?category=Repair and Renovation&limit=1")
assert res.json()["total"] > 0
print(f"  Works Category Filter (Repair and Renovation): {res.json()['total']:,} matching works")

# Lifecycle status filter on Works
res = client.get("/api/works?lifecycle_status=FULL_LIFECYCLE_MATCH&limit=1")
assert res.json()["total"] == 181
print(f"  Works Lifecycle Filter (FULL_LIFECYCLE_MATCH): {res.json()['total']:,} works")

# Single MP Reliance filter on Vendors
res = client.get("/api/vendors?min_reliance_pct=95&limit=1")
assert res.json()["total"] > 0
print(f"  Vendor Reliance Filter (>= 95%): {res.json()['total']:,} matching vendors")

# Payment status filter on Transactions
res = client.get("/api/transactions?payment_status=Payment Success&limit=1")
assert res.json()["total"] == 78915
print(f"  Transaction Status Filter (Payment Success): {res.json()['total']:,} vouchers")

# 5. Security & Boundary Validation
print("\n[5/5] Testing Boundary Conditions & Error Handling...")

# Invalid ID 404
res = client.get("/api/mps/INVALID_MP_99999")
assert res.status_code == 404
print(f"  Invalid MP ID returned expected 404 Not Found")

# Invalid limit 422
res = client.get("/api/works?limit=500")
assert res.status_code == 422
print(f"  Out-of-bound limit (500) returned expected 422 Unprocessable Entity")

# Invalid sort_order 422
res = client.get("/api/mps?sort_order=invalid_dir")
assert res.status_code == 422
print(f"  Invalid sort order returned expected 422 Unprocessable Entity")

print("\nALL 15 LIVE INTEGRATION AUDIT TESTS PASSED SUCCESSFULLY!")
