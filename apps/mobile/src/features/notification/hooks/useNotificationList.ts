import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useNotifications } from './useNotifications';
import { Id } from '@backend/convex/_generated/dataModel';
import type { NotificationCategory, NotificationItem } from '@entities/notification';

// Map backend notification to frontend format
type BackendNotification = {
  _id: Id<'notifications'>;
  _creationTime: number;
  applicationId?: Id<'applications'>;
  title?: string;
  actionUrl?: string;
  userId: Id<'users'>;
  message: string;
  notificationType: string;
  isRead: boolean;
};

// Map backend notifications to frontend format
const mapNotification = (backendNotif: BackendNotification): NotificationItem => {
  return {
    ...backendNotif,
    type: backendNotif.notificationType,
    read: backendNotif.isRead
  };
};

export function useNotificationList() {
  const notifications = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('All');
  const [refreshing, setRefreshing] = useState(false);

  const rawNotifications = notifications.data.notifications || [];
  const notificationsData = rawNotifications.map(mapNotification);
  const loading = notifications.isLoading;

  // Handlers
  const onRefresh = async () => {
    setRefreshing(true);
    // The hook will automatically refetch when the component re-renders
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleMarkAsRead = async (notificationId: Id<'notifications'>) => {
    try {
      await notifications.mutations.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notifications.mutations.markAllNotificationsAsRead();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleNotificationNavigation = (notification: NotificationItem) => {
    // Navigate to the notification detail screen
    router.push(`/(screens)/(shared)/notification/${notification._id}`);
  };

  // Utility functions
  const getFilteredNotifications = () => {
    if (!notificationsData) return [];

    let filtered = notificationsData;

    switch (selectedCategory) {
      case 'Unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'Applications':
        filtered = filtered.filter(n => 
          n.type === 'MissingDoc' || n.type === 'FormApproved'
        );
        break;
      case 'Payments':
        filtered = filtered.filter(n => n.type === 'PaymentReceived');
        break;
      case 'Orientations':
        filtered = filtered.filter(n => n.type === 'OrientationScheduled');
        break;
      default:
        // All notifications
        break;
    }

    return filtered.sort((a, b) => b._creationTime - a._creationTime);
  };

  const getNotificationsByDate = () => {
    const filtered = getFilteredNotifications();
    const grouped: { [key: string]: NotificationItem[] } = {};

    filtered.forEach(notification => {
      const date = new Date(notification._creationTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(notification);
    });

    return grouped;
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const unreadCount = notificationsData?.filter(n => !n.read).length || 0;
  const notificationsByDate = getNotificationsByDate();

  return {
    // Data
    notificationsData,
    loading,
    refreshing,
    selectedCategory,
    unreadCount,
    notificationsByDate,

    // Setters
    setSelectedCategory,

    // Handlers
    onRefresh,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleNotificationNavigation,

    // Utilities
    getRelativeTime,
    getDateLabel,
    getFilteredNotifications,
  };
}
