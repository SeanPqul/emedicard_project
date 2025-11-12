import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@/src/shared/components/core';
import { usePaymentHistory } from '@/src/features/payment-history/hooks/usePaymentHistory';
import { PaymentStatusBadge } from '@/src/entities/payment/ui/PaymentStatusBadge';
import { formatCurrency, formatPaymentDateTime, formatPaymentMethod, getPaymentMethodIcon } from '@/src/entities/payment/lib/formatters';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

export function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { payments, isLoading } = usePaymentHistory();

  const payment = payments.find(p => p._id === id);

  if (isLoading) {
    return (
      <BaseScreen safeArea={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Details</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.green[600]} />
          </View>
        </View>
      </BaseScreen>
    );
  }

  if (!payment) {
    return (
      <BaseScreen safeArea={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Details</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={moderateScale(64)} color={theme.colors.gray[400]} />
            <Text style={styles.errorTitle}>Payment Not Found</Text>
            <Text style={styles.errorMessage}>This payment transaction could not be found.</Text>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Details</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>{formatCurrency(payment.netAmount)}</Text>
            <PaymentStatusBadge status={payment.status} />
          </View>

          {/* Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PAYMENT INFORMATION</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reference Number</Text>
              <Text style={styles.infoValue}>{payment.referenceNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <View style={styles.methodContainer}>
                <Ionicons 
                  name={getPaymentMethodIcon(payment.paymentMethod) as any} 
                  size={moderateScale(16)} 
                  color={theme.colors.text.secondary} 
                />
                <Text style={styles.infoValue}>{formatPaymentMethod(payment.paymentMethod)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatPaymentDateTime(payment._creationTime)}</Text>
            </View>
          </View>

          {/* Amount Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AMOUNT BREAKDOWN</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Base Amount</Text>
              <Text style={styles.infoValue}>{formatCurrency(payment.amount)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Processing Fee</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(payment.serviceFee || (payment.netAmount - payment.amount))}
              </Text>
            </View>

            <View style={[styles.infoRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>{formatCurrency(payment.netAmount)}</Text>
            </View>
          </View>

          {/* Application Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APPLICATION DETAILS</Text>
            
            {payment.jobCategory && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{payment.jobCategory.name}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{payment.application.applicationType}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Position</Text>
              <Text style={styles.infoValue}>{payment.application.position}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Organization</Text>
              <Text style={styles.infoValue}>{payment.application.organization}</Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(32),
  },
  errorTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  errorMessage: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  amountCard: {
    backgroundColor: theme.colors.green[500],
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(20),
    padding: scale(24),
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: verticalScale(8),
  },
  amount: {
    fontSize: moderateScale(36),
    fontWeight: '700',
    color: theme.colors.ui.white,
    marginBottom: verticalScale(16),
  },
  section: {
    backgroundColor: theme.colors.ui.white,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(16),
    padding: scale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: verticalScale(16),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  infoLabel: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: scale(16),
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    flex: 1,
    justifyContent: 'flex-end',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: verticalScale(16),
    marginTop: verticalScale(8),
    borderTopWidth: 2,
    borderTopColor: theme.colors.gray[200],
  },
  totalLabel: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.green[600],
  },
  bottomSpacer: {
    height: verticalScale(24),
  },
});

