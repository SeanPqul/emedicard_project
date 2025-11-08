// useDashboardData hook - Dashboard-specific data management
import { useMemo } from 'react';
import { useOptimizedDashboard } from './useOptimizedDashboard';
import { Application } from '@features/dashboard/types';
import { Id } from '@backend/convex/_generated/dataModel';

// Type for the aggregated application data from backend
interface DashboardApplication {
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

export function useDashboardData() {
  const dashboardData = useOptimizedDashboard();

  // Derive computed values with proper memoization
  const currentApplication = useMemo(() => {
    const apps = dashboardData.userApplications as DashboardApplication[] | undefined;
    if (!apps || apps.length === 0) return null;

    // Priority order: show applications being actively processed first
    const statusPriority: Record<string, number> = {
      // NEW - Phase 4 Migration: Action-required statuses get high priority
      'Referred for Medical Management': 1, // Medical referral - needs doctor visit
      'Documents Need Revision': 2,         // Document issues - needs resubmission
      'Under Review': 3,        // Actively being reviewed
      'For Orientation': 4,     // Ready for orientation
      'For Payment Validation': 5, // Payment being validated
      'Submitted': 6,           // Just submitted
      'Approved': 7,            // Completed
      'Pending Payment': 8,     // Waiting for user payment
      'Rejected': 9,            // DEPRECATED - Lowest priority
    };

    return apps.reduce((best, app) => {
      if (!best) return app as any;
      
      const bestPriority = statusPriority[best.status] || 999;
      const appPriority = statusPriority[app.status] || 999;
      
      // If same priority, show most recent
      if (appPriority === bestPriority) {
        return (app._creationTime || 0) > (best._creationTime || 0) ? app : best;
      }
      
      // Otherwise show higher priority (lower number)
      return appPriority < bestPriority ? app : best;
    }) as DashboardApplication;
  }, [dashboardData.userApplications]);

  const isNewUser = useMemo(() => {
    const hasNoApplications = !dashboardData.userApplications || dashboardData.userApplications.length === 0;
    const hasNoHealthCards = dashboardData.dashboardStats.validHealthCards === 0;
    return hasNoApplications && hasNoHealthCards;
  }, [dashboardData.userApplications, dashboardData.dashboardStats.validHealthCards]);

  // Ensure all data is properly typed and available
  return {
    ...dashboardData,
    currentApplication,
    isNewUser,
    // Provide defaults for undefined values
    userApplications: dashboardData.userApplications || [],
    recentActivities: dashboardData.recentActivities || [],
  };
}

// Re-export the refresh action type
export type RefreshAction = () => Promise<void>;
