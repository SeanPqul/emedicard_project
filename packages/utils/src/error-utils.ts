/**
 * Error Utility Functions
 * 
 * Platform-agnostic error handling utilities
 */

// ===== ERROR TYPES =====
export interface AppError {
  id: string;
  type: 'Authentication' | 'DataFetching' | 'FormSubmission' | 'Validation' | 'Network' | 'Unknown';
  message: string;
  title: string;
  isRetryable: boolean;
  originalError: any;
}

export interface ErrorContext {
  type?: AppError['type'];
  id?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  [key: string]: any;
}

// ===== ERROR UTILITIES =====

/**
 * Generates a unique error ID
 * @returns Unique error identifier
 */
export const generateErrorId = (): string => {
  return `err_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Checks if an error is a network error
 * @param error - Error object to check
 * @returns true if it's a network error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorName.includes('networkerror') ||
    error.code === 'NETWORK_ERROR' ||
    error.status === 0
  );
};

/**
 * Checks if an error is retryable
 * @param error - Error object to check
 * @returns true if the error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (isNetworkError(error)) return true;
  
  // Check for specific HTTP status codes that are retryable
  const status = error.status || error.statusCode;
  if (status) {
    return status >= 500 || status === 429; // Server errors and rate limiting
  }
  
  return false;
};

/**
 * Extracts a user-friendly error message
 * @param error - Error object
 * @param defaultMessage - Default message if none can be extracted
 * @returns User-friendly error message
 */
export const getUserFriendlyErrorMessage = (
  error: any, 
  defaultMessage: string = 'An unexpected error occurred'
): string => {
  if (!error) return defaultMessage;
  
  // Check for custom user messages
  if (error.userMessage) return error.userMessage;
  if (error.message && error.message.length < 200) return error.message;
  
  // Check for specific error types
  if (isNetworkError(error)) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (error.status === 401 || error.statusCode === 401) {
    return 'Authentication failed. Please sign in again.';
  }
  
  if (error.status === 403 || error.statusCode === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.status === 404 || error.statusCode === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.status === 429 || error.statusCode === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  return defaultMessage;
};

/**
 * Creates a standardized app error object
 * @param error - Original error
 * @param type - Error type
 * @param context - Additional context
 * @returns Standardized AppError object
 */
export const createAppError = (
  error: any, 
  type: AppError['type'] = 'Unknown',
  context: ErrorContext = {}
): AppError => {
  const id = context.id || generateErrorId();
  
  let title = 'An Unexpected Error Occurred';
  let message = 'Something went wrong. Please try again later.';
  let isRetryable = false;

  switch (type) {
    case 'Authentication':
      title = 'Authentication Failed';
      message = getUserFriendlyErrorMessage(error, 'Authentication failed. Please try again.');
      isRetryable = !error.code?.includes('RATE_LIMIT');
      break;
      
    case 'DataFetching':
      title = 'Data Loading Error';
      message = getUserFriendlyErrorMessage(error, 'Failed to load data. Please try again.');
      isRetryable = true;
      break;
      
    case 'FormSubmission':
      title = 'Submission Failed';
      message = getUserFriendlyErrorMessage(error, 'Your submission could not be processed. Please check your input and try again.');
      isRetryable = true;
      break;
      
    case 'Validation':
      title = 'Invalid Input';
      message = getUserFriendlyErrorMessage(error, 'Please check the form for errors.');
      isRetryable = false;
      break;
      
    case 'Network':
      title = 'Network Error';
      message = 'Could not connect to the server. Please check your internet connection and try again.';
      isRetryable = true;
      break;
      
    default:
      if (isNetworkError(error)) {
        type = 'Network';
        title = 'Network Error';
        message = 'Could not connect to the server. Please check your internet connection and try again.';
        isRetryable = true;
      } else {
        isRetryable = isRetryableError(error);
        message = getUserFriendlyErrorMessage(error, message);
      }
  }

  return {
    id,
    type,
    title,
    message,
    isRetryable,
    originalError: error
  };
};

/**
 * Logs an error with structured information
 * @param error - Error to log
 * @param context - Additional context
 */
export const logError = (error: any, context: ErrorContext = {}) => {
  const errorInfo = {
    id: context.id || generateErrorId(),
    timestamp: context.timestamp || new Date().toISOString(),
    type: context.type || 'Unknown',
    message: error?.message || 'No message available',
    ...context
  };

  // In a real implementation, you might want to send this to a logging service
  console.error('Error logged:', errorInfo);
  console.error('Original error:', error);
};

/**
 * Safe JSON stringify that handles circular references
 * @param obj - Object to stringify
 * @returns JSON string or error message
 */
export const safeStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return '[Unable to stringify object - possible circular reference]';
  }
};