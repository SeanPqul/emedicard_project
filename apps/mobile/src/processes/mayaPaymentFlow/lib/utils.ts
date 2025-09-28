/**
 * Maya Payment Flow Utilities
 * 
 * Common utility functions for Maya payment processing
 */

import { Id } from '@backend/convex/_generated/dataModel';

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Calculate total amount including service fee
 */
export function calculateTotalAmount(amount: number, serviceFee: number): number {
  return amount + serviceFee;
}

/**
 * Get human-readable payment status message
 */
export function getPaymentStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: 'Payment is pending',
    processing: 'Payment is being processed',
    completed: 'Payment completed successfully',
    failed: 'Payment failed',
    cancelled: 'Payment was cancelled',
    expired: 'Payment session expired',
    refunded: 'Payment has been refunded',
  };
  
  return messages[status] || 'Unknown payment status';
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `PAY-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): {
  isValid: boolean;
  error?: string;
} {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      isValid: false,
      error: 'Amount must be a valid number',
    };
  }
  
  if (amount <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than zero',
    };
  }
  
  if (amount > 1000000) { // Max 1M pesos
    return {
      isValid: false,
      error: 'Amount exceeds maximum limit',
    };
  }
  
  // Check for valid decimal places (max 2)
  if (Math.round(amount * 100) / 100 !== amount) {
    return {
      isValid: false,
      error: 'Amount can have maximum 2 decimal places',
    };
  }
  
  return { isValid: true };
}

/**
 * Log payment-related events for debugging
 */
export function logPaymentEvent(event: string, data?: any): void {
  if (__DEV__) {
    console.log(`[MayaPayment] ${event}`, data ? data : '');
  }
}
