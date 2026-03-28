/**
 * API Service - Handles all communication with FastAPI backend
 */

import { API_CONFIG } from '../constants/config';

const { BASE_URL, ENDPOINTS } = API_CONFIG;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Food Analysis Types
export interface FoodAnalysisResult {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size: string;
  confidence: number;
  suggestions?: string[];
}

// Recipe Generation Types
export interface RecipeResult {
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prep_time: number;
  difficulty: string;
}

// Enhanced Recipe Result (for ingredient-based generation)
export interface EnhancedRecipeResult {
  recipe_name: string;
  difficulty: string;
  prep_time: string;
  calories_per_serving: number;
  macros: {
    protein: string;
    carbs: string;
    fat: string;
  };
  ingredients_used: string[];
  pantry_staples_needed: string[];
  instructions: string[];
  chef_tip: string;
}

// Voice Log Types
export interface VoiceLogResult {
  transcript: string;
  parsed_foods: {
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

// Form Analysis Types
export interface FormAnalysisResult {
  exercise_detected: string;
  safety_score: number;
  feedback: {
    category: string;
    issue: string;
    suggestion: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  overall_assessment: string;
}

// Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Helper for FormData uploads (images, audio, video)
async function uploadFile<T>(
  endpoint: string,
  file: Blob | File,
  fieldName: string,
  additionalData?: Record<string, string>
): Promise<ApiResponse<T>> {
  try {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`Upload failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload error',
    };
  }
}

/**
 * Analyze food from image
 * Uses Gemini Flash for fast food detection
 */
export async function analyzeFood(
  imageBase64: string,
  userId: string
): Promise<ApiResponse<FoodAnalysisResult>> {
  return apiCall<FoodAnalysisResult>(ENDPOINTS.ANALYZE_FOOD, {
    method: 'POST',
    body: JSON.stringify({
      image: imageBase64,
      user_id: userId,
    }),
  });
}

/**
 * Chat with AI Coach
 * Uses Gemini Pro for personalized nutrition advice
 */
export async function chatWithCoach(
  messages: ChatMessage[],
  userContext?: {
    currentCalories?: number;
    targetCalories?: number;
    workoutPlan?: string;
  }
): Promise<ApiResponse<{ response: string }>> {
  return apiCall<{ response: string }>(ENDPOINTS.CHAT, {
    method: 'POST',
    body: JSON.stringify({
      messages,
      user_context: userContext,
    }),
  });
}

/**
 * Generate recipe from ingredients photo
 * Uses Gemini Pro for creative recipe generation
 */
export async function generateRecipe(
  imageBase64: string,
  preferences?: {
    dietary?: string[];
    cuisine?: string;
    maxCalories?: number;
  }
): Promise<ApiResponse<RecipeResult>> {
  return apiCall<RecipeResult>(ENDPOINTS.GENERATE_RECIPE, {
    method: 'POST',
    body: JSON.stringify({
      image: imageBase64,
      preferences,
    }),
  });
}

/**
 * Generate recipe from text list of ingredients
 * Uses enhanced prompt for goal-oriented healthy recipes
 */
export async function generateRecipeFromIngredients(
  ingredients: string[],
  userGoal: 'Weight Loss' | 'Muscle Gain' | 'Balanced' = 'Balanced',
  dietaryRestrictions?: string[]
): Promise<ApiResponse<EnhancedRecipeResult>> {
  return apiCall<EnhancedRecipeResult>('/recipes/generate-from-ingredients', {
    method: 'POST',
    body: JSON.stringify({
      ingredients,
      user_goal: userGoal,
      dietary_restrictions: dietaryRestrictions,
    }),
  });
}

/**
 * Process voice log
 * Transcribes audio and extracts food data
 */
export async function processVoiceLog(
  audioBase64: string,
  audioFormat: string = 'webm'
): Promise<ApiResponse<VoiceLogResult>> {
  return apiCall<VoiceLogResult>(ENDPOINTS.VOICE_LOG, {
    method: 'POST',
    body: JSON.stringify({
      audio: audioBase64,
      audio_format: audioFormat,
    }),
  });
}

/**
 * Analyze workout form from video
 * Uses Gemini Pro Vision for form analysis
 */
export async function analyzeWorkoutForm(
  videoBase64: string,
  exerciseType?: string
): Promise<ApiResponse<FormAnalysisResult>> {
  return apiCall<FormAnalysisResult>(ENDPOINTS.ANALYZE_FORM, {
    method: 'POST',
    body: JSON.stringify({
      video: videoBase64,
      exercise_type: exerciseType,
    }),
  });
}

/**
 * Check daily AI usage limit
 */
export async function checkDailyLimit(
  userId: string,
  featureType: 'scan' | 'voice' | 'form'
): Promise<ApiResponse<{ allowed: boolean; remaining: number }>> {
  return apiCall<{ allowed: boolean; remaining: number }>(ENDPOINTS.CHECK_LIMIT, {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      feature_type: featureType,
    }),
  });
}

/**
 * Get diet adjustment based on workout plan
 */
export async function getDietAdjustment(
  currentTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  },
  workoutPlan: string
): Promise<ApiResponse<{
  adjusted_calories: number;
  adjusted_protein: number;
  adjusted_carbs: number;
  adjusted_fat: number;
  recommendations: string[];
}>> {
  return apiCall(ENDPOINTS.DIET_ADJUSTMENT, {
    method: 'POST',
    body: JSON.stringify({
      current_targets: currentTargets,
      workout_plan: workoutPlan,
    }),
  });
}

/**
 * Check and award badges
 */
export async function checkBadges(
  userId: string,
  eventType: string,
  eventValue?: number
): Promise<ApiResponse<{
  new_badges: {
    id: number;
    name: string;
    icon: string;
    points: number;
  }[];
}>> {
  return apiCall(ENDPOINTS.CHECK_BADGES, {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      event_type: eventType,
      event_value: eventValue,
    }),
  });
}

// Workout Plan Types
export interface WorkoutPlanResult {
  user_profile: {
    bmi: number;
    bmi_category: string;
    fitness_assessment: string;
    recommended_daily_calories: number;
    macro_split: { protein: string; carbs: string; fat: string };
    // Target weight fields
    target_weight?: number;
    current_weight?: number;
    weight_goal?: 'lose' | 'gain';
    weekly_target?: number;
  };
  weekly_workout_plan: {
    day: number;
    day_name: string;
    focus: string;
    duration_minutes: number;
    warm_up: string[];
    main_workout: {
      exercise: string;
      sets: number;
      reps: string;
      rest: string;
      notes?: string;
    }[];
    cool_down: string[];
    calories_burned: number;
  }[];
  diet_plan: {
    daily_calories: number;
    meals: {
      meal: string;
      time: string;
      options: string[];
      calories: number;
    }[];
    hydration: string;
    supplements: string[];
    foods_to_avoid: string[];
    foods_to_prioritize: string[];
  };
  tips: string[];
  estimated_progress: {
    '4_weeks': string;
    '8_weeks': string;
    '12_weeks': string;
  };
}

export interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  recommendation: string;
  healthy_weight_range: { min: number; max: number };
}

/**
 * Calculate BMI
 */
export async function calculateBMI(
  height_cm: number,
  weight_kg: number
): Promise<ApiResponse<BMIResult>> {
  return apiCall<BMIResult>(`/api/workout/bmi-calculate?height_cm=${height_cm}&weight_kg=${weight_kg}`, {
    method: 'GET',
  });
}

/**
 * Generate personalized workout and diet plan
 */
export async function generateWorkoutPlan(params: {
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: string;
  experience_level: string;
  workout_type: string;
  goal: string;
  days_per_week: number;
  injuries?: string[];
}): Promise<ApiResponse<WorkoutPlanResult>> {
  return apiCall<WorkoutPlanResult>('/api/workout/generate-plan', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export default {
  analyzeFood,
  chatWithCoach,
  generateRecipe,
  processVoiceLog,
  analyzeWorkoutForm,
  checkDailyLimit,
  getDietAdjustment,
  checkBadges,
  calculateBMI,
  generateWorkoutPlan,
};
