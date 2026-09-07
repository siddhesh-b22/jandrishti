import sqlite3
from typing import Optional, List, Any
from fastapi import APIRouter, HTTPException, Query, Depends, status

from backend.database import get_db
from backend.auth import optional_authenticated_user, AuthenticatedUser
from backend.scope import jurisdiction_clause, get_user_scope_params
from backend.schemas import MPResponse, MPDetailResponse, MPListResponse, EntityTimelineResponse
from backend.intelligence import intelligence_service

router = APIRouter(prefix="/api/mps", tags=["MPs"])

@router.get("", response_model=MPListResponse)
def list_mps(
    house: Optional[str] = Query(None, description="Filter by house (LOK_SABHA, RAJYA_SABHA, ALL)"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    constituency: Optional[str] = Query(None, description="Filter by constituency name"),
    search: Optional[str] = Query(None, description="Search MP name or constituency"),
    min_utilization: Optional[float] = Query(None, ge=0.0, le=100.0, description="Minimum utilization %"),
    max_utilization: Optional[float] = Query(None, ge=0.0, le=100.0, description="Maximum utilization %"),
    sort_by: str = Query("allocated_amount", description="Field to sort by"),
    sort_order: str = Query("desc", pattern="^(?i)(asc|desc)$", description="Sort order (asc or desc)"),
    limit: int = Query(50, ge=1, le=200, description="Page limit"),
    offset: int = Query(0, ge=0, description="Page offset"),
    conn: sqlite3.Connection = Depends(get_db),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
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

@router.get("/{mp_id}", response_model=MPDetailResponse)
def get_mp_detail(mp_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Retrieve detailed profile for a specific MP."""
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

@router.get("/{mp_id}/timeline", response_model=EntityTimelineResponse)
def get_mp_timeline(mp_id: str):
    """Retrieve chronological milestones and portfolio timeline for an MP."""
    return intelligence_service.get_mp_timeline(mp_id=mp_id)
