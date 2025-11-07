import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';

type PaymentStatus = 'Pending' | 'Processing' | 'Complete' | 'Failed' | 'Refunded' | 'Cancelled' | 'Expired';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: 'small' | 'medium';
}

export function PaymentStatusBadge({ status, size = 'medium' }: PaymentStatusBadgeProps) {
  const config = getStatusConfig(status);
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }, isSmall && styles.badgeSmall]}>
      <Text style={[styles.badgeText, { color: config.color }, isSmall && styles.badgeTextSmall]}>
        {config.label}
      </Text>
    </View>
  );
}

function getStatusConfig(status: PaymentStatus) {
  const configs: Record<PaymentStatus, { label: string; color: string; backgroundColor: string }> = {
    Complete: {
      label: 'Complete',
      color: '#059669',
      backgroundColor: '#D1FAE5',
    },
    Pending: {
      label: 'Pending',
      color: '#D97706',
      backgroundColor: '#FEF3C7',
    },
    Processing: {
      label: 'Processing',
      color: '#2563EB',
      backgroundColor: '#DBEAFE',
    },
    Failed: {
      label: 'Failed',
      color: '#DC2626',
      backgroundColor: '#FEE2E2',
    },
    Refunded: {
      label: 'Refunded',
      color: '#7C3AED',
      backgroundColor: '#EDE9FE',
    },
    Cancelled: {
      label: 'Cancelled',
      color: '#6B7280',
      backgroundColor: '#F3F4F6',
    },
    Expired: {
      label: 'Expired',
      color: '#DC2626',
      backgroundColor: '#FEE2E2',
    },
  };

  return configs[status];
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  badgeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  badgeTextSmall: {
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
});
