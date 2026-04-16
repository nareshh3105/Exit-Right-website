from datetime import datetime

from app.services.deep_link_service import provider_links

DEFAULT_PROVIDERS = [
    {"provider": "Uber", "base_fare": 70.0, "per_km_rate": 17.5, "speed_kmph": 25},
    {"provider": "Ola", "base_fare": 65.0, "per_km_rate": 16.5, "speed_kmph": 24},
    {"provider": "Rapido", "base_fare": 55.0, "per_km_rate": 15.0, "speed_kmph": 26},
    {"provider": "Namma Yatri", "base_fare": 60.0, "per_km_rate": 15.8, "speed_kmph": 24},
]


def _demand_factor(trip_time: datetime, weather_main: str) -> float:
    factor = 1.0
    if 7 <= trip_time.hour <= 10 or 17 <= trip_time.hour <= 21:
        factor += 0.22
    if weather_main.lower() in {"rain", "drizzle", "thunderstorm"}:
        factor += 0.18
    return factor


def compare_cabs(
    distance_km: float,
    pickup_lat: float,
    pickup_lng: float,
    drop_lat: float,
    drop_lng: float,
    trip_time: datetime,
    weather_main: str = "Clear",
) -> dict:
    demand = _demand_factor(trip_time, weather_main)
    options = []
    for provider in DEFAULT_PROVIDERS:
        raw_price = (
            provider["base_fare"]
            + provider["per_km_rate"] * distance_km * demand
        )
        eta = int(max(3, round((distance_km / provider["speed_kmph"]) * 60 + 4)))
        deep_link, fallback_link = provider_links(
            provider["provider"],
            pickup_lat,
            pickup_lng,
            drop_lat,
            drop_lng,
        )
        options.append(
            {
                "provider": provider["provider"],
                "estimated_price_inr": round(raw_price, 2),
                "eta_min": eta,
                "deep_link": deep_link,
                "fallback_link": fallback_link,
                "recommended": False,
                "cheapest": False,
            }
        )

    options.sort(key=lambda row: (row["estimated_price_inr"], row["eta_min"]))
    options[0]["cheapest"] = True

    ranked_for_recommendation = sorted(
        options,
        key=lambda row: (row["estimated_price_inr"] * 0.65) + (row["eta_min"] * 2.4),
    )
    recommended_provider = ranked_for_recommendation[0]["provider"]
    for option in options:
        if option["provider"] == recommended_provider:
            option["recommended"] = True

    return {
        "cheapest_provider": options[0]["provider"],
        "recommended_provider": recommended_provider,
        "options": options,
    }
