"""
Health Router - Smartwatch Data Sync Endpoints
Handles syncing and retrieving health metrics from smartwatches
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta
from ..database import get_db

router = APIRouter(prefix="/api/health", tags=["health"])

# ============================================================================
# Pydantic Models
# ============================================================================

class HealthMetrics(BaseModel):
    """Health metrics from smartwatch sync"""
    steps: int
    steps_goal: int = 10000
    heart_rate: int  # Current BPM
    heart_rate_min: Optional[int] = None
    heart_rate_max: Optional[int] = None
    blood_oxygen: int  # SpO2 percentage
    sleep_hours: float  # Total sleep in hours
    sleep_quality: Optional[str] = None  # 'poor', 'fair', 'good', 'excellent'
    calories_burned: int
    active_minutes: int = 0
    distance_km: float = 0.0
    floors_climbed: int = 0
    device_name: Optional[str] = None
    device_id: Optional[str] = None
    sync_timestamp: Optional[str] = None

class HealthSyncResponse(BaseModel):
    """Response after syncing health data"""
    success: bool
    message: str
    sync_id: Optional[int] = None
    synced_at: str

class WorkoutData(BaseModel):
    """Workout data from smartwatch"""
    workout_type: str  # 'running', 'cycling', 'swimming', 'weights', 'cardio', etc.
    duration_minutes: int
    calories_burned: int
    distance_km: Optional[float] = None
    avg_heart_rate: Optional[int] = None
    max_heart_rate: Optional[int] = None
    started_at: str
    device_name: Optional[str] = None

# ============================================================================
# Database Initialization
# ============================================================================

async def init_health_tables(db: AsyncSession):
    """Create health tracking tables if they don't exist"""
    create_health_metrics = """
    CREATE TABLE IF NOT EXISTS health_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date DATE NOT NULL,
        steps INTEGER DEFAULT 0,
        steps_goal INTEGER DEFAULT 10000,
        heart_rate INTEGER,
        heart_rate_min INTEGER,
        heart_rate_max INTEGER,
        blood_oxygen INTEGER,
        sleep_hours REAL,
        sleep_quality TEXT,
        calories_burned INTEGER DEFAULT 0,
        active_minutes INTEGER DEFAULT 0,
        distance_km REAL DEFAULT 0,
        floors_climbed INTEGER DEFAULT 0,
        device_name TEXT,
        device_id TEXT,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    create_workouts = """
    CREATE TABLE IF NOT EXISTS watch_workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        workout_type TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        calories_burned INTEGER DEFAULT 0,
        distance_km REAL,
        avg_heart_rate INTEGER,
        max_heart_rate INTEGER,
        started_at TIMESTAMP,
        device_name TEXT,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    create_devices = """
    CREATE TABLE IF NOT EXISTS connected_devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        device_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        device_type TEXT,
        last_sync TIMESTAMP,
        is_primary BOOLEAN DEFAULT 0,
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    await db.execute(text(create_health_metrics))
    await db.execute(text(create_workouts))
    await db.execute(text(create_devices))
    await db.commit()

# ============================================================================
# Endpoints
# ============================================================================

@router.post("/sync", response_model=HealthSyncResponse)
async def sync_health_data(
    metrics: HealthMetrics,
    db: AsyncSession = Depends(get_db)
):
    """
    Sync health metrics from smartwatch
    Stores daily health data including steps, heart rate, sleep, etc.
    """
    try:
        # Initialize tables if needed
        await init_health_tables(db)
        
        today = date.today().isoformat()
        
        # Check if we already have data for today - update or insert
        check_query = text("""
            SELECT id FROM health_metrics 
            WHERE date = :date AND (user_id IS NULL OR user_id = 1)
        """)
        result = await db.execute(check_query, {"date": today})
        existing = result.fetchone()
        
        if existing:
            # Update existing record
            update_query = text("""
                UPDATE health_metrics SET
                    steps = :steps,
                    steps_goal = :steps_goal,
                    heart_rate = :heart_rate,
                    heart_rate_min = :heart_rate_min,
                    heart_rate_max = :heart_rate_max,
                    blood_oxygen = :blood_oxygen,
                    sleep_hours = :sleep_hours,
                    sleep_quality = :sleep_quality,
                    calories_burned = :calories_burned,
                    active_minutes = :active_minutes,
                    distance_km = :distance_km,
                    floors_climbed = :floors_climbed,
                    device_name = :device_name,
                    device_id = :device_id,
                    synced_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """)
            await db.execute(update_query, {
                "id": existing[0],
                "steps": metrics.steps,
                "steps_goal": metrics.steps_goal,
                "heart_rate": metrics.heart_rate,
                "heart_rate_min": metrics.heart_rate_min,
                "heart_rate_max": metrics.heart_rate_max,
                "blood_oxygen": metrics.blood_oxygen,
                "sleep_hours": metrics.sleep_hours,
                "sleep_quality": metrics.sleep_quality,
                "calories_burned": metrics.calories_burned,
                "active_minutes": metrics.active_minutes,
                "distance_km": metrics.distance_km,
                "floors_climbed": metrics.floors_climbed,
                "device_name": metrics.device_name,
                "device_id": metrics.device_id,
            })
            sync_id = existing[0]
        else:
            # Insert new record
            insert_query = text("""
                INSERT INTO health_metrics (
                    date, steps, steps_goal, heart_rate, heart_rate_min, heart_rate_max,
                    blood_oxygen, sleep_hours, sleep_quality, calories_burned,
                    active_minutes, distance_km, floors_climbed, device_name, device_id
                ) VALUES (
                    :date, :steps, :steps_goal, :heart_rate, :heart_rate_min, :heart_rate_max,
                    :blood_oxygen, :sleep_hours, :sleep_quality, :calories_burned,
                    :active_minutes, :distance_km, :floors_climbed, :device_name, :device_id
                )
            """)
            result = await db.execute(insert_query, {
                "date": today,
                "steps": metrics.steps,
                "steps_goal": metrics.steps_goal,
                "heart_rate": metrics.heart_rate,
                "heart_rate_min": metrics.heart_rate_min,
                "heart_rate_max": metrics.heart_rate_max,
                "blood_oxygen": metrics.blood_oxygen,
                "sleep_hours": metrics.sleep_hours,
                "sleep_quality": metrics.sleep_quality,
                "calories_burned": metrics.calories_burned,
                "active_minutes": metrics.active_minutes,
                "distance_km": metrics.distance_km,
                "floors_climbed": metrics.floors_climbed,
                "device_name": metrics.device_name,
                "device_id": metrics.device_id,
            })
            sync_id = result.lastrowid
        
        await db.commit()
        
        return HealthSyncResponse(
            success=True,
            message="Health data synced successfully",
            sync_id=sync_id,
            synced_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync health data: {str(e)}"
        )

@router.post("/workout", response_model=HealthSyncResponse)
async def sync_workout(
    workout: WorkoutData,
    db: AsyncSession = Depends(get_db)
):
    """
    Sync a workout from smartwatch
    """
    try:
        await init_health_tables(db)
        
        insert_query = text("""
            INSERT INTO watch_workouts (
                workout_type, duration_minutes, calories_burned, distance_km,
                avg_heart_rate, max_heart_rate, started_at, device_name
            ) VALUES (
                :workout_type, :duration_minutes, :calories_burned, :distance_km,
                :avg_heart_rate, :max_heart_rate, :started_at, :device_name
            )
        """)
        
        result = await db.execute(insert_query, {
            "workout_type": workout.workout_type,
            "duration_minutes": workout.duration_minutes,
            "calories_burned": workout.calories_burned,
            "distance_km": workout.distance_km,
            "avg_heart_rate": workout.avg_heart_rate,
            "max_heart_rate": workout.max_heart_rate,
            "started_at": workout.started_at,
            "device_name": workout.device_name,
        })
        
        await db.commit()
        
        return HealthSyncResponse(
            success=True,
            message="Workout synced successfully",
            sync_id=result.lastrowid,
            synced_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync workout: {str(e)}"
        )

@router.get("/history")
async def get_health_history(
    days: int = 7,
    db: AsyncSession = Depends(get_db)
):
    """
    Get health history for the past N days
    """
    try:
        await init_health_tables(db)
        
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        query = text("""
            SELECT id, date, steps, heart_rate, blood_oxygen, 
                   sleep_hours, calories_burned, active_minutes
            FROM health_metrics
            WHERE date >= :start_date
            ORDER BY date DESC
        """)
        
        result = await db.execute(query, {"start_date": start_date})
        rows = result.fetchall()
        
        history = []
        for row in rows:
            history.append({
                "id": row[0],
                "date": str(row[1]),
                "steps": row[2] or 0,
                "heart_rate": row[3] or 0,
                "blood_oxygen": row[4] or 0,
                "sleep_hours": row[5] or 0,
                "calories_burned": row[6] or 0,
                "active_minutes": row[7] or 0,
            })
        
        return {
            "success": True,
            "data": history,
            "period": f"Last {days} days"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get health history: {str(e)}"
        )

@router.get("/summary")
async def get_health_summary(
    period: str = "week",
    db: AsyncSession = Depends(get_db)
):
    """
    Get health summary for week or month
    """
    try:
        await init_health_tables(db)
        
        days = 7 if period == "week" else 30
        start_date = (date.today() - timedelta(days=days)).isoformat()
        
        query = text("""
            SELECT 
                AVG(steps) as avg_steps,
                AVG(heart_rate) as avg_heart_rate,
                AVG(blood_oxygen) as avg_blood_oxygen,
                AVG(sleep_hours) as avg_sleep,
                SUM(calories_burned) as total_calories,
                SUM(active_minutes) as total_active,
                COUNT(*) as days_tracked
            FROM health_metrics
            WHERE date >= :start_date
        """)
        
        result = await db.execute(query, {"start_date": start_date})
        row = result.fetchone()
        
        # Get best day (most steps)
        best_query = text("""
            SELECT date, steps FROM health_metrics
            WHERE date >= :start_date
            ORDER BY steps DESC
            LIMIT 1
        """)
        best_result = await db.execute(best_query, {"start_date": start_date})
        best = best_result.fetchone()
        
        # Calculate streak
        streak = 0
        streak_query = text("""
            SELECT date FROM health_metrics
            WHERE steps >= steps_goal * 0.8
            ORDER BY date DESC
        """)
        streak_result = await db.execute(streak_query)
        streak_days = streak_result.fetchall()
        
        if streak_days:
            current_date = date.today()
            for day in streak_days:
                day_date = date.fromisoformat(str(day[0]))
                if day_date == current_date or day_date == current_date - timedelta(days=1):
                    streak += 1
                    current_date = day_date - timedelta(days=1)
                else:
                    break
        
        return {
            "success": True,
            "data": {
                "avg_steps": round(row[0] or 0) if row else 0,
                "avg_heart_rate": round(row[1] or 0) if row else 0,
                "avg_blood_oxygen": round(row[2] or 0) if row else 0,
                "avg_sleep_hours": round(row[3] or 0, 1) if row else 0,
                "total_calories": row[4] or 0 if row else 0,
                "total_active_minutes": row[5] or 0 if row else 0,
                "days_tracked": row[6] or 0 if row else 0,
                "best_day": str(best[0]) if best else None,
                "best_steps": best[1] if best else 0,
                "streak_days": streak,
            },
            "period": period
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get health summary: {str(e)}"
        )

@router.get("/today")
async def get_today_health(db: AsyncSession = Depends(get_db)):
    """
    Get today's health metrics
    """
    try:
        await init_health_tables(db)
        
        today = date.today().isoformat()
        
        query = text("""
            SELECT id, user_id, date, steps, steps_goal, heart_rate, heart_rate_min,
                   heart_rate_max, blood_oxygen, sleep_hours, sleep_quality, 
                   calories_burned, active_minutes, distance_km, floors_climbed,
                   device_name, device_id, synced_at
            FROM health_metrics
            WHERE date = :date
            LIMIT 1
        """)
        
        result = await db.execute(query, {"date": today})
        row = result.fetchone()
        
        if row:
            return {
                "success": True,
                "data": {
                    "id": row[0],
                    "date": str(row[2]),
                    "steps": row[3] or 0,
                    "steps_goal": row[4] or 10000,
                    "heart_rate": row[5] or 0,
                    "heart_rate_min": row[6],
                    "heart_rate_max": row[7],
                    "blood_oxygen": row[8] or 0,
                    "sleep_hours": row[9] or 0,
                    "sleep_quality": row[10],
                    "calories_burned": row[11] or 0,
                    "active_minutes": row[12] or 0,
                    "distance_km": row[13] or 0,
                    "floors_climbed": row[14] or 0,
                    "device_name": row[15],
                    "synced_at": str(row[17]) if row[17] else None,
                }
            }
        else:
            return {
                "success": True,
                "data": None,
                "message": "No health data for today yet"
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get today's health data: {str(e)}"
        )

@router.get("/workouts")
async def get_workouts(
    days: int = 7,
    db: AsyncSession = Depends(get_db)
):
    """
    Get workouts from the past N days
    """
    try:
        await init_health_tables(db)
        
        query = text("""
            SELECT id, workout_type, duration_minutes, calories_burned,
                   distance_km, avg_heart_rate, max_heart_rate, started_at
            FROM watch_workouts
            WHERE synced_at >= datetime('now', :days_ago)
            ORDER BY started_at DESC
        """)
        
        result = await db.execute(query, {"days_ago": f"-{days} days"})
        rows = result.fetchall()
        
        workouts = []
        for row in rows:
            workouts.append({
                "id": row[0],
                "workout_type": row[1],
                "duration_minutes": row[2],
                "calories_burned": row[3],
                "distance_km": row[4],
                "avg_heart_rate": row[5],
                "max_heart_rate": row[6],
                "started_at": str(row[7]) if row[7] else None,
            })
        
        return {
            "success": True,
            "data": workouts,
            "period": f"Last {days} days"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workouts: {str(e)}"
        )
