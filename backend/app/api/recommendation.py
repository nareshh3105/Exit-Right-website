from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.models import ExitGate, FeedbackLog, RecommendationHistory, SavedLocation, Station, User
from app.db.session import get_db
from app.schemas.recommendation import (
    CompareCabsRequest,
    CompareCabsResponse,
    CrowdScoreResponse,
    FeedbackRequest,
    PlaceSearchItem,
    RecommendExitRequest,
    RecommendExitResponse,
    RecommendRouteRequest,
    RecommendRouteResponse,
    SaveLocationRequest,
    WeatherImpactResponse,
)
from app.services.cab_comparison_service import compare_cabs
from app.services.crowd_service import estimate_crowd_density
from app.services.exit_direction_service import pick_best_exit
from app.services.geocoding_service import search_places as geocode_places
from app.services.maps_service import fetch_real_travel_times
from app.services.recommendation_engine import rank_transport_modes
from app.services.weather_service import derive_weather_impact, fetch_weather

router = APIRouter(tags=["recommendation"])


async def _get_station_and_exits(station_id: str, db: AsyncSession) -> tuple[Station, list[ExitGate]]:
    try:
        station_uuid = UUID(station_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid station_id format") from exc

    station_result = await db.execute(select(Station).where(Station.id == station_uuid))
    station = station_result.scalar_one_or_none()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    exits_result = await db.execute(select(ExitGate).where(ExitGate.station_id == station.id))
    exits = exits_result.scalars().all()
    if not exits:
        raise HTTPException(status_code=404, detail="No exits configured for this station")

    return station, exits


@router.post("/recommend-exit", response_model=RecommendExitResponse)
async def recommend_exit(payload: RecommendExitRequest, db: AsyncSession = Depends(get_db)) -> RecommendExitResponse:
    station, exits = await _get_station_and_exits(payload.station_id, db)
    exits_data = [
        {
            "id": exit_gate.id,
            "gate_code": exit_gate.gate_code,
            "gate_name": exit_gate.gate_name,
            "latitude": exit_gate.latitude,
            "longitude": exit_gate.longitude,
        }
        for exit_gate in exits
    ]
    ranked = pick_best_exit(exits_data, payload.destination_lat, payload.destination_lng)
    return RecommendExitResponse(
        station_id=str(station.id),
        destination_name=payload.destination_name,
        best_exit=ranked[0],
        ranked_exits=ranked,
    )


@router.post("/recommend-route", response_model=RecommendRouteResponse)
async def recommend_route(
    payload: RecommendRouteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecommendRouteResponse:
    station, exits = await _get_station_and_exits(payload.station_id, db)
    exits_data = [
        {
            "id": exit_gate.id,
            "gate_code": exit_gate.gate_code,
            "gate_name": exit_gate.gate_name,
            "latitude": exit_gate.latitude,
            "longitude": exit_gate.longitude,
        }
        for exit_gate in exits
    ]
    ranked_exits = pick_best_exit(exits_data, payload.destination_lat, payload.destination_lng)
    best_exit_item = ranked_exits[0]
    chosen_exit = next(exit_gate for exit_gate in exits if str(exit_gate.id) == best_exit_item["exit_gate_id"])

    weather_main, rain_mm = await fetch_weather(payload.destination_lat, payload.destination_lng)
    route_trip_time = payload.trip_time or datetime.now()

    # Fetch real travel times from Google Maps (no-op if API key absent).
    real_travel_times = await fetch_real_travel_times(
        origin_lat=chosen_exit.latitude,
        origin_lng=chosen_exit.longitude,
        dest_lat=payload.destination_lat,
        dest_lng=payload.destination_lng,
    )

    ranking_result = rank_transport_modes(
        distance_km=best_exit_item["distance_km"],
        trip_time=route_trip_time,
        weather_main=weather_main,
        crowd_popularity_index=station.popularity_index,
        road_type=chosen_exit.road_type,
        lighting_score=chosen_exit.lighting_score,
        real_travel_times=real_travel_times or None,
    )

    history = RecommendationHistory(
        user_id=current_user.id,
        station_id=station.id,
        exit_gate_id=chosen_exit.id,
        destination_name=payload.destination_name,
        destination_lat=payload.destination_lat,
        destination_lng=payload.destination_lng,
        recommended_mode=ranking_result["recommended_mode"],
        recommendation_payload=ranking_result,
    )
    db.add(history)
    await db.commit()

    return RecommendRouteResponse(
        station_id=str(station.id),
        station_name=station.name,
        best_exit=best_exit_item,
        recommended_mode=ranking_result["recommended_mode"],
        transport_ranking=ranking_result["transport_ranking"],
        adaptive_weights=ranking_result["adaptive_weights"],
        context={
            "weather_main": weather_main,
            "rain_mm": round(rain_mm, 2),
            "crowd_level": ranking_result["crowd_level"],
            "crowd_density": ranking_result["crowd_density"],
        },
    )


@router.post("/compare-cabs", response_model=CompareCabsResponse)
async def compare_cab_options(payload: CompareCabsRequest) -> CompareCabsResponse:
    trip_time = payload.trip_time or datetime.now()
    weather_main = payload.weather_main or "Clear"
    result = compare_cabs(
        distance_km=payload.distance_km,
        pickup_lat=payload.pickup_lat,
        pickup_lng=payload.pickup_lng,
        drop_lat=payload.drop_lat,
        drop_lng=payload.drop_lng,
        trip_time=trip_time,
        weather_main=weather_main,
    )
    return CompareCabsResponse(**result)


@router.get("/crowd-score", response_model=CrowdScoreResponse)
async def crowd_score(
    station_id: str = Query(...),
    hour: int | None = Query(default=None, ge=0, le=23),
    db: AsyncSession = Depends(get_db),
) -> CrowdScoreResponse:
    station, _ = await _get_station_and_exits(station_id, db)
    base_time = datetime.now()
    trip_time = base_time.replace(hour=hour) if hour is not None else base_time
    level, density = estimate_crowd_density(trip_time, station.popularity_index)
    return CrowdScoreResponse(
        station_id=str(station.id),
        crowd_level=level,
        crowd_density=density,
        hour=trip_time.hour,
        weekday=trip_time.weekday(),
    )


@router.get("/weather-impact", response_model=WeatherImpactResponse)
async def weather_impact(lat: float = Query(...), lng: float = Query(...)) -> WeatherImpactResponse:
    weather_main, rain_mm = await fetch_weather(lat, lng)
    impact = derive_weather_impact(weather_main, rain_mm)
    return WeatherImpactResponse(
        weather_main=impact.weather_main,
        rain_mm=impact.rain_mm,
        walking_penalty=impact.walking_penalty,
        shared_auto_wait_penalty=impact.shared_auto_wait_penalty,
        bus_delay_penalty=impact.bus_delay_penalty,
    )


@router.get("/places/search", response_model=list[PlaceSearchItem])
async def place_search(
    q: str = Query(..., min_length=3, max_length=120),
    limit: int = Query(default=5, ge=1, le=8),
) -> list[PlaceSearchItem]:
    results = await geocode_places(q, limit)
    return [PlaceSearchItem(**item) for item in results]


@router.post("/save-location")
async def save_location(
    payload: SaveLocationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    location = SavedLocation(
        user_id=current_user.id,
        label=payload.label,
        place_name=payload.place_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(location)
    await db.commit()
    return {"status": "saved", "location_id": str(location.id)}


@router.get("/recommendation-history")
async def recommendation_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    result = await db.execute(
        select(RecommendationHistory)
        .where(RecommendationHistory.user_id == current_user.id)
        .order_by(RecommendationHistory.created_at.desc())
        .limit(50)
    )
    rows = result.scalars().all()
    return [
        {
            "id": str(item.id),
            "station_id": str(item.station_id) if item.station_id else None,
            "exit_gate_id": str(item.exit_gate_id) if item.exit_gate_id else None,
            "destination_name": item.destination_name,
            "recommended_mode": item.recommended_mode,
            "created_at": item.created_at.isoformat(),
            "recommendation_payload": item.recommendation_payload,
        }
        for item in rows
    ]


@router.post("/feedback")
async def submit_feedback(
    payload: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    recommendation_id = None
    if payload.recommendation_id:
        try:
            recommendation_id = UUID(payload.recommendation_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid recommendation_id format") from exc

    feedback = FeedbackLog(
        user_id=current_user.id,
        recommendation_id=recommendation_id,
        rating=payload.rating,
        comments=payload.comments or "",
    )
    db.add(feedback)
    await db.commit()
    return {"status": "recorded", "feedback_id": str(feedback.id)}
