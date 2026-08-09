"""
LifeLink AI — OTP Service
Handles OTP generation, Twilio integration, 5-min TTL, 
rate limiting (3 per 15 min), and account lockout (after 5 failed attempts).
"""
import time
import random
from typing import Dict, List
from fastapi import HTTPException, status
from app.config import settings
from app.services.notification_service import send_email_alert

class OTPStore:
    def __init__(self):
        # Maps email -> state dict
        self.store: Dict[str, dict] = {}

    def _clean_old_attempts(self, attempts: List[float]) -> List[float]:
        now = time.time()
        # Keep attempts from last 15 mins (900 seconds)
        return [t for t in attempts if now - t < 900]

    def _init_email_if_needed(self, email: str):
        if email not in self.store:
            self.store[email] = {
                "otp": None,
                "expires_at": 0,
                "generation_attempts": [],
                "failed_verifications": 0,
                "locked_until": 0
            }

    def is_locked(self, email: str) -> bool:
        if email not in self.store:
            return False
        return time.time() < self.store[email]["locked_until"]

    def get_lock_remaining_seconds(self, email: str) -> int:
        if email not in self.store:
            return 0
        return max(0, int(self.store[email]["locked_until"] - time.time()))

    async def generate_otp(self, email: str) -> str:
        self._init_email_if_needed(email)

        # 1. Check if account is locked
        if self.is_locked(email):
            remaining = self.get_lock_remaining_seconds(email)
            minutes = max(1, remaining // 60)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account locked due to too many failed attempts. Try again in {minutes} minutes."
            )

        now = time.time()
        
        # 2. Rate limiting check (max 3 generation requests per 15 mins)
        attempts = self._clean_old_attempts(self.store[email]["generation_attempts"])
        if len(attempts) >= 3:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many OTP requests. Please try again later."
            )

        attempts.append(now)
        self.store[email]["generation_attempts"] = attempts
        
        # 3. Generate a 6-digit OTP
        otp = f"{random.randint(0, 999999):06d}"
        self.store[email]["otp"] = otp
        self.store[email]["expires_at"] = now + 300  # 5 minutes TTL
        
        print(f"DEBUG: Generated OTP {otp} for {email}")
        
        # 4. Send the OTP via Resend Email
        subject = "Your LifeLink AI Verification Code"
        html_body = f"<h2>Welcome to LifeLink AI</h2><p>Your secure verification code is: <strong>{otp}</strong></p><p>This code will expire in 5 minutes.</p>"
        await send_email_alert(email, subject, html_body)
        
        return otp

    async def verify_otp(self, email: str, otp: str) -> bool:
        self._init_email_if_needed(email)

        if self.is_locked(email):
            remaining = self.get_lock_remaining_seconds(email)
            minutes = max(1, remaining // 60)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account locked. Try again in {minutes} minutes."
            )

        now = time.time()
        is_valid = False
        stored_otp = self.store[email]["otp"]
        expires_at = self.store[email]["expires_at"]
        
        if stored_otp and stored_otp == otp and now <= expires_at:
            is_valid = True

        if is_valid:
            # Reset failures and OTP on success
            self.store[email]["failed_verifications"] = 0
            self.store[email]["otp"] = None
            return True
        else:
            # Increment failed attempts
            self.store[email]["failed_verifications"] += 1
            if self.store[email]["failed_verifications"] >= 5:
                # Lock for 30 minutes
                self.store[email]["locked_until"] = now + 1800
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Account locked for 30 minutes after 5 failed verification attempts."
                )
            # Throw standard 400 for generic invalid
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

# Singleton instance
otp_service = OTPStore()
