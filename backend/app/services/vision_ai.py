"""
Multi-Modal Vision AI Service
Integrates multiple AI providers for food recognition:
1. Google Gemini (primary)
2. Hugging Face (fallback 1)
3. Clarifai (fallback 2)
"""

import httpx
import base64
import json
import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)


class FoodDetectionResult(BaseModel):
    """Unified food detection result from any AI provider"""
    food_name: str
    calories: int
    protein: float
    carbs: float
    fat: float
    portion_size: str
    confidence: float
    cuisine: str = "Unknown"
    ingredients: List[str] = []
    suggestions: List[str] = []
    provider: str = "unknown"  # Which AI detected this


# ============================================
# HUGGING FACE INTEGRATION
# ============================================

HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/"

# Food classification models on Hugging Face (updated Dec 2025)
HF_FOOD_MODELS = [
    "Kaludi/food-category-classification-v2.0",  # Food categories
    "rajistics/finetuned-resnet50-food101",  # Food-101 classifier
    "dima806/indian_food_image_detection",  # Food detector
]

# Nutrition database for common foods (Food-101 classes)
FOOD_NUTRITION_DB: Dict[str, Dict[str, Any]] = {
    # American / Burgers & Sandwiches
    "hamburger": {"calories": 550, "protein": 30, "carbs": 40, "fat": 32, "cuisine": "American"},
    "burger": {"calories": 550, "protein": 30, "carbs": 40, "fat": 32, "cuisine": "American"},
    "cheeseburger": {"calories": 600, "protein": 32, "carbs": 42, "fat": 35, "cuisine": "American"},
    "beef_burger": {"calories": 550, "protein": 30, "carbs": 40, "fat": 32, "cuisine": "American"},
    "veggie_burger": {"calories": 380, "protein": 18, "carbs": 45, "fat": 16, "cuisine": "American"},
    "sandwich": {"calories": 450, "protein": 22, "carbs": 48, "fat": 20, "cuisine": "American"},
    "hot_dog": {"calories": 290, "protein": 11, "carbs": 24, "fat": 17, "cuisine": "American"},
    "french_fries": {"calories": 365, "protein": 4, "carbs": 48, "fat": 17, "cuisine": "American"},
    "fries": {"calories": 365, "protein": 4, "carbs": 48, "fat": 17, "cuisine": "American"},
    "steak": {"calories": 679, "protein": 62, "carbs": 0, "fat": 48, "cuisine": "American"},
    "grilled_cheese_sandwich": {"calories": 440, "protein": 17, "carbs": 30, "fat": 28, "cuisine": "American"},
    "club_sandwich": {"calories": 520, "protein": 32, "carbs": 42, "fat": 26, "cuisine": "American"},
    "pulled_pork_sandwich": {"calories": 580, "protein": 35, "carbs": 48, "fat": 28, "cuisine": "American"},
    "lobster_roll_sandwich": {"calories": 450, "protein": 22, "carbs": 35, "fat": 24, "cuisine": "American"},
    "apple_pie": {"calories": 296, "protein": 2, "carbs": 43, "fat": 14, "cuisine": "American"},
    "cheesecake": {"calories": 401, "protein": 6, "carbs": 32, "fat": 28, "cuisine": "American"},
    "ice_cream": {"calories": 207, "protein": 4, "carbs": 24, "fat": 11, "cuisine": "American"},
    "donuts": {"calories": 452, "protein": 5, "carbs": 51, "fat": 25, "cuisine": "American"},
    "pancakes": {"calories": 520, "protein": 14, "carbs": 68, "fat": 22, "cuisine": "American"},
    "waffles": {"calories": 480, "protein": 12, "carbs": 58, "fat": 22, "cuisine": "American"},
    "breakfast_burrito": {"calories": 580, "protein": 28, "carbs": 55, "fat": 28, "cuisine": "American"},
    "macaroni_and_cheese": {"calories": 450, "protein": 18, "carbs": 52, "fat": 22, "cuisine": "American"},
    "chicken_wings": {"calories": 480, "protein": 35, "carbs": 18, "fat": 30, "cuisine": "American"},
    "fried_chicken": {"calories": 480, "protein": 35, "carbs": 18, "fat": 30, "cuisine": "American"},
    "caesar_salad": {"calories": 350, "protein": 20, "carbs": 12, "fat": 26, "cuisine": "American"},
    "nachos": {"calories": 480, "protein": 15, "carbs": 45, "fat": 28, "cuisine": "Mexican"},
    
    # Italian
    "pizza": {"calories": 266, "protein": 11, "carbs": 33, "fat": 10, "cuisine": "Italian"},
    "spaghetti_bolognese": {"calories": 520, "protein": 24, "carbs": 65, "fat": 18, "cuisine": "Italian"},
    "spaghetti_carbonara": {"calories": 580, "protein": 22, "carbs": 62, "fat": 28, "cuisine": "Italian"},
    "lasagna": {"calories": 580, "protein": 28, "carbs": 42, "fat": 32, "cuisine": "Italian"},
    "ravioli": {"calories": 420, "protein": 18, "carbs": 48, "fat": 18, "cuisine": "Italian"},
    "risotto": {"calories": 380, "protein": 12, "carbs": 58, "fat": 14, "cuisine": "Italian"},
    "gnocchi": {"calories": 380, "protein": 8, "carbs": 55, "fat": 14, "cuisine": "Italian"},
    "bruschetta": {"calories": 180, "protein": 4, "carbs": 22, "fat": 8, "cuisine": "Italian"},
    "caprese_salad": {"calories": 280, "protein": 14, "carbs": 8, "fat": 22, "cuisine": "Italian"},
    "tiramisu": {"calories": 450, "protein": 8, "carbs": 52, "fat": 24, "cuisine": "Italian"},
    "panna_cotta": {"calories": 340, "protein": 4, "carbs": 28, "fat": 24, "cuisine": "Italian"},
    "cannoli": {"calories": 380, "protein": 8, "carbs": 42, "fat": 20, "cuisine": "Italian"},
    
    # Japanese
    "sushi": {"calories": 350, "protein": 18, "carbs": 45, "fat": 12, "cuisine": "Japanese"},
    "sashimi": {"calories": 180, "protein": 28, "carbs": 2, "fat": 6, "cuisine": "Japanese"},
    "ramen": {"calories": 520, "protein": 25, "carbs": 58, "fat": 22, "cuisine": "Japanese"},
    "miso_soup": {"calories": 84, "protein": 6, "carbs": 8, "fat": 3, "cuisine": "Japanese"},
    "edamame": {"calories": 120, "protein": 11, "carbs": 10, "fat": 5, "cuisine": "Japanese"},
    "gyoza": {"calories": 280, "protein": 14, "carbs": 32, "fat": 12, "cuisine": "Japanese"},
    "takoyaki": {"calories": 320, "protein": 12, "carbs": 38, "fat": 14, "cuisine": "Japanese"},
    "tempura": {"calories": 380, "protein": 15, "carbs": 35, "fat": 22, "cuisine": "Japanese"},
    
    # Chinese
    "fried_rice": {"calories": 420, "protein": 12, "carbs": 58, "fat": 16, "cuisine": "Chinese"},
    "spring_rolls": {"calories": 220, "protein": 6, "carbs": 28, "fat": 10, "cuisine": "Chinese"},
    "dumplings": {"calories": 280, "protein": 14, "carbs": 32, "fat": 12, "cuisine": "Chinese"},
    "hot_and_sour_soup": {"calories": 120, "protein": 8, "carbs": 12, "fat": 5, "cuisine": "Chinese"},
    "wonton_soup": {"calories": 180, "protein": 12, "carbs": 18, "fat": 6, "cuisine": "Chinese"},
    "kung_pao_chicken": {"calories": 450, "protein": 32, "carbs": 25, "fat": 26, "cuisine": "Chinese"},
    "sweet_and_sour_pork": {"calories": 480, "protein": 22, "carbs": 45, "fat": 24, "cuisine": "Chinese"},
    "peking_duck": {"calories": 420, "protein": 25, "carbs": 15, "fat": 30, "cuisine": "Chinese"},
    
    # Indian
    "samosa": {"calories": 310, "protein": 6, "carbs": 32, "fat": 18, "cuisine": "Indian"},
    "butter_chicken": {"calories": 480, "protein": 32, "carbs": 22, "fat": 30, "cuisine": "Indian"},
    "chicken_curry": {"calories": 450, "protein": 32, "carbs": 20, "fat": 28, "cuisine": "Indian"},
    "biryani": {"calories": 550, "protein": 28, "carbs": 68, "fat": 20, "cuisine": "Indian"},
    "naan": {"calories": 260, "protein": 8, "carbs": 45, "fat": 6, "cuisine": "Indian"},
    "pakora": {"calories": 280, "protein": 8, "carbs": 28, "fat": 16, "cuisine": "Indian"},
    "dal": {"calories": 220, "protein": 14, "carbs": 32, "fat": 6, "cuisine": "Indian"},
    
    # Mexican
    "tacos": {"calories": 340, "protein": 18, "carbs": 28, "fat": 18, "cuisine": "Mexican"},
    "burrito": {"calories": 580, "protein": 28, "carbs": 65, "fat": 22, "cuisine": "Mexican"},
    "quesadilla": {"calories": 490, "protein": 24, "carbs": 38, "fat": 26, "cuisine": "Mexican"},
    "enchiladas": {"calories": 420, "protein": 22, "carbs": 38, "fat": 20, "cuisine": "Mexican"},
    "guacamole": {"calories": 160, "protein": 2, "carbs": 9, "fat": 15, "cuisine": "Mexican"},
    "churros": {"calories": 280, "protein": 4, "carbs": 38, "fat": 14, "cuisine": "Mexican"},
    "ceviche": {"calories": 180, "protein": 22, "carbs": 12, "fat": 5, "cuisine": "Mexican"},
    
    # Thai
    "pad_thai": {"calories": 450, "protein": 18, "carbs": 55, "fat": 18, "cuisine": "Thai"},
    "green_curry": {"calories": 420, "protein": 25, "carbs": 18, "fat": 30, "cuisine": "Thai"},
    "red_curry": {"calories": 420, "protein": 25, "carbs": 18, "fat": 30, "cuisine": "Thai"},
    "tom_yum_soup": {"calories": 180, "protein": 15, "carbs": 12, "fat": 8, "cuisine": "Thai"},
    "thai_fried_rice": {"calories": 480, "protein": 16, "carbs": 62, "fat": 18, "cuisine": "Thai"},
    
    # Vietnamese
    "pho": {"calories": 380, "protein": 28, "carbs": 45, "fat": 10, "cuisine": "Vietnamese"},
    "banh_mi": {"calories": 420, "protein": 22, "carbs": 48, "fat": 16, "cuisine": "Vietnamese"},
    "spring_roll": {"calories": 180, "protein": 12, "carbs": 24, "fat": 4, "cuisine": "Vietnamese"},
    
    # Korean
    "bibimbap": {"calories": 520, "protein": 25, "carbs": 68, "fat": 18, "cuisine": "Korean"},
    "korean_bbq": {"calories": 580, "protein": 45, "carbs": 15, "fat": 38, "cuisine": "Korean"},
    "kimchi": {"calories": 40, "protein": 2, "carbs": 6, "fat": 1, "cuisine": "Korean"},
    
    # French
    "croissant": {"calories": 280, "protein": 5, "carbs": 32, "fat": 15, "cuisine": "French"},
    "crepes": {"calories": 350, "protein": 10, "carbs": 45, "fat": 15, "cuisine": "French"},
    "french_onion_soup": {"calories": 280, "protein": 12, "carbs": 22, "fat": 16, "cuisine": "French"},
    "quiche": {"calories": 380, "protein": 14, "carbs": 25, "fat": 26, "cuisine": "French"},
    "escargots": {"calories": 180, "protein": 16, "carbs": 2, "fat": 12, "cuisine": "French"},
    "creme_brulee": {"calories": 380, "protein": 5, "carbs": 35, "fat": 24, "cuisine": "French"},
    "macarons": {"calories": 180, "protein": 2, "carbs": 28, "fat": 8, "cuisine": "French"},
    
    # Middle Eastern
    "falafel": {"calories": 340, "protein": 14, "carbs": 42, "fat": 15, "cuisine": "Middle Eastern"},
    "hummus": {"calories": 180, "protein": 8, "carbs": 18, "fat": 10, "cuisine": "Middle Eastern"},
    "shawarma": {"calories": 520, "protein": 35, "carbs": 42, "fat": 24, "cuisine": "Middle Eastern"},
    "kebab": {"calories": 450, "protein": 38, "carbs": 8, "fat": 30, "cuisine": "Middle Eastern"},
    "tabbouleh": {"calories": 120, "protein": 4, "carbs": 18, "fat": 5, "cuisine": "Middle Eastern"},
    "baklava": {"calories": 420, "protein": 6, "carbs": 52, "fat": 22, "cuisine": "Middle Eastern"},
    
    # Spanish
    "paella": {"calories": 520, "protein": 28, "carbs": 58, "fat": 20, "cuisine": "Spanish"},
    "tapas": {"calories": 350, "protein": 12, "carbs": 35, "fat": 18, "cuisine": "Spanish"},
    "gazpacho": {"calories": 80, "protein": 2, "carbs": 12, "fat": 3, "cuisine": "Spanish"},
    
    # General / Healthy
    "salad": {"calories": 180, "protein": 8, "carbs": 15, "fat": 10, "cuisine": "General"},
    "grilled_salmon": {"calories": 420, "protein": 46, "carbs": 0, "fat": 25, "cuisine": "General"},
    "grilled_chicken": {"calories": 280, "protein": 45, "carbs": 0, "fat": 10, "cuisine": "General"},
    "omelette": {"calories": 280, "protein": 18, "carbs": 2, "fat": 22, "cuisine": "General"},
    "eggs_benedict": {"calories": 520, "protein": 22, "carbs": 28, "fat": 36, "cuisine": "General"},
    "soup": {"calories": 150, "protein": 8, "carbs": 18, "fat": 5, "cuisine": "General"},
    "sandwich": {"calories": 380, "protein": 18, "carbs": 42, "fat": 16, "cuisine": "General"},
    "fish_and_chips": {"calories": 680, "protein": 32, "carbs": 65, "fat": 35, "cuisine": "British"},
    "greek_salad": {"calories": 250, "protein": 8, "carbs": 12, "fat": 20, "cuisine": "Greek"},
    "oysters": {"calories": 120, "protein": 12, "carbs": 6, "fat": 4, "cuisine": "General"},
    "lobster": {"calories": 180, "protein": 28, "carbs": 0, "fat": 6, "cuisine": "General"},
    "crab_cakes": {"calories": 320, "protein": 18, "carbs": 18, "fat": 20, "cuisine": "American"},
    "clam_chowder": {"calories": 280, "protein": 12, "carbs": 22, "fat": 16, "cuisine": "American"},
    "foie_gras": {"calories": 460, "protein": 12, "carbs": 2, "fat": 45, "cuisine": "French"},
    "beef_tartare": {"calories": 280, "protein": 28, "carbs": 4, "fat": 16, "cuisine": "French"},
    "chocolate_cake": {"calories": 450, "protein": 5, "carbs": 55, "fat": 24, "cuisine": "General"},
    "carrot_cake": {"calories": 420, "protein": 5, "carbs": 52, "fat": 22, "cuisine": "General"},
    "red_velvet_cake": {"calories": 420, "protein": 5, "carbs": 55, "fat": 20, "cuisine": "American"},
    "cupcake": {"calories": 280, "protein": 3, "carbs": 42, "fat": 12, "cuisine": "General"},
    "chocolate_mousse": {"calories": 320, "protein": 5, "carbs": 28, "fat": 22, "cuisine": "French"},
    "frozen_yogurt": {"calories": 180, "protein": 5, "carbs": 32, "fat": 4, "cuisine": "General"},
    "bread_pudding": {"calories": 380, "protein": 8, "carbs": 52, "fat": 16, "cuisine": "British"},
    "beignets": {"calories": 320, "protein": 5, "carbs": 42, "fat": 15, "cuisine": "French"},
    "strawberry_shortcake": {"calories": 350, "protein": 4, "carbs": 48, "fat": 16, "cuisine": "American"},
    "cup_cakes": {"calories": 280, "protein": 3, "carbs": 42, "fat": 12, "cuisine": "General"},
    "deviled_eggs": {"calories": 180, "protein": 12, "carbs": 2, "fat": 14, "cuisine": "American"},
    "huevos_rancheros": {"calories": 420, "protein": 18, "carbs": 35, "fat": 24, "cuisine": "Mexican"},
    "french_toast": {"calories": 380, "protein": 12, "carbs": 45, "fat": 18, "cuisine": "French"},
    "oatmeal": {"calories": 280, "protein": 10, "carbs": 48, "fat": 6, "cuisine": "General"},
    "granola": {"calories": 380, "protein": 10, "carbs": 55, "fat": 14, "cuisine": "General"},
    "fruit_salad": {"calories": 120, "protein": 2, "carbs": 28, "fat": 1, "cuisine": "General"},
    "smoothie": {"calories": 280, "protein": 8, "carbs": 52, "fat": 5, "cuisine": "General"},
    "acai_bowl": {"calories": 380, "protein": 8, "carbs": 65, "fat": 12, "cuisine": "Brazilian"},
}


