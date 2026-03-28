"""
Rate Limiting Service
Check and enforce daily limits for free users
"""

from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import DailyUsage
from app.config import FEATURE_LIMITS


async def check_daily_limit(
    db: AsyncSession,
    user_id: int,
    feature: str,
    tier: str = "FREE"
) -> dict:
    """
    Check if user has reached their daily limit for a feature.
    
    Args:
        db: Database session
        user_id: User ID
        feature: Feature name (ai_scans, voice_logs, form_checks, coach_messages)
        tier: User's subscription tier
    
    Returns:
        dict with can_use, remaining, limit
    """
    today = date.today()
    limits = FEATURE_LIMITS.get(tier, FEATURE_LIMITS["FREE"])
    
    # Get or create today's usage record
    result = await db.execute(
        select(DailyUsage).where(
            DailyUsage.user_id == user_id,
            DailyUsage.date == today
        )
    )
    usage = result.scalar_one_or_none()
    
    if not usage:
        usage = DailyUsage(user_id=user_id, date=today)
        db.add(usage)
        await db.flush()
    
    # Get current usage and limit
    feature_map = {
        "ai_scans": ("ai_scans", "daily_ai_scans"),
        "voice_logs": ("voice_logs", "daily_voice_logs"),
        "form_checks": ("form_checks", "daily_form_checks"),
        "coach_messages": ("coach_messages", "ai_coach_messages"),
    }
    
    if feature not in feature_map:
        return {"can_use": True, "remaining": -1, "limit": -1}
    
    usage_field, limit_key = feature_map[feature]
    current = getattr(usage, usage_field, 0)
    limit = limits.get(limit_key, 0)
    
    # -1 means unlimited (Pro tier)
    if limit == -1:
        return {"can_use": True, "remaining": -1, "limit": -1}
    
    remaining = max(0, limit - current)
    can_use = current < limit
    
    return {
        "can_use": can_use,
        "remaining": remaining,
        "limit": limit,
        "used": current,
    }


async def increment_usage(
    db: AsyncSession,
    user_id: int,
    feature: str
) -> bool:
    """
    Increment the usage counter for a feature.
    
    Args:
        db: Database session
        user_id: User ID
        feature: Feature name
    
    Returns:
        True if incremented successfully
    """
    today = date.today()
    
    result = await db.execute(
        select(DailyUsage).where(
            DailyUsage.user_id == user_id,
            DailyUsage.date == today
        )
    )
    usage = result.scalar_one_or_none()
    
    if not usage:
        usage = DailyUsage(user_id=user_id, date=today)
        db.add(usage)
    
    # Increment the appropriate field
    if feature == "ai_scans":
        usage.ai_scans += 1
    elif feature == "voice_logs":
        usage.voice_logs += 1
    elif feature == "form_checks":
        usage.form_checks += 1
    elif feature == "coach_messages":
        usage.coach_messages += 1
    
    await db.flush()
    return True


async def get_usage_summary(
    db: AsyncSession,
    user_id: int,
    tier: str = "FREE"
) -> dict:
    """
    Get full usage summary for a user.
    
    Returns:
        dict with all feature usage and limits
    """
    today = date.today()
    limits = FEATURE_LIMITS.get(tier, FEATURE_LIMITS["FREE"])
    
    result = await db.execute(
        select(DailyUsage).where(
            DailyUsage.user_id == user_id,
            DailyUsage.date == today
        )
    )
    usage = result.scalar_one_or_none()
    
    if not usage:
        usage = DailyUsage(user_id=user_id, date=today)
    
    return {
        "date": today.isoformat(),
        "tier": tier,
        "features": {
            "ai_scans": {
                "used": usage.ai_scans,
                "limit": limits["daily_ai_scans"],
                "remaining": max(0, limits["daily_ai_scans"] - usage.ai_scans) if limits["daily_ai_scans"] != -1 else -1,
            },
            "voice_logs": {
                "used": usage.voice_logs,
                "limit": limits["daily_voice_logs"],
                "remaining": max(0, limits["daily_voice_logs"] - usage.voice_logs) if limits["daily_voice_logs"] != -1 else -1,
            },
            "form_checks": {
                "used": usage.form_checks,
                "limit": limits["daily_form_checks"],
                "remaining": max(0, limits["daily_form_checks"] - usage.form_checks) if limits["daily_form_checks"] != -1 else -1,
            },
            "coach_messages": {
                "used": usage.coach_messages,
                "limit": limits["ai_coach_messages"],
                "remaining": max(0, limits["ai_coach_messages"] - usage.coach_messages) if limits["ai_coach_messages"] != -1 else -1,
            },
        },
        "premium_features": {
            "workout_diet": limits["workout_diet"],
            "export_data": limits["export_data"],
        },
    }
