/**
 * RingChart - Animated circular progress indicator for macros
 * Apple Health-inspired design
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { Colors, Typography } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RingChartProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color: string;
  backgroundColor?: string;
  label?: string;
  value?: string | number;
  unit?: string;
  showPercentage?: boolean;
}

export function RingChart({
  progress,
  size = 100,
  strokeWidth = 10,
  color,
  backgroundColor = 'rgba(255,255,255,0.1)',
  label,
  value,
  unit,
  showPercentage = false,
}: RingChartProps) {
  const animatedProgress = useSharedValue(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 100), {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (circumference * animatedProgress.value) / 100;
    return {
      strokeDashoffset,
    };
  });

  // Fallback for web where reanimated might have issues
  const staticStrokeDashoffset = circumference - (circumference * Math.min(progress, 100)) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          {Platform.OS === 'web' ? (
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={staticStrokeDashoffset}
              strokeLinecap="round"
            />
          ) : (
            <AnimatedCircle
              cx={center}
              cy={center}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
              strokeLinecap="round"
            />
          )}
        </G>
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        {showPercentage ? (
          <Text style={[styles.value, { color }]}>
            {Math.round(progress)}%
          </Text>
        ) : value !== undefined ? (
          <>
            <Text style={[styles.value, { color }]}>{value}</Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </>
        ) : null}
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
}

interface MultiRingChartProps {
  rings: {
    progress: number;
    color: string;
    label: string;
  }[];
  size?: number;
  strokeWidth?: number;
}

export function MultiRingChart({
  rings,
  size = 150,
  strokeWidth = 12,
}: MultiRingChartProps) {
  const gap = strokeWidth + 4;
  
  return (
    <View style={[styles.multiRingContainer, { width: size, height: size }]}>
      {rings.map((ring, index) => {
        const ringSize = size - (index * gap * 2);
        return (
          <View 
            key={ring.label} 
            style={[
              styles.ringLayer, 
              { 
                position: 'absolute',
                top: index * gap,
                left: index * gap,
              }
            ]}
          >
            <RingChart
              progress={ring.progress}
              size={ringSize}
              strokeWidth={strokeWidth}
              color={ring.color}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
  },
  unit: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  label: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  multiRingContainer: {
    position: 'relative',
  },
  ringLayer: {
    position: 'absolute',
  },
});
