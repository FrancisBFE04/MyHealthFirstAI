"""
Application Configuration
Environment variables and settings management
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "MyHealthFirstAI"
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./myhealthfirstai.db"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
        "http://127.0.0.1:8081",
        "exp://localhost:19000",
        "exp://127.0.0.1:19000",
        "https://myhealthfirstai.app",
    ]
    
    # Google Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL_FLASH: str = "gemini-2.0-flash"
    GEMINI_MODEL_PRO: str = "gemini-2.0-flash"
    
    # Hugging Face AI (backup vision provider)
    HUGGINGFACE_API_KEY: str = ""
    
    # Clarifai AI (backup vision provider)
    CLARIFAI_PAT: str = ""
    
    # Rate Limiting (Free Tier)
    FREE_DAILY_AI_SCANS: int = 3
    FREE_DAILY_VOICE_LOGS: int = 2
    FREE_DAILY_FORM_CHECKS: int = 1
    
    # Pro Tier Limits
    PRO_DAILY_AI_SCANS: int = 100
    PRO_DAILY_VOICE_LOGS: int = 50
    PRO_DAILY_FORM_CHECKS: int = 20
    
    # JWT Settings
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Redis (optional caching)
    REDIS_URL: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()


# Feature Limits by Tier
FEATURE_LIMITS = {
    "FREE": {
        "daily_ai_scans": settings.FREE_DAILY_AI_SCANS,
        "daily_voice_logs": settings.FREE_DAILY_VOICE_LOGS,
        "daily_form_checks": settings.FREE_DAILY_FORM_CHECKS,
        "recipe_generation": True,
        "meal_planning": True,
        "ai_coach_messages": 10,
        "workout_diet": False,
        "export_data": False,
    },
    "PRO": {
        "daily_ai_scans": settings.PRO_DAILY_AI_SCANS,
        "daily_voice_logs": settings.PRO_DAILY_VOICE_LOGS,
        "daily_form_checks": settings.PRO_DAILY_FORM_CHECKS,
        "recipe_generation": True,
        "meal_planning": True,
        "ai_coach_messages": -1,  # Unlimited
        "workout_diet": True,
        "export_data": True,
    },
}
