import httpx


async def search_places(query: str, limit: int = 5) -> list[dict[str, str | float]]:
    cleaned_query = query.strip()
    if len(cleaned_query) < 3:
        return []

    params = {
        "q": cleaned_query,
        "format": "jsonv2",
        "limit": max(1, min(limit, 8)),
        "countrycodes": "in",
        "addressdetails": 0,
    }
    headers = {
        "User-Agent": "EXIT-RIGHT/1.0 (destination-search)",
        "Accept-Language": "en",
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params=params,
                headers=headers,
            )
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError):
        return []

    results: list[dict[str, str | float]] = []
    for item in payload:
        display_name = item.get("display_name")
        lat = item.get("lat")
        lon = item.get("lon")
        if not display_name or lat is None or lon is None:
            continue
        try:
            results.append(
                {
                    "name": str(display_name),
                    "latitude": float(lat),
                    "longitude": float(lon),
                }
            )
        except (TypeError, ValueError):
            continue

    return results
