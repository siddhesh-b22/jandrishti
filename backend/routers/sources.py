from typing import Any, List
from fastapi import APIRouter, Depends

from backend.database import get_db

router = APIRouter(prefix="/api/sources", tags=["Data Sources"])


@router.get("/health")
def source_health(conn=Depends(get_db)) -> List[Any]:
    rows = conn.execute(
        "SELECT source_id, last_checked_at, last_success_at, last_batch_id, "
        "status, http_status, error_message FROM source_health ORDER BY source_id"
    ).fetchall()
    return [dict(row) for row in rows]


@router.get("/batches")
def ingestion_batches(conn=Depends(get_db), limit: int = 50) -> List[Any]:
    rows = conn.execute(
        "SELECT batch_id, source_id, dataset_name, source_effective_date, fetched_at, "
        "checksum_sha256, record_count, file_size_bytes, status, error_message "
        "FROM ingestion_batches ORDER BY fetched_at DESC LIMIT ?",
        (min(max(limit, 1), 200),),
    ).fetchall()
    return [dict(row) for row in rows]


@router.get("/status")
def synchronization_status(conn=Depends(get_db)):
    """Report whether detailed published data is live or snapshot-backed."""
    latest = conn.execute(
        "SELECT batch_id, fetched_at, source_effective_date, checksum_sha256 "
        "FROM ingestion_batches ORDER BY fetched_at DESC LIMIT 1"
    ).fetchone()
    return {
        "detailed_datasets": "SNAPSHOT_BACKED",
        "live_macro_telemetry": "AVAILABLE",
        "latest_live_batch": dict(latest) if latest else None,
        "publication_policy": (
            "Detailed works and transactions remain unchanged until an official "
            "granular source passes schema and reconciliation validation."
        ),
    }
