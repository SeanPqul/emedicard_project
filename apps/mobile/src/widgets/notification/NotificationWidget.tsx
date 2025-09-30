import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '@shared/components';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './NotificationWidget.styles';
import type { NotificationCategory, NotificationItem } from '@entities/notification';

// Constants
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

interface NotificationWidgetProps {
  notificationsData: NotificationItem[];
  refreshing: boolean;
  selectedCategory: NotificationCategory;
  unreadCount: number;
  notificationsByDate: { [key: string]: NotificationItem[] };
  onRefresh: () => void;
  onCategoryChange: (category: NotificationCategory) => void;
  onMarkAllRead: () => void;
  onMarkAsRead: (id: NotificationItem['_id']) => void;
  onNotificationPress: (notification: NotificationItem) => void;
  getRelativeTime: (timestamp: number) => string;
  getDateLabel: (dateString: string) => string;
  getFilteredNotifications: () => NotificationItem[];
}

export function NotificationWidget({
  notificationsData,
  refreshing,
  selectedCategory,
  unreadCount,
  notificationsByDate,
  onRefresh,
  onCategoryChange,
  onMarkAllRead,
  onMarkAsRead,
  onNotificationPress,
  getRelativeTime,
  getDateLabel,
  getFilteredNotifications,
}: NotificationWidgetProps) {
  
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={onMarkAllRead}
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
                onPress={() => onCategoryChange(category)}
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
            onMarkAsRead(notification._id);
          }
          onNotificationPress(notification);
        }}
      >
        <View style={[
          styles.notificationIcon,
          { backgroundColor: color + '20' }
        ]}>
          <Ionicons name={iconName as any} size={moderateScale(20)} color={color} />
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
