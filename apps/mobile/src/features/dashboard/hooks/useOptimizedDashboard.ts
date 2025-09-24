import { useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { useEffect, useMemo, useState } from 'react';
import { api } from 'backend/convex/_generated/api';
import { DashboardStats, RecentActivity } from '@features/dashboard/types';
import { mobileCacheManager, JobCategory } from '@shared/lib/cache/mobileCacheManager';
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

  // Primary aggregated query that minimizes round-trips
  const dashboardData = useQuery(api.dashboard.getDashboardData.getDashboardDataQuery);
  
  // Cached job categories query (only when cache is invalid or missing)
  const shouldFetchJobCategories = !mobileCacheManager.isJobCategoriesCacheValid();
  const jobCategoriesQuery = useQuery(
    api.jobCategories.getAllJobCategories.getAllJobCategoriesQuery,
    shouldFetchJobCategories ? {} : 'skip'
  );

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
      mobileCacheManager.cacheJobCategories(jobCategoriesQuery);
      setCachedJobCategories(jobCategoriesQuery);
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

  // Dashboard stats from aggregated query (pre-calculated on server)
  const dashboardStats = useMemo((): DashboardStats => {
    if (!dashboardData?.stats) {
      return {
        activeApplications: 0,
        pendingPayments: 0,
        validHealthCards: 0,
        pendingAmount: 0,
        unreadNotifications: 0,
      };
    }

    return {
      activeApplications: dashboardData.stats.activeApplications,
      pendingPayments: dashboardData.stats.pendingPayments,
      validHealthCards: dashboardData.stats.validHealthCards,
      pendingAmount: dashboardData.stats.pendingAmount,
      unreadNotifications: dashboardData.stats.unreadNotifications || 0,
    };
  }, [dashboardData?.stats]);

  // Recent activities from aggregated data
  const recentActivities = useMemo((): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    if (!dashboardData) return activities;
    
    // Add from pre-filtered notifications
    dashboardData.notifications?.forEach(notification => {
      activities.push({
        id: notification._id,
        type: 'notification',
        title: notification.message || notification.title || 'New Notification',
        description: getNotificationDescription(notification),
        timestamp: new Date(notification._creationTime || 0).toISOString(),
        status: notification.read ? 'success' : 'pending'
      });
    });

    // Add from applications (pre-limited on server)
    dashboardData.applications?.slice(0, 2).forEach(application => {
      activities.push({
        id: application._id,
        type: 'application',
        title: `Health Card Application ${application.status || 'Pending'}`,
        description: `Application for ${application.applicationType || 'health card'} is now ${application.status?.toLowerCase() || 'pending'}`,
        timestamp: new Date(application._creationTime || 0).toISOString(),
        status: getApplicationActivityStatus(application.status || 'pending')
      });
    });

    dashboardData.payments?.forEach(payment => {
      if (payment) {
        activities.push({
          id: payment._id,
          type: 'payment',
          title: `Payment ${payment.status}`,
          description: `?${payment.netAmount.toFixed(2)} payment via ${payment.method}`,
          timestamp: new Date(payment.updatedAt || payment._creationTime || 0).toISOString(),
          status: payment.status === 'Complete' ? 'success' : payment.status === 'Failed' ? 'error' : 'pending'
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [dashboardData, getNotificationDescription, getApplicationActivityStatus]);

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

  // Optimized loading state
  const isLoading = user && !dashboardData && !cachedJobCategories;

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
    return jobCategories.find((cat: JobCategory) => cat._id === id);
  }, [jobCategories]);

  return {
    // Data (optimized payloads)
    user,
    userProfile: dashboardData?.user,
    userApplications: dashboardData?.applications,
    dashboardStats,
    recentActivities,
    currentTime,
    unreadNotificationsCount: dashboardData?.stats?.unreadNotifications || 0,
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