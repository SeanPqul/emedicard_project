// Dashboard entity types

export interface DashboardStats {
  activeApplications: number;
  pendingPayments: number;
  pendingAmount: number;
  validHealthCards: number;
  unreadNotifications: number;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  status: ActivityStatus;
  metadata?: ActivityMetadata;
  entityId?: string;
  entityType?: EntityType;
}

export type ActivityType = 
  | 'application_submitted'
  | 'application_approved'
  | 'application_rejected'
  | 'payment_made'
  | 'payment_verified'
  | 'document_uploaded'
  | 'health_card_issued'
  | 'notification_sent';

export type ActivityStatus = 'success' | 'pending' | 'error' | 'info';

export type EntityType = 'application' | 'payment' | 'document' | 'health_card' | 'notification';

export interface ActivityMetadata {
  applicationId?: string;
  paymentId?: string;
  documentId?: string;
  amount?: number;
  paymentMethod?: string;
  documentName?: string;
  [key: string]: any;
}

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
  dismissible: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export type AlertType = 'info' | 'warning' | 'error' | 'success';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  enabled: boolean;
  badge?: number;
  requiredRole?: string[];
  sortOrder: number;
}
