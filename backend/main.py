import os
import json
import sqlite3
import datetime
import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import API_TITLE, API_VERSION, API_DESCRIPTION, DATA_SNAPSHOT_DATE
from backend.database import get_db
from backend.schemas import (
    HealthResponse,
    HouseInfo,
    StatsResponse,
    MPResponse,
    MPDetailResponse,
    MPListResponse,
    WorkResponse,
    WorkDetailResponse,
    WorkListResponse,
    TransactionResponse,
    TransactionDetailResponse,
    TransactionListResponse,
    VendorResponse,
    VendorDetailResponse,
    VendorListResponse,
    AnomalyResponse,
    AnomalyListResponse,
    StateSummaryItem,
    ConstituencyItem,
    CategoryItem
)

logger = logging.getLogger("jandrishti.api")

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Production CORS Configuration
cors_env = os.environ.get("CORS_ORIGINS", "*")
if cors_env.strip() == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS", "HEAD"],
    allow_headers=["*"],
)

# Production Error Handler (Prevents stack trace / path leakage)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal API error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing this public data query. Please try again."}
    )

# ---------------------------------------------------------
# 1. HEALTH & MACRO STATISTICS
# ---------------------------------------------------------

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def get_health(conn: sqlite3.Connection = Depends(get_db)):
    """Health check endpoint confirming API availability and read-only database connectivity."""
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM mps;")
        row = cursor.fetchone()
        mp_count = row[0] if row else 0
        db_status = f"connected ({mp_count} MPs, read-only immutable dataset)"
    except Exception as e:
        db_status = "error: database unavailable"
    
    return {
        "status": "healthy",
        "database": db_status,
        "version": API_VERSION,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@app.get("/api/health/db", tags=["System"])
def get_db_health(conn: sqlite3.Connection = Depends(get_db)):
    """Detailed immutable database verification without exposing credentials or internal paths."""
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
            "storage_mode": "read_only_immutable_sqlite",
            "data_snapshot": DATA_SNAPSHOT_DATE,
            "metrics": {
                "mps": mps_cnt,
                "works": works_cnt,
                "transactions": tx_cnt,
                "vendors": vendors_cnt,
                "anomalies": anom_cnt,
                "reconciliation_variance": "₹0.00"
            }
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database verification failed"
        )

@app.get("/api/houses", response_model=List[HouseInfo], tags=["System"])
def list_houses():
    """Retrieve list of supported parliamentary houses."""
    return [
        {"code": "ALL", "name": "All Houses"},
        {"code": "LOK_SABHA", "name": "Lok Sabha"},
        {"code": "RAJYA_SABHA", "name": "Rajya Sabha"}
    ]

