/**
 * BadgeCard - Displays a badge with earned/locked state
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  points: number;
  isEarned: boolean;
  earnedAt?: string;
  category: string;
}

export function BadgeCard({
  icon,
  name,
  description,
  points,
  isEarned,
  earnedAt,
  category,
}: BadgeCardProps) {
  return (
    <GlassCard 
      style={[styles.container, !isEarned && styles.locked]}
      glowColor={isEarned ? Colors.badge : undefined}
    >
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, !isEarned && styles.lockedIcon]}>
          {isEarned ? icon : '🔒'}
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.name, !isEarned && styles.lockedText]}>
          {name}
        </Text>
        <Text style={[styles.description, !isEarned && styles.lockedText]}>
          {description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.pointsBadge}>
            <Text style={styles.points}>+{points} pts</Text>
          </View>
          {isEarned && earnedAt && (
            <Text style={styles.earnedDate}>
              Earned {new Date(earnedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    </GlassCard>
  );
}

/**
 * StreakDisplay - Shows current streak with fire animation
 */
interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const getStreakEmoji = (days: number): string => {
    if (days >= 30) return '👑';
    if (days >= 14) return '⚡';
    if (days >= 7) return '🔥';
    if (days >= 3) return '✨';
    return '💪';
  };

  return (
    <GlassCard style={styles.streakContainer} glowColor={Colors.streak}>
      <View style={styles.streakMain}>
        <Text style={styles.streakEmoji}>{getStreakEmoji(currentStreak)}</Text>
        <Text style={styles.streakNumber}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>
      
      <View style={styles.streakDivider} />
      
      <View style={styles.streakStats}>
        <View style={styles.streakStat}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Best</Text>
        </View>
      </View>
    </GlassCard>
  );
}

/**
 * DailyChallenge - Shows today's challenge progress
 */
interface DailyChallengeProps {
  title: string;
  description: string;
  progress: number;
  target: number;
  points: number;
  isCompleted: boolean;
}

export function DailyChallenge({
  title,
  description,
  progress,
  target,
  points,
  isCompleted,
}: DailyChallengeProps) {
  const progressPercent = Math.min((progress / target) * 100, 100);

  return (
    <GlassCard 
      style={styles.challengeContainer}
      glowColor={isCompleted ? Colors.success : undefined}
    >
      <View style={styles.challengeHeader}>
        <View style={styles.challengeTitle}>
          <Text style={styles.challengeIcon}>
            {isCompleted ? '✅' : '🎯'}
          </Text>
          <Text style={styles.challengeName}>{title}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.points}>+{points}</Text>
        </View>
      </View>
      
      <Text style={styles.challengeDescription}>{description}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercent}%`,
                backgroundColor: isCompleted ? Colors.success : Colors.primary,
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {progress}/{target}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  // BadgeCard styles
  container: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  locked: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  lockedIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  lockedText: {
    color: Colors.textTertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  points: {
    fontSize: Typography.small,
    color: Colors.badge,
    fontWeight: Typography.semibold,
  },
  earnedDate: {
    fontSize: Typography.small,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },

  // StreakDisplay styles
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  streakMain: {
    flex: 1,
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: Typography.bold,
    color: Colors.streak,
  },
  streakLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  streakDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.glassBorder,
    marginHorizontal: Spacing.lg,
  },
  streakStats: {
    alignItems: 'center',
  },
  streakStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },

  // DailyChallenge styles
  challengeContainer: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  challengeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  challengeName: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  challengeDescription: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
});
