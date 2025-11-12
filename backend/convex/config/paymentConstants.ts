/**
 * Payment Configuration Constants
 * 
 * Centralized payment amounts and fees to ensure consistency
 * across the entire application (web, mobile, backend)
 */

/**
 * Base health card application fee
 */
export const BASE_FEE = 50;

/**
 * Service fees by payment method
 */
export const SERVICE_FEES = {
  Maya: 10,
  BaranggayHall: 10,  // Payment center processing fee
  CityHall: 10,       // Payment center processing fee
} as const;

/**
 * Payment method type
 */
export type PaymentMethod = keyof typeof SERVICE_FEES;

/**
 * Calculate total amount including service fee
 */
export function calculateTotal(paymentMethod: PaymentMethod): number {
  const serviceFee = SERVICE_FEES[paymentMethod] || 0;
  return BASE_FEE + serviceFee;
}

/**
 * Get service fee for a payment method
 */
export function getServiceFee(paymentMethod: PaymentMethod): number {
  return SERVICE_FEES[paymentMethod] || 0;
}
