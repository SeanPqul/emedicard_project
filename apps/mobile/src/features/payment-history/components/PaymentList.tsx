import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PaymentCard } from '@/src/entities/payment/ui/PaymentCard';
import { PaymentWithDetails } from '../hooks/usePaymentHistory';
import { EmptyPayments } from './EmptyPayments';
import { verticalScale, scale } from '@shared/utils/responsive';

interface PaymentListProps {
  payments: PaymentWithDetails[];
  hasFilter: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function PaymentList({ payments, hasFilter, refreshing, onRefresh }: PaymentListProps) {
  if (payments.length === 0) {
    return <EmptyPayments hasFilter={hasFilter} />;
  }

  return (
    <FlatList
      data={payments}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <PaymentCard
          amount={item.netAmount}
          status={item.status}
          paymentMethod={item.paymentMethod}
          date={item._creationTime}
          referenceNumber={item.referenceNumber}
          jobCategory={item.jobCategory}
          onPress={() => router.push(`/(screens)/(shared)/payment-detail?id=${item._id}`)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
  },
});
