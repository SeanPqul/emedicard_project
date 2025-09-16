/**
 * Domain Types Index
 * 
 * Central export point for all domain-related type definitions
 */

// User domain types
export type {
  UserRole,
  User,
  UserProfile,
  UserPreferences,
  UserAuth,
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
} from './user';

// Application domain types
export type {
  ApplicationStatus,
  ApplicationType,
  CivilStatus,
  Application,
  ApplicationForm,
  JobCategory,
  DocumentRequirement,
  CreateApplicationInput,
  UpdateApplicationInput,
  SubmitApplicationInput,
  ApplicationValidationResult,
  ApplicationWorkflowStep,
  ApplicationWorkflow,
} from './application';

// Payment domain types
export type {
  PaymentStatus,
  PaymentMethod,
  Payment,
  PaymentBreakdown,
  PaymentReceipt,
  CreatePaymentInput,
  UpdatePaymentStatusInput,
  ProcessPaymentInput,
  PaymentValidationResult,
  PaymentFlowStep,
  PaymentFlow,
  PaymentHistoryItem,
} from './payment';

// Health card domain types
export type {
  HealthCardStatus,
  HealthCard,
  HealthCardData,
  HealthCardVerification,
  VerificationResult,
  IssueHealthCardInput,
  UpdateHealthCardInput,
  CreateVerificationLogInput,
  HealthCardTemplate,
  HealthCardRenewal,
  HealthCardAnalytics,
} from './health-card';

// Notification domain types
export interface Notification {
  _id: Id<"notifications">;
  userId: Id<"users">;
  applicationId?: Id<"applications">;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt?: number;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'MissingDoc' 
  | 'PaymentReceived' 
  | 'FormApproved' 
  | 'OrientationScheduled' 
  | 'CardIssue'
  | 'ApplicationSubmitted'
  | 'DocumentApproved'
  | 'DocumentRejected'
  | 'PaymentConfirmed'
  | 'SystemMaintenance';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// Orientation domain types
export interface Orientation {
  _id: Id<"orientations">;
  userId: Id<"users">;
  jobCategoryId: Id<"jobCategories">;
  scheduledAt: number;
  location: string;
  instructor?: Id<"users">;
  status: OrientationStatus;
  checkInTime?: number;
  checkOutTime?: number;
  completedAt?: number;
  notes?: string;
  materials?: string[];
  attendanceMarked?: boolean;
}

export type OrientationStatus = 
  | 'Scheduled' 
  | 'InProgress' 
  | 'Completed' 
  | 'Cancelled' 
  | 'NoShow';

// Import the Id type
import type { Id } from '../../../../../backend/convex/_generated/dataModel';