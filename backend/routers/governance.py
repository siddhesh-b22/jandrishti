from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends, Request, status
from pydantic import BaseModel, Field

from backend.auth import (
    optional_authenticated_user,
    verify_bearer_token,
    AuthenticatedUser
)
from backend.gov_service import gov_service
from backend.audit_logger import get_recent_audit_logs
from backend.rbac_abac import (
    ROLE_CITIZEN,
    ROLE_HIERARCHY_RANK,
    ROLE_PERMISSIONS,
)

router = APIRouter(tags=["Governance & RBAC Workflows"])

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

@router.get("/api/rbac/me")
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
        "drill_down_allowed": rank <= 3,
    }

# 1. MP Recommendations Routes
@router.get("/api/recommendations")
def list_recommendations(
    status: Optional[str] = Query(None, description="Filter by workflow status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """List MP work recommendations with statutory ABAC scoping."""
    return gov_service.list_recommendations(user=user, workflow_status=status, limit=limit, offset=offset)

@router.post("/api/recommendations")
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

@router.put("/api/recommendations/{rec_id}")
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

@router.post("/api/recommendations/{rec_id}/submit")
def submit_recommendation(
    rec_id: str,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """MP formally submits recommendation to District Authority."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.submit_recommendation(user=user, rec_id=rec_id, client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/api/recommendations/{rec_id}/workflow")
def advance_recommendation_workflow(
    rec_id: str,
    req: RecommendationWorkflowPayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Statutory authority advances recommendation lifecycle."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.transition_recommendation_workflow(
            user=user, rec_id=rec_id, target_status=req.target_status, remarks=req.remarks, client_ip=ip
        )
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

# 2. District Operational Work Execution Updates
@router.patch("/api/works/{work_id}/execution")
def update_work_execution(
    work_id: int,
    req: WorkExecutionUpdatePayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """District Authority updates milestone progress or contractor."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.update_work_execution(user=user, work_id=work_id, data=req.dict(exclude_unset=True), client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

# 3. Financial Correction Requests
@router.get("/api/financial/correction-requests")
def list_correction_requests(limit: int = Query(50, ge=1, le=100)):
    """Retrieve immutable log of financial and administrative correction requests."""
    return gov_service.list_correction_requests(limit=limit)

@router.post("/api/financial/correction-requests")
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

@router.post("/api/financial/correction-requests/{corr_id}/review")
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

# 4. Auditor Investigation Cases
@router.get("/api/audit-investigations")
def list_audit_investigations(limit: int = Query(50, ge=1, le=100)):
    """Retrieve forensic audit investigation dossiers."""
    return gov_service.list_audit_cases(limit=limit)

@router.post("/api/audit-investigations")
def create_audit_investigation(
    req: AuditCaseCreatePayload,
    request: Request,
    user: AuthenticatedUser = Depends(verify_bearer_token)
):
    """Integrity Auditor creates an investigation case with empirical hypothesis & evidence."""
    try:
        ip = request.client.host if request.client else None
        return gov_service.create_audit_case(user=user, data=req.dict(), client_ip=ip)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))

@router.patch("/api/audit-investigations/{case_id}")
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

# 5. Citizen Public Discrepancy Reporting
@router.post("/api/citizen-reports")
def submit_citizen_report(
    req: CitizenReportPayload,
    request: Request
):
    """Public citizen submits an on-site discrepancy report."""
    ip = request.client.host if request.client else None
    return gov_service.submit_citizen_report(data=req.dict(), client_ip=ip)

@router.get("/api/citizen-reports")
def list_citizen_reports(limit: int = Query(50, ge=1, le=100)):
    """List citizen ground discrepancy reports."""
    return gov_service.list_citizen_reports(limit=limit)

# 6. Immutable Audit Trail
@router.get("/api/audit-logs")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=100),
    entity_type: Optional[str] = Query(None, description="Optional entity filter"),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """View tamper-evident immutable audit log records with SHA-256 provenance."""
    return get_recent_audit_logs(limit=limit, entity_type=entity_type)
