// Notification feature types

export type NotificationType = 
  | 'application_update' 
  | 'payment_reminder' 
  | 'document_required' 
  | 'appointment' 
  | 'general';

export type NotificationStatus = 'read' | 'unread';

export interface Notification {
  _id: string;
  _creationTime: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  read: boolean;
  relatedEntity?: {
    type: 'application' | 'payment' | 'health_card';
    id: string;
  };
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: {
    applicationUpdates: boolean;
    paymentReminders: boolean;
    documentRequests: boolean;
    appointments: boolean;
  };
}
