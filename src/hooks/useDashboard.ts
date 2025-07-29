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

  // Helper functions for activity descriptions
  const getNotificationDescription = (notification: any) => {
    const type = notification.type || 'general';
    switch (type) {
      case 'application_update':
        return 'Your health card application status has been updated';
      case 'payment_reminder':
        return 'Payment reminder for your health card application';
      case 'document_required':
        return 'Additional documents required for your application';
      case 'appointment':
        return 'Appointment scheduled for health card processing';
      default:
        return 'You have a new notification regarding your health card';
    }
  };

  const getApplicationActivityStatus = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Complete':
        return 'success';
      case 'Rejected':
      case 'Cancelled':
        return 'error';
      default:
        return 'pending';
    }
  };

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

    const upcomingOrientations = 0; // TODO: Implement orientations query

    return {
      activeApplications,
      pendingPayments,
      upcomingOrientations,
      validHealthCards,
      pendingAmount,
    };
  }, [userApplications, userPayments, userHealthCards]);

  // Get recent activities with memoization
  const recentActivities = useMemo((): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    // Add from notifications
    userNotifications?.slice(0, 3).forEach(notification => {
      activities.push({
        id: notification._id,
        type: 'notification',
        title: notification.message || notification.messag || 'New Notification', // Handle typo in schema
        description: getNotificationDescription(notification),
        timestamp: notification.createdAt || new Date(Date.now() - Math.random() * 86400000).toISOString(), // Use actual timestamp or recent fallback
        status: notification.read ? 'success' : 'pending'
      });
    });

    // Add from applications
    userApplications?.slice(0, 2).forEach(application => {
      activities.push({
        id: application._id,
        type: 'application',
        title: `Health Card Application ${application.status}`,
        description: `Application for ${application.applicationType || 'health card'} is now ${application.status.toLowerCase()}`,
        timestamp: application.updatedAt || application.createdAt || new Date(Date.now() - Math.random() * 172800000).toISOString(),
        status: getApplicationActivityStatus(application.status)
      });
    });

    // Add from payments
    userPayments?.slice(0, 2).forEach(payment => {
      activities.push({
        id: payment._id,
        type: 'payment',
        title: `Payment ${payment.status}`,
        description: `₱${payment.netAmount.toFixed(2)} payment via ${payment.method}`,
        timestamp: payment.updatedAt || payment.createdAt || new Date(Date.now() - Math.random() * 259200000).toISOString(),
        status: payment.status === 'Complete' ? 'success' : payment.status === 'Failed' ? 'error' : 'pending'
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  }, [userNotifications, userApplications, userPayments]);

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
