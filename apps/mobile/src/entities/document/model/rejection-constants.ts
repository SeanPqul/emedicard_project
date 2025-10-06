import { RejectionCategory, RejectionCategoryLabels } from './rejection-types';

/**
 * Get the display label for a rejection category
 */
export function getRejectionCategoryLabel(category: RejectionCategory): string {
  return RejectionCategoryLabels[category] || 'Unknown';
}
