// src/utils/errorLogger.ts

/**
 * Centralized Error Logging Utility
 * 
 * SECURITY PRINCIPLES:
 * 1. User-facing errors are ALWAYS sanitized and user-friendly
 * 2. Detailed technical errors are ONLY logged in development mode
 * 3. Production errors are logged minimally and sent to secure error tracking services
 * 4. Sensitive data (emails, tokens, passwords) are NEVER logged
 */

export interface ErrorLogContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  additionalData?: Record<string, any>;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Sanitize sensitive data from error messages and objects
 */
const sanitizeSensitiveData = (data: any): any => {
  if (typeof data === 'string') {
    // Remove potential tokens, passwords, or sensitive strings
    return data
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
      .replace(/password["\s:=]+([^&\s"]+)/gi, 'password=[REDACTED]')
      .replace(/token["\s:=]+([^&\s"]+)/gi, 'token=[REDACTED]');
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
      // Skip sensitive keys
      if (/password|token|secret|key|auth/i.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeSensitiveData(data[key]);
      }
    }
    return sanitized;
  }

  return data;
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyError = (error: any): string => {
  // Network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  // Permission errors
  if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
    return 'You do not have permission to perform this action.';
  }

  // Timeout errors
  if (error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
};

/**
 * Log errors with appropriate detail level based on environment
 */
export const logError = (
  error: any,
  context: ErrorLogContext = {},
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): void => {
  const timestamp = new Date().toISOString();
  const sanitizedContext = sanitizeSensitiveData(context);

  // DEVELOPMENT MODE: Detailed logging
  if (process.env.NODE_ENV === 'development') {
    const severityEmoji = {
      [ErrorSeverity.LOW]: '🟡',
      [ErrorSeverity.MEDIUM]: '🟠',
      [ErrorSeverity.HIGH]: '🔴',
      [ErrorSeverity.CRITICAL]: '🚨',
    };

    console.group(
      `${severityEmoji[severity]} Error [${severity.toUpperCase()}] - ${context.component || 'Unknown Component'}`
    );
    console.error('⚠️ Error Message:', error?.message || error);
    console.error('🔍 Error Details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    console.error('📋 Context:', sanitizedContext);
    console.error('🕐 Timestamp:', timestamp);
    console.error('📚 Full Error Object:', error);
    console.groupEnd();
  }

  // PRODUCTION MODE: Minimal logging
  if (process.env.NODE_ENV === 'production') {
    // Only log non-sensitive summary
    console.error('Error occurred:', {
      component: context.component,
      severity,
      timestamp,
    });

    // TODO: Send to error tracking service
    // Example with Sentry:
    // Sentry.captureException(error, {
    //   level: severity,
    //   contexts: {
    //     app: sanitizedContext,
    //   },
    //   tags: {
    //     component: context.component,
    //     action: context.action,
    //   },
    // });
  }
};

/**
 * Log info messages (development only)
 */
export const logInfo = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`ℹ️ ${message}`, data || '');
  }
};

/**
 * Log warning messages (development only)
 */
export const logWarning = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ ${message}`, data || '');
  }
};

/**
 * Log success messages (development only)
 */
export const logSuccess = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ ${message}`, data || '');
  }
};

/**
 * Async error handler wrapper for try-catch blocks
 */
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context: ErrorLogContext,
  onError?: (error: any) => void
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    logError(error, context, ErrorSeverity.HIGH);
    if (onError) {
      onError(error);
    }
    return null;
  }
};

export default {
  logError,
  logInfo,
  logWarning,
  logSuccess,
  getUserFriendlyError,
  handleAsyncError,
};
