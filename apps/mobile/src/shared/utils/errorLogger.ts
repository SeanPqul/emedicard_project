/**
 * Structured error logging utility
 * 
 * Usage:
 *   ErrorLogger.logRollbackFailure('application_deletion', error, { applicationId });
 *   ErrorLogger.logCritical('Payment processing failed', error, { userId, amount });
 * 
 * Future: Replace console.error with Sentry, LogRocket, or Crashlytics
 */

interface ErrorContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: 'error' | 'critical' | 'warning';
  category: string;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: ErrorContext;
}

// Input type for log() - timestamp is added automatically
type LogEntryInput = Omit<LogEntry, 'timestamp'>;

class ErrorLoggerService {
  /**
   * Logs a rollback failure (e.g., failed to cleanup application/storage)
   */
  logRollbackFailure(
    operation: 'application_deletion' | 'storage_deletion',
    error: unknown,
    context?: ErrorContext
  ): void {
    this.log({
      level: 'critical',
      category: 'rollback_failure',
      message: `Rollback failed: ${operation}`,
      error: this.serializeError(error),
      context: {
        ...context,
        operation,
      },
    });
  }

  /**
   * Logs a critical error (e.g., data corruption, payment failure)
   */
  logCritical(message: string, error: unknown, context?: ErrorContext): void {
    this.log({
      level: 'critical',
      category: 'critical_error',
      message,
      error: this.serializeError(error),
      context,
    });
  }

  /**
   * Logs a general error
   */
  logError(message: string, error: unknown, context?: ErrorContext): void {
    this.log({
      level: 'error',
      category: 'error',
      message,
      error: this.serializeError(error),
      context,
    });
  }

  /**
   * Logs a warning (non-critical issues)
   */
  logWarning(message: string, context?: ErrorContext): void {
    this.log({
      level: 'warning',
      category: 'warning',
      message,
      context,
    });
  }

  /**
   * Serializes error object for logging
   */
  private serializeError(error: unknown): LogEntry['error'] {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  /**
   * Core logging function
   * TODO: Replace console.error with Sentry/LogRocket/Crashlytics
   */
  private log(entry: LogEntryInput): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Console logging (development)
    const prefix = entry.level === 'critical' ? '🚨' : entry.level === 'error' ? '❌' : '⚠️';
    console.error(`${prefix} [${entry.level.toUpperCase()}] ${entry.message}`, {
      ...logEntry,
      _structured: true, // Flag for easy filtering
    });

    // TODO: Send to Sentry
    // if (Sentry) {
    //   Sentry.captureException(entry.error, {
    //     level: entry.level,
    //     tags: { category: entry.category },
    //     contexts: { custom: entry.context },
    //   });
    // }

    // TODO: Send to LogRocket
    // if (LogRocket) {
    //   LogRocket.error(entry.message, entry);
    // }

    // TODO: Send to Firebase Crashlytics
    // if (crashlytics()) {
    //   crashlytics().recordError(entry.error);
    // }
  }
}

export const ErrorLogger = new ErrorLoggerService();
