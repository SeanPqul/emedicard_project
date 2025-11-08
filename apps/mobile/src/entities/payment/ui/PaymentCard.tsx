import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { formatCurrency, formatPaymentDate, formatPaymentMethod, getPaymentMethodIcon } from '../lib/formatters';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

type PaymentStatus = 'Pending' | 'Processing' | 'Complete' | 'Failed' | 'Refunded' | 'Cancelled' | 'Expired';

interface PaymentCardProps {
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  date: number;
  referenceNumber: string;
  jobCategory?: {
    name: string;
    colorCode?: string;
  };
  onPress: () => void;
}

export function PaymentCard({
  amount,
  status,
  paymentMethod,
  date,
  referenceNumber,
  jobCategory,
  onPress,
}: PaymentCardProps) {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <PaymentStatusBadge status={status} size="small" />
        <View style={styles.methodContainer}>
          <Ionicons 
            name={getPaymentMethodIcon(paymentMethod) as any} 
            size={moderateScale(14)} 
            color={theme.colors.text.secondary} 
          />
          <Text style={styles.methodText}>{formatPaymentMethod(paymentMethod)}</Text>
        </View>
      </View>

      <Text style={styles.amount}>{formatCurrency(amount)}</Text>

      {jobCategory && (
        <View style={[styles.categoryChip, { backgroundColor: jobCategory.colorCode ? `${jobCategory.colorCode}20` : theme.colors.gray[100] }]}>
          <Text style={[styles.categoryText, { color: jobCategory.colorCode || theme.colors.text.secondary }]}>
            {jobCategory.name}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.date}>{formatPaymentDate(date)}</Text>
        <Text style={styles.reference}>{referenceNumber}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.ui.white,
    borderRadius: moderateScale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  methodText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  amount: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
  },
  categoryChip: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    alignSelf: 'flex-start',
    marginBottom: verticalScale(12),
  },
  categoryText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
  },
  reference: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
    fontFamily: 'monospace',
  },
});
