/**
 * Maya Payment Flow Types
 * Type definitions for Maya payment process
 */

import { Id } from '@backend/convex/_generated/dataModel';

/**
 * Result of a Maya payment attempt
 */
export interface PaymentResult {
  success?: boolean; // Optional because waitingForReturn can be set without success
  paymentId?: string;
  reason?: string;
  waitingForReturn?: boolean; // True when payment is handled by Maya app
}

/**
 * Maya checkout session creation response
 */
export interface CheckoutSessionResponse {
  checkoutUrl: string;
  paymentId: string;
  existingPayment?: boolean;
}

/**
 * Payment status types
 */
export type PaymentStatus = 'success' | 'failed' | 'cancelled' | 'processing' | null;

/**
 * Maya app schemes for deep linking
 */
export const MAYA_APP_SCHEMES = [
  'maya://',      // Primary Maya app scheme
  'paymaya://',   // Legacy PayMaya scheme (still supported)
] as const;

/**
 * Maya brand configuration
 */
export const MAYA_BRAND = {
  primaryColor: '#00BFA6',
  name: 'Maya',
} as const;

/**
 * Deep link paths for payment returns
 */
export const PAYMENT_DEEP_LINKS = {
  base: 'emedicardproject://payment/',
  success: 'emedicardproject://payment/success',
  failed: 'emedicardproject://payment/failed',
  cancelled: 'emedicardproject://payment/cancelled',
} as const;

/**
 * Browser configuration for Maya checkout
 */
export interface BrowserConfig {
  showTitle: boolean;
  enableBarCollapsing: boolean;
  dismissButtonStyle: 'close' | 'cancel' | 'done';
  toolbarColor: string;
}

/**
 * Maya payment hook state
 */
export interface MayaPaymentState {
  isProcessing: boolean;
  paymentResult: PaymentStatus;
  currentPaymentId: string | null;
}

/**
 * Maya payment hook return type
 */
export interface UseMayaPaymentReturn extends MayaPaymentState {
  // Actions
  initiatePayment: (
    applicationId: Id<"applications">,
    amount: number,
    serviceFee: number
  ) => Promise<PaymentResult>;
  checkPaymentStatus: (paymentId: Id<"payments">) => Promise<any>;
  resetPayment: () => void;
  
  // Current status from query
  currentStatus: any;
}
