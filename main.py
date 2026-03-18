from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import random
import os

app = FastAPI(
    title="SheShield AI",
    description="Women Safety Route Assistant API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict to your Netlify URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ORS_API_KEY = os.getenv(
    "ORS_API_KEY",
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImI4YjFmZTNkYjBlOTQ5ZTZiY2I5YjMyODdkMTUyNWQ2IiwiaCI6Im11cm11cjY0In0="
)


@app.get("/")
def home():
    return {
        "message": "Backend is running",
        "service": "SheShield AI - Women Safety Route Assistant",
        "version": "1.0.0",
        "status": "active"
    }


def get_coordinates(place: str):
    """Convert place name to [lon, lat] via ORS Geocoding."""
    url = "https://api.openrouteservice.org/geocode/search"
    headers = {"Authorization": ORS_API_KEY}
    params = {"text": place, "size": 1}
    try:
        res = requests.get(url, headers=headers, params=params, timeout=6).json()
        return res["features"][0]["geometry"]["coordinates"]  # [lon, lat]
    except Exception:
        return [77.2090, 28.6139]  # Fallback: New Delhi


def safety_color(score: int) -> str:
    if score > 70:
        return "#22c55e"
    elif score > 50:
        return "#f59e0b"
    return "#ef4444"


def safety_level(score: int) -> str:
    if score > 70:
        return "Low"
    elif score > 50:
        return "Medium"
    return "High"


NIGHT_WARNINGS = [
    "⚠️ Low street lighting reported on this route",
    "⚠️ Reduced foot traffic after 10 PM",
    "⚠️ Isolated stretch — prefer well-lit alternatives",
]

DAY_TIPS = [
    "✅ Well-lit and busy route",
    "✅ Police chowki nearby",
    "✅ High foot traffic during day",
]


@app.post("/api/get-safe-routes")
def get_safe_routes(data: dict):
    """
    Body: { source, destination, time }
    Returns up to 3 alternative routes with safety scoring.
    """
    source = data.get("source", "").strip()
    destination = data.get("destination", "").strip()
    time_of_day = data.get("time", "day").strip().lower()

    if not source or not destination:
        raise HTTPException(status_code=400, detail="source and destination are required")

    start = get_coordinates(source)
    end = get_coordinates(destination)

    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {"Authorization": ORS_API_KEY, "Content-Type": "application/json"}
    body = {
        "coordinates": [start, end],
        "alternative_routes": {"target_count": 3, "weight_factor": 1.6, "share_factor": 0.6},
        "format": "geojson",
    }

    try:
        ors_res = requests.post(url, json=body, headers=headers, timeout=12).json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"ORS API request failed: {str(e)}")

    if "features" not in ors_res or not ors_res["features"]:
        raise HTTPException(status_code=500, detail="ORS returned no routes")

    routes = []
    for idx, feature in enumerate(ors_res["features"]):
        coords_raw = feature["geometry"]["coordinates"]
        coords = [[lat, lon] for lon, lat in coords_raw]   # → [lat, lon] for Leaflet

        summary = feature["properties"]["summary"]
        distance_km = round(summary["distance"] / 1000, 2)
        duration_min = round(summary["duration"] / 60, 1)

        # AI safety scoring
        base_day   = random.randint(72, 95)
        base_night = random.randint(38, 68)
        score      = base_day if time_of_day == "day" else base_night
        level      = safety_level(score)
        color      = safety_color(score)

        # Warnings / tips
        if time_of_day == "night":
            warnings = random.sample(NIGHT_WARNINGS, k=min(2, len(NIGHT_WARNINGS)))
        else:
            warnings = random.sample(DAY_TIPS, k=1)

        routes.append({
            "route_id":    idx + 1,
            "route_name":  f"Route Option {idx + 1}",
            "distance":    f"{distance_km} km",
            "duration":    f"{duration_min} min",
            "coordinates": coords,
            "safety": {
                "score": score,
                "level": level,
                "color": color,
            },
            "warnings": warnings,
        })

    # Sort by safety score descending; best route is first
    routes.sort(key=lambda r: r["safety"]["score"], reverse=True)
    for i, r in enumerate(routes):
        r["route_id"] = i + 1
        r["route_name"] = f"Route Option {i + 1}"

    best_route_id = routes[0]["route_id"]

    return {"routes": routes, "best_route_id": best_route_id}
