from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


TransportModeKey = Literal["walking", "shared_auto", "bus", "cab"]


def _validate_lat(v: float) -> float:
    if not -90.0 <= v <= 90.0:
        raise ValueError("latitude must be between -90 and 90")
    return v


def _validate_lng(v: float) -> float:
    if not -180.0 <= v <= 180.0:
        raise ValueError("longitude must be between -180 and 180")
    return v


class RecommendExitRequest(BaseModel):
    station_id: str
    destination_name: str
    destination_lat: float
    destination_lng: float

    @field_validator("destination_lat")
    @classmethod
    def validate_destination_lat(cls, v: float) -> float:
        return _validate_lat(v)

    @field_validator("destination_lng")
    @classmethod
    def validate_destination_lng(cls, v: float) -> float:
        return _validate_lng(v)


class ExitDistanceItem(BaseModel):
    exit_gate_id: str
    gate_code: str
    gate_name: str
    distance_km: float


class RecommendExitResponse(BaseModel):
    station_id: str
    destination_name: str
    best_exit: ExitDistanceItem
    ranked_exits: list[ExitDistanceItem]


class RecommendRouteRequest(BaseModel):
    station_id: str
    destination_name: str
    destination_lat: float
    destination_lng: float
    trip_time: datetime | None = None

    @field_validator("destination_lat")
    @classmethod
    def validate_destination_lat(cls, v: float) -> float:
        return _validate_lat(v)

    @field_validator("destination_lng")
    @classmethod
    def validate_destination_lng(cls, v: float) -> float:
        return _validate_lng(v)


class TransportOption(BaseModel):
    mode: TransportModeKey
    estimated_travel_time_min: float
    estimated_cost_inr: float
    distance_km: float
    crowd_indicator: Literal["LOW", "MEDIUM", "HIGH"]
    weather_indicator: str
    safety_score: float
    confidence_score: float
    final_score: float


class RecommendRouteResponse(BaseModel):
    station_id: str
    station_name: str
    best_exit: ExitDistanceItem
    recommended_mode: TransportModeKey
    transport_ranking: list[TransportOption]
    adaptive_weights: dict[str, float]
    context: dict[str, str | float | int]


class CompareCabsRequest(BaseModel):
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    distance_km: float = Field(gt=0)
    trip_time: datetime | None = None
    weather_main: str | None = None

    @field_validator("pickup_lat", "drop_lat")
    @classmethod
    def validate_lats(cls, v: float) -> float:
        return _validate_lat(v)

    @field_validator("pickup_lng", "drop_lng")
    @classmethod
    def validate_lngs(cls, v: float) -> float:
        return _validate_lng(v)


class CabOption(BaseModel):
    provider: Literal["Uber", "Ola", "Rapido", "Namma Yatri"]
    estimated_price_inr: float
    eta_min: int
    deep_link: str
    fallback_link: str
    recommended: bool
    cheapest: bool


class CompareCabsResponse(BaseModel):
    cheapest_provider: str
    recommended_provider: str
    options: list[CabOption]


class CrowdScoreResponse(BaseModel):
    station_id: str
    crowd_level: Literal["LOW", "MEDIUM", "HIGH"]
    crowd_density: float
    hour: int
    weekday: int


class WeatherImpactResponse(BaseModel):
    weather_main: str
    rain_mm: float
    walking_penalty: float
    shared_auto_wait_penalty: float
    bus_delay_penalty: float


class PlaceSearchItem(BaseModel):
    name: str
    latitude: float
    longitude: float


class SaveLocationRequest(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    place_name: str = Field(min_length=1, max_length=180)
    latitude: float
    longitude: float

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        return _validate_lat(v)

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        return _validate_lng(v)


class FeedbackRequest(BaseModel):
    recommendation_id: str | None = None
    rating: int = Field(ge=1, le=5)
    comments: str | None = None
