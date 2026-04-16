from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

_is_postgres = settings.database_url.startswith("postgresql")
_engine_kwargs: dict = {"echo": False, "future": True}
if _is_postgres:
    # Production PostgreSQL: explicit pool sizing and pre-ping for stale connections.
    _engine_kwargs.update({"pool_size": 5, "max_overflow": 10, "pool_pre_ping": True})
# SQLite needs no extra pool kwargs; aiosqlite handles concurrency via async I/O.

engine = create_async_engine(settings.database_url, **_engine_kwargs)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
