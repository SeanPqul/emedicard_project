// Notification feature types - Extends entity types (FSD pattern)
import type { 
  Notification as BaseNotification,
  NotificationType as BaseNotificationType,
  NotificationPriority,
  NotificationPreferences as BaseNotificationPreferences,
  CreateNotificationInput,
  UpdateNotificationInput
} from '@entities/notification';

// Re-export base types
export type { 
  BaseNotification as Notification,
  BaseNotificationType as NotificationType,
  NotificationPriority,
  CreateNotificationInput,
  UpdateNotificationInput
};

// Feature-specific notification types (if needed for UI/components)
export type NotificationStatus = 'read' | 'unread';

// Feature-specific display categories
export type NotificationCategory = 
  | 'application_update' 
  | 'payment_reminder' 
  | 'document_required' 
  | 'appointment' 
  | 'general';

// Extended notification for UI display
export interface NotificationDisplay extends BaseNotification {
  title?: string; // Add title for display
  status?: NotificationStatus;
  category?: NotificationCategory;
  relatedEntity?: {
    type: 'application' | 'payment' | 'health_card';
    id: string;
  };
}

// Extended preferences for UI settings
export interface NotificationPreferencesUI extends BaseNotificationPreferences {
  notificationCategories?: {
    applicationUpdates: boolean;
    paymentReminders: boolean;
    documentRequests: boolean;
    appointments: boolean;
  };
}
