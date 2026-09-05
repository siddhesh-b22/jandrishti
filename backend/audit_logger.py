"""
JanDrishti — Immutable Audit Logger Module
Provides append-only, tamper-evident audit trail recording for all statutory mutations.
"""

import uuid
import logging
from typing import Optional, Any
from backend.database import get_db_connection
from backend.auth import AuthenticatedUser

logger = logging.getLogger("jandrishti.audit")


def record_audit_log(
    user: Optional[AuthenticatedUser],
    action: str,
    entity_type: str,
    entity_id: str,
    field_name: Optional[str] = None,
    old_value: Optional[Any] = None,
    new_value: Optional[Any] = None,
    reason: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> str:
    """
    Inserts an immutable audit log record. Returns log_id.
    """
    log_id = f"AUD-{uuid.uuid4().hex[:12].upper()}"
    user_id = user.user_id if user else "PUBLIC_CITIZEN"
    role = user.role if user else "CITIZEN"
    jurisdiction = user.jurisdiction if user else "PUBLIC"

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        stmt = """
            INSERT INTO audit_logs (
                log_id, user_id, role, action, entity_type, entity_id,
                field_name, old_value, new_value, reason, jurisdiction, ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cur.execute(
            stmt,
            [
                log_id,
                user_id,
                role,
                action,
                entity_type,
                str(entity_id),
                field_name,
                str(old_value) if old_value is not None else None,
                str(new_value) if new_value is not None else None,
                reason,
                jurisdiction,
                ip_address,
            ]
        )
        conn.commit()
        logger.info("Audit log recorded: %s by %s (%s) on %s:%s", action, user_id, role, entity_type, entity_id)
        return log_id
    except Exception as e:
        logger.error("Failed to record audit log: %s", e)
        conn.rollback()
        return ""
    finally:
        conn.close()


def get_recent_audit_logs(limit: int = 50, entity_type: Optional[str] = None) -> list:
    """Retrieves immutable audit trail for Ministry & Auditor consoles."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        if entity_type:
            cur.execute(
                "SELECT * FROM audit_logs WHERE entity_type = ? ORDER BY created_at DESC LIMIT ?",
                [entity_type, limit]
            )
        else:
            cur.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?", [limit])
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    except Exception as e:
        logger.error("Failed to fetch audit logs: %s", e)
        return []
    finally:
        conn.close()
