/**
 * Maya Payment Flow Model
 * Business logic and types for Maya payment process
 */

// Export hook
export { useMayaPayment } from './hooks';

// Export types
export type {
  PaymentResult,
  CheckoutSessionResponse,
  PaymentStatus,
  BrowserConfig,
  MayaPaymentState,
  UseMayaPaymentReturn,
} from './types';

// Export constants
export {
  MAYA_APP_SCHEMES,
  MAYA_BRAND,
  PAYMENT_DEEP_LINKS,
} from './types';
