"""
JanDrishti — Centralized Statutory RBAC & ABAC Policy Engine
Enforces:
1. RBAC (What a role can perform)
2. ABAC (Where, on which record, and under which workflow state it can be performed)
3. Field-Level Permissions (Preventing unauthorized field mutations)
4. Strict Separation of Powers across Indian Public Finance Governance Tiers
"""

from typing import Optional, Dict, Any, Tuple, List, Set
from fastapi import HTTPException, status, Depends
from backend.auth import AuthenticatedUser, verify_bearer_token, optional_authenticated_user

# ==============================================================================
# STATUTORY ROLES HIERARCHY
# ==============================================================================
ROLE_MINISTRY_ADMIN = "MINISTRY_ADMIN"
ROLE_STATE_NODAL_AUTHORITY = "STATE_NODAL_AUTHORITY"
ROLE_DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
ROLE_MP = "MP"
ROLE_AUDITOR = "AUDITOR"
ROLE_CITIZEN = "CITIZEN"

ALL_ROLES = {
    ROLE_MINISTRY_ADMIN,
    ROLE_STATE_NODAL_AUTHORITY,
    ROLE_DISTRICT_AUTHORITY,
    ROLE_MP,
    ROLE_AUDITOR,
    ROLE_CITIZEN,
}

# Role hierarchy ranks (Lower number = Higher administrative authority)
ROLE_HIERARCHY_RANK: Dict[str, int] = {
    ROLE_MINISTRY_ADMIN: 1,
    ROLE_STATE_NODAL_AUTHORITY: 2,
    ROLE_DISTRICT_AUTHORITY: 3,
    ROLE_MP: 4,
    ROLE_AUDITOR: 5,
    ROLE_CITIZEN: 6,
}

# ==============================================================================
# ACTIONS & RESOURCES
# ==============================================================================
class Action:
    VIEW = "VIEW"
    CREATE = "CREATE"
    EDIT = "EDIT"
    SUBMIT = "SUBMIT"
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    VERIFY = "VERIFY"
    FLAG = "FLAG"
    AUDIT = "AUDIT"
    EXPORT = "EXPORT"
    MANAGE_USERS = "MANAGE_USERS"
    MANAGE_CONFIGURATION = "MANAGE_CONFIGURATION"
    PUBLISH = "PUBLISH"
    ARCHIVE = "ARCHIVE"

class Resource:
    WORK = "WORK"
    TRANSACTION = "TRANSACTION"
    RECOMMENDATION = "RECOMMENDATION"
    AUDIT_CASE = "AUDIT_CASE"
    CORRECTION_REQUEST = "CORRECTION_REQUEST"
    CITIZEN_REPORT = "CITIZEN_REPORT"
    USER = "USER"
    CONFIG = "CONFIG"
    AUDIT_LOG = "AUDIT_LOG"

