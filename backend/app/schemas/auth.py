"""Auth Pydantic schemas"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=50, pattern=r"^[A-Za-z\s\-]+$")
    phone: Optional[str] = Field(None, pattern=r"^[6-9]\d{9}$")
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=8)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)


class UserLogin(BaseModel):
    identifier: str   # phone or email
    password: str


class OTPVerify(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str


class UserOut(BaseModel):
    id: str
    full_name: str
    phone: Optional[str]
    email: Optional[str]
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
