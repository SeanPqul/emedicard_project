import { getColor } from '@shared/styles/theme';

export const getJobCategoryColor = (category: string): string => {
  const normalizedCategory = category?.toLowerCase().trim();
  
  // Check for non-food FIRST (before checking for 'food')
  if (normalizedCategory?.includes('non-food') || normalizedCategory?.includes('nonfood')) {
    return getColor('jobCategories.nonFoodWorker');
  }
  
  // Check for skin contact / pink card keywords BEFORE security
  if (normalizedCategory?.includes('skin') || 
      normalizedCategory?.includes('contact') ||
      normalizedCategory?.includes('pink')) {
    return getColor('jobCategories.pink');
  }
  
  // Check if category contains food-related keywords
  if (normalizedCategory?.includes('food')) {
    return getColor('jobCategories.foodHandler');
  }
  
  // Check for security-related keywords
  if (normalizedCategory?.includes('security') || normalizedCategory?.includes('guard')) {
    return getColor('jobCategories.securityGuard');
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
  
  // Check for non-food FIRST (before checking for 'food')
  if (normalizedCategory?.includes('non-food') || normalizedCategory?.includes('nonfood')) {
    return 'briefcase-outline';
  }
  
  // Check for skin contact / pink card keywords BEFORE security
  if (normalizedCategory?.includes('skin') || 
      normalizedCategory?.includes('contact') ||
      normalizedCategory?.includes('pink')) {
    return 'hand-left-outline';
  }
  
  // Check if category contains food-related keywords
  if (normalizedCategory?.includes('food')) {
    return 'restaurant-outline';
  }
  
  // Check for security-related keywords
  if (normalizedCategory?.includes('security') || normalizedCategory?.includes('guard')) {
    return 'shield-outline';
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
  
  const normalized = categoryName.toLowerCase().trim();
  
  // Check for non-food variations
  if (normalized.includes('non-food') || normalized.includes('nonfood')) {
    return 'Green Card';
  }
  
  // Check for pink card variations
  if (normalized.includes('skin') || normalized.includes('contact') || normalized.includes('pink')) {
    return 'Pink Card';
  }
  
  // Check for food handler
  if (normalized.includes('food')) {
    return 'Yellow Card';
  }
  
  // Fallback to exact matches for backward compatibility
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
