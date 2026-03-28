/**
 * MyHealthFirstAI - App Configuration
 */

import { Platform } from 'react-native';

// Determine the correct API URL based on platform
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://api.myhealthfirstai.com';
  }
  // In development, use appropriate localhost
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000';
  }
  // For mobile emulators/devices
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000'; // Android emulator
  }
  return 'http://localhost:8000'; // iOS simulator
};

export const API_CONFIG = {
  // Backend API URL - change for production
  BASE_URL: getApiBaseUrl(),
  
  // API Endpoints - Must match backend router prefixes
  ENDPOINTS: {
    // Food Analysis - /api/food router
    ANALYZE_FOOD: '/api/food/analyze',
    
    // AI Coach - /api/chat router
    CHAT: '/api/chat/message',
    
    // Recipe Generation - /api/recipes router
    GENERATE_RECIPE: '/api/recipes/generate',
    
    // Voice Logging - /api/voice router
    VOICE_LOG: '/api/voice/analyze',
    
    // Form Correction - /api/form router
    ANALYZE_FORM: '/api/form/analyze',
    
    // Subscription - /api/subscription router
    SUBSCRIPTION: '/api/subscription',
    CHECK_LIMIT: '/api/subscription/check-limit',
    
    // Badges
    CHECK_BADGES: '/api/subscription/check-badges',
    
    // Diet Adjustment
    DIET_ADJUSTMENT: '/api/food/diet-adjustment',
  },
};

export const SUBSCRIPTION_CONFIG = {
  // Freemium limits
  FREE_DAILY_SCANS: 3,
  FREE_DAILY_VOICE_LOGS: 0,  // Voice logging is Pro only
  FREE_FORM_CORRECTIONS: 0,  // Form correction is Pro only
  
  // Pro tier benefits
  PRO_UNLIMITED_SCANS: true,
  PRO_VOICE_LOGGING: true,
  PRO_FORM_CORRECTION: true,
  
  // Pricing
  PRO_MONTHLY_PRICE: 9.99,
  PRO_YEARLY_PRICE: 79.99,
  
  // RevenueCat (Mock)
  REVENUECAT_API_KEY_IOS: 'appl_mock_key_ios',
  REVENUECAT_API_KEY_ANDROID: 'goog_mock_key_android',
};

export const GAMIFICATION_CONFIG = {
  // Streak milestones
  STREAK_MILESTONES: [3, 7, 14, 30, 60, 100, 365],
  
  // Badge categories
  BADGE_CATEGORIES: {
    LOGGING: 'logging',
    STREAKS: 'streaks',
    HYDRATION: 'hydration',
    NUTRITION: 'nutrition',
    WORKOUTS: 'workouts',
    SOCIAL: 'social',
  },
  
  // Daily challenge types
  CHALLENGE_TYPES: [
    'log_all_meals',
    'hit_protein_goal',
    'drink_water_goal',
    'complete_workout',
    'try_new_recipe',
  ],
};

export const NUTRITION_CONFIG = {
  // Default macro targets (can be customized)
  DEFAULT_CALORIES: 2000,
  DEFAULT_PROTEIN: 150,  // grams
  DEFAULT_CARBS: 200,    // grams
  DEFAULT_FAT: 65,       // grams
  DEFAULT_WATER: 2500,   // ml
  
  // Workout adjustments
  WORKOUT_MULTIPLIERS: {
    sedentary: 1.0,
    light: 1.2,
    moderate: 1.4,
    active: 1.6,
    bulking: 1.8,
    cutting: 0.85,
  },
};
