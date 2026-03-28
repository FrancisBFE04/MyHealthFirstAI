"""
Google Gemini AI Service
Handles all AI-powered features using Google's Gemini models
"""

import google.generativeai as genai
import base64
import json
import logging
from typing import Optional
from pydantic import BaseModel

from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Model names - use gemini-2.0-flash for vision/multimodal, gemini-1.5-pro for text
VISION_MODEL = "gemini-2.0-flash"
TEXT_MODEL = "gemini-1.5-pro"


class FoodAnalysisResult(BaseModel):
    """Food analysis response model"""
    food_name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    portion_size: str
    confidence: float
    items: list = []


class RecipeResult(BaseModel):
    """Recipe generation response model"""
    name: str
    ingredients: list
    instructions: list
    calories: int
    protein: float
    carbs: float
    fat: float
    prep_time: int
    difficulty: str


class EnhancedRecipeResult(BaseModel):
    """Enhanced recipe result with more details"""
    recipe_name: str
    difficulty: str
    prep_time: str
    calories_per_serving: int
    macros: dict  # {"protein": "30g", "carbs": "40g", "fat": "15g"}
    ingredients_used: list
    pantry_staples_needed: list
    instructions: list
    chef_tip: str


class FormAnalysisResult(BaseModel):
    """Workout form analysis response model"""
    exercise_detected: str
    overall_score: int
    feedback: list
    corrections: list
    safety_notes: list


class WorkoutPlanResult(BaseModel):
    """Complete workout and diet plan result"""
    user_profile: dict  # BMI category, fitness level assessment
    weekly_workout_plan: list  # 7 days of workouts
    diet_plan: dict  # Daily meal suggestions with macros
    tips: list  # Personalized tips
    estimated_progress: dict  # Expected results in 4/8/12 weeks


# ============== FOOD ANALYSIS ==============

async def analyze_food_image(image_base64: str) -> FoodAnalysisResult:
    """
    Analyze food image using Gemini Vision.
    Uses Flash model for speed.
    
    Args:
        image_base64: Base64 encoded image
    
    Returns:
        FoodAnalysisResult with detected foods and nutrition
    """
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL_FLASH)
        
        prompt = """You are a professional nutritionist analyzing a food image.
        
        IMPORTANT: Look carefully at the ACTUAL food in the image. Identify:
        - What specific food items are visible?
        - Is it a burger, salad, pizza, sandwich, etc.?
        - What are the visible components and toppings?
        
        Return a JSON object with exactly these fields:
        {
            "food_name": "Actual name of the main dish you see (be specific - e.g. 'Cheeseburger with Fries' not just 'Food')",
            "calories": estimated total calories (integer),
            "protein": protein in grams (float),
            "carbs": carbs in grams (float),
            "fat": fat in grams (float),
            "portion_size": "estimated portion description",
            "confidence": confidence score 0-1 (float),
            "items": [
                {"name": "item name", "calories": calories, "portion": "portion size"},
                ...
            ]
        }
        
        Be accurate but conservative with calorie estimates.
        Consider portion size visible in the image.
        Only return valid JSON, no markdown or explanation."""
        
        # Create image part for Gemini
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_base64
        }
        
        response = model.generate_content([prompt, image_part])
        
        # Parse JSON response
        result_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()
        
        data = json.loads(result_text)
        
        return FoodAnalysisResult(**data)
        
    except Exception as e:
        logger.error(f"Food analysis error: {e}")
        raise


# ============== VOICE TO FOOD ==============

