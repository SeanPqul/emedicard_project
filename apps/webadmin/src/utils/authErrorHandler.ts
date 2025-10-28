// src/utils/authErrorHandler.ts

export interface AuthError {
  code?: string;
  message?: string;
  longMessage?: string;
  meta?: any;
}

export interface ErrorContext {
  email?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

/**
 * Maps Clerk error codes to user-friendly messages
 * This keeps sensitive error details away from users while providing helpful guidance
 */
export const getUserFriendlyErrorMessage = (error: any): string => {
  // Handle Clerk errors structure
  const clerkError = error?.errors?.[0];
  const errorCode = clerkError?.code || error?.code;
  const errorMessage = clerkError?.message || error?.message;

  // Map specific error codes to user-friendly messages
  switch (errorCode) {
    case 'form_identifier_not_found':
    case 'form_password_incorrect':
    case 'account_not_found':
      return 'Invalid email or password. Please check your credentials and try again.';
    
    case 'form_identifier_exists':
      return 'An account with this email already exists.';
    
    case 'too_many_requests':
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    
    case 'network_error':
      return 'Network connection error. Please check your internet connection.';
    
    case 'session_exists':
      return 'You are already signed in.';
      
    case 'password_not_strong_enough':
      return 'Password is not strong enough. Please use a stronger password.';
    
    default:
      // For unknown errors, provide a generic message
      if (errorMessage?.toLowerCase().includes('password')) {
        return 'Invalid email or password. Please try again.';
      }
      if (errorMessage?.toLowerCase().includes('network')) {
        return 'Connection error. Please check your internet and try again.';
      }
      return 'Login failed. Please try again or contact support if the problem persists.';
  }
};

/**
 * Logs detailed error information to console for developers
 * This provides comprehensive debugging information without exposing it to users
 */
export const logAuthError = (error: any, context: ErrorContext): void => {
  // Create error context for debugging
  const errorDetails = {
    // Clerk-specific error information
    clerkErrors: error?.errors || [],
    errorCode: error?.errors?.[0]?.code || error?.code,
    errorMessage: error?.errors?.[0]?.message || error?.message,
    longMessage: error?.errors?.[0]?.longMessage || error?.longMessage,
    
    // Additional error information
    stack: error?.stack,
    name: error?.name,
    
    // Request context
    context,
    
    // Browser information
    browserInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
    },
    
    // Network information (if available)
    connection: (navigator as any)?.connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
    } : null,
  };

  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    // Structured console logging for developers
    console.group(' Authentication Error - Developer Debug Info');
    console.error(' Error Summary:', {
      code: errorDetails.errorCode,
      message: errorDetails.errorMessage,
      timestamp: context.timestamp,
    });
    console.error('🔍 Detailed Error:', errorDetails);
    console.error('👤 User Context:', {
      email: context.email,
      url: context.url,
      timestamp: context.timestamp,
    });
    console.error('🌐 Browser Info:', errorDetails.browserInfo);
    if (errorDetails.connection) {
      console.error('📡 Network Info:', errorDetails.connection);
    }
    console.error('📚 Full Error Object:', error);
    console.groupEnd();

    // Also log a simplified version for quick debugging
    console.error(`Auth Error [${errorDetails.errorCode}]: ${errorDetails.errorMessage}`);
  }
  
  // TODO: In production, send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { contexts: { auth: errorDetails } });
  // }
};

/**
 * Determines if an error is a network-related issue
 */
export const isNetworkError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.errors?.[0]?.code || error?.code;
  
  return (
    errorCode === 'network_error' ||
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    error?.name === 'NetworkError'
  );
};

/**
 * Determines if an error is related to rate limiting
 */
export const isRateLimitError = (error: any): boolean => {
  const errorCode = error?.errors?.[0]?.code || error?.code;
  return errorCode === 'too_many_requests' || errorCode === 'rate_limit_exceeded';
};
