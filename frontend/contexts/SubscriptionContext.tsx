/**
 * SubscriptionContext - Manages Freemium/Pro subscription state
 * Implements Mock RevenueCat payment flow
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBSCRIPTION_CONFIG } from '../constants/config';

// Types
export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionState {
  tier: SubscriptionTier;
  isPro: boolean;
  dailyScansUsed: number;
  dailyScansLimit: number;
  canUseVoiceLogging: boolean;
  canUseFormCorrection: boolean;
  subscriptionDate: string | null;
  expiryDate: string | null;
}

interface SubscriptionContextType extends SubscriptionState {
  // Actions
  upgradeToPro: () => Promise<void>;
  downgradeToFree: () => Promise<void>;
  incrementDailyScan: () => Promise<boolean>;
  resetDailyScans: () => Promise<void>;
  checkCanScan: () => boolean;
  restorePurchases: () => Promise<void>;
}

const defaultState: SubscriptionState = {
  tier: 'free',
  isPro: false,
  dailyScansUsed: 0,
  dailyScansLimit: SUBSCRIPTION_CONFIG.FREE_DAILY_SCANS,
  canUseVoiceLogging: false,
  canUseFormCorrection: false,
  subscriptionDate: null,
  expiryDate: null,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  SUBSCRIPTION: '@subscription_state',
  DAILY_SCANS: '@daily_scans',
  LAST_SCAN_DATE: '@last_scan_date',
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SubscriptionState>(defaultState);

  // Load saved subscription state on mount
  useEffect(() => {
    loadSubscriptionState();
    checkAndResetDailyScans();
  }, []);

  const loadSubscriptionState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState(prev => ({
          ...prev,
          ...parsed,
          // Recalculate derived state
          isPro: parsed.tier === 'pro',
          dailyScansLimit: parsed.tier === 'pro' 
            ? Infinity 
            : SUBSCRIPTION_CONFIG.FREE_DAILY_SCANS,
          canUseVoiceLogging: parsed.tier === 'pro',
          canUseFormCorrection: parsed.tier === 'pro',
        }));
      }

      // Load daily scans count
      const dailyScans = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_SCANS);
      if (dailyScans) {
        setState(prev => ({ ...prev, dailyScansUsed: parseInt(dailyScans, 10) }));
      }
    } catch (error) {
      console.error('Error loading subscription state:', error);
    }
  };

  const checkAndResetDailyScans = async () => {
    try {
      const lastScanDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCAN_DATE);
      const today = new Date().toDateString();

      if (lastScanDate !== today) {
        // New day - reset scans
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SCANS, '0');
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCAN_DATE, today);
        setState(prev => ({ ...prev, dailyScansUsed: 0 }));
      }
    } catch (error) {
      console.error('Error resetting daily scans:', error);
    }
  };

  const saveSubscriptionState = async (newState: Partial<SubscriptionState>) => {
    try {
      const updated = { ...state, ...newState };
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving subscription state:', error);
    }
  };

  /**
   * MOCK REVENUECAT PAYMENT
   * In production, this would integrate with RevenueCat SDK
   * For exam purposes, clicking "Subscribe" instantly grants Pro
   */
  const upgradeToPro = async () => {
    console.log('🎉 MOCK PAYMENT: Upgrading to Pro tier...');
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year subscription

    const newState: Partial<SubscriptionState> = {
      tier: 'pro',
      isPro: true,
      dailyScansLimit: Infinity,
      canUseVoiceLogging: true,
      canUseFormCorrection: true,
      subscriptionDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
    };

    setState(prev => ({ ...prev, ...newState }));
    await saveSubscriptionState(newState);

    console.log('✅ MOCK PAYMENT: Pro subscription activated!');
  };

  const downgradeToFree = async () => {
    const newState: Partial<SubscriptionState> = {
      tier: 'free',
      isPro: false,
      dailyScansLimit: SUBSCRIPTION_CONFIG.FREE_DAILY_SCANS,
      canUseVoiceLogging: false,
      canUseFormCorrection: false,
      subscriptionDate: null,
      expiryDate: null,
    };

    setState(prev => ({ ...prev, ...newState }));
    await saveSubscriptionState(newState);
  };

  const incrementDailyScan = async (): Promise<boolean> => {
    // Pro users have unlimited scans
    if (state.isPro) {
      return true;
    }

    // Check if free user has remaining scans
    if (state.dailyScansUsed >= state.dailyScansLimit) {
      return false;
    }

    const newCount = state.dailyScansUsed + 1;
    setState(prev => ({ ...prev, dailyScansUsed: newCount }));
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SCANS, newCount.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCAN_DATE, new Date().toDateString());

    return true;
  };

  const resetDailyScans = async () => {
    setState(prev => ({ ...prev, dailyScansUsed: 0 }));
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SCANS, '0');
  };

  const checkCanScan = (): boolean => {
    if (state.isPro) return true;
    return state.dailyScansUsed < state.dailyScansLimit;
  };

  /**
   * MOCK RESTORE PURCHASES
   * In production, this would call RevenueCat.restorePurchases()
   */
  const restorePurchases = async () => {
    console.log('🔄 MOCK: Restoring purchases...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For mock purposes, check if user previously had Pro
    const savedState = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.tier === 'pro') {
        await upgradeToPro();
        console.log('✅ MOCK: Pro subscription restored!');
      }
    }
  };

  const value: SubscriptionContextType = {
    ...state,
    upgradeToPro,
    downgradeToFree,
    incrementDailyScan,
    resetDailyScans,
    checkCanScan,
    restorePurchases,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
