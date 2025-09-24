// Activity entity types

export interface Activity {
  id: string;
  type: 'application' | 'payment' | 'orientation' | 'card_issued' | 'document_upload';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export type ActivityType = Activity['type'];
export type ActivityStatus = Activity['status'];
