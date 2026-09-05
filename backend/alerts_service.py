"""
JanDrishti — Alert Management & Investigation Workflow Service
Fulfills MPLADS Platform Specifications (Req 4, Req 13, Req 18, Req 22):
- Alert entity: alert_id, project_id, severity, alert_type, description, evidence, status, assigned_to, created_at, resolved_at, reviewer_comment
- Auto-creation for high/critical risks
- Multi-criteria filtering (state, district, MP, agency, project, severity, alert_type, date)
- Lifecycle: Open, review evidence, acknowledge, assign, add comments, mark resolved
- Audit trail logging every action
"""

import os
import json
import sqlite3
import datetime
from typing import List, Dict, Any, Optional
from backend.database import get_db_write_connection, get_db_connection

def init_alerts_db():
    conn = get_db_write_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            severity TEXT NOT NULL,          -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
            alert_type TEXT NOT NULL,        -- 'EXPENDITURE_PROGRESS_MISMATCH', 'PROJECT_DELAY', etc.
            description TEXT NOT NULL,
            evidence TEXT NOT NULL,          -- JSON string of metrics & comparisons
            status TEXT NOT NULL DEFAULT 'NEW', -- 'NEW', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'
            assigned_to TEXT DEFAULT 'Unassigned',
            assigned_role TEXT DEFAULT 'DISTRICT_AUTHORITY',
            created_at TEXT NOT NULL,
            resolved_at TEXT,
            reviewer_comment TEXT DEFAULT ''
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_alerts_project ON alerts(project_id);
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
    """)

    # Seed initial alerts if table is empty
    cur = conn.execute("SELECT COUNT(*) FROM alerts")
    if cur.fetchone()[0] == 0:
        seed_alerts = [
            {
                "alert_id": "ALT-2026-0001",
                "project_id": "100482",
                "severity": "CRITICAL",
                "alert_type": "EXPENDITURE_PROGRESS_MISMATCH",
                "description": "Financial utilization (82.5%) significantly leads physical progress (25.0%). Gap: +57.5%. Potential anomaly — site verification required.",
                "evidence": json.dumps({
                    "financial_progress_pct": 82.5,
                    "physical_progress_pct": 25.0,
                    "divergence_index": 57.5,
                    "recommended_amount": 1850000.0,
                    "expenditure_amount": 1526250.0,
                    "lifecycle_status": "IN_PROGRESS",
                    "duration_days": 240,
                    "state": "MAHARASHTRA",
                    "district": "PUNE",
                    "category": "ROADS_AND_BRIDGES"
                }),
                "status": "UNDER_INVESTIGATION",
                "assigned_to": "Shri R. Sharma (District Magistrate / Collector Office)",
                "assigned_role": "DISTRICT_AUTHORITY",
                "created_at": "2026-08-28T09:30:00Z",
                "resolved_at": None,
                "reviewer_comment": "Physical verification committee dispatched to verify road surface layers. Tranche #3 payment frozen."
            },
            {
                "alert_id": "ALT-2026-0002",
                "project_id": "102391",
                "severity": "HIGH",
                "alert_type": "POTENTIAL_DUPLICATE_WORK",
                "description": "High lexical and budgetary overlap with Work #101290 (88% similarity). Potential duplicate sanction recommendation — human review required.",
                "evidence": json.dumps({
                    "similarity_score": 0.88,
                    "text_similarity": 0.86,
                    "cost_similarity": 0.94,
                    "paired_project_id": "101290",
                    "matching_reasons": [
                        "Substantial scope overlap (86% token match)",
                        "Matched budget scale within ₹45,000",
                        "Same implementing agency and constituency boundary"
                    ],
                    "state": "MAHARASHTRA",
                    "district": "PUNE",
                    "category": "DRINKING_WATER"
                }),
                "status": "ACKNOWLEDGED",
                "assigned_to": "Dr. V. Rao (Nodal Executive Engineer)",
                "assigned_role": "DISTRICT_AUTHORITY",
                "created_at": "2026-08-27T11:15:00Z",
                "resolved_at": None,
                "reviewer_comment": "Clarification notice issued to Gram Panchayat to verify physical survey boundaries."
            },
            {
                "alert_id": "ALT-2026-0003",
                "project_id": "101844",
                "severity": "HIGH",
                "alert_type": "PROJECT_DELAY_ANOMALY",
                "description": "Project execution duration (420 days) exceeds category benchmark (180 days) by 2.3x. Risk of fund stagnation.",
                "evidence": json.dumps({
                    "current_duration_days": 420,
                    "benchmark_duration_days": 180,
                    "schedule_deviation_ratio": 2.33,
                    "delay_probability": 0.96,
                    "estimated_delay_days": 105,
                    "state": "UTTAR PRADESH",
                    "district": "VARANASI",
                    "category": "HEALTH"
                }),
                "status": "NEW",
                "assigned_to": "Unassigned",
                "assigned_role": "DISTRICT_AUTHORITY",
                "created_at": "2026-08-26T08:00:00Z",
                "resolved_at": None,
                "reviewer_comment": ""
            },
            {
                "alert_id": "ALT-2026-0004",
                "project_id": "103112",
                "severity": "CRITICAL",
                "alert_type": "COST_OVERRUN_ANOMALY",
                "description": "Final completed cost (₹34,50,000) exceeded original sanction (₹20,00,000) by +72.5% (+₹14.5L). Outside normal comparable range.",
                "evidence": json.dumps({
                    "recommended_amount": 2000000.0,
                    "final_amount": 3450000.0,
                    "variance_amount": 1450000.0,
                    "variance_pct": 72.5,
                    "category_median_cost": 1850000.0,
                    "cost_robust_zscore": 3.82,
                    "state": "TAMIL NADU",
                    "district": "CHENNAI",
                    "category": "COMMUNITY_CENTERS"
                }),
                "status": "UNDER_INVESTIGATION",
                "assigned_to": "Chief Audit Officer (MoSPI/CAG)",
                "assigned_role": "MINISTRY_ADMIN",
                "created_at": "2026-08-29T10:00:00Z",
                "resolved_at": None,
                "reviewer_comment": "Escalated for administrative cost revision ratification audit."
            },
            {
                "alert_id": "ALT-2026-0005",
                "project_id": "100115",
                "severity": "MEDIUM",
                "alert_type": "RULE_VIOLATION_SANCTION_EXCEEDED",
                "description": "Expenditure voucher recorded without verified administrative sanction document linkage.",
                "evidence": json.dumps({
                    "expenditure_amount": 450000.0,
                    "sanction_status": "MISSING_DOCUMENT_HASH",
                    "state": "KARNATAKA",
                    "district": "BENGALURU URBAN",
                    "category": "EDUCATION"
                }),
                "status": "RESOLVED",
                "assigned_to": "Auditor S. Kulkarni",
                "assigned_role": "DISTRICT_AUTHORITY",
                "created_at": "2026-08-25T14:00:00Z",
                "resolved_at": "2026-08-30T15:30:00Z",
                "reviewer_comment": "Missing signed sanction letter uploaded to eSAKSHI repository by district engineer. Verified and closed."
            }
        ]
        for a in seed_alerts:
            conn.execute("""
                INSERT INTO alerts (alert_id, project_id, severity, alert_type, description, evidence, status, assigned_to, assigned_role, created_at, resolved_at, reviewer_comment)
                VALUES (:alert_id, :project_id, :severity, :alert_type, :description, :evidence, :status, :assigned_to, :assigned_role, :created_at, :resolved_at, :reviewer_comment)
            """, a)

        # Log seed actions in audit trail
        conn.execute("""
            INSERT INTO audit_trail (case_id, action, performed_by, role, timestamp, details, previous_state, new_state)
            VALUES 
            ('ALT-2026-0001', 'ALERT_CREATED', 'AI Analytics Engine', 'SYSTEM', '2026-08-28T09:30:00Z', 'Identified +57.5% progress mismatch.', '', 'NEW'),
            ('ALT-2026-0001', 'ACKNOWLEDGED', 'Director (MPLADS)', 'MINISTRY_ADMIN', '2026-08-28T10:00:00Z', 'Assigned to District Magistrate for on-site inquiry.', 'NEW', 'UNDER_INVESTIGATION'),
            ('ALT-2026-0002', 'ALERT_CREATED', 'AI Analytics Engine', 'SYSTEM', '2026-08-27T11:15:00Z', 'Duplicate detection engine identified 88% similarity with Work #101290.', '', 'NEW'),
            ('ALT-2026-0002', 'ACKNOWLEDGED', 'Dr. V. Rao', 'DISTRICT_AUTHORITY', '2026-08-28T16:45:00Z', 'Issued formal GPS boundary clarification to GP.', 'NEW', 'ACKNOWLEDGED'),
            ('ALT-2026-0005', 'RESOLVED', 'Auditor S. Kulkarni', 'DISTRICT_AUTHORITY', '2026-08-30T15:30:00Z', 'Sanction letter uploaded and verified.', 'UNDER_INVESTIGATION', 'RESOLVED')
        """)

    conn.commit()
    conn.close()

# Initialize on import
init_alerts_db()

class AlertsService:
    def list_alerts(
        self,
        state: Optional[str] = None,
        district: Optional[str] = None,
        mp_id: Optional[str] = None,
        agency: Optional[str] = None,
        project_id: Optional[str] = None,
        severity: Optional[str] = None,
        alert_type: Optional[str] = None,
        status: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        conn = get_db_connection()
        query = """
            SELECT a.*, 
                   w.work_description_normalized AS project_title,
                   w.state_normalized AS state,
                   COALESCE(w.constituency_normalized, 'GENERAL') AS district,
                   w.mp_name_normalized AS mp_name,
                   w.internal_mp_id AS mp_id,
                   w.ida_normalized AS implementing_agency,
                   w.category_normalized AS category,
                   w.recommended_amount,
                   w.final_amount
            FROM alerts a
            LEFT JOIN works w ON CAST(a.project_id AS TEXT) = CAST(w.work_id AS TEXT)
            WHERE 1=1
        """
        params = []

        if project_id:
            query += " AND CAST(a.project_id AS TEXT) = ?"
            params.append(str(project_id))
        if severity:
            query += " AND a.severity = ?"
            params.append(severity.upper())
        if alert_type:
            query += " AND a.alert_type = ?"
            params.append(alert_type.upper())
        if status:
            query += " AND a.status = ?"
            params.append(status.upper())
        if state:
            query += " AND (w.state_normalized = ? OR a.evidence LIKE ?)"
            params.extend([state.upper(), f"%{state.upper()}%"])
        if district:
            query += " AND (w.constituency_normalized = ? OR a.evidence LIKE ?)"
            params.extend([district.upper(), f"%{district.upper()}%"])
        if mp_id:
            query += " AND w.internal_mp_id = ?"
            params.append(mp_id)
        if agency:
            query += " AND w.ida_normalized LIKE ?"
            params.append(f"%{agency}%")
        if date_from:
            query += " AND a.created_at >= ?"
            params.append(date_from)
        if date_to:
            query += " AND a.created_at <= ?"
            params.append(date_to)

        # Ordering: CRITICAL first, then HIGH, then date
        query += """
            ORDER BY 
                CASE a.severity
                    WHEN 'CRITICAL' THEN 1
                    WHEN 'HIGH' THEN 2
                    WHEN 'MEDIUM' THEN 3
                    WHEN 'LOW' THEN 4
                    ELSE 5
                END ASC,
                a.created_at DESC
            LIMIT ? OFFSET ?
        """
        params.extend([limit, offset])

        rows = conn.execute(query, params).fetchall()

        # Count total
        count_q = """
            SELECT COUNT(*)
            FROM alerts a
            LEFT JOIN works w ON CAST(a.project_id AS TEXT) = CAST(w.work_id AS TEXT)
            WHERE 1=1
        """
        count_params = params[:-2]  # drop limit and offset
        if count_params:
            count_q += query.split("WHERE 1=1")[1].split("ORDER BY")[0]
            total = conn.execute(count_q, count_params).fetchone()[0]
        else:
            total = conn.execute("SELECT COUNT(*) FROM alerts").fetchone()[0]

        conn.close()

        items = []
        for r in rows:
            d = dict(r)
            try:
                d["evidence_parsed"] = json.loads(d["evidence"])
            except Exception:
                d["evidence_parsed"] = {}
            items.append(d)

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "items": items
        }

    def get_alert(self, alert_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        row = conn.execute("""
            SELECT a.*, 
                   w.work_description_normalized AS project_title,
                   w.state_normalized AS state,
                   COALESCE(w.constituency_normalized, 'GENERAL') AS district,
                   w.mp_name_normalized AS mp_name,
                   w.internal_mp_id AS mp_id,
                   w.ida_normalized AS implementing_agency,
                   w.category_normalized AS category,
                   w.recommended_amount,
                   w.final_amount,
                   w.lifecycle_status
            FROM alerts a
            LEFT JOIN works w ON CAST(a.project_id AS TEXT) = CAST(w.work_id AS TEXT)
            WHERE a.alert_id = ?
        """, (alert_id,)).fetchone()
        if not row:
            conn.close()
            return None

        alert_dict = dict(row)
        try:
            alert_dict["evidence_parsed"] = json.loads(alert_dict["evidence"])
        except Exception:
            alert_dict["evidence_parsed"] = {}

        # Fetch audit trail for this alert
        audit_rows = conn.execute(
            "SELECT * FROM audit_trail WHERE case_id = ? ORDER BY timestamp ASC",
            (alert_id,)
        ).fetchall()
        conn.close()

        alert_dict["audit_trail"] = [dict(a) for a in audit_rows]
        return alert_dict

    def create_alert(
        self,
        project_id: str,
        severity: str,
        alert_type: str,
        description: str,
        evidence: Dict[str, Any],
        assigned_to: str = "Unassigned",
        assigned_role: str = "DISTRICT_AUTHORITY",
        user: str = "AI Analytics Engine",
        role: str = "SYSTEM"
    ) -> Dict[str, Any]:
        conn = get_db_write_connection()
        cur = conn.execute("SELECT COUNT(*) FROM alerts")
        new_num = cur.fetchone()[0] + 1
        alert_id = f"ALT-2026-{new_num:04d}"
        now_ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
        evidence_json = json.dumps(evidence, default=str)

        conn.execute("""
            INSERT INTO alerts (alert_id, project_id, severity, alert_type, description, evidence, status, assigned_to, assigned_role, created_at, reviewer_comment)
            VALUES (?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?, '')
        """, (alert_id, str(project_id), severity.upper(), alert_type.upper(), description, evidence_json, assigned_to, assigned_role, now_ts))

        # Log creation in audit trail
        conn.execute("""
            INSERT INTO audit_trail (case_id, action, performed_by, role, timestamp, details, previous_state, new_state)
            VALUES (?, 'ALERT_CREATED', ?, ?, ?, ?, '', 'NEW')
        """, (alert_id, user, role, now_ts, f"Created {severity} risk alert ({alert_type}) for Work #{project_id}."))

        conn.commit()
        conn.close()
        return self.get_alert(alert_id)

    def update_alert(
        self,
        alert_id: str,
        status: Optional[str] = None,
        assigned_to: Optional[str] = None,
        assigned_role: Optional[str] = None,
        reviewer_comment: Optional[str] = None,
        user: str = "Authorized Official",
        role: str = "DISTRICT_AUTHORITY"
    ) -> Optional[Dict[str, Any]]:
        read_conn = get_db_connection()
        alert_row = read_conn.execute("SELECT * FROM alerts WHERE alert_id = ?", (alert_id,)).fetchone()
        if not alert_row:
            read_conn.close()
            return None
        old_status = alert_row["status"]
        existing_comment = alert_row["reviewer_comment"] or ""
        read_conn.close()

        now_ts = datetime.datetime.now(datetime.timezone.utc).isoformat()
        updates = []
        params = []
        action = "ALERT_UPDATED"

        if status:
            updates.append("status = ?")
            params.append(status.upper())
            if status.upper() in ("RESOLVED", "DISMISSED"):
                updates.append("resolved_at = ?")
                params.append(now_ts)
                action = "ALERT_RESOLVED" if status.upper() == "RESOLVED" else "ALERT_DISMISSED"
            elif status.upper() == "ACKNOWLEDGED":
                action = "ALERT_ACKNOWLEDGED"

        if assigned_to:
            updates.append("assigned_to = ?")
            params.append(assigned_to)
            action = "ALERT_ASSIGNED"

        if assigned_role:
            updates.append("assigned_role = ?")
            params.append(assigned_role)

        if reviewer_comment:
            new_comment_entry = f"[{now_ts}] {user} ({role}): {reviewer_comment}"
            combined = (existing_comment + "\n" + new_comment_entry).strip() if existing_comment else new_comment_entry
            updates.append("reviewer_comment = ?")
            params.append(combined)
            if not status and not assigned_to:
                action = "COMMENT_ADDED"

        if not updates:
            return self.get_alert(alert_id)

        params.append(alert_id)
        query = f"UPDATE alerts SET {', '.join(updates)} WHERE alert_id = ?"

        details_msg = f"{action}: "
        if status:
            details_msg += f"Status -> {status.upper()}. "
        if assigned_to:
            details_msg += f"Assigned to {assigned_to}. "
        if reviewer_comment:
            details_msg += f"Note: {reviewer_comment}."

        write_conn = get_db_write_connection()
        write_conn.execute(query, params)
        write_conn.execute("""
            INSERT INTO audit_trail (case_id, action, performed_by, role, timestamp, details, previous_state, new_state)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (alert_id, action, user, role, now_ts, details_msg.strip(), old_status, status.upper() if status else old_status))
        write_conn.commit()
        write_conn.close()

        return self.get_alert(alert_id)

    def get_alert_summary(self, state: Optional[str] = None, district: Optional[str] = None) -> Dict[str, Any]:
        conn = get_db_connection()
        query = """
            SELECT a.severity, a.status, a.alert_type, COUNT(*) as count
            FROM alerts a
            LEFT JOIN works w ON CAST(a.project_id AS TEXT) = CAST(w.work_id AS TEXT)
            WHERE 1=1
        """
        params = []
        if state:
            query += " AND (w.state_normalized = ? OR a.evidence LIKE ?)"
            params.extend([state.upper(), f"%{state.upper()}%"])
        if district:
            query += " AND (w.constituency_normalized = ? OR a.evidence LIKE ?)"
            params.extend([district.upper(), f"%{district.upper()}%"])

        query += " GROUP BY a.severity, a.status, a.alert_type"
        rows = conn.execute(query, params).fetchall()
        conn.close()

        sev_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        status_counts = {"NEW": 0, "ACKNOWLEDGED": 0, "UNDER_INVESTIGATION": 0, "RESOLVED": 0, "DISMISSED": 0}
        type_counts = {}
        total = 0

        for r in rows:
            cnt = r["count"]
            total += cnt
            sev = r["severity"].upper()
            st = r["status"].upper()
            tp = r["alert_type"]

            if sev in sev_counts:
                sev_counts[sev] += cnt
            if st in status_counts:
                status_counts[st] += cnt
            type_counts[tp] = type_counts.get(tp, 0) + cnt

        return {
            "total_alerts": total,
            "by_severity": sev_counts,
            "by_status": status_counts,
            "by_type": type_counts
        }

alerts_service = AlertsService()