async def analyze_with_huggingface(image_base64: str, api_key: str) -> Optional[FoodDetectionResult]:
    """
    Analyze food image using Hugging Face food classification models.
    Tries multiple models until one succeeds.
    """
    try:
        # Decode base64 if it has a data URL prefix
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        image_bytes = base64.b64decode(image_base64)
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/octet-stream"
        }
        
        # Try each model until one works
        async with httpx.AsyncClient(timeout=30.0) as client:
            for model_name in HF_FOOD_MODELS:
                try:
                    response = await client.post(
                        f"{HUGGING_FACE_API_URL}{model_name}",
                        headers=headers,
                        content=image_bytes
                    )
                    
                    if response.status_code == 200:
                        results = response.json()
                        
                        if results and len(results) > 0:
                            # Get the top prediction
                            top_result = results[0]
                            food_label = top_result.get("label", "").lower().replace(" ", "_").replace("-", "_")
                            confidence = top_result.get("score", 0.5)
                            
                            # Look up nutrition data
                            nutrition = FOOD_NUTRITION_DB.get(food_label, {
                                "calories": 350,
                                "protein": 15,
                                "carbs": 40,
                                "fat": 15,
                                "cuisine": "Unknown"
                            })
                            
                            # Format food name nicely
                            food_name = food_label.replace("_", " ").title()
                            
                            logger.info(f"Hugging Face ({model_name}) detected: {food_name} ({confidence:.2%})")
                            
                            return FoodDetectionResult(
                                food_name=food_name,
                                calories=nutrition["calories"],
                                protein=nutrition["protein"],
                                carbs=nutrition["carbs"],
                                fat=nutrition["fat"],
                                portion_size="Standard serving (estimated)",
                                confidence=confidence,
                                cuisine=nutrition.get("cuisine", "Unknown"),
                                ingredients=[],
                                suggestions=get_food_suggestions(food_name, nutrition),
                                provider=f"Hugging Face ({model_name.split('/')[-1]})"
                            )
                    else:
                        logger.warning(f"HF model {model_name} returned {response.status_code}")
                except Exception as model_error:
                    logger.warning(f"HF model {model_name} failed: {model_error}")
                    continue
            
            logger.warning(f"Hugging Face API returned {response.status_code}: {response.text[:200]}")
            return None
            
    except Exception as e:
        logger.error(f"Hugging Face analysis error: {e}")
        return None


