/**
 * Watch Screen - Smartwatch Integration & Health Metrics
 * Syncs with Apple Watch, Fitbit, Garmin, Samsung Galaxy Watch, etc.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassCard } from '../components/shared';
import { Colors, Spacing, Typography } from '../constants/theme';
import { API_CONFIG } from '../constants/config';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Supported smartwatch brands
const WATCH_BRANDS = [
  { id: 'apple', name: 'Apple Watch', icon: 'watch-outline', color: '#FF2D55' },
  { id: 'fitbit', name: 'Fitbit', icon: 'fitness-outline', color: '#00B0B9' },
  { id: 'garmin', name: 'Garmin', icon: 'navigate-outline', color: '#007CC3' },
  { id: 'samsung', name: 'Samsung Galaxy', icon: 'phone-portrait-outline', color: '#1428A0' },
  { id: 'google', name: 'Google Fit', icon: 'logo-google', color: '#4285F4' },
  { id: 'xiaomi', name: 'Mi Band', icon: 'band-outline', color: '#FF6900' },
];

// Health metrics to sync
interface HealthMetrics {
  steps: number;
  stepsGoal: number;
  heartRate: number;
  heartRateMin: number;
  heartRateMax: number;
  bloodOxygen: number;
  calories: number;
  caloriesGoal: number;
  distance: number;
  floors: number;
  sleepHours: number;
  sleepQuality: string;
  activeMinutes: number;
  standHours: number;
  hrv: number; // Heart Rate Variability
  stress: number;
  bodyTemperature: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
}

// Mock data - in production, this comes from watch APIs
const generateMockMetrics = (): HealthMetrics => ({
  steps: Math.floor(Math.random() * 5000) + 3000,
  stepsGoal: 10000,
  heartRate: Math.floor(Math.random() * 30) + 60,
  heartRateMin: 52,
  heartRateMax: 142,
  bloodOxygen: Math.floor(Math.random() * 3) + 96,
  calories: Math.floor(Math.random() * 500) + 800,
  caloriesGoal: 2000,
  distance: Math.random() * 3 + 1.5,
  floors: Math.floor(Math.random() * 10) + 2,
  sleepHours: Math.random() * 2 + 6,
  sleepQuality: ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)],
  activeMinutes: Math.floor(Math.random() * 30) + 15,
  standHours: Math.floor(Math.random() * 6) + 4,
  hrv: Math.floor(Math.random() * 30) + 35,
  stress: Math.floor(Math.random() * 50) + 20,
  bodyTemperature: 36.5 + Math.random() * 0.8,
  bloodPressureSystolic: Math.floor(Math.random() * 20) + 110,
  bloodPressureDiastolic: Math.floor(Math.random() * 15) + 70,
});

export default function WatchScreen() {
  const [connectedWatch, setConnectedWatch] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics>(generateMockMetrics());
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation for heart rate
  useEffect(() => {
    if (connectedWatch) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [connectedWatch]);

  const connectWatch = async (watchId: string) => {
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      setConnectedWatch(watchId);
      setIsConnecting(false);
      setLastSyncTime(new Date());
      setMetrics(generateMockMetrics());
      
      const watchName = WATCH_BRANDS.find(w => w.id === watchId)?.name;
      Alert.alert(
        '✓ Connected!',
        `Successfully connected to ${watchName}. Your health data will now sync automatically.`
      );
    }, 2000);
  };

  const disconnectWatch = () => {
    Alert.alert(
      'Disconnect Watch?',
      'Your health data will no longer sync automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnectedWatch(null);
            setLastSyncTime(null);
          },
        },
      ]
    );
  };

  const syncNow = async () => {
    if (!connectedWatch) return;
    
    setIsSyncing(true);
    
    try {
      // Generate new metrics (in production, this comes from watch SDK)
      const newMetrics = generateMockMetrics();
      setMetrics(newMetrics);
      
      // Sync to backend
      const watchName = WATCH_BRANDS.find(w => w.id === connectedWatch)?.name;
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/health/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steps: newMetrics.steps,
          steps_goal: newMetrics.stepsGoal,
          heart_rate: newMetrics.heartRate,
          heart_rate_min: newMetrics.heartRateMin,
          heart_rate_max: newMetrics.heartRateMax,
          blood_oxygen: newMetrics.bloodOxygen,
          sleep_hours: newMetrics.sleepHours,
          sleep_quality: newMetrics.sleepQuality.toLowerCase(),
          calories_burned: newMetrics.calories,
          active_minutes: newMetrics.activeMinutes,
          distance_km: newMetrics.distance,
          floors_climbed: newMetrics.floors,
          device_name: watchName,
          device_id: connectedWatch,
        }),
      });
      
      const data = await response.json();
      console.log('[Watch] Sync response:', data);
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('[Watch] Sync error:', error);
      // Still update UI even if backend fails
      setLastSyncTime(new Date());
    }
    
    setIsSyncing(false);
  };

  const getStepsProgress = () => (metrics.steps / metrics.stepsGoal) * 100;
  const getCaloriesProgress = () => (metrics.calories / metrics.caloriesGoal) * 100;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⌚ Smart Watch</Text>
          <Text style={styles.subtitle}>
            {connectedWatch 
              ? `Connected to ${WATCH_BRANDS.find(w => w.id === connectedWatch)?.name}`
              : 'Connect your watch to sync health data'}
          </Text>
        </View>
        {connectedWatch && (
          <TouchableOpacity 
            style={[styles.syncButton, isSyncing && styles.syncingButton]}
            onPress={syncNow}
            disabled={isSyncing}
          >
            <Ionicons 
              name={isSyncing ? 'sync' : 'sync-outline'} 
              size={20} 
              color={Colors.text} 
            />
            <Text style={styles.syncText}>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Connected Watch Card */}
      {connectedWatch ? (
        <>
          {/* Connection Status */}
          <GlassCard style={styles.connectionCard}>
            <View style={styles.connectionHeader}>
              <View style={styles.watchInfo}>
                <View style={[styles.watchIconBig, { backgroundColor: WATCH_BRANDS.find(w => w.id === connectedWatch)?.color }]}>
                  <Ionicons 
                    name={WATCH_BRANDS.find(w => w.id === connectedWatch)?.icon as any} 
                    size={28} 
                    color={Colors.text} 
                  />
                </View>
                <View>
                  <Text style={styles.connectedWatchName}>
                    {WATCH_BRANDS.find(w => w.id === connectedWatch)?.name}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Connected</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={disconnectWatch}>
                <Ionicons name="close-circle-outline" size={28} color={Colors.error} />
              </TouchableOpacity>
            </View>
            {lastSyncTime && (
              <Text style={styles.lastSync}>
                Last synced: {formatTime(lastSyncTime)}
              </Text>
            )}
          </GlassCard>

          {/* Main Metrics Grid */}
          <View style={styles.metricsGrid}>
            {/* Steps Card */}
            <GlassCard style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="footsteps-outline" size={24} color={Colors.primary} />
                <Text style={styles.metricTitle}>Steps</Text>
              </View>
              <Text style={styles.metricValue}>{metrics.steps.toLocaleString()}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(getStepsProgress(), 100)}%` }]} />
              </View>
              <Text style={styles.metricGoal}>Goal: {metrics.stepsGoal.toLocaleString()}</Text>
            </GlassCard>

            {/* Heart Rate Card */}
            <GlassCard style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Ionicons name="heart" size={24} color="#FF2D55" />
                </Animated.View>
                <Text style={styles.metricTitle}>Heart Rate</Text>
              </View>
              <Text style={styles.metricValue}>{metrics.heartRate}</Text>
              <Text style={styles.metricUnit}>BPM</Text>
              <Text style={styles.metricRange}>
                Range: {metrics.heartRateMin}-{metrics.heartRateMax}
              </Text>
            </GlassCard>

            {/* Blood Oxygen Card */}
            <GlassCard style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="water-outline" size={24} color="#5AC8FA" />
                <Text style={styles.metricTitle}>Blood O₂</Text>
              </View>
              <Text style={styles.metricValue}>{metrics.bloodOxygen}%</Text>
              <Text style={[
                styles.metricStatus,
                { color: metrics.bloodOxygen >= 95 ? Colors.success : Colors.warning }
              ]}>
                {metrics.bloodOxygen >= 95 ? 'Normal' : 'Low'}
              </Text>
            </GlassCard>

            {/* Calories Card */}
            <GlassCard style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="flame-outline" size={24} color="#FF9500" />
                <Text style={styles.metricTitle}>Calories</Text>
              </View>
              <Text style={styles.metricValue}>{metrics.calories}</Text>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { width: `${Math.min(getCaloriesProgress(), 100)}%`, backgroundColor: '#FF9500' }
                ]} />
              </View>
              <Text style={styles.metricGoal}>Goal: {metrics.caloriesGoal}</Text>
            </GlassCard>
          </View>

          {/* Additional Metrics */}
          <Text style={styles.sectionTitle}>📊 More Health Data</Text>
          
          <GlassCard style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="map-outline" size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{metrics.distance.toFixed(2)} km</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="layers-outline" size={20} color={Colors.secondary} />
                <Text style={styles.detailLabel}>Floors</Text>
                <Text style={styles.detailValue}>{metrics.floors}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="timer-outline" size={20} color={Colors.success} />
                <Text style={styles.detailLabel}>Active Min</Text>
                <Text style={styles.detailValue}>{metrics.activeMinutes}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="moon-outline" size={20} color="#AF52DE" />
                <Text style={styles.detailLabel}>Sleep</Text>
                <Text style={styles.detailValue}>{metrics.sleepHours.toFixed(1)}h</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="body-outline" size={20} color="#FF2D55" />
                <Text style={styles.detailLabel}>Stand Hours</Text>
                <Text style={styles.detailValue}>{metrics.standHours}/12</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="pulse-outline" size={20} color="#5AC8FA" />
                <Text style={styles.detailLabel}>HRV</Text>
                <Text style={styles.detailValue}>{metrics.hrv} ms</Text>
              </View>
            </View>
          </GlassCard>

          {/* Blood Pressure & Stress */}
          <Text style={styles.sectionTitle}>🩺 Vitals</Text>
          
          <View style={styles.vitalsGrid}>
            <GlassCard style={styles.vitalCard}>
              <Ionicons name="pulse" size={28} color="#FF2D55" />
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
              <Text style={styles.vitalValue}>
                {metrics.bloodPressureSystolic}/{metrics.bloodPressureDiastolic}
              </Text>
              <Text style={styles.vitalUnit}>mmHg</Text>
            </GlassCard>

            <GlassCard style={styles.vitalCard}>
              <Ionicons name="fitness-outline" size={28} color="#FF9500" />
              <Text style={styles.vitalLabel}>Stress Level</Text>
              <Text style={styles.vitalValue}>{metrics.stress}</Text>
              <Text style={[
                styles.vitalStatus,
                { color: metrics.stress < 40 ? Colors.success : metrics.stress < 70 ? Colors.warning : Colors.error }
              ]}>
                {metrics.stress < 40 ? 'Low' : metrics.stress < 70 ? 'Medium' : 'High'}
              </Text>
            </GlassCard>

            <GlassCard style={styles.vitalCard}>
              <Ionicons name="thermometer-outline" size={28} color="#5AC8FA" />
              <Text style={styles.vitalLabel}>Body Temp</Text>
              <Text style={styles.vitalValue}>{metrics.bodyTemperature.toFixed(1)}°</Text>
              <Text style={styles.vitalUnit}>Celsius</Text>
            </GlassCard>
          </View>

          {/* Sleep Quality */}
          <GlassCard style={styles.sleepCard}>
            <View style={styles.sleepHeader}>
              <Ionicons name="moon" size={24} color="#AF52DE" />
              <Text style={styles.sleepTitle}>Sleep Analysis</Text>
            </View>
            <View style={styles.sleepContent}>
              <View style={styles.sleepStat}>
                <Text style={styles.sleepDuration}>{metrics.sleepHours.toFixed(1)}</Text>
                <Text style={styles.sleepLabel}>Hours</Text>
              </View>
              <View style={styles.sleepDivider} />
              <View style={styles.sleepStat}>
                <Text style={[
                  styles.sleepQuality,
                  { 
                    color: metrics.sleepQuality === 'Excellent' ? Colors.success :
                           metrics.sleepQuality === 'Good' ? Colors.primary :
                           metrics.sleepQuality === 'Fair' ? Colors.warning : Colors.error
                  }
                ]}>
                  {metrics.sleepQuality}
                </Text>
                <Text style={styles.sleepLabel}>Quality</Text>
              </View>
            </View>
          </GlassCard>
        </>
      ) : (
        /* Watch Selection */
        <>
          <Text style={styles.sectionTitle}>🔗 Connect Your Watch</Text>
          <Text style={styles.sectionSubtitle}>
            Select your smartwatch or fitness tracker to sync health data
          </Text>

          <View style={styles.watchGrid}>
            {WATCH_BRANDS.map((watch) => (
              <TouchableOpacity
                key={watch.id}
                style={styles.watchCard}
                onPress={() => connectWatch(watch.id)}
                disabled={isConnecting}
              >
                <LinearGradient
                  colors={[watch.color + '20', watch.color + '10']}
                  style={styles.watchGradient}
                >
                  <View style={[styles.watchIcon, { backgroundColor: watch.color }]}>
                    <Ionicons name={watch.icon as any} size={24} color={Colors.text} />
                  </View>
                  <Text style={styles.watchName}>{watch.name}</Text>
                  {isConnecting && (
                    <Text style={styles.connectingText}>Connecting...</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* What You'll Get */}
          <GlassCard style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>📱 What You'll Sync</Text>
            <View style={styles.featuresList}>
              {[
                { icon: 'footsteps-outline', text: 'Steps & Distance' },
                { icon: 'heart-outline', text: 'Heart Rate & HRV' },
                { icon: 'water-outline', text: 'Blood Oxygen (SpO2)' },
                { icon: 'flame-outline', text: 'Calories Burned' },
                { icon: 'moon-outline', text: 'Sleep Tracking' },
                { icon: 'pulse-outline', text: 'Blood Pressure' },
                { icon: 'fitness-outline', text: 'Stress Level' },
                { icon: 'thermometer-outline', text: 'Body Temperature' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name={feature.icon as any} size={18} color={Colors.primary} />
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: isWeb ? Spacing.lg : 60,
  },
  title: {
    fontSize: Typography.h1,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: 6,
  },
  syncingButton: {
    opacity: 0.7,
  },
  syncText: {
    color: Colors.text,
    fontSize: Typography.small,
    fontWeight: Typography.semibold,
  },
  connectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  watchIconBig: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedWatchName: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: Typography.small,
    color: Colors.success,
  },
  lastSync: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  metricCard: {
    width: isWeb ? '23%' as any : (width - 48) / 2 - 8,
    padding: Spacing.md,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  metricTitle: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  metricUnit: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  metricGoal: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  metricRange: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  metricStatus: {
    fontSize: Typography.small,
    fontWeight: Typography.medium,
    marginTop: 4,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  detailsCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.sm,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  detailValue: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginTop: 2,
  },
  vitalsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  vitalCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginTop: 4,
  },
  vitalUnit: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  vitalStatus: {
    fontSize: Typography.small,
    fontWeight: Typography.medium,
  },
  sleepCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  sleepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sleepTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  sleepContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  sleepStat: {
    alignItems: 'center',
  },
  sleepDuration: {
    fontSize: 36,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  sleepQuality: {
    fontSize: 24,
    fontWeight: Typography.bold,
  },
  sleepLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sleepDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.glassBorder,
  },
  watchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  watchCard: {
    width: isWeb ? '31%' as any : (width - 48) / 2 - 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  watchGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  watchIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  watchName: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  connectingText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  featuresCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  featuresTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  featureText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  bottomPadding: {
    height: 100,
  },
});
