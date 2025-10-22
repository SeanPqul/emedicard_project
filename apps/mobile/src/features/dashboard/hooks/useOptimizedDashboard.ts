import { useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@backend/convex/_generated/api';
import { DashboardStats, RecentActivity } from '@features/dashboard/types';
import { mobileCacheManager } from '@shared/lib/cache/mobileCacheManager';
import { JobCategory } from '@entities/jobCategory';
import { useNetwork } from '@shared/hooks';

/**
 * Optimized Dashboard Hook
 * 
 * Implements mobile optimizations:
 * - Parallel queries with Promise.all pattern
 * - MMKV caching for stable data (job categories)
 * - Minimal payload aggregation
 * - Network-aware data fetching
 */

export const useOptimizedDashboard = () => {
  const { user } = useUser();
  const { isConnected, networkState } = useNetwork();
  const isWifiConnected = networkState.type === 'wifi';
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cachedJobCategories, setCachedJobCategories] = useState<JobCategory[] | null>(null);
  const [cachedDashboardData, setCachedDashboardData] = useState<any>(null);

  // Primary aggregated query that minimizes round-trips
  const dashboardData = useQuery(api.dashboard.getDashboardData.getDashboardDataQuery);
  
  // Cached job categories query (only when cache is invalid or missing)
  const shouldFetchJobCategories = !mobileCacheManager.isJobCategoriesCacheValid();
  const jobCategoriesQuery = useQuery(
    api.jobCategories.getAllJobCategories.getAllJobCategoriesQuery,
    shouldFetchJobCategories ? {} : 'skip'
  );

  // Cache dashboard data when it loads
  useEffect(() => {
    if (dashboardData) {
      setCachedDashboardData(dashboardData);
    }
  }, [dashboardData]);

  // Load cached job categories on mount
  useEffect(() => {
    const cached = mobileCacheManager.getCachedJobCategories();
    if (cached) {
      setCachedJobCategories(cached);
    }
  }, []);

  // Cache job categories when fresh data arrives
  useEffect(() => {
    if (jobCategoriesQuery && Array.isArray(jobCategoriesQuery)) {
      // Filter out categories with undefined requireOrientation before caching
      const validCategories = jobCategoriesQuery.filter(cat => cat.requireOrientation !== undefined);
      mobileCacheManager.cacheJobCategories(validCategories as JobCategory[]);
      setCachedJobCategories(validCategories as JobCategory[]);
    }
  }, [jobCategoriesQuery]);

  // Update time every minute (for greeting)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper functions for activity descriptions (optimized)
  const getNotificationDescription = useMemo(() => (notification: any) => {
    const descriptions = {
      'application_update': 'Your health card application status has been updated',
      'payment_reminder': 'Payment reminder for your health card application',
      'document_required': 'Additional documents required for your application',
      'appointment': 'Appointment scheduled for health card processing',
      'default': 'You have a new notification regarding your health card'
    };
    return descriptions[notification.type as keyof typeof descriptions] || descriptions.default;
  }, []);

  const getApplicationActivityStatus = useMemo(() => (status: string): 'success' | 'pending' | 'error' => {
    const statusMap = {
      'Approved': 'success',
      'Complete': 'success',
      'Rejected': 'error',
      'Cancelled': 'error',
      'default': 'pending'
    };
    return (statusMap[status as keyof typeof statusMap] || statusMap.default) as 'success' | 'pending' | 'error';
  }, []);

  // Use cached or fresh data (prefer fresh, fallback to cache)
  const effectiveDashboardData = dashboardData || cachedDashboardData;

  // Dashboard stats from aggregated query (pre-calculated on server)
  const dashboardStats = useMemo((): DashboardStats => {
    if (!effectiveDashboardData?.stats) {
      return {
        activeApplications: 0,
        pendingPayments: 0,
        validHealthCards: 0,
        pendingAmount: 0,
        unreadNotifications: 0,
      };
    }

    return {
      activeApplications: effectiveDashboardData.stats.activeApplications,
      pendingPayments: effectiveDashboardData.stats.pendingPayments,
      validHealthCards: effectiveDashboardData.stats.validHealthCards,
      pendingAmount: effectiveDashboardData.stats.pendingAmount,
      unreadNotifications: effectiveDashboardData.stats.unreadNotifications || 0,
    };
  }, [effectiveDashboardData?.stats]);

  // Recent activities from aggregated data
  const recentActivities = useMemo((): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    if (!effectiveDashboardData) return activities;
    
    // Add from pre-filtered notifications
    effectiveDashboardData.notifications?.forEach((notification: any) => {
      activities.push({
        id: notification._id,
        userId: user?.id || '', // userId is not part of notification object, use current user's id
        type: 'notification_sent',
        title: notification.message || notification.title || 'New Notification',
        description: getNotificationDescription(notification),
        timestamp: new Date(notification._creationTime || 0),
        status: notification.isRead ? 'success' : 'pending'
      });
    });

    // Add from applications (pre-limited on server)
    effectiveDashboardData.applications?.slice(0, 2).forEach((application: any) => {
      activities.push({
        id: application._id,
        userId: user?.id || '',
        type: 'application_submitted',
        title: `Health Card Application ${application.status || 'Pending'}`,
        description: `Application for ${application.applicationType || 'health card'} is now ${application.status?.toLowerCase() || 'pending'}`,
        timestamp: new Date(application._creationTime || 0),
        status: getApplicationActivityStatus(application.status || 'pending')
      });
    });

    effectiveDashboardData.payments?.forEach((payment: any) => {
      if (payment) {
        activities.push({
          id: payment._id,
          userId: user?.id || '',
          type: 'payment_made',
          title: `Payment ${payment.status}`,
          description: `?${payment.netAmount.toFixed(2)} payment via ${payment.paymentMethod}`,
          timestamp: new Date(payment.updatedAt || payment._creationTime || 0),
          status: payment.status === 'Complete' ? 'success' : payment.status === 'Failed' ? 'error' : 'pending'
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [effectiveDashboardData, getNotificationDescription, getApplicationActivityStatus]);

  // Network-aware refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      // On WiFi, we can afford to refresh all data including cached items
      if (isWifiConnected) {
        // Invalidate job categories cache to force fresh fetch
        mobileCacheManager.invalidateCache('cache_job_categories');
      }
      
      // Convex automatically handles refetching
      // Add artificial delay to show refreshing state
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  // Optimized loading state - only show loading on initial mount
  const isLoading = user && !dashboardData && !cachedDashboardData;

  // Greeting helper (unchanged but memoized)
  const getGreeting = useMemo(() => () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }, [currentTime]);

  // Get job categories from cache or fresh data
  const jobCategories = useMemo(() => {
    return jobCategoriesQuery || cachedJobCategories || [];
  }, [jobCategoriesQuery, cachedJobCategories]);

  // Helper to get job category by ID (optimized with memoization)
  const getJobCategoryById = useMemo(() => (id: string) => {
    return jobCategories.find((cat: any) => cat._id === id) as JobCategory | undefined;
  }, [jobCategories]);

  return {
    // Data (optimized payloads)
    user,
    userProfile: effectiveDashboardData?.user,
    userApplications: effectiveDashboardData?.applications,
    dashboardStats,
    recentActivities,
    currentTime,
    unreadNotificationsCount: effectiveDashboardData?.stats?.unreadNotifications || 0,
    jobCategories,
    
    // Network status
    isConnected,
    
    // States
    isLoading,
    refreshing,
    
    // Actions
    onRefresh,
    getGreeting,
    getJobCategoryById,
    
    // Cache management
    cacheStats: mobileCacheManager.getCacheStats(),
    invalidateAllCaches: () => mobileCacheManager.invalidateAllCaches(),
  };
};