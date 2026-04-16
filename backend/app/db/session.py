from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

# Normalise DATABASE_URL — Railway/Supabase may supply plain postgresql:// or postgres://
_db_url = settings.database_url
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

_is_postgres = _db_url.startswith("postgresql")
_engine_kwargs: dict = {"echo": False, "future": True}
if _is_postgres:
    # Production PostgreSQL: explicit pool sizing and pre-ping for stale connections.
    _engine_kwargs.update({"pool_size": 5, "max_overflow": 10, "pool_pre_ping": True})
# SQLite needs no extra pool kwargs; aiosqlite handles concurrency via async I/O.

engine = create_async_engine(_db_url, **_engine_kwargs)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
