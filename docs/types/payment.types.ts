/**
 * Payment Service Type Definitions
 * This file contains all types related to the Payment service.
 */

// Payment Types
export type PaymentMethod = 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';
export type PaymentStatus = 'Pending' | 'Complete' | 'Failed' | 'Refunded' | 'Cancelled';

/**
 * Payment Interface
 * Represents a payment transaction for a health card application
 */
export interface Payment {
  _id: string;
  formId: string;
  amount: number;
  serviceFee: number;
  netAmount: number;
  method: PaymentMethod;
  referenceNumber: string;
  receiptId?: string; // Convex storage ID for receipt
  status: PaymentStatus;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Payment Create Data
 * Used when creating a new payment record
 */
export interface PaymentCreateData {
  formId: string;
  amount: number;
  serviceFee: number;
  netAmount: number;
  method: PaymentMethod;
  referenceNumber: string;
  receiptId?: string;
}

/**
 * Payment Update Data
 * Used when updating a payment record
 */
export interface PaymentUpdateData {
  status?: PaymentStatus;
  receiptId?: string;
  referenceNumber?: string;
}

/**
 * Payment Summary Interface
 * Used for displaying payment summaries
 */
export interface PaymentSummary {
  totalAmount: number;
  serviceFee: number;
  netAmount: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
}

/**
 * Payment Receipt Interface
 * Used for payment receipt data
 */
export interface PaymentReceipt {
  _id: string;
  paymentId: string;
  receiptNumber: string;
  receiptUrl: string;
  uploadedAt: number;
  verifiedAt?: number;
  verifiedBy?: string;
}

/**
 * Payment Service Interface
 * Defines methods for working with payments
 */
export interface PaymentService {
  createPayment(data: PaymentCreateData): Promise<Payment>;
  updatePayment(paymentId: string, data: PaymentUpdateData): Promise<Payment>;
  getPaymentById(paymentId: string): Promise<Payment | null>;
  getPaymentByFormId(formId: string): Promise<Payment | null>;
  getUserPayments(userId: string): Promise<Payment[]>;
  getPaymentSummary(userId: string): Promise<PaymentSummary>;
  uploadReceipt(paymentId: string, receipt: File): Promise<PaymentReceipt>;
}
