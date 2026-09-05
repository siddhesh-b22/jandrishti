import os
import uvicorn

if __name__ == "__main__":
    port_str = os.environ.get("PORT", "8000")
    try:
        port = int(port_str)
    except ValueError:
        port = 8000
    host = os.environ.get("HOST", "0.0.0.0")
    workers_str = os.environ.get("WEB_CONCURRENCY", "2")
    try:
        workers = int(workers_str)
    except ValueError:
        workers = 2
    print(f"[JanDrishti] Starting Uvicorn on {host}:{port} with {workers} workers...", flush=True)
    uvicorn.run("backend.main:app", host=host, port=port, workers=workers)
