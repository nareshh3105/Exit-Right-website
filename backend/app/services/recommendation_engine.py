from datetime import datetime
from typing import Literal

from app.services.adaptive_weight_engine import get_adaptive_weights
from app.services.crowd_service import estimate_crowd_density
from app.services.safety_service import safety_score
from app.services.weather_service import derive_weather_impact

Mode = Literal["walking", "shared_auto", "bus", "cab"]


def _estimate_mode_metrics(
    mode: Mode,
    distance_km: float,
    rain_boost: float,
    real_travel_times: dict[str, float] | None = None,
) -> dict[str, float]:
    if mode == "walking":
        speed_kmph = 4.5
        base_wait = 0
        cost = 0.0
    elif mode == "shared_auto":
        speed_kmph = 18
        base_wait = 6 + (3 * rain_boost)
        cost = 20 + (distance_km * 8.5)
    elif mode == "bus":
        speed_kmph = 22
        base_wait = 8 + (4 * rain_boost)
        cost = 10 + (distance_km * 4.2)
    else:
        speed_kmph = 26
        base_wait = 4 + (2 * rain_boost)
        cost = 80 + (distance_km * 18)

    # Use real travel time from Maps API when available; otherwise use heuristic.
    if real_travel_times and mode in real_travel_times:
        travel_time = real_travel_times[mode] + base_wait
    else:
        travel_time = (distance_km / speed_kmph) * 60 + base_wait

    return {
        "estimated_travel_time_min": round(travel_time, 1),
        "estimated_cost_inr": round(cost, 1),
        "distance_km": round(distance_km, 2),
    }


def _mode_weather_penalty(mode: Mode, weather_penalty: dict[str, float]) -> float:
    if mode == "walking":
        return weather_penalty["walking_penalty"]
    if mode == "shared_auto":
        return weather_penalty["shared_auto_wait_penalty"]
    if mode == "bus":
        return weather_penalty["bus_delay_penalty"]
    return weather_penalty["bus_delay_penalty"] * 0.45


def rank_transport_modes(
    distance_km: float,
    trip_time: datetime,
    weather_main: str,
    crowd_popularity_index: float,
    road_type: str = "main_road",
    lighting_score: float = 0.7,
    real_travel_times: dict[str, float] | None = None,
) -> dict:
    crowd_level, crowd_density = estimate_crowd_density(trip_time, crowd_popularity_index)
    weather = derive_weather_impact(weather_main, 0.0)

    weights = get_adaptive_weights(trip_time, weather.weather_main)

    rain_boost = 1.0 if weather.weather_main.lower() in {"rain", "drizzle", "thunderstorm"} else 0.0
    weather_penalty = {
        "walking_penalty": weather.walking_penalty,
        "shared_auto_wait_penalty": weather.shared_auto_wait_penalty,
        "bus_delay_penalty": weather.bus_delay_penalty,
    }

    modes: list[Mode] = ["walking", "shared_auto", "bus", "cab"]
    options = []
    for mode in modes:
        metrics = _estimate_mode_metrics(mode, distance_km, rain_boost, real_travel_times)
        safety = safety_score(mode, trip_time.hour, crowd_density, road_type, lighting_score)
        weather_factor = _mode_weather_penalty(mode, weather_penalty)
        safety_component = 1 - safety

        score = (
            weights["travel_time"] * (metrics["estimated_travel_time_min"] / 60)
            + weights["travel_cost"] * (metrics["estimated_cost_inr"] / 300)
            + weights["distance"] * (metrics["distance_km"] / 15)
            + weights["crowd_density"] * crowd_density
            + weights["weather_penalty"] * weather_factor
            + weights["safety_score"] * safety_component
        )
        confidence = round(max(0.35, min(0.98, 1 - (score / 2))), 2)
        weather_tag = "RAIN" if rain_boost else "CLEAR"
        options.append(
            {
                "mode": mode,
                **metrics,
                "crowd_indicator": crowd_level,
                "weather_indicator": weather_tag,
                "safety_score": safety,
                "confidence_score": confidence,
                "final_score": round(score, 4),
            }
        )

    options.sort(key=lambda row: row["final_score"])
    return {
        "recommended_mode": options[0]["mode"],
        "transport_ranking": options,
        "adaptive_weights": weights,
        "crowd_level": crowd_level,
        "crowd_density": crowd_density,
        "weather_main": weather.weather_main,
    }
