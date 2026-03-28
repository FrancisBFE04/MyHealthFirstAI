/**
 * More Screen - Additional features and settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, GlassStyle, Spacing, Typography } from '../constants/theme';
import { GlassCard } from '../components/shared';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  badge?: string;
}

const MenuItem = ({ icon, title, subtitle, onPress, color = Colors.primary, badge }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
  </TouchableOpacity>
);

export default function MoreScreen() {
  const router = useRouter();

  const featureItems: MenuItemProps[] = [
    {
      icon: 'water',
      title: 'Water Tracker',
      subtitle: 'Track your daily hydration',
      onPress: () => router.push('/water'),
      color: Colors.water,
    },
    {
      icon: 'book',
      title: 'Recipes',
      subtitle: 'AI-generated healthy recipes',
      onPress: () => router.push('/recipes'),
      color: Colors.success,
    },
    {
      icon: 'calendar',
      title: 'Meal Planner',
      subtitle: 'Plan your weekly meals',
      onPress: () => router.push('/planner'),
      color: Colors.secondary,
    },
    {
      icon: 'fitness',
      title: 'Workout Planner',
      subtitle: 'AI workout & diet plans',
      onPress: () => router.push('/workout'),
      color: Colors.accent,
    },
    {
      icon: 'mic',
      title: 'Voice Logging',
      subtitle: 'Log meals with your voice',
      onPress: () => router.push('/voice'),
      color: Colors.warning,
      badge: 'PRO',
    },
    {
      icon: 'body',
      title: 'Form Correction',
      subtitle: 'AI exercise form analysis',
      onPress: () => router.push('/form'),
      color: Colors.error,
      badge: 'PRO',
    },
    {
      icon: 'trophy',
      title: 'Badges & Achievements',
      subtitle: 'View your earned badges',
      onPress: () => router.push('/badges'),
      color: Colors.badge,
    },
  ];

  const settingsItems: MenuItemProps[] = [
    {
      icon: 'person',
      title: 'Profile',
      subtitle: 'Manage your account',
      onPress: () => {},
      color: Colors.textSecondary,
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Reminder settings',
      onPress: () => {},
      color: Colors.textSecondary,
    },
    {
      icon: 'shield-checkmark',
      title: 'Privacy',
      subtitle: 'Data & privacy settings',
      onPress: () => {},
      color: Colors.textSecondary,
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'FAQ and contact us',
      onPress: () => {},
      color: Colors.textSecondary,
    },
    {
      icon: 'information-circle',
      title: 'About',
      subtitle: 'Version 1.0.0',
      onPress: () => {},
      color: Colors.textSecondary,
    },
  ];

  return (
    <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
          <Text style={styles.headerSubtitle}>Features & Settings</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Features</Text>
            {featureItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Settings</Text>
            {settingsItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>MyHealthFirstAI</Text>
            <Text style={styles.footerVersion}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.h1,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.h3,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: 10,
    marginRight: Spacing.sm,
  },
  badgeText: {
    fontSize: Typography.small,
    fontWeight: 'bold',
    color: Colors.background,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  footerVersion: {
    fontSize: Typography.small,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