# Fallback food database for when AI is unavailable
COMMON_FOODS = {
    "pizza": {"calories": 285, "protein": 12, "carbs": 36, "fat": 10, "portion": "1 slice"},
    "burger": {"calories": 540, "protein": 25, "carbs": 40, "fat": 29, "portion": "1 burger"},
    "salad": {"calories": 150, "protein": 5, "carbs": 12, "fat": 10, "portion": "1 bowl"},
    "chicken": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "portion": "100g"},
    "rice": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "portion": "100g"},
    "pasta": {"calories": 220, "protein": 8, "carbs": 43, "fat": 1.3, "portion": "1 cup"},
    "egg": {"calories": 78, "protein": 6, "carbs": 0.6, "fat": 5, "portion": "1 egg"},
    "eggs": {"calories": 156, "protein": 12, "carbs": 1.2, "fat": 10, "portion": "2 eggs"},
    "toast": {"calories": 75, "protein": 3, "carbs": 13, "fat": 1, "portion": "1 slice"},
    "bread": {"calories": 75, "protein": 3, "carbs": 13, "fat": 1, "portion": "1 slice"},
    "apple": {"calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3, "portion": "1 medium"},
    "banana": {"calories": 105, "protein": 1.3, "carbs": 27, "fat": 0.4, "portion": "1 medium"},
    "sandwich": {"calories": 350, "protein": 15, "carbs": 40, "fat": 14, "portion": "1 sandwich"},
    "coffee": {"calories": 2, "protein": 0.3, "carbs": 0, "fat": 0, "portion": "1 cup"},
    "milk": {"calories": 103, "protein": 8, "carbs": 12, "fat": 2.4, "portion": "1 cup"},
    "steak": {"calories": 271, "protein": 26, "carbs": 0, "fat": 18, "portion": "100g"},
    "fish": {"calories": 136, "protein": 20, "carbs": 0, "fat": 5, "portion": "100g"},
    "fries": {"calories": 365, "protein": 4, "carbs": 48, "fat": 17, "portion": "medium"},
    "soda": {"calories": 140, "protein": 0, "carbs": 39, "fat": 0, "portion": "1 can"},
    "water": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "portion": "1 glass"},
    "protein shake": {"calories": 150, "protein": 25, "carbs": 8, "fat": 2, "portion": "1 shake"},
    "oatmeal": {"calories": 158, "protein": 6, "carbs": 27, "fat": 3, "portion": "1 cup"},
    "yogurt": {"calories": 100, "protein": 17, "carbs": 6, "fat": 0.7, "portion": "1 cup"},
    "cheese": {"calories": 113, "protein": 7, "carbs": 0.4, "fat": 9, "portion": "1 oz"},
    "almonds": {"calories": 164, "protein": 6, "carbs": 6, "fat": 14, "portion": "1 oz"},
    "avocado": {"calories": 234, "protein": 3, "carbs": 12, "fat": 21, "portion": "1 whole"},
    "soup": {"calories": 100, "protein": 5, "carbs": 15, "fat": 2, "portion": "1 bowl"},
    "cookie": {"calories": 160, "protein": 2, "carbs": 22, "fat": 7, "portion": "1 cookie"},
    "ice cream": {"calories": 207, "protein": 4, "carbs": 24, "fat": 11, "portion": "1 cup"},
    "chocolate": {"calories": 155, "protein": 2, "carbs": 17, "fat": 9, "portion": "1 bar"},
}


def fallback_parse_food(text: str) -> FoodAnalysisResult:
    """
    Parse food using local database when AI is unavailable.
    """
    text_lower = text.lower()
    found_items = []
    total_cal, total_pro, total_carb, total_fat = 0, 0, 0, 0
    
    for food, data in COMMON_FOODS.items():
        if food in text_lower:
            found_items.append({
                "name": food.title(),
                "calories": data["calories"],
                "portion": data["portion"]
            })
            total_cal += data["calories"]
            total_pro += data["protein"]
            total_carb += data["carbs"]
            total_fat += data["fat"]
    
    if not found_items:
        # Default to a generic meal estimate
        return FoodAnalysisResult(
            food_name="Meal",
            calories=400,
            protein=20,
            carbs=40,
            fat=15,
            portion_size="1 serving",
            confidence=0.3,
            items=[{"name": "Generic meal", "calories": 400, "portion": "1 serving"}]
        )
    
    return FoodAnalysisResult(
        food_name=found_items[0]["name"] if len(found_items) == 1 else "Mixed meal",
        calories=int(total_cal),
        protein=round(total_pro, 1),
        carbs=round(total_carb, 1),
        fat=round(total_fat, 1),
        portion_size="as described",
        confidence=0.7,
        items=found_items
    )