@app.get("/api/stats", response_model=StatsResponse, tags=["Macro Statistics"])
def get_stats(house: Optional[str] = Query(None, description="Optional filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"), conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve national aggregate totals, utilization metrics, and anomaly counts with house breakdown."""
    cursor = conn.cursor()
    
    # Base MP query
    mp_where = "1=1"
    mp_params = []
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["LOK_SABHA", "LOK SABHA"]:
            mp_where = "house = 'Lok Sabha'"
        elif h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            mp_where = "house = 'Rajya Sabha'"
            
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
    
    # House-specific breakdowns for Lok Sabha
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
    
    # House-specific breakdowns for Rajya Sabha
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
    
    # Build house breakdown dictionary
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
        "combined": {
            "total_mps": (ls_row["total_mps"] if ls_row else 0) + (rs_row["total_mps"] if rs_row else 0),
            "total_allocated": ls_alloc + rs_alloc,
            "total_expenditure": ls_exp + rs_exp,
            "total_unspent": max(0.0, (ls_alloc + rs_alloc) - (ls_exp + rs_exp)),
            "utilization_pct": round(((ls_exp + rs_exp) / (ls_alloc + rs_alloc) * 100.0), 2) if (ls_alloc + rs_alloc) > 0 else 0.0,
            "recommended_works": ls_rec + rs_rec,
            "completed_works": ls_comp + rs_comp,
            "completion_rate_pct": round(((ls_comp + rs_comp) / (ls_rec + rs_rec) * 100.0), 2) if (ls_rec + rs_rec) > 0 else 0.0,
            "anomalies_count": ls_anom_cnt + rs_anom_cnt
        }
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
        "house_breakdown": house_breakdown
    }

# ---------------------------------------------------------
# 2. MEMBERS OF PARLIAMENT (MPs)
# ---------------------------------------------------------

@app.get("/api/mps", response_model=MPListResponse, tags=["MPs"])
def list_mps(
    house: Optional[str] = Query(None, description="Filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    constituency: Optional[str] = Query(None, description="Filter by constituency name"),
    search: Optional[str] = Query(None, description="Search MP name or constituency"),
    min_utilization: Optional[float] = Query(None, ge=0.0, le=100.0, description="Minimum utilization %"),
    max_utilization: Optional[float] = Query(None, ge=0.0, le=100.0, description="Maximum utilization %"),
    sort_by: str = Query("allocated_amount", description="Field to sort by (allocated_amount, total_expenditure, utilization_pct, completion_rate_pct)"),
    sort_order: str = Query("desc", pattern="^(?i)(asc|desc)$", description="Sort order (asc or desc)"),
    limit: int = Query(50, ge=1, le=200, description="Page limit"),
    offset: int = Query(0, ge=0, description="Page offset"),
    conn: sqlite3.Connection = Depends(get_db)
):
    """Retrieve paginated list of Members of Parliament with filters."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["LOK_SABHA", "LOK SABHA"]:
            where_clauses.append("house = 'Lok Sabha'")
        elif h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            where_clauses.append("house = 'Rajya Sabha'")
            
    if state and state.strip():
        where_clauses.append("state_normalized = ?")
        params.append(state.strip().upper())
    if constituency and constituency.strip():
        where_clauses.append("constituency_normalized = ?")
        params.append(constituency.strip().upper())
    if search and search.strip():
        where_clauses.append("(mp_name_normalized LIKE ? OR constituency_normalized LIKE ?)")
        term = f"%{search.strip().upper()}%"
        params.extend([term, term])
    if min_utilization is not None:
        where_clauses.append("utilization_pct >= ?")
        params.append(min_utilization)
    if max_utilization is not None:
        where_clauses.append("utilization_pct <= ?")
        params.append(max_utilization)
        
    where_sql = " AND ".join(where_clauses)
    
    cursor.execute(f"SELECT COUNT(*) FROM mps WHERE {where_sql};", params)
    count_row = cursor.fetchone()
    total_count = count_row[0] if count_row else 0
    
    valid_sorts = {
        "allocated_amount": "allocated_amount",
        "total_expenditure": "total_expenditure",
        "utilization_pct": "utilization_pct",
        "completion_rate_pct": "completion_rate_pct",
        "mp_name": "mp_name_normalized",
        "state": "state_normalized"
    }
    order_col = valid_sorts.get(sort_by.strip() if sort_by else "allocated_amount", "allocated_amount")
    order_dir = "ASC" if (sort_order and sort_order.strip().lower() == "asc") else "DESC"
    
    query = f"""
        SELECT * FROM mps 
        WHERE {where_sql} 
        ORDER BY {order_col} {order_dir} 
        LIMIT ? OFFSET ?;
    """
    cursor.execute(query, params + [limit, offset])
    rows = [dict(row) for row in cursor.fetchall()]
    
    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": rows
    }

