import sqlite3
from typing import Optional, List, Any
from fastapi import APIRouter, HTTPException, Query, Depends, status

from backend.database import get_db
from backend.auth import optional_authenticated_user, AuthenticatedUser
from backend.scope import jurisdiction_clause, get_user_scope_params
from backend.schemas import (
    WorkDetailResponse,
    WorkListResponse,
    TransactionDetailResponse,
    TransactionListResponse,
    VendorDetailResponse,
    VendorListResponse,
    EntityTimelineResponse
)
from backend.intelligence import intelligence_service

router = APIRouter(tags=["Works, Transactions & Vendors"])

# ---------------------------------------------------------
# PHYSICAL WORKS
# ---------------------------------------------------------

@router.get("/api/works", response_model=WorkListResponse)
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
        where_clauses.append("(ida_normalized LIKE ? OR constituency_normalized LIKE ?)")
        d_param = f"%{district.strip().upper()}%"
        params.extend([d_param, d_param])
    if constituency and constituency.strip():
        where_clauses.append("constituency_normalized = ?")
        params.append(constituency.strip().upper())
    if mp_id and mp_id.strip():
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

@router.get("/api/works/{work_id}", response_model=WorkDetailResponse)
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

@router.get("/api/works/{work_id}/timeline", response_model=EntityTimelineResponse)
def get_work_timeline(work_id: int):
    """Retrieve multi-stage project lifecycle timeline."""
    return intelligence_service.get_work_timeline(work_id=work_id)

# ---------------------------------------------------------
# EXPENDITURE TRANSACTIONS
# ---------------------------------------------------------

@router.get("/api/transactions", response_model=TransactionListResponse)
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

@router.get("/api/transactions/{transaction_id}", response_model=TransactionDetailResponse)
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
# VENDORS & CONTRACTORS
# ---------------------------------------------------------

@router.get("/api/vendors", response_model=VendorListResponse)
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

@router.get("/api/vendors/{vendor_id}", response_model=VendorDetailResponse)
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
