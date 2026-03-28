"""
Voice Logging Router
Endpoints for voice-to-food AI feature
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db, User
from app.services.voice_processor import voice_to_food_pipeline
from app.services.rate_limiter import check_daily_limit, increment_usage
from app.routers.auth import get_current_user

router = APIRouter()


class VoiceLogRequest(BaseModel):
    """Request model for voice logging"""
    audio: str  # Base64 encoded audio
    audio_format: str = "m4a"  # m4a, mp3, wav


class TextLogRequest(BaseModel):
    """Request model for text-based food logging"""
    text: str  # Food description text


class ParsedFood(BaseModel):
    """Parsed food item"""
    name: str
    quantity: float = 1
    unit: str = "serving"
    calories: int = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0


class VoiceLogResponse(BaseModel):
    """Response model for voice logging"""
    success: bool
    transcription: Optional[str] = None
    transcript: Optional[str] = None  # Alias for frontend compatibility
    food: Optional[dict] = None
    parsed_foods: Optional[List[ParsedFood]] = None  # For frontend format
    error: Optional[str] = None
    remaining_logs: int = 0


@router.post("/analyze", response_model=VoiceLogResponse)
async def analyze_voice(
    request: VoiceLogRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Transcribe voice and extract food information.
    
    Pro feature - limited for free users (2/day).
    """
    # Check rate limit
    limit_check = await check_daily_limit(
        db, current_user.id, "voice_logs", current_user.subscription_tier
    )
    
    if not limit_check["can_use"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Daily voice log limit reached",
                "limit": limit_check["limit"],
                "feature": "pro",
                "upgrade_url": "/premium"
            }
        )
    
    try:
        # Process voice to food
        result = await voice_to_food_pipeline(
            request.audio,
            request.audio_format
        )
        
        if result["success"]:
            # Increment usage
            await increment_usage(db, current_user.id, "voice_logs")
        
        # Get updated remaining
        updated_limit = await check_daily_limit(
            db, current_user.id, "voice_logs", current_user.subscription_tier
        )
        
        return VoiceLogResponse(
            success=result["success"],
            transcription=result.get("transcription"),
            food=result.get("food"),
            error=result.get("error"),
            remaining_logs=updated_limit["remaining"]
        )
        
    except Exception as e:
        return VoiceLogResponse(
            success=False,
            error=str(e),
            remaining_logs=limit_check["remaining"]
        )


@router.post("/parse-text", response_model=VoiceLogResponse)
async def parse_text_to_food(request: TextLogRequest):
    """
    Parse food from text description (no auth required for demo).
    Useful when voice transcription is not available.
    """
    from app.services.gemini_ai import parse_food_from_text
    
    try:
        food_result = await parse_food_from_text(request.text)
        
        # Convert to frontend format
        parsed_foods = []
        if food_result.items:
            for item in food_result.items:
                parsed_foods.append(ParsedFood(
                    name=item.get("name", "Food"),
                    quantity=1,
                    unit=item.get("portion", "serving"),
                    calories=item.get("calories", 0),
                    protein=0,
                    carbs=0,
                    fat=0,
                ))
        else:
            # Single food item
            parsed_foods.append(ParsedFood(
                name=food_result.food_name,
                quantity=1,
                unit=food_result.portion_size,
                calories=food_result.calories,
                protein=food_result.protein,
                carbs=food_result.carbs,
                fat=food_result.fat,
            ))
        
        return VoiceLogResponse(
            success=True,
            transcription=request.text,
            transcript=request.text,
            food=food_result.model_dump(),
            parsed_foods=parsed_foods,
        )
        
    except Exception as e:
        return VoiceLogResponse(
            success=False,
            error=str(e),
        )


@router.post("/transcribe")
async def transcribe_only(
    request: VoiceLogRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Transcribe voice without parsing food.
    Useful for AI coach voice input.
    """
    from app.services.voice_processor import transcribe_audio
    
    try:
        text = await transcribe_audio(request.audio, request.audio_format)
        
        return {
            "success": True,
            "transcription": text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
