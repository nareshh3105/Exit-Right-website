from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_SECRETS = {"change-this-in-production", "local-dev-secret-change-me", ""}


class Settings(BaseSettings):
    app_name: str = "EXIT RIGHT API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    database_url: str = "sqlite+aiosqlite:///./exit_right.db"
    jwt_secret: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 60 * 24

    # Routing — OpenRouteService (free, no credit card)
    # Get a key at: https://openrouteservice.org/dev/#/signup
    openrouteservice_api_key: str = ""
    # Google Places — frontend destination autocomplete only (optional)
    google_places_api_key: str = ""
    openweather_api_key: str = ""
    frontend_base_url: str = "http://localhost:3000"
    # Comma-separated additional CORS origins (e.g. staging URL).
    # In production, set this instead of hardcoding localhost.
    cors_allow_origins: str = ""
    # Sentry DSN — leave blank to disable error tracking (safe for local dev).
    sentry_dsn: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    def validate_production_config(self) -> None:
        """Raise RuntimeError for any insecure production config."""
        if not self.is_production():
            return
        if self.database_url.startswith("sqlite"):
            raise RuntimeError(
                "SQLite is not allowed in production. "
                "Set DATABASE_URL to a PostgreSQL connection string."
            )
        if self.jwt_secret in _INSECURE_SECRETS or len(self.jwt_secret) < 32:
            raise RuntimeError(
                "JWT_SECRET must be at least 32 characters and must not use "
                "the default development value in production."
            )


@lru_cache
def get_settings() -> Settings:
    return Settings()
