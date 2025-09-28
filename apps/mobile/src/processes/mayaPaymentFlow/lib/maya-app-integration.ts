/**
 * Maya App Integration
 * 
 * Handles opening Maya checkout in the Maya app or web browser
 */

import { Linking } from 'react-native';
import { Id } from '@backend/convex/_generated/dataModel';
import { PaymentResult } from '../model/types';

/**
 * Opens Maya checkout URL
 * 
 * Attempts to open the Maya app if available, otherwise falls back to browser
 */
export async function openMayaCheckout(
  checkoutUrl: string,
  paymentId: Id<'payments'>
): Promise<{ waitingForReturn: boolean } | PaymentResult> {
  try {
    console.log('[MayaApp] Opening checkout URL:', checkoutUrl);
    console.log('[MayaApp] Payment ID:', paymentId);
    
    // Check if the URL can be opened
    const canOpen = await Linking.canOpenURL(checkoutUrl);
    
    if (!canOpen) {
      console.error('[MayaApp] Cannot open URL:', checkoutUrl);
      return {
        success: false,
        reason: 'Unable to open checkout URL',
      };
    }
    
    // Open the checkout URL (Maya app or browser)
    await Linking.openURL(checkoutUrl);
    console.log('[MayaApp] Checkout URL opened successfully');
    
    // Return indication that we're waiting for the user to return
    return {
      waitingForReturn: true,
    };
    
  } catch (error) {
    console.error('[MayaApp] Error opening checkout:', error);
    
    return {
      success: false,
      reason: error instanceof Error ? error.message : 'Failed to open Maya checkout',
    };
  }
}
