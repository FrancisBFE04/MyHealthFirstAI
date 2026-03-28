/**
 * Sidebar - Web-only navigation sidebar
 * Displays when Platform.OS === 'web'
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useUser } from '../../contexts/UserContext';

interface NavItem {
  name: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
  isPro?: boolean;
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: 'home' },
  { name: 'Food Log', path: '/food', icon: 'restaurant' },
  { name: 'Water', path: '/water', icon: 'water' },
  { name: 'AI Coach', path: '/coach', icon: 'chatbubbles' },
  { name: 'Recipes', path: '/recipes', icon: 'nutrition' },
  { name: 'Meal Planner', path: '/planner', icon: 'calendar' },
  { name: 'Watch', path: '/watch', icon: 'watch' },
];

const proNavItems: NavItem[] = [
  { name: 'Voice Log', path: '/voice', icon: 'mic', isPro: true },
  { name: 'Form Check', path: '/form', icon: 'videocam', isPro: true },
];

const bottomNavItems: NavItem[] = [
  { name: 'Badges', path: '/badges', icon: 'trophy' },
  { name: 'Workouts', path: '/workout', icon: 'barbell' },
  { name: 'Premium', path: '/premium', icon: 'diamond' },
  { name: 'More', path: '/more', icon: 'ellipsis-horizontal' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isPro } = useSubscription();
  const { currentStreak } = useUser();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/' || pathname === '/index';
    return pathname.startsWith(path);
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const active = isActive(item.path);
    const locked = item.isPro && !isPro;

    return (
      <TouchableOpacity
        style={[styles.navItem, active && styles.navItemActive]}
        onPress={() => router.push(item.path as any)}
        disabled={locked}
      >
        <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
          <Ionicons
            name={locked ? 'lock-closed' : item.icon}
            size={20}
            color={active ? Colors.primary : locked ? Colors.textTertiary : Colors.textSecondary}
          />
        </View>
        <Text style={[
          styles.navText,
          active && styles.navTextActive,
          locked && styles.navTextLocked,
        ]}>
          {item.name}
        </Text>
        {item.isPro && !isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Brand */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>MyHealthFirst</Text>
          <Text style={styles.brandTag}>AI</Text>
        </View>

        {/* Streak indicator */}
        {currentStreak > 0 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{currentStreak} Day Streak!</Text>
          </View>
        )}

        {/* Main Navigation */}
        <View style={styles.navSection}>
          <Text style={styles.sectionLabel}>MAIN</Text>
          {mainNavItems.map(item => (
            <NavButton key={item.path} item={item} />
          ))}
        </View>

        {/* Pro Features */}
        <View style={styles.navSection}>
          <Text style={styles.sectionLabel}>PRO FEATURES</Text>
          {proNavItems.map(item => (
            <NavButton key={item.path} item={item} />
          ))}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.navSection}>
          <Text style={styles.sectionLabel}>OTHER</Text>
          {bottomNavItems.map(item => (
            <NavButton key={item.path} item={item} />
          ))}
        </View>

        {/* Subscription CTA */}
        {!isPro && (
          <TouchableOpacity 
            style={styles.upgradeCard}
            onPress={() => router.push('/premium' as any)}
          >
            <LinearGradient
              colors={[Colors.premium, Colors.premiumEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeGradient}
            >
              <Ionicons name="diamond" size={24} color={Colors.background} />
              <Text style={styles.upgradeTitle}>Go Pro</Text>
              <Text style={styles.upgradeSubtitle}>Unlock all features</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    height: '100%',
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.glassBorder,
    // Web-specific styles
    ...(Platform.OS === 'web' ? {
      position: 'fixed' as any,
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    } : {}),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  brandName: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  brandTag: {
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
    color: Colors.primary,
    marginLeft: 2,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  streakEmoji: {
    fontSize: 18,
    marginRight: Spacing.xs,
  },
  streakText: {
    fontSize: Typography.caption,
    fontWeight: Typography.semibold,
    color: Colors.streak,
  },
  navSection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.small,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 199, 190, 0.1)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    marginRight: Spacing.sm,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(0, 199, 190, 0.2)',
  },
  navText: {
    flex: 1,
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  navTextActive: {
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
  navTextLocked: {
    color: Colors.textTertiary,
  },
  proBadge: {
    backgroundColor: Colors.premium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.background,
  },
  upgradeCard: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  upgradeGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
    color: Colors.background,
    marginTop: Spacing.xs,
  },
  upgradeSubtitle: {
    fontSize: Typography.small,
    color: 'rgba(0,0,0,0.6)',
  },
});
