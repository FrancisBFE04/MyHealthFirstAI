/**
 * Form Corrector Screen - AI workout form analysis
 * Feature: Users record a workout video; AI analyzes form (Pro only)
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';

import { GlassCard, ActionButton, UpgradeModal } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useSubscription } from '../contexts/SubscriptionContext';
import { analyzeWorkoutForm, FormAnalysisResult } from '../services/api';

export default function FormScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FormAnalysisResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const { isPro, canUseFormCorrection } = useSubscription();

  const exerciseTypes = [
    { id: 'squat', name: 'Squat', icon: '🏋️' },
    { id: 'deadlift', name: 'Deadlift', icon: '💪' },
    { id: 'bench_press', name: 'Bench Press', icon: '🛋️' },
    { id: 'push_up', name: 'Push-up', icon: '👐' },
    { id: 'pull_up', name: 'Pull-up', icon: '🙆' },
    { id: 'lunge', name: 'Lunge', icon: '🦵' },
  ];

  const handleStartRecording = async () => {
    if (!canUseFormCorrection) {
      setShowUpgradeModal(true);
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to record your form.');
        return;
      }
    }
    
    setShowCamera(true);
  };

  const handlePickVideo = async () => {
    if (!canUseFormCorrection) {
      setShowUpgradeModal(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
      await analyzeVideo(result.assets[0].uri);
    }
  };

  const analyzeVideo = async (uri: string) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate API call - in production, convert video to base64 or upload
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock result for demo
      const mockResult: FormAnalysisResult = {
        exercise_detected: 'Squat',
        safety_score: 78,
        feedback: [
          {
            category: 'Knee Position',
            issue: 'Knees are caving inward during the descent',
            suggestion: 'Focus on pushing your knees out over your toes. Consider using a resistance band around your thighs for feedback.',
            severity: 'medium',
          },
          {
            category: 'Back Angle',
            issue: 'Slight forward lean at the bottom of the movement',
            suggestion: 'Keep your chest up and core engaged. Work on ankle mobility to allow deeper squat without leaning.',
            severity: 'low',
          },
          {
            category: 'Depth',
            issue: 'Good depth achieved - hip crease below knee',
            suggestion: 'Maintain this depth! Great range of motion.',
            severity: 'low',
          },
        ],
        overall_assessment: "Good squat form overall! Focus on keeping your knees tracking over your toes and maintaining an upright torso. Your depth is excellent. With these small adjustments, you'll reduce injury risk and maximize muscle activation.",
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Error analyzing video:', error);
      Alert.alert('Error', 'Failed to analyze video. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high': return Colors.error;
      case 'medium': return Colors.warning;
      default: return Colors.success;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  // Camera view
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          mode="video"
        >
          <SafeAreaView style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeCamera}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.recordingGuide}>
              <Text style={styles.guideText}>
                {isRecording ? '⏺️ Recording...' : 'Position yourself in frame'}
              </Text>
              <Text style={styles.guideSubtext}>
                Make sure your full body is visible
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={async () => {
                if (isRecording) {
                  // Stop recording - in production this would save video
                  setIsRecording(false);
                  setShowCamera(false);
                  // Mock video for demo
                  setVideoUri('mock-video-uri');
                  await analyzeVideo('mock-video-uri');
                } else {
                  setIsRecording(true);
                }
              }}
            >
              <View style={[
                styles.recordButtonInner,
                isRecording && styles.recordButtonInnerActive,
              ]} />
            </TouchableOpacity>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  // Non-Pro user view
  if (!isPro) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.lockedContainer}>
            <LinearGradient
              colors={[Colors.premium, Colors.premiumEnd]}
              style={styles.lockedIcon}
            >
              <Ionicons name="videocam" size={32} color={Colors.background} />
            </LinearGradient>
            
            <Text style={styles.lockedTitle}>AI Form Corrector</Text>
            <Text style={styles.lockedSubtitle}>
              Record your workout and get instant AI feedback on your form. 
              Prevent injuries and maximize gains!
            </Text>

            <GlassCard style={styles.demoCard}>
              <Text style={styles.demoTitle}>Supported Exercises:</Text>
              <View style={styles.exerciseGrid}>
                {exerciseTypes.map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseItem}>
                    <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            <GlassCard style={styles.featuresCard}>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Real-time form analysis</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Safety score assessment</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Detailed feedback per body part</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>Improvement suggestions</Text>
              </View>
            </GlassCard>

            <ActionButton
              title="🚀 Unlock with Pro"
              onPress={() => setShowUpgradeModal(true)}
              variant="premium"
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>

        <UpgradeModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Form Correction"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎥 Form Corrector</Text>
          <Text style={styles.subtitle}>
            AI-powered workout form analysis
          </Text>
        </View>

        {/* Video Section */}
        {!videoUri && !isAnalyzing && !result && (
          <GlassCard style={styles.uploadCard}>
            <Ionicons name="videocam" size={48} color={Colors.primary} />
            <Text style={styles.uploadTitle}>Record Your Form</Text>
            <Text style={styles.uploadSubtitle}>
              Record or upload a video of your exercise for AI analysis
            </Text>
            
            <View style={styles.uploadButtons}>
              <ActionButton
                title="📹 Record"
                onPress={handleStartRecording}
                variant="primary"
              />
              <ActionButton
                title="📁 Upload"
                onPress={handlePickVideo}
                variant="outline"
              />
            </View>
          </GlassCard>
        )}

        {/* Video Preview */}
        {videoUri && !isAnalyzing && !result && (
          <GlassCard style={styles.videoPreview}>
            <View style={styles.videoPlaceholder}>
              <Ionicons name="play-circle" size={48} color={Colors.text} />
              <Text style={styles.videoText}>Video recorded</Text>
            </View>
          </GlassCard>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <GlassCard style={styles.analyzingCard}>
            <View style={styles.analyzingContent}>
              <Ionicons name="scan" size={48} color={Colors.primary} />
              <Text style={styles.analyzingTitle}>Analyzing Your Form...</Text>
              <Text style={styles.analyzingSubtitle}>
                Our AI is checking your technique for safety and effectiveness
              </Text>
              
              <View style={styles.loadingDots}>
                <View style={[styles.loadingDot, { opacity: 0.3 }]} />
                <View style={[styles.loadingDot, { opacity: 0.6 }]} />
                <View style={[styles.loadingDot, { opacity: 1 }]} />
              </View>
            </View>
          </GlassCard>
        )}

        {/* Results */}
        {result && (
          <View style={styles.resultsSection}>
            {/* Score Card */}
            <GlassCard 
              style={styles.scoreCard}
              glowColor={getScoreColor(result.safety_score)}
            >
              <Text style={styles.exerciseDetected}>
                {result.exercise_detected} Detected
              </Text>
              
              <View style={styles.scoreContainer}>
                <Text style={[
                  styles.scoreValue, 
                  { color: getScoreColor(result.safety_score) }
                ]}>
                  {result.safety_score}
                </Text>
                <Text style={styles.scoreLabel}>Safety Score</Text>
              </View>

              <View style={styles.scoreMeter}>
                <View style={styles.scoreMeterTrack}>
                  <View 
                    style={[
                      styles.scoreMeterFill,
                      { 
                        width: `${result.safety_score}%`,
                        backgroundColor: getScoreColor(result.safety_score),
                      }
                    ]} 
                  />
                </View>
              </View>
            </GlassCard>

            {/* Feedback Items */}
            <Text style={styles.sectionTitle}>Detailed Feedback</Text>
            {result.feedback.map((item, index) => (
              <GlassCard key={index} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={[
                    styles.severityIndicator,
                    { backgroundColor: getSeverityColor(item.severity) }
                  ]} />
                  <Text style={styles.feedbackCategory}>{item.category}</Text>
                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: `${getSeverityColor(item.severity)}20` }
                  ]}>
                    <Text style={[
                      styles.severityText,
                      { color: getSeverityColor(item.severity) }
                    ]}>
                      {item.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.feedbackIssue}>{item.issue}</Text>
                
                <View style={styles.suggestionBox}>
                  <Ionicons name="bulb" size={16} color={Colors.carbs} />
                  <Text style={styles.suggestionText}>{item.suggestion}</Text>
                </View>
              </GlassCard>
            ))}

            {/* Overall Assessment */}
            <GlassCard style={styles.assessmentCard}>
              <View style={styles.assessmentHeader}>
                <Ionicons name="clipboard" size={20} color={Colors.primary} />
                <Text style={styles.assessmentTitle}>Overall Assessment</Text>
              </View>
              <Text style={styles.assessmentText}>{result.overall_assessment}</Text>
            </GlassCard>

            {/* Try Again */}
            <ActionButton
              title="Analyze Another Video"
              onPress={() => {
                setVideoUri(null);
                setResult(null);
              }}
              variant="outline"
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Form Correction"
      />
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
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  uploadCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  uploadSubtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  videoPreview: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  videoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
  },
  videoText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  analyzingCard: {
    padding: Spacing.xl,
  },
  analyzingContent: {
    alignItems: 'center',
  },
  analyzingTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  analyzingSubtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
  resultsSection: {
    marginTop: Spacing.md,
  },
  scoreCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  exerciseDetected: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: Typography.bold,
  },
  scoreLabel: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  scoreMeter: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  scoreMeterTrack: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreMeterFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  feedbackCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  severityIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  feedbackCategory: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: Typography.small,
    fontWeight: Typography.bold,
  },
  feedbackIssue: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  suggestionBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: Typography.caption,
    color: Colors.text,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  assessmentCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  assessmentTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  assessmentText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  closeCamera: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.full,
  },
  recordingGuide: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  guideText: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  guideSubtext: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255,59,48,0.3)',
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error,
  },
  recordButtonInnerActive: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  // Locked state styles
  lockedContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  lockedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.glow(Colors.premium),
  },
  lockedTitle: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  lockedSubtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  demoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  demoTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exerciseItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exerciseIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  featuresCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.body,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
});
