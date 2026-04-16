from urllib.parse import quote_plus


def provider_links(
    provider: str,
    pickup_lat: float,
    pickup_lng: float,
    drop_lat: float,
    drop_lng: float,
) -> tuple[str, str]:
    if provider == "Uber":
        deep_link = (
            f"uber://?action=setPickup&pickup[latitude]={pickup_lat}&pickup[longitude]={pickup_lng}"
            f"&dropoff[latitude]={drop_lat}&dropoff[longitude]={drop_lng}"
        )
        fallback = (
            f"https://m.uber.com/ul/?action=setPickup&pickup[latitude]={pickup_lat}&pickup[longitude]={pickup_lng}"
            f"&dropoff[latitude]={drop_lat}&dropoff[longitude]={drop_lng}"
        )
        return deep_link, fallback

    if provider == "Ola":
        deep_link = f"olacabs://app/launch?lat={pickup_lat}&lng={pickup_lng}"
        fallback = (
            f"https://book.olacabs.com/?pickup_lat={pickup_lat}&pickup_lng={pickup_lng}"
            f"&drop_lat={drop_lat}&drop_lng={drop_lng}"
        )
        return deep_link, fallback

    if provider == "Rapido":
        deep_link = f"rapido://book?pickup={pickup_lat},{pickup_lng}&drop={drop_lat},{drop_lng}"
        fallback = "https://www.rapido.bike/"
        return deep_link, fallback

    encoded_drop = quote_plus(f"{drop_lat},{drop_lng}")
    deep_link = f"nammayatri://book?pickup={pickup_lat},{pickup_lng}&drop={encoded_drop}"
    fallback = "https://www.nammayatri.in/"
    return deep_link, fallback