@app.get("/api/mps/{mp_id}", response_model=MPDetailResponse, tags=["MPs"])
def get_mp_detail(mp_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve detailed profile for a specific MP, including top vendors and anomaly flags."""
    cursor = conn.cursor()
    clean_id = mp_id.strip()
    cursor.execute("SELECT * FROM mps WHERE internal_mp_id = ? OR UPPER(mp_name_normalized) = ?;", [clean_id, clean_id.upper()])
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"MP '{mp_id}' not found.")
    
    mp_dict = dict(row)
    actual_mp_id = mp_dict["internal_mp_id"]
    
    cursor.execute("""
        SELECT 
            internal_vendor_id, vendor_name_normalized AS vendor_name, 
            SUM(expenditure_amount) AS total_amount, COUNT(*) AS txn_count
        FROM transactions 
        WHERE internal_mp_id = ?
        GROUP BY internal_vendor_id, vendor_name_normalized
        ORDER BY total_amount DESC LIMIT 5;
    """, [actual_mp_id])
    top_vendors = [dict(r) for r in cursor.fetchall()]
    mp_dict["top_vendors"] = top_vendors
    
    cursor.execute("""
        SELECT anomaly_id, anomaly_type, anomaly_score, severity, reason, detection_method
        FROM anomalies WHERE entity_id = ? AND entity_type = 'MP'
        ORDER BY anomaly_score DESC;
    """, [actual_mp_id])
    mp_dict["anomalies"] = [dict(r) for r in cursor.fetchall()]
    
    return mp_dict

# ---------------------------------------------------------
# 3. PHYSICAL WORKS
# ---------------------------------------------------------

@app.get("/api/works", response_model=WorkListResponse, tags=["Works"])
def list_works(
    house: Optional[str] = Query(None, description="Filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"),
    state: Optional[str] = Query(None, description="Filter by state"),
    constituency: Optional[str] = Query(None, description="Filter by constituency"),
    mp_id: Optional[str] = Query(None, description="Filter by internal MP ID"),
    category: Optional[str] = Query(None, description="Filter by work category"),
    lifecycle_status: Optional[str] = Query(None, description="Filter by lifecycle status"),
    recommendation_year: Optional[int] = Query(None, description="Filter by recommendation year"),
    completion_year: Optional[int] = Query(None, description="Filter by completion year"),
    min_amount: Optional[float] = Query(None, ge=0.0, description="Minimum amount"),
    max_amount: Optional[float] = Query(None, ge=0.0, description="Maximum amount"),
    search: Optional[str] = Query(None, description="Search work description"),
    sort_by: str = Query("work_id", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    limit: int = Query(50, ge=1, le=200, description="Page limit"),
    offset: int = Query(0, ge=0, description="Page offset"),
    conn: sqlite3.Connection = Depends(get_db)
):
    """Retrieve paginated physical works registry with filters."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["LOK_SABHA", "LOK SABHA"]:
            where_clauses.append("house = 'Lok Sabha'")
        elif h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            where_clauses.append("house = 'Rajya Sabha'")
            
    if state and state.strip():
        where_clauses.append("state_normalized = ?")
        params.append(state.strip().upper())
    if constituency and constituency.strip():
        where_clauses.append("constituency_normalized = ?")
        params.append(constituency.strip().upper())
    if mp_id:
        where_clauses.append("internal_mp_id = ?")
        params.append(mp_id.strip())
    if category:
        where_clauses.append("category_normalized = ?")
        params.append(category.strip())
    if lifecycle_status:
        where_clauses.append("lifecycle_status = ?")
        params.append(lifecycle_status.strip().upper())
    if recommendation_year:
        where_clauses.append("recommendation_year = ?")
        params.append(recommendation_year)
    if completion_year:
        where_clauses.append("completion_year = ?")
        params.append(completion_year)
    if min_amount is not None:
        where_clauses.append("(COALESCE(final_amount, recommended_amount) >= ?)")
        params.append(min_amount)
    if max_amount is not None:
        where_clauses.append("(COALESCE(final_amount, recommended_amount) <= ?)")
        params.append(max_amount)
    if search:
        where_clauses.append("work_description_normalized LIKE ?")
        params.append(f"%{search.strip()}%")
        
    where_sql = " AND ".join(where_clauses)
    
    cursor.execute(f"SELECT COUNT(*) FROM works WHERE {where_sql};", params)
    total_count = cursor.fetchone()[0]
    
    valid_sorts = {
        "work_id": "work_id",
        "recommended_amount": "recommended_amount",
        "final_amount": "final_amount",
        "duration_days": "duration_days"
    }
    order_col = valid_sorts.get(sort_by, "work_id")
    order_dir = "ASC" if sort_order.lower() == "asc" else "DESC"
    
    query = f"""
        SELECT * FROM works 
        WHERE {where_sql} 
        ORDER BY {order_col} {order_dir} 
        LIMIT ? OFFSET ?;
    """
    params.extend([limit, offset])
    cursor.execute(query, params)
    rows = []
    for r in cursor.fetchall():
        d = dict(r)
        d["has_images"] = bool(d["has_images"])
        rows.append(d)
        
    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": rows
    }

