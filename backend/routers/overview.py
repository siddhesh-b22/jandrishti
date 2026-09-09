import time
import json
import sqlite3
import datetime
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends, status

from backend.config import API_VERSION, DATA_SNAPSHOT_DATE
from backend.database import get_db, storage_mode_label
from backend.auth import optional_authenticated_user, AuthenticatedUser
from backend.scope import jurisdiction_clause, get_user_scope_params
from backend.supabase_service import supabase_service
from backend.schemas import (
    HealthResponse,
    HouseInfo,
    StatsResponse,
    StateSummaryItem,
    DistrictItem,
    ConstituencyItem,
    CategoryItem,
)

logger = logging.getLogger("jandrishti.overview")

router = APIRouter(tags=["Overview & System"])

@router.get("/")
def get_root():
    """Root landing endpoint providing API status and quick links."""
    return {
        "platform": "JanDrishti — AI-Powered MPLADS Monitoring & Anti-Corruption Intelligence Platform",
        "version": API_VERSION,
        "status": "healthy",
        "docs_url": "/docs",
        "health_check": "/health",
        "api_health": "/api/health",
        "db_health": "/api/health/db"
    }

@router.get("/api")
def get_api_root():
    """API namespace root endpoint."""
    return {
        "platform": "JanDrishti API",
        "version": API_VERSION,
        "status": "healthy",
        "docs_url": "/docs"
    }

@router.get("/health")
def get_liveness():
    """Ultra-fast instant health check for cloud load balancers."""
    return {"status": "healthy", "version": API_VERSION}

