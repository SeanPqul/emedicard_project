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

// Additional types for dashboard feature
export interface Application {
  _id: string;
  status: string;
  applicationType: string;
  position?: string;
  organization?: string;
  jobCategory?: any;
  documentCount?: number;
  hasPayment?: boolean;
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
  dashboardStats: any;
  currentApplication: Application | null;
}

export interface ApplicationStatusProps {
  currentApplication: Application | null;
}

export interface StatsOverviewProps {
  dashboardStats: any;
  currentApplication: Application | null;
  showForNewUser: boolean;
}

export interface QuickActionsGridProps {
  userApplications: Application[] | null;
  dashboardStats: any;
  currentApplication: Application | null;
}

export interface RecentActivityListProps {
  recentActivities: any[];
}

export interface HealthCardStatusProps {
  dashboardStats: any;
}

export interface OfflineBannerProps {
  isOnline: boolean;
}