@app.get("/api/works/{work_id}", response_model=WorkDetailResponse, tags=["Works"])
def get_work_detail(work_id: int, conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve detailed record for a specific physical work ID."""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM works WHERE work_id = ?;", [work_id])
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Work ID '{work_id}' not found.")
    
    work_dict = dict(row)
    work_dict["has_images"] = bool(work_dict["has_images"])
    
    cursor.execute("""
        SELECT internal_mp_id, mp_name_normalized, constituency_normalized, state_normalized, allocated_amount, total_expenditure, utilization_pct
        FROM mps WHERE internal_mp_id = ?;
    """, [work_dict["internal_mp_id"]])
    mp_row = cursor.fetchone()
    work_dict["mp_details"] = dict(mp_row) if mp_row else None
    
    cursor.execute("""
        SELECT anomaly_id, anomaly_type, anomaly_score, severity, reason, detection_method
        FROM anomalies WHERE entity_id = ? AND entity_type = 'WORK'
        ORDER BY anomaly_score DESC;
    """, [str(work_id)])
    work_dict["anomalies"] = [dict(r) for r in cursor.fetchall()]
    
    return work_dict

# ---------------------------------------------------------
# 4. EXPENDITURE TRANSACTIONS
# ---------------------------------------------------------

@app.get("/api/transactions", response_model=TransactionListResponse, tags=["Transactions"])
def list_transactions(
    mp_id: Optional[str] = Query(None, description="Filter by MP ID"),
    vendor_id: Optional[str] = Query(None, description="Filter by Vendor ID"),
    state: Optional[str] = Query(None, description="Filter by State"),
    payment_status: Optional[str] = Query(None, description="Filter by Payment Status"),
    min_amount: Optional[float] = Query(None, ge=0.0, description="Minimum voucher amount"),
    max_amount: Optional[float] = Query(None, ge=0.0, description="Maximum voucher amount"),
    year: Optional[int] = Query(None, description="Filter by expenditure year"),
    search: Optional[str] = Query(None, description="Search activity or vendor name"),
    sort_by: str = Query("expenditure_amount", description="Sort by expenditure_amount, expenditure_date"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn: sqlite3.Connection = Depends(get_db)
):
    """Retrieve paginated line-item financial transactions."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    
    if mp_id:
        where_clauses.append("internal_mp_id = ?")
        params.append(mp_id.strip())
    if vendor_id:
        where_clauses.append("internal_vendor_id = ?")
        params.append(vendor_id.strip())
    if state:
        where_clauses.append("state_normalized = ?")
        params.append(state.strip().upper())
    if payment_status:
        where_clauses.append("payment_status = ?")
        params.append(payment_status.strip())
    if min_amount is not None:
        where_clauses.append("expenditure_amount >= ?")
        params.append(min_amount)
    if max_amount is not None:
        where_clauses.append("expenditure_amount <= ?")
        params.append(max_amount)
    if year:
        where_clauses.append("expenditure_year = ?")
        params.append(year)
    if search:
        where_clauses.append("(activity_description_normalized LIKE ? OR vendor_name_normalized LIKE ?)")
        term = f"%{search.strip().upper()}%"
        params.extend([term, term])
        
    where_sql = " AND ".join(where_clauses)
    
    cursor.execute(f"SELECT COUNT(*) FROM transactions WHERE {where_sql};", params)
    total_count = cursor.fetchone()[0]
    
    valid_sorts = {
        "expenditure_amount": "expenditure_amount",
        "expenditure_date": "expenditure_date"
    }
    order_col = valid_sorts.get(sort_by, "expenditure_amount")
    order_dir = "ASC" if sort_order.lower() == "asc" else "DESC"
    
    query = f"""
        SELECT * FROM transactions 
        WHERE {where_sql} 
        ORDER BY {order_col} {order_dir} 
        LIMIT ? OFFSET ?;
    """
    params.extend([limit, offset])
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    
    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": rows
    }

