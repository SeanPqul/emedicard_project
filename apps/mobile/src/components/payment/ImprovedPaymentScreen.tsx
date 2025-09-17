import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Components
import { CustomButton } from '../ui/Button';
import { CustomTextInput } from '../ui/CustomTextInput';
import { ErrorState } from '../common/ErrorState';
import { LoadingSpinner, SkeletonLoader, SkeletonGroup } from '../common/LoadingSpinner';

// Hooks
import { 
  usePaymentManager, 
} from '../../hooks/usePaymentFlow';

// Utilities
import { 
  getPaymentMethodDisplayName,
  getServiceFee,
  PaymentMethod,
} from '../../lib/payment/paymentFlow';

// Types and styling
import { Id } from '../../../../../backend/convex/_generated/dataModel';
import { AppError } from '../../lib/errors';
import { getColor, getTypography, getSpacing, getBorderRadius } from '../../styles/theme';

interface ImprovedPaymentScreenProps {
  formId: Id<"forms">;
  onPaymentSuccess: (paymentId: Id<"payments">) => void;
  onBack: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Gcash', 'Maya', 'BaranggayHall', 'CityHall'];

export const ImprovedPaymentScreen: React.FC<ImprovedPaymentScreenProps> = ({
  formId,
  onPaymentSuccess,
  onBack,
}) => {
  // Use the payment manager hook for complete state management
  const payment = usePaymentManager(50, {
    onSuccess: (result) => onPaymentSuccess(result.paymentId),
    showAlerts: true, // Enable built-in alert dialogs
  });

  const handleSubmitWithReceipt = () => {
    payment.submitCurrentPayment(formId, true);
  };

  const handleSubmitWithoutReceipt = () => {
    payment.submitCurrentPayment(formId, false);
  };

  const getProgressMessage = () => {
    switch (payment.state.progress) {
      case 'checking':
        return 'Checking existing payment...';
      case 'uploading':
        return 'Uploading receipt...';
      case 'creating':
        return 'Creating payment record...';
      case 'completed':
        return 'Payment completed!';
      default:
        return 'Processing payment...';
    }
  };

  const renderPaymentMethods = () => {
    if (payment.isLoading && !payment.method) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader count={1} height={20} style={{ marginBottom: 8 }} />
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
                payment.method === method && styles.selectedMethodCard,
              ]}
              onPress={() => payment.setMethod(method)}
              disabled={payment.isLoading}
            >
              <View style={styles.methodCardContent}>
                <Text style={[
                  styles.methodName,
                  payment.method === method && styles.selectedMethodName,
                ]}>
                  {getPaymentMethodDisplayName(method)}
                </Text>
                {getServiceFee(method) > 0 && (
                  <Text style={styles.serviceFee}>
                    +₱{getServiceFee(method)} service fee
                  </Text>
                )}
              </View>
              {payment.method === method && (
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
    if (payment.isLoading && !payment.method) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader count={1} height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader count={1} height={50} />
        </View>
      );
    }

    if (!payment.method) return null;

    return (
      <View style={styles.section}>
        <CustomTextInput
          label="Reference Number"
          value={payment.referenceNumber}
          onChangeText={payment.setReferenceNumber}
          placeholder="Enter reference number"
          editable={!payment.isLoading}
          showRequiredIndicator
          autoCapitalize="characters"
        />
      </View>
    );
  };

  const renderSubmitButtons = () => {
    if (payment.isLoading && !payment.isFormValid) {
      return (
        <View style={styles.skeletonContainer}>
          <SkeletonGroup count={2}>
            <SkeletonLoader count={1} height={48} />
          </SkeletonGroup>
        </View>
      );
    }

    if (!payment.isFormValid) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submit Payment</Text>
        <View style={styles.buttonGroup}>
          <CustomButton
            title="Submit with Receipt"
            onPress={handleSubmitWithReceipt}
            loading={payment.isLoading}
            disabled={!payment.canSubmit}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
          <CustomButton
            title="Submit without Receipt"
            onPress={handleSubmitWithoutReceipt}
            loading={payment.isLoading}
            disabled={!payment.canSubmit}
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
    if (!payment.state.error) return null;

    const getErrorMessage = () => {
      switch (payment.state.error?.code) {
        case 'OFFLINE':
          return "You are offline. Please check your connection and try again.";
        case 'NETWORK':
          return "Network error occurred. Please check your connection and try again.";
        case 'TIMEOUT':
          return "Request timed out. Please try again.";
        case 'VALIDATION':
          return payment.state.error.message;
        default:
          return "Payment submission failed. Please try again.";
      }
    };

    return (
      <ErrorState
        type="payment"
        message={getErrorMessage()}
        error={payment.state.error}
        onRetry={payment.clearError}
        variant="card"
        showDetails={__DEV__}
      />
    );
  };

  const renderLoadingOverlay = () => {
    if (!payment.isLoading) return null;

    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>{getProgressMessage()}</Text>
          <Text style={styles.loadingSubText}>
            Please wait while we process your request.
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
          <TouchableOpacity onPress={onBack} disabled={payment.isLoading}>
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
          {payment.serviceFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>₱{payment.serviceFee}.00</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₱{payment.totalAmount}.00
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

        {/* Progress Indicator */}
        {payment.isLoading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{getProgressMessage()}</Text>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: payment.state.progress === 'completed' ? '100%' : '60%' }
              ]} />
            </View>
          </View>
        )}
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
    ...getTypography('h2'),
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
    ...getTypography('h3'),
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
    ...getTypography('h3'),
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
  progressContainer: {
    margin: getSpacing('lg'),
    padding: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('md'),
    borderWidth: 1,
    borderColor: getColor('border.secondary'),
  },
  progressText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginBottom: getSpacing('sm'),
  },
  progressBar: {
    height: 4,
    backgroundColor: getColor('gray.200'),
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: getColor('primary.500'),
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
