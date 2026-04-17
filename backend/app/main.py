import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import select

from app.api.auth import router as auth_router
from app.api.recommendation import router as recommendation_router
from app.api.stations import router as stations_router
from app.core.config import get_settings
from app.core.ratelimit import limiter
from app.db.models import Base, CabProvider, ExitGate, Station
from app.db.session import SessionLocal, engine

logging.basicConfig(level=logging.INFO, format="%(levelname)s [%(name)s] %(message)s")
logger = logging.getLogger("exit_right")

settings = get_settings()

# ── Sentry ────────────────────────────────────────────────────────────────────
# Initialise before the app starts. No-op when SENTRY_DSN is blank.
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        traces_sample_rate=0.1,  # capture 10% of transactions for performance
        environment=settings.app_env,
        send_default_pii=False,  # GDPR-safe: no user IP / email in events
    )
    logger.info("[Sentry] Error tracking enabled (env=%s)", settings.app_env)

async def seed_initial_data() -> None:
    data_path = Path(__file__).parent / "data" / "chennai_metro.json"
    if not data_path.exists():
        logger.warning("[Seed] chennai_metro.json not found — skipping seed.")
        return

    payload = json.loads(data_path.read_text(encoding="utf-8"))
    stations_data = payload.get("stations", [])
    providers_data = payload.get("cab_providers", [])

    async with SessionLocal() as session:
        # Fetch all existing station names to avoid duplicates
        existing_result = await session.execute(select(Station.name))
        existing_names = {row for row in existing_result.scalars().all()}
        new_count = 0
        city = payload.get("city", "Chennai")
        for station_item in stations_data:
            if station_item["name"] in existing_names:
                continue  # already seeded
            station = Station(
                city=city,
                name=station_item["name"],
                line_code=station_item["line_code"],
                latitude=station_item["latitude"],
                longitude=station_item["longitude"],
                popularity_index=station_item["popularity_index"],
            )
            session.add(station)
            await session.flush()
            for exit_item in station_item.get("exits", []):
                session.add(
                    ExitGate(
                        station_id=station.id,
                        gate_code=exit_item["gate_code"],
                        gate_name=exit_item["gate_name"],
                        latitude=exit_item["latitude"],
                        longitude=exit_item["longitude"],
                        road_type=exit_item.get("road_type", "main_road"),
                        lighting_score=exit_item.get("lighting_score", 0.7),
                    )
                )
            new_count += 1
        if new_count:
            logger.info("[Seed] Inserted %d new stations …", new_count)
        else:
            logger.info("[Seed] All stations already present — skipped.")

        existing_providers = await session.execute(select(CabProvider.id))
        if not existing_providers.scalars().first():
            logger.info("[Seed] Inserting %d cab providers …", len(providers_data))
            for provider in providers_data:
                session.add(
                    CabProvider(
                        name=provider["name"],
                        base_fare=provider["base_fare"],
                        per_km_rate=provider["per_km_rate"],
                        demand_multiplier=provider.get("demand_multiplier", 1.0),
                        is_active=True,
                    )
                )
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    # ── Startup ──────────────────────────────────────────────────────────────
    db_url = settings.database_url
    db_mode = "SQLite (local fallback)" if db_url.startswith("sqlite") else "PostgreSQL"
    logger.info("[DB] Mode: %s", db_mode)

    # Hard fail if production config is unsafe.
    settings.validate_production_config()

    # Tables are managed by Alembic migrations (run in start.sh before uvicorn).
    # Do NOT call create_all here — it conflicts with Alembic-managed enum types on PostgreSQL.
    await seed_initial_data()
    logger.info("[Startup] EXIT RIGHT API ready  (env=%s)", settings.app_env)
    # ── App runs here ─────────────────────────────────────────────────────────
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    await engine.dispose()
    logger.info("[Shutdown] DB connections closed.")


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

# ── Rate limiter state (must be set before routes are attached) ───────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Primary origin from env; optional extra origins via CORS_ALLOW_ORIGINS
# (comma-separated). Never hardcode localhost here — set it in .env instead.
_cors_origins = [settings.frontend_base_url]
if settings.cors_allow_origins:
    _cors_origins += [o.strip() for o in settings.cors_allow_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(stations_router)
app.include_router(recommendation_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "exit-right-api", "env": settings.app_env}