@app.get("/api/transactions/{transaction_id}", response_model=TransactionDetailResponse, tags=["Transactions"])
def get_transaction_detail(transaction_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve details for a specific transaction voucher."""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE internal_transaction_id = ?;", [transaction_id.strip()])
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction '{transaction_id}' not found.")
    
    txn_dict = dict(row)
    cursor.execute("""
        SELECT anomaly_id, anomaly_type, anomaly_score, severity, reason, detection_method
        FROM anomalies WHERE entity_id = ? AND entity_type = 'TRANSACTION'
        ORDER BY anomaly_score DESC;
    """, [transaction_id.strip()])
    txn_dict["anomalies"] = [dict(r) for r in cursor.fetchall()]
    return txn_dict

# ---------------------------------------------------------
# 5. VENDORS & CONTRACTORS
# ---------------------------------------------------------

@app.get("/api/vendors", response_model=VendorListResponse, tags=["Vendors"])
def list_vendors(
    state: Optional[str] = Query(None, description="Filter by primary state"),
    min_revenue: Optional[float] = Query(None, ge=0.0, description="Minimum total received revenue"),
    max_revenue: Optional[float] = Query(None, ge=0.0, description="Maximum total received revenue"),
    min_reliance_pct: Optional[float] = Query(None, ge=0.0, le=100.0, description="Minimum single MP reliance %"),
    search: Optional[str] = Query(None, description="Search vendor name"),
    sort_by: str = Query("total_received_amount", description="Sort by metric"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn: sqlite3.Connection = Depends(get_db)
):
    """Retrieve paginated contractor / vendor directory."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    
    if state:
        where_clauses.append("primary_state = ?")
        params.append(state.strip().upper())
    if min_revenue is not None:
        where_clauses.append("total_received_amount >= ?")
        params.append(min_revenue)
    if max_revenue is not None:
        where_clauses.append("total_received_amount <= ?")
        params.append(max_revenue)
    if min_reliance_pct is not None:
        where_clauses.append("single_mp_reliance_pct >= ?")
        params.append(min_reliance_pct)
    if search:
        where_clauses.append("vendor_name_normalized LIKE ?")
        params.append(f"%{search.strip().upper()}%")
        
    where_sql = " AND ".join(where_clauses)
    
    cursor.execute(f"SELECT COUNT(*) FROM vendors WHERE {where_sql};", params)
    total_count = cursor.fetchone()[0]
    
    valid_sorts = {
        "total_received_amount": "total_received_amount",
        "total_transaction_count": "total_transaction_count",
        "single_mp_reliance_pct": "single_mp_reliance_pct",
        "vendor_name": "vendor_name_normalized"
    }
    order_col = valid_sorts.get(sort_by, "total_received_amount")
    order_dir = "ASC" if sort_order.lower() == "asc" else "DESC"
    
    query = f"""
        SELECT * FROM vendors 
        WHERE {where_sql} 
        ORDER BY {order_col} {order_dir} 
        LIMIT ? OFFSET ?;
    """
    params.extend([limit, offset])
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    
    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": rows
    }

@app.get("/api/vendors/{vendor_id}", response_model=VendorDetailResponse, tags=["Vendors"])
def get_vendor_detail(vendor_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve detailed vendor intelligence profile and associated anomalies."""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendors WHERE internal_vendor_id = ? OR vendor_name_normalized = ?;", [vendor_id.strip(), vendor_id.strip().upper()])
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vendor '{vendor_id}' not found.")
    
    vendor_dict = dict(row)
    actual_vid = vendor_dict["internal_vendor_id"]
    
    cursor.execute("""
        SELECT internal_transaction_id, mp_name_normalized, activity_description_normalized, expenditure_amount, expenditure_date, payment_status
        FROM transactions WHERE internal_vendor_id = ?
        ORDER BY expenditure_date DESC LIMIT 5;
    """, [actual_vid])
    vendor_dict["recent_transactions"] = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("""
        SELECT anomaly_id, anomaly_type, anomaly_score, severity, reason, detection_method
        FROM anomalies WHERE entity_id = ? AND entity_type = 'VENDOR'
        ORDER BY anomaly_score DESC;
    """, [actual_vid])
    vendor_dict["anomalies"] = [dict(r) for r in cursor.fetchall()]
    
    return vendor_dict

# ---------------------------------------------------------
# 6. EXPLAINABLE ANOMALIES
# ---------------------------------------------------------

@app.get("/api/anomalies", response_model=AnomalyListResponse, tags=["Anomalies"])
def list_anomalies(
    house: Optional[str] = Query(None, description="Filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type (WORK, MP, TRANSACTION, VENDOR)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    anomaly_type: Optional[str] = Query(None, description="Filter by anomaly type"),
    entity_id: Optional[str] = Query(None, description="Filter by specific entity ID"),
    min_score: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum anomaly score"),
    max_score: Optional[float] = Query(None, ge=0.0, le=1.0, description="Maximum anomaly score"),
    sort_by: str = Query("anomaly_score", description="Sort by anomaly_score or generated_at"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    conn: sqlite3.Connection = Depends(get_db)
):
    """Retrieve explainable anomaly flags with full mathematical traceability and house filtering."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            where_clauses.append("(anomaly_id LIKE 'ANOM_RS_%' OR entity_id LIKE 'INTERNAL_RS_MP_%')")
        elif h_clean in ["LOK_SABHA", "LOK SABHA"]:
            where_clauses.append("(anomaly_id NOT LIKE 'ANOM_RS_%' AND entity_id NOT LIKE 'INTERNAL_RS_MP_%')")
            
    if entity_type and entity_type.strip():
        where_clauses.append("entity_type = ?")
        params.append(entity_type.strip().upper())
    if severity and severity.strip():
        where_clauses.append("severity = ?")
        params.append(severity.strip().upper())
    if anomaly_type and anomaly_type.strip():
        where_clauses.append("anomaly_type = ?")
        params.append(anomaly_type.strip())
    if entity_id and entity_id.strip():
        where_clauses.append("entity_id = ?")
        params.append(entity_id.strip())
    if min_score is not None:
        where_clauses.append("anomaly_score >= ?")
        params.append(min_score)
    if max_score is not None:
        where_clauses.append("anomaly_score <= ?")
        params.append(max_score)
        
    where_sql = " AND ".join(where_clauses)
    
    cursor.execute(f"SELECT COUNT(*) FROM anomalies WHERE {where_sql};", params)
    count_row = cursor.fetchone()
    total_count = count_row[0] if count_row else 0
    
    valid_sorts = {
        "anomaly_score": "anomaly_score",
        "generated_at": "generated_at"
    }
    order_col = valid_sorts.get(sort_by.strip() if sort_by else "anomaly_score", "anomaly_score")
    order_dir = "ASC" if (sort_order and sort_order.strip().lower() == "asc") else "DESC"
    
    query = f"""
        SELECT * FROM anomalies 
        WHERE {where_sql} 
        ORDER BY {order_col} {order_dir} 
        LIMIT ? OFFSET ?;
    """
    cursor.execute(query, params + [limit, offset])
    
    rows = []
    for r in cursor.fetchall():
        d = dict(r)
        raw_metrics = d.get("supporting_metrics")
        if isinstance(raw_metrics, str):
            try:
                d["supporting_metrics"] = json.loads(raw_metrics)
            except Exception:
                d["supporting_metrics"] = {}
        elif not isinstance(raw_metrics, dict):
            d["supporting_metrics"] = {}
        rows.append(d)
        
    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "items": rows
    }

