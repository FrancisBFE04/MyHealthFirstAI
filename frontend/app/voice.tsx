/**
 * Voice Logging Screen - Speak to log food
 * Feature: Audio transcription + AI parsing to structured data (Pro only)
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
  Platform,
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassCard, ActionButton, UpgradeModal } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { API_CONFIG } from '../constants/config';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useUser } from '../contexts/UserContext';
import { processVoiceLog, VoiceLogResult } from '../services/api';

export default function VoiceScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [result, setResult] = useState<VoiceLogResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const recording = useRef<Audio.Recording | null>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { isPro, canUseVoiceLogging } = useSubscription();
  const { logFood } = useUser();

  const examplePhrases = [
    "I had 2 eggs and a slice of toast for breakfast",
    "Just ate a chicken salad with olive oil dressing",
    "Had a protein shake with banana",
    "Snacked on 10 almonds and an apple",
  ];

  const startRecording = async () => {
    if (!canUseVoiceLogging) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone access is needed for voice logging.');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recording.current = newRecording;
      setIsRecording(true);
      setRecordingDuration(0);
      setResult(null);

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;

    try {
      // Stop duration counter
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      setIsRecording(false);
      setIsProcessing(true);

      // Stop recording
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;

      if (uri) {
        await processAudio(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process recording.');
    }
  };

  const processAudio = async (uri: string) => {
    try {
      // Convert audio file to base64
      let audioBase64: string;
      
      if (Platform.OS === 'web') {
        // For web, fetch the blob and convert to base64
        const response = await fetch(uri);
        const blob = await response.blob();
        audioBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:audio/webm;base64,")
            const base64 = result.split(',')[1] || result;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // For native, use FileSystem
        audioBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Determine audio format based on platform
      const audioFormat = Platform.OS === 'web' ? 'webm' : 'm4a';

      // Call the voice log API
      const response = await processVoiceLog(audioBase64, audioFormat);
      
      if (response.success && response.data) {
        // Map API response to our format
        const apiResult = response.data;
        
        // If we got transcription but need to parse foods from the API format
        if (apiResult.transcript && apiResult.parsed_foods) {
          setResult(apiResult);
        } else if ((response.data as any).transcription && (response.data as any).food) {
          // Handle backend format (transcription + food object)
          const backendData = response.data as any;
          const mappedResult: VoiceLogResult = {
            transcript: backendData.transcription || backendData.transcript,
            parsed_foods: backendData.parsed_foods || backendData.food?.items?.map((item: any) => ({
              name: item.name || 'Food Item',
              quantity: item.quantity || 1,
              unit: item.portion || item.unit || 'serving',
              calories: item.calories || 0,
              protein: item.protein || 0,
              carbs: item.carbs || 0,
              fat: item.fat || 0,
            })) || [{
              name: backendData.food?.food_name || backendData.food?.name || 'Food Item',
              quantity: 1,
              unit: backendData.food?.portion_size || 'serving',
              calories: backendData.food?.calories || 0,
              protein: backendData.food?.protein || 0,
              carbs: backendData.food?.carbs || 0,
              fat: backendData.food?.fat || 0,
            }],
          };
          setResult(mappedResult);
        }
      } else {
        // API call failed - show text input option
        console.log('API failed, showing text input');
        setShowTextInput(true);
      }
    } catch (error) {
      console.error('Failed to process audio:', error);
      setShowTextInput(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process text input to food
  const processTextInput = async () => {
    if (!textInput.trim()) {
      Alert.alert('Error', 'Please enter what you ate.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call the text parsing endpoint
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/voice/parse-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const mappedResult: VoiceLogResult = {
          transcript: data.transcript || data.transcription || textInput,
          parsed_foods: data.parsed_foods || [{
            name: data.food?.food_name || 'Food Item',
            quantity: 1,
            unit: data.food?.portion_size || 'serving',
            calories: data.food?.calories || 0,
            protein: data.food?.protein || 0,
            carbs: data.food?.carbs || 0,
            fat: data.food?.fat || 0,
          }],
        };
        setResult(mappedResult);
        setShowTextInput(false);
        setTextInput('');
      } else {
        Alert.alert('Error', data.error || 'Failed to parse food. Please try again.');
      }
    } catch (error) {
      console.error('Text parsing error:', error);
      Alert.alert('Error', 'Failed to analyze food. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogAll = async () => {
    if (!result) return;

    // Sum up all foods
    const totals = result.parsed_foods.reduce(
      (acc, food) => ({
        caloriesConsumed: acc.caloriesConsumed + food.calories,
        proteinConsumed: acc.proteinConsumed + food.protein,
        carbsConsumed: acc.carbsConsumed + food.carbs,
        fatConsumed: acc.fatConsumed + food.fat,
      }),
      { caloriesConsumed: 0, proteinConsumed: 0, carbsConsumed: 0, fatConsumed: 0 }
    );

    await logFood(totals);
    Alert.alert('Success! 🎉', 'All foods have been logged to your diary.');
    setResult(null);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              <Ionicons name="lock-closed" size={32} color={Colors.background} />
            </LinearGradient>
            
            <Text style={styles.lockedTitle}>Voice Logging</Text>
            <Text style={styles.lockedSubtitle}>
              Speak to log your meals hands-free. Our AI will transcribe and 
              extract nutrition data automatically.
            </Text>

            <GlassCard style={styles.demoCard}>
              <Text style={styles.demoTitle}>Example phrases:</Text>
              {examplePhrases.map((phrase, index) => (
                <View key={index} style={styles.phraseRow}>
                  <Ionicons name="mic" size={16} color={Colors.textSecondary} />
                  <Text style={styles.phraseText}>"{phrase}"</Text>
                </View>
              ))}
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
          feature="Voice Logging"
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
          <Text style={styles.title}>🎙️ Voice Log</Text>
          <Text style={styles.subtitle}>
            Speak naturally to log your food
          </Text>
        </View>

        {/* Recording Button */}
        <View style={styles.recordingSection}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={isRecording 
                ? [Colors.error, '#FF6B6B'] 
                : [Colors.primary, Colors.secondary]
              }
              style={styles.recordButtonGradient}
            >
              {isProcessing ? (
                <Ionicons name="hourglass" size={40} color={Colors.text} />
              ) : (
                <Ionicons 
                  name={isRecording ? 'stop' : 'mic'} 
                  size={40} 
                  color={Colors.text} 
                />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.recordingStatus}>
            {isProcessing 
              ? 'Processing...' 
              : isRecording 
                ? `Recording ${formatDuration(recordingDuration)}` 
                : 'Tap to start recording'}
          </Text>

          {isRecording && (
            <View style={styles.pulsingIndicator}>
              <View style={[styles.pulse, styles.pulse1]} />
              <View style={[styles.pulse, styles.pulse2]} />
              <View style={[styles.pulse, styles.pulse3]} />
            </View>
          )}

          {/* Text Input Toggle */}
          <TouchableOpacity
            style={styles.textInputToggle}
            onPress={() => setShowTextInput(!showTextInput)}
          >
            <Ionicons name="keypad" size={20} color={Colors.textSecondary} />
            <Text style={styles.textInputToggleText}>
              {showTextInput ? 'Hide text input' : 'Or type what you ate'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Text Input Section */}
        {showTextInput && (
          <GlassCard style={styles.textInputCard}>
            <Text style={styles.textInputLabel}>Type what you ate:</Text>
            <TextInput
              style={styles.textInputField}
              placeholder="e.g., I had pizza and a coke for lunch"
              placeholderTextColor={Colors.textSecondary}
              value={textInput}
              onChangeText={setTextInput}
              multiline
              numberOfLines={3}
            />
            <ActionButton
              title={isProcessing ? "Analyzing..." : "Analyze Food"}
              onPress={processTextInput}
              variant="primary"
              size="md"
              fullWidth
              disabled={isProcessing || !textInput.trim()}
            />
          </GlassCard>
        )}

        {/* Results */}
        {result && (
          <View style={styles.resultsSection}>
            {/* Transcript */}
            <GlassCard style={styles.transcriptCard}>
              <View style={styles.transcriptHeader}>
                <Ionicons name="document-text" size={20} color={Colors.primary} />
                <Text style={styles.transcriptTitle}>Transcript</Text>
              </View>
              <Text style={styles.transcriptText}>"{result.transcript}"</Text>
            </GlassCard>

            {/* Parsed Foods */}
            <Text style={styles.sectionTitle}>Detected Foods</Text>
            {result.parsed_foods.map((food, index) => (
              <GlassCard key={index} style={styles.foodCard}>
                <View style={styles.foodHeader}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodQuantity}>
                    {food.quantity} {food.unit}
                  </Text>
                </View>
                
                <View style={styles.macroRow}>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: Colors.accent }]}>
                      {food.calories}
                    </Text>
                    <Text style={styles.macroLabel}>kcal</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: Colors.protein }]}>
                      {food.protein}g
                    </Text>
                    <Text style={styles.macroLabel}>protein</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: Colors.carbs }]}>
                      {food.carbs}g
                    </Text>
                    <Text style={styles.macroLabel}>carbs</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, { color: Colors.fat }]}>
                      {food.fat}g
                    </Text>
                    <Text style={styles.macroLabel}>fat</Text>
                  </View>
                </View>
              </GlassCard>
            ))}

            {/* Totals and Log Button */}
            <GlassCard style={styles.totalsCard}>
              <Text style={styles.totalsTitle}>Total</Text>
              <View style={styles.totalsRow}>
                <Text style={styles.totalValue}>
                  {result.parsed_foods.reduce((sum, f) => sum + f.calories, 0)} kcal
                </Text>
                <Text style={styles.totalDivider}>•</Text>
                <Text style={styles.totalValue}>
                  {result.parsed_foods.reduce((sum, f) => sum + f.protein, 0)}g P
                </Text>
                <Text style={styles.totalDivider}>•</Text>
                <Text style={styles.totalValue}>
                  {result.parsed_foods.reduce((sum, f) => sum + f.carbs, 0)}g C
                </Text>
                <Text style={styles.totalDivider}>•</Text>
                <Text style={styles.totalValue}>
                  {result.parsed_foods.reduce((sum, f) => sum + f.fat, 0)}g F
                </Text>
              </View>
            </GlassCard>

            <ActionButton
              title="✓ Log All Foods"
              onPress={handleLogAll}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        )}

        {/* Tips */}
        {!result && !isRecording && !isProcessing && (
          <GlassCard style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips for best results</Text>
            <Text style={styles.tipText}>• Speak clearly and naturally</Text>
            <Text style={styles.tipText}>• Include quantities when possible</Text>
            <Text style={styles.tipText}>• Mention cooking methods (grilled, fried, etc.)</Text>
            <Text style={styles.tipText}>• Say things like "I had..." or "I ate..."</Text>
          </GlassCard>
        )}
      </ScrollView>

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Voice Logging"
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
    marginBottom: Spacing.xl,
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
  recordingSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  recordButton: {
    marginBottom: Spacing.lg,
    ...Shadows.large,
  },
  recordButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  recordButtonGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingStatus: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  pulsingIndicator: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    marginHorizontal: 4,
  },
  pulse1: { opacity: 0.3 },
  pulse2: { opacity: 0.6 },
  pulse3: { opacity: 1 },
  resultsSection: {
    marginTop: Spacing.lg,
  },
  transcriptCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  transcriptTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  transcriptText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  foodCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  foodName: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  foodQuantity: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: Typography.body,
    fontWeight: Typography.bold,
  },
  macroLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  totalsCard: {
    padding: Spacing.md,
    marginVertical: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
  },
  totalsTitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalValue: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  totalDivider: {
    color: Colors.textTertiary,
    marginHorizontal: Spacing.sm,
  },
  tipsCard: {
    padding: Spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tipText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
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
    marginBottom: Spacing.xl,
    width: '100%',
  },
  demoTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  phraseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  phraseText: {
    flex: 1,
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontStyle: 'italic',
  },
  // Text input styles
  textInputToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  textInputToggleText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  textInputCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  textInputLabel: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  textInputField: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    marginBottom: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
