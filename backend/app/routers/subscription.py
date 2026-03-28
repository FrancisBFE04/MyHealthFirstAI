"""
Subscription Router
Handle subscription status and mock payments
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db, User
from app.services.rate_limiter import get_usage_summary
from app.routers.auth import get_current_user
from app.config import FEATURE_LIMITS

router = APIRouter()


class UpgradeRequest(BaseModel):
    """Request model for subscription upgrade"""
    plan: str  # "monthly" or "yearly"
    payment_method: Optional[str] = "mock"  # For demo purposes


class SubscriptionStatus(BaseModel):
    """Subscription status response"""
    tier: str
    is_pro: bool
    expires: Optional[str]
    features: dict


@router.get("/status")
async def get_subscription_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current subscription status and usage.
    """
    is_pro = current_user.subscription_tier == "PRO"
    
    # Check if subscription has expired
    if is_pro and current_user.subscription_expires:
        if current_user.subscription_expires < datetime.utcnow():
            # Subscription expired - downgrade to free
            current_user.subscription_tier = "FREE"
            is_pro = False
            await db.flush()
    
    # Get usage summary
    usage = await get_usage_summary(db, current_user.id, current_user.subscription_tier)
    
    return {
        "success": True,
        "subscription": {
            "tier": current_user.subscription_tier,
            "is_pro": is_pro,
            "expires": current_user.subscription_expires.isoformat() if current_user.subscription_expires else None,
        },
        "usage": usage,
        "features": FEATURE_LIMITS[current_user.subscription_tier]
    }


@router.get("/plans")
async def get_subscription_plans():
    """
    Get available subscription plans.
    """
    plans = [
        {
            "id": "monthly",
            "name": "Pro Monthly",
            "price": 9.99,
            "currency": "USD",
            "period": "month",
            "features": [
                "Unlimited AI food scans",
                "Unlimited voice logging",
                "20 form checks per day",
                "Unlimited AI coach messages",
                "Workout-based diet adjustments",
                "Data export",
                "Priority support"
            ],
            "savings": None
        },
        {
            "id": "yearly",
            "name": "Pro Yearly",
            "price": 79.99,
            "currency": "USD",
            "period": "year",
            "features": [
                "All Pro Monthly features",
                "2 months free",
                "Early access to new features"
            ],
            "savings": "Save 33%"
        }
    ]
    
    return {
        "success": True,
        "plans": plans,
        "comparison": {
            "FREE": {
                "ai_scans": "3/day",
                "voice_logs": "2/day",
                "form_checks": "1/day",
                "coach_messages": "10/day",
                "workout_diet": False,
                "export": False
            },
            "PRO": {
                "ai_scans": "Unlimited",
                "voice_logs": "Unlimited",
                "form_checks": "20/day",
                "coach_messages": "Unlimited",
                "workout_diet": True,
                "export": True
            }
        }
    }


@router.post("/upgrade")
async def upgrade_subscription(
    request: UpgradeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upgrade to Pro subscription.
    
    For demo/exam: Uses mock payment that instantly upgrades.
    In production: Would integrate with RevenueCat or Stripe.
    """
    if current_user.subscription_tier == "PRO":
        return {
            "success": False,
            "message": "Already a Pro subscriber"
        }
    
    # Calculate expiration based on plan
    if request.plan == "monthly":
        expires = datetime.utcnow() + timedelta(days=30)
        amount = 9.99
    elif request.plan == "yearly":
        expires = datetime.utcnow() + timedelta(days=365)
        amount = 79.99
    else:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Mock payment processing
    # In production, this would:
    # 1. Create a RevenueCat/Stripe checkout session
    # 2. Verify payment completion via webhook
    # 3. Then update the subscription
    
    if request.payment_method == "mock":
        # Instant upgrade for demo
        current_user.subscription_tier = "PRO"
        current_user.subscription_expires = expires
        await db.flush()
        
        return {
            "success": True,
            "message": "Welcome to Pro! 🎉",
            "subscription": {
                "tier": "PRO",
                "expires": expires.isoformat(),
                "amount_charged": amount,
                "currency": "USD"
            }
        }
    else:
        # Would return checkout URL in production
        return {
            "success": True,
            "checkout_url": "https://checkout.example.com/...",
            "message": "Redirecting to payment..."
        }


@router.post("/cancel")
async def cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel Pro subscription.
    Access continues until expiration date.
    """
    if current_user.subscription_tier != "PRO":
        return {
            "success": False,
            "message": "No active Pro subscription"
        }
    
    # In production, would cancel via RevenueCat/Stripe
    # For now, just acknowledge - access continues until expires
    
    return {
        "success": True,
        "message": "Subscription cancelled. Access continues until " + 
                   (current_user.subscription_expires.strftime("%B %d, %Y") 
                    if current_user.subscription_expires else "expiration"),
        "access_until": current_user.subscription_expires.isoformat() if current_user.subscription_expires else None
    }


@router.post("/restore")
async def restore_purchases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Restore purchases (for iOS/Android).
    Checks with RevenueCat for existing purchases.
    """
    # In production, would verify with RevenueCat
    # For demo, just check current status
    
    return {
        "success": True,
        "message": "Purchases checked",
        "subscription": {
            "tier": current_user.subscription_tier,
            "expires": current_user.subscription_expires.isoformat() if current_user.subscription_expires else None
        }
    }


@router.get("/check-feature/{feature}")
async def check_feature_access(
    feature: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if user has access to a specific feature.
    """
    features = FEATURE_LIMITS[current_user.subscription_tier]
    
    # Map feature names
    feature_map = {
        "ai_scans": "daily_ai_scans",
        "voice_logs": "daily_voice_logs",
        "form_checks": "daily_form_checks",
        "workout_diet": "workout_diet",
        "export": "export_data",
    }
    
    feature_key = feature_map.get(feature, feature)
    
    if feature_key not in features:
        return {
            "success": False,
            "error": f"Unknown feature: {feature}"
        }
    
    value = features[feature_key]
    
    # Boolean features
    if isinstance(value, bool):
        return {
            "success": True,
            "feature": feature,
            "has_access": value,
            "tier_required": "PRO" if not value else current_user.subscription_tier
        }
    
    # Limited features
    from app.services.rate_limiter import check_daily_limit
    
    limit_check = await check_daily_limit(
        db, current_user.id, feature, current_user.subscription_tier
    )
    
    return {
        "success": True,
        "feature": feature,
        "has_access": limit_check["can_use"],
        "remaining": limit_check["remaining"],
        "limit": limit_check["limit"],
        "used": limit_check.get("used", 0)
    }
