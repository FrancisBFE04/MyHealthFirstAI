/**
 * MyHealthFirstAI - Theme Constants
 * Apple Health-inspired design system with glassmorphism
 */

export const Colors = {
  // Primary palette
  primary: '#00C7BE',      // Teal/Mint - Health app primary
  secondary: '#5E5CE6',    // Indigo - Secondary actions
  accent: '#FF6B6B',       // Coral - Calories/Alerts
  
  // Macro colors
  protein: '#FF6B6B',      // Red/Coral
  carbs: '#FFD93D',        // Yellow/Gold
  fat: '#6BCB77',          // Green
  water: '#4D96FF',        // Blue
  
  // Gamification
  badge: '#FFD700',        // Gold for badges
  streak: '#FF9500',       // Orange for streaks
  challenge: '#AF52DE',    // Purple for challenges
  
  // Subscription
  premium: '#FFD700',      // Gold gradient
  premiumEnd: '#FFA500',   // Orange gradient end
  
  // Neutrals
  background: '#0A0A0A',   // Near black
  surface: '#1C1C1E',      // Card background
  surfaceLight: '#2C2C2E', // Elevated surface
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  
  // Glass effect
  glass: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  
  // Status
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  // Font sizes
  h1: 34,
  h2: 28,
  h3: 22,
  h4: 18,
  body: 16,
  caption: 14,
  small: 12,
  
  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  }),
};

export const GlassStyle = {
  backgroundColor: Colors.glass,
  borderWidth: 1,
  borderColor: Colors.glassBorder,
  borderRadius: BorderRadius.lg,
};
