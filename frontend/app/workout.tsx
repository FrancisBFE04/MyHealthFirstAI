import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, GlassStyle, Spacing, Typography } from '../constants/theme';
import { GlassCard, ActionButton } from '../components/shared';
import { useUser } from '../contexts/UserContext';
import api, { WorkoutPlanResult } from '../services/api';

const { width } = Dimensions.get('window');

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness', 'Strength'];
const WORKOUT_TYPES = ['Gym', 'Home', 'Both'];
const DAYS_OPTIONS = [2, 3, 4, 5, 6];
const GENDERS = ['Male', 'Female'];

export default function WorkoutScreen() {
  const { profile } = useUser();
  
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [experience, setExperience] = useState('Beginner');
  const [goal, setGoal] = useState('General Fitness');
  const [workoutType, setWorkoutType] = useState('Gym');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  
  // New: Target weight fields
  const [targetWeight, setTargetWeight] = useState('');
  const [targetWeeks, setTargetWeeks] = useState('12');
  
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workout' | 'diet' | 'analytics'>('workout');
  const [selectedDay, setSelectedDay] = useState(0);
  
  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
    return null;
  };
  
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#3498db' };
    if (bmi < 25) return { label: 'Normal', color: '#2ecc71' };
    if (bmi < 30) return { label: 'Overweight', color: '#f39c12' };
    return { label: 'Obese', color: '#e74c3c' };
  };

  // Calculate weight change and weekly target
  const getWeightChangeInfo = () => {
    const currentW = parseFloat(weight);
    const targetW = parseFloat(targetWeight);
    const weeks = parseInt(targetWeeks) || 12;
    
    if (!currentW || !targetW || currentW === targetW) return null;
    
    const diff = targetW - currentW;
    const weeklyChange = diff / weeks;
    const isLoss = diff < 0;
    const dailyCalorieAdjustment = Math.round(Math.abs(weeklyChange) * 1100); // ~1100 cal = 1kg
    
    return {
      totalChange: Math.abs(diff).toFixed(1),
      weeklyChange: Math.abs(weeklyChange).toFixed(2),
      isLoss,
      weeks,
      dailyCalorieAdjustment,
      isHealthy: Math.abs(weeklyChange) <= 1, // Max 1kg per week is healthy
    };
  };

  const weightInfo = getWeightChangeInfo();
  
  const generatePlan = async () => {
    if (!height || !weight || !age) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.generateWorkoutPlan({
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
        age: parseInt(age),
        gender: gender.toLowerCase(),
        experience_level: experience.toLowerCase(),
        goal: goal.toLowerCase().replace(' ', '_'),
        workout_type: workoutType.toLowerCase(),
        days_per_week: daysPerWeek,
      });
      if (response.success && response.data && response.data.weekly_workout_plan) {
        setWorkoutPlan(response.data);
      } else {
        // Use mock data when API fails (quota exceeded, etc.)
        const mockPlan = generateMockWorkoutPlan();
        setWorkoutPlan(mockPlan);
        setError('Using demo data (API quota exceeded - try again later)');
      }
    } catch (err: unknown) {
      // Use mock data on error
      const mockPlan = generateMockWorkoutPlan();
      setWorkoutPlan(mockPlan);
      setError('Using demo data (API unavailable)');
    } finally {
      setLoading(false);
    }
  };

  const generateMockWorkoutPlan = (): WorkoutPlanResult => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    const calculatedBmi = w / (h * h);
    const dailyCal = Math.round(w * 30);
    
    // Different exercises based on focus type
    const getExercisesForFocus = (focus: string, isHome: boolean) => {
      switch (focus) {
        case 'Upper Body':
          return isHome ? [
            { exercise: 'Push-ups', sets: 3, reps: '10-15', rest: '60s', notes: 'Focus on form' },
            { exercise: 'Diamond Push-ups', sets: 3, reps: '8-12', rest: '60s', notes: 'Tricep focus' },
            { exercise: 'Pike Push-ups', sets: 3, reps: '8-10', rest: '60s', notes: 'Shoulder focus' },
            { exercise: 'Dips (Chair)', sets: 3, reps: '10-12', rest: '60s', notes: 'Keep elbows close' },
            { exercise: 'Plank Shoulder Taps', sets: 3, reps: '20 taps', rest: '45s', notes: 'Keep hips stable' },
          ] : [
            { exercise: 'Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Control the weight' },
            { exercise: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', notes: 'Upper chest focus' },
            { exercise: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '60s', notes: 'Squeeze at bottom' },
            { exercise: 'Seated Rows', sets: 3, reps: '10-12', rest: '60s', notes: 'Pull to belly button' },
            { exercise: 'Shoulder Press', sets: 3, reps: '10-12', rest: '60s', notes: 'Full range of motion' },
          ];
        case 'Lower Body':
          return isHome ? [
            { exercise: 'Bodyweight Squats', sets: 4, reps: '15-20', rest: '60s', notes: 'Go deep' },
            { exercise: 'Lunges', sets: 3, reps: '12 each leg', rest: '60s', notes: 'Keep knee over ankle' },
            { exercise: 'Glute Bridges', sets: 3, reps: '15-20', rest: '45s', notes: 'Squeeze at top' },
            { exercise: 'Calf Raises', sets: 3, reps: '20', rest: '45s', notes: 'Full stretch' },
            { exercise: 'Wall Sit', sets: 3, reps: '30-45s hold', rest: '60s', notes: 'Thighs parallel' },
          ] : [
            { exercise: 'Barbell Squats', sets: 4, reps: '8-10', rest: '120s', notes: 'Full depth' },
            { exercise: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '90s', notes: 'Feel the stretch' },
            { exercise: 'Leg Press', sets: 3, reps: '12-15', rest: '90s', notes: 'Controlled tempo' },
            { exercise: 'Leg Curls', sets: 3, reps: '12-15', rest: '60s', notes: 'Squeeze hamstrings' },
            { exercise: 'Leg Extensions', sets: 3, reps: '12-15', rest: '60s', notes: 'Quad isolation' },
          ];
        case 'Core & Cardio':
          return isHome ? [
            { exercise: 'Plank', sets: 3, reps: '45-60s hold', rest: '45s', notes: 'Keep body straight' },
            { exercise: 'Mountain Climbers', sets: 3, reps: '30 seconds', rest: '30s', notes: 'Fast pace' },
            { exercise: 'Bicycle Crunches', sets: 3, reps: '20 each side', rest: '45s', notes: 'Touch elbow to knee' },
            { exercise: 'Burpees', sets: 3, reps: '10', rest: '60s', notes: 'Full range' },
            { exercise: 'High Knees', sets: 3, reps: '30 seconds', rest: '30s', notes: 'Drive knees up' },
          ] : [
            { exercise: 'Cable Crunches', sets: 3, reps: '15-20', rest: '45s', notes: 'Engage core' },
            { exercise: 'Hanging Leg Raises', sets: 3, reps: '10-15', rest: '60s', notes: 'Control the swing' },
            { exercise: 'Treadmill Intervals', sets: 1, reps: '15 min', rest: '0s', notes: '30s sprint, 30s walk' },
            { exercise: 'Russian Twists', sets: 3, reps: '20 total', rest: '45s', notes: 'Use weight plate' },
            { exercise: 'Rowing Machine', sets: 1, reps: '10 min', rest: '0s', notes: 'Moderate pace' },
          ];
        case 'Full Body':
          return isHome ? [
            { exercise: 'Burpees', sets: 3, reps: '10', rest: '60s', notes: 'Full range' },
            { exercise: 'Jump Squats', sets: 3, reps: '12', rest: '60s', notes: 'Explosive jump' },
            { exercise: 'Push-ups', sets: 3, reps: '12-15', rest: '60s', notes: 'Chest to floor' },
            { exercise: 'Plank to Downward Dog', sets: 3, reps: '10', rest: '45s', notes: 'Stretch hamstrings' },
            { exercise: 'Superman Hold', sets: 3, reps: '30s hold', rest: '45s', notes: 'Squeeze glutes' },
          ] : [
            { exercise: 'Deadlifts', sets: 4, reps: '6-8', rest: '120s', notes: 'Keep back straight' },
            { exercise: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest: '60s', notes: 'Full stretch at bottom' },
            { exercise: 'Barbell Rows', sets: 3, reps: '8-10', rest: '60s', notes: 'Pull to lower chest' },
            { exercise: 'Walking Lunges', sets: 3, reps: '12 each leg', rest: '60s', notes: 'Hold dumbbells' },
            { exercise: 'Plank', sets: 3, reps: '45s hold', rest: '45s', notes: 'Engage entire core' },
          ];
        case 'HIIT':
          return [
            { exercise: 'Jumping Jacks', sets: 4, reps: '45s', rest: '15s', notes: 'Maximum effort' },
            { exercise: 'Squat Jumps', sets: 4, reps: '45s', rest: '15s', notes: 'Explosive' },
            { exercise: 'Push-up to T-Rotation', sets: 4, reps: '45s', rest: '15s', notes: 'Alternate sides' },
            { exercise: 'Burpees', sets: 4, reps: '45s', rest: '15s', notes: 'Full movement' },
            { exercise: 'High Knees', sets: 4, reps: '45s', rest: '15s', notes: 'Sprint in place' },
          ];
        case 'Active Recovery':
          return [
            { exercise: 'Light Walking', sets: 1, reps: '20 min', rest: '0s', notes: 'Easy pace' },
            { exercise: 'Yoga Flow', sets: 1, reps: '15 min', rest: '0s', notes: 'Focus on breathing' },
            { exercise: 'Foam Rolling', sets: 1, reps: '10 min', rest: '0s', notes: 'Major muscle groups' },
            { exercise: 'Static Stretching', sets: 1, reps: '10 min', rest: '0s', notes: 'Hold 30s each' },
          ];
        default:
          return [
            { exercise: 'Mixed Cardio', sets: 3, reps: '10 min', rest: '60s', notes: 'Moderate intensity' },
            { exercise: 'Bodyweight Squats', sets: 3, reps: '15', rest: '60s', notes: 'Full range' },
            { exercise: 'Push-ups', sets: 3, reps: '10-15', rest: '60s', notes: 'Modify if needed' },
            { exercise: 'Plank', sets: 3, reps: '30s hold', rest: '45s', notes: 'Keep core tight' },
          ];
      }
    };

    const focusTypes = ['Upper Body', 'Lower Body', 'Core & Cardio', 'Full Body', 'HIIT', 'Active Recovery'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const isHome = workoutType === 'home';
    
    // Calculate adjusted calories based on goal
    let adjustedDailyCal = dailyCal;
    let goalDescription = '';
    
    if (weightInfo) {
      if (weightInfo.isLoss) {
        adjustedDailyCal = Math.max(1200, dailyCal - weightInfo.dailyCalorieAdjustment);
        goalDescription = `Lose ${weightInfo.totalChange}kg in ${weightInfo.weeks} weeks (${weightInfo.weeklyChange}kg/week)`;
      } else {
        adjustedDailyCal = dailyCal + weightInfo.dailyCalorieAdjustment;
        goalDescription = `Gain ${weightInfo.totalChange}kg in ${weightInfo.weeks} weeks (${weightInfo.weeklyChange}kg/week)`;
      }
    }

    return {
      user_profile: {
        bmi: calculatedBmi,
        bmi_category: calculatedBmi < 25 ? 'Normal' : calculatedBmi < 30 ? 'Overweight' : 'Obese',
        recommended_daily_calories: adjustedDailyCal,
        macro_split: goal === 'Muscle Gain' 
          ? { protein: '35%', carbs: '40%', fat: '25%' }
          : goal === 'Weight Loss'
          ? { protein: '40%', carbs: '30%', fat: '30%' }
          : { protein: '30%', carbs: '40%', fat: '30%' },
        fitness_assessment: goalDescription || `Based on your BMI of ${calculatedBmi.toFixed(1)}, you're ready to start your ${goal} journey!`,
        target_weight: targetWeight ? parseFloat(targetWeight) : undefined,
        current_weight: w,
        weight_goal: weightInfo ? (weightInfo.isLoss ? 'lose' : 'gain') : undefined,
        weekly_target: weightInfo ? parseFloat(weightInfo.weeklyChange) : undefined,
      },
      weekly_workout_plan: Array.from({ length: daysPerWeek }, (_, i) => {
        const focus = focusTypes[i % focusTypes.length];
        return {
          day: i + 1,
          day_name: dayNames[i % 7],
          focus: focus,
          duration_minutes: focus === 'Active Recovery' ? 30 : focus === 'HIIT' ? 25 : 45,
          calories_burned: focus === 'Active Recovery' ? 150 : focus === 'HIIT' ? 400 : 300 + (i * 25),
          warm_up: focus === 'Active Recovery' 
            ? ['Light walking', 'Gentle stretches'] 
            : ['5 min light cardio', 'Dynamic stretches', 'Joint rotations'],
          main_workout: getExercisesForFocus(focus, isHome),
          cool_down: focus === 'Active Recovery'
            ? ['Deep breathing', 'Meditation (optional)']
            : ['5 min stretching', 'Deep breathing', 'Foam rolling (optional)']
        };
      }),
      diet_plan: {
        daily_calories: adjustedDailyCal,
        meals: [
          { meal: 'Breakfast', time: '7:00 AM', calories: Math.round(adjustedDailyCal * 0.25), options: goal === 'Muscle Gain' ? ['Protein oatmeal', '4 eggs with toast', 'Greek yogurt with nuts'] : ['Oatmeal with berries', 'Greek yogurt', 'Eggs & veggies'] },
          { meal: 'Lunch', time: '12:00 PM', calories: Math.round(adjustedDailyCal * 0.35), options: goal === 'Muscle Gain' ? ['Chicken & rice bowl', 'Lean beef with pasta', 'Salmon with sweet potato'] : ['Grilled chicken salad', 'Brown rice & vegetables', 'Lean protein bowl'] },
          { meal: 'Dinner', time: '7:00 PM', calories: Math.round(adjustedDailyCal * 0.30), options: goal === 'Muscle Gain' ? ['Steak with potatoes', 'Grilled fish with rice', 'Chicken stir-fry'] : ['Salmon with quinoa', 'Stir-fry with tofu', 'Lean beef with veggies'] },
          { meal: 'Snacks', time: 'Between meals', calories: Math.round(adjustedDailyCal * 0.10), options: goal === 'Muscle Gain' ? ['Protein shake', 'Peanut butter toast', 'Trail mix'] : ['Nuts & seeds', 'Protein shake', 'Fresh fruits'] }
        ],
        hydration: goal === 'Muscle Gain' ? 'Drink 3-4 liters of water daily' : 'Drink 8-10 glasses of water daily (2-3 liters)',
        supplements: goal === 'Muscle Gain' 
          ? ['Whey protein', 'Creatine monohydrate', 'Multivitamin', 'Fish oil']
          : ['Multivitamin', 'Protein powder (optional)', 'Omega-3 (optional)'],
        foods_to_prioritize: goal === 'Muscle Gain'
          ? ['High protein foods', 'Complex carbs', 'Lean meats', 'Eggs', 'Dairy']
          : goal === 'Weight Loss'
          ? ['Lean proteins', 'Vegetables', 'Low-calorie foods', 'Fiber-rich foods']
          : ['Lean proteins', 'Vegetables', 'Whole grains', 'Healthy fats'],
        foods_to_avoid: goal === 'Weight Loss'
          ? ['Sugary drinks', 'Fried foods', 'Processed snacks', 'High-calorie sauces', 'Alcohol']
          : ['Sugary drinks', 'Processed foods', 'Excess alcohol', 'Fried foods']
      },
      tips: goal === 'Muscle Gain' ? [
        'Eat in a caloric surplus consistently',
        'Prioritize protein (1.6-2.2g per kg bodyweight)',
        'Progressive overload in your workouts',
        'Get 7-9 hours of sleep for recovery',
        'Stay hydrated and track your progress'
      ] : goal === 'Weight Loss' ? [
        'Maintain your caloric deficit consistently',
        'High protein helps preserve muscle mass',
        'Include cardio 3-4 times per week',
        'Get 7-8 hours of sleep each night',
        'Weigh yourself weekly, same time/conditions'
      ] : [
        'Stay consistent with your workouts',
        'Get 7-8 hours of sleep each night',
        'Track your progress weekly',
        'Stay hydrated throughout the day',
        'Listen to your body and rest when needed'
      ],
      estimated_progress: weightInfo ? {
        '4_weeks': weightInfo.isLoss 
          ? `Expected loss: ~${(parseFloat(weightInfo.weeklyChange) * 4).toFixed(1)}kg`
          : `Expected gain: ~${(parseFloat(weightInfo.weeklyChange) * 4).toFixed(1)}kg lean mass`,
        '8_weeks': weightInfo.isLoss
          ? `Expected loss: ~${(parseFloat(weightInfo.weeklyChange) * 8).toFixed(1)}kg - Visible changes`
          : `Expected gain: ~${(parseFloat(weightInfo.weeklyChange) * 8).toFixed(1)}kg - Strength gains`,
        '12_weeks': weightInfo.isLoss
          ? `Expected loss: ~${(parseFloat(weightInfo.weeklyChange) * 12).toFixed(1)}kg - Major transformation`
          : `Expected gain: ~${(parseFloat(weightInfo.weeklyChange) * 12).toFixed(1)}kg - Visible muscle growth`
      } : {
        '4_weeks': 'Initial strength gains and improved energy',
        '8_weeks': 'Visible muscle tone and better endurance',
        '12_weeks': 'Significant body composition changes'
      }
    };
  };
  
  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Body Metrics</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder="175" placeholderTextColor={Colors.textSecondary} keyboardType="numeric" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="70" placeholderTextColor={Colors.textSecondary} keyboardType="numeric" />
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="25" placeholderTextColor={Colors.textSecondary} keyboardType="numeric" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.optionRow}>
              {GENDERS.map((g) => (
                <TouchableOpacity key={g} style={[styles.optionButton, gender === g && styles.optionButtonActive]} onPress={() => setGender(g as 'Male' | 'Female')}>
                  <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        {bmi && bmiInfo && (
          <View style={[styles.bmiDisplay, { borderColor: bmiInfo.color }]}>
            <Text style={styles.bmiValue}>BMI: {bmi}</Text>
            <Text style={[styles.bmiCategory, { color: bmiInfo.color }]}>{bmiInfo.label}</Text>
          </View>
        )}
      </GlassCard>
      
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>🎯 Fitness Profile</Text>
        <Text style={styles.inputLabel}>Experience Level</Text>
        <View style={styles.chipContainer}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity key={level} style={[styles.chip, experience === level && styles.chipActive]} onPress={() => setExperience(level)}>
              <Text style={[styles.chipText, experience === level && styles.chipTextActive]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.inputLabel}>Goal</Text>
        <View style={styles.chipContainer}>
          {GOALS.map((g) => (
            <TouchableOpacity key={g} style={[styles.chip, goal === g && styles.chipActive]} onPress={() => setGoal(g)}>
              <Text style={[styles.chipText, goal === g && styles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Target Weight Section - shows for Weight Loss or Muscle Gain */}
        {(goal === 'Weight Loss' || goal === 'Muscle Gain') && (
          <View style={styles.targetSection}>
            <Text style={styles.inputLabel}>
              {goal === 'Weight Loss' ? '🎯 Target Weight (kg)' : '💪 Target Weight (kg)'}
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.subLabel}>Target</Text>
                <TextInput 
                  style={styles.input} 
                  value={targetWeight} 
                  onChangeText={setTargetWeight} 
                  placeholder={goal === 'Weight Loss' ? '65' : '80'} 
                  placeholderTextColor={Colors.textSecondary} 
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.subLabel}>Timeframe</Text>
                <View style={styles.weeksSelector}>
                  {['8', '12', '16', '24'].map((w) => (
                    <TouchableOpacity 
                      key={w} 
                      style={[styles.weekOption, targetWeeks === w && styles.weekOptionActive]} 
                      onPress={() => setTargetWeeks(w)}
                    >
                      <Text style={[styles.weekText, targetWeeks === w && styles.weekTextActive]}>{w}w</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Weight Progress Indicator */}
            {weightInfo && (
              <View style={[styles.weightInfoCard, { borderColor: weightInfo.isHealthy ? Colors.success : Colors.warning }]}>
                <View style={styles.weightInfoHeader}>
                  <Ionicons 
                    name={weightInfo.isLoss ? 'trending-down' : 'trending-up'} 
                    size={24} 
                    color={weightInfo.isLoss ? Colors.accent : Colors.success} 
                  />
                  <Text style={styles.weightInfoTitle}>
                    {weightInfo.isLoss ? 'Weight Loss Plan' : 'Muscle Gain Plan'}
                  </Text>
                </View>
                
                <View style={styles.weightStats}>
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatValue}>{weightInfo.totalChange} kg</Text>
                    <Text style={styles.weightStatLabel}>Total {weightInfo.isLoss ? 'Loss' : 'Gain'}</Text>
                  </View>
                  <View style={styles.weightStatDivider} />
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatValue}>{weightInfo.weeklyChange} kg</Text>
                    <Text style={styles.weightStatLabel}>Per Week</Text>
                  </View>
                  <View style={styles.weightStatDivider} />
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatValue}>{weightInfo.weeks}</Text>
                    <Text style={styles.weightStatLabel}>Weeks</Text>
                  </View>
                </View>

                <View style={styles.calorieAdvice}>
                  <Ionicons name="flame" size={18} color={Colors.accent} />
                  <Text style={styles.calorieAdviceText}>
                    {weightInfo.isLoss 
                      ? `Daily deficit: ~${weightInfo.dailyCalorieAdjustment} kcal`
                      : `Daily surplus: ~${weightInfo.dailyCalorieAdjustment} kcal`
                    }
                  </Text>
                </View>

                {!weightInfo.isHealthy && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={16} color={Colors.warning} />
                    <Text style={styles.warningText}>
                      Rate exceeds recommended 0.5-1 kg/week. Consider extending timeframe for sustainable results.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </GlassCard>
      
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>🏋️ Workout Preferences</Text>
        <Text style={styles.inputLabel}>Workout Type</Text>
        <View style={styles.chipContainer}>
          {WORKOUT_TYPES.map((type) => (
            <TouchableOpacity key={type} style={[styles.chip, workoutType === type && styles.chipActive]} onPress={() => setWorkoutType(type)}>
              <Ionicons name={type === 'Gym' ? 'barbell' : type === 'Home' ? 'home' : 'fitness'} size={16} color={workoutType === type ? Colors.background : Colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.chipText, workoutType === type && styles.chipTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.inputLabel}>Days Per Week</Text>
        <View style={styles.chipContainer}>
          {DAYS_OPTIONS.map((days) => (
            <TouchableOpacity key={days} style={[styles.dayChip, daysPerWeek === days && styles.chipActive]} onPress={() => setDaysPerWeek(days)}>
              <Text style={[styles.chipText, daysPerWeek === days && styles.chipTextActive]}>{days}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <ActionButton title={loading ? 'Generating Plan...' : '✨ Generate AI Workout Plan'} onPress={generatePlan} disabled={loading} style={styles.generateButton} />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Creating your personalized plan...</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderWorkoutDay = (dayPlan: WorkoutPlanResult['weekly_workout_plan'][0], index: number) => (
    <GlassCard key={index} style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{dayPlan?.day_name || `Day ${index + 1}`}</Text>
        <View style={styles.focusBadge}><Text style={styles.focusText}>{dayPlan?.focus || 'Workout'}</Text></View>
      </View>
      <Text style={styles.durationText}>⏱️ {dayPlan?.duration_minutes || 45} min • 🔥 {dayPlan?.calories_burned || 300} cal</Text>
      <View style={styles.warmupSection}>
        <Text style={styles.warmupTitle}>🔥 Warm Up</Text>
        {(dayPlan?.warm_up || []).map((item: string, i: number) => <Text key={i} style={styles.warmupItem}>• {item}</Text>)}
      </View>
      <View style={styles.exerciseList}>
        {(dayPlan?.main_workout || []).map((exercise, i: number) => (
          <View key={i} style={styles.exerciseRow}>
            <View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{i + 1}</Text></View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise?.exercise || 'Exercise'}</Text>
              <Text style={styles.exerciseDetails}>{exercise?.sets || 3} sets × {exercise?.reps || '10'} • Rest: {exercise?.rest || '60s'}</Text>
              {exercise?.notes && <Text style={styles.exerciseNotes}>💡 {exercise.notes}</Text>}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.cooldownSection}>
        <Text style={styles.cooldownTitle}>❄️ Cool Down</Text>
        {(dayPlan?.cool_down || []).map((item: string, i: number) => <Text key={i} style={styles.cooldownItem}>• {item}</Text>)}
      </View>
    </GlassCard>
  );

  const renderDietPlan = () => {
    if (!workoutPlan?.diet_plan) return null;
    const diet_plan = workoutPlan.diet_plan;
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.calorieCard}>
          <Text style={styles.calorieTitle}>Daily Target</Text>
          <Text style={styles.calorieValue}>{diet_plan?.daily_calories || 2000}</Text>
          <Text style={styles.calorieLabel}>calories</Text>
        </GlassCard>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>🍽️ Daily Meals</Text>
          {(diet_plan?.meals || []).map((meal, index: number) => (
            <View key={index} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{meal?.meal || 'Meal'}</Text>
                <Text style={styles.mealTime}>{meal?.time || ''}</Text>
                <Text style={styles.mealCalories}>{meal?.calories || 0} kcal</Text>
              </View>
              <View style={styles.foodList}>
                {(meal?.options || []).map((option: string, i: number) => <Text key={i} style={styles.foodItem}>• {option}</Text>)}
              </View>
            </View>
          ))}
        </GlassCard>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>💧 Hydration</Text>
          <Text style={styles.hydrationText}>{diet_plan?.hydration || 'Drink 8-10 glasses of water daily'}</Text>
        </GlassCard>
        {(diet_plan?.supplements || []).length > 0 && (
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>💊 Supplements</Text>
            {(diet_plan?.supplements || []).map((sup: string, i: number) => <Text key={i} style={styles.supplementItem}>• {sup}</Text>)}
          </GlassCard>
        )}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>✅ Foods to Prioritize</Text>
          <View style={styles.foodTagContainer}>
            {(diet_plan?.foods_to_prioritize || []).map((food: string, i: number) => <View key={i} style={styles.foodTagGood}><Text style={styles.foodTagText}>{food}</Text></View>)}
          </View>
        </GlassCard>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>❌ Foods to Avoid</Text>
          <View style={styles.foodTagContainer}>
            {(diet_plan?.foods_to_avoid || []).map((food: string, i: number) => <View key={i} style={styles.foodTagBad}><Text style={styles.foodTagText}>{food}</Text></View>)}
          </View>
        </GlassCard>
      </ScrollView>
    );
  };

  const renderAnalytics = () => {
    if (!workoutPlan) return null;
    const user_profile = workoutPlan.user_profile || {};
    const tips = workoutPlan.tips || [];
    const estimated_progress = workoutPlan.estimated_progress || {};
    const bmiValue = user_profile?.bmi || 0;
    const bmiColor = getBMICategory(bmiValue).color;
    const macro_split = user_profile?.macro_split || { protein: '30%', carbs: '40%', fat: '30%' };
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>📈 Your Profile</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: bmiColor }]}>{bmiValue.toFixed(1)}</Text>
              <Text style={styles.statLabel}>BMI</Text>
              <Text style={[styles.statCategory, { color: bmiColor }]}>{user_profile?.bmi_category || 'Normal'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user_profile?.recommended_daily_calories || 2000}</Text>
              <Text style={styles.statLabel}>Daily Cal</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{daysPerWeek}</Text>
              <Text style={styles.statLabel}>Days/Week</Text>
            </View>
          </View>
          <Text style={styles.assessmentText}>{user_profile?.fitness_assessment || 'Ready to start your fitness journey!'}</Text>
        </GlassCard>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>🥗 Macro Split</Text>
          <View style={styles.macroContainer}>
            <View style={styles.macroBox}><Text style={styles.macroTitle}>Protein</Text><Text style={styles.macroPercent}>{macro_split.protein}</Text></View>
            <View style={styles.macroBox}><Text style={styles.macroTitle}>Carbs</Text><Text style={styles.macroPercent}>{macro_split.carbs}</Text></View>
            <View style={styles.macroBox}><Text style={styles.macroTitle}>Fat</Text><Text style={styles.macroPercent}>{macro_split.fat}</Text></View>
          </View>
        </GlassCard>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>🎯 Expected Progress</Text>
          <View style={styles.progressItem}><Text style={styles.progressLabel}>4 Weeks</Text><Text style={styles.progressText}>{estimated_progress['4_weeks'] || 'Initial adaptation period'}</Text></View>
          <View style={styles.progressItem}><Text style={styles.progressLabel}>8 Weeks</Text><Text style={styles.progressText}>{estimated_progress['8_weeks'] || 'Visible improvements'}</Text></View>
          <View style={styles.progressItem}><Text style={styles.progressLabel}>12 Weeks</Text><Text style={styles.progressText}>{estimated_progress['12_weeks'] || 'Significant transformation'}</Text></View>
        </GlassCard>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          {(tips || []).map((tip: string, i: number) => <Text key={i} style={styles.tipText}>• {tip}</Text>)}
        </GlassCard>
      </ScrollView>
    );
  };

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'workout' && styles.tabActive]} onPress={() => setActiveTab('workout')}>
          <Ionicons name="barbell" size={20} color={activeTab === 'workout' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'workout' && styles.tabTextActive]}>Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'diet' && styles.tabActive]} onPress={() => setActiveTab('diet')}>
          <Ionicons name="nutrition" size={20} color={activeTab === 'diet' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'diet' && styles.tabTextActive]}>Diet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'analytics' && styles.tabActive]} onPress={() => setActiveTab('analytics')}>
          <Ionicons name="analytics" size={20} color={activeTab === 'analytics' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>Analytics</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={() => setWorkoutPlan(null)}>
        <Ionicons name="arrow-back" size={20} color={Colors.text} />
        <Text style={styles.backText}>New Plan</Text>
      </TouchableOpacity>
      {activeTab === 'workout' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
            {(workoutPlan?.weekly_workout_plan || []).map((day, index: number) => (
              <TouchableOpacity key={index} style={[styles.daySelectorButton, selectedDay === index && styles.daySelectorActive]} onPress={() => setSelectedDay(index)}>
                <Text style={[styles.daySelectorText, selectedDay === index && styles.daySelectorTextActive]}>Day {day?.day || index + 1}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {workoutPlan?.weekly_workout_plan && workoutPlan.weekly_workout_plan.length > 0 && workoutPlan.weekly_workout_plan[selectedDay] && renderWorkoutDay(workoutPlan.weekly_workout_plan[selectedDay], selectedDay)}
          {(!workoutPlan?.weekly_workout_plan || workoutPlan.weekly_workout_plan.length === 0) && (
            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>No workout plan available</Text>
              <Text style={styles.assessmentText}>Please try generating a new plan.</Text>
            </GlassCard>
          )}
        </ScrollView>
      )}
      {activeTab === 'diet' && renderDietPlan()}
      {activeTab === 'analytics' && renderAnalytics()}
    </View>
  );

  return (
    <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏋️ AI Workout Planner</Text>
          <Text style={styles.headerSubtitle}>{workoutPlan ? 'Your Personalized Plan' : 'Create Your Perfect Plan'}</Text>
        </View>
        {workoutPlan ? renderResults() : renderForm()}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { padding: Spacing.lg, paddingBottom: Spacing.md },
  headerTitle: { fontSize: Typography.h1, fontWeight: 'bold', color: Colors.text },
  headerSubtitle: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 4 },
  formContainer: { flex: 1, paddingHorizontal: Spacing.md },
  card: { marginBottom: Spacing.md, padding: Spacing.lg },
  sectionTitle: { fontSize: Typography.h3, fontWeight: 'bold', color: Colors.text, marginBottom: Spacing.md },
  inputRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xs },
  input: { ...GlassStyle, padding: Spacing.md, borderRadius: 12, fontSize: Typography.body, color: Colors.text },
  optionRow: { flexDirection: 'row', gap: Spacing.sm },
  optionButton: { flex: 1, padding: Spacing.sm, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center' },
  optionButtonActive: { backgroundColor: Colors.primary },
  optionText: { color: Colors.textSecondary, fontSize: Typography.caption },
  optionTextActive: { color: Colors.text, fontWeight: '600' },
  bmiDisplay: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: 12, borderWidth: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginTop: Spacing.sm },
  bmiValue: { fontSize: Typography.h2, fontWeight: 'bold', color: Colors.text },
  bmiCategory: { fontSize: Typography.body, fontWeight: '600' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: Typography.caption },
  chipTextActive: { color: Colors.background, fontWeight: '600' },
  dayChip: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, backgroundColor: 'rgba(231, 76, 60, 0.2)', borderRadius: 12, marginBottom: Spacing.md },
  errorText: { color: '#e74c3c', fontSize: Typography.caption },
  generateButton: { marginBottom: Spacing.xl },
  loadingContainer: { alignItems: 'center', padding: Spacing.xl },
  loadingText: { color: Colors.textSecondary, marginTop: Spacing.md, fontSize: Typography.caption },
  resultsContainer: { flex: 1, paddingHorizontal: Spacing.md },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 4, marginBottom: Spacing.md },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, borderRadius: 10 },
  tabActive: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  tabText: { color: Colors.textSecondary, fontSize: Typography.caption },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  backText: { color: Colors.text, fontSize: Typography.caption },
  daySelector: { marginBottom: Spacing.md },
  daySelectorButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, marginRight: Spacing.sm, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  daySelectorActive: { backgroundColor: Colors.primary },
  daySelectorText: { color: Colors.textSecondary, fontSize: Typography.caption },
  daySelectorTextActive: { color: Colors.background, fontWeight: '600' },
  dayCard: { padding: Spacing.lg, marginBottom: Spacing.md },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  dayTitle: { fontSize: Typography.h3, fontWeight: 'bold', color: Colors.text },
  focusBadge: { backgroundColor: Colors.primary, paddingVertical: 4, paddingHorizontal: Spacing.sm, borderRadius: 12 },
  focusText: { color: Colors.background, fontSize: Typography.small, fontWeight: '600' },
  durationText: { color: Colors.textSecondary, fontSize: Typography.caption, marginBottom: Spacing.sm },
  warmupSection: { marginBottom: Spacing.md, padding: Spacing.sm, backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 8 },
  warmupTitle: { color: Colors.accent, fontSize: Typography.caption, fontWeight: '600', marginBottom: Spacing.xs },
  warmupItem: { color: Colors.text, fontSize: Typography.caption, marginBottom: 2 },
  exerciseList: { gap: Spacing.md },
  exerciseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  exerciseNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  exerciseNumberText: { color: Colors.background, fontSize: Typography.caption, fontWeight: 'bold' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: Typography.body, fontWeight: '600', color: Colors.text },
  exerciseDetails: { fontSize: Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  exerciseNotes: { fontSize: Typography.small, color: Colors.accent, marginTop: 4, fontStyle: 'italic' },
  cooldownSection: { marginTop: Spacing.md, padding: Spacing.sm, backgroundColor: 'rgba(77, 150, 255, 0.1)', borderRadius: 8 },
  cooldownTitle: { color: Colors.water, fontSize: Typography.caption, fontWeight: '600', marginBottom: Spacing.xs },
  cooldownItem: { color: Colors.text, fontSize: Typography.caption, marginBottom: 2 },
  calorieCard: { alignItems: 'center', padding: Spacing.xl, marginBottom: Spacing.md },
  calorieTitle: { fontSize: Typography.caption, color: Colors.textSecondary },
  calorieValue: { fontSize: 48, fontWeight: 'bold', color: Colors.primary },
  calorieLabel: { fontSize: Typography.caption, color: Colors.textSecondary },
  mealCard: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  mealTitle: { flex: 1, fontSize: Typography.body, fontWeight: '600', color: Colors.text },
  mealTime: { fontSize: Typography.small, color: Colors.textSecondary, marginRight: Spacing.md },
  mealCalories: { fontSize: Typography.caption, color: Colors.primary, fontWeight: '600' },
  foodList: { marginBottom: Spacing.sm },
  foodItem: { fontSize: Typography.caption, color: Colors.text, marginBottom: 2 },
  hydrationText: { fontSize: Typography.body, color: Colors.water },
  supplementItem: { fontSize: Typography.caption, color: Colors.text, marginBottom: Spacing.xs },
  foodTagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  foodTagGood: { backgroundColor: 'rgba(46, 204, 113, 0.3)', paddingVertical: 4, paddingHorizontal: Spacing.sm, borderRadius: 12 },
  foodTagBad: { backgroundColor: 'rgba(231, 76, 60, 0.3)', paddingVertical: 4, paddingHorizontal: Spacing.sm, borderRadius: 12 },
  foodTagText: { fontSize: Typography.small, color: Colors.text },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: Typography.h1, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  statCategory: { fontSize: Typography.small, fontWeight: '600', marginTop: 2 },
  assessmentText: { fontSize: Typography.caption, color: Colors.textSecondary, textAlign: 'center', fontStyle: 'italic' },
  macroContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  macroBox: { alignItems: 'center', padding: Spacing.md, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, minWidth: 80 },
  macroTitle: { fontSize: Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xs },
  macroPercent: { fontSize: Typography.h3, fontWeight: 'bold', color: Colors.primary },
  progressItem: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  progressLabel: { fontSize: Typography.caption, color: Colors.primary, fontWeight: '600', marginBottom: Spacing.xs },
  progressText: { fontSize: Typography.caption, color: Colors.text },
  tipText: { fontSize: Typography.caption, color: Colors.text, marginBottom: Spacing.sm },
  
  // Target Weight Styles
  targetSection: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  subLabel: { fontSize: Typography.small, color: Colors.textSecondary, marginBottom: 4 },
  weeksSelector: { flexDirection: 'row', gap: 6 },
  weekOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  weekOptionActive: { backgroundColor: Colors.primary },
  weekText: { fontSize: Typography.caption, color: Colors.textSecondary },
  weekTextActive: { color: Colors.background, fontWeight: '600' },
  weightInfoCard: { marginTop: Spacing.md, padding: Spacing.md, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12, borderWidth: 1 },
  weightInfoHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  weightInfoTitle: { fontSize: Typography.body, fontWeight: '600', color: Colors.text },
  weightStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: Spacing.md },
  weightStat: { alignItems: 'center' },
  weightStatValue: { fontSize: Typography.h3, fontWeight: 'bold', color: Colors.primary },
  weightStatLabel: { fontSize: Typography.small, color: Colors.textSecondary, marginTop: 2 },
  weightStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  calorieAdvice: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: Spacing.sm, borderRadius: 8 },
  calorieAdviceText: { fontSize: Typography.caption, color: Colors.text, flex: 1 },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: 'rgba(241, 196, 15, 0.1)', borderRadius: 8 },
  warningText: { fontSize: Typography.small, color: Colors.warning, flex: 1 },
});