# ============================================
# CLARIFAI INTEGRATION
# ============================================

# Clarifai full URL with version ID for food-item-recognition model
CLARIFAI_FOOD_URL = "https://api.clarifai.com/v2/users/clarifai/apps/main/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs"


async def analyze_with_clarifai(image_base64: str, api_key: str) -> Optional[FoodDetectionResult]:
    """
    Analyze food image using Clarifai Food Recognition model.
    Returns detailed food detection with nutrition estimates.
    """
    try:
        # Clean base64 if needed
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        headers = {
            "Authorization": f"Key {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": [
                {
                    "data": {
                        "image": {
                            "base64": image_base64
                        }
                    }
                }
            ]
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                CLARIFAI_FOOD_URL,
                headers=headers,
                json=payload
            )
            
            logger.info(f"Clarifai response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                outputs = data.get("outputs", [])
                if outputs and len(outputs) > 0:
                    concepts = outputs[0].get("data", {}).get("concepts", [])
                    
                    if concepts and len(concepts) > 0:
                        # Get top prediction
                        top = concepts[0]
                        food_label = top.get("name", "").lower().replace(" ", "_")
                        confidence = top.get("value", 0.5)
                        
                        # Get nutrition data
                        nutrition = FOOD_NUTRITION_DB.get(food_label, {
                            "calories": 350,
                            "protein": 15,
                            "carbs": 40,
                            "fat": 15,
                            "cuisine": "Unknown"
                        })
                        
                        food_name = food_label.replace("_", " ").title()
                        
                        return FoodDetectionResult(
                            food_name=food_name,
                            calories=nutrition["calories"],
                            protein=nutrition["protein"],
                            carbs=nutrition["carbs"],
                            fat=nutrition["fat"],
                            portion_size="Standard serving (estimated)",
                            confidence=confidence,
                            cuisine=nutrition.get("cuisine", "Unknown"),
                            ingredients=[c.get("name", "") for c in concepts[1:6]],
                            suggestions=get_food_suggestions(food_name, nutrition),
                            provider="Clarifai"
                        )
            
            logger.warning(f"Clarifai API returned {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"Clarifai analysis error: {e}")
        return None


# ============================================
# UNIFIED MULTI-MODAL ANALYSIS
# ============================================

async def analyze_food_multimodal(
    image_base64: str,
    gemini_key: Optional[str] = None,
    huggingface_key: Optional[str] = None,
    clarifai_key: Optional[str] = None
) -> FoodDetectionResult:
    """
    Analyze food image using multiple AI providers.
    Tries each provider in order until one succeeds.
    
    Priority:
    1. Google Gemini (most accurate for food)
    2. Hugging Face (free, good accuracy)
    3. Clarifai (reliable, detailed)
    4. Fallback to common food estimate
    """
    
    # Try Gemini first (if available)
    if gemini_key:
        try:
            from app.services.gemini_ai import analyze_food_image
            result = await analyze_food_image(image_base64)
            if result:
                return FoodDetectionResult(
                    food_name=result.food_name,
                    calories=result.calories,
                    protein=result.protein,
                    carbs=result.carbs,
                    fat=result.fat,
                    portion_size=result.portion_size,
                    confidence=result.confidence,
                    suggestions=[],
                    provider="Google Gemini"
                )
        except Exception as e:
            logger.warning(f"Gemini failed: {e}")
    
    # Try Hugging Face
    if huggingface_key:
        result = await analyze_with_huggingface(image_base64, huggingface_key)
        if result:
            return result
    
    # Try Clarifai
    if clarifai_key:
        result = await analyze_with_clarifai(image_base64, clarifai_key)
        if result:
            return result
    
    # Fallback - return a common food estimate
    logger.warning("All AI providers failed, using fallback")
    return FoodDetectionResult(
        food_name="Mixed Meal",
        calories=450,
        protein=20,
        carbs=45,
        fat=20,
        portion_size="Standard serving",
        confidence=0.5,
        cuisine="Unknown",
        suggestions=[
            "For accurate detection, please configure an AI API key",
            "Supported: Gemini, Hugging Face, or Clarifai"
        ],
        provider="Fallback"
    )


def get_food_suggestions(food_name: str, nutrition: Dict[str, Any]) -> List[str]:
    """Generate helpful suggestions based on the detected food."""
    suggestions = []
    
    calories = nutrition.get("calories", 0)
    protein = nutrition.get("protein", 0)
    carbs = nutrition.get("carbs", 0)
    fat = nutrition.get("fat", 0)
    
    # Calorie-based suggestions
    if calories > 600:
        suggestions.append("High calorie meal - consider sharing or saving half")
    elif calories < 200:
        suggestions.append("Light meal - add protein for sustained energy")
    
    # Protein suggestions
    if protein > 35:
        suggestions.append("Excellent protein source for muscle recovery!")
    elif protein < 10:
        suggestions.append("Consider adding a protein source")
    
    # Carb suggestions
    if carbs > 60:
        suggestions.append("High in carbs - great for pre-workout energy")
    
    # Fat suggestions
    if fat > 35:
        suggestions.append("High in fat - balance with lighter meals today")
    
    # If no specific suggestions, add general ones
    if not suggestions:
        suggestions.append("Balanced meal choice!")
        suggestions.append("Remember to stay hydrated")
    
    return suggestions[:3]  # Return max 3 suggestions


# ============================================
# MULTIMODAL VISION SERVICE CLASS
# ============================================

class MultiModalVisionService:
    """
    Multi-modal AI service for food recognition.
    Combines Hugging Face, Clarifai, and Gemini with automatic fallback.
    """
    
    def __init__(self):
        """Initialize the service with API keys from settings."""
        self.gemini_key = getattr(settings, 'GEMINI_API_KEY', '') or ''
        self.huggingface_key = getattr(settings, 'HUGGINGFACE_API_KEY', '') or ''
        self.clarifai_key = getattr(settings, 'CLARIFAI_PAT', '') or ''
        
        logger.info(
            f"MultiModalVisionService initialized - "
            f"Gemini: {'✓' if self.gemini_key else '✗'}, "
            f"HuggingFace: {'✓' if self.huggingface_key else '✗'}, "
            f"Clarifai: {'✓' if self.clarifai_key else '✗'}"
        )
    
    async def analyze_with_fallback(self, image_base64: str) -> Dict[str, Any]:
        """
        Analyze food image using available AI providers with fallback.
        
        Returns a dictionary with food information.
        """
        result = await analyze_food_multimodal(
            image_base64=image_base64,
            gemini_key=self.gemini_key,
            huggingface_key=self.huggingface_key,
            clarifai_key=self.clarifai_key
        )
        
        # Convert FoodDetectionResult to dict
        if isinstance(result, FoodDetectionResult):
            return {
                "food_name": result.food_name,
                "calories": result.calories,
                "protein": result.protein,
                "carbs": result.carbs,
                "fat": result.fat,
                "portion_size": result.portion_size,
                "confidence": result.confidence,
                "cuisine": result.cuisine,
                "ingredients": result.ingredients,
                "suggestions": result.suggestions,
                "provider": result.provider,
                "health_score": self._calculate_health_score(result),
                "detected_items": result.ingredients[:5] if result.ingredients else []
            }
        
        return result if isinstance(result, dict) else {}
    
    def _calculate_health_score(self, result: FoodDetectionResult) -> int:
        """Calculate a health score from 1-10 based on nutrition."""
        score = 5  # Start with average
        
        # Protein bonus
        if result.protein > 20:
            score += 1
        if result.protein > 35:
            score += 1
        
        # Calorie adjustments
        if result.calories < 400:
            score += 1
        elif result.calories > 700:
            score -= 1
        
        # Fat penalty for high fat
        if result.fat > 35:
            score -= 1
        
        # Ensure bounds
        return max(1, min(10, score))
