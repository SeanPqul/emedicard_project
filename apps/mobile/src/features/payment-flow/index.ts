/**
 * Payment Flow Feature - Complete Implementation
 * Extracted from usePaymentFlow.ts and PaymentSubmissionScreen
 */

import { useState } from 'react';
import { usePayments, useCreatePayment, PaymentMethod } from '../../entities/payment';
import { ConvexId } from '../../shared/api';

// ===== TYPES =====
export interface PaymentFlowData {
  paymentMethod: PaymentMethod | '';
  referenceNumber: string;
  receiptImage?: any;
  amount: number;
  serviceFee: number;
  netAmount: number;
}

export interface PaymentFlowState {
  currentStep: number;
  data: PaymentFlowData;
  errors: Partial<PaymentFlowData>;
  isSubmitting: boolean;
  isUploading: boolean;
}

export interface PaymentFlowResult {
  success: boolean;
  paymentId?: ConvexId<'payments'>;
  error?: string;
}

// ===== PAYMENT STEPS =====
export const PAYMENT_STEPS = [
  { id: 1, title: 'Payment Method', component: 'PaymentMethodStep' },
  { id: 2, title: 'Payment Details', component: 'PaymentDetailsStep' },
  { id: 3, title: 'Upload Receipt', component: 'ReceiptUploadStep' },
  { id: 4, title: 'Confirmation', component: 'PaymentConfirmationStep' },
] as const;

// ===== HOOKS =====
export const usePaymentFlow = (applicationId: ConvexId<'applications'>) => {
  const { data: { existingPayment } } = usePayments(applicationId);
  const { createPayment } = useCreatePayment();

  const [flowState, setFlowState] = useState<PaymentFlowState>({
    currentStep: 1,
    data: {
      paymentMethod: '',
      referenceNumber: '',
      receiptImage: null,
      amount: 60, // Default health card fee
      serviceFee: 3, // 5% service fee
      netAmount: 63,
    },
    errors: {},
    isSubmitting: false,
    isUploading: false,
  });

  const updateField = <K extends keyof PaymentFlowData>(
    field: K,
    value: PaymentFlowData[K]
  ) => {
    setFlowState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: undefined },
    }));
  };

  const nextStep = () => {
    setFlowState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, PAYMENT_STEPS.length),
    }));
  };

  const prevStep = () => {
    setFlowState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const uploadReceiptImage = async (imageUri: string) => {
    setFlowState(prev => ({ ...prev, isUploading: true }));
    
    try {
      // TODO: Implement actual image upload to storage
      console.log('Uploading receipt image:', imageUri);
      
      setFlowState(prev => ({ 
        ...prev, 
        isUploading: false,
        data: { ...prev.data, receiptImage: imageUri }
      }));
      
      return true;
    } catch (error) {
      console.error('Receipt upload error:', error);
      setFlowState(prev => ({ ...prev, isUploading: false }));
      return false;
    }
  };

  const submitPayment = async (): Promise<PaymentFlowResult> => {
    setFlowState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const payment = await createPayment({
        applicationId,
        amount: flowState.data.amount,
        serviceFee: flowState.data.serviceFee,
        netAmount: flowState.data.netAmount,
        paymentMethod: flowState.data.paymentMethod as PaymentMethod,
        referenceNumber: flowState.data.referenceNumber,
        receiptId: flowState.data.receiptImage ? 'receipt-storage-id' as ConvexId<'_storage'> : undefined,
      });

      if (payment) {
        return { success: true, paymentId: payment._id };
      } else {
        return { success: false, error: 'Payment submission failed' };
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      return { success: false, error: 'Payment submission failed' };
    } finally {
      setFlowState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    ...flowState,
    existingPayment,
    updateField,
    nextStep,
    prevStep,
    uploadReceiptImage,
    submitPayment,
    canProceed: flowState.currentStep < PAYMENT_STEPS.length,
    canGoBack: flowState.currentStep > 1,
  };
};

// ===== VALIDATION =====
export const validatePaymentData = (data: PaymentFlowData): Partial<PaymentFlowData> => {
  const errors: Partial<PaymentFlowData> = {};

  if (!data.paymentMethod) {
    errors.paymentMethod = 'Payment method is required' as any;
  }

  if (!data.referenceNumber.trim()) {
    errors.referenceNumber = 'Reference number is required';
  }

  // Validate reference number format based on payment method
  if (data.paymentMethod && data.referenceNumber) {
    switch (data.paymentMethod) {
      case 'Gcash':
        if (!/^\d{13}$/.test(data.referenceNumber)) {
          errors.referenceNumber = 'GCash reference should be 13 digits';
        }
        break;
      case 'Maya':
        if (!/^\d{12,15}$/.test(data.referenceNumber)) {
          errors.referenceNumber = 'Maya reference should be 12-15 digits';
        }
        break;
    }
  }

  return errors;
};

// ===== PAYMENT METHODS =====
export const PAYMENT_METHODS = [
  {
    id: 'Gcash',
    name: 'GCash',
    icon: 'phone',
    description: 'Pay using GCash mobile wallet',
    fee: 0,
  },
  {
    id: 'Maya',
    name: 'Maya (PayMaya)',
    icon: 'card',
    description: 'Pay using Maya mobile wallet',
    fee: 0,
  },
  {
    id: 'BaranggayHall',
    name: 'Barangay Hall',
    icon: 'home',
    description: 'Pay at your local barangay hall',
    fee: 0,
  },
  {
    id: 'CityHall',
    name: 'City Hall',
    icon: 'business',
    description: 'Pay at the city hall',
    fee: 0,
  },
] as const;

// ===== UI COMPONENTS =====
export interface PaymentStepProps {
  data: PaymentFlowData;
  errors: Partial<PaymentFlowData>;
  updateField: <K extends keyof PaymentFlowData>(field: K, value: PaymentFlowData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  isUploading?: boolean;
}

// Placeholder components that would be extracted from PaymentSubmissionScreen
export const PaymentMethodSelector = () => null; // TODO: Extract from existing screen
export const PaymentDetailsForm = () => null; // TODO: Extract from existing screen
export const ReceiptUploader = () => null; // TODO: Extract from existing screen
export const PaymentConfirmation = () => null; // TODO: Extract from existing screen
export const PaymentSummary = () => null; // TODO: Extract from existing screen