FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (layer cached unless requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app ./app

# Copy Alembic migration files
COPY alembic.ini .
COPY migrations ./migrations

# Copy and permission the startup script
COPY start.sh .
RUN chmod +x start.sh

EXPOSE 8000

# start.sh runs: alembic upgrade head → uvicorn
CMD ["./start.sh"]
