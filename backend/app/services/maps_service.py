"""
OpenRouteService (ORS) routing client.

Provides real travel-time durations for walking, driving-car modes.
Falls back to None on any failure (missing key, timeout, rate limit)
so the recommendation engine uses its built-in heuristic estimates.

Free tier: 2,000 requests/day, 40 requests/minute.
Sign up at: https://openrouteservice.org/dev/#/signup

ORS note on coordinates:
  - ORS uses GeoJSON order: [longitude, latitude] (NOT lat/lng).
  - All functions in this file accept (lat, lng) and convert internally.

ORS profiles used:
  mode         → ORS profile
  ──────────────────────────────
  walking      → foot-walking
  shared_auto  → driving-car
  cab          → driving-car
  bus          → None (heuristic; ORS free tier has no transit routing)
"""
import asyncio
import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger("exit_right.maps")

_ORS_BASE = "https://api.openrouteservice.org/v2/directions"

# Maps our transport modes to ORS profile names.
# bus is omitted intentionally — ORS free tier has no public-transit routing;
# the recommendation engine falls back to heuristics for that mode.
_MODE_TO_PROFILE: dict[str, str] = {
    "walking": "foot-walking",
    "shared_auto": "driving-car",
    "cab": "driving-car",
}


async def _get_ors_duration(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    profile: str,
    api_key: str,
) -> float | None:
    """
    Call ORS Directions API for one profile.
    Returns travel duration in minutes, or None on any failure.
    """
    # ORS expects [lng, lat] (GeoJSON order)
    url = f"{_ORS_BASE}/{profile}"
    params = {
        "start": f"{origin_lng},{origin_lat}",
        "end": f"{dest_lng},{dest_lat}",
        "api_key": api_key,
    }
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        # ORS GeoJSON response: features[0].properties.segments[0].duration (seconds)
        duration_seconds: float = (
            data["features"][0]["properties"]["segments"][0]["duration"]
        )
        return round(duration_seconds / 60, 1)

    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 429:
            logger.warning("[ORS] Rate limit hit (profile=%s) — using heuristic", profile)
        else:
            logger.warning("[ORS] HTTP %s for profile=%s", exc.response.status_code, profile)
        return None
    except Exception as exc:
        logger.warning("[ORS] Error (profile=%s): %s", profile, exc)
        return None


async def fetch_real_travel_times(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
) -> dict[str, float]:
    """
    Fetch real travel times for walking, shared_auto, and cab in parallel.

    Returns a dict of mode → minutes for modes where data was available.
    Modes with None results (or bus, which ORS free tier doesn't support)
    are omitted so the recommendation engine falls back to heuristics.
    """
    settings = get_settings()
    if not settings.openrouteservice_api_key:
        logger.info("[ORS] No API key set — using heuristic travel times for all modes.")
        return {}

    api_key = settings.openrouteservice_api_key

    # Fetch walking and driving in parallel (driving used for both cab + shared_auto)
    walking_t, driving_t = await asyncio.gather(
        _get_ors_duration(origin_lat, origin_lng, dest_lat, dest_lng, "foot-walking", api_key),
        _get_ors_duration(origin_lat, origin_lng, dest_lat, dest_lng, "driving-car", api_key),
    )

    result: dict[str, float] = {}
    for mode, value in [
        ("walking", walking_t),
        ("shared_auto", driving_t),
        ("cab", driving_t),
        # bus intentionally omitted — heuristic handles it
    ]:
        if value is not None:
            result[mode] = value

    if result:
        logger.info("[ORS] Real travel times: %s", result)
    else:
        logger.info("[ORS] All ORS requests failed — heuristics will be used.")

    return result
