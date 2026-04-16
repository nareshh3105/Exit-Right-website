from math import asin, cos, radians, sin, sqrt


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius_km = 6371.0
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
    )
    c = 2 * asin(sqrt(a))
    return earth_radius_km * c


def pick_best_exit(
    exits: list[dict],
    destination_lat: float,
    destination_lng: float,
) -> list[dict]:
    ranked = []
    for item in exits:
        distance = haversine_km(
            item["latitude"],
            item["longitude"],
            destination_lat,
            destination_lng,
        )
        ranked.append(
            {
                "exit_gate_id": str(item["id"]),
                "gate_code": item["gate_code"],
                "gate_name": item["gate_name"],
                "distance_km": round(distance, 2),
            }
        )
    return sorted(ranked, key=lambda row: row["distance_km"])