# ==============================================================================
# RBAC BASE PERMISSION MATRIX
# ==============================================================================
ROLE_PERMISSIONS: Dict[str, Dict[str, Set[str]]] = {
    ROLE_MINISTRY_ADMIN: {
        Resource.WORK: {Action.VIEW, Action.VERIFY, Action.FLAG, Action.EXPORT, Action.PUBLISH, Action.ARCHIVE},
        Resource.TRANSACTION: {Action.VIEW, Action.EXPORT, Action.VERIFY},
        Resource.RECOMMENDATION: {Action.VIEW, Action.APPROVE, Action.REJECT, Action.VERIFY, Action.EXPORT},
        Resource.AUDIT_CASE: {Action.VIEW, Action.FLAG, Action.AUDIT, Action.EXPORT, Action.APPROVE},
        Resource.CORRECTION_REQUEST: {Action.VIEW, Action.APPROVE, Action.REJECT, Action.EXPORT},
        Resource.CITIZEN_REPORT: {Action.VIEW, Action.FLAG, Action.EXPORT},
        Resource.USER: {Action.VIEW, Action.CREATE, Action.EDIT, Action.MANAGE_USERS},
        Resource.CONFIG: {Action.VIEW, Action.EDIT, Action.MANAGE_CONFIGURATION},
        Resource.AUDIT_LOG: {Action.VIEW, Action.EXPORT},
    },
    ROLE_STATE_NODAL_AUTHORITY: {
        Resource.WORK: {Action.VIEW, Action.VERIFY, Action.FLAG, Action.EXPORT},
        Resource.TRANSACTION: {Action.VIEW, Action.EXPORT},
        Resource.RECOMMENDATION: {Action.VIEW, Action.APPROVE, Action.REJECT, Action.EXPORT},
        Resource.AUDIT_CASE: {Action.VIEW, Action.FLAG, Action.EXPORT},
        Resource.CORRECTION_REQUEST: {Action.VIEW, Action.CREATE, Action.SUBMIT, Action.EXPORT},
        Resource.CITIZEN_REPORT: {Action.VIEW, Action.FLAG, Action.EXPORT},
        Resource.USER: {Action.VIEW},
        Resource.CONFIG: {Action.VIEW},
        Resource.AUDIT_LOG: {Action.VIEW},
    },
    ROLE_DISTRICT_AUTHORITY: {
        Resource.WORK: {Action.VIEW, Action.CREATE, Action.EDIT, Action.VERIFY, Action.FLAG, Action.EXPORT},
        Resource.TRANSACTION: {Action.VIEW, Action.EXPORT},
        Resource.RECOMMENDATION: {Action.VIEW, Action.APPROVE, Action.REJECT, Action.VERIFY},
        Resource.AUDIT_CASE: {Action.VIEW, Action.FLAG},
        Resource.CORRECTION_REQUEST: {Action.VIEW, Action.CREATE, Action.SUBMIT},
        Resource.CITIZEN_REPORT: {Action.VIEW, Action.EDIT, Action.VERIFY},
        Resource.USER: set(),
        Resource.CONFIG: {Action.VIEW},
        Resource.AUDIT_LOG: set(),
    },
    ROLE_MP: {
        Resource.WORK: {Action.VIEW, Action.EXPORT},
        Resource.TRANSACTION: {Action.VIEW, Action.EXPORT},
        Resource.RECOMMENDATION: {Action.VIEW, Action.CREATE, Action.EDIT, Action.SUBMIT, Action.EXPORT},
        Resource.AUDIT_CASE: {Action.VIEW},
        Resource.CORRECTION_REQUEST: {Action.VIEW},
        Resource.CITIZEN_REPORT: {Action.VIEW},
        Resource.USER: set(),
        Resource.CONFIG: {Action.VIEW},
        Resource.AUDIT_LOG: set(),
    },
    ROLE_AUDITOR: {
        Resource.WORK: {Action.VIEW, Action.FLAG, Action.AUDIT, Action.EXPORT},
        Resource.TRANSACTION: {Action.VIEW, Action.FLAG, Action.AUDIT, Action.EXPORT},
        Resource.RECOMMENDATION: {Action.VIEW, Action.FLAG, Action.AUDIT},
        Resource.AUDIT_CASE: {Action.VIEW, Action.CREATE, Action.EDIT, Action.SUBMIT, Action.FLAG, Action.AUDIT, Action.EXPORT},
        Resource.CORRECTION_REQUEST: {Action.VIEW, Action.CREATE},
        Resource.CITIZEN_REPORT: {Action.VIEW, Action.AUDIT},
        Resource.USER: set(),
        Resource.CONFIG: {Action.VIEW},
        Resource.AUDIT_LOG: {Action.VIEW, Action.EXPORT},
    },
    ROLE_CITIZEN: {
        Resource.WORK: {Action.VIEW, Action.EXPORT},
        Resource.TRANSACTION: {Action.VIEW, Action.EXPORT},
        Resource.RECOMMENDATION: {Action.VIEW},
        Resource.AUDIT_CASE: {Action.VIEW},
        Resource.CORRECTION_REQUEST: set(),
        Resource.CITIZEN_REPORT: {Action.VIEW, Action.CREATE, Action.SUBMIT},
        Resource.USER: set(),
        Resource.CONFIG: {Action.VIEW},
        Resource.AUDIT_LOG: set(),
    },
}

# ==============================================================================
# FIELD-LEVEL PERMISSION CONTROLS
# ==============================================================================
# Fields that may ONLY be updated by specific roles during valid workflow stages
PERMITTED_EDIT_FIELDS: Dict[str, Dict[str, Set[str]]] = {
    Resource.RECOMMENDATION: {
        ROLE_MP: {
            "proposed_title", "sector", "estimated_cost", "location_description",
            "block", "gram_panchayat", "justification", "priority"
        },
        ROLE_DISTRICT_AUTHORITY: {"district_authority_remarks"},
        ROLE_STATE_NODAL_AUTHORITY: {"state_nodal_remarks"},
        ROLE_MINISTRY_ADMIN: {"district_authority_remarks", "state_nodal_remarks"},
    },
    Resource.WORK: {
        ROLE_DISTRICT_AUTHORITY: {
            "lifecycle_status", "village", "block", "gram_panchayat",
            "work_contractor", "has_images", "latitude", "longitude"
        },
        ROLE_MINISTRY_ADMIN: {
            "work_description_normalized", "category_normalized", "match_confidence"
        },
    },
    Resource.AUDIT_CASE: {
        ROLE_AUDITOR: {
            "title", "severity", "status", "hypothesis", "evidence", "auditor_notes"
        },
        ROLE_MINISTRY_ADMIN: {
            "status", "auditor_notes"
        }
    }
}

