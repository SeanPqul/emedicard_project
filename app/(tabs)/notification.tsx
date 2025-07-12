import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EmptyState } from '../../src/components';
import { styles } from '../../assets/styles/tabs-styles/notification';

type NotificationCategory = 'All' | 'Unread' | 'Applications' | 'Payments' | 'Orientations';

interface NotificationItem {
  _id: string;
  _creationTime: number;
  userId: string;
  formsId?: string;
  type: 'MissingDoc' | 'PaymentReceived' | 'FormApproved' | 'OrientationScheduled' | 'CardIssue';
  messag: string; // Note: typo in schema
  read: boolean;
}

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'All', 'Unread', 'Applications', 'Payments', 'Orientations'
];

const NOTIFICATION_ICONS = {
  MissingDoc: 'document-text',
  PaymentReceived: 'card',
  FormApproved: 'checkmark-circle',
  OrientationScheduled: 'calendar',
  CardIssue: 'shield-checkmark',
};

const NOTIFICATION_COLORS = {
  MissingDoc: '#F18F01',
  PaymentReceived: '#2E86AB',
  FormApproved: '#28A745',
  OrientationScheduled: '#A23B72',
  CardIssue: '#6B46C1',
};

const NOTIFICATION_TITLES = {
  MissingDoc: 'Missing Document',
  PaymentReceived: 'Payment Received',
  FormApproved: 'Application Approved',
  OrientationScheduled: 'Orientation Scheduled',
  CardIssue: 'Health Card Issued',
};

export default function Notifications() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('All');
  const [refreshing, setRefreshing] = useState(false);

  // Convex queries and mutations
  const notifications = useQuery(api.notifications.getUserNotifications) as NotificationItem[] | undefined;
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const getFilteredNotifications = () => {
    if (!notifications) return [];

    let filtered = notifications;

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
    const unreadCount = notifications?.filter(n => !n.read).length || 0;
    
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
              ? notifications?.length || 0
              : category === 'Unread'
              ? notifications?.filter(n => !n.read).length || 0
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
    const iconName = NOTIFICATION_ICONS[notification.type];
    const color = NOTIFICATION_COLORS[notification.type];
    const title = NOTIFICATION_TITLES[notification.type];
    
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
          if (notification.formsId) {
            router.push(`/application/${notification.formsId}`);
          }
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
            {notification.messag}
          </Text>
          
          {notification.formsId && (
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
