/**
 * Payment Configuration Constants
 * Centralized payment amounts and fees for the eMediCard system
 */

export const PAYMENT_CONFIG = {
  HEALTH_CARD: {
    BASE_AMOUNT: 50, // Base health card processing fee
    SERVICE_FEE: 10,  // Service fee for digital processing
    get TOTAL() { return this.BASE_AMOUNT + this.SERVICE_FEE; } // ₱60 total
  },
  CURRENCY: 'PHP',
  CHECKOUT_EXPIRY_MINUTES: 60,
} as const;

export const MAYA_CONFIG = {
  CHECKOUT_ONLY: true, // Enforce checkout-only, no card tokenization
  PAYMENT_METHODS: ['checkout'], // Only allow checkout method
  REDIRECT_URLS: {
    SUCCESS: '/payment/success',
    FAILURE: '/payment/failure',
    CANCEL: '/payment/cancel',
  },
} as const;

export type PaymentAmount = {
  baseAmount: number;
  serviceFee: number;
  totalAmount: number;
  currency: string;
};

export function createPaymentAmount(): PaymentAmount {
  return {
    baseAmount: PAYMENT_CONFIG.HEALTH_CARD.BASE_AMOUNT,
    serviceFee: PAYMENT_CONFIG.HEALTH_CARD.SERVICE_FEE,
    totalAmount: PAYMENT_CONFIG.HEALTH_CARD.TOTAL,
    currency: PAYMENT_CONFIG.CURRENCY,
  };
}