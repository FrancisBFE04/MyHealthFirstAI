/**
 * Premium/Subscription Screen - Freemium pricing table and payment flow
 * Feature: Mock RevenueCat payment implementation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassCard, ActionButton } from '../components/shared';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_CONFIG } from '../constants/config';

type BillingPeriod = 'monthly' | 'yearly';

export default function PremiumScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    isPro, 
    tier, 
    subscriptionDate, 
    expiryDate,
    upgradeToPro, 
    downgradeToFree,
    restorePurchases,
    dailyScansUsed,
    dailyScansLimit,
  } = useSubscription();

  const monthlyPrice = SUBSCRIPTION_CONFIG.PRO_MONTHLY_PRICE;
  const yearlyPrice = SUBSCRIPTION_CONFIG.PRO_YEARLY_PRICE;
  const yearlyMonthlyEquivalent = (yearlyPrice / 12).toFixed(2);
  const savingsPercent = Math.round((1 - (yearlyPrice / 12) / monthlyPrice) * 100);

  const proFeatures = [
    { icon: 'scan', title: 'Unlimited AI Food Scans', description: 'No daily limits on food detection' },
    { icon: 'mic', title: 'Voice Food Logging', description: 'Speak to log your meals hands-free' },
    { icon: 'videocam', title: 'AI Form Correction', description: 'Get feedback on your workout form' },
    { icon: 'calendar', title: 'Advanced Meal Planning', description: 'AI-powered weekly meal plans' },
    { icon: 'trophy', title: 'Exclusive Challenges', description: 'Premium badges and achievements' },
    { icon: 'analytics', title: 'Detailed Analytics', description: 'Deep insights into your nutrition' },
    { icon: 'notifications', title: 'Smart Reminders', description: 'Personalized meal and hydration alerts' },
    { icon: 'cloud-download', title: 'Data Export', description: 'Export your health data anytime' },
  ];

  const freeFeatures = [
    '3 AI scans per day',
    'Basic food logging',
    'Macro tracking',
    'Water tracking',
    'Basic badges',
  ];

  // Cross-platform alert helper
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // Mock RevenueCat payment flow
      console.log(`🛒 Processing ${selectedPeriod} subscription...`);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call mock upgrade function
      await upgradeToPro();
      
      showAlert(
        '🎉 Welcome to Pro!',
        'Your subscription is now active. Enjoy unlimited access to all features!'
      );
    } catch (error) {
      console.error('Subscription error:', error);
      showAlert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      await restorePurchases();
      showAlert('Restore Complete', 'Your purchases have been restored.');
    } catch (error) {
      showAlert('Error', 'Failed to restore purchases.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    // Use window.confirm on web since Alert.alert doesn't work well
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to cancel your Pro subscription?');
      if (confirmed) {
        try {
          await downgradeToFree();
          window.alert('Subscription Cancelled. Your Pro features will remain active until the end of your billing period.');
        } catch (error) {
          console.error('Error cancelling subscription:', error);
          window.alert('Failed to cancel subscription. Please try again.');
        }
      }
    } else {
      Alert.alert(
        'Cancel Subscription',
        'Are you sure you want to cancel your Pro subscription?',
        [
          { text: 'Keep Pro', style: 'cancel' },
          { 
            text: 'Cancel', 
            style: 'destructive',
            onPress: async () => {
              await downgradeToFree();
              Alert.alert('Subscription Cancelled', 'Your Pro features will remain active until the end of your billing period.');
            }
          },
        ]
      );
    }
  };

  // Pro user view
  if (isPro) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Pro Status Header */}
          <LinearGradient
            colors={[Colors.premium, Colors.premiumEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proHeader}
          >
            <Ionicons name="diamond" size={48} color={Colors.background} />
            <Text style={styles.proTitle}>You're a Pro! 👑</Text>
            <Text style={styles.proSubtitle}>
              Enjoy unlimited access to all premium features
            </Text>
          </LinearGradient>

          {/* Subscription Details */}
          <GlassCard style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Subscription Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {subscriptionDate 
                  ? new Date(subscriptionDate).toLocaleDateString() 
                  : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Renews On</Text>
              <Text style={styles.detailValue}>
                {expiryDate 
                  ? new Date(expiryDate).toLocaleDateString() 
                  : 'N/A'}
              </Text>
            </View>
          </GlassCard>

          {/* Pro Features List */}
          <Text style={styles.sectionTitle}>Your Pro Features</Text>
          {proFeatures.map((feature, index) => (
            <GlassCard key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            </GlassCard>
          ))}

          {/* Manage Subscription */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Free user - upgrade view
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[Colors.premium, Colors.premiumEnd]}
            style={styles.diamondIcon}
          >
            <Ionicons name="diamond" size={32} color={Colors.background} />
          </LinearGradient>
          <Text style={styles.title}>Upgrade to Pro</Text>
          <Text style={styles.subtitle}>
            Unlock the full potential of your health journey
          </Text>
        </View>

        {/* Current Usage */}
        <GlassCard style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Ionicons name="scan" size={20} color={Colors.primary} />
            <Text style={styles.usageTitle}>Today's AI Scans</Text>
          </View>
          <View style={styles.usageBar}>
            <View 
              style={[
                styles.usageFill, 
                { width: `${(dailyScansUsed / dailyScansLimit) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.usageText}>
            {dailyScansUsed} of {dailyScansLimit} free scans used
          </Text>
        </GlassCard>

        {/* Billing Toggle */}
        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              selectedPeriod === 'monthly' && styles.toggleOptionActive,
            ]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={[
              styles.toggleText,
              selectedPeriod === 'monthly' && styles.toggleTextActive,
            ]}>
              Monthly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleOption,
              selectedPeriod === 'yearly' && styles.toggleOptionActive,
            ]}
            onPress={() => setSelectedPeriod('yearly')}
          >
            <Text style={[
              styles.toggleText,
              selectedPeriod === 'yearly' && styles.toggleTextActive,
            ]}>
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save {savingsPercent}%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pricing Card */}
        <GlassCard style={styles.pricingCard} glowColor={Colors.premium}>
          <View style={styles.proBadge}>
            <Ionicons name="diamond" size={16} color={Colors.background} />
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.price}>
              {selectedPeriod === 'monthly' ? monthlyPrice : yearlyMonthlyEquivalent}
            </Text>
            <Text style={styles.period}>/month</Text>
          </View>

          {selectedPeriod === 'yearly' && (
            <Text style={styles.billedYearly}>
              Billed ${yearlyPrice}/year
            </Text>
          )}

          <View style={styles.featuresListCompact}>
            {proFeatures.slice(0, 4).map((feature, index) => (
              <View key={index} style={styles.featureRowCompact}>
                <Ionicons name="checkmark" size={18} color={Colors.success} />
                <Text style={styles.featureTextCompact}>{feature.title}</Text>
              </View>
            ))}
            <Text style={styles.andMore}>+ {proFeatures.length - 4} more features</Text>
          </View>

          <ActionButton
            title={isProcessing ? 'Processing...' : '🚀 Start Pro Trial'}
            onPress={handleSubscribe}
            variant="premium"
            size="lg"
            fullWidth
            loading={isProcessing}
            disabled={isProcessing}
          />

          <Text style={styles.trialNote}>7-day free trial, cancel anytime</Text>
        </GlassCard>

        {/* Free Tier Comparison */}
        <GlassCard style={styles.freeCard}>
          <Text style={styles.freeTierTitle}>Free Tier Includes:</Text>
          {freeFeatures.map((feature, index) => (
            <View key={index} style={styles.freeFeatureRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.freeFeatureText}>{feature}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isProcessing}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Payment will be charged to your account. Subscription automatically renews unless 
          cancelled 24 hours before the end of the current period. Cancel anytime in Settings.
        </Text>
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
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  diamondIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.glow(Colors.premium),
  },
  title: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  usageCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  usageTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  usageBar: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  usageFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  usageText: {
    fontSize: Typography.small,
    color: Colors.textSecondary,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  toggleOptionActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.text,
  },
  saveBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.xs,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  pricingCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  proBadgeText: {
    fontSize: Typography.caption,
    fontWeight: Typography.bold,
    color: Colors.background,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  currency: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.premium,
    marginTop: 8,
  },
  price: {
    fontSize: 56,
    fontWeight: Typography.bold,
    color: Colors.premium,
  },
  period: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  billedYearly: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  featuresListCompact: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  featureRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureTextCompact: {
    fontSize: Typography.body,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  andMore: {
    fontSize: Typography.caption,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  trialNote: {
    fontSize: Typography.small,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
  freeCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  freeTierTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  freeFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  freeFeatureText: {
    fontSize: Typography.caption,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
  restoreButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  restoreButtonText: {
    fontSize: Typography.body,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  terms: {
    fontSize: Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.md,
  },
  // Pro user styles
  proHeader: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.large,
  },
  proTitle: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.background,
    marginTop: Spacing.md,
  },
  proSubtitle: {
    fontSize: Typography.body,
    color: 'rgba(0,0,0,0.6)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  detailsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailsTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  detailLabel: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.body,
    color: Colors.text,
    fontWeight: Typography.medium,
  },
  activeBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  activeBadgeText: {
    fontSize: Typography.small,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 199, 190, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.body,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  featureDescription: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cancelButton: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  cancelButtonText: {
    fontSize: Typography.body,
    color: Colors.error,
  },
});
