"""
Proxy router — forwards Overpass API requests server-side
to bypass browser CORS restrictions.
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import httpx

router = APIRouter(prefix="/api/proxy", tags=["Proxy"])


@router.post("/overpass")
async def proxy_overpass(request: Request):
    """Proxy Overpass QL queries server-side to bypass browser CORS with mirror fallback."""
    body = await request.body()
    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ]
    
    async with httpx.AsyncClient(timeout=10) as client:
        for url in endpoints:
            try:
                resp = await client.post(
                    url,
                    content=body,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
                if resp.status_code == 200:
                    try:
                        return JSONResponse(content=resp.json(), status_code=200)
                    except Exception:
                        continue
            except Exception as e:
                print(f"[OVERPASS PROXY] Error with {url}: {e}")
                continue

    # If all mirrors fail, return empty elements cleanly so frontend uses location fallback without 503 console errors
    return JSONResponse(content={"elements": []}, status_code=200)
