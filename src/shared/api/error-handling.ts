/**
 * Simple Error Handling Utilities
 */

// ===== BASIC ERROR TYPES =====

export interface SimpleError {
  message: string;
  code?: string;
  isRetryable?: boolean;
}

// ===== SIMPLE ERROR HANDLERS =====

export const errorHandlers = {
  // Handle common API errors
  handleApiError: (error: any): SimpleError => {
    if (error?.response?.status === 401) {
      return {
        message: 'Your session has expired. Please sign in again.',
        code: 'AUTH_FAILED',
        isRetryable: false,
      };
    }
    
    if (error?.response?.status === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        code: 'ACCESS_DENIED',
        isRetryable: false,
      };
    }
    
    if (error?.response?.status === 404) {
      return {
        message: 'The requested information could not be found.',
        code: 'NOT_FOUND',
        isRetryable: false,
      };
    }
    
    if (error?.response?.status >= 500) {
      return {
        message: 'Something went wrong on our end. Please try again later.',
        code: 'SERVER_ERROR',
        isRetryable: true,
      };
    }
    
    if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return {
        message: 'Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
        isRetryable: true,
      };
    }
    
    return {
      message: error?.message || 'Something went wrong. Please try again.',
      code: 'UNKNOWN_ERROR',
      isRetryable: true,
    };
  },

  // Show user-friendly error message
  showError: (error: SimpleError): void => {
    console.error('Error:', error.message);
    // In a real app, you'd show this in a toast or alert
  },
};