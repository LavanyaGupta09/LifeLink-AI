from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ai_service import analyze_medical_report
from app.schemas.vault import ReportAnalysisResponse

router = APIRouter(prefix="/api/v1/vault", tags=["Medical Vault"])

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB


@router.post("/analyze-report", response_model=ReportAnalysisResponse)
async def analyze_report(file: UploadFile = File(...)) -> ReportAnalysisResponse:
    """
    Upload a medical report (PDF/Image) to extract text via OCR
    and identify critical red-flags using AI analysis.

    Accepts: PDF, JPG, JPEG, PNG (max 25 MB)
    Returns: Structured analysis with general summary and critical findings.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing.")

    # Validate file extension
    import os
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Validate content type
    allowed_mimes = {
        "application/pdf", "image/jpeg", "image/jpg", "image/png",
        "application/octet-stream", "text/plain"  # fallback for demo blobs
    }
    if file.content_type and file.content_type not in allowed_mimes:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type '{file.content_type}'."
        )

    try:
        file_bytes = await file.read()

        # Validate file size
        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is 25 MB."
            )

        result = await analyze_medical_report(file_bytes, file.filename)
        return ReportAnalysisResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
