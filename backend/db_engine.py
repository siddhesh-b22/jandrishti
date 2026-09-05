import os
import re
import sqlite3
import logging
from typing import Any, Generator, Sequence, Union

from backend.config import DATABASE_PATH, DATABASE_URL, BASE_DIR, USING_POSTGRES

logger = logging.getLogger("jandrishti.db")

_COMPAT_SQL_PATH = os.path.join(BASE_DIR, "migrations", "007_sqlite_compat_and_app_users.sql")
_compat_applied = False

Params = Union[Sequence[Any], None]


class CompatRow(dict):
    """sqlite3.Row-like mapping: supports both name and positional access."""

    def __init__(self, mapping):
        super().__init__(mapping)
        self._values = list(mapping.values())

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._values[key]
        return super().__getitem__(key)


def _replace_qmark(sql: str) -> str:
    out = []
    in_single = False
    i = 0
    while i < len(sql):
        ch = sql[i]
        if ch == "'" and not in_single:
            in_single = True
            out.append(ch)
        elif ch == "'" and in_single:
            if i + 1 < len(sql) and sql[i + 1] == "'":
                out.append("''")
                i += 1
            else:
                in_single = False
                out.append(ch)
        elif ch == "?" and not in_single:
            out.append("%s")
        else:
            out.append(ch)
        i += 1
    return "".join(out)


def adapt_sql_for_postgres(sql: str) -> str:
    stripped = sql.strip()
    if stripped.upper().startswith("PRAGMA"):
        return "SELECT 1"
    sql = re.sub(
        r"strftime\('%Y-%m',\s*([^)]+)\)",
        r"to_char(\1::timestamp, 'YYYY-MM')",
        sql,
        flags=re.IGNORECASE,
    )
    # Ensure subqueries in FROM clause have an alias for PostgreSQL compliance
    sql = re.sub(r"\)\s+WHERE\b", ") _sub_alias WHERE", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\)\s+GROUP\s+BY\b", ") _sub_alias GROUP BY", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\)\s+ORDER\s+BY\b", ") _sub_alias ORDER BY", sql, flags=re.IGNORECASE)

    return _replace_qmark(sql)


class PostgresCursor:
    def __init__(self, raw_cursor):
        self._cur = raw_cursor
        self.lastrowid = None
        self.description = None
        self.rowcount = 0

    def execute(self, sql: str, params: Params = None):
        adapted = adapt_sql_for_postgres(sql)
        self._cur.execute(adapted, tuple(params) if params is not None else None)
        self.description = self._cur.description
        self.rowcount = self._cur.rowcount
        return self

    def fetchone(self):
        row = self._cur.fetchone()
        if row is None:
            return None
        return CompatRow(row)

    def fetchall(self):
        rows = self._cur.fetchall()
        return [CompatRow(r) for r in rows]

    def close(self):
        self._cur.close()


class PostgresConnection:
    def __init__(self, raw_conn):
        self._conn = raw_conn

    def cursor(self):
        from psycopg2.extras import RealDictCursor
        return PostgresCursor(self._conn.cursor(cursor_factory=RealDictCursor))

    def execute(self, sql: str, params: Params = None):
        cur = self.cursor()
        cur.execute(sql, params)
        return cur

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()


def _apply_compat_schema(raw_conn) -> None:
    global _compat_applied
    if _compat_applied:
        return
    if not os.path.exists(_COMPAT_SQL_PATH):
        logger.warning("Compat SQL file missing: %s", _COMPAT_SQL_PATH)
        _compat_applied = True
        return
    sql_text = open(_COMPAT_SQL_PATH, encoding="utf-8").read()
    parts = [p.strip() for p in sql_text.split("-- SPLIT") if p.strip()]
    cur = raw_conn.cursor()
    cur.execute("SET search_path TO compat, public, gov, ml, analytics, extensions")
    for part in parts:
        stmt = part.strip().rstrip(";")
        if not stmt or stmt.startswith("-- ==="):
            continue
        try:
            cur.execute(stmt)
        except Exception as exc:
            raw_conn.rollback()
            cur = raw_conn.cursor()
            cur.execute("SET search_path TO compat, public, gov, ml, analytics, extensions")
            logger.warning("Compat statement skipped: %s | %s", exc, stmt[:120].replace("\n", " "))
        else:
            raw_conn.commit()
    _compat_applied = True
    logger.info("Supabase compat schema applied")


def _connect_postgres():
    import psycopg2
    from psycopg2.extras import RealDictCursor

    raw = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor, connect_timeout=10)
    raw.autocommit = False
    _apply_compat_schema(raw)
    cur = raw.cursor()
    cur.execute("SET search_path TO compat, public, gov, ml, analytics, extensions")
    raw.commit()
    return PostgresConnection(raw)


def _is_valid_sqlite_db(path: str) -> bool:
    if not path or not os.path.exists(path):
        return False
    try:
        # A valid SQLite 3 database starts with the 16-byte header: "SQLite format 3\000"
        with open(path, "rb") as f:
            header = f.read(16)
            return header == b"SQLite format 3\x00"
    except Exception:
        return False


_fallback_initialized = False


