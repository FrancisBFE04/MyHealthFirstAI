/**
 * Recipes Screen - AI-powered "Pantry Chef"
 * Feature: Photo your ingredients OR type them manually to get recipe suggestions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard, ActionButton } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { generateRecipe, generateRecipeFromIngredients, RecipeResult, EnhancedRecipeResult } from '../services/api';

type RecipeMode = 'photo' | 'ingredients';
type UserGoal = 'Weight Loss' | 'Muscle Gain' | 'Balanced';

export default function RecipesScreen() {
  const [mode, setMode] = useState<RecipeMode>('photo');
  const [pantryImage, setPantryImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [enhancedRecipe, setEnhancedRecipe] = useState<EnhancedRecipeResult | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<RecipeResult[]>([]);
  
  // Ingredient mode states
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [userGoal, setUserGoal] = useState<UserGoal>('Balanced');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to capture your pantry.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPantryImage(result.assets[0].uri);
      if (result.assets[0].base64) {
        await generateRecipeFromImage(result.assets[0].base64);
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPantryImage(result.assets[0].uri);
      if (result.assets[0].base64) {
        await generateRecipeFromImage(result.assets[0].base64);
      }
    }
  };

  const generateRecipeFromImage = async (base64: string) => {
    setIsGenerating(true);

    try {
      const result = await generateRecipe(base64);
      
      // The API returns { success, data: { success, data: {...} } } - need to unwrap
      const apiResponse = result.data as any;
      const recipeData = apiResponse?.data || apiResponse;
      
      console.log('Recipe API Response:', JSON.stringify(result, null, 2));
      console.log('Recipe Data:', JSON.stringify(recipeData, null, 2));

      if (result.success && recipeData && (recipeData.name || recipeData.recipe_name)) {
        // Handle both old format (name) and new format (recipe_name)
        setRecipe({
          name: recipeData.name || recipeData.recipe_name || 'Generated Recipe',
          ingredients: recipeData.ingredients || recipeData.ingredients_used || [],
          instructions: recipeData.instructions || [],
          calories: recipeData.calories || recipeData.calories_per_serving || 400,
          protein: typeof recipeData.protein === 'number' ? recipeData.protein : 
                   parseInt(recipeData.macros?.protein) || 25,
          carbs: typeof recipeData.carbs === 'number' ? recipeData.carbs :
                 parseInt(recipeData.macros?.carbs) || 35,
          fat: typeof recipeData.fat === 'number' ? recipeData.fat :
               parseInt(recipeData.macros?.fat) || 15,
          prep_time: typeof recipeData.prep_time === 'number' ? recipeData.prep_time :
                     parseInt(recipeData.prep_time) || 25,
          difficulty: recipeData.difficulty || 'Medium',
        });
      } else {
        // Mock recipe for demo
        setRecipe({
          name: 'Mediterranean Chicken Bowl',
          ingredients: [
            '2 chicken breasts',
            '1 cup quinoa',
            '1 cucumber, diced',
            '1 cup cherry tomatoes',
            '1/2 red onion, sliced',
            '1/4 cup feta cheese',
            '2 tbsp olive oil',
            'Fresh lemon juice',
            'Salt and pepper to taste',
          ],
          instructions: [
            'Cook quinoa according to package directions and let cool.',
            'Season chicken breasts with salt, pepper, and oregano.',
            'Grill or pan-fry chicken for 6-7 minutes per side until cooked through.',
            'Slice chicken into strips.',
            'In a bowl, combine quinoa, cucumber, tomatoes, and red onion.',
            'Top with sliced chicken and crumbled feta.',
            'Drizzle with olive oil and lemon juice.',
            'Season with additional salt and pepper if needed.',
          ],
          calories: 485,
          protein: 42,
          carbs: 38,
          fat: 18,
          prep_time: 30,
          difficulty: 'Easy',
        });
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      // Use mock for demo
      setRecipe({
        name: 'Quick Veggie Stir-Fry',
        ingredients: [
          '2 cups mixed vegetables',
          '1 block tofu, cubed',
          '2 tbsp soy sauce',
          '1 tbsp sesame oil',
          '2 cloves garlic, minced',
          '1 tsp ginger, grated',
        ],
        instructions: [
          'Press tofu and cut into cubes.',
          'Heat sesame oil in a wok or large pan.',
          'Add tofu and cook until golden.',
          'Add garlic and ginger, stir for 30 seconds.',
          'Add vegetables and stir-fry for 5 minutes.',
          'Add soy sauce and toss to combine.',
          'Serve over rice or noodles.',
        ],
        calories: 320,
        protein: 18,
        carbs: 28,
        fat: 16,
        prep_time: 20,
        difficulty: 'Easy',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Add ingredient to list
  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setIngredientInput('');
    }
  };

  // Remove ingredient from list
  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  // Generate recipe from ingredients list
  const handleGenerateFromIngredients = async () => {
    if (ingredients.length < 2) {
      Alert.alert('Need More Ingredients', 'Please add at least 2 ingredients.');
      return;
    }

    setIsGenerating(true);
    setEnhancedRecipe(null);

    try {
      const result = await generateRecipeFromIngredients(
        ingredients,
        userGoal,
        dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined
      );

      if (result.success && result.data) {
        setEnhancedRecipe(result.data);
      } else {
        // Mock for demo
        setEnhancedRecipe({
          recipe_name: 'Healthy Chicken Stir-Fry',
          difficulty: 'Easy',
          prep_time: '25 mins',
          calories_per_serving: 420,
          macros: { protein: '35g', carbs: '28g', fat: '18g' },
          ingredients_used: ingredients.slice(0, 4),
          pantry_staples_needed: ['Oil', 'Salt', 'Pepper', 'Garlic'],
          instructions: [
            'Step 1: Prepare all ingredients by washing and cutting.',
            'Step 2: Heat oil in a large pan over medium-high heat.',
            'Step 3: Add protein and cook until golden.',
            'Step 4: Add vegetables and stir-fry for 5 minutes.',
            'Step 5: Season and serve hot.',
          ],
          chef_tip: 'Add a splash of lemon juice at the end for extra freshness!',
        });
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      Alert.alert('Error', 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle dietary restriction
  const toggleRestriction = (restriction: string) => {
    if (dietaryRestrictions.includes(restriction)) {
      setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, restriction]);
    }
  };

  const handleSaveRecipe = () => {
    if (recipe) {
      setSavedRecipes([recipe, ...savedRecipes]);
      Alert.alert('Saved! 📖', 'Recipe added to your collection.');
    }
  };

  const handleNewRecipe = () => {
    setPantryImage(null);
    setRecipe(null);
    setEnhancedRecipe(null);
    setIngredients([]);
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return Colors.success;
      case 'medium': return Colors.warning;
      case 'hard': return Colors.error;
      default: return Colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🍳 Pantry Chef</Text>
          <Text style={styles.subtitle}>
            Create healthy recipes from your ingredients
          </Text>
        </View>

        {/* Mode Toggle */}
        {!recipe && !enhancedRecipe && !isGenerating && (
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'photo' && styles.modeButtonActive]}
              onPress={() => setMode('photo')}
            >
              <Ionicons 
                name="camera" 
                size={18} 
                color={mode === 'photo' ? Colors.text : Colors.textSecondary} 
              />
              <Text style={[styles.modeText, mode === 'photo' && styles.modeTextActive]}>
                Photo Scan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'ingredients' && styles.modeButtonActive]}
              onPress={() => setMode('ingredients')}
            >
              <Ionicons 
                name="list" 
                size={18} 
                color={mode === 'ingredients' ? Colors.text : Colors.textSecondary} 
              />
              <Text style={[styles.modeText, mode === 'ingredients' && styles.modeTextActive]}>
                Type Ingredients
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Photo Upload Section */}
        {mode === 'photo' && !pantryImage && !recipe && !isGenerating && (
          <GlassCard style={styles.uploadCard}>
            <Ionicons name="nutrition" size={48} color={Colors.primary} />
            <Text style={styles.uploadTitle}>What's in Your Pantry?</Text>
            <Text style={styles.uploadSubtitle}>
              Take a photo of your ingredients and our AI will suggest delicious recipes
            </Text>
            
            <View style={styles.uploadButtons}>
              <ActionButton
                title="📷 Camera"
                onPress={handleTakePhoto}
                variant="primary"
              />
              <ActionButton
                title="🖼️ Gallery"
                onPress={handlePickImage}
                variant="outline"
              />
            </View>
          </GlassCard>
        )}

        {/* Ingredient Input Section */}
        {mode === 'ingredients' && !enhancedRecipe && !isGenerating && (
          <>
            <GlassCard style={styles.ingredientCard}>
              <Text style={styles.sectionLabel}>Add Your Ingredients</Text>
              <View style={styles.ingredientInputRow}>
                <TextInput
                  style={styles.ingredientInput}
                  placeholder="e.g., Chicken, Rice, Broccoli..."
                  placeholderTextColor={Colors.textSecondary}
                  value={ingredientInput}
                  onChangeText={setIngredientInput}
                  onSubmitEditing={handleAddIngredient}
                  returnKeyType="done"
                />
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddIngredient}
                >
                  <Ionicons name="add" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {/* Ingredients List */}
              {ingredients.length > 0 && (
                <View style={styles.ingredientsList}>
                  {ingredients.map((ingredient, index) => (
                    <View key={index} style={styles.ingredientChip}>
                      <Text style={styles.ingredientChipText}>{ingredient}</Text>
                      <TouchableOpacity onPress={() => handleRemoveIngredient(ingredient)}>
                        <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>

            {/* Goal Selection */}
            <GlassCard style={styles.goalCard}>
              <Text style={styles.sectionLabel}>Your Goal</Text>
              <View style={styles.goalOptions}>
                {(['Weight Loss', 'Balanced', 'Muscle Gain'] as UserGoal[]).map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalOption,
                      userGoal === goal && styles.goalOptionActive,
                    ]}
                    onPress={() => setUserGoal(goal)}
                  >
                    <Ionicons
                      name={
                        goal === 'Weight Loss' ? 'trending-down' :
                        goal === 'Muscle Gain' ? 'barbell' : 'heart'
                      }
                      size={18}
                      color={userGoal === goal ? Colors.text : Colors.textSecondary}
                    />
                    <Text style={[
                      styles.goalText,
                      userGoal === goal && styles.goalTextActive,
                    ]}>
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>

            {/* Dietary Restrictions */}
            <GlassCard style={styles.restrictionsCard}>
              <Text style={styles.sectionLabel}>Dietary Restrictions (Optional)</Text>
              <View style={styles.restrictionOptions}>
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb'].map((restriction) => (
                  <TouchableOpacity
                    key={restriction}
                    style={[
                      styles.restrictionChip,
                      dietaryRestrictions.includes(restriction) && styles.restrictionChipActive,
                    ]}
                    onPress={() => toggleRestriction(restriction)}
                  >
                    <Text style={[
                      styles.restrictionText,
                      dietaryRestrictions.includes(restriction) && styles.restrictionTextActive,
                    ]}>
                      {restriction}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>

            {/* Generate Button */}
            <ActionButton
              title={`🍳 Generate Recipe (${ingredients.length} ingredients)`}
              onPress={handleGenerateFromIngredients}
              variant="primary"
              disabled={ingredients.length < 2}
            />
          </>
        )}

        {/* Pantry Image Preview */}
        {pantryImage && !recipe && !isGenerating && (
          <GlassCard style={styles.previewCard}>
            <Image
              source={{ uri: pantryImage }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </GlassCard>
        )}

        {/* Loading State */}
        {isGenerating && (
          <GlassCard style={styles.loadingCard}>
            <Ionicons name="restaurant" size={48} color={Colors.primary} />
            <Text style={styles.loadingTitle}>👨‍🍳 Creating Your Recipe...</Text>
            <Text style={styles.loadingSubtitle}>
              Our AI chef is analyzing your ingredients
            </Text>
          </GlassCard>
        )}

        {/* Recipe Result */}
        {recipe && (
          <View style={styles.recipeSection}>
            {/* Recipe Header */}
            <GlassCard style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <View style={styles.recipeMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={16} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{recipe.prep_time} min</Text>
                  </View>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: `${getDifficultyColor(recipe.difficulty)}20` }
                  ]}>
                    <Text style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(recipe.difficulty) }
                    ]}>
                      {recipe.difficulty}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Macros */}
              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.accent }]}>
                    {recipe.calories}
                  </Text>
                  <Text style={styles.macroLabel}>kcal</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.protein }]}>
                    {recipe.protein}g
                  </Text>
                  <Text style={styles.macroLabel}>protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.carbs }]}>
                    {recipe.carbs}g
                  </Text>
                  <Text style={styles.macroLabel}>carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.fat }]}>
                    {recipe.fat}g
                  </Text>
                  <Text style={styles.macroLabel}>fat</Text>
                </View>
              </View>
            </GlassCard>

            {/* Ingredients */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Ingredients</Text>
              </View>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.checkbox} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </GlassCard>

            {/* Instructions */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="reader" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Instructions</Text>
              </View>
              {recipe.instructions.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </GlassCard>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <ActionButton
                title="💾 Save Recipe"
                onPress={handleSaveRecipe}
                variant="primary"
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <ActionButton
                title="🔄 New"
                onPress={handleNewRecipe}
                variant="outline"
              />
            </View>
          </View>
        )}

        {/* Enhanced Recipe Result (from ingredients) */}
        {enhancedRecipe && (
          <View style={styles.recipeSection}>
            {/* Recipe Header */}
            <GlassCard style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeName}>{enhancedRecipe.recipe_name}</Text>
                <View style={styles.recipeMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={16} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{enhancedRecipe.prep_time}</Text>
                  </View>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: `${getDifficultyColor(enhancedRecipe.difficulty)}20` }
                  ]}>
                    <Text style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(enhancedRecipe.difficulty) }
                    ]}>
                      {enhancedRecipe.difficulty}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Macros */}
              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.accent }]}>
                    {enhancedRecipe.calories_per_serving}
                  </Text>
                  <Text style={styles.macroLabel}>kcal</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.protein }]}>
                    {enhancedRecipe.macros.protein}
                  </Text>
                  <Text style={styles.macroLabel}>protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.carbs }]}>
                    {enhancedRecipe.macros.carbs}
                  </Text>
                  <Text style={styles.macroLabel}>carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: Colors.fat }]}>
                    {enhancedRecipe.macros.fat}
                  </Text>
                  <Text style={styles.macroLabel}>fat</Text>
                </View>
              </View>
            </GlassCard>

            {/* Ingredients Used */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.sectionTitle}>Ingredients Used</Text>
              </View>
              {enhancedRecipe.ingredients_used.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Ionicons name="checkmark" size={16} color={Colors.success} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </GlassCard>

            {/* Pantry Staples Needed */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="basket" size={20} color={Colors.warning} />
                <Text style={styles.sectionTitle}>Pantry Staples Needed</Text>
              </View>
              <View style={styles.staplesRow}>
                {enhancedRecipe.pantry_staples_needed.map((staple, index) => (
                  <View key={index} style={styles.stapleChip}>
                    <Text style={styles.stapleText}>{staple}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            {/* Instructions */}
            <GlassCard style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="reader" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Instructions</Text>
              </View>
              {enhancedRecipe.instructions.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.replace(/^Step \d+:\s*/i, '')}</Text>
                </View>
              ))}
            </GlassCard>

            {/* Chef Tip */}
            <GlassCard style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipEmoji}>👨‍🍳</Text>
                <Text style={styles.tipTitle}>Chef's Tip</Text>
              </View>
              <Text style={styles.tipText}>{enhancedRecipe.chef_tip}</Text>
            </GlassCard>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <ActionButton
                title="💾 Save Recipe"
                onPress={() => {
                  // Convert enhanced recipe to standard format and save
                  const standardRecipe: RecipeResult = {
                    name: enhancedRecipe.recipe_name,
                    ingredients: enhancedRecipe.ingredients_used,
                    instructions: enhancedRecipe.instructions,
                    calories: enhancedRecipe.calories_per_serving,
                    protein: parseInt(enhancedRecipe.macros.protein) || 0,
                    carbs: parseInt(enhancedRecipe.macros.carbs) || 0,
                    fat: parseInt(enhancedRecipe.macros.fat) || 0,
                    prep_time: parseInt(enhancedRecipe.prep_time) || 0,
                    difficulty: enhancedRecipe.difficulty,
                  };
                  setSavedRecipes([standardRecipe, ...savedRecipes]);
                  Alert.alert('Saved! 📖', 'Recipe added to your collection.');
                }}
                variant="primary"
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <ActionButton
                title="🔄 New"
                onPress={handleNewRecipe}
                variant="outline"
              />
            </View>
          </View>
        )}

        {/* Saved Recipes */}
        {savedRecipes.length > 0 && !recipe && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>📖 Saved Recipes</Text>
            {savedRecipes.map((saved, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setRecipe(saved)}
              >
                <GlassCard style={styles.savedRecipeCard}>
                  <View style={styles.savedRecipeInfo}>
                    <Text style={styles.savedRecipeName}>{saved.name}</Text>
                    <Text style={styles.savedRecipeMeta}>
                      {saved.calories} kcal • {saved.prep_time} min
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Ideas Section */}
        {!recipe && !isGenerating && (
          <GlassCard style={styles.ideasCard}>
            <Text style={styles.ideasTitle}>💡 Recipe Ideas</Text>
            <Text style={styles.ideasText}>
              Try photographing:
            </Text>
            <Text style={styles.ideaItem}>• Your fridge contents</Text>
            <Text style={styles.ideaItem}>• Pantry shelves</Text>
            <Text style={styles.ideaItem}>• Farmers market haul</Text>
            <Text style={styles.ideaItem}>• Leftover ingredients</Text>
          </GlassCard>
        )}
      </ScrollView>
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
  previewCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  loadingCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  loadingSubtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  recipeSection: {
    marginTop: Spacing.md,
  },
  recipeCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  recipeHeader: {
    marginBottom: Spacing.lg,
  },
  recipeName: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  metaText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: Typography.small,
    fontWeight: Typography.semibold,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
  },
  macroLabel: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  sectionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  ingredientText: {
    fontSize: Typography.body,
    color: Colors.text,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  stepNumberText: {
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  stepText: {
    flex: 1,
    fontSize: Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  savedSection: {
    marginTop: Spacing.xl,
  },
  savedTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  savedRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  savedRecipeInfo: {
    flex: 1,
  },
  savedRecipeName: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  savedRecipeMeta: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ideasCard: {
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },
  ideasTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  ideasText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  ideaItem: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
  // Mode Toggle Styles
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeText: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  modeTextActive: {
    color: Colors.text,
    fontWeight: Typography.semibold,
  },
  // Ingredient Input Styles
  ingredientCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  ingredientInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ingredientInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}20`,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  ingredientChipText: {
    fontSize: Typography.caption,
    color: Colors.primary,
  },
  // Goal Selection Styles
  goalCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  goalOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  goalOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.xs,
  },
  goalOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  goalTextActive: {
    color: Colors.text,
    fontWeight: Typography.semibold,
  },
  // Dietary Restrictions Styles
  restrictionsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  restrictionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  restrictionChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  restrictionChipActive: {
    backgroundColor: `${Colors.secondary}30`,
    borderColor: Colors.secondary,
  },
  restrictionText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
  restrictionTextActive: {
    color: Colors.secondary,
  },
  // Enhanced Recipe Styles
  staplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  stapleChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: `${Colors.warning}20`,
  },
  stapleText: {
    fontSize: Typography.caption,
    color: Colors.warning,
  },
  tipCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: `${Colors.primary}10`,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  tipTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  tipText: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
