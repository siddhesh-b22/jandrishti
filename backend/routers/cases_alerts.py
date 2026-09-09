from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Depends, status

from backend.auth import (
    optional_authenticated_user,
    require_case_management_role,
    AuthenticatedUser
)
from backend.scope import can_edit_record
from backend.schemas import (
    AlertItem,
    AlertListResponse,
    AlertUpdateRequest,
    ReviewCaseResponse,
    ReviewCaseListResponse,
    ReviewCaseCreate,
    ReviewCaseUpdate,
    AuditLogItem,
)
from backend.alerts_service import alerts_service
from backend.cases import case_service

router = APIRouter(tags=["Case Management & Alerts"])

# ---------------------------------------------------------
# ALERTS SYSTEM
# ---------------------------------------------------------

@router.get("/api/alerts", response_model=AlertListResponse)
def list_alerts(
    state: Optional[str] = Query(None, description="Filter by State"),
    district: Optional[str] = Query(None, description="Filter by District"),
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
    """Retrieve filtered stream of risk-based alerts."""
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

@router.get("/api/alerts/summary")
def get_alerts_summary(
    state: Optional[str] = Query(None, description="Filter by State"),
    district: Optional[str] = Query(None, description="Filter by District"),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve summary counts of alerts categorized by severity and status."""
    if user and user.jurisdiction_type == "STATE" and not state:
        state = user.state
    elif user and user.jurisdiction_type == "DISTRICT":
        if not state:
            state = user.state
        if not district:
            district = user.district or user.constituency
    return alerts_service.get_alert_summary(state=state, district=district)

@router.get("/api/alerts/{alert_id}", response_model=AlertItem)
def get_alert_detail(alert_id: str):
    """Retrieve complete dossier for a single alert with Explainable AI evidence."""
    alert = alerts_service.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    return alert

@router.patch("/api/alerts/{alert_id}", response_model=AlertItem)
def update_alert_action(
    alert_id: str,
    req: AlertUpdateRequest,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Execute alert investigation lifecycle actions."""
    alert = alerts_service.get_alert(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

    if not can_edit_record(current_user, state=alert.get("state"), constituency=alert.get("district"), mp_id=alert.get("mp_id")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: As {current_user.display_name} ({current_user.jurisdiction}), you cannot edit alerts outside your jurisdiction."
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

# ---------------------------------------------------------
# CASE MANAGEMENT & AUDIT TRAIL
# ---------------------------------------------------------

@router.get("/api/cases", response_model=ReviewCaseListResponse)
def list_review_cases(
    status: Optional[str] = Query(None, description="Filter by status"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    category: Optional[str] = Query(None, description="Filter by category"),
    role: Optional[str] = Query(None, description="Filter by assigned role"),
    search: Optional[str] = Query(None, description="Keyword search query"),
    sort_by: str = Query("newest", description="Sort order ('newest' or 'risk_score')"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """List operational review cases with risk scores and current status."""
    return case_service.list_cases(
        status=status,
        severity=severity,
        category=category,
        role=role,
        search=search,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )

@router.post("/api/cases", response_model=ReviewCaseResponse, status_code=status.HTTP_201_CREATED)
def create_review_case(
    payload: ReviewCaseCreate,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Initiate a formal administrative review case from a flagged anomaly."""
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

@router.get("/api/cases/audit-trail", response_model=List[AuditLogItem])
def get_global_audit_trail(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """Retrieve immutable chronological audit trail log."""
    return case_service.get_global_audit_trail(limit=limit, offset=offset)

@router.get("/api/cases/{case_id}", response_model=ReviewCaseResponse)
def get_review_case(case_id: str):
    """Retrieve case dossier including complete case-specific audit trail."""
    case = case_service.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")
    return case

@router.patch("/api/cases/{case_id}", response_model=ReviewCaseResponse)
def update_case_status(
    case_id: str,
    payload: ReviewCaseUpdate,
    current_user: AuthenticatedUser = Depends(require_case_management_role)
):
    """Update case status, assign officials, and append resolution notes."""
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
