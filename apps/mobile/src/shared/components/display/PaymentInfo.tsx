/**
 * PaymentInfo Component
 * 
 * Reusable component for displaying payment information with reference, timestamp, and support
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale, fontScale } from '@shared/utils/responsive';
import type { BaseComponentProps } from '@/src/types/design-system';

export interface PaymentInfoProps extends BaseComponentProps {
  /** Payment reference/ID to display */
  referenceNumber: string;
  /** Timestamp of the payment event */
  timestamp?: string;
  /** Status variant for styling */
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export const PaymentInfo: React.FC<PaymentInfoProps> = React.memo(({
  referenceNumber,
  timestamp,
  variant = 'info',
  testID,
  ...props
}) => {
  const handleCopyReference = async () => {
    try {
      // Try to use expo-clipboard if available
      const Clipboard = await import('expo-clipboard').catch(() => null);
      if (Clipboard) {
        await Clipboard.setStringAsync(referenceNumber);
        Alert.alert('Copied', 'Payment reference has been copied to clipboard');
      } else {
        // Fallback: just show the reference
        Alert.alert('Payment Reference', referenceNumber, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } catch (error) {
      Alert.alert('Payment Reference', referenceNumber, [
        { text: 'OK', style: 'default' }
      ]);
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'success':
        return theme.colors.status.success;
      case 'error':
        return theme.colors.status.error;
      case 'warning':
        return theme.colors.status.warning;
      default:
        return theme.colors.border.light;
    }
  };

  return (
    <View style={styles.container} testID={testID} {...props}>
      {/* Reference Container */}
      <View style={styles.referenceContainer}>
        <View style={styles.referenceHeader}>
          <Text style={styles.referenceLabel}>Reference</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyReference}>
            <Ionicons name="copy-outline" size={moderateScale(18)} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.referenceText}>{referenceNumber}</Text>
      </View>

      {/* Timestamp */}
      {timestamp && (
        <Text style={styles.timestampText}>{timestamp}</Text>
      )}
    </View>
  );
});

PaymentInfo.displayName = 'PaymentInfo';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: verticalScale(16),
  },
  referenceContainer: {
    marginTop: verticalScale(12),
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  referenceLabel: {
    fontSize: fontScale(14),
    fontWeight: '400',
    color: theme.colors.text.secondary,
  },
  referenceText: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: scale(4),
  },
  timestampText: {
    fontSize: fontScale(13),
    color: theme.colors.text.tertiary,
    marginTop: verticalScale(8),
  },
});
