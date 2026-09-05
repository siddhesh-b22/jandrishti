"""
JanDrishti — Governance Workflow State Machine Module
Enforces statutory state transitions and prevents illegal workflow bypass.
"""

from typing import Tuple, Dict, Set
from backend.rbac_abac import (
    ROLE_MINISTRY_ADMIN,
    ROLE_STATE_NODAL_AUTHORITY,
    ROLE_DISTRICT_AUTHORITY,
    ROLE_MP,
    ROLE_AUDITOR,
)

# ==============================================================================
# RECOMMENDATION WORKFLOW STATES
# ==============================================================================
STATE_DRAFT = "DRAFT"
STATE_SUBMITTED = "SUBMITTED"
STATE_DISTRICT_REVIEW = "DISTRICT_REVIEW"
STATE_RETURNED_FOR_CORRECTION = "RETURNED_FOR_CORRECTION"
STATE_STATE_REVIEW = "STATE_REVIEW"
STATE_SANCTIONED = "SANCTIONED"
STATE_IN_PROGRESS = "IN_PROGRESS"
STATE_COMPLETED = "COMPLETED"
STATE_VERIFIED = "VERIFIED"
STATE_REJECTED = "REJECTED"

RECOMMENDATION_TRANSITIONS: Dict[str, Set[str]] = {
    STATE_DRAFT: {STATE_SUBMITTED},
    STATE_SUBMITTED: {STATE_DISTRICT_REVIEW, STATE_DRAFT},
    STATE_DISTRICT_REVIEW: {STATE_STATE_REVIEW, STATE_RETURNED_FOR_CORRECTION, STATE_REJECTED},
    STATE_RETURNED_FOR_CORRECTION: {STATE_DRAFT, STATE_SUBMITTED},
    STATE_STATE_REVIEW: {STATE_SANCTIONED, STATE_REJECTED, STATE_DISTRICT_REVIEW},
    STATE_SANCTIONED: {STATE_IN_PROGRESS},
    STATE_IN_PROGRESS: {STATE_COMPLETED},
    STATE_COMPLETED: {STATE_VERIFIED},
    STATE_VERIFIED: set(),  # Terminal state
    STATE_REJECTED: set(),  # Terminal state
}

# Which role is authorized to trigger each transition
TRANSITION_AUTHORITY: Dict[Tuple[str, str], Set[str]] = {
    (STATE_DRAFT, STATE_SUBMITTED): {ROLE_MP},
    (STATE_SUBMITTED, STATE_DISTRICT_REVIEW): {ROLE_DISTRICT_AUTHORITY, ROLE_MINISTRY_ADMIN},
    (STATE_DISTRICT_REVIEW, STATE_RETURNED_FOR_CORRECTION): {ROLE_DISTRICT_AUTHORITY, ROLE_MINISTRY_ADMIN},
    (STATE_RETURNED_FOR_CORRECTION, STATE_DRAFT): {ROLE_MP},
    (STATE_DISTRICT_REVIEW, STATE_STATE_REVIEW): {ROLE_DISTRICT_AUTHORITY, ROLE_MINISTRY_ADMIN},
    (STATE_STATE_REVIEW, STATE_SANCTIONED): {ROLE_STATE_NODAL_AUTHORITY, ROLE_MINISTRY_ADMIN},
    (STATE_STATE_REVIEW, STATE_REJECTED): {ROLE_STATE_NODAL_AUTHORITY, ROLE_MINISTRY_ADMIN},
    (STATE_SANCTIONED, STATE_IN_PROGRESS): {ROLE_DISTRICT_AUTHORITY, ROLE_MINISTRY_ADMIN},
    (STATE_IN_PROGRESS, STATE_COMPLETED): {ROLE_DISTRICT_AUTHORITY, ROLE_MINISTRY_ADMIN},
    (STATE_COMPLETED, STATE_VERIFIED): {ROLE_DISTRICT_AUTHORITY, ROLE_MINISTRY_ADMIN, ROLE_STATE_NODAL_AUTHORITY},
}

# ==============================================================================
# AUDIT CASE WORKFLOW
# ==============================================================================
AUDIT_STATUS_OPEN = "OPEN"
AUDIT_STATUS_INVESTIGATION = "UNDER_INVESTIGATION"
AUDIT_STATUS_EVIDENCE = "EVIDENCE_REQUIRED"
AUDIT_STATUS_REVIEWED = "REVIEWED"
AUDIT_STATUS_RESOLVED = "RESOLVED"
AUDIT_STATUS_ESCALATED = "ESCALATED"

AUDIT_TRANSITIONS: Dict[str, Set[str]] = {
    AUDIT_STATUS_OPEN: {AUDIT_STATUS_INVESTIGATION, AUDIT_STATUS_RESOLVED},
    AUDIT_STATUS_INVESTIGATION: {AUDIT_STATUS_EVIDENCE, AUDIT_STATUS_REVIEWED, AUDIT_STATUS_RESOLVED, AUDIT_STATUS_ESCALATED},
    AUDIT_STATUS_EVIDENCE: {AUDIT_STATUS_INVESTIGATION, AUDIT_STATUS_REVIEWED},
    AUDIT_STATUS_REVIEWED: {AUDIT_STATUS_RESOLVED, AUDIT_STATUS_ESCALATED},
    AUDIT_STATUS_RESOLVED: set(),
    AUDIT_STATUS_ESCALATED: {AUDIT_STATUS_RESOLVED},
}


def validate_workflow_transition(
    current_state: str,
    target_state: str,
    user_role: str,
) -> Tuple[bool, str]:
    """
    Ensures state machine correctness and rejects illegal statutory transitions.
    """
    curr = current_state.upper()
    target = target_state.upper()

    if curr == target:
        return True, "No transition"

    valid_targets = RECOMMENDATION_TRANSITIONS.get(curr, set())
    if target not in valid_targets:
        return False, f"Illegal Workflow Transition: Cannot advance from '{curr}' to '{target}'."

    allowed_roles = TRANSITION_AUTHORITY.get((curr, target), set())
    if user_role not in allowed_roles:
        return False, f"Statutory Authority Denied: Role '{user_role}' cannot transition work from '{curr}' to '{target}'."

    return True, "Authorized"
