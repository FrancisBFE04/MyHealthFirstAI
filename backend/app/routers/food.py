"""
Food Analysis Router
Endpoints for AI-powered food recognition and logging
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database import get_db, FoodLog, User
from app.services.vision_ai import MultiModalVisionService
from app.services.rate_limiter import check_daily_limit, increment_usage
from app.routers.auth import get_current_user

router = APIRouter()

# Initialize multimodal vision service
multimodal_vision = MultiModalVisionService()


class FoodAnalyzeRequest(BaseModel):
    """Request model for food analysis"""
    image: str  # Base64 encoded image
    meal_type: str = "lunch"  # breakfast, lunch, dinner, snack


class FoodLogRequest(BaseModel):
    """Request model for logging food"""
    name: str
    calories: int
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    portion_size: Optional[str] = None
    meal_type: str = "lunch"
    source: str = "manual"
    image_url: Optional[str] = None
    ai_confidence: Optional[float] = None


class FoodAnalyzeResponse(BaseModel):
    """Response model for food analysis"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
    remaining_scans: int = 0


class DemoAnalyzeRequest(BaseModel):
    """Request model for demo food analysis (no auth required)"""
    image: str  # Base64 encoded image
    user_id: str = "demo-user"


@router.post("/analyze")
async def analyze_food_demo(request: DemoAnalyzeRequest):
    """
    Analyze food image using Multimodal AI (Demo endpoint - no auth required).
    Uses Hugging Face + Clarifai + Gemini with automatic fallback.
    For development and testing purposes.
    """
    try:
        # Try multimodal AI service (Hugging Face -> Clarifai -> Gemini)
        result = await multimodal_vision.analyze_with_fallback(request.image)
        
        # Format response to match expected structure
        formatted_result = {
            "food_name": result.get("food_name", "Unknown Food"),
            "calories": result.get("calories", 200),
            "protein": result.get("protein", 10),
            "carbs": result.get("carbs", 25),
            "fat": result.get("fat", 8),
            "confidence": result.get("confidence", 0.75),
            "health_score": result.get("health_score", 7),
            "portion_size": result.get("portion_size", "1 serving"),
            "suggestions": result.get("suggestions", ["Looks nutritious!"]),
            "provider": result.get("provider", "unknown"),
            "detected_items": result.get("detected_items", []),
        }
        
        return {
            "success": True,
            "data": formatted_result,
            "remaining_scans": 99
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "remaining_scans": 99
        }


@router.post("/analyze-auth", response_model=FoodAnalyzeResponse)
async def analyze_food(
    request: FoodAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze food image using Multimodal AI.
    Uses Hugging Face + Clarifai + Gemini with automatic fallback.
    
    Rate limited for free users (3/day).
    """
    # Check rate limit
    limit_check = await check_daily_limit(
        db, current_user.id, "ai_scans", current_user.subscription_tier
    )
    
    if not limit_check["can_use"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": "Daily AI scan limit reached",
                "limit": limit_check["limit"],
                "upgrade_url": "/premium"
            }
        )
    
    try:
        # Analyze image with Multimodal AI service
        result = await multimodal_vision.analyze_with_fallback(request.image)
        
        # Format response to match expected structure
        formatted_result = {
            "food_name": result.get("food_name", "Unknown Food"),
            "calories": result.get("calories", 200),
            "protein": result.get("protein", 10),
            "carbs": result.get("carbs", 25),
            "fat": result.get("fat", 8),
            "confidence": result.get("confidence", 0.75),
            "health_score": result.get("health_score", 7),
            "portion_size": result.get("portion_size", "1 serving"),
            "suggestions": result.get("suggestions", ["Looks nutritious!"]),
            "provider": result.get("provider", "unknown"),
            "detected_items": result.get("detected_items", []),
        }
        
        # Increment usage
        await increment_usage(db, current_user.id, "ai_scans")
        
        # Get updated remaining
        updated_limit = await check_daily_limit(
            db, current_user.id, "ai_scans", current_user.subscription_tier
        )
        
        return FoodAnalyzeResponse(
            success=True,
            data=formatted_result,
            remaining_scans=updated_limit["remaining"]
        )
        
    except Exception as e:
        return FoodAnalyzeResponse(
            success=False,
            error=str(e),
            remaining_scans=limit_check["remaining"]
        )


@router.post("/log")
async def log_food(
    request: FoodLogRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Log a food entry to the database.
    """
    food_log = FoodLog(
        user_id=current_user.id,
        name=request.name,
        calories=request.calories,
        protein=request.protein,
        carbs=request.carbs,
        fat=request.fat,
        portion_size=request.portion_size,
        meal_type=request.meal_type,
        source=request.source,
        image_url=request.image_url,
        ai_confidence=request.ai_confidence,
        logged_at=datetime.utcnow()
    )
    
    db.add(food_log)
    await db.flush()
    
    return {
        "success": True,
        "id": food_log.id,
        "message": f"{request.name} logged successfully"
    }


@router.get("/logs")
async def get_food_logs(
    date: Optional[str] = None,
    meal_type: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get food logs for the current user.
    """
    from sqlalchemy import select, desc
    from datetime import date as date_type
    
    query = select(FoodLog).where(FoodLog.user_id == current_user.id)
    
    if date:
        target_date = date_type.fromisoformat(date)
        query = query.where(
            FoodLog.logged_at >= datetime.combine(target_date, datetime.min.time()),
            FoodLog.logged_at < datetime.combine(target_date, datetime.max.time())
        )
    
    if meal_type:
        query = query.where(FoodLog.meal_type == meal_type)
    
    query = query.order_by(desc(FoodLog.logged_at)).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return {
        "success": True,
        "count": len(logs),
        "logs": [
            {
                "id": log.id,
                "name": log.name,
                "calories": log.calories,
                "protein": log.protein,
                "carbs": log.carbs,
                "fat": log.fat,
                "portion_size": log.portion_size,
                "meal_type": log.meal_type,
                "source": log.source,
                "logged_at": log.logged_at.isoformat(),
            }
            for log in logs
        ]
    }


@router.get("/summary/today")
async def get_today_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get nutrition summary for today.
    """
    from sqlalchemy import select, func
    from datetime import date
    
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    result = await db.execute(
        select(
            func.sum(FoodLog.calories).label("total_calories"),
            func.sum(FoodLog.protein).label("total_protein"),
            func.sum(FoodLog.carbs).label("total_carbs"),
            func.sum(FoodLog.fat).label("total_fat"),
            func.count(FoodLog.id).label("meal_count")
        ).where(
            FoodLog.user_id == current_user.id,
            FoodLog.logged_at >= start_of_day,
            FoodLog.logged_at <= end_of_day
        )
    )
    
    row = result.one()
    
    return {
        "success": True,
        "date": today.isoformat(),
        "totals": {
            "calories": row.total_calories or 0,
            "protein": row.total_protein or 0,
            "carbs": row.total_carbs or 0,
            "fat": row.total_fat or 0,
        },
        "targets": {
            "calories": current_user.target_calories,
            "protein": current_user.target_protein,
            "carbs": current_user.target_carbs,
            "fat": current_user.target_fat,
        },
        "meal_count": row.meal_count or 0
    }
