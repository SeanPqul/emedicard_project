import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { PaymentFilterStatus } from '../hooks/usePaymentFilters';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

interface PaymentFiltersProps {
  selectedStatus: PaymentFilterStatus;
  onFilterChange: (status: PaymentFilterStatus) => void;
  filterCounts: Record<PaymentFilterStatus, number>;
}

const FILTERS: { value: PaymentFilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Complete', label: 'Complete' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
];

export function PaymentFilters({ selectedStatus, onFilterChange, filterCounts }: PaymentFiltersProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {FILTERS.map((filter) => {
        const isSelected = selectedStatus === filter.value;
        const count = filterCounts[filter.value] || 0;
        
        return (
          <TouchableOpacity
            key={filter.value}
            style={[styles.filterChip, isSelected && styles.filterChipActive]}
            onPress={() => onFilterChange(filter.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
              {filter.label}
            </Text>
            {count > 0 && (
              <View style={[styles.badge, isSelected && styles.badgeActive]}>
                <Text style={[styles.badgeText, isSelected && styles.badgeTextActive]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: verticalScale(50),
  },
  content: {
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: theme.colors.gray[100],
    borderWidth: 1,
    borderColor: 'transparent',
    gap: scale(6),
  },
  filterChipActive: {
    backgroundColor: theme.colors.green[500],
    borderColor: theme.colors.green[600],
  },
  filterText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  filterTextActive: {
    color: theme.colors.ui.white,
  },
  badge: {
    backgroundColor: theme.colors.gray[200],
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(10),
    minWidth: moderateScale(20),
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  badgeTextActive: {
    color: theme.colors.ui.white,
  },
});
