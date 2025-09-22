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
  | 'DocumentRejected'
  | 'PaymentConfirmed'
  | 'SystemMaintenance';

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
