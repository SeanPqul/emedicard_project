// Dashboard feature types
import { Id } from 'convex/values';

// Dashboard stats matching backend response
export interface DashboardStats {
  activeApplications: number;
  pendingPayments: number;
  pendingAmount: number;
  validHealthCards: number;
  unreadNotifications?: number;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'payment' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
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

// Additional types for dashboard feature
export interface Application {
  _id: string;
  status: string;
  applicationType: string;
  position?: string;
  organization?: string;
  jobCategory?: {
    _id: string;
    name: string;
    colorCode?: string;
    requireOrientation?: boolean;
  };
  documentCount?: number;
  hasPayment?: boolean;
  orientationCompleted?: boolean;
  _creationTime?: number;
}

export interface UserProfile {
  _id: string;
  email: string;
  fullname?: string;
  username?: string;
  profilePicture?: string;
  role?: string;
}

// Component Props interfaces
export interface DashboardHeaderProps {
  userProfile: UserProfile | null;
  greeting: string;
  currentTime: Date;
  unreadNotificationsCount: number;
}

export interface WelcomeBannerProps {
  isNewUser: boolean;
}

export interface PriorityAlertsProps {
  dashboardStats: DashboardStats;
  currentApplication: Application | null;
}

export interface ApplicationStatusProps {
  currentApplication: Application | null;
}

export interface StatsOverviewProps {
  dashboardStats: DashboardStats;
  currentApplication: Application | null;
  showForNewUser: boolean;
}

export interface QuickActionsGridProps {
  userApplications: Application[] | null;
  dashboardStats: DashboardStats;
  currentApplication: Application | null;
}

export interface RecentActivityListProps {
  recentActivities: RecentActivity[];
}

export interface HealthCardStatusProps {
  dashboardStats: DashboardStats;
}

export interface OfflineBannerProps {
  isOnline: boolean;
}
