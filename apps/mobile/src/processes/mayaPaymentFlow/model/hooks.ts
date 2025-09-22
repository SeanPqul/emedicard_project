/**
 * Maya Payment Flow Hook
 * Orchestrates Maya payment process across features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from 'backend/convex/_generated/api';
import { Id } from 'backend/convex/_generated/dataModel';

import {
  PaymentResult,
  PaymentStatus,
  MayaPaymentState,
  UseMayaPaymentReturn,
} from './types';

import { openMayaCheckout } from '../lib/maya-app-integration';
import { setupDeepLinkListeners, trackDeepLinkEvent } from '../lib/deep-link-handler';
import { 
  validatePaymentAmount, 
  calculateTotalAmount,
  logPaymentEvent 
} from '../lib/utils';

/**
 * Maya Payment Hook
 * 
 * This hook orchestrates the complete Maya payment flow:
 * 1. Validates payment parameters
 * 2. Creates checkout session via Convex
 * 3. Opens Maya app or browser fallback
 * 4. Listens for deep link returns
 * 5. Synchronizes payment status
 * 
 * This is a "process" because it coordinates between:
 * - Payment feature (checkout creation)
 * - Application feature (linking payments)
 * - External Maya system (app/web checkout)
 * - Navigation (deep links)
 */
export function useMayaPayment(): UseMayaPaymentReturn {
  // State management
  const [state, setState] = useState<MayaPaymentState>({
    isProcessing: false,
    paymentResult: null,
    currentPaymentId: null,
  });

  // Ref to prevent duplicate deep link handling
  const deepLinkCleanupRef = useRef<(() => void) | null>(null);

  // Convex integrations
  const createCheckout = useAction(api.payments.maya.checkout.createMayaCheckout);
  const syncStatus = useMutation(api.payments.maya.statusUpdates.syncPaymentStatus);
  const checkStatus = useQuery(
    api.payments.maya.statusUpdates.checkPaymentStatus,
    state.currentPaymentId ? { paymentId: state.currentPaymentId as Id<"payments"> } : "skip"
  );

  /**
   * Updates payment state
   */
  const updateState = useCallback((updates: Partial<MayaPaymentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handles deep link status updates
   */
  const handleDeepLinkStatus = useCallback((status: PaymentStatus) => {
    logPaymentEvent('Deep link status received', { status });
    trackDeepLinkEvent(status);
    
    updateState({ paymentResult: status });

    // Sync status with backend if we have a payment ID
    if (state.currentPaymentId && status !== 'processing') {
      syncStatus({ 
        paymentId: state.currentPaymentId as Id<"payments"> 
      }).catch(error => {
        console.error('Failed to sync payment status:', error);
      });
    }
  }, [state.currentPaymentId, syncStatus, updateState]);

  /**
   * Sets up deep link listeners
   */
  useEffect(() => {
    // Clean up previous listeners
    if (deepLinkCleanupRef.current) {
      deepLinkCleanupRef.current();
    }

    // Set up new listeners
    const cleanup = setupDeepLinkListeners(handleDeepLinkStatus);
    deepLinkCleanupRef.current = cleanup;

    // Cleanup on unmount
    return () => {
      if (deepLinkCleanupRef.current) {
        deepLinkCleanupRef.current();
        deepLinkCleanupRef.current = null;
      }
    };
  }, [handleDeepLinkStatus]);

  /**
   * Initiates Maya payment for an application
   */
  const initiatePayment = useCallback(async (
    applicationId: Id<"applications">,
    amount: number,
    serviceFee: number
  ): Promise<PaymentResult> => {
    try {
      // Validate amounts
      const amountValidation = validatePaymentAmount(amount);
      if (!amountValidation.isValid) {
        throw new Error(amountValidation.error);
      }

      const serviceFeeValidation = validatePaymentAmount(serviceFee);
      if (!serviceFeeValidation.isValid) {
        throw new Error(`Service fee: ${serviceFeeValidation.error}`);
      }

      updateState({ 
        isProcessing: true, 
        paymentResult: null 
      });

      const totalAmount = calculateTotalAmount(amount, serviceFee);
      logPaymentEvent('Initiating payment', { 
        applicationId, 
        amount, 
        serviceFee, 
        totalAmount 
      });

      // Create checkout session
      console.log('Creating Maya checkout session...');
      const { checkoutUrl, paymentId, existingPayment } = await createCheckout({
        applicationId,
        amount,
        serviceFee,
      });

      updateState({ currentPaymentId: paymentId });

      if (existingPayment) {
        logPaymentEvent('Using existing checkout session', { paymentId });
      }

      // Open Maya checkout
      const result = await openMayaCheckout(checkoutUrl, paymentId);
      
      if (result.waitingForReturn) {
        // Payment is being processed in Maya app
        updateState({ paymentResult: 'processing' });
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      
      logPaymentEvent('Payment error', { error: errorMessage });
      updateState({ paymentResult: 'failed' });
      
      return { 
        success: false, 
        reason: errorMessage
      };
    } finally {
      updateState({ isProcessing: false });
    }
  }, [createCheckout, updateState]);

  /**
   * Checks the current payment status
   */
  const checkPaymentStatus = useCallback(async (
    paymentId: Id<"payments">
  ): Promise<any> => {
    try {
      logPaymentEvent('Checking payment status', { paymentId });
      const result = await syncStatus({ paymentId });
      return result;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }, [syncStatus]);

  /**
   * Resets the payment state
   */
  const resetPayment = useCallback(() => {
    logPaymentEvent('Resetting payment state');
    updateState({
      paymentResult: null,
      currentPaymentId: null,
      isProcessing: false,
    });
  }, [updateState]);

  return {
    // State
    isProcessing: state.isProcessing,
    paymentResult: state.paymentResult,
    currentPaymentId: state.currentPaymentId,
    
    // Actions
    initiatePayment,
    checkPaymentStatus,
    resetPayment,
    
    // Current status from query
    currentStatus: checkStatus,
  };
}