async def parse_food_from_text(text: str) -> FoodAnalysisResult:
    """
    Parse food and nutrition from transcribed voice text.
    Uses Flash model for speed.
    
    Args:
        text: Transcribed text describing food
    
    Returns:
        FoodAnalysisResult with parsed nutrition
    """
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL_FLASH)
        
        prompt = f"""Parse this food description and estimate nutrition:

"{text}"

Return a JSON object with exactly these fields:
{{
    "food_name": "Main dish name",
    "calories": estimated total calories (integer),
    "protein": protein in grams (float),
    "carbs": carbs in grams (float),
    "fat": fat in grams (float),
    "portion_size": "inferred portion size",
    "confidence": confidence score 0-1 (float),
    "items": [
        {{"name": "item name", "calories": calories, "portion": "portion size"}},
        ...
    ]
}}

Be accurate with common foods. If unsure, use average serving sizes.
Only return valid JSON, no markdown or explanation."""

        response = model.generate_content(prompt)
        
        # Parse JSON response
        result_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()
        
        data = json.loads(result_text)
        
        return FoodAnalysisResult(**data)
        
    except Exception as e:
        logger.error(f"Voice food parsing error: {e}")
        # Use fallback when AI fails (quota exceeded, etc.)
        logger.info(f"Using fallback food parser for: {text}")
        return fallback_parse_food(text)


# ============== RECIPE GENERATION ==============

async def generate_recipe_from_ingredients(image_base64: str, preferences: dict = None) -> RecipeResult:
    """
    Generate healthy recipe from pantry image.
    Uses Pro model for better quality.
    
    Args:
        image_base64: Base64 encoded image of ingredients
        preferences: Optional dietary preferences
    
    Returns:
        RecipeResult with full recipe
    """
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL_PRO)
        
        prefs = ""
        if preferences:
            prefs = f"\nDietary preferences: {json.dumps(preferences)}"
        
        prompt = f"""Look at these ingredients in the image and create a healthy recipe.
        {prefs}
        
        Return a JSON object with exactly these fields:
        {{
            "name": "Recipe name",
            "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount", ...],
            "instructions": ["Step 1", "Step 2", ...],
            "calories": total calories per serving (integer),
            "protein": protein in grams (float),
            "carbs": carbs in grams (float),
            "fat": fat in grams (float),
            "prep_time": total time in minutes (integer),
            "difficulty": "Easy" | "Medium" | "Hard"
        }}
        
        Focus on healthy, balanced meals.
        Use ingredients visible in the image.
        Only return valid JSON, no markdown or explanation."""
        
        # Create image part for Gemini
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_base64
        }
        
        response = model.generate_content([prompt, image_part])
        
        # Parse JSON response
        result_text = response.text.strip()
        
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()
        
        data = json.loads(result_text)
        
        return RecipeResult(**data)
        
    except Exception as e:
        logger.error(f"Recipe generation error: {e}")
        raise


async def generate_recipe_from_text_ingredients(
    ingredients: list[str],
    user_goal: str = "Balanced",
    dietary_restrictions: list[str] = None
) -> EnhancedRecipeResult:
    """
    Generate healthy recipe from text list of ingredients.
    Uses Pro model for better quality.
    
    Args:
        ingredients: List of available ingredients
        user_goal: Weight Loss, Muscle Gain, or Balanced
        dietary_restrictions: List of allergies or restrictions
    
    Returns:
        EnhancedRecipeResult with full recipe details
    """
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL_PRO)
        
        ingredients_str = ", ".join(ingredients)
        restrictions_str = ", ".join(dietary_restrictions) if dietary_restrictions else "None"
        
        prompt = f"""**Your Goal:** Create a healthy, delicious recipe using ONLY the "Available Ingredients" listed below, plus basic pantry staples (Salt, Pepper, Oil, Water, Garlic, Onion).

**Input Data:**
* **Available Ingredients:** {ingredients_str}
* **User Goal:** {user_goal} (e.g., Weight Loss, Muscle Gain, or Balanced)
* **Dietary Restrictions:** {restrictions_str}

**Instructions:**
1. **Analyze Ingredients:** Look at the available ingredients. If they are random (e.g., "Milk, Apple, Chicken"), find a creative way to use them or suggest the best single dish using the main protein/veg.
2. **Health Check:** Ensure the cooking method is healthy (e.g., bake/grill instead of deep fry).
3. **Missing Items:** If a critical ingredient is missing for a standard recipe, suggest a viable substitute from the list or explain how to make it without it.

**Output Format (Strict JSON):**
Please return the recipe in this exact JSON format:
{{
  "recipe_name": "Name of the Dish",
  "difficulty": "Easy/Medium/Hard",
  "prep_time": "15 mins",
  "calories_per_serving": 500,
  "macros": {{
    "protein": "30g",
    "carbs": "40g",
    "fat": "15g"
  }},
  "ingredients_used": ["List of ingredients from the input used"],
  "pantry_staples_needed": ["Oil", "Salt", "Pepper"],
  "instructions": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "chef_tip": "A one-sentence tip to make it tastier or healthier."
}}

Only return valid JSON, no markdown or explanation."""

        response = model.generate_content(prompt)
        
        # Parse JSON response
        result_text = response.text.strip()
        
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()
        
        data = json.loads(result_text)
        
        return EnhancedRecipeResult(**data)
        
    except Exception as e:
        logger.error(f"Ingredient recipe generation error: {e}")
        raise


