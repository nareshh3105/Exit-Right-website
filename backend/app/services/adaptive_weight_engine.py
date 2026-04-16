from datetime import datetime


def get_adaptive_weights(trip_time: datetime, weather_main: str) -> dict[str, float]:
    hour = trip_time.hour

    weights = {
        "travel_time": 0.30,
        "travel_cost": 0.20,
        "distance": 0.15,
        "crowd_density": 0.10,
        "weather_penalty": 0.10,
        "safety_score": 0.15,
    }

    if 7 <= hour <= 10 or 17 <= hour <= 20:
        weights["travel_time"] += 0.12
        weights["travel_cost"] -= 0.04
        weights["distance"] -= 0.02
        weights["safety_score"] -= 0.03

    if hour >= 21 or hour <= 5:
        weights["safety_score"] += 0.14
        weights["travel_time"] -= 0.05
        weights["travel_cost"] -= 0.02

    if weather_main.lower() in {"rain", "drizzle", "thunderstorm"}:
        weights["weather_penalty"] += 0.12
        weights["distance"] += 0.03
        weights["travel_time"] += 0.02

    total = sum(weights.values())
    return {key: round(value / total, 4) for key, value in weights.items()}