def _get_fallback_connection():
    global _fallback_initialized
    import tempfile
    fallback_path = os.path.join(tempfile.gettempdir(), "jandrishti_fallback.db")
    conn = sqlite3.connect(fallback_path, check_same_thread=False, timeout=30.0)
    conn.row_factory = sqlite3.Row
    if not _fallback_initialized:
        try:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS mps (internal_mp_id TEXT PRIMARY KEY, mp_name_raw TEXT, mp_name_normalized TEXT, constituency_raw TEXT, constituency_normalized TEXT, state_raw TEXT, state_normalized TEXT, house TEXT, allocated_amount REAL DEFAULT 0, total_expenditure REAL DEFAULT 0, unspent_amount REAL DEFAULT 0, utilization_pct REAL DEFAULT 0, recommended_works_count INTEGER DEFAULT 0, sanctioned_works_count INTEGER DEFAULT 0, completed_works_count INTEGER DEFAULT 0);
                CREATE TABLE IF NOT EXISTS works (project_id TEXT PRIMARY KEY, internal_mp_id TEXT, work_title_raw TEXT, work_description_normalized TEXT, state_raw TEXT, state_normalized TEXT, constituency_raw TEXT, constituency_normalized TEXT, category_raw TEXT, category_normalized TEXT, recommended_amount REAL DEFAULT 0, sanctioned_amount REAL DEFAULT 0, expenditure_amount REAL DEFAULT 0, physical_progress_pct REAL DEFAULT 0, financial_progress_pct REAL DEFAULT 0, work_status_normalized TEXT, approval_date TEXT, completion_date TEXT, days_delayed INTEGER DEFAULT 0, delay_category TEXT, is_delayed INTEGER DEFAULT 0, risk_score REAL DEFAULT 0, risk_level TEXT, anomaly_flag INTEGER DEFAULT 0, duplicate_flag INTEGER DEFAULT 0);
                CREATE TABLE IF NOT EXISTS transactions (transaction_id TEXT PRIMARY KEY, project_id TEXT, internal_vendor_id TEXT, voucher_number TEXT, voucher_date TEXT, amount REAL DEFAULT 0, payment_mode TEXT, anomaly_flag INTEGER DEFAULT 0, anomaly_type TEXT);
                CREATE TABLE IF NOT EXISTS vendors (internal_vendor_id TEXT PRIMARY KEY, vendor_name_raw TEXT, vendor_name_normalized TEXT, total_received_amount REAL DEFAULT 0, total_projects_count INTEGER DEFAULT 0, risk_level TEXT);
                CREATE TABLE IF NOT EXISTS anomalies (anomaly_id TEXT PRIMARY KEY, entity_type TEXT, entity_id TEXT, anomaly_type TEXT, description TEXT, severity TEXT, detected_at TEXT);
                CREATE TABLE IF NOT EXISTS alerts (alert_id TEXT PRIMARY KEY, project_id TEXT, severity TEXT, alert_type TEXT, description TEXT, evidence TEXT, status TEXT DEFAULT 'NEW', assigned_to TEXT, assigned_role TEXT, created_at TEXT, resolved_at TEXT, reviewer_comment TEXT);
                CREATE TABLE IF NOT EXISTS review_cases (case_id TEXT PRIMARY KEY, entity_type TEXT, entity_id TEXT, title TEXT, severity TEXT, risk_score REAL, category TEXT, status TEXT DEFAULT 'NEW', assigned_to TEXT, assigned_role TEXT, created_at TEXT, updated_at TEXT, resolution_notes TEXT);
                CREATE TABLE IF NOT EXISTS audit_trail (id INTEGER PRIMARY KEY AUTOINCREMENT, case_id TEXT, action TEXT, performed_by TEXT, role TEXT, timestamp TEXT, details TEXT, previous_state TEXT, new_state TEXT);
            """)
            conn.commit()
            _fallback_initialized = True
        except Exception as exc:
            logger.warning("Failed to initialize fallback schema: %s", exc)
    return conn


def get_db_connection():
    """Uses Supabase PostgreSQL when DATABASE_URL is set; otherwise SQLite."""
    if USING_POSTGRES:
        try:
            return _connect_postgres()
        except Exception as exc:
            logger.error("Supabase PostgreSQL connection failed: %s", exc)

    db_path_abs = os.path.abspath(DATABASE_PATH)
    if not _is_valid_sqlite_db(db_path_abs):
        return _get_fallback_connection()

    try:
        conn = sqlite3.connect(
            db_path_abs,
            check_same_thread=False,
            timeout=30.0
        )
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA busy_timeout = 10000;")
        except Exception:
            pass
        return conn
    except Exception as exc:
        logger.error("Failed to connect to local SQLite database (%s): %s", db_path_abs, exc)
        return _get_fallback_connection()


def get_db_write_connection():
    if USING_POSTGRES:
        try:
            return _connect_postgres()
        except Exception as exc:
            logger.error("Supabase PostgreSQL write connection failed: %s", exc)

    db_path_abs = os.path.abspath(DATABASE_PATH)
    if not _is_valid_sqlite_db(db_path_abs):
        return _get_fallback_connection()

    try:
        conn = sqlite3.connect(
            db_path_abs,
            check_same_thread=False,
            timeout=30.0
        )
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA busy_timeout = 10000;")
        except Exception:
            pass
        return conn
    except Exception as exc:
        logger.error("Failed to open local SQLite write connection (%s): %s", db_path_abs, exc)
        return _get_fallback_connection()


def get_db() -> Generator[Any, None, None]:
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()


def get_write_db() -> Generator[Any, None, None]:
    conn = get_db_write_connection()
    try:
        yield conn
    finally:
        conn.close()


def storage_mode_label() -> str:
    if USING_POSTGRES:
        return "supabase_postgres"
    return "read_only_immutable_sqlite"
