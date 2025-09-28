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
    if (!dashboardData.userApplications) return null;
    
    // The backend returns aggregated applications with different structure
    const app = dashboardData.userApplications.find((app: DashboardApplication) => 
      app.status === 'Submitted' || 
      app.status === 'Under Review' || 
      app.status === 'Approved'
    );
    
    return app || null;
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
