import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Components
import { CustomButton } from '@/src/shared/components/buttons';
import { CustomTextInput } from '@/src/shared/components/inputs';
import { ErrorState } from '@/src/shared/components/feedback';
import { LoadingSpinner, SkeletonLoader, SkeletonGroup } from '@/src/shared/components/feedback';

// Payment flow and utilities
import {
  submitPayment,
  submitPaymentWithoutReceipt,
  PaymentMethod,
  PaymentSubmissionData,
  getPaymentMethodDisplayName,
  getServiceFee,
} from '../../lib/payment/paymentFlow';

// Types and utilities
import { Id } from '../../../../../backend/convex/_generated/dataModel';
import { AppError } from '../../lib/errors';
import { getColor, getTypography, getSpacing, getBorderRadius } from '../../styles/theme';

interface PaymentSubmissionScreenProps {
  formId: Id<"forms">;
  onPaymentSuccess: (paymentId: Id<"payments">) => void;
  onBack: () => void;
}

interface PaymentState {
  method: PaymentMethod | null;
  referenceNumber: string;
  isSubmitting: boolean;
  error: AppError | null;
  showReceiptOption: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Gcash', 'Maya', 'BaranggayHall', 'CityHall'];

export const PaymentSubmissionScreen: React.FC<PaymentSubmissionScreenProps> = ({
  formId,
  onPaymentSuccess,
  onBack,
}) => {
  const [state, setState] = useState<PaymentState>({
    method: null,
    referenceNumber: '',
    isSubmitting: false,
    error: null,
    showReceiptOption: false,
  });

  const updateState = (updates: Partial<PaymentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    updateState({ 
      method, 
      error: null,
      showReceiptOption: true,
    });
  };

  const handleSubmitPayment = async (withReceipt: boolean = true) => {
    if (!state.method || !state.referenceNumber.trim()) {
      Alert.alert('Validation Error', 'Please select a payment method and enter a reference number.');
      return;
    }

    updateState({ isSubmitting: true, error: null });

    try {
      const paymentData: PaymentSubmissionData = {
        formId,
        method: state.method,
        referenceNumber: state.referenceNumber.trim(),
      };

      const result = withReceipt 
        ? await submitPayment(paymentData)
        : await submitPaymentWithoutReceipt(paymentData);

      if (result.isExisting) {
        Alert.alert(
          'Payment Already Exists',
          'A payment has already been submitted for this form.',
          [{ text: 'OK', onPress: () => onPaymentSuccess(result.paymentId) }]
        );
      } else {
        const successMessage = result.receiptUploaded
          ? 'Payment submitted successfully with receipt!'
          : 'Payment submitted successfully!';
        
        Alert.alert(
          'Payment Successful',
          successMessage,
          [{ text: 'OK', onPress: () => onPaymentSuccess(result.paymentId) }]
        );
      }
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError('Payment failed', 'UNKNOWN');
      updateState({ error: appError });
    } finally {
      updateState({ isSubmitting: false });
    }
  };

  const renderPaymentMethods = () => {
    if (state.isSubmitting) {
      return (
        <View style={styles.skeletonContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <SkeletonGroup count={4}>
            <SkeletonLoader count={1} height={60} />
          </SkeletonGroup>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        <View style={styles.methodsGrid}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.methodCard,
                state.method === method && styles.selectedMethodCard,
              ]}
              onPress={() => handlePaymentMethodSelect(method)}
              disabled={state.isSubmitting}
            >
              <View style={styles.methodCardContent}>
                <Text style={[
                  styles.methodName,
                  state.method === method && styles.selectedMethodName,
                ]}>
                  {getPaymentMethodDisplayName(method)}
                </Text>
                {getServiceFee(method) > 0 && (
                  <Text style={styles.serviceFee}>
                    +₱{getServiceFee(method)} service fee
                  </Text>
                )}
              </View>
              {state.method === method && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={getColor('primary.500')} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderReferenceInput = () => {
    if (state.isSubmitting && !state.method) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader count={1} height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader count={1} height={50} />
        </View>
      );
    }

    if (!state.method) return null;

    return (
      <View style={styles.section}>
        <CustomTextInput
          label="Reference Number"
          value={state.referenceNumber}
          onChangeText={(text) => updateState({ referenceNumber: text, error: null })}
          placeholder="Enter reference number"
          disabled={state.isSubmitting}
          required
        />
      </View>
    );
  };

  const renderSubmitButtons = () => {
    if (state.isSubmitting) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonGroup count={2}>
            <SkeletonLoader count={1} height={48} />
          </SkeletonGroup>
        </View>
      );
    }

    if (!state.method || !state.referenceNumber.trim()) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submit Payment</Text>
        <View style={styles.buttonGroup}>
          <CustomButton
            title="Submit with Receipt"
            onPress={() => handleSubmitPayment(true)}
            loading={state.isSubmitting}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
          <CustomButton
            title="Submit without Receipt"
            onPress={() => handleSubmitPayment(false)}
            loading={state.isSubmitting}
            variant="secondary"
            size="large"
            style={styles.submitButton}
          />
        </View>
        <Text style={styles.helpText}>
          Receipt upload is optional. You can submit without a receipt and add it later if needed.
        </Text>
      </View>
    );
  };

  const renderError = () => {
    if (!state.error) return null;

    const getErrorMessage = () => {
      switch (state.error?.code) {
        case 'OFFLINE':
          return "You are offline. Please check your connection and try again.";
        case 'NETWORK':
          return "Network error occurred. Please check your connection and try again.";
        case 'TIMEOUT':
          return "Request timed out. Please try again.";
        case 'VALIDATION':
          return state.error.message;
        default:
          return "Payment submission failed. Please try again.";
      }
    };

    return (
      <ErrorState
        type="payment"
        message={getErrorMessage()}
        error={state.error}
        onRetry={() => updateState({ error: null })}
        variant="card"
        showDetails={__DEV__}
      />
    );
  };

  const renderLoadingOverlay = () => {
    if (!state.isSubmitting) return null;

    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Processing payment...</Text>
          <Text style={styles.loadingSubText}>
            Please wait while we process your payment submission.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} disabled={state.isSubmitting}>
            <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Submission</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base Amount</Text>
            <Text style={styles.summaryValue}>₱50.00</Text>
          </View>
          {state.method && getServiceFee(state.method) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>₱{getServiceFee(state.method)}.00</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₱{50 + (state.method ? getServiceFee(state.method) : 0)}.00
            </Text>
          </View>
        </View>

        {/* Error Display */}
        {renderError()}

        {/* Payment Methods */}
        {renderPaymentMethods()}

        {/* Reference Number Input */}
        {renderReferenceInput()}

        {/* Submit Buttons */}
        {renderSubmitButtons()}
      </ScrollView>

      {/* Loading Overlay */}
      {renderLoadingOverlay()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getSpacing('xl'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.primary'),
  },
  headerTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  summaryCard: {
    backgroundColor: getColor('background.secondary'),
    margin: getSpacing('lg'),
    padding: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
    borderWidth: 1,
    borderColor: getColor('border.secondary'),
  },
  summaryTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('xs'),
  },
  summaryLabel: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
  },
  summaryValue: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: getColor('border.primary'),
    marginTop: getSpacing('sm'),
    paddingTop: getSpacing('sm'),
  },
  totalLabel: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  totalValue: {
    ...getTypography('body'),
    color: getColor('primary.500'),
    fontWeight: '700',
  },
  section: {
    margin: getSpacing('lg'),
  },
  sectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
  },
  methodsGrid: {
    gap: getSpacing('sm'),
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.secondary'),
    padding: getSpacing('lg'),
    borderRadius: getBorderRadius('md'),
    borderWidth: 1,
    borderColor: getColor('border.secondary'),
  },
  selectedMethodCard: {
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('primary.50'),
  },
  methodCardContent: {
    flex: 1,
  },
  methodName: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '500',
  },
  selectedMethodName: {
    color: getColor('primary.600'),
  },
  serviceFee: {
    ...getTypography('bodySmall'),
    color: getColor('text.tertiary'),
    marginTop: getSpacing('xs'),
  },
  buttonGroup: {
    gap: getSpacing('sm'),
  },
  submitButton: {
    width: '100%',
  },
  helpText: {
    ...getTypography('bodySmall'),
    color: getColor('text.tertiary'),
    textAlign: 'center',
    marginTop: getSpacing('md'),
    lineHeight: 18,
  },
  skeletonContainer: {
    margin: getSpacing('lg'),
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('xl'),
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginTop: getSpacing('md'),
    fontWeight: '500',
  },
  loadingSubText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    marginTop: getSpacing('sm'),
    textAlign: 'center',
  },
});
