/**
 * Notification Service Type Definitions
 * This file contains all types related to the Notification service.
 */

// Notification Types
export type NotificationType = 'MissingDoc' | 'PaymentReceived' | 'FormApproved' | 'OrientationScheduled' | 'CardIssue';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Notification Interface
 * Represents a notification sent to a user
 */
export interface Notification {
  _id: string;
  userId: string;
  formsId?: string;
  title?: string;
  message: string; // Note: keeping "messag" typo for backward compatibility in existing data
  type: NotificationType;
  priority?: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  createdAt?: number;
  readAt?: number;
}

/**
 * Notification Create Data
 * Used when creating a new notification
 */
export interface NotificationCreateData {
  userId: string;
  formsId?: string;
  title?: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
}

/**
 * Notification Update Data
 * Used when updating a notification
 */
export interface NotificationUpdateData {
  read?: boolean;
  readAt?: number;
}

/**
 * Notification Category
 * For filtering notifications in the UI
 */
export type NotificationCategory = 'All' | 'Unread' | 'Applications' | 'Payments' | 'Orientations' | 'Cards';

/**
 * Notification Summary Interface
 * Used for displaying notification counts and summaries
 */
export interface NotificationSummary {
  totalNotifications: number;
  unreadCount: number;
  applicationNotifications: number;
  paymentNotifications: number;
  orientationNotifications: number;
  cardNotifications: number;
}

/**
 * Notification Template Interface
 * Used for defining notification templates
 */
export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  messageTemplate: string;
  priority: NotificationPriority;
  actionUrl?: string;
}

/**
 * Bulk Notification Data
 * Used for sending notifications to multiple users
 */
export interface BulkNotificationData {
  userIds: string[];
  title?: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
}

/**
 * Push Notification Payload
 * Used for push notification data
 */
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: {
    notificationId: string;
    type: NotificationType;
    actionUrl?: string;
    formId?: string;
  };
}

/**
 * Notification Service Interface
 * Defines methods for working with notifications
 */
export interface NotificationService {
  createNotification(data: NotificationCreateData): Promise<Notification>;
  updateNotification(notificationId: string, data: NotificationUpdateData): Promise<Notification>;
  getNotificationById(notificationId: string): Promise<Notification | null>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  getNotificationSummary(userId: string): Promise<NotificationSummary>;
  sendBulkNotification(data: BulkNotificationData): Promise<Notification[]>;
  sendPushNotification(userId: string, payload: PushNotificationPayload): Promise<void>;
}
