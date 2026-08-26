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
    """Proxy Overpass QL queries server-side to bypass browser CORS."""
    body = await request.body()
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://overpass-api.de/api/interpreter",
                content=body,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            return JSONResponse(content=resp.json(), status_code=resp.status_code)
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=503,
        )
