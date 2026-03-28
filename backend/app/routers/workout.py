"""
Workout Plan Router
Endpoints for AI-powered workout and diet plan generation
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db, User
from app.services.gemini_ai import generate_workout_plan
from app.routers.auth import get_current_user

router = APIRouter()


class WorkoutPlanRequest(BaseModel):
    """Request model for workout plan generation"""
    height_cm: float
    weight_kg: float
    age: int
    gender: str  # male, female
    experience_level: str  # beginner, intermediate, advanced
    workout_type: str  # gym, home, both
    goal: str  # weight_loss, muscle_gain, maintenance, endurance
    days_per_week: int = 5
    injuries: Optional[List[str]] = None


class WorkoutPlanResponse(BaseModel):
    """Response model for workout plan operations"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


@router.post("/generate-plan")
async def create_workout_plan_demo(request: WorkoutPlanRequest):
    """
    Generate a personalized workout and diet plan (Demo - no auth required).
    Uses Gemini Pro for comprehensive AI-powered planning.
    """
    try:
        result = await generate_workout_plan(
            height_cm=request.height_cm,
            weight_kg=request.weight_kg,
            age=request.age,
            gender=request.gender,
            experience_level=request.experience_level,
            workout_type=request.workout_type,
            goal=request.goal,
            days_per_week=request.days_per_week,
            injuries=request.injuries
        )
        
        return {
            "success": True,
            "data": result.model_dump()
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/generate-plan-auth", response_model=WorkoutPlanResponse)
async def create_workout_plan(
    request: WorkoutPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a personalized workout and diet plan based on BMI, experience, and goals.
    Uses Gemini Pro for comprehensive AI-powered planning.
    
    Features:
    - BMI-based intensity adjustment
    - Gym or Home workout options
    - Goal-oriented exercise selection
    - Matching diet plan with macros
    - Progress timeline expectations
    """
    try:
        result = await generate_workout_plan(
            height_cm=request.height_cm,
            weight_kg=request.weight_kg,
            age=request.age,
            gender=request.gender,
            experience_level=request.experience_level,
            workout_type=request.workout_type,
            goal=request.goal,
            days_per_week=request.days_per_week,
            injuries=request.injuries
        )
        
        return WorkoutPlanResponse(
            success=True,
            data=result.model_dump()
        )
        
    except Exception as e:
        return WorkoutPlanResponse(
            success=False,
            error=str(e)
        )


@router.get("/bmi-calculate")
async def calculate_bmi(
    height_cm: float,
    weight_kg: float
):
    """
    Calculate BMI and return category.
    """
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    
    if bmi < 18.5:
        category = "Underweight"
        color = "#4D96FF"  # Blue
        recommendation = "Focus on muscle gain with caloric surplus"
    elif bmi < 25:
        category = "Normal"
        color = "#30D158"  # Green
        recommendation = "Maintain with balanced nutrition and exercise"
    elif bmi < 30:
        category = "Overweight"
        color = "#FF9F0A"  # Orange
        recommendation = "Focus on fat loss with moderate caloric deficit"
    else:
        category = "Obese"
        color = "#FF453A"  # Red
        recommendation = "Prioritize health improvements with gradual changes"
    
    return {
        "bmi": round(bmi, 1),
        "category": category,
        "color": color,
        "recommendation": recommendation,
        "healthy_weight_range": {
            "min": round(18.5 * (height_m ** 2), 1),
            "max": round(24.9 * (height_m ** 2), 1)
        }
    }
