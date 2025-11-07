import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@/src/shared/components/core';
import { usePaymentHistory } from '@/src/features/payment-history/hooks/usePaymentHistory';
import { usePaymentFilters } from '@/src/features/payment-history/hooks/usePaymentFilters';
import { PaymentFilters } from '@/src/features/payment-history/components/PaymentFilters';
import { PaymentList } from '@/src/features/payment-history/components/PaymentList';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

/**
 * PaymentHistoryScreen
 * 
 * Displays user's payment transaction history with filtering
 * Follows FSD architecture pattern
 */
export function PaymentHistoryScreen() {
  const { payments, isLoading } = usePaymentHistory();
  const { selectedStatus, setSelectedStatus, filteredPayments, filterCounts } = usePaymentFilters(payments);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Convex will automatically refetch
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <BaseScreen safeArea={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment History</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.green[600]} />
            <Text style={styles.loadingText}>Loading payments...</Text>
          </View>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen safeArea={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment History</Text>
          <View style={styles.backButton} />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <PaymentFilters
            selectedStatus={selectedStatus}
            onFilterChange={setSelectedStatus}
            filterCounts={filterCounts}
          />
        </View>

        {/* Payment List */}
        <PaymentList
          payments={filteredPayments}
          hasFilter={selectedStatus !== 'all'}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.colors.ui.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  filtersContainer: {
    paddingVertical: verticalScale(12),
    backgroundColor: theme.colors.ui.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
});

