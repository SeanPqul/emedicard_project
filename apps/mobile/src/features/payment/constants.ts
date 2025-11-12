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
    id: 'Maya',
    name: 'Maya',
    description: 'Pay with Maya checkout',
    icon: 'card',
    fee: 50,
    serviceFee: 10
  },
  { 
    id: 'BaranggayHall', 
    name: 'Barangay Hall', 
    description: 'Pay at any barangay hall in Davao City', 
    icon: 'home', 
    fee: 50,
    serviceFee: 10
  },
  { 
    id: 'CityHall', 
    name: 'Sangunian Hall', 
    description: 'Pay at the city Sangunian hall', 
    icon: 'business', 
    fee: 50,
    serviceFee: 10
  },
];

/**
 * Payment method types for validation
 */
export const DIGITAL_PAYMENT_METHODS = ['Maya'] as const;
export const MANUAL_PAYMENT_METHODS = ['BaranggayHall', 'CityHall'] as const;

export type DigitalPaymentMethod = typeof DIGITAL_PAYMENT_METHODS[number];
export type ManualPaymentMethod = typeof MANUAL_PAYMENT_METHODS[number];
export type PaymentMethodId = DigitalPaymentMethod | ManualPaymentMethod;
