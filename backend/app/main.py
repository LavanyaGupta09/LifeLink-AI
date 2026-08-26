"""
LifeLink AI — FastAPI Application
Main entry point with all routers, CORS, startup/shutdown hooks,
and interactive API documentation.
"""
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from app.services.websocket_manager import manager

from app.config import settings
from app.database import init_db
from app.routers import auth, ai, sos, health, hospital, ambulance, vault, blood
from app.routers.ecosystem import (
    doctor_router, pharmacy_router, lab_router, family_router
)
from app.routers.b2b import router as b2b_router
from app.routers.reminders import router as reminders_router
from app.routers.admin import router as admin_router
from app.routers.verification import router as verification_router
from app.routers.voice import router as voice_router


# ─────────────────────────────────────────────
# Lifespan — startup / shutdown
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB tables on startup"""
    print("LifeLink AI Backend starting up...")
    await init_db()
    print("Database initialized")
    yield
    print("LifeLink AI Backend shutting down...")


# ─────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────
app = FastAPI(
    title="LifeLink AI API",
    description="""
## 🏥 LifeLink AI — Emergency Healthcare Platform

A unified, AI-powered emergency healthcare API connecting patients to:
- 🚑 Ambulances & Hospitals
- 🤖 AI Symptom Triage (Gemini-powered)
- 👨‍⚕️ On-call Doctors (WebRTC)
- 👨‍👩‍👧 Family Dashboard
- 🔬 Pharmacies & Diagnostic Labs
- 🩸 Blood Donor Network
- 🔒 Encrypted Health Passport (QR)

**HIPAA/DPDP Compliant · End-to-End Encrypted · Real-time WebSockets**
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ─────────────────────────────────────────────
# CORS Middleware
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials="*" not in settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Request timing middleware
# ─────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{(time.time() - start) * 1000:.2f}ms"
    response.headers["X-LifeLink-Version"] = settings.APP_VERSION
    return response


# ─────────────────────────────────────────────
# Global exception handler
# ─────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


# ─────────────────────────────────────────────
# Include all routers
# ─────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(sos.router)
app.include_router(health.router)
app.include_router(hospital.router)
app.include_router(ambulance.router)
app.include_router(doctor_router)
app.include_router(blood.router)
app.include_router(pharmacy_router)
app.include_router(lab_router)
app.include_router(family_router)
app.include_router(b2b_router)
app.include_router(reminders_router)
app.include_router(vault.router)
app.include_router(admin_router)
app.include_router(verification_router)
app.include_router(voice_router, prefix="/api/v1/voice", tags=["Voice AI"])

# Mount static files (React Frontend Build)
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "web", "dist")
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path, html=True), name="static")

# ─────────────────────────────────────────────
# WebSocket endpoint
# ─────────────────────────────────────────────
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ─────────────────────────────────────────────
# Root endpoints
# ─────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "environment": settings.APP_ENV,
        "features": [
            "AI Symptom Triage (Gemini)",
            "SOS + WebSocket Real-time",
            "Ambulance Dispatch",
            "Doctor On-Call (WebRTC)",
            "Health Passport QR",
            "Medical Vault (E2EE)",
            "Blood Donor Network",
            "Family Dashboard",
            "Pharmacy & Lab Booking",
        ],
    }


@app.get("/health", tags=["Root"])
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}
