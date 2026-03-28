/**
 * Database Service - Local-First Storage
 * Uses localStorage on web, AsyncStorage on mobile
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// In-memory data store for the session
let memoryStore: Record<string, any[]> = {
  users: [],
  nutrition_targets: [],
  food_logs: [],
  water_logs: [],
  meal_plans: [],
  recipes: [],
  streaks: [],
  badges: [],
  daily_challenges: [],
  saved_recipes: []
};

const STORAGE_KEY = 'myhealthfirstai_db';

// Load data from persistent storage
const loadFromStorage = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      memoryStore = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }
};

// Save data to persistent storage
const saveToStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

export const initDatabase = async (): Promise<void> => {
  try {
    await loadFromStorage();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// ===== User Operations =====

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  workoutPlan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const saveUser = async (user: User): Promise<void> => {
  const now = new Date().toISOString();
  const index = memoryStore.users.findIndex(u => u.id === user.id);
  const userData = {
    ...user,
    createdAt: user.createdAt || now,
    updatedAt: now
  };
  if (index >= 0) {
    memoryStore.users[index] = userData;
  } else {
    memoryStore.users.push(userData);
  }
  await saveToStorage();
};

export const getUser = async (userId: string): Promise<User | null> => {
  return memoryStore.users.find(u => u.id === userId) || null;
};

// ===== Nutrition Targets =====

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export const getNutritionTargets = async (userId: string): Promise<NutritionTargets> => {
  const target = memoryStore.nutrition_targets.find(t => t.userId === userId);
  return target || {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    water: 2500
  };
};

export const saveNutritionTargets = async (userId: string, targets: NutritionTargets): Promise<void> => {
  const index = memoryStore.nutrition_targets.findIndex(t => t.userId === userId);
  const data = { ...targets, userId };
  if (index >= 0) {
    memoryStore.nutrition_targets[index] = data;
  } else {
    memoryStore.nutrition_targets.push(data);
  }
  await saveToStorage();
};

// ===== Food Logs =====

export interface FoodLog {
  id?: number;
  userId: string;
  mealType: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionSize?: string;
  imageUri?: string;
  loggedAt?: string;
  source?: string;
}

export const addFoodLog = async (log: FoodLog): Promise<number> => {
  const id = Date.now();
  memoryStore.food_logs.push({
    ...log,
    id,
    loggedAt: log.loggedAt || new Date().toISOString()
  });
  await saveToStorage();
  return id;
};

export const getFoodLogs = async (userId: string, date?: string): Promise<FoodLog[]> => {
  let logs = memoryStore.food_logs.filter(l => l.userId === userId);
  if (date) {
    logs = logs.filter(l => l.loggedAt?.startsWith(date));
  }
  return logs;
};

export const getTodayNutrition = async (userId: string): Promise<NutritionTargets> => {
  const today = new Date().toISOString().split('T')[0];
  const logs = await getFoodLogs(userId, today);
  return logs.reduce((acc, log) => ({
    calories: acc.calories + (log.calories || 0),
    protein: acc.protein + (log.protein || 0),
    carbs: acc.carbs + (log.carbs || 0),
    fat: acc.fat + (log.fat || 0),
    water: acc.water
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
};

export const deleteFoodLog = async (id: number): Promise<void> => {
  memoryStore.food_logs = memoryStore.food_logs.filter(l => l.id !== id);
  await saveToStorage();
};

// ===== Water Logs =====

export interface WaterLog {
  id?: number;
  userId: string;
  amountMl: number;
  loggedAt?: string;
}

export const addWaterLog = async (log: WaterLog): Promise<number> => {
  const id = Date.now();
  memoryStore.water_logs.push({
    ...log,
    id,
    loggedAt: log.loggedAt || new Date().toISOString()
  });
  await saveToStorage();
  return id;
};

export const getWaterLogs = async (userId: string, date?: string): Promise<WaterLog[]> => {
  let logs = memoryStore.water_logs.filter(l => l.userId === userId);
  if (date) {
    logs = logs.filter(l => l.loggedAt?.startsWith(date));
  }
  return logs;
};

export const getTodayWater = async (userId: string): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const logs = await getWaterLogs(userId, today);
  return logs.reduce((acc, log) => acc + (log.amountMl || 0), 0);
};

// ===== Meal Plans =====

export interface MealPlan {
  id?: number;
  userId: string;
  planDate: string;
  mealType: string;
  recipeName?: string;
  customMeal?: string;
  notes?: string;
}

export const saveMealPlan = async (plan: MealPlan): Promise<number> => {
  const id = Date.now();
  // Remove existing plan for same date/mealType
  memoryStore.meal_plans = memoryStore.meal_plans.filter(
    p => !(p.userId === plan.userId && p.planDate === plan.planDate && p.mealType === plan.mealType)
  );
  memoryStore.meal_plans.push({ ...plan, id });
  await saveToStorage();
  return id;
};

export const getMealPlans = async (userId: string, weekStart?: string): Promise<MealPlan[]> => {
  let plans = memoryStore.meal_plans.filter(p => p.userId === userId);
  if (weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    plans = plans.filter(p => {
      const date = new Date(p.planDate);
      return date >= start && date < end;
    });
  }
  return plans;
};

// ===== Saved Recipes =====

export interface SavedRecipe {
  id?: number;
  userId: string;
  name: string;
  ingredients: string;
  instructions: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  difficulty: string;
  createdAt?: string;
}

export const saveRecipe = async (recipe: SavedRecipe): Promise<number> => {
  const id = Date.now();
  memoryStore.saved_recipes.push({
    ...recipe,
    id,
    createdAt: new Date().toISOString()
  });
  await saveToStorage();
  return id;
};

export const getSavedRecipes = async (userId: string): Promise<SavedRecipe[]> => {
  return memoryStore.saved_recipes.filter(r => r.userId === userId);
};

export const deleteRecipe = async (id: number): Promise<void> => {
  memoryStore.saved_recipes = memoryStore.saved_recipes.filter(r => r.id !== id);
  await saveToStorage();
};

// ===== Streaks =====

export interface Streak {
  id?: number;
  userId: string;
  streakType: string;
  currentCount: number;
  bestCount: number;
  lastActivity: string;
}

export const updateStreak = async (userId: string, streakType: string): Promise<Streak> => {
  const today = new Date().toISOString().split('T')[0];
  const existing = memoryStore.streaks.find(
    s => s.userId === userId && s.streakType === streakType
  );

  if (existing) {
    const lastDate = new Date(existing.lastActivity);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already logged today
      return existing;
    } else if (diffDays === 1) {
      // Continue streak
      existing.currentCount += 1;
      existing.bestCount = Math.max(existing.bestCount, existing.currentCount);
      existing.lastActivity = today;
    } else {
      // Streak broken
      existing.currentCount = 1;
      existing.lastActivity = today;
    }
    await saveToStorage();
    return existing;
  } else {
    const newStreak: Streak = {
      id: Date.now(),
      userId,
      streakType,
      currentCount: 1,
      bestCount: 1,
      lastActivity: today
    };
    memoryStore.streaks.push(newStreak);
    await saveToStorage();
    return newStreak;
  }
};

export const getStreaks = async (userId: string): Promise<Streak[]> => {
  return memoryStore.streaks.filter(s => s.userId === userId);
};

// ===== Badges =====

export interface Badge {
  id?: number;
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  earnedAt: string;
}

export const awardBadge = async (userId: string, badge: Omit<Badge, 'id' | 'userId' | 'earnedAt'>): Promise<void> => {
  const existing = memoryStore.badges.find(
    b => b.userId === userId && b.badgeId === badge.badgeId
  );
  if (!existing) {
    memoryStore.badges.push({
      ...badge,
      id: Date.now(),
      userId,
      earnedAt: new Date().toISOString()
    });
    await saveToStorage();
  }
};

export const getBadges = async (userId: string): Promise<Badge[]> => {
  return memoryStore.badges.filter(b => b.userId === userId);
};

// ===== Daily Challenges =====

export interface DailyChallenge {
  id?: number;
  date: string;
  title: string;
  description: string;
  targetType: string;
  targetValue: number;
  xpReward: number;
  completed?: boolean;
}

export const getDailyChallenge = async (): Promise<DailyChallenge> => {
  const today = new Date().toISOString().split('T')[0];
  let challenge = memoryStore.daily_challenges.find(c => c.date === today);
  
  if (!challenge) {
    // Generate a random challenge for today
    const challenges = [
      { title: 'Water Champion', description: 'Drink 8 glasses of water', targetType: 'water', targetValue: 2000, xpReward: 50 },
      { title: 'Protein Power', description: 'Eat 100g of protein', targetType: 'protein', targetValue: 100, xpReward: 75 },
      { title: 'Calorie Counter', description: 'Log 3 meals', targetType: 'meals', targetValue: 3, xpReward: 40 },
      { title: 'Green Giant', description: 'Eat a salad today', targetType: 'salad', targetValue: 1, xpReward: 30 },
      { title: 'Low Carb Day', description: 'Keep carbs under 100g', targetType: 'carbs_under', targetValue: 100, xpReward: 60 },
    ];
    const random = challenges[Math.floor(Math.random() * challenges.length)];
    challenge = {
      id: Date.now(),
      date: today,
      ...random,
      completed: false
    };
    memoryStore.daily_challenges.push(challenge);
    await saveToStorage();
  }
  
  return challenge;
};

export const completeChallenge = async (challengeId: number): Promise<void> => {
  const challenge = memoryStore.daily_challenges.find(c => c.id === challengeId);
  if (challenge) {
    challenge.completed = true;
    await saveToStorage();
  }
};

// ===== Sync with Backend =====

export const syncWithBackend = async (userId: string, authToken: string): Promise<void> => {
  // This would sync local data with the backend API
  // For now, it's a placeholder
  console.log('Syncing with backend...');
};

// Export for testing
export const clearAllData = async (): Promise<void> => {
  memoryStore = {
    users: [],
    nutrition_targets: [],
    food_logs: [],
    water_logs: [],
    meal_plans: [],
    recipes: [],
    streaks: [],
    badges: [],
    daily_challenges: [],
    saved_recipes: []
  };
  await AsyncStorage.removeItem(STORAGE_KEY);
};
