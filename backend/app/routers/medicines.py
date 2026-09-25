from fastapi import APIRouter, Query, HTTPException, Header
import httpx
from pydantic import BaseModel
from typing import List, Optional, Any
import os
import asyncio

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])

DRUGSETU_API_KEY = os.getenv("DRUGSETU_API_KEY")

@router.get("/search")
async def search_medicines(q: str = Query(..., min_length=2)):
    if not DRUGSETU_API_KEY:
        raise HTTPException(status_code=500, detail="Medicine service is temporarily unavailable. Please try again. (Missing API Key)")
    
    url = f"https://api.drugsetu.in/v1/medicines/search"
    headers = {"X-API-Key": DRUGSETU_API_KEY}
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, params={"q": q}, headers=headers)
            if response.status_code == 401:
                raise HTTPException(status_code=500, detail="Medicine service is temporarily unavailable. Please try again. (Invalid API Key)")
            response.raise_for_status()
            data = response.json()
            
            # Extract results
            results = data.get("data", data.get("results", []))
            if not results and isinstance(data, list):
                results = data
                
            return {"status": "success", "data": results}
            
        except httpx.ReadTimeout:
            raise HTTPException(status_code=504, detail="Medicine service is temporarily unavailable. Please try again.")
        except httpx.HTTPError as e:
            # For robustness, we catch HTTP errors and bubble a generic message 
            # to not expose stack traces. 
            print(f"DrugSetu API Error: {e}")
            raise HTTPException(status_code=500, detail="Medicine service is temporarily unavailable. Please try again.")
        except Exception as e:
            print(f"Internal Error in search_medicines: {e}")
            raise HTTPException(status_code=500, detail="Medicine service is temporarily unavailable. Please try again.")