# ============== FORM CORRECTOR ==============

async def analyze_workout_form(video_frames: list, exercise_type: str = None) -> FormAnalysisResult:
    """
    Analyze workout form from video frames.
    Uses Pro model for detailed analysis.
    
    Args:
        video_frames: List of base64 encoded key frames
        exercise_type: Optional hint about exercise being performed
    
    Returns:
        FormAnalysisResult with feedback and corrections
    """
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL_PRO)
        
        exercise_hint = f"The user is attempting: {exercise_type}" if exercise_type else ""
        
        prompt = f"""Analyze this workout form from the video frames provided.
        {exercise_hint}
        
        Return a JSON object with exactly these fields:
        {{
            "exercise_detected": "Name of exercise",
            "overall_score": score 1-100 (integer),
            "feedback": [
                "Positive feedback point 1",
                "Positive feedback point 2"
            ],
            "corrections": [
                "Correction needed 1",
                "Correction needed 2"
            ],
            "safety_notes": [
                "Safety warning if any",
                ...
            ]
        }}
        
        Be encouraging but specific with corrections.
        Focus on injury prevention.
        Only return valid JSON, no markdown or explanation."""
        
        # Prepare content with all frames
        content = [prompt]
        for i, frame in enumerate(video_frames[:5]):  # Limit to 5 frames
            content.append({
                "mime_type": "image/jpeg",
                "data": frame
            })
        
        response = model.generate_content(content)
        
        # Parse JSON response
        result_text = response.text.strip()
        
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()
        
        data = json.loads(result_text)
        
        return FormAnalysisResult(**data)
        
    except Exception as e:
        logger.error(f"Form analysis error: {e}")
        raise


# ============== AI COACH CHAT ==============

async def chat_with_coach(
    message: str,
    context: dict = None,
    history: list = None
) -> str:
    """
    Chat with AI nutrition/fitness coach.
    Uses Flash model for conversational speed.
    
    Args:
        message: User's message
        context: Optional user context (goals, recent logs, etc.)
        history: Optional conversation history
    
    Returns:
        AI response string
    """
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL_FLASH)
        
        system_prompt = """You are a friendly, knowledgeable AI nutrition and fitness coach.
        
        Your role:
        - Provide personalized nutrition advice
        - Help with meal planning and food choices
        - Answer questions about fitness and healthy living
        - Be encouraging and supportive
        - Keep responses concise but helpful
        
        Guidelines:
        - Be evidence-based in your advice
        - Recommend consulting professionals for medical issues
        - Consider the user's goals and preferences
        - Use a friendly, motivating tone"""
        
        # Build context string
        context_str = ""
        if context:
            if context.get("goals"):
                context_str += f"\nUser's goals: {context['goals']}"
            if context.get("recent_calories"):
                context_str += f"\nRecent intake: {context['recent_calories']} kcal"
            if context.get("workout_plan"):
                context_str += f"\nWorkout plan: {context['workout_plan']}"
        
        full_prompt = f"{system_prompt}\n{context_str}\n\nUser: {message}\n\nCoach:"
        
        # Include history if provided
        if history:
            history_text = "\n".join([
                f"{'User' if msg['role'] == 'user' else 'Coach'}: {msg['content']}"
                for msg in history[-10:]  # Last 10 messages
            ])
            full_prompt = f"{system_prompt}\n{context_str}\n\nConversation:\n{history_text}\n\nUser: {message}\n\nCoach:"
        
        response = model.generate_content(full_prompt)
        
        return response.text.strip()
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise


