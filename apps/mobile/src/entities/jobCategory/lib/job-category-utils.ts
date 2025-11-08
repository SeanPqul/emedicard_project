import { getColor } from '@shared/styles/theme';

export const getJobCategoryColor = (category: string): string => {
  const normalizedCategory = category?.toLowerCase().trim();
  
  // Check if category contains food-related keywords
  if (normalizedCategory?.includes('food')) {
    return getColor('jobCategories.foodHandler');
  }
  
  // Check for security-related keywords
  if (normalizedCategory?.includes('security') || normalizedCategory?.includes('guard')) {
    return getColor('jobCategories.securityGuard');
  }
  
  // Check for skin contact keywords
  if (normalizedCategory?.includes('pink') || 
      normalizedCategory?.includes('skin') || 
      normalizedCategory?.includes('contact')) {
    return getColor('jobCategories.pink');
  }
  
  switch (normalizedCategory) {
    case 'unknown category':
    case '':
    case undefined:
    case null:
      return getColor('border.medium'); // Neutral color for unknown
    default:
      return getColor('jobCategories.others');
  }
};

export const getJobCategoryIcon = (category: string): string => {
  const normalizedCategory = category?.toLowerCase().trim();
  
  // Check if category contains food-related keywords
  if (normalizedCategory?.includes('food')) {
    return 'restaurant-outline';
  }
  
  // Check for security-related keywords
  if (normalizedCategory?.includes('security') || normalizedCategory?.includes('guard')) {
    return 'shield-outline';
  }
  
  // Check for skin contact keywords
  if (normalizedCategory?.includes('pink') || 
      normalizedCategory?.includes('skin') || 
      normalizedCategory?.includes('contact')) {
    return 'hand-left-outline';
  }
  
  switch (normalizedCategory) {
    case 'unknown category':
    case '':
    case undefined:
    case null:
      return 'help-circle-outline';
    default:
      return 'briefcase-outline';
  }
};

export const getCardTypeLabel = (categoryName?: string): string => {
  if (!categoryName) return 'Health Card';
  
  switch (categoryName) {
    case 'Food Handler':
      return 'Yellow Card';
    case 'Non-Food Worker':
      return 'Green Card';
    case 'Skin-to-Skin Contact':
      return 'Pink Card';
    default:
      return categoryName;
  }
};
