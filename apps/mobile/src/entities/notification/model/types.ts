// Notification entity types
import type { Id } from '@backend/convex/_generated/dataModel';

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
  | 'PaymentConfirmed'
  | 'SystemMaintenance'
  | 'DocumentReferredMedical' // Medical finding requiring consultation
  | 'DocumentIssueFlagged' // Non-medical document issue
  | 'MedicalReferralResubmission' // After doctor consultation
  | 'DocumentResubmission'; // After fixing document issues

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface CreateNotificationInput {
  userId: Id<"users">;
  applicationId?: Id<"applications">;
  type: NotificationType;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationInput {
  read?: boolean;
}

// Frontend-specific notification types
export type NotificationCategory = 'All' | 'Unread' | 'Applications' | 'Payments' | 'Orientations';

// Mapped notification type for frontend consumption
export interface NotificationItem {
  _id: Id<'notifications'>;
  _creationTime: number;
  applicationId?: Id<'applications'>;
  title?: string;
  actionUrl?: string;
  userId: Id<'users'>;
  message: string;
  type: string;
  read: boolean;
}
