/**
 * Convex Error Parser Utility
 * 
 * Extracts clean, user-friendly error messages from Convex error responses
 * which often include technical metadata like request IDs and stack traces.
 */

/**
 * Extracts clean error message from Convex error
 * 
 * Convex errors typically have this format:
 * "[CONVEX M(function.name)] [Request ID: xxx] Server Error Uncaught Error: ACTUAL_MESSAGE Called by client"
 * 
 * This function extracts just the "ACTUAL_MESSAGE" part.
 * 
 * @param error - The error object from Convex mutation/query
 * @returns Clean, user-friendly error message
 */
export function extractConvexErrorMessage(error: any): string {
  if (!error) {
    return 'An unexpected error occurred';
  }

  let errorMessage = '';

  // If it's already a string, use it
  if (typeof error === 'string') {
    errorMessage = error;
  } 
  // If it has a message property, use that
  else if (error.message) {
    errorMessage = error.message;
  }
  // If it has a data property with message (Convex format)
  else if (error.data?.message) {
    errorMessage = error.data.message;
  }
  // Fallback
  else {
    return 'An unexpected error occurred';
  }

  // Extract clean message from Convex error format
  // Pattern: "... Uncaught Error: ACTUAL_MESSAGE Called by client"
  const uncaughtErrorMatch = errorMessage.match(/Uncaught Error:\s*(.+?)(?:\s+Called by|$)/i);
  if (uncaughtErrorMatch && uncaughtErrorMatch[1]) {
    return uncaughtErrorMatch[1].trim();
  }

  // Pattern: "... Error: ACTUAL_MESSAGE ..."
  const errorMatch = errorMessage.match(/Error:\s*(.+?)(?:\s+at\s+|$)/i);
  if (errorMatch && errorMatch[1]) {
    return errorMatch[1].trim();
  }

  // Remove Convex metadata if present
  // Pattern: "[CONVEX ...] [Request ID: ...] ACTUAL_MESSAGE"
  const cleanedMessage = errorMessage
    .replace(/\[CONVEX\s+[^\]]+\]/gi, '')
    .replace(/\[Request ID:\s+[^\]]+\]/gi, '')
    .replace(/Server Error/gi, '')
    .replace(/Called by client/gi, '')
    .trim();

  if (cleanedMessage) {
    return cleanedMessage;
  }

  // If all else fails, return the original message
  return errorMessage;
}

/**
 * Get user-friendly error title based on error type
 */
export function getErrorTitle(error: any): string {
  const message = extractConvexErrorMessage(error).toLowerCase();

  if (message.includes('unauthorized') || message.includes('authentication')) {
    return 'Authentication Required';
  }
  
  if (message.includes('permission') || message.includes('access denied')) {
    return 'Access Denied';
  }
  
  if (message.includes('not found')) {
    return 'Not Found';
  }
  
  if (message.includes('already') || message.includes('duplicate')) {
    return 'Already Exists';
  }
  
  if (message.includes('invalid') || message.includes('validation')) {
    return 'Invalid Input';
  }
  
  if (message.includes('cancel')) {
    return 'Cancellation Failed';
  }
  
  if (message.includes('check in') || message.includes('check-in')) {
    return 'Check-In Failed';
  }
  
  if (message.includes('check out') || message.includes('check-out')) {
    return 'Check-Out Failed';
  }
  
  return 'Operation Failed';
}
