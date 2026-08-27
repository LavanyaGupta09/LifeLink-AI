"""
LifeLink AI Backend — Configuration
Pydantic Settings for type-safe environment variables
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "LifeLink AI"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    USE_MOCK_APIS: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./lifelink.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "lifelink-ai-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # AI
    GEMINI_API_KEY: str = "your-gemini-api-key-here"
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"
    GROQ_API_KEY: str = ""

    # Twilio SMS
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    TWILIO_VERIFY_SERVICE_SID: str = ""

    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-credentials.json"

    # Maps & Telehealth
    OSM_NOMINATIM_BASE_URL: str = "https://nominatim.openstreetmap.org"
    OSRM_ROUTING_BASE_URL: str = "http://router.project-osrm.org"
    MAPBOX_ACCESS_TOKEN: str = ""
    STUN_SERVER_1: str = "stun:stun.l.google.com:19302"
    JITSI_DOMAIN: str = "meet.jit.si"

    # Supabase (Auth, Vault)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Notifications
    FCM_SERVER_KEY: str = ""
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""

    # Encryption
    ENCRYPTION_KEY: str = "lifelink-aes-key-32-bytes-padding!"

    # CORS
    CORS_ORIGINS: str = '*'

    @property
    def cors_origins_list(self) -> List[str]:
        val = self.CORS_ORIGINS.strip()
        if val == '*':
            return ["*"]
        try:
            parsed = json.loads(val)
            if isinstance(parsed, list):
                return parsed
            return [str(parsed)]
        except Exception:
            # Plain comma-separated or single URL
            return [o.strip() for o in val.split(',') if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
