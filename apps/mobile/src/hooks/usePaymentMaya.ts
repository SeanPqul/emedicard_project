/**
 * Maya Payment Hook
 * Handles Maya payment integration for React Native
 */

import { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../../../backend/convex/_generated/api';
import { Id } from '../../../../backend/convex/_generated/dataModel';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  reason?: string;
  waitingForReturn?: boolean; // New field for app-to-app flow
}

/**
 * Try to open Maya checkout in Maya app using proper app-to-app patterns
 * Based on Maya documentation - supports universal links and app schemes
 */
async function tryOpenInMayaApp(checkoutUrl: string): Promise<boolean> {
  try {
    console.log('🔍 Attempting Maya app-to-app integration for:', checkoutUrl);

    // Maya app schemes based on official documentation
    const mayaAppSchemes = [
      'maya://', // Primary Maya app scheme
      'paymaya://', // Legacy PayMaya scheme (still supported)
    ];

    // First try: Check if Maya app is installed using app schemes
    let mayaAppDetected = false;
    for (const scheme of mayaAppSchemes) {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) {
        console.log(`✅ Maya app detected with scheme: ${scheme}`);
        mayaAppDetected = true;
        break;
      }
    }

    if (!mayaAppDetected) {
      console.log('❌ Maya app not installed - will use browser fallback');
      return false;
    }

    // Second try: Open checkout URL directly (Maya supports universal links)
    // Maya's checkout URLs are designed to work as universal links
    // If Maya app is installed, the universal link will open in Maya app
    // If not, it falls back to web browser automatically
    console.log('🚀 Opening Maya checkout via universal link');

    await Linking.openURL(checkoutUrl);

    // Wait a moment to see if Maya app actually opened
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Maya checkout opened successfully');
    return true;

  } catch (error) {
    console.error('❌ Error in Maya app-to-app flow:', error);
    console.log('📱 Falling back to browser integration');
    return false;
  }
}

/**
 * Handle browser result from WebBrowser (legacy flow)
 */
async function handleBrowserResult(
  result: WebBrowser.WebBrowserResult,
  paymentId: string
): Promise<PaymentResult> {
  // This is the old flow - kept for fallback compatibility
  if (result.type === 'dismiss') {
    console.log('Browser dismissed by user, assuming cancelled');
    return { success: false, reason: 'Payment cancelled', paymentId };
  }

  // For other result types, assume cancelled
  return { success: false, reason: 'Payment cancelled', paymentId };
}

export const usePaymentMaya = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | 'cancelled' | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);

  // Add deep link listener for Maya payment returns
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('🔗 Received deep link:', url);

      // Check if it's a payment return deep link
      if (url.includes('emedicardproject://payment/')) {
        console.log('💳 Maya payment return detected');

        // The deep link routes will handle the actual status verification
        // This is just for logging/analytics
        if (url.includes('/success')) {
          console.log('✅ Payment success deep link received');
        } else if (url.includes('/failed')) {
          console.log('❌ Payment failed deep link received');
        } else if (url.includes('/cancelled')) {
          console.log('💨 Payment cancelled deep link received');
        }
      }
    };

    // Add URL event listener
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened with a URL (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🚀 App opened with URL:', url);
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Convex actions, mutations and queries
  const createCheckout = useAction(api.payments.maya.checkout.createMayaCheckout);
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

      // 2. Try Maya app first, fallback to browser
      console.log('Opening Maya checkout URL:', checkoutUrl);
      const openedInMayaApp = await tryOpenInMayaApp(checkoutUrl);

      if (!openedInMayaApp) {
        // Fallback to in-app browser
        console.log('Maya app not available, using browser fallback');
        const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
          showTitle: true,
          enableBarCollapsing: false,
          dismissButtonStyle: 'close',
          toolbarColor: '#00BFA6', // Maya brand color
        });

        // Handle browser result (legacy flow)
        return handleBrowserResult(result, paymentId);
      } else {
        // Maya app opened - wait for deep link return
        console.log('Maya app opened, waiting for deep link return...');
        return { success: true, paymentId, waitingForReturn: true };
      }

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
