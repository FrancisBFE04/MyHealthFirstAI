/**
 * UpgradeModal - Shows when free users hit their daily limit
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { ActionButton } from './ActionButton';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { SUBSCRIPTION_CONFIG } from '../../constants/config';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradeModal({ visible, onClose, feature = 'AI Scan' }: UpgradeModalProps) {
  const { upgradeToPro, dailyScansUsed, dailyScansLimit } = useSubscription();

  const handleUpgrade = async () => {
    await upgradeToPro();
    onClose();
  };

  const proFeatures = [
    { icon: 'scan', label: 'Unlimited AI Food Scans' },
    { icon: 'mic', label: 'Voice Food Logging' },
    { icon: 'videocam', label: 'Form Correction Analysis' },
    { icon: 'nutrition', label: 'Advanced Meal Planning' },
    { icon: 'trophy', label: 'Exclusive Badges & Challenges' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <GlassCard style={styles.card}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Premium icon */}
            <LinearGradient
              colors={[Colors.premium, Colors.premiumEnd]}
              style={styles.iconContainer}
            >
              <Ionicons name="diamond" size={40} color={Colors.background} />
            </LinearGradient>

            {/* Title */}
            <Text style={styles.title}>Upgrade to Pro</Text>
            
            {/* Limit message */}
            <Text style={styles.limitMessage}>
              You've used {dailyScansUsed}/{dailyScansLimit} free {feature}s today.
            </Text>
            <Text style={styles.subtitle}>
              Unlock unlimited access and premium features!
            </Text>

            {/* Features list */}
            <View style={styles.featuresList}>
              {proFeatures.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.featureIcon}
                  >
                    <Ionicons 
                      name={feature.icon as any} 
                      size={16} 
                      color={Colors.text} 
                    />
                  </LinearGradient>
                  <Text style={styles.featureText}>{feature.label}</Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.pricing}>
              <Text style={styles.priceLabel}>Monthly</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currency}>$</Text>
                <Text style={styles.price}>{SUBSCRIPTION_CONFIG.PRO_MONTHLY_PRICE}</Text>
                <Text style={styles.period}>/mo</Text>
              </View>
              <Text style={styles.yearly}>
                or ${SUBSCRIPTION_CONFIG.PRO_YEARLY_PRICE}/year (Save 33%)
              </Text>
            </View>

            {/* Upgrade button */}
            <ActionButton
              title="🚀 Upgrade to Pro"
              onPress={handleUpgrade}
              variant="premium"
              size="lg"
              fullWidth
            />

            {/* Terms */}
            <Text style={styles.terms}>
              Cancel anytime. Billed monthly.
            </Text>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.xs,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  limitMessage: {
    fontSize: Typography.body,
    color: Colors.warning,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  featuresList: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.body,
    color: Colors.text,
  },
  pricing: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  priceLabel: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: Typography.h4,
    fontWeight: Typography.bold,
    color: Colors.premium,
    marginTop: 4,
  },
  price: {
    fontSize: 48,
    fontWeight: Typography.bold,
    color: Colors.premium,
  },
  period: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  yearly: {
    fontSize: Typography.small,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  terms: {
    fontSize: Typography.small,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
