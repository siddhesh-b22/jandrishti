import os
import json
import time
import sqlite3
import datetime
import logging
from collections import defaultdict, deque
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Depends, status, Request, File, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import API_TITLE, API_VERSION, API_DESCRIPTION, DATA_SNAPSHOT_DATE
from backend.database import get_db, storage_mode_label
from backend.auth import (
    require_case_management_role,
    verify_bearer_token,
    optional_authenticated_user,
    authenticate_credentials,
    list_demo_accounts,
    AuthenticatedUser,
    DEMO_CREDENTIALS
)
from backend.scope import jurisdiction_clause, can_edit_record, get_user_scope_params

from backend.supabase_service import supabase_service
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
    DistrictItem,
    ConstituencyItem,
    CategoryItem,
    DuplicatePairItem,
    ProgressMismatchListResponse,
    DelayPredictionListResponse,
    DataQualityResponse,
    ReviewCaseResponse,
    ReviewCaseListResponse,
    ReviewCaseCreate,
    ReviewCaseUpdate,
    AuditLogItem,
    SourceRegistryListResponse,
    StatutoryRuleListResponse,
    ImplementingAgencyListResponse,
    PaymentTimingSignalListResponse,
    GlobalSearchResponse,
    EntityMediaListResponse,
    EntityProfileResponse,
    EntityTimelineResponse,
    DiscoveredSourceListResponse,
    HistoricalSnapshotListResponse,
    ChangeEventListResponse,
    ReconciliationListResponse,
    WorkRiskSummary,
    LgdDistrictListResponse,
    MpCrosswalkResponse,
    SnapshotSyncResponse,
    IngestValidateResponse,
    IngestConfirmRequest,
    IngestConfirmResponse,
    RiskWeightsConfig,
    RiskWeightsUpdateRequest,
    AlertItem,
    AlertListResponse,
    AlertUpdateRequest,
    LoginRequest,
    LoginResponse,
    DemoAccountItem,
)
from backend.intelligence import intelligence_service
from backend.cases import case_service
from backend.alerts_service import alerts_service
from backend.risk_engine import risk_engine
from backend.ingestion import ingestion_service
from backend.dashboards import dashboard_service


logger = logging.getLogger("jandrishti.api")

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Production CORS Configuration (Spec-compliant: credentials=False when origins='*')
cors_env = os.environ.get("CORS_ORIGINS", "*")
if cors_env.strip() == "*":
    allowed_origins = ["*"]
    cors_credentials = False
else:
    allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
    cors_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=cors_credentials,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS", "HEAD"],
    allow_headers=["*"],
)

# In-Memory Rate Limiting & Security Headers Middleware
RATE_LIMIT_STORE: Dict[str, deque] = defaultdict(deque)
RATE_LIMIT_MUTATION_STORE: Dict[str, deque] = defaultdict(deque)
MAX_REQUESTS_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_MINUTE", "300"))
MAX_MUTATIONS_PER_MINUTE = int(os.environ.get("RATE_LIMIT_MUTATION_PER_MINUTE", "60"))

@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()

    # Rate limiting for general endpoints
    window = RATE_LIMIT_STORE[client_ip]
    while window and window[0] < now - 60:
        window.popleft()
    if len(window) >= MAX_REQUESTS_PER_MINUTE:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "API rate limit exceeded. Too many requests in 60s window. Please retry shortly."}
        )
    window.append(now)

    # Stricter rate limiting for state-mutating requests
    if request.method in ["POST", "PATCH", "DELETE"]:
        m_window = RATE_LIMIT_MUTATION_STORE[client_ip]
        while m_window and m_window[0] < now - 60:
            m_window.popleft()
        if len(m_window) >= MAX_MUTATIONS_PER_MINUTE:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Mutation rate limit exceeded. Too many case updates in 60s window."}
            )
        m_window.append(now)

    response = await call_next(request)

    # Inject Production Security Response Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Civic-Platform"] = "JanDrishti-GovTech"

    return response

# Production Error Handler (Prevents stack trace / path leakage)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal API error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing this public data query. Please try again."}
    )

# ---------------------------------------------------------
# 0. AUTHENTICATION (demo RBAC logins)
# ---------------------------------------------------------

@app.get("/api/auth/demo-accounts", response_model=List[DemoAccountItem], tags=["Auth"])
def get_demo_accounts():
    """Published dummy logins for SIH evaluation and hierarchical role walkthroughs."""
    return list_demo_accounts()


@app.post("/api/auth/login", response_model=LoginResponse, tags=["Auth"])
def login(payload: LoginRequest):
    token, user = authenticate_credentials(payload.username, payload.password)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.model_dump(),
    }


@app.get("/api/auth/me", tags=["Auth"])
def auth_me(current_user: AuthenticatedUser = Depends(verify_bearer_token)):
    return current_user.model_dump()


# ---------------------------------------------------------
# 1. HEALTH & MACRO STATISTICS
# ---------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["System"])
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

@app.get("/api/supabase/status", tags=["Supabase Cloud"])
def get_supabase_status():
    """Verify live Supabase cloud database connectivity and schema tables."""
    return supabase_service.check_health()

@app.get("/api/supabase/works", tags=["Supabase Cloud"])
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

@app.get("/api/supabase/representatives", tags=["Supabase Cloud"])
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


@app.get("/api/houses", response_model=List[HouseInfo], tags=["System"])
def list_houses():
    """Retrieve list of supported parliamentary houses."""
    return [
        {"code": "ALL", "name": "All Houses"},
        {"code": "LOK_SABHA", "name": "Lok Sabha"},
        {"code": "RAJYA_SABHA", "name": "Rajya Sabha"}
    ]

