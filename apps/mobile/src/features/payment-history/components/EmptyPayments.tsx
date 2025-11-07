import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

interface EmptyPaymentsProps {
  hasFilter: boolean;
}

export function EmptyPayments({ hasFilter }: EmptyPaymentsProps) {
  if (hasFilter) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="filter-outline" size={moderateScale(48)} color={theme.colors.gray[400]} />
        </View>
        <Text style={styles.title}>No payments found</Text>
        <Text style={styles.message}>
          Try adjusting your filters to see more results
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="receipt-outline" size={moderateScale(64)} color={theme.colors.gray[400]} />
      </View>
      <Text style={styles.title}>No Payment History Yet</Text>
      <Text style={styles.message}>
        Your payment transactions will appear here once you submit an application
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(tabs)/apply')}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={moderateScale(20)} color={theme.colors.ui.white} />
        <Text style={styles.buttonText}>Start Application</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(60),
  },
  iconContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  message: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.green[600],
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    gap: scale(8),
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.ui.white,
  },
});
