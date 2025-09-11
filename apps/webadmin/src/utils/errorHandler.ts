'use client';

import { logAuthError, getUserFriendlyErrorMessage as getAuthUserFriendlyErrorMessage, isNetworkError as isAuthNetworkError, isRateLimitError as isAuthRateLimitError } from './authErrorHandler';

// --- This is the simple, user-facing error object for your UI components ---
export interface AppError {
  id: string;
  type: 'Authentication' | 'DataFetching' | 'FormSubmission' | 'Validation' | 'Unknown';
  message: string;
  title: string;
  isRetryable: boolean;
  originalError: any;
}

/**
 * This is a private helper function for logging.
 * It prints a structured, detailed error message to the developer console.
 * @param error - The raw error object.
 * @param context - The context object containing ID, type, etc.
 */
function logDetailedError(error: any, context: Record<string, any>): void {
  // Extract detailed information from the raw error object
  const errorMessage = error instanceof Error ? error.message : 'No message available.';
  const errorType = error instanceof Error ? error.name : 'UnknownErrorType';
  const stackTrace = error instanceof Error ? error.stack : undefined;

  // Use a collapsed group to keep the console clean. The dev can expand it for details.
  console.groupCollapsed(
    `%c[Error Logged] %c${context.type || 'Unknown'}`,
    'color: red; font-weight: bold;',
    'color: gray; font-weight: normal;'
  );
  
  console.error(`Message: ${errorMessage}`);
  console.log(`Error ID: ${context.id}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Error Type: ${errorType}`);
  
  if (stackTrace) {
    console.log("Stack Trace:", stackTrace.trim());
  }
  
  console.log("Context:", context);
  console.log("Raw Error Object:", error);
  
  console.groupEnd();
}

/**
 * REVISED: This is now the master logging function.
 * It decides whether to use the specialized auth logger or our new detailed logger.
 * @param error - The raw error object.
 * @param context - The context object.
 */
export const logError = (error: any, context: Record<string, any> = {}) => {
  if (context.type === 'Authentication') {
    // For auth errors, we use the specialized logger from authErrorHandler.ts
    logAuthError(error, {
      email: 'N/A', // You can enhance this if you have the email available
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      ...context,
    });
  } else {
    // For all other application errors, use our new detailed logger.
    logDetailedError(error, context);
  }
};

/**
 * This is the main function your application will call from within a try...catch block.
 * It processes an error, logs it for developers, and returns a simple object for the UI.
 * (The logic inside this function remains the same as what you had, which is great).
 * @param error - The raw error caught.
 * @param type - The category of the error.
 * @returns A simple AppError object to be stored in state and shown to the user.
 */
export const createAppError = (error: any, type: AppError['type'] = 'Unknown'): AppError => {
  const id = `err_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
  let title = 'An Unexpected Error Occurred';
  let message = 'Something went wrong. Please try again later.';
  let isRetryable = false;

  if (type === 'Authentication') {
    title = 'Authentication Failed';
    message = getAuthUserFriendlyErrorMessage(error);
    isRetryable = !isAuthRateLimitError(error);
  } else if (isAuthNetworkError(error)) {
    type = 'DataFetching';
    title = 'Network Error';
    message = 'Could not connect to the server. Please check your internet connection and try again.';
    isRetryable = true;
  } else if (type === 'FormSubmission') {
    title = 'Submission Failed';
    message = 'Your submission could not be processed. Please check your input and try again.';
    isRetryable = true;
  } else if (type === 'Validation') {
    title = 'Invalid Input';
    message = error.message || 'Please check the form for errors.';
    isRetryable = false;
  }

  // Log the error for debugging using our revised logger
  logError(error, { type, id });

  return { id, type, title, message, isRetryable, originalError: error };
};
