import httpx
from typing import Dict, Any, Optional
from app.config import settings

async def upload_file(bucket_name: str, file_name: str, file_bytes: bytes, content_type: str) -> Dict[str, Any]:
    """
    Upload a file to Supabase Storage.
    """
    if settings.USE_MOCK_APIS or not settings.SUPABASE_URL:
        return {
            "status": "success",
            "url": f"https://mock-storage.local/{bucket_name}/{file_name}"
        }

    url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket_name}/{file_name}"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": content_type
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, content=file_bytes, headers=headers)
            resp.raise_for_status()
            
            # Construct public URL assuming public bucket
            public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_name}"
            return {"status": "success", "url": public_url}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
