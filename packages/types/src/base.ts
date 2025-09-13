/**
 * Base Types
 * 
 * Generic base types that can be used across different platforms
 */

// ===== GENERIC ID TYPES =====
export type GenericId<TableName extends string = string> = string & { __tableName: TableName };

// ===== TIMESTAMP TYPES =====
export type Timestamp = number;

// ===== BASE ENTITY TYPES =====
export interface BaseEntity {
  _id: GenericId;
  _creationTime?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ===== COMMON STATUS TYPES =====
export type StatusType = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

// ===== PAGINATION TYPES =====
export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}