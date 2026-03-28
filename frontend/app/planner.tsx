/**
 * Meal Planner Screen - Weekly Calendar View
 * Feature: Plan meals ahead with drag-and-drop and AI suggestions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard, ActionButton } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius, GlassStyle } from '../constants/theme';

interface PlannedMeal {
  id: string;
  name: string;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface DayPlan {
  date: Date;
  meals: PlannedMeal[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const QUICK_MEALS: PlannedMeal[] = [
  { id: '1', name: 'Oatmeal with Berries', calories: 320, mealType: 'breakfast' },
  { id: '2', name: 'Greek Yogurt Parfait', calories: 280, mealType: 'breakfast' },
  { id: '3', name: 'Avocado Toast', calories: 350, mealType: 'breakfast' },
  { id: '4', name: 'Grilled Chicken Salad', calories: 420, mealType: 'lunch' },
  { id: '5', name: 'Turkey Wrap', calories: 380, mealType: 'lunch' },
  { id: '6', name: 'Quinoa Bowl', calories: 450, mealType: 'lunch' },
  { id: '7', name: 'Salmon with Veggies', calories: 520, mealType: 'dinner' },
  { id: '8', name: 'Chicken Stir-Fry', calories: 480, mealType: 'dinner' },
  { id: '9', name: 'Pasta Primavera', calories: 550, mealType: 'dinner' },
  { id: '10', name: 'Protein Bar', calories: 180, mealType: 'snack' },
  { id: '11', name: 'Mixed Nuts', calories: 200, mealType: 'snack' },
  { id: '12', name: 'Apple with Peanut Butter', calories: 220, mealType: 'snack' },
];

export default function PlannerScreen() {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [weekPlans, setWeekPlans] = useState<Record<string, PlannedMeal[]>>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<typeof MEAL_TYPES[number]>('breakfast');
  const [customMealName, setCustomMealName] = useState('');
  const [customCalories, setCustomCalories] = useState('');

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekDays(): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function getDayMeals(date: Date): PlannedMeal[] {
    return weekPlans[formatDateKey(date)] || [];
  }

  function getDayCalories(date: Date): number {
    return getDayMeals(date).reduce((sum, meal) => sum + meal.calories, 0);
  }

  function handlePrevWeek() {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  }

  function handleNextWeek() {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  }

  function handleDayPress(date: Date) {
    setSelectedDay(date);
    setShowMealPicker(true);
  }

  function handleAddMeal(meal: PlannedMeal) {
    if (!selectedDay) return;
    
    const dateKey = formatDateKey(selectedDay);
    const existingMeals = weekPlans[dateKey] || [];
    
    const newMeal: PlannedMeal = {
      ...meal,
      id: `${Date.now()}-${Math.random()}`,
    };
    
    setWeekPlans({
      ...weekPlans,
      [dateKey]: [...existingMeals, newMeal],
    });
    
    setShowMealPicker(false);
    Alert.alert('Added! ✅', `${meal.name} added to ${selectedDay.toLocaleDateString()}`);
  }

  function handleAddCustomMeal() {
    if (!customMealName || !customCalories || !selectedDay) return;
    
    const newMeal: PlannedMeal = {
      id: `${Date.now()}-${Math.random()}`,
      name: customMealName,
      calories: parseInt(customCalories),
      mealType: selectedMealType,
    };
    
    const dateKey = formatDateKey(selectedDay);
    const existingMeals = weekPlans[dateKey] || [];
    
    setWeekPlans({
      ...weekPlans,
      [dateKey]: [...existingMeals, newMeal],
    });
    
    setCustomMealName('');
    setCustomCalories('');
    setShowMealPicker(false);
    Alert.alert('Added! ✅', `${customMealName} added to your plan`);
  }

  function handleRemoveMeal(date: Date, mealId: string) {
    const dateKey = formatDateKey(date);
    const existingMeals = weekPlans[dateKey] || [];
    
    setWeekPlans({
      ...weekPlans,
      [dateKey]: existingMeals.filter(m => m.id !== mealId),
    });
  }

  function getMealIcon(mealType: string): string {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍿';
      default: return '🍽️';
    }
  }

  const weekDays = getWeekDays();
  const weekTotal = weekDays.reduce((sum, day) => sum + getDayCalories(day), 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📅 Meal Planner</Text>
        <Text style={styles.subtitle}>Plan your week ahead</Text>
      </View>

      {/* Week Navigation */}
      <GlassCard style={styles.weekNav}>
        <TouchableOpacity onPress={handlePrevWeek} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.weekInfo}>
          <Text style={styles.weekLabel}>
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' - '}
            {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <Text style={styles.weekTotal}>{weekTotal} kcal planned</Text>
        </View>
        
        <TouchableOpacity onPress={handleNextWeek} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </GlassCard>

      {/* Week Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {weekDays.map((day, index) => {
          const dayMeals = getDayMeals(day);
          const dayCalories = getDayCalories(day);
          const today = isToday(day);
          
          return (
            <GlassCard
              key={index}
              style={{...styles.dayCard, ...(today ? styles.todayCard : {})}}
            >
              <View style={styles.dayHeader}>
                <View>
                  <Text style={[styles.dayName, today && styles.todayText]}>
                    {DAYS_OF_WEEK[day.getDay()]}
                    {today && ' (Today)'}
                  </Text>
                  <Text style={styles.dayDate}>
                    {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.dayStats}>
                  <Text style={styles.dayCalories}>{dayCalories}</Text>
                  <Text style={styles.dayCaloriesLabel}>kcal</Text>
                </View>
              </View>
              
              {/* Meals List */}
              {dayMeals.length > 0 ? (
                <View style={styles.mealsList}>
                  {dayMeals.map((meal) => (
                    <View key={meal.id} style={styles.mealItem}>
                      <Text style={styles.mealIcon}>{getMealIcon(meal.mealType)}</Text>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveMeal(day, meal.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close-circle" size={20} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noMeals}>No meals planned</Text>
              )}
              
              {/* Add Button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleDayPress(day)}
              >
                <Ionicons name="add-circle" size={20} color={Colors.primary} />
                <Text style={styles.addButtonText}>Add meal</Text>
              </TouchableOpacity>
            </GlassCard>
          );
        })}

        {/* Tips Card */}
        <GlassCard style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Planning Tips</Text>
          <Text style={styles.tipItem}>• Prep meals on Sunday for the week</Text>
          <Text style={styles.tipItem}>• Aim for 2000-2500 kcal daily</Text>
          <Text style={styles.tipItem}>• Include protein at every meal</Text>
          <Text style={styles.tipItem}>• Plan healthy snacks to avoid cravings</Text>
        </GlassCard>
      </ScrollView>

      {/* Meal Picker Modal */}
      {showMealPicker && selectedDay && (
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Meal</Text>
              <TouchableOpacity onPress={() => setShowMealPicker(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDate}>
              {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
            
            {/* Meal Type Selector */}
            <View style={styles.mealTypeSelector}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === type && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text style={styles.mealTypeIcon}>{getMealIcon(type)}</Text>
                  <Text style={[
                    styles.mealTypeText,
                    selectedMealType === type && styles.mealTypeTextActive,
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Quick Add */}
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <ScrollView 
              style={styles.quickMeals}
              showsVerticalScrollIndicator={false}
            >
              {QUICK_MEALS.filter(m => m.mealType === selectedMealType).map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={styles.quickMealItem}
                  onPress={() => handleAddMeal(meal)}
                >
                  <Text style={styles.quickMealName}>{meal.name}</Text>
                  <Text style={styles.quickMealCalories}>{meal.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Custom Entry */}
            <Text style={styles.sectionTitle}>Custom Meal</Text>
            <TextInput
              style={styles.input}
              placeholder="Meal name..."
              placeholderTextColor={Colors.textSecondary}
              value={customMealName}
              onChangeText={setCustomMealName}
            />
            <TextInput
              style={styles.input}
              placeholder="Calories"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              value={customCalories}
              onChangeText={setCustomCalories}
            />
            <ActionButton
              title="Add Custom Meal"
              onPress={handleAddCustomMeal}
              variant="primary"
              disabled={!customMealName || !customCalories}
            />
          </GlassCard>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: 0,
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
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: Spacing.lg,
    padding: Spacing.md,
  },
  navButton: {
    padding: Spacing.sm,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  weekTotal: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.xxl,
  },
  dayCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  dayName: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  todayText: {
    color: Colors.primary,
  },
  dayDate: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dayStats: {
    alignItems: 'flex-end',
  },
  dayCalories: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
    color: Colors.accent,
  },
  dayCaloriesLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  mealsList: {
    marginTop: Spacing.sm,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  mealIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: Typography.body,
    color: Colors.text,
  },
  mealCalories: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  noMeals: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginVertical: Spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  addButtonText: {
    fontSize: Typography.caption,
    color: Colors.primary,
    marginLeft: 4,
  },
  tipsCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  tipsTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tipItem: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modal: {
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  modalDate: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  mealTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mealTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  mealTypeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  mealTypeText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  mealTypeTextActive: {
    color: Colors.text,
    fontWeight: Typography.semibold,
  },
  sectionTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  quickMeals: {
    maxHeight: 150,
    marginBottom: Spacing.lg,
  },
  quickMealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  quickMealName: {
    fontSize: Typography.body,
    color: Colors.text,
  },
  quickMealCalories: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  input: {
    ...GlassStyle,
    padding: Spacing.md,
    fontSize: Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
});
