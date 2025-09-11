import { JobCategory } from '../types/domain/application';

/**
 * Maps health card color codes to readable card type names
 */
export const getHealthCardTypeName = (category: JobCategory): string => {
  const colorMap: { [key: string]: string } = {
    '#FFD700': 'Yellow Card',
    '#FFFF00': 'Yellow Card', 
    '#008000': 'Green Card',
    '#00FF00': 'Green Card',
    '#FF69B4': 'Pink Card',
    '#FFC0CB': 'Pink Card',
  };
  
  return colorMap[category.colorCode] || `${category.name} Card`;
};

/**
 * Returns available payment methods for health card applications
 */
export const getPaymentMethods = (category: JobCategory) => {
  // All health card types use the same payment methods
  return [
    { method: 'GCash', description: 'Mobile payment via GCash' },
    { method: 'Maya', description: 'Mobile payment via Maya (PayMaya)' },
    { method: 'Barangay Hall', description: 'Pay at Barangay Hall (Cash/OR)' },
    { method: 'City Hall (Sangunian)', description: 'Pay at City Hall Sangunian Office (Cash/OR)' }
  ];
};