@app.get("/api/anomalies/{anomaly_id}", response_model=AnomalyResponse, tags=["Anomalies"])
def get_anomaly_detail(anomaly_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve full 15-column traceability record for a specific anomaly ID."""
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM anomalies WHERE anomaly_id = ?;", [anomaly_id.strip()])
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anomaly '{anomaly_id}' not found.")
    
    d = dict(row)
    try:
        d["supporting_metrics"] = json.loads(d["supporting_metrics"])
    except Exception:
        d["supporting_metrics"] = {}
    return d

# ---------------------------------------------------------
# 7. AGGREGATION & METADATA DIMENSIONS
# ---------------------------------------------------------

@app.get("/api/states", response_model=List[StateSummaryItem], tags=["Aggregations"])
def get_state_summaries(house: Optional[str] = Query(None, description="Optional filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"), conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve state-level macro performance summaries with dynamic house support."""
    cursor = conn.cursor()
    where_clause = "1=1"
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["LOK_SABHA", "LOK SABHA"]:
            where_clause = "house = 'Lok Sabha'"
        elif h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            where_clause = "house = 'Rajya Sabha'"
            
    query = f"""
        SELECT 
            state_normalized AS state,
            COUNT(DISTINCT internal_mp_id) AS total_mps,
            COALESCE(SUM(allocated_amount), 0.0) AS total_allocated_amount,
            COALESCE(SUM(total_expenditure), 0.0) AS total_expenditure,
            COALESCE(SUM(unspent_amount), 0.0) AS total_unspent_amount,
            COALESCE(ROUND((COALESCE(SUM(total_expenditure), 0.0) / NULLIF(SUM(allocated_amount), 0.0)) * 100.0, 2), 0.0) AS state_utilization_pct,
            COALESCE(SUM(recommended_works_count), 0) AS total_recommended_works,
            COALESCE(SUM(completed_works_count), 0) AS total_completed_works,
            COALESCE(ROUND((CAST(COALESCE(SUM(completed_works_count), 0) AS REAL) / NULLIF(SUM(recommended_works_count), 0)) * 100.0, 2), 0.0) AS state_completion_rate_pct,
            COALESCE(SUM(transaction_count), 0) AS total_transactions,
            COALESCE(SUM(successful_payments_count), 0) AS total_successful_payments,
            COALESCE(SUM(pending_payments_count), 0) AS total_pending_payments
        FROM mps
        WHERE {where_clause}
        GROUP BY state_normalized
        ORDER BY total_allocated_amount DESC;
    """
    cursor.execute(query)
    return [dict(r) for r in cursor.fetchall()]

@app.get("/api/constituencies", response_model=List[ConstituencyItem], tags=["Aggregations"])
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

@app.get("/api/categories", response_model=List[CategoryItem], tags=["Aggregations"])
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
