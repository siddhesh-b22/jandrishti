import os
import time
import logging
import threading
from collections import defaultdict, deque
from typing import Dict
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.config import API_TITLE, API_VERSION, API_DESCRIPTION
from backend.db_gov_init import init_governance_schema

# Import modular routers
from backend.routers.overview import router as overview_router
from backend.routers.auth import router as auth_router
from backend.routers.mps import router as mps_router
from backend.routers.works import router as works_router
from backend.routers.intelligence import router as intelligence_router
from backend.routers.dashboards import router as dashboards_router
from backend.routers.cases_alerts import router as cases_alerts_router
from backend.routers.ingest import router as ingest_router
from backend.routers.governance import router as governance_router
from backend.routers.sources import router as sources_router

logger = logging.getLogger("jandrishti.api")

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
cors_env = os.environ.get("CORS_ORIGINS", "").strip()
if cors_env == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    known_origins = [
        "https://jandrishti-rust.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]
    if cors_env:
        known_origins.extend([o.strip() for o in cors_env.split(",") if o.strip()])

    app.add_middleware(
        CORSMiddleware,
        allow_origins=known_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

# In-Memory Rate Limiting & Security Headers Middleware
RATE_LIMIT_STORE: Dict[str, deque] = defaultdict(deque)
RATE_LIMIT_MUTATION_STORE: Dict[str, deque] = defaultdict(deque)
MAX_REQUESTS_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_MINUTE", "300"))
MAX_MUTATIONS_PER_MINUTE = int(os.environ.get("RATE_LIMIT_MUTATION_PER_MINUTE", "60"))

@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    if request.url.path not in ["/health", "/api/health"] and request.method != "OPTIONS":
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        window = RATE_LIMIT_STORE[client_ip]
        while window and window[0] < now - 60:
            window.popleft()
        if len(window) >= MAX_REQUESTS_PER_MINUTE:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "API rate limit exceeded. Please retry shortly."}
            )
        window.append(now)

        if request.method in ["POST", "PATCH", "DELETE"]:
            m_window = RATE_LIMIT_MUTATION_STORE[client_ip]
            while m_window and m_window[0] < now - 60:
                m_window.popleft()
            if len(m_window) >= MAX_MUTATIONS_PER_MINUTE:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Mutation rate limit exceeded. Please retry shortly."}
                )
            m_window.append(now)

    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Civic-Platform"] = "JanDrishti-GovTech"

    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal API error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"Internal API error: {str(exc)}",
            "error_type": exc.__class__.__name__
        }
    )

@app.on_event("startup")
def on_startup_governance():
    threading.Thread(target=init_governance_schema, daemon=True).start()

# Mount Modular Routers
app.include_router(overview_router)
app.include_router(auth_router)
app.include_router(mps_router)
app.include_router(works_router)
app.include_router(intelligence_router)
app.include_router(dashboards_router)
app.include_router(cases_alerts_router)
app.include_router(ingest_router)
app.include_router(governance_router)
app.include_router(sources_router)

# Serve uploaded citizen evidence images
import pathlib
_uploads_dir = pathlib.Path("uploads/citizen_evidence")
_uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
