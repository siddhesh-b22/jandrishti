"""
JanDrishti — Case Management & Immutable Audit Trail Service
Operationalizes the governance cycle:
DATA -> ANALYSIS -> AI/ML DETECTION -> RISK ASSESSMENT -> ALERT -> HUMAN REVIEW -> ACTION -> AUDIT TRAIL

Stores dynamic review cases and audit actions in database/mplads.db
as part of JanDrishti's Unified Single Ultimate Database.
"""

import os
import sqlite3
import datetime
from typing import List, Dict, Any, Optional
from backend.config import USING_POSTGRES
from backend.database import get_db_write_connection
import logging

logger = logging.getLogger("jandrishti.cases")

def get_audit_db_conn():
    return get_db_write_connection()

def init_audit_db():
    if USING_POSTGRES:
        return
    try:
        conn = get_audit_db_conn()
        conn.execute("""
            CREATE TABLE IF NOT EXISTS review_cases (
                case_id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                title TEXT NOT NULL,
                severity TEXT NOT NULL,
                risk_score REAL NOT NULL,
                category TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'NEW',
                assigned_to TEXT DEFAULT 'Unassigned',
                assigned_role TEXT DEFAULT 'DISTRICT_AUTHORITY',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                resolution_notes TEXT DEFAULT ''
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_trail (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT NOT NULL,
                action TEXT NOT NULL,
                performed_by TEXT NOT NULL,
                role TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                details TEXT DEFAULT '',
                previous_state TEXT DEFAULT '',
                new_state TEXT DEFAULT ''
            )
        """)
        conn.commit()

        # Seed initial cases if empty
        cur = conn.execute("SELECT COUNT(*) FROM review_cases")
        if cur.fetchone()[0] == 0:
            seed_cases = [
                {
                    "case_id": "CASE-2026-001",
                    "entity_type": "WORK",
                    "entity_id": "100482",
                    "title": "Severe Progress Divergence: CC Road & Drainage",
                    "severity": "CRITICAL",
                    "risk_score": 92.5,
                    "category": "PROGRESS_MISMATCH",
                    "status": "UNDER_REVIEW",
                    "assigned_to": "Shri R. Sharma (District Magistrate)",
                    "assigned_role": "DISTRICT_AUTHORITY",
                    "created_at": "2026-08-28T09:30:00Z",
                    "updated_at": "2026-08-29T14:20:00Z",
                    "resolution_notes": "Physical verification committee dispatched to verify road surface layers. Tranche #3 payment frozen."
                },
                {
                    "case_id": "CASE-2026-002",
                    "entity_type": "WORK",
                    "entity_id": "102391",
                    "title": "Potential Duplicate Sanction: Drinking Water Tank",
                    "severity": "HIGH",
                    "risk_score": 78.4,
                    "category": "DUPLICATE_WORK",
                    "status": "CLARIFICATION_REQUESTED",
                    "assigned_to": "Dr. V. Rao (Nodal Executive Engineer)",
                    "assigned_role": "DISTRICT_AUTHORITY",
                    "created_at": "2026-08-27T11:15:00Z",
                    "updated_at": "2026-08-28T16:45:00Z",
                    "resolution_notes": "Notice issued to GP Sarpanch to confirm GPS coordinates relative to 2024 scheme."
                },
                {
                    "case_id": "CASE-2026-003",
                    "entity_type": "VENDOR",
                    "entity_id": "VEND_00281",
                    "title": "Single-Patron Concentration Anomaly (94.2% Reliance)",
                    "severity": "CRITICAL",
                    "risk_score": 88.0,
                    "category": "CONTRACTOR_CONCENTRATION",
                    "status": "NEW",
                    "assigned_to": "Chief Audit Officer (MoSPI/CAG)",
                    "assigned_role": "MINISTRY_OFFICIAL",
                    "created_at": "2026-08-29T10:00:00Z",
                    "updated_at": "2026-08-29T10:00:00Z",
                    "resolution_notes": ""
                },
                {
                    "case_id": "CASE-2026-004",
                    "entity_type": "WORK",
                    "entity_id": "101844",
                    "title": "Project Stalled > 420 Days: Community Health Center",
                    "severity": "HIGH",
                    "risk_score": 74.0,
                    "category": "PROJECT_DELAY",
                    "status": "DETAILED_REVIEW",
                    "assigned_to": "Smt. P. Verma (District Planning Officer)",
                    "assigned_role": "DISTRICT_AUTHORITY",
                    "created_at": "2026-08-26T08:00:00Z",
                    "updated_at": "2026-08-30T11:00:00Z",
                    "resolution_notes": "Contractor issued show-cause notice for non-performance. Sub-contractor dispute under arbitration."
                },
                {
                    "case_id": "CASE-2026-005",
                    "entity_type": "WORK",
                    "entity_id": "100115",
                    "title": "Missing Administrative Sanction Records",
                    "severity": "MEDIUM",
                    "risk_score": 52.0,
                    "category": "COMPLIANCE_DEFICIT",
                    "status": "RESOLVED",
                    "assigned_to": "Auditor S. Kulkarni",
                    "assigned_role": "AUDITOR",
                    "created_at": "2026-08-25T14:00:00Z",
                    "updated_at": "2026-08-30T15:30:00Z",
                    "resolution_notes": "Missing signed sanction letter uploaded to eSAKSHI repository by district engineer. Closed."
                }
            ]

            seed_logs = [
                ("CASE-2026-001", "CASE_CREATED", "System Engine", "AI_ANALYTICS_SERVICE", "2026-08-28T09:30:00Z", "AI engine flagged 82% expenditure with only 25% physical progress.", "", "NEW"),
                ("CASE-2026-001", "ASSIGNED", "Director (MPLADS)", "MINISTRY_OFFICIAL", "2026-08-28T10:00:00Z", "Assigned to District Magistrate for on-site inquiry.", "NEW", "UNDER_REVIEW"),
                ("CASE-2026-001", "STATUS_CHANGE", "Shri R. Sharma", "DISTRICT_AUTHORITY", "2026-08-29T14:20:00Z", "Dispatched physical verification committee. Payment freeze enacted.", "UNDER_REVIEW", "UNDER_REVIEW"),
                ("CASE-2026-002", "CASE_CREATED", "System Engine", "AI_ANALYTICS_SERVICE", "2026-08-27T11:15:00Z", "Duplicate detection engine identified 88% text similarity with Work #101290.", "", "NEW"),
                ("CASE-2026-002", "CLARIFICATION_SENT", "Dr. V. Rao", "DISTRICT_AUTHORITY", "2026-08-28T16:45:00Z", "Issued formal GPS boundary clarification to GP.", "NEW", "CLARIFICATION_REQUESTED"),
                ("CASE-2026-005", "CASE_CREATED", "System Engine", "AI_ANALYTICS_SERVICE", "2026-08-25T14:00:00Z", "Compliance scanner detected missing sanction document.", "", "NEW"),
                ("CASE-2026-005", "RESOLVED", "Auditor S. Kulkarni", "AUDITOR", "2026-08-30T15:30:00Z", "Verification completed. Signed document verified in nodal records.", "UNDER_REVIEW", "RESOLVED"),
            ]

            for sc in seed_cases:
                conn.execute("""
                    INSERT INTO review_cases (case_id, entity_type, entity_id, title, severity, risk_score, category, status, assigned_to, assigned_role, created_at, updated_at, resolution_notes)
                    VALUES (:case_id, :entity_type, :entity_id, :title, :severity, :risk_score, :category, :status, :assigned_to, :assigned_role, :created_at, :updated_at, :resolution_notes)
                """, sc)

            for sl in seed_logs:
                conn.execute("""
                    INSERT INTO audit_trail (case_id, action, performed_by, role, timestamp, details, previous_state, new_state)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, sl)

            conn.commit()
        conn.close()
    except Exception as exc:
        logger.warning("Local audit DB init skipped or deferred: %s", exc)

# Initialize DB on module import safely
try:
    init_audit_db()
except Exception as exc:
    logger.warning("Audit DB init failed on import: %s", exc)


class CaseManagementService:
    def list_cases(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        category: Optional[str] = None,
        role: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        conn = get_audit_db_conn()
        query = "SELECT * FROM review_cases WHERE 1=1"
        params = []

        if status:
            query += " AND status = ?"
            params.append(status.upper())
        if severity:
            query += " AND severity = ?"
            params.append(severity.upper())
        if category:
            query += " AND category = ?"
            params.append(category.upper())
        if role:
            query += " AND assigned_role = ?"
            params.append(role.upper())

        query += " ORDER BY risk_score DESC, updated_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        rows = conn.execute(query, params).fetchall()

        # Count total
        count_q = "SELECT COUNT(*) FROM review_cases WHERE 1=1"
        count_params = []
        if status:
            count_q += " AND status = ?"
            count_params.append(status.upper())
        if severity:
            count_q += " AND severity = ?"
            count_params.append(severity.upper())
        if category:
            count_q += " AND category = ?"
            count_params.append(category.upper())
        if role:
            count_q += " AND assigned_role = ?"
            count_params.append(role.upper())

        total = conn.execute(count_q, count_params).fetchone()[0]
        conn.close()

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "items": [dict(r) for r in rows]
        }

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        conn = get_audit_db_conn()
        case_row = conn.execute("SELECT * FROM review_cases WHERE case_id = ?", (case_id,)).fetchone()
        if not case_row:
            conn.close()
            return None

        audit_rows = conn.execute(
            "SELECT * FROM audit_trail WHERE case_id = ? ORDER BY timestamp ASC", 
            (case_id,)
        ).fetchall()
        conn.close()

        case_dict = dict(case_row)
        case_dict["audit_trail"] = [dict(a) for a in audit_rows]
        return case_dict

    def create_case(
        self,
        entity_type: str,
        entity_id: str,
        title: str,
        severity: str,
        risk_score: float,
        category: str,
        assigned_to: str = "Unassigned",
        assigned_role: str = "DISTRICT_AUTHORITY",
        user: str = "Authorized Official",
        role: str = "DISTRICT_AUTHORITY",
        notes: str = ""
    ) -> Dict[str, Any]:
        conn = get_audit_db_conn()
        cur = conn.execute("SELECT COUNT(*) FROM review_cases")
        new_num = cur.fetchone()[0] + 1
        case_id = f"CASE-2026-{new_num:03d}"
        now_ts = datetime.datetime.now(datetime.timezone.utc).isoformat()

        conn.execute("""
            INSERT INTO review_cases (case_id, entity_type, entity_id, title, severity, risk_score, category, status, assigned_to, assigned_role, created_at, updated_at, resolution_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?, ?, ?)
        """, (case_id, entity_type, entity_id, title, severity, risk_score, category, assigned_to, assigned_role, now_ts, now_ts, notes))

        # Log creation in audit trail
        conn.execute("""
            INSERT INTO audit_trail (case_id, action, performed_by, role, timestamp, details, previous_state, new_state)
            VALUES (?, 'CASE_CREATED', ?, ?, ?, ?, '', 'NEW')
        """, (case_id, user, role, now_ts, f"Initiated review case for {entity_type} #{entity_id}. {notes}"))

        conn.commit()
        conn.close()
        return self.get_case(case_id)

    def update_case_status(
        self,
        case_id: str,
        new_status: str,
        user: str = "Authorized Official",
        role: str = "DISTRICT_AUTHORITY",
        notes: str = "",
        assigned_to: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        conn = get_audit_db_conn()
        case_row = conn.execute("SELECT * FROM review_cases WHERE case_id = ?", (case_id,)).fetchone()
        if not case_row:
            conn.close()
            return None

        old_status = case_row["status"]
        now_ts = datetime.datetime.now(datetime.timezone.utc).isoformat()

        update_q = "UPDATE review_cases SET status = ?, updated_at = ?"
        update_params = [new_status, now_ts]

        if notes:
            new_notes = (case_row["resolution_notes"] or "") + f"\n[{now_ts}] {user} ({role}): {notes}"
            update_q += ", resolution_notes = ?"
            update_params.append(new_notes.strip())

        if assigned_to:
            update_q += ", assigned_to = ?"
            update_params.append(assigned_to)

        update_q += " WHERE case_id = ?"
        update_params.append(case_id)

        conn.execute(update_q, update_params)

        # Log audit entry
        conn.execute("""
            INSERT INTO audit_trail (case_id, action, performed_by, role, timestamp, details, previous_state, new_state)
            VALUES (?, 'STATUS_UPDATE', ?, ?, ?, ?, ?, ?)
        """, (case_id, user, role, now_ts, notes or f"Status transitioned from {old_status} to {new_status}", old_status, new_status))

        conn.commit()
        conn.close()
        return self.get_case(case_id)

    def get_global_audit_trail(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_audit_db_conn()
        rows = conn.execute("""
            SELECT a.*, c.title as case_title, c.severity, c.entity_type, c.entity_id
            FROM audit_trail a
            JOIN review_cases c ON a.case_id = c.case_id
            ORDER BY a.timestamp DESC
            LIMIT ?
        """, (limit,)).fetchall()
        conn.close()
        return [dict(r) for r in rows]

case_service = CaseManagementService()
