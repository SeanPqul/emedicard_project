import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { withNetwork, retryAsync } from "../lib/network";

/**
 * Payments API Module
 * 
 * Feature-scoped API functions for payment operations.
 * Each function is small, focused, and uses Id types.
 */

export type PaymentMethod = 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';

/**
 * Get payment by form ID
 */
export async function getPaymentByFormId(formId: Id<'forms'>) {
  return convex.query(api.payments.getPaymentByFormId, { formId });
}

/**
 * Create a new payment
 */
export async function createPayment(input: {
  formId: Id<'forms'>;
  amount: number;
  serviceFee: number;
  netAmount: number;
  method: PaymentMethod;
  referenceNumber: string;
  receiptId?: Id<'_storage'>;
}) {
  return convex.mutation(api.payments.createPaymentMutation, input);
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(paymentId: Id<'payments'>, status: 'Pending' | 'Complete' | 'Failed') {
  return convex.mutation(api.payments.updatePaymentStatusMutation, { paymentId, status });
}

/**
 * Get all payments for the current user
 */
export async function getUserPayments() {
  return convex.query(api.payments.getUserPaymentsQuery, {});
}

/**
 * Network-resilient version of createPayment with retry logic
 * Example usage as specified in task requirements
 */
export async function safeCreatePayment(args: {
  formId: Id<'forms'>;
  amount: number;
  serviceFee: number;
  netAmount: number;
  method: PaymentMethod;
  referenceNumber: string;
  receiptId?: Id<'_storage'>;
}) {
  return withNetwork(() => retryAsync(() => createPayment(args), 2, 400));
}

