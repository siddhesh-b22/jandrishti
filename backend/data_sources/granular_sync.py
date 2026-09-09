"""Guarded synchronization for official granular MPLADS exports.

The portal does not publish one stable, documented national works/transactions
contract. This module therefore requires an explicit endpoint and payload
template, archives raw pages, and refuses publication until the response is
complete and reconciled.
"""

import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List

from backend.data_sources.connector import government_connector
from backend.database import get_db_write_connection


def _json_env(name: str) -> Dict[str, Any]:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required for granular synchronization")
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"{name} must contain valid JSON: {exc}") from exc
    if not isinstance(parsed, dict):
        raise RuntimeError(f"{name} must contain a JSON object")
    return parsed


def _extract_records(payload: Any) -> List[Dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("data", "content", "items", "records", "result", "rows"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
        for value in payload.values():
            if isinstance(value, list) and all(isinstance(item, dict) for item in value):
                return value
    return []


def _archive(source_id: str, dataset_name: str, payload: Any) -> Dict[str, Any]:
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    checksum = hashlib.sha256(raw).hexdigest()
    batch_id = f"BATCH_{checksum[:24]}"
    archive_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "data", "raw", "live_batches",
    )
    os.makedirs(archive_dir, exist_ok=True)
    archive_path = os.path.join(archive_dir, f"{batch_id}_{dataset_name}.json")
    if not os.path.exists(archive_path):
        with open(archive_path, "wb") as target:
            target.write(raw)

    now = datetime.now(timezone.utc).isoformat()
    conn = get_db_write_connection()
    try:
        conn.execute(
            """
            INSERT OR REPLACE INTO ingestion_batches
            (batch_id, source_id, dataset_name, source_effective_date, fetched_at,
             checksum_sha256, record_count, file_size_bytes, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (batch_id, source_id, dataset_name, now[:10], now, checksum,
             len(_extract_records(payload)), len(raw), "FETCHED"),
        )
        conn.commit()
    finally:
        conn.close()
    return {
        "batch_id": batch_id,
        "checksum": checksum,
        "archive_path": os.path.relpath(archive_path),
        "record_count": len(_extract_records(payload)),
    }


def sync_granular_dataset(
    source_id: str,
    dataset_name: str,
    endpoint_env: str,
    payload_env: str,
    page_field: str = "page",
    page_size_field: str = "pageSize",
    page_size: int = 500,
    max_pages: int = 1000,
) -> Dict[str, Any]:
    endpoint = os.environ.get(endpoint_env, "").strip()
    if not endpoint:
        raise RuntimeError(f"{endpoint_env} is required; granular publication is blocked")
    template = _json_env(payload_env)
    pages: List[Any] = []

    for page in range(1, max_pages + 1):
        payload = dict(template)
        payload[page_field] = page
        payload[page_size_field] = page_size
        response = government_connector.fetch_json(
            endpoint, method="POST", json_payload=payload, use_cache=False
        )
        pages.append(response)
        records = _extract_records(response)
        if len(records) < page_size:
            break
    else:
        raise RuntimeError(f"{dataset_name} exceeded max_pages={max_pages}; completeness is unknown")

    records = [record for page in pages for record in _extract_records(page)]
    if not records:
        raise RuntimeError(f"{dataset_name} returned no records; refusing publication")

    result = _archive(source_id, dataset_name, {"pages": pages, "records": records})
    result.update({"dataset_name": dataset_name, "pages": len(pages), "status": "FETCHED"})
    return result
