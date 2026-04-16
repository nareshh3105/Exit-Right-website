from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Uuid,
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    preferences: Mapped["UserPreference"] = relationship(back_populates="user", uselist=False)


class Station(Base):
    __tablename__ = "stations"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    city: Mapped[str] = mapped_column(String(80), default="Chennai")
    name: Mapped[str] = mapped_column(String(120), index=True)
    line_code: Mapped[str] = mapped_column(String(20), default="CMRL")
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    popularity_index: Mapped[float] = mapped_column(Float, default=0.5)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    exits: Mapped[list["ExitGate"]] = relationship(back_populates="station")


class ExitGate(Base):
    __tablename__ = "exit_gates"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    station_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("stations.id", ondelete="CASCADE"), index=True)
    gate_code: Mapped[str] = mapped_column(String(30))
    gate_name: Mapped[str] = mapped_column(String(100))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    road_type: Mapped[str] = mapped_column(String(60), default="main_road")
    lighting_score: Mapped[float] = mapped_column(Float, default=0.7)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    station: Mapped["Station"] = relationship(back_populates="exits")


class TransportMode(Base):
    __tablename__ = "transport_modes"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    mode_key: Mapped[str] = mapped_column(String(40), unique=True)
    display_name: Mapped[str] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class TravelPath(Base):
    __tablename__ = "travel_paths"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    station_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("stations.id", ondelete="CASCADE"))
    exit_gate_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("exit_gates.id", ondelete="CASCADE"))
    destination_label: Mapped[str] = mapped_column(String(180))
    distance_km: Mapped[float] = mapped_column(Float)
    baseline_time_min: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class SavedLocation(Base):
    __tablename__ = "saved_locations"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    label: Mapped[str] = mapped_column(String(80))
    place_name: Mapped[str] = mapped_column(String(180))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    station_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("stations.id", ondelete="SET NULL"), nullable=True)
    exit_gate_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("exit_gates.id", ondelete="SET NULL"), nullable=True)
    destination_name: Mapped[str] = mapped_column(String(180))
    destination_lat: Mapped[float] = mapped_column(Float)
    destination_lng: Mapped[float] = mapped_column(Float)
    recommended_mode: Mapped[str] = mapped_column(String(40))
    recommendation_payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    prioritize_time: Mapped[bool] = mapped_column(Boolean, default=True)
    prioritize_cost: Mapped[bool] = mapped_column(Boolean, default=False)
    prioritize_safety: Mapped[bool] = mapped_column(Boolean, default=True)
    notification_email: Mapped[bool] = mapped_column(Boolean, default=True)
    notification_push: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user: Mapped["User"] = relationship(back_populates="preferences")


class FeedbackLog(Base):
    __tablename__ = "feedback_logs"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    recommendation_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("recommendation_history.id", ondelete="SET NULL"), nullable=True)
    rating: Mapped[int] = mapped_column(Integer)
    comments: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class CabProvider(Base):
    __tablename__ = "cab_providers"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    base_fare: Mapped[float] = mapped_column(Numeric(10, 2))
    per_km_rate: Mapped[float] = mapped_column(Numeric(10, 2))
    demand_multiplier: Mapped[float] = mapped_column(Float, default=1.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class CabPriceCache(Base):
    __tablename__ = "cab_price_cache"
    __table_args__ = (UniqueConstraint("provider_id", "route_key", name="uq_cab_provider_route"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    provider_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("cab_providers.id", ondelete="CASCADE"))
    route_key: Mapped[str] = mapped_column(String(255))
    estimated_price: Mapped[float] = mapped_column(Numeric(10, 2))
    eta_minutes: Mapped[int] = mapped_column(Integer)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    ttl_until: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class WeatherCache(Base):
    __tablename__ = "weather_cache"
    __table_args__ = (UniqueConstraint("location_key", name="uq_weather_location_key"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    location_key: Mapped[str] = mapped_column(String(120))
    weather_main: Mapped[str] = mapped_column(String(50))
    rain_mm: Mapped[float] = mapped_column(Float, default=0.0)
    temp_c: Mapped[float] = mapped_column(Float, default=30.0)
    wind_speed: Mapped[float] = mapped_column(Float, default=0.0)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    ttl_until: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class CrowdPattern(Base):
    __tablename__ = "crowd_patterns"
    __table_args__ = (UniqueConstraint("station_id", "weekday", "hour", name="uq_crowd_station_hour"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    station_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("stations.id", ondelete="CASCADE"))
    weekday: Mapped[int] = mapped_column(Integer)
    hour: Mapped[int] = mapped_column(Integer)
    crowd_level: Mapped[str] = mapped_column(String(10))
    base_density: Mapped[float] = mapped_column(Float, default=0.5)
