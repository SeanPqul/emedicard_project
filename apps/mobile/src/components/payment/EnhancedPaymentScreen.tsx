import React, { useState, useEffect } from 'react';
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
import { CustomButton } from '../ui/Button';
import { CustomTextInput } from '../ui/CustomTextInput';
import { ErrorState } from '../common/ErrorState';
import { LoadingSpinner, SkeletonLoader, SkeletonGroup } from '../common/LoadingSpinner';

// Payment hooks
import { usePaymentMaya } from '../../hooks/usePaymentMaya';

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

interface EnhancedPaymentScreenProps {
  applicationId: Id<"applications">;
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
const BASE_AMOUNT = 50;

export const EnhancedPaymentScreen: React.FC<EnhancedPaymentScreenProps> = ({
  applicationId,
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

  // Maya payment hook
  const mayaPayment = usePaymentMaya();

  const updateState = (updates: Partial<PaymentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    updateState({ 
      method, 
      error: null,
    });

    // For Maya, initiate the checkout flow immediately
    if (method === 'Maya') {
      try {
        updateState({ isSubmitting: true });
        
        const serviceFee = getServiceFee('Maya');
        const result = await mayaPayment.initiatePayment(
          applicationId, 
          BASE_AMOUNT, 
          serviceFee
        );

        if (result.success) {
          Alert.alert(
            'Payment Successful',
            'Your Maya payment has been completed successfully!',
            [{ text: 'OK', onPress: () => onPaymentSuccess(result.paymentId as Id<"payments">) }]
          );
        } else {
          Alert.alert(
            'Payment Failed',
            result.reason || 'The payment was not completed',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        const appError = error instanceof AppError ? error : new AppError('Maya payment failed', 'UNKNOWN');
        updateState({ error: appError });
        Alert.alert(
          'Payment Error',
          appError.message,
          [{ text: 'OK' }]
        );
      } finally {
        updateState({ isSubmitting: false });
      }
    } else {
      // For other payment methods, show the reference number input
      updateState({ showReceiptOption: true });
    }
  };

  const handleManualSubmitPayment = async (withReceipt: boolean = true) => {
    if (!state.method || !state.referenceNumber.trim()) {
      Alert.alert('Validation Error', 'Please select a payment method and enter a reference number.');
      return;
    }

    // Don't handle Maya here since it goes through the checkout flow
    if (state.method === 'Maya') {
      return;
    }

    updateState({ isSubmitting: true, error: null });

    try {
      const paymentData: PaymentSubmissionData = {
        applicationId,
        method: state.method,
        referenceNumber: state.referenceNumber.trim(),
      };

      const result = withReceipt 
        ? await submitPayment(paymentData)
        : await submitPaymentWithoutReceipt(paymentData);

      if (result.isExisting) {
        Alert.alert(
          'Payment Already Exists',
          'A payment has already been submitted for this application.',
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

  // Handle Maya payment result changes
  useEffect(() => {
    if (mayaPayment.paymentResult === 'success' && mayaPayment.currentPaymentId) {
      // Payment was successful, navigate to success
      onPaymentSuccess(mayaPayment.currentPaymentId as Id<"payments">);
    }
  }, [mayaPayment.paymentResult, mayaPayment.currentPaymentId]);

  const renderPaymentMethods = () => {
    const isLoading = state.isSubmitting || mayaPayment.isProcessing;
    
    if (isLoading) {
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
              disabled={isLoading}
            >
              <View style={styles.methodCardContent}>
                <Text style={[
                  styles.methodName,
                  state.method === method && styles.selectedMethodName,
                ]}>
                  {getPaymentMethodDisplayName(method)}
                </Text>
                {method === 'Maya' ? (
                  <Text style={styles.methodDescription}>
                    Pay securely via Maya app or QR
                  </Text>
                ) : (
                  getServiceFee(method) > 0 && (
                    <Text style={styles.serviceFee}>
                      +₱{getServiceFee(method)} service fee
                    </Text>
                  )
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

    // Only show reference input for non-Maya payment methods
    if (!state.method || state.method === 'Maya') return null;

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

    // Don't show submit buttons for Maya (handled via checkout)
    if (!state.method || state.method === 'Maya' || !state.referenceNumber.trim()) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submit Payment</Text>
        <View style={styles.buttonGroup}>
          <CustomButton
            title="Submit with Receipt"
            onPress={() => handleManualSubmitPayment(true)}
            loading={state.isSubmitting}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
          <CustomButton
            title="Submit without Receipt"
            onPress={() => handleManualSubmitPayment(false)}
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

  const renderMayaInstructions = () => {
    if (state.method !== 'Maya') return null;

    return (
      <View style={styles.instructionCard}>
        <Ionicons name="information-circle" size={20} color={getColor('info.600')} />
        <Text style={styles.instructionText}>
          Click on Maya above to proceed with payment. You'll be redirected to Maya's secure payment page.
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
    const isLoading = state.isSubmitting || mayaPayment.isProcessing;
    if (!isLoading) return null;

    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>
            {mayaPayment.isProcessing ? 'Processing Maya payment...' : 'Processing payment...'}
          </Text>
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
          <TouchableOpacity onPress={onBack} disabled={state.isSubmitting || mayaPayment.isProcessing}>
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
            <Text style={styles.summaryValue}>₱{BASE_AMOUNT}.00</Text>
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
              ₱{BASE_AMOUNT + (state.method ? getServiceFee(state.method) : 0)}.00
            </Text>
          </View>
        </View>

        {/* Error Display */}
        {renderError()}

        {/* Payment Methods */}
        {renderPaymentMethods()}

        {/* Maya Instructions */}
        {renderMayaInstructions()}

        {/* Reference Number Input (not for Maya) */}
        {renderReferenceInput()}

        {/* Submit Buttons (not for Maya) */}
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
  methodDescription: {
    ...getTypography('bodySmall'),
    color: getColor('success.600'),
    marginTop: getSpacing('xs'),
  },
  serviceFee: {
    ...getTypography('bodySmall'),
    color: getColor('text.tertiary'),
    marginTop: getSpacing('xs'),
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('info.50'),
    margin: getSpacing('lg'),
    padding: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    borderWidth: 1,
    borderColor: getColor('info.200'),
    gap: getSpacing('sm'),
  },
  instructionText: {
    ...getTypography('bodySmall'),
    color: getColor('info.700'),
    flex: 1,
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
