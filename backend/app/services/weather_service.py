from dataclasses import dataclass

import httpx

from app.core.config import get_settings


@dataclass
class WeatherImpact:
    weather_main: str
    rain_mm: float
    walking_penalty: float
    shared_auto_wait_penalty: float
    bus_delay_penalty: float


async def fetch_weather(lat: float, lng: float) -> tuple[str, float]:
    settings = get_settings()
    if not settings.openweather_api_key:
        return "Clear", 0.0

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lng,
        "appid": settings.openweather_api_key,
        "units": "metric",
    }

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError):
        return "Clear", 0.0

    weather_main = (
        payload.get("weather", [{}])[0].get("main", "Clear") if isinstance(payload.get("weather"), list) else "Clear"
    )
    rain_mm = float(payload.get("rain", {}).get("1h", 0.0))
    return weather_main, rain_mm


def derive_weather_impact(weather_main: str, rain_mm: float) -> WeatherImpact:
    wet = weather_main.lower() in {"rain", "drizzle", "thunderstorm"} or rain_mm > 0
    if wet:
        return WeatherImpact(
            weather_main=weather_main,
            rain_mm=rain_mm,
            walking_penalty=0.38,
            shared_auto_wait_penalty=0.24,
            bus_delay_penalty=0.20,
        )
    return WeatherImpact(
        weather_main=weather_main,
        rain_mm=rain_mm,
        walking_penalty=0.04,
        shared_auto_wait_penalty=0.03,
        bus_delay_penalty=0.02,
    )
