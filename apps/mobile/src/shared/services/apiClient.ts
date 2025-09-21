/**
 * API Client Service
 * 
 * Centralized API client for all network requests with error handling,
 * retry logic, and consistent response formatting
 */

import { ConvexReactClient } from 'convex/react';
import { Id } from '../../../../../backend/convex/_generated/dataModel';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

export class ApiClient {
  private static instance: ApiClient;
  private convexClient: ConvexReactClient | null = null;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Initialize the Convex client
   */
  initialize(convexClient: ConvexReactClient) {
    this.convexClient = convexClient;
  }

  /**
   * Execute a Convex query with error handling
   */
  async query<T>(
    queryFunction: any,
    args?: any
  ): Promise<ApiResponse<T>> {
    try {
      if (!this.convexClient) {
        throw new Error('API Client not initialized');
      }

      const result = await this.convexClient.query(queryFunction, args);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('API Query Error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Execute a Convex mutation with error handling
   */
  async mutation<T>(
    mutationFunction: any,
    args?: any
  ): Promise<ApiResponse<T>> {
    try {
      if (!this.convexClient) {
        throw new Error('API Client not initialized');
      }

      const result = await this.convexClient.mutation(mutationFunction, args);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('API Mutation Error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Execute a Convex action with error handling
   */
  async action<T>(
    actionFunction: any,
    args?: any
  ): Promise<ApiResponse<T>> {
    try {
      if (!this.convexClient) {
        throw new Error('API Client not initialized');
      }

      const result = await this.convexClient.action(actionFunction, args);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('API Action Error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any): ApiResponse {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Handle specific Convex error types
    if (error?.code) {
      errorCode = error.code;
    }

    // Handle network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Network connection error. Please check your internet connection.';
    }

    // Handle authentication errors
    if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
      errorCode = 'AUTH_ERROR';
      errorMessage = 'Authentication required. Please sign in again.';
    }

    // Handle validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      errorCode = 'VALIDATION_ERROR';
    }

    return {
      success: false,
      error: errorCode,
      message: errorMessage,
    };
  }

  /**
   * Retry a function with exponential backoff
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Retry attempt ${attempt}/${maxRetries} failed:`, error);
      }
    }
    
    throw lastError!;
  }

  /**
   * Check if the client is properly initialized
   */
  isInitialized(): boolean {
    return this.convexClient !== null;
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();
export default apiClient;
