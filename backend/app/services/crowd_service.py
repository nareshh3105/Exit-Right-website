from datetime import datetime
from typing import Literal

CrowdLevel = Literal["LOW", "MEDIUM", "HIGH"]


def estimate_crowd_density(
    trip_time: datetime,
    popularity_index: float,
) -> tuple[CrowdLevel, float]:
    hour = trip_time.hour
    weekday = trip_time.weekday()

    density = max(0.0, min(1.0, popularity_index))
    if 7 <= hour <= 10 or 17 <= hour <= 20:
        density += 0.22
    if weekday >= 5:
        density -= 0.10
    if hour <= 5 or hour >= 22:
        density -= 0.08

    density = max(0.0, min(1.0, density))
    if density < 0.38:
        return "LOW", round(density, 2)
    if density < 0.72:
        return "MEDIUM", round(density, 2)
    return "HIGH", round(density, 2)
