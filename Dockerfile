# ====================================================================
# JanDrishti — Production Backend Container
# Multi-stage lightweight Python runtime packaging immutable database
# ====================================================================

FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application backend package and migrations
COPY backend/ ./backend/
COPY database/ ./database/
COPY migrations/ ./migrations/

# Expose production port
EXPOSE 8000

# Run production Uvicorn server bound to $PORT
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
