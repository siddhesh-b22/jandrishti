from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends, status

from backend.auth import optional_authenticated_user, AuthenticatedUser
from backend.dashboards import dashboard_service

router = APIRouter(prefix="/api/dashboards", tags=["Role Dashboards"])

@router.get("/national")
def get_national_dashboard():
    """Retrieve National / MoSPI Administrator Dashboard with macro KPIs and risk trends."""
    return dashboard_service.get_national_dashboard()

@router.get("/state/{state_name}")
def get_state_dashboard(
    state_name: str,
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve State Nodal Authority Dashboard with district comparisons."""
    if user and user.role == "STATE_NODAL_AUTHORITY" and user.state:
        if user.state.strip().upper() != state_name.strip().upper():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: As State Authority for {user.state}, you cannot access {state_name} state dashboard."
            )
    return dashboard_service.get_state_dashboard(state_name=state_name)

@router.get("/district/{district_name}")
def get_district_dashboard(
    district_name: str,
    state: Optional[str] = Query(None, description="Optional state filter"),
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve District Authority Dashboard with local works and delays."""
    if user and user.role == "DISTRICT_AUTHORITY":
        authorized_dist = (user.district or user.constituency or "").strip().upper()
        if authorized_dist and authorized_dist != district_name.strip().upper():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: As District Authority for {user.district}, you cannot access {district_name} district dashboard."
            )
    return dashboard_service.get_district_dashboard(district_name=district_name, state_name=state)

@router.get("/mp/{mp_id}")
def get_mp_dashboard(
    mp_id: str,
    user: Optional[AuthenticatedUser] = Depends(optional_authenticated_user)
):
    """Retrieve Member of Parliament (MP) Dashboard with quota and constituency works."""
    if user and (user.role == "MP" or (user.jurisdiction_type or "").upper() in ("MP", "CONSTITUENCY")):
        if user.mp_id and user.mp_id.strip() != mp_id.strip():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: As {user.display_name}, you cannot access another MP's dashboard ({mp_id})."
            )
    return dashboard_service.get_mp_dashboard(mp_id=mp_id)

@router.get("/trends")
def get_dashboard_trends(period: str = Query("monthly", description="Time granularity: monthly or yearly")):
    """Retrieve multi-year time-series trend analytics."""
    return dashboard_service.get_trend_analytics(period=period)