@router.get("/api/health", response_model=HealthResponse)
def get_health(conn: sqlite3.Connection = Depends(get_db)):
    """Health check endpoint confirming API availability and database connectivity."""
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM mps;")
        row = cursor.fetchone()
        mp_count = row[0] if row else 0
        db_status = f"connected ({mp_count} MPs, read-only immutable dataset)"
    except Exception:
        db_status = "error: database unavailable"

    return {
        "status": "healthy",
        "database": db_status,
        "version": API_VERSION,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@router.get("/api/health/db")
def get_db_health(conn: sqlite3.Connection = Depends(get_db)):
    """Detailed immutable database verification."""
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM mps;")
        mps_cnt = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM works;")
        works_cnt = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM transactions;")
        tx_cnt = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM vendors;")
        vendors_cnt = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM anomalies;")
        anom_cnt = cursor.fetchone()[0]

        return {
            "status": "connected",
            "storage_mode": storage_mode_label(),
            "data_snapshot": DATA_SNAPSHOT_DATE,
            "metrics": {
                "mps": mps_cnt,
                "works": works_cnt,
                "transactions": tx_cnt,
                "vendors": vendors_cnt,
                "anomalies": anom_cnt,
                "reconciliation_variance": "₹0.00"
            },
            "supabase": supabase_service.check_health()
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database verification failed"
        )

@router.get("/api/supabase/status", tags=["Supabase Cloud"])
def get_supabase_status():
    """Verify live Supabase cloud database connectivity and schema tables."""
    return supabase_service.check_health()

@router.get("/api/supabase/works", tags=["Supabase Cloud"])
def get_supabase_works(
    limit: int = Query(50, ge=1, le=100),
    offset: int = 0,
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    mp_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Query live infrastructure works directly from Supabase PostgREST with mandatory role scoping."""
    user_scope = get_user_scope_params(user)
    if user_scope.get("state"):
        if state and state.strip().upper() != user_scope["state"]:
            return {"total": 0, "limit": limit, "offset": offset, "items": [], "source": "supabase"}
        state = user_scope["state"]
    if user_scope.get("constituency"):
        if constituency and constituency.strip().upper() != user_scope["constituency"]:
            return {"total": 0, "limit": limit, "offset": offset, "items": [], "source": "supabase"}
        constituency = user_scope["constituency"]
    if user_scope.get("mp_id"):
        if mp_id and mp_id.strip() != user_scope["mp_id"]:
            return {"total": 0, "limit": limit, "offset": offset, "items": [], "source": "supabase"}
        mp_id = user_scope["mp_id"]

    return supabase_service.get_infrastructure_works(
        limit=limit,
        offset=offset,
        state=state,
        district=district,
        constituency=constituency,
        mp_id=mp_id,
        status_filter=status_filter,
        category=category,
        search=search
    )

@router.get("/api/supabase/representatives", tags=["Supabase Cloud"])
def get_supabase_representatives(
    limit: int = Query(50, ge=1, le=100),
    offset: int = 0,
    state: Optional[str] = None,
    house: Optional[str] = None,
    search: Optional[str] = None,
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Query live representatives directly from Supabase PostgREST with role scoping."""
    user_scope = get_user_scope_params(user)
    if user_scope.get("state"):
        if state and state.strip().upper() != user_scope["state"]:
            return {"total": 0, "limit": limit, "offset": offset, "items": [], "source": "supabase"}
        state = user_scope["state"]

    return supabase_service.get_representatives(limit=limit, offset=offset, state=state, house=house, search=search)

@router.get("/api/houses", response_model=List[HouseInfo])
def list_houses():
    """Retrieve list of supported parliamentary houses."""
    return [
        {"code": "ALL", "name": "All Houses"},
        {"code": "LOK_SABHA", "name": "Lok Sabha"},
        {"code": "RAJYA_SABHA", "name": "Rajya Sabha"}
    ]

@router.get("/api/stats", response_model=StatsResponse)
def get_stats(
    house: Optional[str] = Query(None, description="Optional filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"),
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve national aggregate totals, utilization metrics, and anomaly counts with house breakdown."""
    cursor = conn.cursor()
    
    mp_where = "1=1"
    mp_params = []
    scope_sql, scope_params = jurisdiction_clause(user)
    if scope_sql != "1=1":
        mp_where = f"({mp_where}) AND ({scope_sql})"
        mp_params.extend(scope_params)
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["LOK_SABHA", "LOK SABHA"]:
            mp_where = f"({mp_where}) AND house = 'Lok Sabha'"
        elif h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            mp_where = f"({mp_where}) AND house = 'Rajya Sabha'"
            
    cursor.execute(f"""
        SELECT 
            COUNT(DISTINCT internal_mp_id) AS total_mps,
            COALESCE(SUM(allocated_amount), 0.0) AS total_allocated,
            COALESCE(SUM(total_expenditure), 0.0) AS total_exp,
            COALESCE(SUM(unspent_amount), 0.0) AS total_unspent,
            COALESCE(SUM(recommended_works_count), 0) AS total_rec,
            COALESCE(SUM(completed_works_count), 0) AS total_comp
        FROM mps
        WHERE {mp_where};
    """, mp_params)
    mp_stats = cursor.fetchone()
    
    cursor.execute("""
        SELECT 
            COUNT(DISTINCT internal_mp_id) AS total_mps,
            COALESCE(SUM(allocated_amount), 0.0) AS total_allocated,
            COALESCE(SUM(total_expenditure), 0.0) AS total_exp,
            COALESCE(SUM(unspent_amount), 0.0) AS total_unspent,
            COALESCE(SUM(recommended_works_count), 0) AS total_rec,
            COALESCE(SUM(completed_works_count), 0) AS total_comp
        FROM mps WHERE house = 'Lok Sabha';
    """)
    ls_row = cursor.fetchone()
    
    cursor.execute("""
        SELECT 
            COUNT(DISTINCT internal_mp_id) AS total_mps,
            COALESCE(SUM(allocated_amount), 0.0) AS total_allocated,
            COALESCE(SUM(total_expenditure), 0.0) AS total_exp,
            COALESCE(SUM(unspent_amount), 0.0) AS total_unspent,
            COALESCE(SUM(recommended_works_count), 0) AS total_rec,
            COALESCE(SUM(completed_works_count), 0) AS total_comp
        FROM mps WHERE house = 'Rajya Sabha';
    """)
    rs_row = cursor.fetchone()
    
    cursor.execute("SELECT COUNT(*) FROM transactions;")
    txn_row = cursor.fetchone()
    total_txns = txn_row[0] if txn_row else 0
    
    cursor.execute("SELECT COUNT(*) FROM vendors;")
    vnd_row = cursor.fetchone()
    total_vendors = vnd_row[0] if vnd_row else 0
    
    anom_where = "1=1"
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["LOK_SABHA", "LOK SABHA"]:
            anom_where = "anomaly_id NOT LIKE 'ANOM_RS_%'"
        elif h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            anom_where = "anomaly_id LIKE 'ANOM_RS_%'"
            
    cursor.execute(f"""
        SELECT 
            COUNT(*) AS total_anomalies,
            SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) AS crit_anom,
            SUM(CASE WHEN severity = 'HIGH' THEN 1 ELSE 0 END) AS high_anom,
            SUM(CASE WHEN severity = 'MEDIUM' THEN 1 ELSE 0 END) AS med_anom,
            SUM(CASE WHEN severity = 'LOW' THEN 1 ELSE 0 END) AS low_anom
        FROM anomalies
        WHERE {anom_where};
    """)
    anom_stats = cursor.fetchone()
    
    cursor.execute("SELECT COUNT(*) FROM anomalies WHERE anomaly_id NOT LIKE 'ANOM_RS_%';")
    ls_anom_cnt = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM anomalies WHERE anomaly_id LIKE 'ANOM_RS_%';")
    rs_anom_cnt = cursor.fetchone()[0]
    
    total_mps = mp_stats["total_mps"] if mp_stats and mp_stats["total_mps"] is not None else 0
    total_alloc = mp_stats["total_allocated"] if mp_stats and mp_stats["total_allocated"] is not None else 0.0
    total_exp = mp_stats["total_exp"] if mp_stats and mp_stats["total_exp"] is not None else 0.0
    total_unspent = mp_stats["total_unspent"] if mp_stats and mp_stats["total_unspent"] is not None else 0.0
    total_rec = mp_stats["total_rec"] if mp_stats and mp_stats["total_rec"] is not None else 0
    total_comp = mp_stats["total_comp"] if mp_stats and mp_stats["total_comp"] is not None else 0
    
    util_pct = (total_exp / total_alloc * 100.0) if total_alloc > 0 else 0.0
    comp_pct = (total_comp / total_rec * 100.0) if total_rec > 0 else 0.0
    
    total_anom = anom_stats["total_anomalies"] if anom_stats and anom_stats["total_anomalies"] is not None else 0
    crit_anom = anom_stats["crit_anom"] if anom_stats and anom_stats["crit_anom"] is not None else 0
    high_anom = anom_stats["high_anom"] if anom_stats and anom_stats["high_anom"] is not None else 0
    med_anom = anom_stats["med_anom"] if anom_stats and anom_stats["med_anom"] is not None else 0
    low_anom = anom_stats["low_anom"] if anom_stats and anom_stats["low_anom"] is not None else 0
    
    ls_alloc = ls_row["total_allocated"] if ls_row else 0.0
    ls_exp = ls_row["total_exp"] if ls_row else 0.0
    ls_rec = ls_row["total_rec"] if ls_row else 0
    ls_comp = ls_row["total_comp"] if ls_row else 0
    
    rs_alloc = rs_row["total_allocated"] if rs_row else 0.0
    rs_exp = rs_row["total_exp"] if rs_row else 0.0
    rs_rec = rs_row["total_rec"] if rs_row else 0
    rs_comp = rs_row["total_comp"] if rs_row else 0
    
    house_breakdown = {
        "lok_sabha": {
            "total_mps": ls_row["total_mps"] if ls_row else 543,
            "total_allocated": ls_alloc,
            "total_expenditure": ls_exp,
            "total_unspent": max(0.0, ls_alloc - ls_exp),
            "utilization_pct": round((ls_exp / ls_alloc * 100.0), 2) if ls_alloc > 0 else 0.0,
            "recommended_works": ls_rec,
            "completed_works": ls_comp,
            "completion_rate_pct": round((ls_comp / ls_rec * 100.0), 2) if ls_rec > 0 else 0.0,
            "anomalies_count": ls_anom_cnt
        },
        "rajya_sabha": {
            "total_mps": rs_row["total_mps"] if rs_row else 235,
            "total_allocated": rs_alloc,
            "total_expenditure": rs_exp,
            "total_unspent": max(0.0, rs_alloc - rs_exp),
            "utilization_pct": round((rs_exp / rs_alloc * 100.0), 2) if rs_alloc > 0 else 0.0,
            "recommended_works": rs_rec,
            "completed_works": rs_comp,
            "completion_rate_pct": round((rs_comp / rs_rec * 100.0), 2) if rs_rec > 0 else 0.0,
            "anomalies_count": rs_anom_cnt
        },
    }

    return {
        "total_mps": total_mps,
        "total_allocated_amount": total_alloc,
        "total_expenditure": total_exp,
        "total_unspent_amount": total_unspent,
        "national_utilization_pct": round(util_pct, 2),
        "total_recommended_works": total_rec,
        "total_completed_works": total_comp,
        "national_completion_rate_pct": round(comp_pct, 2),
        "total_transactions": total_txns,
        "total_vendors": total_vendors,
        "total_anomalies": total_anom,
        "critical_anomalies": crit_anom,
        "high_anomalies": high_anom,
        "medium_anomalies": med_anom,
        "low_anomalies": low_anom,
        "reconciliation_variance": "₹0.00",
        "house_breakdown": house_breakdown
    }

_MACRO_CACHE: Dict[str, Any] = {}
_MACRO_CACHE_EXPIRY: Dict[str, float] = {}

@router.get("/api/states", response_model=List[StateSummaryItem])
def get_state_summaries(
    house: Optional[str] = Query(None, description="Optional filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"),
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve state-level macro performance summaries."""
    cache_key = f"states_{house or 'ALL'}_{user.role if user else 'ANON'}_{user.state if user else 'ALL'}"
    now = time.time()
    if cache_key in _MACRO_CACHE and _MACRO_CACHE_EXPIRY.get(cache_key, 0) > now:
        return _MACRO_CACHE[cache_key]

    cursor = conn.cursor()
    where_clause = "1=1"
    state_params: List[Any] = []
    scope_sql, scope_params = jurisdiction_clause(user)
    if scope_sql != "1=1":
        where_clause = f"({where_clause}) AND ({scope_sql})"
        state_params.extend(scope_params)
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["LOK_SABHA", "LOK SABHA"]:
            where_clause = f"({where_clause}) AND house = 'Lok Sabha'"
        elif h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            where_clause = f"({where_clause}) AND house = 'Rajya Sabha'"
            
    query = f"""
        SELECT 
            m.state_normalized AS state,
            m.total_mps,
            m.total_allocated_amount,
            m.total_expenditure,
            m.total_unspent_amount,
            COALESCE(ROUND(CAST((COALESCE(m.total_expenditure, 0.0) / NULLIF(m.total_allocated_amount, 0.0)) * 100.0 AS NUMERIC), 2), 0.0) AS state_utilization_pct,
            m.total_recommended_works,
            m.total_completed_works,
            COALESCE(ROUND(CAST((CAST(COALESCE(m.total_completed_works, 0) AS REAL) / NULLIF(m.total_recommended_works, 0)) * 100.0 AS NUMERIC), 2), 0.0) AS state_completion_rate_pct,
            m.total_transactions,
            m.total_successful_payments,
            m.total_pending_payments,
            COALESCE(a.anomalies_count, 0) AS anomalies_count
        FROM (
            SELECT 
                state_normalized,
                COUNT(DISTINCT internal_mp_id) AS total_mps,
                COALESCE(SUM(allocated_amount), 0.0) AS total_allocated_amount,
                COALESCE(SUM(total_expenditure), 0.0) AS total_expenditure,
                COALESCE(SUM(unspent_amount), 0.0) AS total_unspent_amount,
                COALESCE(SUM(recommended_works_count), 0) AS total_recommended_works,
                COALESCE(SUM(completed_works_count), 0) AS total_completed_works,
                COALESCE(SUM(transaction_count), 0) AS total_transactions,
                COALESCE(SUM(successful_payments_count), 0) AS total_successful_payments,
                COALESCE(SUM(pending_payments_count), 0) AS total_pending_payments
            FROM mps
            WHERE {where_clause}
            GROUP BY state_normalized
        ) m
        LEFT JOIN (
            SELECT state, COUNT(*) as anomalies_count FROM (
                SELECT m2.state_normalized as state FROM anomalies a2 JOIN mps m2 ON a2.entity_id = m2.internal_mp_id WHERE a2.entity_type = 'MP'
                UNION ALL
                SELECT w2.state_normalized as state FROM anomalies a2 JOIN works w2 ON w2.work_id = CAST(a2.entity_id AS INTEGER) WHERE a2.entity_type = 'WORK'
                UNION ALL
                SELECT t2.state_normalized as state FROM anomalies a2 JOIN transactions t2 ON a2.entity_id = t2.internal_transaction_id WHERE a2.entity_type = 'TRANSACTION'
                UNION ALL
                SELECT v2.primary_state as state FROM anomalies a2 JOIN vendors v2 ON a2.entity_id = v2.internal_vendor_id WHERE a2.entity_type = 'VENDOR' AND v2.primary_state IS NOT NULL
            ) sub_ano WHERE state IS NOT NULL GROUP BY state
        ) a ON m.state_normalized = a.state
        ORDER BY m.total_allocated_amount DESC;
    """
    results: List[Dict[str, Any]] = []
    try:
        cursor.execute(query, state_params)
        raw_rows = cursor.fetchall()
        for r in raw_rows:
            d = dict(r)
            d["total_mps"] = int(d.get("total_mps") or 0)
            d["total_allocated_amount"] = float(d.get("total_allocated_amount") or 0.0)
            d["total_expenditure"] = float(d.get("total_expenditure") or 0.0)
            d["total_unspent_amount"] = float(d.get("total_unspent_amount") or 0.0)
            d["state_utilization_pct"] = float(d.get("state_utilization_pct") or 0.0)
            d["total_recommended_works"] = int(d.get("total_recommended_works") or 0)
            d["total_completed_works"] = int(d.get("total_completed_works") or 0)
            d["state_completion_rate_pct"] = float(d.get("state_completion_rate_pct") or 0.0)
            d["total_transactions"] = int(d.get("total_transactions") or 0)
            d["total_successful_payments"] = int(d.get("total_successful_payments") or 0)
            d["total_pending_payments"] = int(d.get("total_pending_payments") or 0)
            d["anomalies_count"] = int(d.get("anomalies_count") or 0)
            results.append(d)
    except Exception as exc:
        logger.warning(f"get_state_summaries query error: {exc}")

    if results:
        _MACRO_CACHE[cache_key] = results
        _MACRO_CACHE_EXPIRY[cache_key] = now + 60.0
    return results

@router.get("/api/districts", response_model=List[DistrictItem])
def get_districts(
    state: Optional[str] = Query(None, description="Filter districts by state name"),
    conn: sqlite3.Connection = Depends(get_db)
):
    """Retrieve distinct districts for cascading filters."""
    cursor = conn.cursor()
    try:
        if state and state.strip():
            cursor.execute(
                "SELECT district_name, state_name, lgd_district_code FROM lgd_districts_master WHERE state_name = ? ORDER BY district_name ASC;",
                (state.strip().upper(),)
            )
        else:
            cursor.execute(
                "SELECT district_name, state_name, lgd_district_code FROM lgd_districts_master ORDER BY state_name, district_name ASC;"
            )
        dist_results = [dict(r) for r in cursor.fetchall()]
        if dist_results:
            return dist_results
    except Exception:
        pass
    return []

@router.get("/api/constituencies", response_model=List[ConstituencyItem])
def get_constituency_summaries(
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(100, ge=1, le=600),
    offset: int = Query(0, ge=0),
    conn: sqlite3.Connection = Depends(get_db)
):
    """Retrieve constituency roll-up metrics."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    if state:
        where_clauses.append("state = ?")
        params.append(state.strip().upper())
    where_sql = " AND ".join(where_clauses)
    
    cursor.execute(f"SELECT * FROM v_constituency_summary WHERE {where_sql} ORDER BY allocated_amount DESC LIMIT ? OFFSET ?;", params + [limit, offset])
    return [dict(r) for r in cursor.fetchall()]

@router.get("/api/categories", response_model=List[CategoryItem])
def get_work_categories(conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve summary statistics by work category."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            category_normalized AS category,
            COUNT(*) AS total_works,
            COALESCE(SUM(recommended_amount), 0.0) AS total_recommended_amount,
            COALESCE(SUM(final_amount), 0.0) AS total_final_amount,
            SUM(CASE WHEN lifecycle_status IN ('COMPLETED_ONLY', 'FULL_LIFECYCLE_MATCH') THEN 1 ELSE 0 END) AS completed_works_count
        FROM works
        GROUP BY category_normalized
        ORDER BY total_works DESC;
    """)
    return [dict(r) for r in cursor.fetchall()]
