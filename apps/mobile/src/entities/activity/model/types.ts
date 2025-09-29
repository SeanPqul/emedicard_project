// Activity entity types - Re-exports from dashboard for backward compatibility
// Note: Activity is primarily a dashboard concept in this app
import type { 
  Activity as DashboardActivity,
  ActivityType as DashboardActivityType,
  ActivityStatus as DashboardActivityStatus,
  ActivityMetadata,
  EntityType
} from '@entities/dashboard';

// Re-export for backward compatibility
export type Activity = DashboardActivity;
export type ActivityType = DashboardActivityType;
export type ActivityStatus = DashboardActivityStatus;
export type { ActivityMetadata, EntityType };
