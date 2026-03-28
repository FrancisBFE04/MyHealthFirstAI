/**
 * AI Coach Screen - Chat interface for personalized nutrition advice
 * Feature: Gemini-powered conversational AI coach
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassCard } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useUser } from '../contexts/UserContext';
import { chatWithCoach, ChatMessage } from '../services/api';

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
}

export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! 👋 I'm your AI nutrition coach. I can help you with:\n\n• Personalized meal suggestions\n• Understanding your macros\n• Answering nutrition questions\n• Tips to reach your health goals\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const { todayProgress, adjustedTargets, workoutPlan } = useUser();

  const quickPrompts = [
    "What should I eat for dinner?",
    "How can I hit my protein goal?",
    "Suggest a healthy snack",
    "Explain my macro targets",
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Prepare messages for API (without id and timestamp)
      const apiMessages: ChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      apiMessages.push({ role: 'user', content: text.trim() });

      // Call API with user context
      const result = await chatWithCoach(apiMessages, {
        currentCalories: todayProgress.caloriesConsumed,
        targetCalories: adjustedTargets.calories,
        workoutPlan: workoutPlan,
      });

      let responseText = '';

      if (result.success && result.data) {
        responseText = result.data.response;
      } else {
        // Mock response for demo
        responseText = generateMockResponse(text.trim());
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.avatarGradient}
          >
            <Ionicons name="chatbubbles" size={24} color={Colors.text} />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Coach</Text>
            <Text style={styles.subtitle}>Powered by Gemini</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.assistantAvatar}>
                  <Ionicons name="sparkles" size={16} color={Colors.primary} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.role === 'user' && styles.userMessageText,
                ]}>
                  {message.content}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={styles.typingIndicator}>
              <View style={styles.assistantAvatar}>
                <Ionicons name="sparkles" size={16} color={Colors.primary} />
              </View>
              <GlassCard style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </GlassCard>
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickPromptsContainer}
            contentContainerStyle={styles.quickPromptsContent}
          >
            {quickPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickPrompt}
                onPress={() => handleQuickPrompt(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your AI coach..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.text : Colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Mock response generator for demo purposes
function generateMockResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('dinner') || input.includes('eat')) {
    return "Based on your current progress today, I'd recommend a high-protein dinner! 🍽️\n\nHere are some options:\n\n• **Grilled Salmon with Vegetables** - 450 kcal, 35g protein\n• **Chicken Stir-Fry** - 380 kcal, 30g protein\n• **Turkey Meatballs with Quinoa** - 420 kcal, 32g protein\n\nWould you like me to provide a detailed recipe for any of these?";
  }
  
  if (input.includes('protein')) {
    return "Great question about protein! 💪\n\nTo hit your protein goal, try these strategies:\n\n1. **Add Greek yogurt** to breakfast (15-20g protein)\n2. **Snack on cottage cheese** or hard-boiled eggs\n3. **Include lean meat** in lunch and dinner\n4. **Use protein powder** in smoothies\n\nYour current target is 150g/day. You're at 67g so far - you've got this!";
  }
  
  if (input.includes('snack')) {
    return "Here are some healthy snack ideas! 🍎\n\n**High Protein:**\n• Greek yogurt with berries (150 kcal)\n• String cheese + almonds (180 kcal)\n• Protein bar (200 kcal)\n\n**Low Calorie:**\n• Veggie sticks with hummus (100 kcal)\n• Apple slices with almond butter (150 kcal)\n• Rice cakes with avocado (120 kcal)\n\nWhich type of snack are you looking for?";
  }
  
  if (input.includes('macro')) {
    return "Let me explain your macro targets! 📊\n\n**Your Daily Goals:**\n• Calories: 2000 kcal\n• Protein: 150g (30%)\n• Carbs: 200g (40%)\n• Fat: 65g (30%)\n\nThese are optimized for your 'Moderate Activity' workout plan. Protein is higher to support muscle maintenance.\n\nWant me to adjust these based on your goals?";
  }
  
  return "That's a great question! 🤔\n\nBased on your current nutrition data, I can see you're making good progress today. \n\nIs there anything specific about your diet, meal planning, or nutrition goals you'd like help with? I can provide:\n\n• Personalized meal suggestions\n• Recipe ideas\n• Tips to hit your macros\n• Advice for your workout plan";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  assistantMessageWrapper: {
    alignSelf: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  messageBubble: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.background,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  typingBubble: {
    padding: Spacing.md,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  quickPromptsContainer: {
    maxHeight: 50,
    marginBottom: Spacing.sm,
  },
  quickPromptsContent: {
    paddingHorizontal: Spacing.lg,
  },
  quickPrompt: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  quickPromptText: {
    fontSize: Typography.caption,
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.body,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surfaceLight,
  },
});
