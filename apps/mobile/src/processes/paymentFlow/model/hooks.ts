import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';

// Payment flow utilities
import {
  submitPayment,
  submitPaymentWithoutReceipt,
  type PaymentMethod,
  type PaymentSubmissionData,
  type PaymentFlowResult,
  type PaymentServices,
} from '@features/payment/lib/paymentFlow';

// Error handling
import { AppError, AppErrorType } from '@shared/lib/errors';

// Types
import { Id } from '@backend/convex/_generated/dataModel';

// Hooks for payment services
import { usePayments } from '@features/payment/hooks/usePayments';
import { useDocumentUpload } from '@features/upload';

export interface PaymentFlowState {
  isSubmitting: boolean;
  error: AppError | null;
  result: PaymentFlowResult | null;
  progress: 'idle' | 'checking' | 'uploading' | 'creating' | 'completed';
}

export interface UsePaymentFlowOptions {
  onSuccess?: (result: PaymentFlowResult) => void;
  onError?: (error: AppError) => void;
  showAlerts?: boolean;
}

export interface UsePaymentFlowReturn {
  state: PaymentFlowState;
  submitWithReceipt: (data: PaymentSubmissionData, services?: PaymentServices) => Promise<PaymentFlowResult | null>;
  submitWithoutReceipt: (data: PaymentSubmissionData, services?: PaymentServices) => Promise<PaymentFlowResult | null>;
  clearError: () => void;
  reset: () => void;
  isLoading: boolean;
  canSubmit: boolean;
}

const initialState: PaymentFlowState = {
  isSubmitting: false,
  error: null,
  result: null,
  progress: 'idle',
};

/**
 * Custom hook for managing payment flow operations
 * 
 * Features:
 * - State management for payment submission
 * - Error handling with proper AppError types
 * - Progress tracking (idle, checking, uploading, creating, completed)
 * - Duplicate submission prevention
 * - Optional success/error callbacks
 * - Built-in alert dialogs for user feedback
 */
