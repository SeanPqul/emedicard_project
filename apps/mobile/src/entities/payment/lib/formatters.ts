/**
 * Payment Formatters
 * 
 * Utility functions for formatting payment-related data
 */

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format amount to Philippine Peso
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date to readable format
 */
export function formatPaymentDate(timestamp: number): string {
  return format(timestamp, 'MMM d, yyyy');
}

/**
 * Format date with time
 */
export function formatPaymentDateTime(timestamp: number): string {
  return format(timestamp, 'MMM d, yyyy h:mm a');
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(timestamp, { addSuffix: true });
}

/**
 * Format payment method display name
 */
export function formatPaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    'Maya': 'Maya',
    'BaranggayHall': 'Barangay Hall',
    'CityHall': 'Sangunian Hall',
  };
  return methodMap[method] || method;
}

/**
 * Get payment method icon name
 */
export function getPaymentMethodIcon(method: string): string {
  const iconMap: Record<string, string> = {
    'Maya': 'card-outline',
    'BaranggayHall': 'business-outline',
    'CityHall': 'business-outline',
  };
  return iconMap[method] || 'cash-outline';
}
