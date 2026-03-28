"""
MyHealthFirstAI Backend - FastAPI Application
Main entry point for the API server
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import init_db, get_db
from app.routers import auth, food, voice, form, recipes, chat, subscription, workout, health
from app.middleware.rate_limit import RateLimitMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting MyHealthFirstAI Backend...")
    await init_db()
    logger.info("✅ Database initialized")
    yield
    # Shutdown
    logger.info("👋 Shutting down...")


app = FastAPI(
    title="MyHealthFirstAI API",
    description="AI-powered fitness and nutrition tracking platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "success": False}
    )


# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(food.router, prefix="/api/food", tags=["Food Analysis"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice Logging"])
app.include_router(form.router, prefix="/api/form", tags=["Form Corrector"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["Recipe Generator"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Coach"])
app.include_router(subscription.router, prefix="/api/subscription", tags=["Subscription"])
app.include_router(workout.router, prefix="/api/workout", tags=["Workout Planner"])
app.include_router(health.router, tags=["Health/Watch Sync"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to MyHealthFirstAI API",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
