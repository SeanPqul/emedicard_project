// useDashboardData hook - Dashboard-specific data management
import { useMemo } from 'react';
import { useOptimizedDashboard } from '@/src/hooks/useOptimizedDashboard';
import { Application } from '../types';

export function useDashboardData() {
  const dashboardData = useOptimizedDashboard();

  // Derive computed values with proper memoization
  const currentApplication = useMemo(() => {
    if (!dashboardData.userApplications) return null;
    
    return dashboardData.userApplications.find((app: Application) => 
      app.status === 'Submitted' || 
      app.status === 'Under Review' || 
      app.status === 'Approved'
    ) || null;
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
