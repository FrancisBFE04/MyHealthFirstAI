"""
Form Corrector Router
Endpoints for AI workout form analysis
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db, User
from app.services.gemini_ai import analyze_workout_form
from app.services.rate_limiter import check_daily_limit, increment_usage
from app.routers.auth import get_current_user

router = APIRouter()


class FormAnalyzeRequest(BaseModel):
    """Request model for form analysis"""
    frames: List[str]  # List of base64 encoded video frames
    exercise_type: Optional[str] = None  # Optional hint


class FormAnalyzeResponse(BaseModel):
    """Response model for form analysis"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    remaining_checks: int = 0


@router.post("/analyze", response_model=FormAnalyzeResponse)
async def analyze_form(
    request: FormAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze workout form from video frames.
    
    Pro feature - limited for free users (1/day).
    Uses Gemini Pro Vision for detailed analysis.
    """
    # Check rate limit
    limit_check = await check_daily_limit(
        db, current_user.id, "form_checks", current_user.subscription_tier
    )
    
    if not limit_check["can_use"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Daily form check limit reached",
                "limit": limit_check["limit"],
                "feature": "pro",
                "upgrade_url": "/premium"
            }
        )
    
    if not request.frames or len(request.frames) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one video frame is required"
        )
    
    try:
        # Analyze form with Gemini Pro Vision
        result = await analyze_workout_form(
            request.frames,
            request.exercise_type
        )
        
        # Increment usage
        await increment_usage(db, current_user.id, "form_checks")
        
        # Get updated remaining
        updated_limit = await check_daily_limit(
            db, current_user.id, "form_checks", current_user.subscription_tier
        )
        
        return FormAnalyzeResponse(
            success=True,
            data=result.model_dump(),
            remaining_checks=updated_limit["remaining"]
        )
        
    except Exception as e:
        return FormAnalyzeResponse(
            success=False,
            error=str(e),
            remaining_checks=limit_check["remaining"]
        )


@router.get("/exercises")
async def list_supported_exercises():
    """
    Get list of exercises the form corrector supports.
    """
    exercises = [
        {
            "id": "squat",
            "name": "Squat",
            "key_points": ["Knee alignment", "Back posture", "Depth"],
            "difficulty": "Beginner"
        },
        {
            "id": "deadlift",
            "name": "Deadlift",
            "key_points": ["Back position", "Hip hinge", "Bar path"],
            "difficulty": "Intermediate"
        },
        {
            "id": "bench_press",
            "name": "Bench Press",
            "key_points": ["Grip width", "Bar path", "Shoulder position"],
            "difficulty": "Beginner"
        },
        {
            "id": "pushup",
            "name": "Push-up",
            "key_points": ["Body alignment", "Elbow angle", "Core engagement"],
            "difficulty": "Beginner"
        },
        {
            "id": "plank",
            "name": "Plank",
            "key_points": ["Spine alignment", "Hip position", "Core activation"],
            "difficulty": "Beginner"
        },
        {
            "id": "lunge",
            "name": "Lunge",
            "key_points": ["Knee tracking", "Step length", "Balance"],
            "difficulty": "Beginner"
        },
        {
            "id": "pull_up",
            "name": "Pull-up",
            "key_points": ["Grip", "Full range of motion", "No swinging"],
            "difficulty": "Advanced"
        },
        {
            "id": "bicep_curl",
            "name": "Bicep Curl",
            "key_points": ["Elbow position", "Full extension", "No swinging"],
            "difficulty": "Beginner"
        },
    ]
    
    return {
        "success": True,
        "exercises": exercises
    }
