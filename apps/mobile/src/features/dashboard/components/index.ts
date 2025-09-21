// Dashboard components barrel export
export * from './DashboardHeader';

// Re-export existing components temporarily
// TODO: Migrate these to feature-based structure
export { 
  WelcomeBanner,
  PriorityAlerts,
  ApplicationStatus,
  StatsOverview,
  QuickActionsGrid,
  RecentActivityList,
  HealthCardStatus
} from '@/src/components/dashboard';

// OfflineBanner is now in shared
export { OfflineBanner } from '@/shared/components';
