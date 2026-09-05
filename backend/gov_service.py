"""
JanDrishti — Governance Operations Service
Implements business logic for:
1. MP Work Recommendations (Draft, Submit, Review, Sanction)
2. Operational Work Execution Updates (District Authority)
3. Financial Correction Requests (Immutability Enforcement)
4. Forensic Audit Investigation Cases (Auditor Role)
5. Citizen Public Discrepancy Reporting
"""

import uuid
import logging
from typing import Optional, List, Dict, Any
from backend.database import get_db_connection
from backend.auth import AuthenticatedUser
from backend.rbac_abac import (
    ROLE_MINISTRY_ADMIN,
    ROLE_STATE_NODAL_AUTHORITY,
    ROLE_DISTRICT_AUTHORITY,
    ROLE_MP,
    ROLE_AUDITOR,
    ROLE_CITIZEN,
    check_permission,
    Action,
    Resource,
)
from backend.workflow import validate_workflow_transition
from backend.audit_logger import record_audit_log

logger = logging.getLogger("jandrishti.gov_service")


class GovernanceService:

    # =========================================================================
    # 1. MP WORK RECOMMENDATIONS LIFECYCLE
    # =========================================================================
    def create_recommendation(
        self,
        user: AuthenticatedUser,
        data: Dict[str, Any],
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """MP creates a new work recommendation in DRAFT status."""
        allowed, reason = check_permission(user, Action.CREATE, Resource.RECOMMENDATION)
        if not allowed:
            raise PermissionError(reason)

        rec_id = f"REC-{uuid.uuid4().hex[:10].upper()}"
        mp_id = user.mp_id
        if not mp_id:
            raise PermissionError("MP workspace requires an authenticated MP session with a valid mp_id. Cannot create recommendation without MP identity.")
        constituency = user.constituency or user.district or "UNKNOWN"
        state = user.state or "UNKNOWN"


        conn = get_db_connection()
        cur = conn.cursor()
        try:
            stmt = """
                INSERT INTO recommendations (
                    recommendation_id, internal_mp_id, mp_name, constituency, state,
                    proposed_title, sector, estimated_cost, location_description,
                    block, gram_panchayat, justification, priority, workflow_status,
                    created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)
            """
            cur.execute(
                stmt,
                [
                    rec_id,
                    mp_id,
                    user.display_name,
                    constituency.upper(),
                    state.upper(),
                    data.get("proposed_title", "").strip(),
                    data.get("sector", "COMMUNITY_INFRASTRUCTURE"),
                    float(data.get("estimated_cost", 0.0)),
                    data.get("location_description", ""),
                    data.get("block", ""),
                    data.get("gram_panchayat", ""),
                    data.get("justification", ""),
                    data.get("priority", "NORMAL"),
                    user.user_id,
                ]
            )
            conn.commit()

            record_audit_log(
                user=user,
                action="CREATE_RECOMMENDATION",
                entity_type=Resource.RECOMMENDATION,
                entity_id=rec_id,
                new_value=f"{data.get('proposed_title')} (Est: ₹{data.get('estimated_cost')})",
                reason="MP initiated statutory constituency recommendation in DRAFT mode.",
                ip_address=client_ip
            )
            return self.get_recommendation(rec_id)
        finally:
            conn.close()

    def update_recommendation(
        self,
        user: AuthenticatedUser,
        rec_id: str,
        data: Dict[str, Any],
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """MP edits an existing recommendation. ONLY permitted in DRAFT or RETURNED_FOR_CORRECTION."""
        rec = self.get_recommendation(rec_id)
        if not rec:
            raise ValueError(f"Recommendation '{rec_id}' not found")

        allowed, reason = check_permission(
            user=user,
            action=Action.EDIT,
            resource=Resource.RECOMMENDATION,
            target_record=rec
        )
        if not allowed:
            raise PermissionError(reason)

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            stmt = """
                UPDATE recommendations
                SET proposed_title = ?, sector = ?, estimated_cost = ?,
                    location_description = ?, block = ?, gram_panchayat = ?,
                    justification = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
                WHERE recommendation_id = ?
            """
            cur.execute(
                stmt,
                [
                    data.get("proposed_title", rec["proposed_title"]),
                    data.get("sector", rec["sector"]),
                    float(data.get("estimated_cost", rec["estimated_cost"])),
                    data.get("location_description", rec["location_description"]),
                    data.get("block", rec["block"]),
                    data.get("gram_panchayat", rec["gram_panchayat"]),
                    data.get("justification", rec["justification"]),
                    data.get("priority", rec["priority"]),
                    rec_id,
                ]
            )
            conn.commit()

            record_audit_log(
                user=user,
                action="EDIT_RECOMMENDATION",
                entity_type=Resource.RECOMMENDATION,
                entity_id=rec_id,
                old_value=f"Est: ₹{rec.get('estimated_cost')}",
                new_value=f"Est: ₹{data.get('estimated_cost')}",
                reason="MP updated recommendation parameters before submission.",
                ip_address=client_ip
            )
            return self.get_recommendation(rec_id)
        finally:
            conn.close()

    def submit_recommendation(
        self,
        user: AuthenticatedUser,
        rec_id: str,
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transitions recommendation from DRAFT -> SUBMITTED and locks MP editing."""
        rec = self.get_recommendation(rec_id)
        if not rec:
            raise ValueError(f"Recommendation '{rec_id}' not found")

        allowed, reason = check_permission(user, Action.SUBMIT, Resource.RECOMMENDATION, rec)
        if not allowed:
            raise PermissionError(reason)

        curr_status = rec["workflow_status"]
        valid_trans, trans_reason = validate_workflow_transition(curr_status, "SUBMITTED", user.role)
        if not valid_trans:
            raise PermissionError(trans_reason)

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                "UPDATE recommendations SET workflow_status = 'SUBMITTED', updated_at = CURRENT_TIMESTAMP WHERE recommendation_id = ?",
                [rec_id]
            )
            conn.commit()

            record_audit_log(
                user=user,
                action="SUBMIT_RECOMMENDATION",
                entity_type=Resource.RECOMMENDATION,
                entity_id=rec_id,
                old_value=curr_status,
                new_value="SUBMITTED",
                reason="MP formally submitted recommendation to District Authority. Original records locked.",
                ip_address=client_ip
            )
            return self.get_recommendation(rec_id)
        finally:
            conn.close()

    def transition_recommendation_workflow(
        self,
        user: AuthenticatedUser,
        rec_id: str,
        target_status: str,
        remarks: Optional[str] = None,
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Authority advances recommendation lifecycle (e.g. DISTRICT_REVIEW, STATE_REVIEW, SANCTIONED, REJECTED)."""
        rec = self.get_recommendation(rec_id)
        if not rec:
            raise ValueError(f"Recommendation '{rec_id}' not found")

        curr_status = rec["workflow_status"]
        valid_trans, trans_reason = validate_workflow_transition(curr_status, target_status, user.role)
        if not valid_trans:
            raise PermissionError(trans_reason)

        # Jurisdiction boundary check
        allowed, reason = check_permission(
            user=user,
            action=Action.APPROVE if "REVIEW" in target_status or target_status == "SANCTIONED" else Action.EDIT,
            resource=Resource.RECOMMENDATION,
            target_record=rec
        )
        if not allowed:
            raise PermissionError(reason)

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            district_remarks = remarks if user.role == ROLE_DISTRICT_AUTHORITY else rec["district_authority_remarks"]
            state_remarks = remarks if user.role == ROLE_STATE_NODAL_AUTHORITY else rec["state_nodal_remarks"]

            stmt = """
                UPDATE recommendations
                SET workflow_status = ?, district_authority_remarks = ?,
                    state_nodal_remarks = ?, updated_at = CURRENT_TIMESTAMP
                WHERE recommendation_id = ?
            """
            cur.execute(stmt, [target_status, district_remarks, state_remarks, rec_id])
            conn.commit()

            record_audit_log(
                user=user,
                action=f"WORKFLOW_{target_status}",
                entity_type=Resource.RECOMMENDATION,
                entity_id=rec_id,
                old_value=curr_status,
                new_value=target_status,
                reason=remarks or f"Workflow advanced by {user.display_name} ({user.role})",
                ip_address=client_ip
            )
            return self.get_recommendation(rec_id)
        finally:
            conn.close()

    def get_recommendation(self, rec_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM recommendations WHERE recommendation_id = ?", [rec_id])
            row = cur.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def list_recommendations(
        self,
        user: Optional[AuthenticatedUser] = None,
        workflow_status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            clauses = ["1=1"]
            params: List[Any] = []

            if workflow_status:
                clauses.append("workflow_status = ?")
                params.append(workflow_status.upper())

            # ABAC Scoping
            if user:
                if user.role == ROLE_MP and user.mp_id:
                    clauses.append("internal_mp_id = ?")
                    params.append(user.mp_id)
                elif user.role == ROLE_DISTRICT_AUTHORITY:
                    district_name = (user.district or user.constituency or "").upper()
                    if district_name:
                        clauses.append("(constituency = ? OR block = ?)")
                        params.extend([district_name, district_name])
                elif user.role == ROLE_STATE_NODAL_AUTHORITY and user.state:
                    clauses.append("state = ?")
                    params.append(user.state.upper())

            params.extend([limit, offset])
            query = f"SELECT * FROM recommendations WHERE {' AND '.join(clauses)} ORDER BY created_at DESC LIMIT ? OFFSET ?"
            cur.execute(query, params)
            rows = cur.fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    # =========================================================================
    # 2. WORK EXECUTION PROGRESS UPDATES (DISTRICT AUTHORITY)
    # =========================================================================
    def update_work_execution(
        self,
        user: AuthenticatedUser,
        work_id: int,
        data: Dict[str, Any],
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """District Authority updates milestone execution, site photos, or inspection orders."""
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM works WHERE work_id = ?", [work_id])
            work = cur.fetchone()
            if not work:
                raise ValueError(f"Work #{work_id} not found")
            work_dict = dict(work)

            allowed, reason = check_permission(
                user=user,
                action=Action.EDIT,
                resource=Resource.WORK,
                target_record=work_dict
            )
            if not allowed:
                raise PermissionError(reason)

            old_status = work_dict.get("lifecycle_status")
            new_status = data.get("lifecycle_status", old_status)

            stmt = """
                UPDATE works
                SET lifecycle_status = ?,
                    village = COALESCE(?, village),
                    block = COALESCE(?, block),
                    gram_panchayat = COALESCE(?, gram_panchayat),
                    work_contractor = COALESCE(?, work_contractor),
                    latitude = COALESCE(?, latitude),
                    longitude = COALESCE(?, longitude)
                WHERE work_id = ?
            """
            cur.execute(
                stmt,
                [
                    new_status,
                    data.get("village"),
                    data.get("block"),
                    data.get("gram_panchayat"),
                    data.get("work_contractor"),
                    data.get("latitude"),
                    data.get("longitude"),
                    work_id,
                ]
            )
            conn.commit()

            record_audit_log(
                user=user,
                action="UPDATE_WORK_EXECUTION",
                entity_type=Resource.WORK,
                entity_id=str(work_id),
                old_value=old_status,
                new_value=new_status,
                reason=data.get("inspection_remarks", "District milestone progress update recorded."),
                ip_address=client_ip
            )

            cur.execute("SELECT * FROM works WHERE work_id = ?", [work_id])
            return dict(cur.fetchone())
        finally:
            conn.close()

    # =========================================================================
    # 3. FINANCIAL CORRECTION REQUESTS (NEVER DESTROY SOURCE LEDGER)
    # =========================================================================
    def create_correction_request(
        self,
        user: AuthenticatedUser,
        data: Dict[str, Any],
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Initiates an auditable request to correct administrative or fiscal metadata."""
        allowed, reason = check_permission(user, Action.CREATE, Resource.CORRECTION_REQUEST)
        if not allowed:
            raise PermissionError(reason)

        corr_id = f"CORR-{uuid.uuid4().hex[:10].upper()}"
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            stmt = """
                INSERT INTO correction_requests (
                    correction_id, entity_type, entity_id, field_name,
                    previous_value, proposed_value, reason, requested_by,
                    requested_by_role, jurisdiction, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
            """
            cur.execute(
                stmt,
                [
                    corr_id,
                    data.get("entity_type", "WORK"),
                    str(data.get("entity_id")),
                    data.get("field_name"),
                    str(data.get("previous_value", "")),
                    str(data.get("proposed_value", "")),
                    data.get("reason", "Statutory data reconciliation requested."),
                    user.user_id,
                    user.role,
                    user.jurisdiction,
                ]
            )
            conn.commit()

            record_audit_log(
                user=user,
                action="SUBMIT_CORRECTION_REQUEST",
                entity_type=Resource.CORRECTION_REQUEST,
                entity_id=corr_id,
                old_value=data.get("previous_value"),
                new_value=data.get("proposed_value"),
                reason=data.get("reason"),
                ip_address=client_ip
            )

            cur.execute("SELECT * FROM correction_requests WHERE correction_id = ?", [corr_id])
            return dict(cur.fetchone())
        finally:
            conn.close()

    def review_correction_request(
        self,
        user: AuthenticatedUser,
        corr_id: str,
        action: str,  # APPROVE or REJECT
        comments: Optional[str] = None,
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Ministry or State Authority approves/rejects correction."""
        allowed, reason = check_permission(user, Action.APPROVE, Resource.CORRECTION_REQUEST)
        if not allowed:
            raise PermissionError(reason)

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM correction_requests WHERE correction_id = ?", [corr_id])
            row = cur.fetchone()
            if not row:
                raise ValueError(f"Correction request '{corr_id}' not found")
            corr = dict(row)

            target_status = "APPROVED" if action.upper() == "APPROVE" else "REJECTED"

            stmt = """
                UPDATE correction_requests
                SET status = ?, reviewed_by = ?, review_comments = ?, resolved_at = CURRENT_TIMESTAMP
                WHERE correction_id = ?
            """
            cur.execute(stmt, [target_status, user.user_id, comments, corr_id])
            conn.commit()

            record_audit_log(
                user=user,
                action=f"CORRECTION_{target_status}",
                entity_type=Resource.CORRECTION_REQUEST,
                entity_id=corr_id,
                old_value=corr.get("previous_value"),
                new_value=corr.get("proposed_value") if target_status == "APPROVED" else "REJECTED",
                reason=comments or f"Reviewed by {user.display_name} ({user.role})",
                ip_address=client_ip
            )

            cur.execute("SELECT * FROM correction_requests WHERE correction_id = ?", [corr_id])
            return dict(cur.fetchone())
        finally:
            conn.close()

    def list_correction_requests(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM correction_requests ORDER BY created_at DESC LIMIT ?", [limit])
            rows = cur.fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    # =========================================================================
    # 4. AUDIT INVESTIGATION CASES (AUDITOR ROLE)
    # =========================================================================
    def create_audit_case(
        self,
        user: AuthenticatedUser,
        data: Dict[str, Any],
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Auditor creates an empirical investigation case with hypothesis & evidence."""
        allowed, reason = check_permission(user, Action.CREATE, Resource.AUDIT_CASE)
        if not allowed:
            raise PermissionError(reason)

        case_id = f"CASE-{uuid.uuid4().hex[:10].upper()}"
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            stmt = """
                INSERT INTO audit_investigation_cases (
                    case_id, work_id, transaction_id, title, severity,
                    status, hypothesis, evidence, auditor_notes,
                    assigned_auditor, jurisdiction
                ) VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?, ?, ?, ?)
            """
            cur.execute(
                stmt,
                [
                    case_id,
                    str(data.get("work_id", "")),
                    str(data.get("transaction_id", "")),
                    data.get("title", "Forensic Investigation Dossier"),
                    data.get("severity", "HIGH"),
                    data.get("hypothesis", ""),
                    data.get("evidence", ""),
                    data.get("auditor_notes", ""),
                    user.display_name,
                    user.jurisdiction,
                ]
            )
            conn.commit()

            record_audit_log(
                user=user,
                action="CREATE_AUDIT_INVESTIGATION",
                entity_type=Resource.AUDIT_CASE,
                entity_id=case_id,
                new_value=data.get("title"),
                reason="Auditor flagged empirical financial discrepancy case for inquiry.",
                ip_address=client_ip
            )

            cur.execute("SELECT * FROM audit_investigation_cases WHERE case_id = ?", [case_id])
            return dict(cur.fetchone())
        finally:
            conn.close()

    def update_audit_case(
        self,
        user: AuthenticatedUser,
        case_id: str,
        data: Dict[str, Any],
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Auditor updates findings or changes status (OPEN -> UNDER_INVESTIGATION -> RESOLVED / ESCALATED)."""
        allowed, reason = check_permission(user, Action.EDIT, Resource.AUDIT_CASE)
        if not allowed:
            raise PermissionError(reason)

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM audit_investigation_cases WHERE case_id = ?", [case_id])
            row = cur.fetchone()
            if not row:
                raise ValueError(f"Audit case '{case_id}' not found")
            curr = dict(row)

            new_status = data.get("status", curr["status"])
            stmt = """
                UPDATE audit_investigation_cases
                SET status = ?, severity = COALESCE(?, severity),
                    hypothesis = COALESCE(?, hypothesis), evidence = COALESCE(?, evidence),
                    auditor_notes = COALESCE(?, auditor_notes), updated_at = CURRENT_TIMESTAMP
                WHERE case_id = ?
            """
            cur.execute(
                stmt,
                [
                    new_status,
                    data.get("severity"),
                    data.get("hypothesis"),
                    data.get("evidence"),
                    data.get("auditor_notes"),
                    case_id,
                ]
            )
            conn.commit()

            record_audit_log(
                user=user,
                action="UPDATE_AUDIT_CASE",
                entity_type=Resource.AUDIT_CASE,
                entity_id=case_id,
                old_value=curr["status"],
                new_value=new_status,
                reason=data.get("auditor_notes", "Auditor annotated case findings."),
                ip_address=client_ip
            )

            cur.execute("SELECT * FROM audit_investigation_cases WHERE case_id = ?", [case_id])
            return dict(cur.fetchone())
        finally:
            conn.close()

    def list_audit_cases(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM audit_investigation_cases ORDER BY created_at DESC LIMIT ?", [limit])
            rows = cur.fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    # =========================================================================
    # 5. CITIZEN PUBLIC DISCREPANCY REPORTING
    # =========================================================================
    def submit_citizen_report(
        self,
        data: Dict[str, Any],
        client_ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Public citizen reports an on-site discrepancy without altering source DB directly."""
        report_id = f"CIT-REP-{uuid.uuid4().hex[:10].upper()}"
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            stmt = """
                INSERT INTO citizen_reports (
                    report_id, work_id, state, district, constituency,
                    discrepancy_category, description, reported_location, photo_url, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED')
            """
            cur.execute(
                stmt,
                [
                    report_id,
                    str(data.get("work_id", "")),
                    data.get("state", ""),
                    data.get("district", ""),
                    data.get("constituency", ""),
                    data.get("discrepancy_category", "QUALITY_ISSUE"),
                    data.get("description", ""),
                    data.get("reported_location", ""),
                    data.get("photo_url", ""),
                ]
            )
            conn.commit()

            record_audit_log(
                user=None,
                action="SUBMIT_CITIZEN_REPORT",
                entity_type=Resource.CITIZEN_REPORT,
                entity_id=report_id,
                new_value=data.get("description", "")[:100],
                reason=f"Public citizen submitted ground discrepancy report for Work #{data.get('work_id')}.",
                ip_address=client_ip
            )

            cur.execute("SELECT * FROM citizen_reports WHERE report_id = ?", [report_id])
            return dict(cur.fetchone())
        finally:
            conn.close()

    def list_citizen_reports(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM citizen_reports ORDER BY created_at DESC LIMIT ?", [limit])
            rows = cur.fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()


gov_service = GovernanceService()
