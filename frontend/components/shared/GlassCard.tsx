/**
 * GlassCard - Apple Health-style glassmorphism card component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: string[];
  glowColor?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function GlassCard({
  children,
  style,
  gradient = false,
  gradientColors = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
  glowColor,
  padding = 'md',
}: GlassCardProps) {
  const paddingValue = {
    sm: Spacing.sm,
    md: Spacing.md,
    lg: Spacing.lg,
  }[padding];

  const containerStyle: ViewStyle = {
    ...styles.container,
    padding: paddingValue,
    ...(glowColor ? Shadows.glow(glowColor) : Shadows.medium),
    ...style,
  };

  // Web needs different approach for backdrop blur
  if (Platform.OS === 'web') {
    return (
      <View style={[containerStyle, styles.webGlass]}>
        {children}
      </View>
    );
  }

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={containerStyle}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  webGlass: {
    // @ts-ignore - Web-specific CSS property
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
});
