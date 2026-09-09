"""Fetch configured granular official MPLADS sources without publishing unverified data."""

import json
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.data_sources.granular_sync import sync_granular_dataset


def main() -> int:
    results = []
    failures = []
    for config in (
        ("SRC_MOSPI_WORKS", "works", "MPLADS_WORKS_ENDPOINT", "MPLADS_WORKS_PAYLOAD"),
        ("SRC_MOSPI_TRANSACTIONS", "transactions", "MPLADS_TRANSACTIONS_ENDPOINT", "MPLADS_TRANSACTIONS_PAYLOAD"),
    ):
        try:
            results.append(sync_granular_dataset(*config))
        except RuntimeError as exc:
            failures.append({"dataset": config[1], "error": str(exc)})

    print(json.dumps({"synchronized": results, "blocked": failures}, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
