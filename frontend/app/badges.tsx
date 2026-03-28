/**
 * Badges Screen - Gamification achievements and rewards
 * Feature: View earned badges, progress toward new badges, and streaks
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

import { GlassCard } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useUser } from '../contexts/UserContext';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'streak' | 'milestone' | 'challenge' | 'special';
  requirement: number;
  progress: number;
  earned: boolean;
  earnedDate?: string;
}

const BADGES: Badge[] = [
  // Streak badges
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Log food for 3 consecutive days',
    icon: 'flame',
    color: Colors.streak,
    category: 'streak',
    requirement: 3,
    progress: 3,
    earned: true,
    earnedDate: '2025-12-01',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Log food for 7 consecutive days',
    icon: 'flame',
    color: Colors.streak,
    category: 'streak',
    requirement: 7,
    progress: 5,
    earned: false,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Log food for 30 consecutive days',
    icon: 'flame',
    color: Colors.streak,
    category: 'streak',
    requirement: 30,
    progress: 5,
    earned: false,
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Log food for 100 consecutive days',
    icon: 'trophy',
    color: Colors.badge,
    category: 'streak',
    requirement: 100,
    progress: 5,
    earned: false,
  },
  // Milestone badges
  {
    id: 'first_log',
    name: 'First Step',
    description: 'Log your first meal',
    icon: 'footsteps',
    color: Colors.primary,
    category: 'milestone',
    requirement: 1,
    progress: 1,
    earned: true,
    earnedDate: '2025-11-28',
  },
  {
    id: 'meals_50',
    name: 'Dedicated Logger',
    description: 'Log 50 meals',
    icon: 'restaurant',
    color: Colors.primary,
    category: 'milestone',
    requirement: 50,
    progress: 23,
    earned: false,
  },
  {
    id: 'meals_100',
    name: 'Nutrition Ninja',
    description: 'Log 100 meals',
    icon: 'nutrition',
    color: Colors.success,
    category: 'milestone',
    requirement: 100,
    progress: 23,
    earned: false,
  },
  {
    id: 'water_goal_7',
    name: 'Hydration Hero',
    description: 'Hit water goal 7 days in a row',
    icon: 'water',
    color: Colors.water,
    category: 'milestone',
    requirement: 7,
    progress: 3,
    earned: false,
  },
  // Challenge badges
  {
    id: 'challenge_first',
    name: 'Challenger',
    description: 'Complete your first daily challenge',
    icon: 'flag',
    color: Colors.challenge,
    category: 'challenge',
    requirement: 1,
    progress: 1,
    earned: true,
    earnedDate: '2025-12-02',
  },
  {
    id: 'challenge_10',
    name: 'Challenge Crusher',
    description: 'Complete 10 daily challenges',
    icon: 'medal',
    color: Colors.challenge,
    category: 'challenge',
    requirement: 10,
    progress: 4,
    earned: false,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Hit all nutrition goals for 7 days',
    icon: 'star',
    color: Colors.badge,
    category: 'challenge',
    requirement: 7,
    progress: 2,
    earned: false,
  },
  // Special badges
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log breakfast before 8 AM',
    icon: 'sunny',
    color: Colors.warning,
    category: 'special',
    requirement: 1,
    progress: 1,
    earned: true,
    earnedDate: '2025-12-03',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Log a meal after 10 PM',
    icon: 'moon',
    color: Colors.secondary,
    category: 'special',
    requirement: 1,
    progress: 0,
    earned: false,
  },
  {
    id: 'photo_pro',
    name: 'Photo Pro',
    description: 'Use AI scan 25 times',
    icon: 'camera',
    color: Colors.primary,
    category: 'special',
    requirement: 25,
    progress: 8,
    earned: false,
  },
  {
    id: 'voice_master',
    name: 'Voice Master',
    description: 'Use voice logging 10 times',
    icon: 'mic',
    color: Colors.accent,
    category: 'special',
    requirement: 10,
    progress: 2,
    earned: false,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'streak', label: 'Streaks', icon: 'flame' },
  { id: 'milestone', label: 'Milestones', icon: 'flag' },
  { id: 'challenge', label: 'Challenges', icon: 'trophy' },
  { id: 'special', label: 'Special', icon: 'star' },
];

export default function BadgesScreen() {
  const { currentStreak, longestStreak } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredBadges = selectedCategory === 'all' 
    ? BADGES 
    : BADGES.filter(b => b.category === selectedCategory);

  const earnedCount = BADGES.filter(b => b.earned).length;
  const totalCount = BADGES.length;

  const calculateXP = () => {
    return BADGES.filter(b => b.earned).reduce((sum, badge) => {
      const baseXP = badge.category === 'special' ? 100 : 50;
      return sum + baseXP;
    }, 0);
  };

  const getLevel = (xp: number) => {
    if (xp >= 1000) return { level: 5, title: 'Legend', next: null };
    if (xp >= 500) return { level: 4, title: 'Master', next: 1000 };
    if (xp >= 250) return { level: 3, title: 'Expert', next: 500 };
    if (xp >= 100) return { level: 2, title: 'Intermediate', next: 250 };
    return { level: 1, title: 'Beginner', next: 100 };
  };

  const xp = calculateXP();
  const levelInfo = getLevel(xp);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>
            {earnedCount} of {totalCount} badges earned
          </Text>
        </View>

        {/* Stats Overview */}
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            {/* Level */}
            <View style={styles.statItem}>
              <View style={[styles.levelBadge, { backgroundColor: Colors.badge }]}>
                <Text style={styles.levelNumber}>{levelInfo.level}</Text>
              </View>
              <Text style={styles.statLabel}>{levelInfo.title}</Text>
            </View>

            {/* XP */}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>

            {/* Current Streak */}
            <View style={styles.statItem}>
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={20} color={Colors.streak} />
                <Text style={styles.streakValue}>{currentStreak}</Text>
              </View>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            {/* Best Streak */}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>

          {/* XP Progress to next level */}
          {levelInfo.next && (
            <View style={styles.xpProgressContainer}>
              <View style={styles.xpProgressHeader}>
                <Text style={styles.xpProgressLabel}>
                  {levelInfo.next - xp} XP to Level {levelInfo.level + 1}
                </Text>
              </View>
              <View style={styles.xpProgressBar}>
                <View 
                  style={[
                    styles.xpProgressFill, 
                    { width: `${(xp / levelInfo.next) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </GlassCard>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory === cat.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? Colors.text : Colors.textSecondary}
              />
              <Text style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {filteredBadges.map((badge) => (
            <GlassCard 
              key={badge.id} 
              style={{
                ...styles.badgeCard,
                ...(badge.earned ? {} : styles.badgeCardLocked),
              }}
            >
              {/* Badge Icon */}
              <View style={[
                styles.badgeIconContainer,
                { backgroundColor: badge.earned ? `${badge.color}30` : 'rgba(255,255,255,0.05)' },
              ]}>
                <Ionicons
                  name={badge.icon as any}
                  size={32}
                  color={badge.earned ? badge.color : Colors.textTertiary}
                />
                {!badge.earned && (
                  <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={14} color={Colors.textTertiary} />
                  </View>
                )}
              </View>

              {/* Badge Info */}
              <Text style={[
                styles.badgeName,
                !badge.earned && styles.badgeNameLocked,
              ]}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDescription} numberOfLines={2}>
                {badge.description}
              </Text>

              {/* Progress or Earned Date */}
              {badge.earned ? (
                <View style={styles.earnedContainer}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                  <Text style={styles.earnedText}>
                    {new Date(badge.earnedDate!).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              ) : (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${Math.min((badge.progress / badge.requirement) * 100, 100)}%`,
                          backgroundColor: badge.color,
                        },
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {badge.progress}/{badge.requirement}
                  </Text>
                </View>
              )}
            </GlassCard>
          ))}
        </View>

        {/* Tips Section */}
        <GlassCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={Colors.warning} />
            <Text style={styles.tipsTitle}>Tips to Earn More</Text>
          </View>
          <Text style={styles.tipText}>
            • Log meals consistently to build your streak
          </Text>
          <Text style={styles.tipText}>
            • Try the AI food scanner for quick logging
          </Text>
          <Text style={styles.tipText}>
            • Complete daily challenges for bonus XP
          </Text>
          <Text style={styles.tipText}>
            • Hit your water goal every day
          </Text>
        </GlassCard>
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
    padding: Spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.background,
  },
  statValue: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakValue: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.streak,
    marginLeft: 4,
  },
  xpProgressContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  xpProgressHeader: {
    marginBottom: Spacing.xs,
  },
  xpProgressLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: Colors.badge,
    borderRadius: 3,
  },
  categoryScroll: {
    marginBottom: Spacing.lg,
  },
  categoryContainer: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: Spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  categoryLabelActive: {
    color: Colors.text,
    fontWeight: Typography.semibold,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 2,
  },
  badgeName: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: Colors.textSecondary,
  },
  badgeDescription: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    minHeight: 32,
  },
  earnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  earnedText: {
    fontSize: Typography.small,
    color: Colors.success,
    marginLeft: 4,
  },
  progressContainer: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  tipsCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
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
  },
});
