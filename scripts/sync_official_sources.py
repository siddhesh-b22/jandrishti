"""Fetch and archive official source observations.

This command is safe to run from cron, Task Scheduler, or a container job.
It never overwrites the detailed static snapshot unless a validated loader is
explicitly added for that source.
"""

import argparse
import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.data_sources.poller import macro_poller


def main() -> int:
    parser = argparse.ArgumentParser(description="Synchronize official MPLADS source observations")
    parser.add_argument("--sync", action="store_true", help="Fetch and archive the live MoSPI macro source")
    args = parser.parse_args()
    if not args.sync:
        parser.error("Use --sync to fetch an official source observation")

    try:
        success, snapshot_id, summary = macro_poller.sync_snapshot()
    except Exception as exc:
        print(f"Official source synchronization failed: {exc}", file=sys.stderr)
        return 1

    print(json.dumps({"success": success, "snapshot_id": snapshot_id, **summary}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
