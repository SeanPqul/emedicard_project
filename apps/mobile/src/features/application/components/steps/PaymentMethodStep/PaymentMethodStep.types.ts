/**
 * PaymentMethodStep Types
 * 
 * Type definitions for the payment method selection step component
 */

export type PaymentMethod = 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall' | '';

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  requiresReference: boolean;
  bgColor: string;
  iconColor: string;
}

export interface PaymentBreakdown {
  applicationFee: number;
  processingFee: number;
  total: number;
  currency: string;
}

export interface ApplicationFormData {
  applicationType: 'New' | 'Renew';
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
}

export interface PaymentMethodStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
}
