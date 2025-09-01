import { useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../convex/_generated/api';
import { DashboardStats, RecentActivity } from '../types';

export const useDashboard = () => {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Convex queries
  const userProfile = useQuery(api.users.getCurrentUser);
  const userApplications = useQuery(api.forms.getUserApplications);
  const userNotifications = useQuery(api.notifications.getUserNotifications);
  const userPayments = useQuery(api.payments.getUserPayments);
  const userHealthCards = useQuery(api.healthCards.getUserHealthCards);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate dashboard stats with memoization
  const dashboardStats = useMemo((): DashboardStats => {
    // Handle case where data might be undefined due to user not existing in DB
    const activeApplications = userApplications?.filter(app => 
      app.status === 'Submitted' || app.status === 'Under Review'
    ).length || 0;

    const pendingPayments = userPayments?.filter(payment => 
      payment.status === 'Pending'
    ).length || 0;

    const pendingAmount = userPayments?.filter(payment => 
      payment.status === 'Pending'
    ).reduce((sum, payment) => sum + payment.netAmount, 0) || 0;

    const validHealthCards = userHealthCards?.filter(card => 
      card.expiresAt > Date.now()
    ).length || 0;

    // Count orientations needed for food handler applications
    const upcomingOrientations = userApplications?.filter(app => 
      app.jobCategory?.name?.toLowerCase().includes('food') && 
      (app.status === 'Under Review' || app.status === 'Submitted')
    ).length || 0;

    // Get next orientation date (mock implementation)
    const nextOrientationDate = upcomingOrientations > 0 ? 
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() : 
      null;

    return {
      activeApplications,
      pendingPayments,
      upcomingOrientations,
      validHealthCards,
      pendingAmount,
      nextOrientationDate,
    };
  }, [userApplications, userPayments, userHealthCards]);

  // Get recent activities with memoization
  const recentActivities = useMemo((): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    // Add from notifications
    userNotifications?.slice(0, 3).forEach(notification => {
      activities.push({
        id: notification._id,
        type: 'application',
        title: notification.message, // Note: typo in schema
        description: `Notification received`,
        timestamp: new Date().toISOString(), // TODO: Add timestamp to schema
        status: 'pending'
      });
    });

    // Add from payments
    userPayments?.slice(0, 2).forEach(payment => {
      activities.push({
        id: payment._id,
        type: 'payment',
        title: `Payment ${payment.status}`,
        description: `₱${payment.netAmount} via ${payment.method}`,
        timestamp: new Date().toISOString(),
        status: payment.status === 'Complete' ? 'success' : payment.status === 'Failed' ? 'error' : 'pending'
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [userNotifications, userPayments]);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    // Refetch data - Convex automatically handles this
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Loading state - show loading while queries are being resolved
  // Don't show loading if user is authenticated but profile doesn't exist (new user scenario)
  const hasQueries = userProfile !== undefined || userApplications !== undefined || userNotifications !== undefined || userPayments !== undefined || userHealthCards !== undefined;
  const isLoading = user && !hasQueries;

  // Greeting helper
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  // Unread notifications count
  const unreadNotificationsCount = userNotifications?.filter(n => !n.read).length || 0;

  return {
    // Data
    user,
    userProfile,
     userApplications,
    dashboardStats,
    recentActivities,
    currentTime,
    unreadNotificationsCount,
    
    // States
    isLoading,
    refreshing,
    
    // Actions
    onRefresh,
    getGreeting,
  };
};
