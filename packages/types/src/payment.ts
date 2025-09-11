/**
 * Payment Domain Types
 * 
 * Type definitions for payment entities and operations
 */

import { GenericId, BaseEntity, Timestamp } from './base';

// ===== PAYMENT STATUS TYPES =====
export type PaymentStatus = 'Pending' | 'Complete' | 'Failed';
export type PaymentMethod = 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';

// ===== PAYMENT ENTITY TYPES =====
export interface Payment extends BaseEntity {
  _id: GenericId<"payments">;
  formId: GenericId<"forms">;
  amount: number;
  serviceFee: number;
  netAmount: number;
  method: PaymentMethod;
  referenceNumber: string;
  receiptId?: GenericId<"_storage">;
  status: PaymentStatus;
  completedAt?: Timestamp;
  failedAt?: Timestamp;
  errorMessage?: string;
  transactionId?: string;
}

// ===== PAYMENT BREAKDOWN TYPES =====
export interface PaymentBreakdown {
  baseAmount: number;
  serviceFee: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  currency: 'PHP';
}

// ===== PAYMENT RECEIPT TYPES =====
export interface PaymentReceipt {
  id: string;
  paymentId: GenericId<"payments">;
  receiptNumber: string;
  issuedAt: Timestamp;
  payer: {
    name: string;
    email: string;
  };
  items: Array<{
    description: string;
    amount: number;
  }>;
  breakdown: PaymentBreakdown;
  method: PaymentMethod;
  referenceNumber: string;
  status: PaymentStatus;
}

// ===== PAYMENT OPERATION TYPES =====
export interface CreatePaymentInput {
  formId: GenericId<'forms'>;
  amount: number;
  serviceFee: number;
  netAmount: number;
  method: PaymentMethod;
  referenceNumber: string;
  receiptId?: GenericId<'_storage'>;
}

export interface UpdatePaymentStatusInput {
  paymentId: GenericId<'payments'>;
  status: PaymentStatus;
  transactionId?: string;
  errorMessage?: string;
}

export interface ProcessPaymentInput {
  method: PaymentMethod;
  amount: number;
  referenceNumber: string;
  receiptFile?: any; // File type varies by platform
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}

// ===== PAYMENT VALIDATION TYPES =====
export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedActions?: string[];
}

// ===== PAYMENT FLOW TYPES =====
export interface PaymentFlowStep {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  order: number;
  estimatedTime?: number;
}

export interface PaymentFlow {
  id: string;
  method: PaymentMethod;
  steps: PaymentFlowStep[];
  currentStep: number;
  isCompleted: boolean;
  totalEstimatedTime: number;
}

// ===== PAYMENT HISTORY TYPES =====
export interface PaymentHistoryItem {
  id: string;
  paymentId: GenericId<"payments">;
  action: 'created' | 'updated' | 'completed' | 'failed' | 'refunded';
  description: string;
  timestamp: Timestamp;
  actor?: {
    id: string;
    name: string;
    role: string;
  };
  metadata?: Record<string, any>;
}