"""
Recipe Generator Router
Endpoints for AI-powered recipe generation (Pantry Chef)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db, User, SavedRecipe
from app.services.gemini_ai import generate_recipe_from_ingredients, generate_recipe_from_text_ingredients
from app.routers.auth import get_current_user

router = APIRouter()


class RecipeGenerateRequest(BaseModel):
    """Request model for recipe generation"""
    image: str  # Base64 encoded image of ingredients
    preferences: Optional[dict] = None  # Dietary preferences


class IngredientRecipeRequest(BaseModel):
    """Request model for ingredient-based recipe generation"""
    ingredients: List[str]  # List of available ingredients
    user_goal: str = "Balanced"  # Weight Loss, Muscle Gain, or Balanced
    dietary_restrictions: Optional[List[str]] = None  # Allergies or restrictions


class RecipeSaveRequest(BaseModel):
    """Request model for saving a recipe"""
    name: str
    ingredients: List[str]
    instructions: List[str]
    calories: int
    protein: float
    carbs: float
    fat: float
    prep_time: int
    difficulty: str


class RecipeResponse(BaseModel):
    """Response model for recipe operations"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


class DemoRecipeRequest(BaseModel):
    """Request model for demo recipe generation (no auth)"""
    image: str  # Base64 encoded image
    preferences: Optional[dict] = None


