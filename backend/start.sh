#!/bin/sh
# Entrypoint for production Docker container.
# 1. Runs pending Alembic migrations (idempotent — safe to re-run on every deploy).
# 2. Starts the FastAPI server.
set -e

echo "[start.sh] Running database migrations..."
alembic upgrade head

echo "[start.sh] Starting EXIT RIGHT API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 2
