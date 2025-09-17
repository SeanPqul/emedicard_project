/**
 * Maya Payment Gateway Type Definitions
 * These interfaces define the structure of Maya API requests and responses
 */

// Payment amount structure
export interface MayaAmount {
  value: number;
  currency?: string; // Default: PHP
}

// Buyer information
export interface MayaBuyer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthday?: string;
  sex?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  shippingAddress?: MayaAddress;
  billingAddress?: MayaAddress;
}

// Address structure
export interface MayaAddress {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
}

// Item in checkout
export interface MayaItem {
  name: string;
  quantity: number;
  amount: MayaAmount;
  totalAmount?: MayaAmount;
  description?: string;
  sku?: string;
  code?: string;
}

// Redirect URLs for checkout
export interface MayaRedirectUrl {
  success: string;
  failure: string;
  cancel: string;
}

// Checkout request payload
export interface MayaCheckoutRequest {
  totalAmount: MayaAmount;
  buyer?: MayaBuyer;
  items?: MayaItem[];
  redirectUrl?: MayaRedirectUrl;
  requestReferenceNumber: string;
  metadata?: Record<string, any>;
}

// Checkout response from Maya
export interface MayaCheckoutResponse {
  checkoutId: string;
  redirectUrl: string;
  paymentId?: string;
  status?: string;
  createdAt?: string;
  expiresAt?: string;
}

// Payment status from webhook
export interface MayaWebhookPayload {
  id: string;
  isPaid: boolean;
  status: string;
  amount: number;
  currency: string;
  canVoid: boolean;
  canRefund: boolean;
  createdAt: string;
  updatedAt: string;
  requestReferenceNumber?: string;
  orgTransactionId?: string;
  paymentScheme?: string;
  expressCheckout?: boolean;
  refundedAmount?: number;
  capturedAmount?: number;
  paymentStatus?: 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'PAYMENT_EXPIRED' | 'PAYMENT_CANCELLED';
  failureReason?: string;
  paymentDetails?: {
    responses?: {
      efs?: {
        paymentTransactionReferenceNo?: string;
        financialNetworkTransactionReferenceNo?: string;
      };
      acquirer?: {
        transactionReferenceNumber?: string;
        merchantReferenceNumber?: string;
        paymentTransactionReferenceNumber?: string;
      };
    };
  };
}

// Payment status check response
export interface MayaPaymentStatus {
  id: string;
  status: string;
  amount: number;
  currency: string;
  isPaid: boolean;
  paymentScheme?: string;
  createdAt: string;
  updatedAt: string;
  requestReferenceNumber?: string;
  receiptNumber?: string;
  metadata?: Record<string, any>;
}

// Refund request
export interface MayaRefundRequest {
  totalAmount: MayaAmount;
  reason: string;
  requestReferenceNumber: string;
}

// Refund response
export interface MayaRefundResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  reason: string;
  requestReferenceNumber: string;
  createdAt: string;
  updatedAt: string;
}

// API error response
export interface MayaErrorResponse {
  error?: string;
  message?: string;
  code?: string;
  reference?: string;
  details?: any[];
}

// Configuration for Maya client
export interface MayaConfig {
  apiUrl: string;
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
}

// Payment event for logging
export interface PaymentEvent {
  type: 'checkout_created' | 'payment_success' | 'payment_failed' | 'payment_expired' | 'webhook_received' | 'refund_initiated';
  paymentId?: string;
  mayaPaymentId?: string;
  amount?: number;
  currency?: string;
  error?: string;
  metadata?: Record<string, any>;
}
