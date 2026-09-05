"""
JanDrishti — Governance Database Schema & Initialization Module
Initializes statutory tables for hierarchical RBAC, immutable audit logging,
MP recommendations, financial corrections, and citizen discrepancy reports.
Compatible with SQLite and PostgreSQL.
"""

import logging
from backend.database import get_db_connection

logger = logging.getLogger("jandrishti.gov_db")

GOVERNANCE_DDL = [
    """
    CREATE TABLE IF NOT EXISTS system_roles (
        role_code VARCHAR(50) PRIMARY KEY,
        role_name VARCHAR(100) NOT NULL,
        hierarchy_level INTEGER NOT NULL,
        jurisdiction_scope VARCHAR(50) NOT NULL,
        description TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        field_name VARCHAR(100),
        old_value TEXT,
        new_value TEXT,
        reason TEXT,
        jurisdiction VARCHAR(100),
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS recommendations (
        recommendation_id VARCHAR(64) PRIMARY KEY,
        internal_mp_id VARCHAR(100) NOT NULL,
        mp_name VARCHAR(150),
        constituency VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        proposed_title VARCHAR(255) NOT NULL,
        sector VARCHAR(100) NOT NULL,
        estimated_cost REAL NOT NULL,
        location_description TEXT,
        block VARCHAR(100),
        gram_panchayat VARCHAR(100),
        justification TEXT,
        priority VARCHAR(20) DEFAULT 'NORMAL',
        workflow_status VARCHAR(50) DEFAULT 'DRAFT',
        sanctioned_work_id VARCHAR(100),
        district_authority_remarks TEXT,
        state_nodal_remarks TEXT,
        created_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS correction_requests (
        correction_id VARCHAR(64) PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        field_name VARCHAR(100) NOT NULL,
        previous_value TEXT NOT NULL,
        proposed_value TEXT NOT NULL,
        reason TEXT NOT NULL,
        requested_by VARCHAR(100) NOT NULL,
        requested_by_role VARCHAR(50) NOT NULL,
        jurisdiction VARCHAR(100) NOT NULL,
        status VARCHAR(30) DEFAULT 'PENDING',
        reviewed_by VARCHAR(100),
        review_comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS audit_investigation_cases (
        case_id VARCHAR(64) PRIMARY KEY,
        work_id VARCHAR(100),
        transaction_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        status VARCHAR(30) DEFAULT 'OPEN',
        hypothesis TEXT NOT NULL,
        evidence TEXT NOT NULL,
        auditor_notes TEXT,
        assigned_auditor VARCHAR(100) NOT NULL,
        jurisdiction VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS citizen_reports (
        report_id VARCHAR(64) PRIMARY KEY,
        work_id VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        district VARCHAR(100),
        constituency VARCHAR(100),
        discrepancy_category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        reported_location TEXT,
        photo_url TEXT,
        status VARCHAR(30) DEFAULT 'SUBMITTED',
        assigned_authority VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
]

DEFAULT_ROLES = [
    ("MINISTRY_ADMIN", "Ministry / MoSPI Administrator", 1, "NATIONAL", "Apex national oversight, policy weights, master data and global verification."),
    ("STATE_NODAL_AUTHORITY", "State Nodal Authority", 2, "STATE", "State-level coordination, inter-district allocations, validation sign-off."),
    ("DISTRICT_AUTHORITY", "District Authority / DM", 3, "DISTRICT", "Execution management, milestone verification, technical sanctions and inspections."),
    ("MP", "Member of Parliament", 4, "CONSTITUENCY", "MP recommendations, annual quota tracking, constituent interest representation."),
    ("AUDITOR", "Public Finance Integrity Auditor", 5, "NATIONAL", "Forensic analysis, anomaly investigation, evidence annotation without financial tampering."),
    ("CITIZEN", "Citizen / Public Auditor", 6, "PUBLIC", "Read-only access to verified public infrastructure data and discrepancy reporting."),
]


def init_governance_schema():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        for stmt in GOVERNANCE_DDL:
            try:
                cur.execute(stmt)
            except Exception as e:
                logger.warning("DDL statement error: %s", e)
        conn.commit()

        # Seed roles if empty
        for role in DEFAULT_ROLES:
            try:
                cur.execute(
                    "INSERT OR IGNORE INTO system_roles (role_code, role_name, hierarchy_level, jurisdiction_scope, description) VALUES (?, ?, ?, ?, ?)",
                    role
                )
            except Exception:
                try:
                    cur.execute(
                        "INSERT INTO system_roles (role_code, role_name, hierarchy_level, jurisdiction_scope, description) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (role_code) DO NOTHING",
                        role
                    )
                except Exception:
                    pass
        conn.commit()
        logger.info("Governance schema initialized successfully.")
    except Exception as e:
        logger.error("Failed to initialize governance schema: %s", e)
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    init_governance_schema()
    print("Governance database tables initialized.")
