// Dashboard components barrel export
export * from './ApplicationStatus';
export * from './DashboardHeader';
export * from './HealthCardStatus';
export * from './PriorityAlerts';
export * from './QuickActionsGrid';
export * from './RecentActivityList';
export * from './StatsOverview';
export * from './WelcomeBanner';
export { StatCard } from './StatCard';
export { ActivityItem } from './ActivityItem';

// Enhanced components
export { DashboardHeaderEnhanced } from './DashboardHeader/DashboardHeader.enhanced';
export { HealthCardPreview } from './HealthCardPreview/HealthCardPreview';
export { StatCardEnhanced, PresetStatCards } from './StatCard/StatCard.enhanced';
export { QuickActionsCarousel } from './QuickActionsCarousel/QuickActionsCarousel';
export { ActionCenter } from './ActionCenter/ActionCenter';

// OfflineBanner is now in shared
export { OfflineBanner } from '@shared/components';
