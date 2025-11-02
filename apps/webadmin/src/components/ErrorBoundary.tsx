'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch and handle errors in React components
 * Particularly useful for Convex query failures and unexpected errors
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // DEVELOPMENT MODE: Detailed logging for developers
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 ErrorBoundary - Component Error Detected');
      console.error('⚠️ Error:', error);
      console.error('📍 Component Stack:', errorInfo.componentStack);
      console.error('🔍 Error Details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      console.groupEnd();
    }
    
    // PRODUCTION MODE: Log minimal, non-sensitive information
    if (process.env.NODE_ENV === 'production') {
      // Log minimal error info to console (safe for production)
      console.error('Application error occurred:', {
        errorName: error.name,
        timestamp: new Date().toISOString(),
      });
      
      // TODO: Send to error tracking service (e.g., Sentry, LogRocket, DataDog)
      // Example:
      // Sentry.captureException(error, { 
      //   contexts: { react: errorInfo },
      //   tags: {
      //     errorType: 'react_error_boundary',
      //     componentStack: errorInfo.componentStack?.split('\n')[1] || 'unknown'
      //   }
      // });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer font-semibold text-sm text-gray-700">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
