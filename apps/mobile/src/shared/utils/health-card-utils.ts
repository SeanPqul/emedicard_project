import { PaymentMethod } from '@entities/payment/model/types';

/**
 * Get the display name for a health card type
 */
export function getHealthCardTypeName(cardType: string): string {
  const typeMap: Record<string, string> = {
    'basic': 'Basic Health Card',
    'standard': 'Standard Health Card',
    'premium': 'Premium Health Card',
    'gold': 'Gold Health Card',
    'platinum': 'Platinum Health Card',
    'family': 'Family Health Card',
    'senior': 'Senior Health Card',
    'corporate': 'Corporate Health Card',
    'student': 'Student Health Card',
  };

  return typeMap[cardType.toLowerCase()] || cardType;
}

/**
 * Payment method option for UI display
 */
export interface PaymentMethodOption {
  method: string;
  description: string;
  icon?: string;
  enabled?: boolean;
}

/**
 * Get available payment methods for a specific job category
 */
export function getPaymentMethods(jobCategory?: string): PaymentMethodOption[] {
  // Default payment methods available for all categories
  const defaultMethods: PaymentMethodOption[] = [
    {
      method: 'GCash',
      description: 'Pay using GCash mobile wallet',
      icon: 'wallet',
      enabled: true,
    },
    {
      method: 'Maya (PayMaya)',
      description: 'Pay using Maya mobile wallet',
      icon: 'wallet-outline',
      enabled: true,
    },
    {
      method: 'Barangay Hall',
      description: 'Pay at your local Barangay Hall',
      icon: 'business',
      enabled: true,
    },
    {
      method: 'City Hall',
      description: 'Pay at the City Hall',
      icon: 'business-outline',
      enabled: true,
    },
  ];

  // Special handling for certain job categories
  if (jobCategory?.toLowerCase().includes('food')) {
    // Food handlers might have specific payment requirements
    return defaultMethods.filter(method => 
      ['GCash', 'Maya (PayMaya)', 'Barangay Hall'].some(name => method.method.includes(name))
    );
  }

  if (jobCategory?.toLowerCase().includes('corporate')) {
    // Corporate employees might prefer certain payment methods
    return defaultMethods.filter(method => 
      ['GCash', 'City Hall'].some(name => method.method.includes(name))
    );
  }

  return defaultMethods;
}

/**
 * Calculate health card expiry date based on issue date and card type
 */
export function calculateExpiryDate(issueDate: Date, cardType: string): Date {
  const expiryDate = new Date(issueDate);
  
  switch (cardType.toLowerCase()) {
    case 'basic':
    case 'standard':
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year validity
      break;
    case 'premium':
    case 'gold':
      expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years validity
      break;
    case 'platinum':
    case 'corporate':
      expiryDate.setFullYear(expiryDate.getFullYear() + 3); // 3 years validity
      break;
    default:
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Default 1 year
  }
  
  return expiryDate;
}

/**
 * Format health card number for display
 */
export function formatCardNumber(cardNumber: string): string {
  // Format as XXXX-XXXX-XXXX-XXXX
  const cleaned = cardNumber.replace(/\D/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join('-');
}

/**
 * Validate health card number
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.length >= 12 && cleaned.length <= 16;
}

/**
 * Get health card category based on job category
 */
export function getHealthCardCategory(jobCategory: string): string {
  const categoryMap: Record<string, string> = {
    'food-handler': 'Food Safety Certificate',
    'healthcare': 'Healthcare Professional Card',
    'construction': 'Construction Safety Card',
    'driver': 'Driver Health Certificate',
    'office': 'General Health Card',
    'student': 'Student Health Card',
    'senior': 'Senior Citizen Health Card',
  };

  const key = jobCategory.toLowerCase().replace(/\s+/g, '-');
  return categoryMap[key] || 'General Health Card';
}
