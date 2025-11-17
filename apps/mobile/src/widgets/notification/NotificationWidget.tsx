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
  Payment: 'card',
  FormApproved: 'checkmark-circle',
  OrientationScheduled: 'calendar',
  CardIssue: 'shield-checkmark',
  ApplicationSubmitted: 'document',
  ApplicationApproved: 'checkmark-circle',
  DocumentRejection: 'close-circle',
  status_update: 'information-circle',
  payment_max_attempts: 'alert-circle',
  payment_rejected: 'close-circle',
  application_rejected_final: 'close-circle',
  payment_rejection_info: 'information-circle',
  max_attempts_reached: 'warning',
  document_rejected: 'close-circle',
  // New medical/document referral types (normalized in useNotificationList)
  DocumentReferredMedical: 'medkit',
  DocumentIssueFlagged: 'alert-circle',
  MedicalReferralResubmission: 'medkit',
  DocumentResubmission: 'document-text',
};

const NOTIFICATION_COLORS: Record<string, string> = {
  MissingDoc: '#F18F01',
  PaymentReceived: '#2E86AB',
  Payment: '#2E86AB',
  FormApproved: '#28A745',
  OrientationScheduled: '#A23B72',
  CardIssue: '#6B46C1',
  ApplicationSubmitted: '#3B82F6',
  ApplicationApproved: '#28A745',
  DocumentRejection: '#DC3545',
  status_update: '#6B7280',
  payment_max_attempts: '#DC3545',
  payment_rejected: '#F18F01',
  application_rejected_final: '#DC3545',
  payment_rejection_info: '#6B7280',
  max_attempts_reached: '#F18F01',
  document_rejected: '#F18F01',
  // New medical/document referral types (normalized in useNotificationList)
  DocumentReferredMedical: '#DC2626', // red-ish for medical findings
  DocumentIssueFlagged: '#F18F01',    // orange for document issues
  MedicalReferralResubmission: '#2563EB',
  DocumentResubmission: '#2563EB',
};

const NOTIFICATION_TITLES: Record<string, string> = {
  MissingDoc: 'Missing Document',
  PaymentReceived: 'Payment Received',
  Payment: 'Payment',
  FormApproved: 'Application Approved',
  OrientationScheduled: 'Orientation Scheduled',
  CardIssue: 'Health Card Issued',
  ApplicationSubmitted: 'Application Submitted',
  ApplicationApproved: 'Application Approved',
  DocumentRejection: 'Document Rejection',
  status_update: 'Status Update',
  payment_max_attempts: 'Maximum Payment Attempts Reached',
  payment_rejected: 'Payment Rejected',
  application_rejected_final: 'Application Rejected',
  payment_rejection_info: 'Payment Update',
  max_attempts_reached: 'Action Required',
  document_rejected: 'Document Rejected',
  // New medical/document referral types (normalized in useNotificationList)
  DocumentReferredMedical: 'Medical Finding Detected',
  DocumentIssueFlagged: 'Document Needs Correction',
  MedicalReferralResubmission: 'Medical Results Resubmitted',
  DocumentResubmission: 'Document Resubmitted',
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
  getFilteredNotifications: (category?: NotificationCategory) => NotificationItem[];
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
  
  const renderCategoryFilters = () => {
    return (
      <View style={styles.filtersContainer}>
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
              : getFilteredNotifications(category).length;
              
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
    
    // Format absolute timestamp
    const timestamp = new Date(notification._creationTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return (
      <TouchableOpacity 
        key={notification._id}
        style={[
          styles.notificationCard,
          !notification.read && styles.notificationCardUnread
        ]}
        onPress={() => {
          if (!notification.read) {
            onMarkAsRead(notification._id);
          }
          onNotificationPress(notification);
        }}
        activeOpacity={0.7}
      >
        {/* Unread indicator badge */}
        {!notification.read && (
          <View style={styles.unreadBadge}>
            <View style={styles.unreadDot} />
          </View>
        )}
        
        {/* Icon Section */}
        <View style={[
          styles.notificationIconContainer,
          { backgroundColor: color + '15' }
        ]}>
          <Ionicons name={iconName as any} size={moderateScale(20)} color={color} />
        </View>
        
        {/* Content Section */}
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[
              styles.notificationTitle,
              !notification.read && styles.notificationTitleUnread
            ]} numberOfLines={2}>
              {title}
            </Text>
          </View>
          
          <Text style={styles.notificationMessage} numberOfLines={3}>
            {notification.message}
          </Text>
          
          {/* Time at bottom with icon and timestamp */}
          <View style={styles.notificationFooter}>
            <View style={styles.timeContainer}>
              <Ionicons 
                name="time-outline" 
                size={moderateScale(12)} 
                color="#9CA3AF" 
                style={styles.timeIcon}
              />
              <Text style={styles.notificationTime}>
                {getRelativeTime(notification._creationTime)}
              </Text>
            </View>
            <Text style={styles.notificationTimestamp} numberOfLines={1} ellipsizeMode="tail">
              {timestamp}
            </Text>
          </View>
        </View>
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
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Inline Header Section */}
        <View style={styles.inlineHeaderSection}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.headerUnreadBadge}>
                  <Text style={styles.headerUnreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            
            {unreadCount > 0 && (
              <TouchableOpacity 
                style={styles.markAllButton}
                onPress={onMarkAllRead}
                activeOpacity={0.7}
              >
                <Text style={styles.markAllButtonText}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.subtitle}>
            {unreadCount === 0 
              ? 'All caught up!' 
              : `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
            }
          </Text>
        </View>
        
        {/* Category Filters */}
        {renderCategoryFilters()}
        {!hasNotifications ? (
          renderEmptyState()
        ) : (
          <View style={styles.notificationsList}>
            {Object.entries(notificationsByDate).map(([date, notifications]) => (
              <View key={date} style={styles.dateSection}>
                <View style={styles.dateLabelContainer}>
                  <View style={styles.dateLabelDivider} />
                  <Text style={styles.dateLabel}>{getDateLabel(date)}</Text>
                  <View style={styles.dateLabelDivider} />
                </View>
                <View style={styles.cardsContainer}>
                  {notifications.map(renderNotificationItem)}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
