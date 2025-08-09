export enum AppErrorType {
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  SERVER_ERROR = 'SERVER_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONVEX_ERROR = 'CONVEX_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
  public type: AppErrorType;
  public originalError?: Error;
  
  constructor(
    type: AppErrorType, 
    message: string, 
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(): string {
    switch (this.type) {
      case AppErrorType.NETWORK_OFFLINE:
        return 'No internet connection. Please check your network and try again.';
      case AppErrorType.NETWORK_TIMEOUT:
        return 'Request timed out. Please try again.';
      case AppErrorType.NETWORK_ERROR:
        return 'Network error occurred. Please check your connection.';
      case AppErrorType.AUTH_UNAUTHORIZED:
        return 'Please sign in to continue.';
      case AppErrorType.AUTH_EXPIRED:
        return 'Your session has expired. Please sign in again.';
      case AppErrorType.VALIDATION_FAILED:
        return this.message || 'Please check your input and try again.';
      case AppErrorType.SERVER_ERROR:
        return 'Server is temporarily unavailable. Please try again later.';
      case AppErrorType.PERMISSION_DENIED:
        return 'You do not have permission to perform this action.';
      case AppErrorType.RESOURCE_NOT_FOUND:
        return 'The requested item was not found.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      userMessage: this.getUserFriendlyMessage(),
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack,
      } : undefined,
    };
  }
}

/**
 * Convert unknown errors to AppError instances
 */
export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('offline') || message.includes('network unavailable')) {
      return new AppError(AppErrorType.NETWORK_OFFLINE, error.message, error);
    }
    
    if (message.includes('timeout') || message.includes('aborted')) {
      return new AppError(AppErrorType.NETWORK_TIMEOUT, error.message, error);
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return new AppError(AppErrorType.AUTH_UNAUTHORIZED, error.message, error);
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return new AppError(AppErrorType.PERMISSION_DENIED, error.message, error);
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return new AppError(AppErrorType.RESOURCE_NOT_FOUND, error.message, error);
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return new AppError(AppErrorType.VALIDATION_FAILED, error.message, error);
    }
    
    if (message.includes('server') || message.includes('500')) {
      return new AppError(AppErrorType.SERVER_ERROR, error.message, error);
    }
    
    // Default to network error for other Error instances
    return new AppError(AppErrorType.NETWORK_ERROR, error.message, error);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new AppError(AppErrorType.UNKNOWN, error);
  }

  // Handle any other type
  return new AppError(AppErrorType.UNKNOWN, 'An unknown error occurred');
};

/**
 * Check if error is of specific type
 */
export const isErrorType = (error: unknown, type: AppErrorType): boolean => {
  return error instanceof AppError && error.type === type;
};

/**
 * Legacy compatibility - map old error codes to new types
 */
export class LegacyAppError extends AppError {
  code: "OFFLINE" | "TIMEOUT" | "NETWORK" | "SERVER" | "VALIDATION" | "UNKNOWN";
  
  constructor(message: string, code: "OFFLINE" | "TIMEOUT" | "NETWORK" | "SERVER" | "VALIDATION" | "UNKNOWN" = "UNKNOWN") {
    const typeMap = {
      'OFFLINE': AppErrorType.NETWORK_OFFLINE,
      'TIMEOUT': AppErrorType.NETWORK_TIMEOUT,
      'NETWORK': AppErrorType.NETWORK_ERROR,
      'SERVER': AppErrorType.SERVER_ERROR,
      'VALIDATION': AppErrorType.VALIDATION_FAILED,
      'UNKNOWN': AppErrorType.UNKNOWN,
    };
    
    super(typeMap[code], message);
    this.code = code;
  }
}
