/**
 * Error types for rejection operations
 */
export interface RejectionError {
  code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
  message: string;
  details?: Record<string, unknown>;
}
