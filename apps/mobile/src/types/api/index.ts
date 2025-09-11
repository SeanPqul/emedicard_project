/**
 * API Types
 * 
 * Type definitions for API responses, requests, and service layer
 */

// ===== GENERIC API RESPONSE TYPES =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== API ERROR TYPES =====
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  path?: string;
  statusCode?: number;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  details: {
    field: string;
    message: string;
    value?: any;
  }[];
}

// ===== SERVICE LAYER TYPES =====
export interface ServiceResult<T> {
  data?: T;
  error?: string;
  isLoading?: boolean;
}

export interface MutationState {
  isLoading: boolean;
  error?: string;
}

export interface QueryState<T> {
  data?: T;
  isLoading: boolean;
  error?: string;
}

export interface ServiceOperations {
  create?: (...args: any[]) => Promise<any>;
  update?: (...args: any[]) => Promise<any>;
  delete?: (...args: any[]) => Promise<any>;
  getById?: (id: string) => Promise<any>;
  getAll?: () => Promise<any[]>;
}

// ===== CONVEX SPECIFIC TYPES =====
export type ConvexId<T extends string> = string & { readonly __tableName: T };

// ===== HTTP CLIENT TYPES =====
export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  retryAttempts: number;
  retryDelay: number;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// ===== CACHE TYPES =====
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  strategy: 'lru' | 'fifo' | 'lfu';
}

export interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

// ===== WEBHOOK TYPES =====
export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: number;
  source: string;
  signature: string;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  retryAttempts: number;
  timeout: number;
}

// ===== UPLOAD TYPES =====
export interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadUrl: string;
  headers?: Record<string, string>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  estimatedTime: number; // milliseconds
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  url?: string;
  error?: string;
  metadata?: {
    size: number;
    mimeType: string;
    filename: string;
    uploadedAt: number;
  };
}