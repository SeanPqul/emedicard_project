// Dashboard feature types
import { Id } from 'convex/values';

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  validHealthCards: number;
  expiredHealthCards: number;
  documentsToReview: number;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'payment' | 'document' | 'health_card';
  title: string;
  description: string;
  timestamp: number;
  status: string;
  metadata?: Record<string, any>;
}

export interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  enabled: boolean;
  badge?: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
}
