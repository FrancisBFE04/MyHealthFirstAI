"""
Database Configuration and Models
SQLAlchemy async setup with SQLite
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Date
from datetime import datetime, date
from typing import Optional, List

from app.config import settings


# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


# ============== MODELS ==============

class User(Base):
    """User account model"""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    name: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Profile
    age: Mapped[Optional[int]] = mapped_column(Integer)
    weight: Mapped[Optional[float]] = mapped_column(Float)  # kg
    height: Mapped[Optional[float]] = mapped_column(Float)  # cm
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    activity_level: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Nutrition Goals
    target_calories: Mapped[int] = mapped_column(Integer, default=2000)
    target_protein: Mapped[int] = mapped_column(Integer, default=150)
    target_carbs: Mapped[int] = mapped_column(Integer, default=250)
    target_fat: Mapped[int] = mapped_column(Integer, default=65)
    target_water: Mapped[int] = mapped_column(Integer, default=2500)  # ml
    
    # Workout Plan
    workout_plan: Mapped[str] = mapped_column(String(50), default="maintenance")
    
    # Subscription
    subscription_tier: Mapped[str] = mapped_column(String(20), default="FREE")
    subscription_expires: Mapped[Optional[datetime]] = mapped_column(DateTime)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    food_logs: Mapped[List["FoodLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    water_logs: Mapped[List["WaterLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    daily_usage: Mapped[List["DailyUsage"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    badges: Mapped[List["UserBadge"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    streaks: Mapped[List["Streak"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class FoodLog(Base):
    """Food logging entries"""
    __tablename__ = "food_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    name: Mapped[str] = mapped_column(String(255))
    meal_type: Mapped[str] = mapped_column(String(50))  # breakfast, lunch, dinner, snack
    
    calories: Mapped[int] = mapped_column(Integer)
    protein: Mapped[float] = mapped_column(Float, default=0)
    carbs: Mapped[float] = mapped_column(Float, default=0)
    fat: Mapped[float] = mapped_column(Float, default=0)
    
    portion_size: Mapped[Optional[str]] = mapped_column(String(100))
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # AI Analysis metadata
    ai_confidence: Mapped[Optional[float]] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(50), default="manual")  # manual, camera, voice
    
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user: Mapped["User"] = relationship(back_populates="food_logs")


class WaterLog(Base):
    """Water intake tracking"""
    __tablename__ = "water_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    amount_ml: Mapped[int] = mapped_column(Integer)
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="water_logs")


class DailyUsage(Base):
    """Track daily AI feature usage for rate limiting"""
    __tablename__ = "daily_usage"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    date: Mapped[date] = mapped_column(Date, default=date.today)
    
    ai_scans: Mapped[int] = mapped_column(Integer, default=0)
    voice_logs: Mapped[int] = mapped_column(Integer, default=0)
    form_checks: Mapped[int] = mapped_column(Integer, default=0)
    coach_messages: Mapped[int] = mapped_column(Integer, default=0)
    
    user: Mapped["User"] = relationship(back_populates="daily_usage")


class UserBadge(Base):
    """Gamification badges"""
    __tablename__ = "user_badges"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    badge_id: Mapped[str] = mapped_column(String(50))
    badge_name: Mapped[str] = mapped_column(String(100))
    badge_description: Mapped[str] = mapped_column(String(255))
    badge_icon: Mapped[str] = mapped_column(String(50))
    
    earned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="badges")


class Streak(Base):
    """Activity streaks for gamification"""
    __tablename__ = "streaks"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    streak_type: Mapped[str] = mapped_column(String(50))  # logging, water, workout
    current_count: Mapped[int] = mapped_column(Integer, default=0)
    best_count: Mapped[int] = mapped_column(Integer, default=0)
    last_activity: Mapped[date] = mapped_column(Date)
    
    user: Mapped["User"] = relationship(back_populates="streaks")


class DailyChallenge(Base):
    """Daily challenges for engagement"""
    __tablename__ = "daily_challenges"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[date] = mapped_column(Date, unique=True)
    
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(255))
    target_type: Mapped[str] = mapped_column(String(50))  # water, protein, steps
    target_value: Mapped[int] = mapped_column(Integer)
    xp_reward: Mapped[int] = mapped_column(Integer, default=50)


class MealPlan(Base):
    """Weekly meal planning"""
    __tablename__ = "meal_plans"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    date: Mapped[date] = mapped_column(Date)
    meal_type: Mapped[str] = mapped_column(String(50))
    
    name: Mapped[str] = mapped_column(String(255))
    calories: Mapped[int] = mapped_column(Integer)
    protein: Mapped[float] = mapped_column(Float, default=0)
    carbs: Mapped[float] = mapped_column(Float, default=0)
    fat: Mapped[float] = mapped_column(Float, default=0)
    
    recipe_id: Mapped[Optional[int]] = mapped_column(Integer)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SavedRecipe(Base):
    """User's saved recipes from AI generation"""
    __tablename__ = "saved_recipes"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    name: Mapped[str] = mapped_column(String(255))
    ingredients: Mapped[str] = mapped_column(Text)  # JSON string
    instructions: Mapped[str] = mapped_column(Text)  # JSON string
    
    calories: Mapped[int] = mapped_column(Integer)
    protein: Mapped[float] = mapped_column(Float)
    carbs: Mapped[float] = mapped_column(Float)
    fat: Mapped[float] = mapped_column(Float)
    
    prep_time: Mapped[int] = mapped_column(Integer)  # minutes
    difficulty: Mapped[str] = mapped_column(String(20))
    
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ============== DATABASE FUNCTIONS ==============

async def init_db():
    """Initialize database and create tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Dependency to get database session"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
