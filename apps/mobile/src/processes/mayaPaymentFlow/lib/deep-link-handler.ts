/**
 * Deep Link Handler for Maya Payments
 * 
 * Handles deep link returns from Maya payment flow
 */

import { Linking } from 'react-native';
import { router } from 'expo-router';
import { PaymentStatus } from '../model/types';

/**
 * Sets up deep link listeners for Maya payment returns
 * 
 * @param onStatus - Callback when payment status is determined from deep link
 * @returns Cleanup function to remove listeners
 */
export function setupDeepLinkListeners(
  onStatus: (status: PaymentStatus) => void
): () => void {
  console.log('[DeepLink] Setting up Maya payment deep link listeners');

  const handleDeepLink = (url: string) => {
    console.log('[DeepLink] Received deep link:', url);

    try {
      // Parse the deep link manually
      let path = '';
      let queryParams: Record<string, string | undefined> = {};

      try {
        const parsedUrl = new URL(url);
        path = parsedUrl.pathname || parsedUrl.hostname;
        queryParams = Object.fromEntries(parsedUrl.searchParams.entries());
      } catch (e) {
        console.error('[DeepLink] Failed to parse URL:', e);
      }

      console.log('[DeepLink] Parsed path:', path);
      console.log('[DeepLink] Query params:', queryParams);

      // Check if this is a payment-related deep link
      if (path?.includes('payment')) {
        if (path.includes('success')) {
          console.log('[DeepLink] Payment success detected');
          onStatus('success');
          
          // Navigate to success screen with params
          const params = new URLSearchParams();
          if (queryParams?.paymentId) params.append('paymentId', queryParams.paymentId as string);
          if (queryParams?.applicationId) params.append('applicationId', queryParams.applicationId as string);
          
          router.push(`/(screens)/(shared)/payment/success?${params.toString()}`);
        } else if (path.includes('failed')) {
          console.log('[DeepLink] Payment failure detected');
          onStatus('failed');
          
          // Navigate to failed screen with params
          const params = new URLSearchParams();
          if (queryParams?.paymentId) params.append('paymentId', queryParams.paymentId as string);
          if (queryParams?.applicationId) params.append('applicationId', queryParams.applicationId as string);
          if (queryParams?.reason) params.append('reason', queryParams.reason as string);
          
          router.push(`/(screens)/(shared)/payment/failed?${params.toString()}`);
        } else if (path.includes('cancelled')) {
          console.log('[DeepLink] Payment cancellation detected');
          onStatus('cancelled');
          
          // Navigate to cancelled screen with params
          const params = new URLSearchParams();
          if (queryParams?.paymentId) params.append('paymentId', queryParams.paymentId as string);
          if (queryParams?.applicationId) params.append('applicationId', queryParams.applicationId as string);
          
          router.push(`/(screens)/(shared)/payment/cancelled?${params.toString()}`);
        }
      }
    } catch (error) {
      console.error('[DeepLink] Error handling deep link:', error);
    }
  };

  // Handle initial deep link if app was opened with one
  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log('[DeepLink] Initial URL detected:', url);
      handleDeepLink(url);
    }
  }).catch((error) => {
    console.error('[DeepLink] Error getting initial URL:', error);
  });

  // Subscribe to deep link events
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  // Return cleanup function
  return () => {
    console.log('[DeepLink] Removing Maya payment deep link listeners');
    subscription?.remove();
  };
}

/**
 * Track deep link event for analytics or logging
 * 
 * @param status - The payment status from the deep link
 */
export function trackDeepLinkEvent(status: PaymentStatus): void {
  console.log('[DeepLink] Tracking payment status event:', status);
  
  // Add analytics tracking here if needed
  // For now, just log the event
  const timestamp = new Date().toISOString();
  console.log(`[DeepLink] Payment ${status} at ${timestamp}`);
}
