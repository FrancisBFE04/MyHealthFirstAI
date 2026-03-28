/**
 * Dashboard Screen - Main home screen with macro overview
 * Feature: Macro Dashboard with animated ring charts
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard, RingChart, MultiRingChart, ActionButton } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useUser } from '../contexts/UserContext';
import { useSubscription } from '../contexts/SubscriptionContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { todayProgress, adjustedTargets, currentStreak } = useUser();
  const { isPro, dailyScansUsed, dailyScansLimit } = useSubscription();

  // Calculate progress percentages
  const calorieProgress = (todayProgress.caloriesConsumed / adjustedTargets.calories) * 100;
  const proteinProgress = (todayProgress.proteinConsumed / adjustedTargets.protein) * 100;
  const carbsProgress = (todayProgress.carbsConsumed / adjustedTargets.carbs) * 100;
  const fatProgress = (todayProgress.fatConsumed / adjustedTargets.fat) * 100;
  const waterProgress = (todayProgress.waterConsumed / adjustedTargets.water) * 100;

  const remainingCalories = adjustedTargets.calories - todayProgress.caloriesConsumed;

  // Quick action buttons
  const quickActions = [
    { icon: 'camera', label: 'Scan Food', route: '/food', color: Colors.primary },
    { icon: 'water', label: 'Log Water', route: '/water', color: Colors.water },
    { icon: 'mic', label: 'Voice Log', route: '/voice', color: Colors.secondary, isPro: true },
    { icon: 'restaurant', label: 'Recipes', route: '/recipes', color: Colors.carbs },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}!</Text>
            <Text style={styles.date}>{formatDate(new Date())}</Text>
          </View>
          
          {currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{currentStreak}</Text>
            </View>
          )}
        </View>

        {/* Main Calorie Ring */}
        <GlassCard style={styles.mainCard}>
          <View style={styles.calorieContainer}>
            <RingChart
              progress={Math.min(calorieProgress, 100)}
              size={180}
              strokeWidth={16}
              color={calorieProgress > 100 ? Colors.warning : Colors.primary}
              value={remainingCalories > 0 ? remainingCalories : 0}
              unit="kcal left"
              showPercentage={false}
            />
            
            <View style={styles.calorieStats}>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieLabel}>Consumed</Text>
                <Text style={styles.calorieValue}>{todayProgress.caloriesConsumed}</Text>
              </View>
              <View style={styles.calorieDivider} />
              <View style={styles.calorieStat}>
                <Text style={styles.calorieLabel}>Target</Text>
                <Text style={styles.calorieValue}>{adjustedTargets.calories}</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Macro Rings */}
        <View style={styles.macroRow}>
          <GlassCard style={styles.macroCard}>
            <RingChart
              progress={proteinProgress}
              size={70}
              strokeWidth={8}
              color={Colors.protein}
              value={todayProgress.proteinConsumed}
              unit="g"
            />
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroTarget}>/ {adjustedTargets.protein}g</Text>
          </GlassCard>

          <GlassCard style={styles.macroCard}>
            <RingChart
              progress={carbsProgress}
              size={70}
              strokeWidth={8}
              color={Colors.carbs}
              value={todayProgress.carbsConsumed}
              unit="g"
            />
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroTarget}>/ {adjustedTargets.carbs}g</Text>
          </GlassCard>

          <GlassCard style={styles.macroCard}>
            <RingChart
              progress={fatProgress}
              size={70}
              strokeWidth={8}
              color={Colors.fat}
              value={todayProgress.fatConsumed}
              unit="g"
            />
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroTarget}>/ {adjustedTargets.fat}g</Text>
          </GlassCard>
        </View>

        {/* Water Progress */}
        <GlassCard style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterInfo}>
              <Ionicons name="water" size={24} color={Colors.water} />
              <Text style={styles.waterTitle}>Hydration</Text>
            </View>
            <Text style={styles.waterAmount}>
              {todayProgress.waterConsumed} / {adjustedTargets.water} ml
            </Text>
          </View>
          
          <View style={styles.waterProgressBar}>
            <View 
              style={[
                styles.waterProgressFill, 
                { width: `${Math.min(waterProgress, 100)}%` }
              ]} 
            />
          </View>
        </GlassCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => {
            const isLocked = action.isPro && !isPro;
            return (
              <TouchableOpacity
                key={index}
                style={styles.quickActionWrapper}
                onPress={() => {
                  if (!isLocked) {
                    router.push(action.route as any);
                  } else {
                    router.push('/premium');
                  }
                }}
                activeOpacity={0.7}
              >
                <GlassCard 
                  style={{...styles.quickActionCard, ...(isLocked ? styles.lockedCard : {})}}
                >
                  <Ionicons
                    name={(isLocked ? 'lock-closed' : action.icon) as any}
                    size={28}
                    color={isLocked ? Colors.textTertiary : action.color}
                  />
                  <Text style={[
                    styles.quickActionLabel,
                    isLocked && styles.lockedText
                  ]}>
                    {action.label}
                  </Text>
                  {isLocked && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AI Scans remaining (for free users) */}
        {!isPro && (
          <GlassCard style={styles.scansCard}>
            <View style={styles.scansInfo}>
              <Ionicons name="scan" size={20} color={Colors.primary} />
              <Text style={styles.scansText}>
                AI Scans: {dailyScansUsed}/{dailyScansLimit} used today
              </Text>
            </View>
            <ActionButton
              title="Get Unlimited"
              onPress={() => router.push('/premium')}
              variant="premium"
              size="sm"
            />
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  date: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  streakEmoji: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
  streakCount: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
    color: Colors.streak,
  },
  mainCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calorieContainer: {
    alignItems: 'center',
  },
  calorieStats: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  calorieStat: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  calorieDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.glassBorder,
  },
  calorieLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  calorieValue: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  macroCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
  },
  macroLabel: {
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  macroTarget: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  waterCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  waterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  waterAmount: {
    fontSize: Typography.caption,
    color: Colors.water,
    fontWeight: Typography.semibold,
  },
  waterProgressBar: {
    height: 10,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: Colors.water,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  quickActionWrapper: {
    width: '48%',
    marginBottom: Spacing.xs,
  },
  quickActionCard: {
    width: '100%',
    alignItems: 'center',
    padding: Spacing.xl,
    minHeight: 120,
    justifyContent: 'center',
  },
  lockedCard: {
    opacity: 0.6,
  },
  quickActionLabel: {
    fontSize: Typography.caption,
    color: Colors.text,
    marginTop: Spacing.sm,
    fontWeight: Typography.medium,
  },
  lockedText: {
    color: Colors.textTertiary,
  },
  proBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.premium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: Typography.bold,
    color: Colors.background,
  },
  scansCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  scansInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scansText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
});
