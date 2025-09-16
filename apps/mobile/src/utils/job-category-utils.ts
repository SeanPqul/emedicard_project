import { getColor } from '../styles/theme';

export const getJobCategoryColor = (category: string): string => {
  const normalizedCategory = category?.toLowerCase().trim();
  switch (normalizedCategory) {
    case 'food handler':
    case 'food':
    case 'food service':
    case 'food safety':
      return getColor('jobCategories.foodHandler');
    case 'security guard':
    case 'security':
    case 'security officer':
      return getColor('jobCategories.securityGuard');
    case 'pink':
    case 'skin contact':
    case 'pink collar':
    case 'skin-to-skin contact':
      return getColor('jobCategories.pink');
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
  switch (normalizedCategory) {
    case 'food handler':
    case 'food':
    case 'food service':
    case 'food safety':
      return 'restaurant-outline';
    case 'security guard':
    case 'security':
    case 'security officer':
      return 'shield-outline';
    case 'pink':
    case 'skin contact':
    case 'pink collar':
    case 'skin-to-skin contact':
      return 'hand-left-outline';
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
