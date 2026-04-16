from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ExitGate, Station
from app.db.session import get_db
from app.schemas.station import ExitGateResponse, StationResponse

router = APIRouter(tags=["stations"])


@router.get("/stations", response_model=list[StationResponse])
async def list_stations(db: AsyncSession = Depends(get_db)) -> list[StationResponse]:
    result = await db.execute(select(Station).order_by(Station.name))
    rows = result.scalars().all()
    return [
        StationResponse(
            id=str(station.id),
            name=station.name,
            city=station.city,
            line_code=station.line_code,
            latitude=station.latitude,
            longitude=station.longitude,
            popularity_index=station.popularity_index,
        )
        for station in rows
    ]


@router.get("/stations/{station_id}/exits", response_model=list[ExitGateResponse])
async def list_station_exits(station_id: str, db: AsyncSession = Depends(get_db)) -> list[ExitGateResponse]:
    try:
        station_uuid = UUID(station_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid station_id format") from exc

    station_result = await db.execute(select(Station).where(Station.id == station_uuid))
    station = station_result.scalar_one_or_none()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    result = await db.execute(
        select(ExitGate).where(ExitGate.station_id == station.id).order_by(ExitGate.gate_code)
    )
    rows = result.scalars().all()
    return [
        ExitGateResponse(
            id=str(exit_gate.id),
            station_id=str(exit_gate.station_id),
            gate_code=exit_gate.gate_code,
            gate_name=exit_gate.gate_name,
            latitude=exit_gate.latitude,
            longitude=exit_gate.longitude,
            road_type=exit_gate.road_type,
            lighting_score=exit_gate.lighting_score,
        )
        for exit_gate in rows
    ]
