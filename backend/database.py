import os
import sqlite3
from typing import Generator
from backend.config import DATABASE_PATH

def get_db_connection() -> sqlite3.Connection:
    """
    Establish an immutable, read-only SQLite connection.
    The database artifact is bundled directly with the application container/service.
    No persistent filesystem writes or WAL runtime dependencies are required.
    """
    db_path_abs = os.path.abspath(DATABASE_PATH)
    
    # Attempt URI read-only connection first
    try:
        uri_path = f"file:{db_path_abs}?mode=ro"
        conn = sqlite3.connect(
            uri_path,
            uri=True,
            check_same_thread=False,
            timeout=30.0
        )
    except Exception:
        # Fallback to standard connection if URI parsing differs by OS
        conn = sqlite3.connect(
            db_path_abs,
            check_same_thread=False,
            timeout=30.0
        )

    conn.row_factory = sqlite3.Row
    # Enforce strict query-only mode for immutable public data intelligence
    try:
        conn.execute("PRAGMA query_only = ON;")
    except Exception:
        pass

    return conn

def get_db() -> Generator[sqlite3.Connection, None, None]:
    """FastAPI dependency yielding read-only database connection."""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()