export function usePaymentFlow(options: UsePaymentFlowOptions = {}, defaultServices?: PaymentServices): UsePaymentFlowReturn {
  const {
    onSuccess,
    onError,
    showAlerts = true,
  } = options;

  const [state, setState] = useState<PaymentFlowState>(initialState);
  const submissionRef = useRef<boolean>(false);

  const updateState = useCallback((updates: Partial<PaymentFlowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const reset = useCallback(() => {
    setState(initialState);
    submissionRef.current = false;
  }, []);

  const showSuccessAlert = useCallback((result: PaymentFlowResult) => {
    if (!showAlerts) return;

    if (result.isExisting) {
      Alert.alert(
        'Payment Already Exists',
        'A payment has already been submitted for this form.',
        [{ text: 'OK' }]
      );
    } else {
      const message = result.receiptUploaded
        ? 'Payment submitted successfully with receipt!'
        : 'Payment submitted successfully!';
      
      Alert.alert('Payment Successful', message, [{ text: 'OK' }]);
    }
  }, [showAlerts]);

  const showErrorAlert = useCallback((error: AppError) => {
    if (!showAlerts) return;

      const getErrorMessage = () => {
        switch (error.type) {
          case AppErrorType.NETWORK_OFFLINE:
            return 'You are offline. Please check your connection and try again.';
          case AppErrorType.NETWORK_ERROR:
            return 'Network error occurred. Please check your connection and try again.';
          case AppErrorType.NETWORK_TIMEOUT:
            return 'Request timed out. Please try again.';
          case AppErrorType.VALIDATION_FAILED:
            return error.message;
          case AppErrorType.SERVER_ERROR:
            return 'Server error occurred. Please try again later.';
          default:
            return 'Payment submission failed. Please try again.';
        }
      };

    Alert.alert('Payment Error', getErrorMessage(), [{ text: 'OK' }]);
  }, [showAlerts]);

  const handleSubmission = useCallback(async (
    submissionFn: (data: PaymentSubmissionData, services: PaymentServices) => Promise<PaymentFlowResult>,
    data: PaymentSubmissionData,
    services: PaymentServices,
    withReceipt: boolean
  ): Promise<PaymentFlowResult | null> => {
    // Prevent duplicate submissions
    if (submissionRef.current) {
      return null;
    }

    submissionRef.current = true;
    updateState({ 
      isSubmitting: true, 
      error: null, 
      progress: 'checking',
      result: null 
    });

    try {
      // Update progress based on operation type
      if (withReceipt) {
        updateState({ progress: 'uploading' });
      }

      updateState({ progress: 'creating' });
      const result = await submissionFn(data, services);

      updateState({ 
        isSubmitting: false,
        progress: 'completed',
        result 
      });

      // Show success feedback
      showSuccessAlert(result);

      // Call success callback
      onSuccess?.(result);

      return result;

    } catch (error) {
      const appError = error instanceof AppError 
        ? error 
        : new AppError(AppErrorType.UNKNOWN, 'Payment submission failed');

      updateState({ 
        isSubmitting: false,
        error: appError,
        progress: 'idle'
      });

      // Show error feedback
      showErrorAlert(appError);

      // Call error callback
      onError?.(appError);

      return null;
    } finally {
      submissionRef.current = false;
    }
  }, [updateState, showSuccessAlert, showErrorAlert, onSuccess, onError]);

  const submitWithReceipt = useCallback(async (
    data: PaymentSubmissionData,
    services?: PaymentServices
  ): Promise<PaymentFlowResult | null> => {
    if (!services && !defaultServices) {
      throw new AppError(AppErrorType.VALIDATION_FAILED, 'Payment services not provided');
    }
    return handleSubmission(submitPayment, data, services || defaultServices!, true);
  }, [handleSubmission, defaultServices]);

  const submitWithoutReceipt = useCallback(async (
    data: PaymentSubmissionData,
    services?: PaymentServices
  ): Promise<PaymentFlowResult | null> => {
    if (!services && !defaultServices) {
      throw new AppError(AppErrorType.VALIDATION_FAILED, 'Payment services not provided');
    }
    return handleSubmission(submitPaymentWithoutReceipt, data, services || defaultServices!, false);
  }, [handleSubmission, defaultServices]);

  const isLoading = state.isSubmitting;
  const canSubmit = !state.isSubmitting && !submissionRef.current;

  return {
    state,
    submitWithReceipt,
    submitWithoutReceipt,
    clearError,
    reset,
    isLoading,
    canSubmit,
  };
}

/**
 * Utility hook for payment method selection and validation
 */
export interface UsePaymentMethodReturn {
  selectedMethod: PaymentMethod | null;
  referenceNumber: string;
  setSelectedMethod: (method: PaymentMethod | null) => void;
  setReferenceNumber: (number: string) => void;
  isValid: boolean;
  getServiceFee: () => number;
  getTotalAmount: (baseAmount?: number) => number;
  reset: () => void;
}

export function usePaymentMethod(baseAmount: number = 50): UsePaymentMethodReturn {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');

  const isValid = selectedMethod !== null && referenceNumber.trim().length > 0;

  const getServiceFee = useCallback(() => {
    if (!selectedMethod) return 0;
    return selectedMethod === 'Maya' ? 5 : 0;
  }, [selectedMethod]);

  const getTotalAmount = useCallback((amount = baseAmount) => {
    return amount + getServiceFee();
  }, [baseAmount, getServiceFee]);

  const reset = useCallback(() => {
    setSelectedMethod(null);
    setReferenceNumber('');
  }, []);

  return {
    selectedMethod,
    referenceNumber,
    setSelectedMethod,
    setReferenceNumber,
    isValid,
    getServiceFee,
    getTotalAmount,
    reset,
  };
}

/**
 * Combined hook that manages both payment method selection and submission flow
 */
export interface UsePaymentManagerReturn extends UsePaymentFlowReturn {
  method: PaymentMethod | null;
  referenceNumber: string;
  setMethod: (method: PaymentMethod | null) => void;
  setReferenceNumber: (number: string) => void;
  isFormValid: boolean;
  serviceFee: number;
  totalAmount: number;
  resetForm: () => void;
  submitCurrentPayment: (formId: Id<"applications">, withReceipt?: boolean) => Promise<PaymentFlowResult | null>;
}

export function usePaymentManager(
  baseAmount: number = 50,
  options: UsePaymentFlowOptions = {}
): UsePaymentManagerReturn {
  const paymentFlow = usePaymentFlow(options);
  const paymentMethod = usePaymentMethod(baseAmount);

  const resetForm = useCallback(() => {
    paymentFlow.reset();
    paymentMethod.reset();
  }, [paymentFlow, paymentMethod]);

  const submitCurrentPayment = useCallback(async (
    formId: Id<"applications">,
    withReceipt: boolean = true
  ): Promise<PaymentFlowResult | null> => {
    if (!paymentMethod.selectedMethod || !paymentMethod.referenceNumber.trim()) {
      const error = new AppError(AppErrorType.VALIDATION_FAILED, 'Please select a payment method and enter a reference number');
      options.onError?.(error);
      return null;
    }

    const data: PaymentSubmissionData = {
      applicationId: formId,
      method: paymentMethod.selectedMethod,
      referenceNumber: paymentMethod.referenceNumber.trim(),
    };

    return withReceipt 
      ? paymentFlow.submitWithReceipt(data)
      : paymentFlow.submitWithoutReceipt(data);
  }, [paymentMethod, paymentFlow, options]);

  return {
    ...paymentFlow,
    method: paymentMethod.selectedMethod,
    referenceNumber: paymentMethod.referenceNumber,
    setMethod: paymentMethod.setSelectedMethod,
    setReferenceNumber: paymentMethod.setReferenceNumber,
    isFormValid: paymentMethod.isValid,
    serviceFee: paymentMethod.getServiceFee(),
    totalAmount: paymentMethod.getTotalAmount(),
    resetForm,
    submitCurrentPayment,
  };
}