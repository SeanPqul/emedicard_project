/**
 * Payment Methods Configuration
 * Defines available payment methods for health card processing
 */

export interface PaymentMethodConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  fee: number;
  serviceFee?: number;
}

export interface UploadedReceipt {
  uri: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Available payment methods with fees and configurations
 */
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { 
    id: 'Gcash', 
    name: 'GCash', 
    description: 'Pay with GCash mobile wallet', 
    icon: 'wallet', 
    fee: 50, 
    serviceFee: 5 
  },
  {
    id: 'Maya',
    name: 'Maya',
    description: 'Pay with Maya checkout (₱60 total)',
    icon: 'card',
    fee: 50,
    serviceFee: 10
  },
  { 
    id: 'BaranggayHall', 
    name: 'Barangay Hall', 
    description: 'Pay at the Barangay Hall', 
    icon: 'home', 
    fee: 50 
  },
  { 
    id: 'CityHall', 
    name: 'City Hall', 
    description: 'Pay at the City Hall', 
    icon: 'business', 
    fee: 50 
  },
];

/**
 * Payment method types for validation
 */
export const DIGITAL_PAYMENT_METHODS = ['Gcash', 'Maya'] as const;
export const MANUAL_PAYMENT_METHODS = ['BaranggayHall', 'CityHall'] as const;

export type DigitalPaymentMethod = typeof DIGITAL_PAYMENT_METHODS[number];
export type ManualPaymentMethod = typeof MANUAL_PAYMENT_METHODS[number];
export type PaymentMethodId = DigitalPaymentMethod | ManualPaymentMethod;