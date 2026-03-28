/**
 * UserContext - Manages user profile, nutrition targets, and workout plan
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NUTRITION_CONFIG } from '../constants/config';

// Types
export type WorkoutPlan = 'sedentary' | 'light' | 'moderate' | 'active' | 'bulking' | 'cutting' | 'maintenance';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export interface DailyProgress {
  date: string;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  waterConsumed: number;
}

export interface UserState {
  profile: UserProfile | null;
  workoutPlan: WorkoutPlan;
  baseTargets: NutritionTargets;
  adjustedTargets: NutritionTargets;
  todayProgress: DailyProgress;
  currentStreak: number;
  longestStreak: number;
}

interface UserContextType extends UserState {
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setWorkoutPlan: (plan: WorkoutPlan) => Promise<void>;
  updateBaseTargets: (targets: Partial<NutritionTargets>) => Promise<void>;
  logFood: (nutrition: Partial<DailyProgress>) => Promise<void>;
  logWater: (amount: number) => Promise<void>;
  resetDailyProgress: () => Promise<void>;
  incrementStreak: () => Promise<void>;
  resetStreak: () => Promise<void>;
}

const defaultTargets: NutritionTargets = {
  calories: NUTRITION_CONFIG.DEFAULT_CALORIES,
  protein: NUTRITION_CONFIG.DEFAULT_PROTEIN,
  carbs: NUTRITION_CONFIG.DEFAULT_CARBS,
  fat: NUTRITION_CONFIG.DEFAULT_FAT,
  water: NUTRITION_CONFIG.DEFAULT_WATER,
};

const defaultProgress: DailyProgress = {
  date: new Date().toDateString(),
  caloriesConsumed: 0,
  proteinConsumed: 0,
  carbsConsumed: 0,
  fatConsumed: 0,
  waterConsumed: 0,
};

const defaultState: UserState = {
  profile: null,
  workoutPlan: 'moderate',
  baseTargets: defaultTargets,
  adjustedTargets: defaultTargets,
  todayProgress: defaultProgress,
  currentStreak: 0,
  longestStreak: 0,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_STATE: '@user_state',
  DAILY_PROGRESS: '@daily_progress',
  STREAK_DATA: '@streak_data',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(defaultState);

  useEffect(() => {
    loadUserState();
  }, []);

  const loadUserState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATE);
      const savedProgress = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
      const savedStreak = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA);

      let newState = { ...defaultState };

      if (savedState) {
        const parsed = JSON.parse(savedState);
        newState = { ...newState, ...parsed };
        
        // Recalculate adjusted targets based on workout plan
        newState.adjustedTargets = calculateAdjustedTargets(
          parsed.baseTargets || defaultTargets,
          parsed.workoutPlan || 'moderate'
        );
      }

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        // Check if saved progress is from today
        if (parsed.date === new Date().toDateString()) {
          newState.todayProgress = parsed;
        } else {
          // New day - reset progress
          newState.todayProgress = { ...defaultProgress, date: new Date().toDateString() };
        }
      }

      if (savedStreak) {
        const parsed = JSON.parse(savedStreak);
        newState.currentStreak = parsed.currentStreak || 0;
        newState.longestStreak = parsed.longestStreak || 0;
      }

      setState(newState);
    } catch (error) {
      console.error('Error loading user state:', error);
    }
  };

  const calculateAdjustedTargets = (
    base: NutritionTargets, 
    plan: WorkoutPlan
  ): NutritionTargets => {
    const multiplier = NUTRITION_CONFIG.WORKOUT_MULTIPLIERS[plan];
    
    return {
      calories: Math.round(base.calories * multiplier),
      protein: Math.round(base.protein * (plan === 'bulking' ? 1.3 : multiplier)),
      carbs: Math.round(base.carbs * multiplier),
      fat: Math.round(base.fat * multiplier),
      water: Math.round(base.water * (multiplier > 1 ? 1.2 : 1)),
    };
  };

  const saveUserState = async (newState: Partial<UserState>) => {
    try {
      const updated = { ...state, ...newState };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify({
        profile: updated.profile,
        workoutPlan: updated.workoutPlan,
        baseTargets: updated.baseTargets,
      }));
    } catch (error) {
      console.error('Error saving user state:', error);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    const updatedProfile = { ...state.profile, ...profile } as UserProfile;
    setState(prev => ({ ...prev, profile: updatedProfile }));
    await saveUserState({ profile: updatedProfile });
  };

  const setWorkoutPlan = async (plan: WorkoutPlan) => {
    const adjustedTargets = calculateAdjustedTargets(state.baseTargets, plan);
    setState(prev => ({ ...prev, workoutPlan: plan, adjustedTargets }));
    await saveUserState({ workoutPlan: plan });
  };

  const updateBaseTargets = async (targets: Partial<NutritionTargets>) => {
    const newBaseTargets = { ...state.baseTargets, ...targets };
    const adjustedTargets = calculateAdjustedTargets(newBaseTargets, state.workoutPlan);
    setState(prev => ({ 
      ...prev, 
      baseTargets: newBaseTargets,
      adjustedTargets 
    }));
    await saveUserState({ baseTargets: newBaseTargets });
  };

  const logFood = async (nutrition: Partial<DailyProgress>) => {
    const updatedProgress = {
      ...state.todayProgress,
      caloriesConsumed: state.todayProgress.caloriesConsumed + (nutrition.caloriesConsumed || 0),
      proteinConsumed: state.todayProgress.proteinConsumed + (nutrition.proteinConsumed || 0),
      carbsConsumed: state.todayProgress.carbsConsumed + (nutrition.carbsConsumed || 0),
      fatConsumed: state.todayProgress.fatConsumed + (nutrition.fatConsumed || 0),
    };
    setState(prev => ({ ...prev, todayProgress: updatedProgress }));
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(updatedProgress));
  };

  const logWater = async (amount: number) => {
    const updatedProgress = {
      ...state.todayProgress,
      waterConsumed: state.todayProgress.waterConsumed + amount,
    };
    setState(prev => ({ ...prev, todayProgress: updatedProgress }));
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(updatedProgress));
  };

  const resetDailyProgress = async () => {
    const freshProgress = { ...defaultProgress, date: new Date().toDateString() };
    setState(prev => ({ ...prev, todayProgress: freshProgress }));
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(freshProgress));
  };

  const incrementStreak = async () => {
    const newStreak = state.currentStreak + 1;
    const newLongest = Math.max(newStreak, state.longestStreak);
    setState(prev => ({ 
      ...prev, 
      currentStreak: newStreak,
      longestStreak: newLongest 
    }));
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify({
      currentStreak: newStreak,
      longestStreak: newLongest,
    }));
  };

  const resetStreak = async () => {
    setState(prev => ({ ...prev, currentStreak: 0 }));
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify({
      currentStreak: 0,
      longestStreak: state.longestStreak,
    }));
  };

  const value: UserContextType = {
    ...state,
    updateProfile,
    setWorkoutPlan,
    updateBaseTargets,
    logFood,
    logWater,
    resetDailyProgress,
    incrementStreak,
    resetStreak,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