# Absolute immutable fields that can NEVER be directly modified via generic update
IMMUTABLE_FIELDS: Set[str] = {
    "expenditure_amount",
    "sanctioned_amount",
    "internal_mp_id",
    "work_id",
    "internal_transaction_id",
    "log_id"
}

# ==============================================================================
# ABAC POLICY EVALUATOR
# ==============================================================================
def check_permission(
    user: Optional[AuthenticatedUser],
    action: str,
    resource: str,
    target_record: Optional[Dict[str, Any]] = None,
    field_name: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Evaluates both RBAC and ABAC rules:
    1. Checks if the role has the requested Action on Resource.
    2. Enforces territorial jurisdiction (State, District, Constituency).
    3. Enforces workflow status lock (e.g. MP cannot edit after submission).
    4. Enforces field-level editability (preventing tampering of financial or immutable fields).
    """
    active_role = user.role if user else ROLE_CITIZEN

    # 1. RBAC Base Check
    role_res_perms = ROLE_PERMISSIONS.get(active_role, {}).get(resource, set())
    if action not in role_res_perms:
        return False, f"RBAC Denied: Role '{active_role}' is not granted '{action}' on '{resource}'."

    # Citizens can only create public reports
    if active_role == ROLE_CITIZEN and action in (Action.CREATE, Action.SUBMIT) and resource != Resource.CITIZEN_REPORT:
        return False, "Public Citizen access is read-only. Official mutations require authority credentials."

    # 2. Immutable Fields Check
    if field_name and field_name in IMMUTABLE_FIELDS:
        return False, f"Security Violation: Field '{field_name}' is statutory immutable and cannot be updated directly."

    # 3. Field-Level Role Permissions Check
    if field_name and action in (Action.EDIT, Action.CREATE):
        permitted_fields = PERMITTED_EDIT_FIELDS.get(resource, {}).get(active_role, set())
        if field_name not in permitted_fields:
            return False, f"Field Permission Denied: Role '{active_role}' cannot modify field '{field_name}' on '{resource}'."

    # If no specific record is targeted, RBAC check is sufficient
    if not target_record:
        return True, "Authorized"

    # 4. ABAC: Workflow State Rules
    if resource == Resource.RECOMMENDATION and action in (Action.EDIT, Action.SUBMIT):
        curr_status = (target_record.get("workflow_status") or "").upper()
        if active_role == ROLE_MP:
            if curr_status not in ("DRAFT", "RETURNED_FOR_CORRECTION", ""):
                return False, f"Workflow Lock: Recommendations in status '{curr_status}' cannot be edited by MP."

    # 5. ABAC: Territorial Jurisdiction Boundaries
    if active_role == ROLE_MINISTRY_ADMIN or active_role == ROLE_AUDITOR:
        # National mandate — access to all India
        return True, "Authorized"

    rec_state = (target_record.get("state") or target_record.get("state_normalized") or "").upper()
    rec_district = (target_record.get("district") or target_record.get("constituency_normalized") or target_record.get("block") or "").upper()
    rec_constituency = (target_record.get("constituency") or target_record.get("constituency_normalized") or "").upper()
    rec_mp_id = target_record.get("internal_mp_id") or target_record.get("mp_id")

    user_state = (user.state or "").upper() if user else ""
    user_district = (user.district or user.constituency or "").upper() if user else ""
    user_constituency = (user.constituency or user.district or "").upper() if user else ""
    user_mp_id = user.mp_id if user else None

    # State Nodal Authority Boundary Check
    if active_role == ROLE_STATE_NODAL_AUTHORITY:
        if rec_state and user_state and rec_state != user_state:
            return False, f"Cross-Jurisdiction Denied: State Nodal Authority of '{user_state}' cannot access '{rec_state}' records."

    # District Authority Boundary Check
    if active_role == ROLE_DISTRICT_AUTHORITY:
        if rec_state and user_state and rec_state != user_state:
            return False, f"Cross-Jurisdiction Denied: District Authority of '{user_state}' cannot access '{rec_state}'."
        if rec_district and user_district and rec_district != user_district and rec_constituency != user_district:
            return False, f"Cross-District Denied: District Authority of '{user_district}' cannot modify '{rec_district}' records."

    # Member of Parliament Boundary Check
    if active_role == ROLE_MP:
        if rec_mp_id and user_mp_id and rec_mp_id != user_mp_id:
            return False, "Cross-Constituency Denied: MPs can only manage recommendations for their own parliamentary seat."
        if rec_constituency and user_constituency and rec_constituency != user_constituency:
            return False, f"Cross-Constituency Denied: MP for '{user_constituency}' cannot manage '{rec_constituency}'."

    return True, "Authorized"


def require_permission(action: str, resource: str):
    """FastAPI dependency for endpoint protection."""
    def dependency(user: AuthenticatedUser = Depends(verify_bearer_token)):
        allowed, reason = check_permission(user, action, resource)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=reason
            )
        return user
    return dependency
