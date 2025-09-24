import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EmptyState } from '@shared/components';
import { styles } from '@shared/styles/screens/tabs-notification';
import { useNotifications } from '@features/notification';
import { Notification } from '@/src/entities';
import { Id } from 'backend/convex/_generated/dataModel';

type NotificationCategory = 'All' | 'Unread' | 'Applications' | 'Payments' | 'Orientations';

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

type NotificationItem = {
  _id: Id<'notifications'>;
  _creationTime: number;
  applicationId?: Id<'applications'>;
  title?: string;
  actionUrl?: string;
  userId: Id<'users'>;
  message: string;
  type: string;
  read: boolean;
};

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'All', 'Unread', 'Applications', 'Payments', 'Orientations'
];

const NOTIFICATION_ICONS: Record<string, string> = {
  MissingDoc: 'document-text',
  PaymentReceived: 'card',
  FormApproved: 'checkmark-circle',
  OrientationScheduled: 'calendar',
  CardIssue: 'shield-checkmark',
  ApplicationSubmitted: 'document',
  ApplicationApproved: 'checkmark-circle',
  status_update: 'information-circle',
};

const NOTIFICATION_COLORS: Record<string, string> = {
  MissingDoc: '#F18F01',
  PaymentReceived: '#2E86AB',
  FormApproved: '#28A745',
  OrientationScheduled: '#A23B72',
  CardIssue: '#6B46C1',
  ApplicationSubmitted: '#3B82F6',
  ApplicationApproved: '#28A745',
  status_update: '#6B7280',
};

const NOTIFICATION_TITLES: Record<string, string> = {
  MissingDoc: 'Missing Document',
  PaymentReceived: 'Payment Received',
  FormApproved: 'Application Approved',
  OrientationScheduled: 'Orientation Scheduled',
  CardIssue: 'Health Card Issued',
  ApplicationSubmitted: 'Application Submitted',
  ApplicationApproved: 'Application Approved',
  status_update: 'Status Update',
};

// Map backend notifications to frontend format
const mapNotification = (backendNotif: BackendNotification): NotificationItem => {
  return {
    ...backendNotif,
    type: backendNotif.notificationType,
    read: backendNotif.isRead
  };
};

export function NotificationScreen() {
  const { user } = useUser();
  const notifications = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('All');
  const [refreshing, setRefreshing] = useState(false);

  const rawNotifications = notifications.data.notifications || [];
  const notificationsData = rawNotifications.map(mapNotification);
  const loading = notifications.isLoading;

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
    switch (notification.type) {
      case 'MissingDoc':
        if (notification.applicationId) {
          router.push({
            pathname: '/(screens)/(shared)/documents/upload',
            params: { formId: notification.applicationId }
          });
        }
        break;
      case 'PaymentReceived':
        if (notification.applicationId) {
          router.push({
            pathname: '/(screens)/(shared)/payment',
            params: { formId: notification.applicationId }
          });
        }
        break;
      case 'OrientationScheduled':
        if (notification.applicationId) {
          router.push({
            pathname: '/(screens)/(shared)/orientation',
            params: { formId: notification.applicationId }
          });
        }
        break;
      case 'CardIssue':
        router.push('/(screens)/(shared)/health-cards');
        break;
      case 'FormApproved':
        if (notification.applicationId) {
          router.push({
            pathname: '/(tabs)/application',
            params: { highlightId: notification.applicationId }
          });
        }
        break;
      default:
        // Fallback to application screen
        router.push('/(tabs)/application');
    }
  };

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

  const renderHeader = () => {
    const unreadCount = notificationsData?.filter(n => !n.read).length || 0;
    
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllButtonText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {NOTIFICATION_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            const categoryCount = category === 'All' 
              ? notificationsData?.length || 0
              : category === 'Unread'
              ? notificationsData?.filter(n => !n.read).length || 0
              : getFilteredNotifications().length;
              
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextActive
                ]}>
                  {category} ({categoryCount})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderNotificationItem = (notification: NotificationItem) => {
    const iconName = NOTIFICATION_ICONS[notification.type] || 'information-circle';
    const color = NOTIFICATION_COLORS[notification.type] || '#6B7280';
    const title = NOTIFICATION_TITLES[notification.type] || notification.type;
    
    return (
      <TouchableOpacity 
        key={notification._id}
        style={[
          styles.notificationItem,
          !notification.read && styles.notificationItemUnread
        ]}
        onPress={() => {
          if (!notification.read) {
            handleMarkAsRead(notification._id);
          }
          // Navigate to relevant screen based on notification type
          handleNotificationNavigation(notification);
        }}
      >
        <View style={[
          styles.notificationIcon,
          { backgroundColor: color + '20' }
        ]}>
          <Ionicons name={iconName as any} size={20} color={color} />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{title}</Text>
            <Text style={styles.notificationTime}>
              {getRelativeTime(notification._creationTime)}
            </Text>
          </View>
          
          <Text style={styles.notificationMessage}>
            {notification.message}
          </Text>
          
          {notification.applicationId && (
            <Text style={styles.notificationAction}>
              Tap to view details
            </Text>
          )}
        </View>
        
        {!notification.read && (
          <View style={styles.unreadIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (
      <EmptyState
        icon="notifications-outline"
        title="No Notifications"
        subtitle={
          selectedCategory === 'All' 
            ? "You're all caught up! No notifications yet."
            : `No ${selectedCategory.toLowerCase()} notifications found.`
        }
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  const notificationsByDate = getNotificationsByDate();
  const hasNotifications = Object.keys(notificationsByDate).length > 0;

  return (
    <View style={styles.container}>
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!hasNotifications ? (
          renderEmptyState()
        ) : (
          <View style={styles.notificationsList}>
            {Object.entries(notificationsByDate).map(([date, notifications]) => (
              <View key={date} style={styles.dateSection}>
                <Text style={styles.dateLabel}>{getDateLabel(date)}</Text>
                {notifications.map(renderNotificationItem)}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}