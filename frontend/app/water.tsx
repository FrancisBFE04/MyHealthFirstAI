/**
 * Water Tracking Screen - Dedicated log for daily water intake
 * Feature: Visual progress with quick add buttons
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { GlassCard, ActionButton } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useUser } from '../contexts/UserContext';

export default function WaterScreen() {
  const { todayProgress, adjustedTargets, logWater } = useUser();
  const [customAmount, setCustomAmount] = useState(250);

  const waterProgress = (todayProgress.waterConsumed / adjustedTargets.water) * 100;
  const remaining = Math.max(0, adjustedTargets.water - todayProgress.waterConsumed);

  // Quick add options in ml
  const quickAddOptions = [
    { amount: 150, label: 'Small', icon: '🥛' },
    { amount: 250, label: 'Glass', icon: '🥤' },
    { amount: 500, label: 'Bottle', icon: '🍶' },
    { amount: 750, label: 'Large', icon: '🧴' },
  ];

  const handleAddWater = async (amount: number) => {
    await logWater(amount);
  };

  // Calculate fill level for water animation
  const fillLevel = Math.min(waterProgress, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💧 Hydration</Text>
          <Text style={styles.subtitle}>Stay hydrated, stay healthy</Text>
        </View>

        {/* Main Water Glass Visual */}
        <GlassCard style={styles.mainCard}>
          <View style={styles.glassContainer}>
            {/* Water Glass SVG */}
            <View style={styles.glassVisual}>
              <Svg width={160} height={220} viewBox="0 0 160 220">
                {/* Glass outline */}
                <Path
                  d="M20 20 L15 200 C15 210 25 220 80 220 C135 220 145 210 145 200 L140 20 Z"
                  fill="rgba(77, 150, 255, 0.1)"
                  stroke={Colors.water}
                  strokeWidth={2}
                />
                {/* Water fill */}
                <Path
                  d={`M22 ${200 - fillLevel * 1.6} 
                      Q80 ${190 - fillLevel * 1.6} 138 ${200 - fillLevel * 1.6}
                      L145 200 C145 210 135 220 80 220 C25 220 15 210 15 200 Z`}
                  fill={Colors.water}
                  opacity={0.6}
                />
                {/* Water surface wave */}
                {fillLevel > 0 && (
                  <Path
                    d={`M22 ${200 - fillLevel * 1.6} 
                        Q50 ${195 - fillLevel * 1.6} 80 ${200 - fillLevel * 1.6}
                        Q110 ${205 - fillLevel * 1.6} 138 ${200 - fillLevel * 1.6}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={3}
                  />
                )}
              </Svg>
              
              {/* Percentage overlay */}
              <View style={styles.percentageOverlay}>
                <Text style={styles.percentageText}>{Math.round(waterProgress)}%</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todayProgress.waterConsumed}</Text>
                <Text style={styles.statLabel}>ml consumed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{remaining}</Text>
                <Text style={styles.statLabel}>ml remaining</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{adjustedTargets.water}</Text>
                <Text style={styles.statLabel}>ml target</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Quick Add Section */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickAddGrid}>
          {quickAddOptions.map((option) => (
            <TouchableOpacity
              key={option.amount}
              style={styles.quickAddCard}
              onPress={() => handleAddWater(option.amount)}
            >
              <GlassCard style={styles.quickAddInner}>
                <Text style={styles.quickAddEmoji}>{option.icon}</Text>
                <Text style={styles.quickAddAmount}>{option.amount}ml</Text>
                <Text style={styles.quickAddLabel}>{option.label}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Amount */}
        <GlassCard style={styles.customCard}>
          <Text style={styles.customTitle}>Custom Amount</Text>
          <View style={styles.customControls}>
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => setCustomAmount(Math.max(50, customAmount - 50))}
            >
              <Ionicons name="remove" size={24} color={Colors.text} />
            </TouchableOpacity>
            
            <View style={styles.customAmountContainer}>
              <Text style={styles.customAmountValue}>{customAmount}</Text>
              <Text style={styles.customAmountUnit}>ml</Text>
            </View>
            
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => setCustomAmount(customAmount + 50)}
            >
              <Ionicons name="add" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ActionButton
            title={`+ Add ${customAmount}ml`}
            onPress={() => handleAddWater(customAmount)}
            variant="primary"
            fullWidth
          />
        </GlassCard>

        {/* Tips */}
        <GlassCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={Colors.carbs} />
            <Text style={styles.tipsTitle}>Hydration Tips</Text>
          </View>
          <Text style={styles.tipText}>
            • Drink a glass of water first thing in the morning
          </Text>
          <Text style={styles.tipText}>
            • Set reminders every 2 hours to stay hydrated
          </Text>
          <Text style={styles.tipText}>
            • Eat water-rich foods like cucumbers and watermelon
          </Text>
          <Text style={styles.tipText}>
            • Increase intake during workouts and hot weather
          </Text>
        </GlassCard>

        {/* Today's Log */}
        <Text style={styles.sectionTitle}>Today's Log</Text>
        {todayProgress.waterConsumed > 0 ? (
          <GlassCard style={styles.logCard}>
            <View style={styles.logEntry}>
              <Ionicons name="water" size={20} color={Colors.water} />
              <Text style={styles.logText}>
                Total: {todayProgress.waterConsumed}ml
              </Text>
              <Text style={styles.logTime}>Updated just now</Text>
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="water-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No water logged yet</Text>
            <Text style={styles.emptySubtext}>Start your hydration journey!</Text>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  mainCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  glassContainer: {
    alignItems: 'center',
  },
  glassVisual: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  percentageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 36,
    fontWeight: Typography.bold,
    color: Colors.text,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.water,
  },
  statLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.glassBorder,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  quickAddCard: {
    width: '48%',
    marginBottom: Spacing.sm,
  },
  quickAddInner: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  quickAddEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  quickAddAmount: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
    color: Colors.water,
  },
  quickAddLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  customCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  customTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  customControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  customButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAmountContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
  },
  customAmountValue: {
    fontSize: 48,
    fontWeight: Typography.bold,
    color: Colors.water,
  },
  customAmountUnit: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  tipsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  logCard: {
    padding: Spacing.md,
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logText: {
    flex: 1,
    fontSize: Typography.body,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  logTime: {
    fontSize: Typography.small,
    color: Colors.textTertiary,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
});
