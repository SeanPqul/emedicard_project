// Dashboard feature types - Uses entities from entities layer (FSD pattern)
import type { 
  DashboardStats, 
  Activity as RecentActivity,
  Alert,
  QuickAction 
} from '@entities/dashboard';
import type { Application } from '@entities/application';
import type { User as UserProfile } from '@entities/user';
import { Id } from '@backend/convex/_generated/dataModel';

// Type for the aggregated application data from backend dashboard
export interface DashboardApplication {
  _id: Id<"applications">;
  _creationTime: number;
  status: string;
  applicationType: "New" | "Renew";
  position: string;
  organization: string;
  jobCategory: {
    _id: Id<"jobCategories">;
    name: string;
    colorCode: string;
    requireOrientation: string | boolean | undefined;
  } | undefined;
  documentCount: number;
  hasPayment: boolean;
}

// Re-export entity types for backward compatibility
export type { 
  DashboardStats, 
  RecentActivity, 
  Alert, 
  QuickAction,
  Application,
  UserProfile 
};

// Dashboard-specific feature types
export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  alerts: Alert[];
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
  currentApplication: DashboardApplication | null;
}

export interface ApplicationStatusProps {
  currentApplication: DashboardApplication | null;
}

export interface StatsOverviewProps {
  dashboardStats: DashboardStats;
  currentApplication: DashboardApplication | null;
  showForNewUser: boolean;
}

export interface QuickActionsGridProps {
  userApplications: DashboardApplication[] | null;
  dashboardStats: DashboardStats;
  currentApplication: DashboardApplication | null;
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