@router.post("/generate")
async def generate_recipe_demo(request: DemoRecipeRequest):
    """
    Generate a healthy recipe from ingredient photo (Demo - no auth).
    Uses Gemini Pro Vision with fallback to mock data.
    """
    try:
        result = await generate_recipe_from_ingredients(
            request.image,
            request.preferences
        )
        
        return {
            "success": True,
            "data": result.model_dump() if hasattr(result, 'model_dump') else result
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Return fallback recipe based on common ingredients
        fallback_recipe = {
            "recipe_name": "Healthy Power Bowl",
            "difficulty": "Easy",
            "prep_time": "25 min",
            "calories_per_serving": 450,
            "macros": {
                "protein": "35g",
                "carbs": "40g",
                "fat": "18g"
            },
            "ingredients_used": ["protein source", "vegetables", "grains"],
            "pantry_staples_needed": ["olive oil", "salt", "pepper", "garlic"],
            "instructions": [
                "Prepare your protein by seasoning and cooking until done",
                "Cook grains according to package directions",
                "Chop vegetables into bite-sized pieces",
                "Combine all ingredients in a bowl",
                "Drizzle with olive oil and season to taste"
            ],
            "chef_tip": "Add fresh herbs for extra flavor!"
        }
        return {
            "success": True,
            "data": fallback_recipe
        }


@router.post("/generate-auth", response_model=RecipeResponse)
async def generate_recipe(
    request: RecipeGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a healthy recipe from ingredient photo.
    Uses Gemini Pro Vision for best results.
    """
    try:
        result = await generate_recipe_from_ingredients(
            request.image,
            request.preferences
        )
        
        return RecipeResponse(
            success=True,
            data=result.model_dump()
        )
        
    except Exception as e:
        return RecipeResponse(
            success=False,
            error=str(e)
        )


@router.post("/generate-from-ingredients", response_model=RecipeResponse)
async def generate_from_ingredients(
    request: IngredientRecipeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a healthy recipe from a text list of ingredients.
    Uses enhanced prompt for better goal-oriented recipes.
    
    Features:
    - Adapts to user goal (Weight Loss, Muscle Gain, Balanced)
    - Respects dietary restrictions
    - Suggests healthy cooking methods
    - Provides chef tips
    """
    try:
        result = await generate_recipe_from_text_ingredients(
            ingredients=request.ingredients,
            user_goal=request.user_goal,
            dietary_restrictions=request.dietary_restrictions
        )
        
        return RecipeResponse(
            success=True,
            data=result.model_dump()
        )
        
    except Exception as e:
        return RecipeResponse(
            success=False,
            error=str(e)
        )


@router.post("/save")
async def save_recipe(
    request: RecipeSaveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save a generated recipe to user's collection.
    """
    import json
    
    recipe = SavedRecipe(
        user_id=current_user.id,
        name=request.name,
        ingredients=json.dumps(request.ingredients),
        instructions=json.dumps(request.instructions),
        calories=request.calories,
        protein=request.protein,
        carbs=request.carbs,
        fat=request.fat,
        prep_time=request.prep_time,
        difficulty=request.difficulty
    )
    
    db.add(recipe)
    await db.flush()
    
    return {
        "success": True,
        "id": recipe.id,
        "message": f"Recipe '{request.name}' saved successfully"
    }


@router.get("/saved")
async def get_saved_recipes(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's saved recipes.
    """
    from sqlalchemy import select, desc
    import json
    
    result = await db.execute(
        select(SavedRecipe)
        .where(SavedRecipe.user_id == current_user.id)
        .order_by(desc(SavedRecipe.created_at))
        .limit(limit)
    )
    
    recipes = result.scalars().all()
    
    return {
        "success": True,
        "count": len(recipes),
        "recipes": [
            {
                "id": r.id,
                "name": r.name,
                "ingredients": json.loads(r.ingredients),
                "instructions": json.loads(r.instructions),
                "calories": r.calories,
                "protein": r.protein,
                "carbs": r.carbs,
                "fat": r.fat,
                "prep_time": r.prep_time,
                "difficulty": r.difficulty,
                "created_at": r.created_at.isoformat()
            }
            for r in recipes
        ]
    }


@router.delete("/saved/{recipe_id}")
async def delete_saved_recipe(
    recipe_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a saved recipe.
    """
    from sqlalchemy import select, delete
    
    result = await db.execute(
        select(SavedRecipe).where(
            SavedRecipe.id == recipe_id,
            SavedRecipe.user_id == current_user.id
        )
    )
    
    recipe = result.scalar_one_or_none()
    
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    await db.execute(
        delete(SavedRecipe).where(SavedRecipe.id == recipe_id)
    )
    
    return {
        "success": True,
        "message": "Recipe deleted"
    }


@router.get("/suggestions")
async def get_recipe_suggestions(
    goal: str = "balanced",  # balanced, high-protein, low-carb, low-calorie
    limit: int = 5
):
    """
    Get recipe suggestions based on dietary goal.
    Returns predefined healthy recipe ideas.
    """
    suggestions = {
        "balanced": [
            {
                "name": "Mediterranean Quinoa Bowl",
                "description": "Protein-packed grain bowl with veggies",
                "calories": 450,
                "prep_time": 25
            },
            {
                "name": "Grilled Salmon with Roasted Vegetables",
                "description": "Omega-3 rich dinner",
                "calories": 520,
                "prep_time": 30
            },
            {
                "name": "Turkey & Avocado Wrap",
                "description": "Balanced lunch wrap",
                "calories": 380,
                "prep_time": 10
            },
        ],
        "high-protein": [
            {
                "name": "Chicken Breast with Greek Yogurt Sauce",
                "description": "40g protein per serving",
                "calories": 420,
                "prep_time": 25
            },
            {
                "name": "Tuna Steak with Edamame",
                "description": "Lean protein powerhouse",
                "calories": 380,
                "prep_time": 20
            },
            {
                "name": "Egg White Omelette with Turkey",
                "description": "High protein breakfast",
                "calories": 280,
                "prep_time": 15
            },
        ],
        "low-carb": [
            {
                "name": "Cauliflower Rice Stir Fry",
                "description": "Low carb Asian-inspired",
                "calories": 320,
                "prep_time": 20
            },
            {
                "name": "Zucchini Noodles with Pesto",
                "description": "Carb-free pasta alternative",
                "calories": 280,
                "prep_time": 15
            },
            {
                "name": "Lettuce Wrap Tacos",
                "description": "Taco Tuesday, low carb style",
                "calories": 350,
                "prep_time": 20
            },
        ],
        "low-calorie": [
            {
                "name": "Asian Cucumber Salad",
                "description": "Refreshing and light",
                "calories": 120,
                "prep_time": 10
            },
            {
                "name": "Vegetable Soup",
                "description": "Filling but low calorie",
                "calories": 180,
                "prep_time": 30
            },
            {
                "name": "Shrimp & Veggie Skewers",
                "description": "Grilled goodness",
                "calories": 220,
                "prep_time": 25
            },
        ]
    }
    
    return {
        "success": True,
        "goal": goal,
        "suggestions": suggestions.get(goal, suggestions["balanced"])[:limit]
    }
