/**
 * Service Type Definitions Index
 * 
 * This file consolidates all service-specific type definitions for the new 
 * service architecture with full type safety. It provides a centralized 
 * import point for all types used across the eMediCard application services.
 * 
 * Services covered:
 * - User Service
 * - Application Service
 * - Payment Service  
 * - HealthCard Service
 * - Notification Service
 * - Orientation Service
 */

// Re-export all User types
export * from './user.types';
export type {
  User,
  UserRole,
  UserCreateData,
  UserUpdateData,
  UserService
} from './user.types';

// Re-export all Application types
export * from './application.types';
export type {
  Application,
  ApplicationType,
  ApplicationStatus,
  DocumentStatus,
  FormDocument,
  JobCategory,
  DocumentRequirement,
  JobCategoryRequirement,
  ApplicationCreateData,
  ApplicationUpdateData,
  FormSubmissionData,
  ApplicationService
} from './application.types';

// Re-export all Payment types
export * from './payment.types';
export type {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentCreateData,
  PaymentUpdateData,
  PaymentSummary,
  PaymentReceipt,
  PaymentService
} from './payment.types';

// Re-export all HealthCard types
export * from './healthcard.types';
export type {
  HealthCard,
  HealthCardStatus,
  HealthCardData,
  HealthCardCreateData,
  HealthCardUpdateData,
  VerificationLog,
  VerificationResult,
  HealthCardService
} from './healthcard.types';

// Re-export all Notification types
export * from './notification.types';
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  NotificationCreateData,
  NotificationUpdateData,
  NotificationSummary,
  NotificationTemplate,
  BulkNotificationData,
  PushNotificationPayload,
  NotificationService
} from './notification.types';

// Re-export all Orientation types
export * from './orientation.types';
export type {
  Orientation,
  OrientationStatus,
  OrientationCreateData,
  OrientationUpdateData,
  OrientationSchedule,
  OrientationAttendance,
  OrientationSummary,
  OrientationService
} from './orientation.types';

// Shared/Common Types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface TimestampFields {
  createdAt?: number;
  updatedAt?: number;
}

export interface AuditFields extends TimestampFields {
  createdBy?: string;
  updatedBy?: string;
}

// Service Registry Interface
export interface ServiceRegistry {
  userService: UserService;
  applicationService: ApplicationService;
  paymentService: PaymentService;
  healthCardService: HealthCardService;
  notificationService: NotificationService;
  orientationService: OrientationService;
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'date' | 'file' | 'number' | 'textarea';
  validation?: ValidationRule;
  placeholder?: string;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  hidden?: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormData {
  [key: string]: any;
}

// Dashboard types
export interface DashboardStats {
  activeApplications: number;
  pendingPayments: number;
  upcomingOrientations: number;
  validHealthCards: number;
  pendingAmount: number;
  nextOrientationDate?: string;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'payment' | 'orientation' | 'card_issued' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

// Deep linking types
export type DeepLinkType = 
  | 'application' 
  | 'health-card' 
  | 'orientation' 
  | 'payment' 
  | 'upload-documents'
  | 'notification';

export interface DeepLinkData {
  type: DeepLinkType;
  id?: string;
  formId?: string;
  params?: Record<string, string>;
}

// Error types
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export class ValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR';
  public readonly fields: FormErrors;
  
  constructor(message: string, fields: FormErrors) {
    super(message);
    this.fields = fields;
    this.name = 'ValidationError';
  }
}

export class ServiceError extends Error {
  public readonly code: string;
  public readonly details?: any;
  
  constructor(code: string, message: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ServiceError';
  }
}

// ID types for better type safety with Convex
export type ConvexId<T extends string = string> = string & { readonly __tableName: T };

// Utility types
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
