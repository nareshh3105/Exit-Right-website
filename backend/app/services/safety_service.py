from typing import Literal

Mode = Literal["walking", "shared_auto", "bus", "cab"]


def safety_score(
    mode: Mode,
    hour: int,
    crowd_density: float,
    road_type: str = "main_road",
    lighting_score: float = 0.7,
) -> float:
    base_scores = {
        "walking": 0.66,
        "shared_auto": 0.73,
        "bus": 0.80,
        "cab": 0.90,
    }
    score = base_scores[mode]

    if hour >= 21 or hour <= 5:
        penalties = {
            "walking": 0.20,
            "shared_auto": 0.12,
            "bus": 0.08,
            "cab": 0.03,
        }
        score -= penalties[mode]

    if crowd_density < 0.35:
        score -= 0.12
    elif crowd_density < 0.7:
        score += 0.01
    else:
        score += 0.05

    if road_type == "main_road":
        score += 0.04
    else:
        score -= 0.06

    score += (lighting_score - 0.5) * 0.20
    return round(max(0.0, min(1.0, score)), 2)
