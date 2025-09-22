/**
 * Job Category Utilities
 * 
 * Helper functions for job category-specific operations
 */

import { theme } from '@shared/styles/theme';

export const getJobCategoryColor = (categoryName: string): string => {
  const lowerName = categoryName.toLowerCase();

  if (lowerName.includes('food')) return theme.colors.jobCategories.foodHandler;
  if (lowerName.includes('security')) return theme.colors.jobCategories.securityGuard;
  if (lowerName.includes('construction')) return theme.colors.jobCategories.others;
  if (lowerName.includes('health')) return theme.colors.jobCategories.pink;
  if (lowerName.includes('education')) return theme.colors.jobCategories.others;

  return theme.colors.jobCategories.others;
};

export const getJobCategoryIcon = (categoryName: string): string => {
  const lowerName = categoryName.toLowerCase();
  
  if (lowerName.includes('food')) return 'restaurant';
  if (lowerName.includes('security')) return 'shield-checkmark';
  if (lowerName.includes('construction')) return 'construct';
  if (lowerName.includes('health')) return 'medical';
  if (lowerName.includes('education')) return 'school';
  
  return 'briefcase';
};

export const getCardTypeLabel = (categoryName?: string): string => {
  if (!categoryName) return 'Health Card';
  
  const lowerName = categoryName.toLowerCase();
  
  if (lowerName.includes('food')) return 'Food Handler Card';
  if (lowerName.includes('security')) return 'Security Guard Card';
  if (lowerName.includes('construction')) return 'Construction Worker Card';
  if (lowerName.includes('health')) return 'Healthcare Worker Card';
  if (lowerName.includes('education')) return 'Education Worker Card';
  
  return 'Health Card';
};

export const getHealthCardTypeName = (categoryName?: string): string => {
  return getCardTypeLabel(categoryName);
};

export const getPaymentMethods = (jobCategory?: string): string[] => {
  // Default payment methods available for all categories
  return ['Gcash', 'Maya', 'BaranggayHall', 'CityHall'];
};