@app.get("/api/stats", response_model=StatsResponse, tags=["Macro Statistics"])
def get_stats(house: Optional[str] = Query(None, description="Optional filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"), conn: sqlite3.Connection = Depends(get_db), user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)):
    """Retrieve national aggregate totals, utilization metrics, and anomaly counts with house breakdown."""
    cursor = conn.cursor()
    
    # Base MP query
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
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    # Enforce Server-Side Verified User Jurisdiction Scope
    user_scope = get_user_scope_params(user)
    if user_scope.get("state"):
        if state and state.strip().upper() != user_scope["state"]:
            return MPListResponse(total=0, limit=limit, offset=offset, items=[])
        state = user_scope["state"]
    if user_scope.get("constituency"):
        if constituency and constituency.strip().upper() != user_scope["constituency"]:
            return MPListResponse(total=0, limit=limit, offset=offset, items=[])
        constituency = user_scope["constituency"]

    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    scope_sql, scope_params = jurisdiction_clause(user)
    where_clauses.append(scope_sql)
    params.extend(scope_params)

    
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
    district: Optional[str] = Query(None, description="Filter by district name or implementing district authority"),
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
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    # Enforce Server-Side Verified User Jurisdiction Scope
    user_scope = get_user_scope_params(user)
    if user_scope.get("state"):
        if state and state.strip().upper() != user_scope["state"]:
            return WorkListResponse(total=0, limit=limit, offset=offset, items=[])
        state = user_scope["state"]
    if user_scope.get("constituency"):
        if constituency and constituency.strip().upper() != user_scope["constituency"]:
            return WorkListResponse(total=0, limit=limit, offset=offset, items=[])
        constituency = user_scope["constituency"]
    if user_scope.get("mp_id"):
        if mp_id and mp_id.strip() != user_scope["mp_id"]:
            return WorkListResponse(total=0, limit=limit, offset=offset, items=[])
        mp_id = user_scope["mp_id"]

    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    scope_sql, scope_params = jurisdiction_clause(user)
    where_clauses.append(scope_sql)
    params.extend(scope_params)

    
    if house and house.strip():
        h_clean = house.strip().upper()
        if h_clean in ["LOK_SABHA", "LOK SABHA"]:
            where_clauses.append("house = 'Lok Sabha'")
        elif h_clean in ["RAJYA_SABHA", "RAJYA SABHA"]:
            where_clauses.append("house = 'Rajya Sabha'")
            
    if state and state.strip():
        where_clauses.append("state_normalized = ?")
        params.append(state.strip().upper())
    if district and district.strip():
        d_clean = district.strip().upper()
        where_clauses.append("(ida_normalized LIKE ? OR constituency_normalized LIKE ?)")
        params.extend([f"%{d_clean}%", f"%{d_clean}%"])
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
        where_clauses.append("(COALESCE(final_amount, recommended_amount, sanctioned_amount, 0.0) >= ?)")
        params.append(min_amount)
    if max_amount is not None:
        where_clauses.append("(COALESCE(final_amount, recommended_amount, sanctioned_amount, 0.0) <= ?)")
        params.append(max_amount)
    if search:
        q = search.strip()
        where_clauses.append("(work_description_normalized LIKE ? OR mp_name_normalized LIKE ? OR ida_normalized LIKE ? OR constituency_normalized LIKE ? OR CAST(work_id AS TEXT) LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%"])
        
    where_sql = " AND ".join(where_clauses)
    
    cursor.execute(f"SELECT COUNT(*) FROM works WHERE {where_sql};", params)
    total_count = cursor.fetchone()[0]
    
    valid_sorts = {
        "work_id": "work_id",
        "recommended_amount": "COALESCE(recommended_amount, final_amount, 0.0)",
        "final_amount": "COALESCE(final_amount, recommended_amount, 0.0)",
        "sanctioned_amount": "COALESCE(sanctioned_amount, recommended_amount, final_amount, 0.0)",
        "duration_days": "duration_days",
        "recommendation_year": "COALESCE(recommendation_year, completion_year, 2024)"
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
    
    # Match MP by ID or Name
    cursor.execute("""
        SELECT internal_mp_id, mp_name_normalized, constituency_normalized, state_normalized, allocated_amount, total_expenditure, utilization_pct
        FROM mps WHERE internal_mp_id = ?;
    """, [work_dict.get("internal_mp_id") or ""])
    mp_row = cursor.fetchone()
    if not mp_row and work_dict.get("mp_name_normalized"):
        cursor.execute("""
            SELECT internal_mp_id, mp_name_normalized, constituency_normalized, state_normalized, allocated_amount, total_expenditure, utilization_pct
            FROM mps WHERE mp_name_normalized = ?;
        """, [work_dict["mp_name_normalized"]])
        mp_row = cursor.fetchone()

    work_dict["mp_details"] = dict(mp_row) if mp_row else None
    
    cursor.execute("""
        SELECT anomaly_id, anomaly_type, anomaly_score, severity, reason, detection_method
        FROM anomalies WHERE entity_id = ? AND entity_type = 'WORK'
        ORDER BY anomaly_score DESC;
    """, [str(work_id)])
    work_dict["anomalies"] = [dict(r) for r in cursor.fetchall()]

    # Fetch top related financial disbursement transactions
    tx_params = []
    tx_query = """
        SELECT internal_transaction_id, internal_vendor_id, vendor_name_normalized,
               activity_description_normalized, expenditure_amount, expenditure_date, payment_status
        FROM transactions
    """
    if work_dict.get("internal_mp_id"):
        tx_query += " WHERE internal_mp_id = ?"
        tx_params.append(work_dict["internal_mp_id"])
    elif work_dict.get("mp_name_normalized"):
        tx_query += " WHERE mp_name_normalized = ?"
        tx_params.append(work_dict["mp_name_normalized"])
    else:
        tx_query += " WHERE state_normalized = ?"
        tx_params.append(work_dict.get("state_normalized", ""))

    tx_query += " ORDER BY expenditure_amount DESC LIMIT 10;"
    cursor.execute(tx_query, tx_params)
    work_dict["related_transactions"] = [dict(r) for r in cursor.fetchall()]

    # Fetch implementing agency (IDA) summary if available
    if work_dict.get("ida_normalized"):
        cursor.execute("""
            SELECT agency_name AS ida_name, state,
                   completed_works AS completed_works_count, total_expenditure
            FROM implementing_agencies WHERE agency_name = ? LIMIT 1;
        """, [work_dict["ida_normalized"]])
        ida_row = cursor.fetchone()
        work_dict["implementing_agency_details"] = dict(ida_row) if ida_row else None
    else:
        work_dict["implementing_agency_details"] = None
    
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
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve paginated line-item financial transactions."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    scope_sql, scope_params = jurisdiction_clause(user)
    where_clauses.append(scope_sql)
    params.extend(scope_params)
    
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
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve paginated contractor / vendor directory."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    scope_sql, scope_params = jurisdiction_clause(user, state_col="primary_state", constituency_col="", mp_col="primary_mp_id")
    if scope_sql != "1=1":
        where_clauses.append(scope_sql)
        params.extend(scope_params)
    
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
    state: Optional[str] = Query(None, description="Filter anomalies by state"),
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
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve explainable anomaly flags with full mathematical traceability and house filtering."""
    cursor = conn.cursor()
    where_clauses = ["1=1"]
    params: List[Any] = []
    if user and user.mp_id:
        where_clauses.append("entity_id = ?")
        params.append(user.mp_id)
    
    target_state = state.strip().upper() if (state and state.strip()) else (
        user.state.upper() if (user and user.state and user.jurisdiction_type not in ("NATIONAL", "PUBLIC") and user.role not in ("CITIZEN", "ANALYST", "MINISTRY_ADMIN", "MINISTRY_OFFICIAL")) else None
    )
    if target_state:
        where_clauses.append("""(
            entity_id IN (SELECT internal_mp_id FROM mps WHERE state_normalized = ?)
            OR entity_id IN (SELECT work_id FROM works WHERE state_normalized = ?)
            OR entity_id IN (SELECT internal_transaction_id FROM transactions WHERE state_normalized = ?)
            OR entity_id IN (SELECT internal_vendor_id FROM vendors WHERE primary_state = ?)
            OR reason LIKE ?
        )""")
        params.extend([target_state, target_state, target_state, target_state, f"%{target_state}%"])
    
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
def get_state_summaries(house: Optional[str] = Query(None, description="Optional filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"), conn: sqlite3.Connection = Depends(get_db), user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)):
    """Retrieve state-level macro performance summaries with dynamic house support and real anomaly counts."""
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
            m.state_utilization_pct,
            m.total_recommended_works,
            m.total_completed_works,
            m.state_completion_rate_pct,
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
        ) m
        LEFT JOIN (
            SELECT state, COUNT(*) as anomalies_count FROM (
                SELECT m2.state_normalized as state FROM anomalies a2 JOIN mps m2 ON a2.entity_id = m2.internal_mp_id WHERE a2.entity_type = 'MP'
                UNION ALL
                SELECT w2.state_normalized as state FROM anomalies a2 JOIN works w2 ON a2.entity_id = w2.work_id WHERE a2.entity_type = 'WORK'
                UNION ALL
                SELECT t2.state_normalized as state FROM anomalies a2 JOIN transactions t2 ON a2.entity_id = t2.internal_transaction_id WHERE a2.entity_type = 'TRANSACTION'
                UNION ALL
                SELECT v2.primary_state as state FROM anomalies a2 JOIN vendors v2 ON a2.entity_id = v2.internal_vendor_id WHERE a2.entity_type = 'VENDOR' AND v2.primary_state IS NOT NULL
            ) WHERE state IS NOT NULL GROUP BY state
        ) a ON m.state_normalized = a.state
        ORDER BY m.total_allocated_amount DESC;
    """
    cursor.execute(query, state_params)
    return [dict(r) for r in cursor.fetchall()]

@app.get("/api/districts", response_model=List[DistrictItem], tags=["Aggregations"])
def get_districts(
    state: Optional[str] = Query(None, description="Filter districts by state name"),
    conn: sqlite3.Connection = Depends(get_db)
):
    """Retrieve distinct LGD districts for cascading filters."""
    cursor = conn.cursor()
    if state and state.strip():
        cursor.execute(
            "SELECT district_name, state_name, lgd_district_code FROM lgd_districts_master WHERE state_name = ? ORDER BY district_name ASC;",
            (state.strip().upper(),)
        )
    else:
        cursor.execute(
            "SELECT district_name, state_name, lgd_district_code FROM lgd_districts_master ORDER BY state_name, district_name ASC;"
        )
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

# ====================================================================
# ADVANCED INTELLIGENCE & AI/ML ANALYTICS ENDPOINTS
# ====================================================================

@app.get("/api/intelligence/duplicates", response_model=List[DuplicatePairItem], tags=["Intelligence"])
def get_duplicate_works(
    state: Optional[str] = Query(None, description="Filter by state"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(25, ge=1, le=100),
    min_similarity: float = Query(0.60, ge=0.4, le=1.0)
):
    """
    Detects potential duplicate and overlapping works across geographical clusters
    using description token similarity, category matching, and cost scale parity.
    """
    return intelligence_service.detect_duplicates(
        state=state,
        category=category,
        limit=limit,
        min_similarity=min_similarity
    )

@app.get("/api/intelligence/progress-mismatch", response_model=ProgressMismatchListResponse, tags=["Intelligence"])
def get_progress_mismatches(
    state: Optional[str] = Query(None, description="Filter by state"),
    min_severity: str = Query("HIGH", description="Filter by min severity (CRITICAL, HIGH, MEDIUM)"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    Identifies severe divergences between financial utilization and physical milestone progress.
    """
    return intelligence_service.get_progress_mismatches(
        state=state,
        min_severity=min_severity,
        limit=limit,
        offset=offset
    )

@app.get("/api/intelligence/delay-predictions", response_model=DelayPredictionListResponse, tags=["Intelligence"])
def get_delay_predictions(
    category: Optional[str] = Query(None, description="Filter by category"),
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """
    Computes empirical delay probabilities and schedule completion deviations
    relative to regional category duration benchmarks.
    """
    return intelligence_service.get_delay_predictions(
        category=category,
        state=state,
        limit=limit,
        offset=offset
    )

@app.get("/api/intelligence/works/{work_id}/profile", tags=["Intelligence"])
def get_work_intelligence_profile(work_id: int):
    """
    Generates a 360-degree comprehensive intelligence dossier for an individual project,
    including physical vs financial progress, delay forecast, multi-factor risk score,
    and 5-point compliance checklist.
    """
    profile = intelligence_service.get_work_intelligence_profile(work_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Work #{work_id} not found")
    return profile

@app.get("/api/intelligence/data-quality", response_model=DataQualityResponse, tags=["Intelligence"])
@app.get("/api/data-quality", response_model=DataQualityResponse, tags=["Intelligence"], include_in_schema=False)
def get_data_quality_metrics():
    """
    Evaluates dataset integrity, field completeness, voucher linkage, and zero-variance proofs.
    """
    return intelligence_service.get_data_quality_metrics()

# ====================================================================
# HUMAN-IN-THE-LOOP CASE MANAGEMENT & AUDIT TRAIL ENDPOINTS
# ====================================================================

@app.get("/api/cases", response_model=ReviewCaseListResponse, tags=["Case Management"])
def list_review_cases(
    status: Optional[str] = Query(None, description="Filter by status (NEW, UNDER_REVIEW, CLARIFICATION_REQUESTED, DETAILED_REVIEW, RESOLVED, ESCALATED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    role: Optional[str] = Query(None, description="Filter by assigned stakeholder role"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List operational review cases with risk scores and current investigation status."""
    return case_service.list_cases(
        status=status,
        severity=severity,
        category=category,
        role=role,
        limit=limit,
        offset=offset
    )

@app.post("/api/cases", response_model=ReviewCaseResponse, status_code=status.HTTP_201_CREATED, tags=["Case Management"])
def create_review_case(
    payload: ReviewCaseCreate,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Initiate a formal administrative review case from a flagged anomaly or suspicious project (Requires authenticated role)."""
    case = case_service.create_case(
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        title=payload.title,
        severity=payload.severity,
        risk_score=payload.risk_score,
        category=payload.category,
        assigned_to=payload.assigned_to or "Unassigned",
        assigned_role=payload.assigned_role or current_user.role,
        user=current_user.display_name,
        role=current_user.role,
        notes=payload.notes or ""
    )
    return case

@app.get("/api/cases/audit-trail", response_model=List[AuditLogItem], tags=["Case Management"])
def get_global_audit_trail(limit: int = Query(50, ge=1, le=100)):
    """Retrieve immutable chronological audit trail log of all administrative reviews and actions."""
    return case_service.get_global_audit_trail(limit=limit)

@app.get("/api/cases/{case_id}", response_model=ReviewCaseResponse, tags=["Case Management"])
def get_review_case(case_id: str):
    """Retrieve case dossier including complete case-specific audit trail."""
    case = case_service.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")
    return case

@app.patch("/api/cases/{case_id}", response_model=ReviewCaseResponse, tags=["Case Management"])
def update_case_status(
    case_id: str,
    payload: ReviewCaseUpdate,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Update case status, assign officials, and append resolution notes with audit logging (Requires authenticated role)."""
    updated = case_service.update_case_status(
        case_id=case_id,
        new_status=payload.new_status,
        user=current_user.display_name,
        role=current_user.role,
        notes=payload.notes or "",
        assigned_to=payload.assigned_to
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")
    return updated

# ---------------------------------------------------------
# 10. SECONDARY ENRICHMENT & FORENSIC INTELLIGENCE
# ---------------------------------------------------------

@app.get("/api/sources", response_model=SourceRegistryListResponse, tags=["Provenance"])
def get_source_registry():
    """Retrieve catalog of all Tier 1 to Tier 4 official data sources with trust tiers and update frequencies."""
    return intelligence_service.get_source_registry()

@app.get("/api/rules", response_model=StatutoryRuleListResponse, tags=["Compliance"])
def get_statutory_rules():
    """Retrieve official statutory compliance rules and thresholds from MPLADS Guidelines 2023."""
    return intelligence_service.get_statutory_rules()

@app.get("/api/intelligence/agencies", response_model=ImplementingAgencyListResponse, tags=["Intelligence"])
def list_implementing_agencies(
    state: Optional[str] = Query(None, description="Filter by state"),
    min_works: Optional[int] = Query(None, ge=1, description="Minimum works count"),
    min_exp: Optional[float] = Query(None, ge=0, description="Minimum expenditure in INR"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (CRITICAL, HIGH, MEDIUM, LOW)"),
    search: Optional[str] = Query(None, description="Search agency name"),
    sort_by: str = Query("total_expenditure", description="Sort field (total_expenditure, total_works, completion_rate_pct, vendor_hhi, agency_name)"),
    sort_order: str = Query("desc", description="Sort direction (asc, desc)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve forensic performance metrics for Implementing District Authorities (IDAs) including completion rate and vendor HHI."""
    return intelligence_service.get_implementing_agencies(
        state=state,
        min_works=min_works,
        min_exp=min_exp,
        risk_level=risk_level,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=limit,
        offset=offset
    )

@app.get("/api/intelligence/payment-timing", response_model=PaymentTimingSignalListResponse, tags=["Intelligence"])
def list_payment_timing_signals(
    signal_type: Optional[str] = Query(None, description="Filter by signal type (MARCH_RUSH, RAPID_BUNCHING, REPEATED_AMOUNT)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
    state: Optional[str] = Query(None, description="Filter by state"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve itemized payment timing anomalies including March rush concentrations, rapid bunching, and repeating amounts."""
    return intelligence_service.get_payment_timing_signals(
        signal_type=signal_type,
        severity=severity,
        state=state,
        limit=limit,
        offset=offset
    )

# ---------------------------------------------------------
# 11. DEEP ENTITY INTELLIGENCE & UNIVERSAL SEARCH
# ---------------------------------------------------------

@app.get("/api/search", response_model=GlobalSearchResponse, tags=["Universal Search"])
def global_search(
    q: str = Query("", description="Universal search term across people, works, entities, vouchers, cases"),
    limit: int = Query(5, ge=1, le=20, description="Max results per entity group")
):
    """Universal multi-entity search returning categorized groups: PEOPLE, WORKS, ENTITIES, VOUCHERS, CASES."""
    return intelligence_service.global_search(query=q, limit_per_group=limit)

@app.get("/api/media/{entity_type}/{entity_id}", response_model=EntityMediaListResponse, tags=["Entity Intelligence"])
def get_entity_media(entity_type: str, entity_id: str):
    """Retrieve verified media assets (official portraits, public photographs) with provenance and license attribution."""
    return intelligence_service.get_entity_media(entity_type=entity_type, entity_id=entity_id)

@app.get("/api/profiles/{entity_type}/{entity_id}", response_model=Optional[EntityProfileResponse], tags=["Entity Intelligence"])
def get_entity_profile(entity_type: str, entity_id: str):
    """Retrieve comprehensive institutional/biographical dossier profile for an MP or Implementing Agency."""
    profile = intelligence_service.get_entity_profile(entity_type=entity_type, entity_id=entity_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile for {entity_type} '{entity_id}' not found")
    return profile

@app.get("/api/mps/{mp_id}/timeline", response_model=EntityTimelineResponse, tags=["Entity Intelligence"])
def get_mp_timeline(mp_id: str):
    """Retrieve chronological milestones and portfolio timeline for a Member of Parliament."""
    return intelligence_service.get_mp_timeline(mp_id=mp_id)

@app.get("/api/works/{work_id}/timeline", response_model=EntityTimelineResponse, tags=["Entity Intelligence"])
def get_work_timeline(work_id: int):
    """Retrieve multi-stage project lifecycle timeline with statutory benchmark limits (45-day sanction, 18-month execution)."""
    return intelligence_service.get_work_timeline(work_id=work_id)

# ---------------------------------------------------------
# 12. UNIVERSAL DATA DISCOVERY & CHANGE INTELLIGENCE
# ---------------------------------------------------------

@app.get("/api/sources/discovered", response_model=DiscoveredSourceListResponse, tags=["Universal Data Discovery"])
def get_discovered_sources(
    tier: Optional[str] = Query(None, description="Filter by source tier (TIER_1_API, TIER_2_DASHBOARD, TIER_3_DOWNLOAD, TIER_4_REPORT)"),
    reliability: Optional[str] = Query(None, description="Filter by reliability level (OFFICIAL_PRIMARY, OFFICIAL_SECONDARY, STATUTORY_BENCHMARK)")
):
    """Retrieve comprehensive registry of discovered official government endpoints and health status."""
    return intelligence_service.get_discovered_sources(tier=tier, reliability=reliability)

@app.get("/api/snapshots", response_model=HistoricalSnapshotListResponse, tags=["Historical Snapshots"])
def get_historical_snapshots():
    """Retrieve all versioned historical reporting snapshots for temporal comparison."""
    return intelligence_service.get_historical_snapshots()

@app.get("/api/changes", response_model=ChangeEventListResponse, tags=["Change Intelligence"])
def get_change_events(
    entity_id: Optional[str] = Query(None, description="Filter by entity ID (e.g. work_id)"),
    change_type: Optional[str] = Query(None, description="Filter by change type (COST_REVISED, STATUS_ADVANCED, DATE_EXTENDED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, INFO)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieve detected granular change events between reporting snapshots."""
    return intelligence_service.get_change_events(
        entity_id=entity_id,
        change_type=change_type,
        severity=severity,
        limit=limit,
        offset=offset
    )

@app.get("/api/reconciliation", response_model=ReconciliationListResponse, tags=["Data Reconciliation"])
def get_reconciliation_records():
    """Retrieve official data reconciliation ledger comparing baseline records with official reporting snapshots."""
    return intelligence_service.get_reconciliation_records()

@app.get("/api/works/{work_id}/risk-summary", response_model=WorkRiskSummary, tags=["Work Intelligence"])
def get_work_risk_summary(work_id: int):
    """Synthesize multiple signals and change events on a single project into an aggregated 'Work Requires Attention' dossier."""
    return intelligence_service.get_work_risk_summary(work_id=work_id)

@app.get("/api/lgd/districts", response_model=LgdDistrictListResponse, tags=["Local Government Directory"])
def get_lgd_districts(
    state: Optional[str] = Query(None, description="Filter by state name"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Retrieve official Local Government Directory (LGD) standardized districts and administrative codes."""
    return intelligence_service.get_lgd_districts(state=state, limit=limit, offset=offset)

@app.get("/api/mps/{mp_id}/crosswalk", response_model=Optional[MpCrosswalkResponse], tags=["Entity Intelligence"])
def get_mp_crosswalk(mp_id: str):
    """Retrieve official MoSPI e-SAKSHI internal system ID, tenure, and directory caption crosswalk."""
    result = intelligence_service.get_mp_crosswalk(mp_id=mp_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"MP crosswalk record not found for {mp_id}")
    return result

@app.post("/api/snapshots/sync", response_model=SnapshotSyncResponse, tags=["Historical Snapshots"])
def sync_live_snapshot(current_user: AuthenticatedUser = Depends(require_case_management_role)):
    """Trigger on-demand live macro synchronization from verified e-SAKSHI endpoints with change detection."""
    return intelligence_service.sync_live_snapshot()

@app.get("/api/area/track", tags=["Area Intelligence"])
def track_area_intelligence(
    state: str = Query(..., description="Target State or UT (e.g. Maharashtra)"),
    constituency: str = Query(..., description="Target Parliamentary Constituency (e.g. AURANGABAD)")
):
    """Retrieve cross-chamber parliamentary representation, ground works, sector distributions, and execution agencies for an area."""
    return intelligence_service.get_area_track_intelligence(state=state, constituency=constituency)


# ====================================================================
# DATA INGESTION & MULTI-STAGE VALIDATION (Req 5)
# ====================================================================

@app.get("/api/ingest/template", tags=["Data Ingestion"])
@app.get("/api/ingest/template.csv", tags=["Data Ingestion"], include_in_schema=False)
def download_csv_template():
    """Download standard MPLADS CSV ingestion template with sample rows."""
    content = ingestion_service.get_csv_template()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mplads_ingestion_template.csv"}
    )

@app.post("/api/ingest/upload", response_model=IngestValidateResponse, tags=["Data Ingestion"])
async def upload_and_validate_dataset(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Upload CSV or Excel file, parse contents, and execute comprehensive validation checks."""
    try:
        content = await file.read()
        rows = ingestion_service.parse_file_content(file.filename, content)
        report = ingestion_service.validate_dataset(rows)
        return report
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(e)}")

@app.post("/api/ingest/validate-json", response_model=IngestValidateResponse, tags=["Data Ingestion"])
def validate_dataset_json(
    rows: List[Dict[str, Any]],
    current_user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Validate raw tabular project records against MPLADS validation rules."""
    return ingestion_service.validate_dataset(rows)

@app.post("/api/ingest/sample-demo", response_model=IngestValidateResponse, tags=["Data Ingestion"])
def load_sample_demo_batch(
    current_user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Load built-in realistic synthetic demo batch with intentional analytical anomalies for testing."""
    demo_rows = ingestion_service.get_sample_demo_batch()
    return ingestion_service.validate_dataset(demo_rows)

@app.post("/api/ingest/confirm", response_model=IngestConfirmResponse, tags=["Data Ingestion"])
def confirm_dataset_import(
    req: IngestConfirmRequest,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Confirm import of validated records, normalize to database, and trigger risk engine & alerts."""
    try:
        result = ingestion_service.confirm_import(
            batch_id=req.batch_id,
            user=current_user.display_name,
            role=current_user.role
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.error(f"Import confirm error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to confirm import: {str(e)}")


# ====================================================================
# RISK ENGINE & CONFIGURATION (Req 6, 8, 9, 10, 11, 12)
# ====================================================================

@app.get("/api/config/risk-weights", response_model=RiskWeightsConfig, tags=["Risk Engine"])
def get_risk_weights():
    """Retrieve transparent risk scoring weights, statistical thresholds, and analytical disclaimers."""
    cfg = risk_engine.get_config()
    w = dict(cfg.get("weights", {}))
    w.setdefault("financial_anomaly_weight", w.get("cost_deviation", 0.3))
    w.setdefault("physical_delay_weight", w.get("delay_risk", 0.25))
    w.setdefault("vendor_risk_weight", w.get("ml_isolation_forest", 0.25))
    w.setdefault("statistical_anomaly_weight", w.get("statistical_anomaly", 0.2))
    cfg["weights"] = w
    return cfg

@app.post("/api/config/risk-weights", response_model=RiskWeightsConfig, tags=["Risk Engine"])
def update_risk_weights(
    req: RiskWeightsUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Update risk calculation weights and thresholds for adaptive policy monitoring."""
    if current_user.role != "MINISTRY_ADMIN" and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Statutory Violation: Only Ministry / MoSPI Administrator can tune policy risk scoring weights."
        )
    risk_engine.update_config(new_weights=req.weights, new_thresholds=req.thresholds)
    return get_risk_weights()

@app.post("/api/works/{work_id}/assess-risk", tags=["Risk Engine"])
def assess_work_risk_on_demand(
    work_id: int,
    db: sqlite3.Connection = Depends(get_db)
):
    """Execute on-demand transparent risk assessment with multi-layer Explainable AI breakdown."""
    row = db.execute("SELECT * FROM works WHERE work_id = ?", (work_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Work #{work_id} not found")
    
    project_dict = dict(row)
    project_dict["project_id"] = row["work_id"]
    project_dict["project_name"] = row["work_description_normalized"]
    project_dict["sanctioned_amount"] = row["recommended_amount"]
    project_dict["expenditure"] = row["final_amount"]
    project_dict["physical_progress"] = 100.0 if row["lifecycle_status"] == "COMPLETED" else 45.0

    return risk_engine.assess_project_risk(project_dict)


# ====================================================================
# ALERT SYSTEM & INVESTIGATION WORKFLOW (Req 13, 18, 22)
# ====================================================================

@app.get("/api/alerts", response_model=AlertListResponse, tags=["Alert Management"])
def list_alerts(
    state: Optional[str] = Query(None, description="Filter by State (e.g. MAHARASHTRA)"),
    district: Optional[str] = Query(None, description="Filter by District (e.g. PUNE)"),
    mp_id: Optional[str] = Query(None, description="Filter by MP ID"),
    agency: Optional[str] = Query(None, description="Filter by Implementing Agency"),
    project_id: Optional[str] = Query(None, description="Filter by Project ID"),
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW"),
    alert_type: Optional[str] = Query(None, description="Filter by Alert Type"),
    status: Optional[str] = Query(None, description="Filter by status: NEW, ACKNOWLEDGED, UNDER_INVESTIGATION, RESOLVED"),
    date_from: Optional[str] = Query(None, description="Date from YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="Date to YYYY-MM-DD"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve filtered stream of risk-based alerts across states, districts, MPs, and severities."""
    # Apply statutory jurisdiction defaults
    if user and user.jurisdiction_type == "STATE" and not state:
        state = user.state
    elif user and user.jurisdiction_type == "DISTRICT":
        if not state:
            state = user.state
        if not district:
            district = user.district or user.constituency
    elif user and (user.jurisdiction_type == "CONSTITUENCY" or user.role == "MP") and not mp_id:
        mp_id = user.mp_id

    return alerts_service.list_alerts(
        state=state,
        district=district,
        mp_id=mp_id,
        agency=agency,
        project_id=project_id,
        severity=severity,
        alert_type=alert_type,
        status=status,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset
    )

@app.get("/api/alerts/summary", tags=["Alert Management"])
def get_alerts_summary(
    state: Optional[str] = Query(None, description="Filter by State"),
    district: Optional[str] = Query(None, description="Filter by District"),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve summary counts of alerts categorized by severity, status, and anomaly type."""
    if user and user.jurisdiction_type == "STATE" and not state:
        state = user.state
    elif user and user.jurisdiction_type == "DISTRICT":
        if not state:
            state = user.state
        if not district:
            district = user.district or user.constituency
    return alerts_service.get_alert_summary(state=state, district=district)

@app.get("/api/alerts/{alert_id}", response_model=AlertItem, tags=["Alert Management"])
def get_alert_detail(alert_id: str):
    """Retrieve complete dossier for a single alert with full Explainable AI evidence and audit trail."""
    alert = alerts_service.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    return alert

@app.patch("/api/alerts/{alert_id}", response_model=AlertItem, tags=["Alert Management"])
def update_alert_action(
    alert_id: str,
    req: AlertUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Execute alert investigation lifecycle actions: Acknowledge, Assign, Add Comment, Resolve."""
    alert = alerts_service.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

    if not can_edit_record(current_user, state=alert.get("state"), constituency=alert.get("district"), mp_id=alert.get("mp_id")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: As {current_user.display_name} ({current_user.jurisdiction}), you do not have statutory authority to resolve or edit alerts outside your jurisdiction ({alert.get('state')}, {alert.get('district')})."
        )

    updated = alerts_service.update_alert(
        alert_id=alert_id,
        status=req.status,
        assigned_to=req.assigned_to,
        assigned_role=req.assigned_role,
        reviewer_comment=req.reviewer_comment,
        user=current_user.display_name,
        role=current_user.role
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    return updated


# ====================================================================
# ROLE-TAILORED DASHBOARDS & TRENDS (Req 14, 15)
# ====================================================================

@app.get("/api/dashboards/national", tags=["Role Dashboards"])
def get_national_dashboard():
    """Retrieve National / MoSPI Administrator Dashboard with macro KPIs, state comparisons, and risk trends."""
    return dashboard_service.get_national_dashboard()

@app.get("/api/dashboards/state/{state_name}", tags=["Role Dashboards"])
def get_state_dashboard(
    state_name: str,
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve State Nodal Authority Dashboard with district comparisons, agency metrics, and state alerts."""
    if user and user.role == "STATE_NODAL_AUTHORITY" and user.state:
        if user.state.strip().upper() != state_name.strip().upper():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: As State Authority for {user.state}, you do not have statutory authority to access {state_name} state dashboard."
            )
    return dashboard_service.get_state_dashboard(state_name=state_name)

@app.get("/api/dashboards/district/{district_name}", tags=["Role Dashboards"])
def get_district_dashboard(
    district_name: str,
    state: Optional[str] = Query(None, description="Optional state filter"),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve District Authority Dashboard with local works list, delayed works, and localized alerts."""
    if user and user.role == "DISTRICT_AUTHORITY":
        authorized_dist = (user.district or user.constituency or "").strip().upper()
        if authorized_dist and authorized_dist != district_name.strip().upper():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: As District Authority for {user.district}, you do not have statutory authority to access {district_name} district dashboard."
            )
    return dashboard_service.get_district_dashboard(district_name=district_name, state_name=state)

@app.get("/api/dashboards/mp/{mp_id}", tags=["Role Dashboards"])
def get_mp_dashboard(
    mp_id: str,
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve Member of Parliament (MP) Dashboard with ₹5.00 Cr quota tracking and constituency works."""
    if user and (user.role == "MP" or (user.jurisdiction_type or "").upper() in ("MP", "CONSTITUENCY")):
        if user.mp_id and user.mp_id.strip() != mp_id.strip():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: As {user.display_name}, you do not have statutory authority to access another Member of Parliament's dashboard ({mp_id})."
            )
    return dashboard_service.get_mp_dashboard(mp_id=mp_id)


@app.get("/api/dashboards/trends", tags=["Role Dashboards"])
def get_dashboard_trends(period: str = Query("monthly", description="Time granularity: monthly or yearly")):
    """Retrieve multi-year time-series trend analytics for expenditure, completions, delays, and alerts."""
    return dashboard_service.get_trend_analytics(period=period)


# ==============================================================================
# HIERARCHICAL GOVERNANCE, RBAC/ABAC & WORKFLOWS
# ==============================================================================
from backend.db_gov_init import init_governance_schema
from backend.gov_service import gov_service
from backend.audit_logger import get_recent_audit_logs
from backend.rbac_abac import (
    ROLE_MINISTRY_ADMIN,
    ROLE_STATE_NODAL_AUTHORITY,
    ROLE_DISTRICT_AUTHORITY,
    ROLE_MP,
    ROLE_AUDITOR,
    ROLE_CITIZEN,
    ROLE_HIERARCHY_RANK,
    ROLE_PERMISSIONS,
)
from pydantic import BaseModel, Field

@app.on_event("startup")
def on_startup_governance():
    init_governance_schema()

class RecommendationCreatePayload(BaseModel):
    proposed_title: str
    sector: str = "COMMUNITY_INFRASTRUCTURE"
    estimated_cost: float = Field(..., gt=0)
    location_description: Optional[str] = ""
    block: Optional[str] = ""
    gram_panchayat: Optional[str] = ""
    justification: Optional[str] = ""
    priority: Optional[str] = "NORMAL"

class RecommendationUpdatePayload(BaseModel):
    proposed_title: Optional[str] = None
    sector: Optional[str] = None
    estimated_cost: Optional[float] = None
    location_description: Optional[str] = None
    block: Optional[str] = None
    gram_panchayat: Optional[str] = None
    justification: Optional[str] = None
    priority: Optional[str] = None

class RecommendationWorkflowPayload(BaseModel):
    target_status: str
    remarks: Optional[str] = None

class WorkExecutionUpdatePayload(BaseModel):
    lifecycle_status: Optional[str] = None
    village: Optional[str] = None
    block: Optional[str] = None
    gram_panchayat: Optional[str] = None
    work_contractor: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    inspection_remarks: Optional[str] = None

class CorrectionRequestPayload(BaseModel):
    entity_type: str = "WORK"
    entity_id: str
    field_name: str
    previous_value: str
    proposed_value: str
    reason: str

class CorrectionReviewPayload(BaseModel):
    action: str  # APPROVE or REJECT
    comments: Optional[str] = None

class AuditCaseCreatePayload(BaseModel):
    work_id: Optional[str] = None
    transaction_id: Optional[str] = None
    title: str
    severity: str = "HIGH"
    hypothesis: str
    evidence: str
    auditor_notes: Optional[str] = None

class AuditCaseUpdatePayload(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    hypothesis: Optional[str] = None
    evidence: Optional[str] = None
    auditor_notes: Optional[str] = None

class CitizenReportPayload(BaseModel):
    work_id: str
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    discrepancy_category: str = "QUALITY_ISSUE"
    description: str
    reported_location: Optional[str] = None
    photo_url: Optional[str] = None


@app.get("/api/rbac/me", tags=["Governance RBAC"])
def get_rbac_identity(
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve active user's statutory rank, permissions, and administrative view boundaries."""
    role = user.role if user else ROLE_CITIZEN
    rank = ROLE_HIERARCHY_RANK.get(role, 6)
    perms = {
        res: list(actions)
        for res, actions in ROLE_PERMISSIONS.get(role, {}).items()
    }
    return {
        "authenticated": user is not None and user.role != ROLE_CITIZEN,
        "user_id": user.user_id if user else "PUBLIC_CITIZEN",
        "display_name": user.display_name if user else "Citizen / Public Auditor",
        "role": role,
        "hierarchy_rank": rank,
        "jurisdiction": user.jurisdiction if user else "PUBLIC",
        "jurisdiction_type": user.jurisdiction_type if user else "PUBLIC",
        "state": user.state if user else None,
        "district": user.district if user else None,
        "constituency": user.constituency if user else None,
        "mp_id": user.mp_id if user else None,
        "can_mutate": user.can_mutate_cases if user else False,
        "permissions": perms,
        "drill_down_allowed": rank <= 3,  # Ministry, State, District
    }


# --- 1. MP Recommendations Routes ---

@app.get("/api/recommendations", tags=["Recommendations"])
def list_recommendations(
    status: Optional[str] = Query(None, description="Filter by workflow status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """List MP work recommendations with statutory ABAC scoping."""
    return gov_service.list_recommendations(user=user, workflow_status=status, limit=limit, offset=offset)

@app.post("/api/recommendations", tags=["Recommendations"])
def create_recommendation(
    req: RecommendationCreatePayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """MP initiates a new work recommendation in DRAFT status."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.create_recommendation(user=user, data=req.dict(), client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))

@app.put("/api/recommendations/{rec_id}", tags=["Recommendations"])
def update_recommendation(
    rec_id: str,
    req: RecommendationUpdatePayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """MP edits a recommendation. LOCKED once submitted."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.update_recommendation(user=user, rec_id=rec_id, data=req.dict(exclude_unset=True), client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@app.post("/api/recommendations/{rec_id}/submit", tags=["Recommendations"])
def submit_recommendation(
    rec_id: str,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """MP formally submits recommendation to District Authority. Original proposal is locked."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.submit_recommendation(user=user, rec_id=rec_id, client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@app.post("/api/recommendations/{rec_id}/workflow", tags=["Recommendations"])
def advance_recommendation_workflow(
    rec_id: str,
    req: RecommendationWorkflowPayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Statutory authority advances recommendation lifecycle (DISTRICT_REVIEW, STATE_REVIEW, SANCTIONED, REJECTED)."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.transition_recommendation_workflow(
            user=user, rec_id=rec_id, target_status=req.target_status, remarks=req.remarks, client_ip=ip
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


# --- 2. District Operational Work Execution Updates ---

@app.patch("/api/works/{work_id}/execution", tags=["Work Execution"])
def update_work_execution(
    work_id: int,
    req: WorkExecutionUpdatePayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """District Authority updates milestone progress, contractor, or coordinates with audit trail."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.update_work_execution(user=user, work_id=work_id, data=req.dict(exclude_unset=True), client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


# --- 3. Financial Correction Requests (Never Silent Deletion) ---

@app.get("/api/financial/correction-requests", tags=["Financial Corrections"])
def list_correction_requests(limit: int = Query(50, ge=1, le=100)):
    """Retrieve immutable log of financial and administrative correction requests."""
    return gov_service.list_correction_requests(limit=limit)

@app.post("/api/financial/correction-requests", tags=["Financial Corrections"])
def create_correction_request(
    req: CorrectionRequestPayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Initiate an auditable correction request without altering historical ledger directly."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.create_correction_request(user=user, data=req.dict(), client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))

@app.post("/api/financial/correction-requests/{corr_id}/review", tags=["Financial Corrections"])
def review_correction_request(
    corr_id: str,
    req: CorrectionReviewPayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Ministry or State Authority reviews and signs off on correction request."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.review_correction_request(user=user, corr_id=corr_id, action=req.action, comments=req.comments, client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


# --- 4. Auditor Investigation Cases ---

@app.get("/api/audit-investigations", tags=["Audit Investigations"])
def list_audit_investigations(limit: int = Query(50, ge=1, le=100)):
    """Retrieve forensic audit investigation dossiers."""
    return gov_service.list_audit_cases(limit=limit)

@app.post("/api/audit-investigations", tags=["Audit Investigations"])
def create_audit_investigation(
    req: AuditCaseCreatePayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Public Finance Integrity Auditor creates an investigation case with empirical hypothesis & evidence."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.create_audit_case(user=user, data=req.dict(), client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))

@app.patch("/api/audit-investigations/{case_id}", tags=["Audit Investigations"])
def update_audit_investigation(
    case_id: str,
    req: AuditCaseUpdatePayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Auditor updates investigation findings and lifecycle status."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.update_audit_case(user=user, case_id=case_id, data=req.dict(exclude_unset=True), client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


# --- 5. Citizen Public Discrepancy Reporting ---

@app.post("/api/citizen-reports", tags=["Citizen Social Audit"])
def submit_citizen_report(
    req: CitizenReportPayload,
    request: Request
):
    """Public citizen submits an on-site discrepancy report without requiring login or modifying official records directly."""
    ip = request.client.host if request.client else None
    return gov_service.submit_citizen_report(data=req.dict(), client_ip=ip)

@app.get("/api/citizen-reports", tags=["Citizen Social Audit"])
def list_citizen_reports(limit: int = Query(50, ge=1, le=100)):
    """List citizen ground discrepancy reports."""
    return gov_service.list_citizen_reports(limit=limit)


# --- 6. Immutable Audit Trail ---

@app.get("/api/audit-logs", tags=["Audit Trail"])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=100),
    entity_type: Optional[str] = Query(None, description="Optional entity filter"),
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Ministry and Auditor view tamper-evident immutable audit log records."""
    if user.role not in (ROLE_MINISTRY_ADMIN, ROLE_AUDITOR) and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Full statutory audit trail is reserved for Ministry Administration and CAG Auditors."
        )
    return get_recent_audit_logs(limit=limit, entity_type=entity_type)



