"""
AI Coach Chat Router
Endpoints for conversational AI nutrition coach
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db, User
from app.services.gemini_ai import chat_with_coach
from app.services.rate_limiter import check_daily_limit, increment_usage
from app.routers.auth import get_current_user

router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Request model for chat"""
    message: str
    history: Optional[List[ChatMessage]] = None
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    """Response model for chat"""
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
    remaining_messages: int = -1


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to the AI coach.
    
    Free users: 10 messages/day
    Pro users: Unlimited
    """
    # Check rate limit
    limit_check = await check_daily_limit(
        db, current_user.id, "coach_messages", current_user.subscription_tier
    )
    
    if not limit_check["can_use"]:
        raise HTTPException(
            status_code=429,
            detail={
                "message": "Daily coach message limit reached",
                "limit": limit_check["limit"],
                "upgrade_url": "/premium"
            }
        )
    
    try:
        # Build context from user profile
        context = request.context or {}
        context.update({
            "goals": {
                "calories": current_user.target_calories,
                "protein": current_user.target_protein,
                "carbs": current_user.target_carbs,
                "fat": current_user.target_fat,
            },
            "workout_plan": current_user.workout_plan,
        })
        
        # Convert history to dict format
        history = None
        if request.history:
            history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.history
            ]
        
        # Get AI response
        response = await chat_with_coach(
            request.message,
            context=context,
            history=history
        )
        
        # Increment usage
        await increment_usage(db, current_user.id, "coach_messages")
        
        # Get updated remaining
        updated_limit = await check_daily_limit(
            db, current_user.id, "coach_messages", current_user.subscription_tier
        )
        
        return ChatResponse(
            success=True,
            message=response,
            remaining_messages=updated_limit["remaining"]
        )
        
    except Exception as e:
        return ChatResponse(
            success=False,
            error=str(e),
            remaining_messages=limit_check["remaining"]
        )


@router.get("/suggestions")
async def get_chat_suggestions(
    current_user: User = Depends(get_current_user)
):
    """
    Get suggested questions for the AI coach.
    """
    suggestions = [
        {
            "category": "Nutrition",
            "questions": [
                "How can I increase my protein intake?",
                "What are healthy snack options?",
                "How much water should I drink daily?",
                "Is intermittent fasting right for me?",
            ]
        },
        {
            "category": "Weight Goals",
            "questions": [
                "How do I calculate my calorie deficit?",
                "What's a healthy rate of weight loss?",
                "How can I avoid plateaus?",
                "Should I count macros or just calories?",
            ]
        },
        {
            "category": "Fitness",
            "questions": [
                "What should I eat before a workout?",
                "How do I fuel my recovery?",
                "What's the best protein source post-workout?",
                "How do I build muscle while losing fat?",
            ]
        },
        {
            "category": "Meal Planning",
            "questions": [
                "Help me plan a balanced week of meals",
                "What are good meal prep ideas?",
                "How do I eat healthy on a budget?",
                "What are quick healthy dinner ideas?",
            ]
        },
    ]
    
    return {
        "success": True,
        "suggestions": suggestions
    }


@router.post("/quick-advice")
async def get_quick_advice(
    topic: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get quick pre-generated advice on common topics.
    Does not count against message limit.
    """
    advice_db = {
        "protein": {
            "title": "Hitting Your Protein Goals",
            "tips": [
                "Aim for 0.8-1g of protein per pound of body weight",
                "Include protein at every meal",
                "Greek yogurt, eggs, and lean meats are excellent sources",
                "Consider a protein shake if struggling to meet goals"
            ]
        },
        "hydration": {
            "title": "Staying Hydrated",
            "tips": [
                "Drink 8-10 glasses of water daily",
                "Start your day with a glass of water",
                "Set hourly reminders if you forget",
                "Water-rich foods like cucumber and watermelon count too"
            ]
        },
        "cravings": {
            "title": "Managing Cravings",
            "tips": [
                "Eat regular meals to avoid extreme hunger",
                "Include fiber and protein for satiety",
                "Allow small treats to avoid binge eating",
                "Stay hydrated - thirst is often mistaken for hunger"
            ]
        },
        "sleep": {
            "title": "Sleep and Nutrition",
            "tips": [
                "Avoid large meals 2-3 hours before bed",
                "Limit caffeine after 2 PM",
                "Magnesium-rich foods can promote sleep",
                "A small protein snack before bed can support recovery"
            ]
        }
    }
    
    advice = advice_db.get(topic.lower())
    
    if not advice:
        return {
            "success": False,
            "error": f"No quick advice available for '{topic}'",
            "available_topics": list(advice_db.keys())
        }
    
    return {
        "success": True,
        "topic": topic,
        "advice": advice
    }
