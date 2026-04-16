from pydantic import BaseModel


class StationResponse(BaseModel):
    id: str
    name: str
    city: str
    line_code: str
    latitude: float
    longitude: float
    popularity_index: float


class ExitGateResponse(BaseModel):
    id: str
    station_id: str
    gate_code: str
    gate_name: str
    latitude: float
    longitude: float
    road_type: str
    lighting_score: float
