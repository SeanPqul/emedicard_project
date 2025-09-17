/**
 * Maya Payment Hook
 * Handles Maya payment integration for React Native
 */

import { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import { Id } from '../../../backend/convex/_generated/dataModel';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  reason?: string;
}

export const usePaymentMaya = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | 'cancelled' | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);

  // Convex mutations and queries
  const createCheckout = useMutation(api.payments.maya.checkout.createMayaCheckout);
  const syncStatus = useMutation(api.payments.maya.statusUpdates.syncPaymentStatus);
  const checkStatus = useQuery(
    api.payments.maya.statusUpdates.checkPaymentStatus,
    currentPaymentId ? { paymentId: currentPaymentId as Id<"payments"> } : "skip"
  );

  /**
   * Initiates Maya payment for an application
   */
  const initiatePayment = async (
    applicationId: Id<"applications">,
    amount: number,
    serviceFee: number
  ): Promise<PaymentResult> => {
    try {
      setIsProcessing(true);
      setPaymentResult(null);

      // 1. Create checkout session with Maya
      console.log('Creating Maya checkout session...');
      const { checkoutUrl, paymentId, existingPayment } = await createCheckout({
        applicationId,
        amount,
        serviceFee,
      });

      setCurrentPaymentId(paymentId);

      // If there's an existing payment in progress, use it
      if (existingPayment) {
        console.log('Using existing checkout session');
      }

      // 2. Open Maya checkout in in-app browser
      console.log('Opening Maya checkout URL:', checkoutUrl);
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        showTitle: true,
        enableBarCollapsing: false,
        dismissButtonStyle: 'close',
        toolbarColor: '#00BFA6', // Maya brand color
      });

      // 3. Browser was closed, check payment status
      if (result.type === 'dismiss') {
        console.log('Browser dismissed, checking payment status...');
        
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Sync payment status with Maya
        if (currentPaymentId) {
          try {
            const syncResult = await syncStatus({ 
              paymentId: currentPaymentId as Id<"payments"> 
            });
            
            if (syncResult.status === 'Complete') {
              setPaymentResult('success');
              return { success: true, paymentId };
            } else if (syncResult.status === 'Failed') {
              setPaymentResult('failed');
              return { success: false, reason: 'Payment failed' };
            } else if (syncResult.status === 'Expired') {
              setPaymentResult('cancelled');
              return { success: false, reason: 'Payment expired' };
            }
          } catch (error) {
            console.error('Error syncing payment status:', error);
          }
        }
        
        // Default to cancelled if we can't determine status
        setPaymentResult('cancelled');
        return { success: false, reason: 'Payment cancelled' };
      }

      // Should not reach here
      return { success: false, reason: 'Unexpected browser result' };

    } catch (error) {
      console.error('Maya payment error:', error);
      setPaymentResult('failed');
      
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      return { 
        success: false, 
        reason: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle deep links from Maya redirect
   * This is for when Maya redirects back to the app
   */
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      if (url.includes('/payment/success')) {
        setPaymentResult('success');
      } else if (url.includes('/payment/failure')) {
        setPaymentResult('failed');
      } else if (url.includes('/payment/cancel')) {
        setPaymentResult('cancelled');
      }
    };

    // Set up deep linking listener
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Checks the current payment status
   */
  const checkPaymentStatus = async (paymentId: Id<"payments">) => {
    try {
      const result = await syncStatus({ paymentId });
      return result;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  };

  /**
   * Resets the payment state
   */
  const resetPayment = () => {
    setPaymentResult(null);
    setCurrentPaymentId(null);
    setIsProcessing(false);
  };

  return {
    // State
    isProcessing,
    paymentResult,
    currentPaymentId,
    
    // Actions
    initiatePayment,
    checkPaymentStatus,
    resetPayment,
    
    // Current status from query
    currentStatus: checkStatus,
  };
};
