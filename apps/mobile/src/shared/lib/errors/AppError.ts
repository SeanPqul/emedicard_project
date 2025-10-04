/**
 * Application Error Types and Class
 * 
 * This implementation is required by the payment flow hooks
 */

export enum AppErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN = 'UNKNOWN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  public readonly type: AppErrorType;
  public readonly code?: string;
  public readonly details?: any;
  public readonly isRetryable: boolean;
  public readonly timestamp: number;

  constructor(
    type: AppErrorType,
    message: string,
    options: {
      code?: string;
      details?: any;
      isRetryable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = options.code;
    this.details = options.details;
    this.isRetryable = options.isRetryable ?? false;
    this.timestamp = Date.now();
  }

  static network(message: string = 'Network connection failed'): AppError {
    return new AppError(AppErrorType.NETWORK_ERROR, message, { isRetryable: true });
  }

  static validation(message: string, details?: any): AppError {
    return new AppError(AppErrorType.VALIDATION_ERROR, message, { details });
  }

  static authentication(message: string = 'Authentication failed'): AppError {
    return new AppError(AppErrorType.AUTHENTICATION_ERROR, message);
  }

  static authorization(message: string = 'Access denied'): AppError {
    return new AppError(AppErrorType.AUTHORIZATION_ERROR, message);
  }

  static server(message: string = 'Server error occurred', code?: string): AppError {
    return new AppError(AppErrorType.SERVER_ERROR, message, { code, isRetryable: true });
  }

  static payment(message: string, details?: any): AppError {
    return new AppError(AppErrorType.PAYMENT_ERROR, message, { details, isRetryable: true });
  }

  static upload(message: string, details?: any): AppError {
    return new AppError(AppErrorType.UPLOAD_ERROR, message, { details, isRetryable: true });
  }

  static cache(message: string): AppError {
    return new AppError(AppErrorType.CACHE_ERROR, message);
  }

  static unknown(message: string = 'An unexpected error occurred'): AppError {
    return new AppError(AppErrorType.UNKNOWN_ERROR, message);
  }

  static fromError(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error.name === 'ConvexError') {
      return this.server(error.message, error.code);
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return this.network(error.message);
    }

    if (error.status === 401 || error.message?.includes('auth')) {
      return this.authentication(error.message);
    }

    if (error.status === 403) {
      return this.authorization(error.message);
    }

    if (error.status >= 500) {
      return this.server(error.message, error.status?.toString());
    }

    return this.unknown(error.message || 'An unexpected error occurred');
  }
}
