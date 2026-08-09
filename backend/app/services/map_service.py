import httpx
from typing import Optional, Tuple, Dict, Any
from app.config import settings

async def reverse_geocode(lat: float, lng: float) -> str:
    """
    Convert coordinates to address using OpenStreetMap Nominatim.
    Free, open-source geocoding (no API key required).
    """
    if settings.USE_MOCK_APIS:
        return "123 Mock Street, Springfield"

    url = f"{settings.OSM_NOMINATIM_BASE_URL}/reverse"
    params = {
        "format": "json",
        "lat": lat,
        "lon": lng,
        "zoom": 18,
        "addressdetails": 1
    }
    headers = {
        "User-Agent": "LifeLinkAI/1.0"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("display_name", "Unknown Location")
    except Exception:
        pass
    
    return "Location unavailable (Offline)"

async def get_route_osrm(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> Dict[str, Any]:
    """
    Get route geometry and ETA using OSRM (Open Source Routing Machine).
    Free routing.
    """
    if settings.USE_MOCK_APIS:
        return {
            "distance_km": 4.2,
            "eta_mins": 12,
            "geometry": "mock_encoded_polyline"
        }

    # OSRM expects coordinates in {longitude},{latitude} format
    url = f"{settings.OSRM_ROUTING_BASE_URL}/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}"
    params = {
        "overview": "full",
        "geometries": "polyline"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                    route = data["routes"][0]
                    return {
                        "distance_km": round(route.get("distance", 0) / 1000, 2),
                        "eta_mins": round(route.get("duration", 0) / 60),
                        "geometry": route.get("geometry", "")
                    }
    except Exception:
        pass
        
    return {
        "distance_km": 0.0,
        "eta_mins": 0,
        "geometry": ""
    }
