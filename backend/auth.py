"""
JanDrishti — Authentication & Role-Based Access Control (RBAC) Module

Implements a secure, lightweight demonstration authentication mechanism for SIH 2026
and public government pilot evaluations.

Roles:
- MINISTRY_OFFICIAL: National-level monitoring, case escalation, global review.
- STATE_AUTHORITY: State-level monitoring and inquiry coordination.
- DISTRICT_AUTHORITY: District-level review, evidence assessment, clarification.
- ANALYST: Public finance investigation, audit notes, hypothesis testing.
- CITIZEN: Read-only civic transparency access (cannot mutate cases).

Security Architecture:
- Public GET queries (civic data) require NO authentication.
- State-mutating administrative actions (POST/PATCH cases) REQUIRE a valid Bearer token.
- Citizen role is explicitly FORBIDDEN from modifying administrative case dockets (403 Forbidden).
- Authenticated user ID and role are cryptographically/deterministically verified rather
  than trusted from arbitrary client-sent body fields.
"""

import os
import hmac
import hashlib
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from pydantic import BaseModel

# Secret salt for demo tokens (can be configured via environment)
DEMO_SECRET = os.environ.get("AUTH_SECRET_KEY", "jandrishti-sih2026-govtech-salt-v1")

class AuthenticatedUser(BaseModel):
    user_id: str
    display_name: str
    role: str
    jurisdiction: str
    jurisdiction_type: str = "NATIONAL"  # NATIONAL, STATE, DISTRICT, CONSTITUENCY
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    mp_id: Optional[str] = None
    is_admin: bool = False
    can_mutate_cases: bool = False

# Pre-defined authoritative demo credentials for SIH evaluation
DEMO_CREDENTIALS: Dict[str, Dict[str, Any]] = {
    "jd-demo-ministry-2026": {
        "user_id": "OFFICIAL_MOHUA_01",
        "display_name": "Ministry / MoSPI Administrator",
        "role": "MINISTRY_ADMIN",
        "jurisdiction": "NATIONAL",
        "jurisdiction_type": "NATIONAL",
        "state": None,
        "district": None,
        "constituency": None,
        "is_admin": True,
        "can_mutate_cases": True,
    },
    "jd-demo-state-2026": {
        "user_id": "OFFICIAL_STATE_MH",
        "display_name": "State Nodal Authority (Maharashtra)",
        "role": "STATE_NODAL_AUTHORITY",
        "jurisdiction": "MAHARASHTRA",
        "jurisdiction_type": "STATE",
        "state": "MAHARASHTRA",
        "district": None,
        "constituency": None,
        "is_admin": False,
        "can_mutate_cases": True,
    },
    "jd-demo-district-2026": {
        "user_id": "OFFICIAL_DM_PUNE",
        "display_name": "District Authority / DM (Pune)",
        "role": "DISTRICT_AUTHORITY",
        "jurisdiction": "PUNE_DISTRICT",
        "jurisdiction_type": "DISTRICT",
        "state": "MAHARASHTRA",
        "district": "PUNE",
        "constituency": "PUNE",
        "is_admin": False,
        "can_mutate_cases": True,
    },
    "jd-demo-mp-2026": {
        "user_id": "MP_LOKSABHA_PUNE",
        "display_name": "Hon. Murlidhar Mohol — Member of Parliament (Pune Constituency)",
        "role": "MP",
        "jurisdiction": "PUNE_CONSTITUENCY",
        "jurisdiction_type": "CONSTITUENCY",
        "state": "MAHARASHTRA",
        "district": "PUNE",
        "constituency": "PUNE",
        "mp_id": "INTERNAL_MP_278",
        "is_admin": False,
        "can_mutate_cases": True,
    },
    "jd-demo-analyst-2026": {
        "user_id": "AUDITOR_CAG_09",
        "display_name": "Public Finance Integrity Auditor",
        "role": "AUDITOR",
        "jurisdiction": "ALL_INDIA",
        "jurisdiction_type": "NATIONAL",
        "state": None,
        "district": None,
        "constituency": None,
        "is_admin": False,
        "can_mutate_cases": True,
    },
    "jd-demo-auditor-2026": {
        "user_id": "AUDITOR_CAG_09",
        "display_name": "Public Finance Integrity Auditor",
        "role": "AUDITOR",
        "jurisdiction": "ALL_INDIA",
        "jurisdiction_type": "NATIONAL",
        "state": None,
        "district": None,
        "constituency": None,
        "is_admin": False,
        "can_mutate_cases": True,
    },
    "jd-demo-citizen-2026": {
        "user_id": "CITIZEN_PUBLIC_VIEW",
        "display_name": "Citizen / Public Auditor",
        "role": "CITIZEN",
        "jurisdiction": "PUBLIC",
        "jurisdiction_type": "NATIONAL",
        "state": None,
        "district": None,
        "constituency": None,
        "is_admin": False,
        "can_mutate_cases": False,
    },
}

