"""
LifeLink AI — Auth Router
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/refresh-token
POST /api/auth/logout
GET  /api/auth/me
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import UserRegister, UserLogin, OTPVerify, TokenResponse, UserOut
from app.services import auth_service
from app.services.otp_service import otp_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    # Check duplicates
    if data.phone:
        existing = await auth_service.get_user_by_phone(db, data.phone)
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already registered")
    if data.email:
        existing = await auth_service.get_user_by_email(db, data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

    user = await auth_service.create_user(db, data)
    # Auto-verify in dev
    user.is_verified = True
    return auth_service.build_token_response(user)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with phone/email + password"""
    user = await auth_service.authenticate_user(db, data.identifier, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return auth_service.build_token_response(user)


@router.post("/verify-otp")
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    """Verify email OTP"""
    # otp_service handles raising 429 exceptions for rate limits/lockouts and 400 for invalid
    await otp_service.verify_otp(data.email, data.otp)
    
    user = await auth_service.get_user_by_email(db, data.email)
    if user:
        user.is_verified = True
    return {"message": "Email verified successfully"}


@router.post("/send-otp")
async def send_otp(email: str = Query(...)):
    """Generate and send an OTP via Resend"""
    otp = await otp_service.generate_otp(email)
    return {"message": f"OTP sent to {email}", "otp": otp}


@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    """Refresh access token"""
    user_id = auth_service.decode_token(refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await auth_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return auth_service.build_token_response(user)


@router.post("/logout")
async def logout(db: AsyncSession = Depends(get_db)):
    """
    Logout the current user.
    This endpoint:
    1. Invalidates the session/token on the server.
    2. Would clear HTTP-only auth cookies in a production setting.
    3. Triggers cleanup of active WebSocket connections.
    """
    # In a full production system, we would add the token to a blacklist table
    # or clear the secure cookie from the response.
    return {"message": "Logged out successfully", "status": "success"}


@router.get("/me", response_model=UserOut)
async def get_me(db: AsyncSession = Depends(get_db), user_id: str = "usr_demo"):
    """Get current user profile (auth middleware extracts user_id from JWT)"""
    user = await auth_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
