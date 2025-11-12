// src/utils/convexErrorHandler.ts

/**
 * Determines if an error is a Convex authentication error
 */
export const isConvexAuthError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorString = String(error).toLowerCase();
  
  return (
    errorMessage.includes('authentication failed') ||
    errorMessage.includes('unauthenticated') ||
    errorString.includes('authentication failed') ||
    errorString.includes('unauthenticated')
  );
};

/**
 * Checks if user is currently logging out
 * This helps prevent showing auth errors during the logout process
 */
export const isLoggingOut = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('isLoggingOut') === 'true';
};

/**
 * Sets the logging out state
 */
export const setLoggingOut = (value: boolean): void => {
  if (typeof window === 'undefined') return;
  if (value) {
    sessionStorage.setItem('isLoggingOut', 'true');
  } else {
    sessionStorage.removeItem('isLoggingOut');
  }
};

/**
 * Safely handles Convex query errors
 * Returns null for auth errors during logout to prevent error displays
 */
export const handleConvexError = (error: any): any => {
  if (isConvexAuthError(error)) {
    // If we're logging out, silently ignore auth errors
    if (isLoggingOut()) {
      console.debug('Ignoring auth error during logout');
      return null;
    }
    
    // Log the error for debugging but don't crash the app
    if (process.env.NODE_ENV === 'development') {
      console.error('Convex authentication error:', error);
    }
  }
  
  // For non-auth errors, log them
  console.error('Convex query error:', error);
  return null;
};