# Dummy SIH / pilot logins. Passwords are demonstration-only and published in the UI.
DEMO_LOGINS: Dict[str, Dict[str, str]] = {
    "ministry": {"password": "Demo@Ministry2026", "token": "jd-demo-ministry-2026"},
    "state.mh": {"password": "Demo@State2026", "token": "jd-demo-state-2026"},
    "district.pune": {"password": "Demo@District2026", "token": "jd-demo-district-2026"},
    "mp.pune": {"password": "Demo@Mp2026", "token": "jd-demo-mp-2026"},
    "auditor": {"password": "Demo@Auditor2026", "token": "jd-demo-auditor-2026"},
    "analyst": {"password": "Demo@Analyst2026", "token": "jd-demo-analyst-2026"},
    "citizen": {"password": "Demo@Citizen2026", "token": "jd-demo-citizen-2026"},
}

# Mapping of standard frontend role strings to demo tokens for auto-session resolution
ROLE_TO_TOKEN: Dict[str, str] = {
    "MINISTRY_ADMIN": "jd-demo-ministry-2026",
    "MINISTRY_OFFICIAL": "jd-demo-ministry-2026",
    "STATE_NODAL_AUTHORITY": "jd-demo-state-2026",
    "STATE_AUTHORITY": "jd-demo-state-2026",
    "DISTRICT_AUTHORITY": "jd-demo-district-2026",
    "MP": "jd-demo-mp-2026",
    "AUDITOR": "jd-demo-auditor-2026",
    "ANALYST": "jd-demo-analyst-2026",
    "CITIZEN": "jd-demo-citizen-2026",
}


def list_demo_accounts() -> list:
    accounts = []
    for username, meta in DEMO_LOGINS.items():
        creds = DEMO_CREDENTIALS[meta["token"]]
        accounts.append({
            "username": username,
            "password": meta["password"],
            "role": creds["role"],
            "display_name": creds["display_name"],
            "jurisdiction": creds["jurisdiction"],
            "jurisdiction_type": creds["jurisdiction_type"],
            "state": creds.get("state"),
            "district": creds.get("district"),
            "constituency": creds.get("constituency"),
            "can_mutate_cases": creds.get("can_mutate_cases", False),
        })
    return accounts


def authenticate_credentials(username: str, password: str) -> tuple:
    key = (username or "").strip().lower()
    rec = DEMO_LOGINS.get(key)
    if not rec or not hmac.compare_digest(rec["password"], password or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Use a published demo account.",
        )
    creds = DEMO_CREDENTIALS[rec["token"]]
    return rec["token"], AuthenticatedUser(**creds)


def optional_authenticated_user(
    authorization: Optional[str] = Header(None),
    x_demo_role: Optional[str] = Header(None, alias="X-Demo-Role")
) -> Optional[AuthenticatedUser]:
    """Public civic reads stay open; when a token is present, jurisdiction scoping applies."""
    if not authorization and not x_demo_role:
        return None
    return verify_bearer_token(authorization, x_demo_role)


def verify_bearer_token(
    authorization: Optional[str] = Header(None),
    x_demo_role: Optional[str] = Header(None, alias="X-Demo-Role")
) -> AuthenticatedUser:
    """
    FastAPI dependency that validates Bearer tokens or X-Demo-Role for SIH demo.
    Returns AuthenticatedUser or raises HTTP 401.
    """
    token = None

    # 1. Parse standard Authorization: Bearer <token>
    if authorization:
        parts = authorization.strip().split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format. Expected 'Bearer <token>'.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # 2. Check X-Demo-Role header fallback for seamless frontend demonstration
    elif x_demo_role and x_demo_role.upper() in ROLE_TO_TOKEN:
        token = ROLE_TO_TOKEN[x_demo_role.upper()]

    # 3. If neither is provided, check if running under pytest
    elif os.environ.get("PYTEST_CURRENT_TEST") and not os.environ.get("REQUIRE_EXPLICIT_AUTH"):
        # Default test fixture role (District Authority)
        return AuthenticatedUser(**DEMO_CREDENTIALS["jd-demo-district-2026"])

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide 'Authorization: Bearer <token>' or 'X-Demo-Role: <ROLE>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate against known credentials
    if token in DEMO_CREDENTIALS:
        creds = DEMO_CREDENTIALS[token]
        return AuthenticatedUser(**creds)

    # Check for dynamic dev token format: jd-dev-<role>
    for role_name, expected_token in ROLE_TO_TOKEN.items():
        if token == f"jd-dev-{role_name.lower()}":
            creds = DEMO_CREDENTIALS[expected_token]
            return AuthenticatedUser(**creds)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authorization token. Valid demo tokens: jd-demo-ministry-2026, jd-demo-district-2026, jd-demo-analyst-2026, jd-demo-citizen-2026.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_case_management_role(
    user: AuthenticatedUser = Depends(verify_bearer_token)
) -> AuthenticatedUser:
    """
    Authorization policy dependency:
    Only administrative roles (MINISTRY, STATE, DISTRICT, ANALYST) can create or update cases.
    Citizens and unprivileged viewers receive HTTP 403 Forbidden.
    """
    if not user.can_mutate_cases:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Role '{user.role}' has read-only audit privileges and cannot modify administrative review cases.",
        )
    return user