# ============== WORKOUT PLAN GENERATOR ==============

async def generate_workout_plan(
    height_cm: float,
    weight_kg: float,
    age: int,
    gender: str,
    experience_level: str,  # beginner, intermediate, advanced
    workout_type: str,  # gym, home, both
    goal: str,  # weight_loss, muscle_gain, maintenance, endurance
    days_per_week: int = 5,
    injuries: list = None
) -> WorkoutPlanResult:
    """
    Generate personalized workout and diet plan based on user profile.
    Uses Gemini Pro for comprehensive planning.
    
    Args:
        height_cm: Height in centimeters
        weight_kg: Weight in kilograms
        age: User age
        gender: male/female
        experience_level: beginner/intermediate/advanced
        workout_type: gym/home/both
        goal: weight_loss/muscle_gain/maintenance/endurance
        days_per_week: How many days user can workout
        injuries: List of injuries/limitations
    
    Returns:
        WorkoutPlanResult with complete workout and diet plan
    """
    try:
        model = genai.GenerativeModel(settings.GEMINI_MODEL_PRO)
        
        # Calculate BMI
        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)
        
        injuries_str = ", ".join(injuries) if injuries else "None"
        
        prompt = f"""You are an expert fitness coach and nutritionist. Create a comprehensive, personalized workout and diet plan.

**User Profile:**
- Height: {height_cm} cm
- Weight: {weight_kg} kg
- BMI: {bmi:.1f}
- Age: {age} years
- Gender: {gender}
- Experience Level: {experience_level}
- Workout Environment: {workout_type}
- Goal: {goal.replace('_', ' ').title()}
- Available Days: {days_per_week} days/week
- Injuries/Limitations: {injuries_str}

**Instructions:**
1. Analyze BMI and create appropriate plan intensity
2. Design {days_per_week}-day workout routine suitable for {workout_type}
3. Include warm-up, main workout, and cool-down for each day
4. Create a balanced diet plan aligned with the goal
5. Provide realistic progress expectations

**Output Format (Strict JSON):**
{{
  "user_profile": {{
    "bmi": {bmi:.1f},
    "bmi_category": "underweight/normal/overweight/obese",
    "fitness_assessment": "Brief assessment of current fitness level",
    "recommended_daily_calories": 2000,
    "macro_split": {{"protein": "30%", "carbs": "40%", "fat": "30%"}}
  }},
  "weekly_workout_plan": [
    {{
      "day": 1,
      "day_name": "Monday",
      "focus": "Chest & Triceps / Full Body / etc",
      "duration_minutes": 45,
      "warm_up": ["Exercise 1", "Exercise 2"],
      "main_workout": [
        {{"exercise": "Push-ups", "sets": 3, "reps": "12-15", "rest": "60s", "notes": "Keep core tight"}}
      ],
      "cool_down": ["Stretch 1", "Stretch 2"],
      "calories_burned": 300
    }}
  ],
  "diet_plan": {{
    "daily_calories": 2000,
    "meals": [
      {{
        "meal": "Breakfast",
        "time": "7:00 AM",
        "options": ["Option 1 with macros", "Option 2 with macros"],
        "calories": 500
      }}
    ],
    "hydration": "Recommended water intake",
    "supplements": ["Optional supplements if needed"],
    "foods_to_avoid": ["Foods that don't align with goal"],
    "foods_to_prioritize": ["Best foods for this goal"]
  }},
  "tips": [
    "Personalized tip 1",
    "Personalized tip 2",
    "Personalized tip 3"
  ],
  "estimated_progress": {{
    "4_weeks": "Expected changes in 4 weeks",
    "8_weeks": "Expected changes in 8 weeks",
    "12_weeks": "Expected changes in 12 weeks"
  }}
}}

Only return valid JSON, no markdown or explanation."""

        response = model.generate_content(prompt)
        
        # Parse JSON response
        result_text = response.text.strip()
        
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()
        
        data = json.loads(result_text)
        
        return WorkoutPlanResult(**data)
        
    except Exception as e:
        logger.error(f"Workout plan generation error: {e}")
        raise
