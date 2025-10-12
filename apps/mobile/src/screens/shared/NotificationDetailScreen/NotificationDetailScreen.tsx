import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { BaseScreen } from '@shared/components/core';
import { useNotification } from '@features/notification/hooks/useNotification';
import { theme } from '@shared/styles/theme';
import { styles } from './NotificationDetailScreen.styles';
import { moderateScale } from '@shared/utils/responsive';
import { FeedbackSystem } from '@shared/components/feedback/feedback';

// Type mapping for notification icons and colors
const NOTIFICATION_CONFIG = {
  PaymentReceived: {
    icon: 'checkmark-circle',
    color: theme.colors.accent.safetyGreen,
    gradient: [theme.colors.accent.safetyGreen, '#22C55E'],
    actionText: 'View Payment Details',
    actionIcon: 'receipt-outline',
  },
  PaymentSuccessful: {
    icon: 'checkmark-circle',
    color: theme.colors.accent.safetyGreen,
    gradient: [theme.colors.accent.safetyGreen, '#22C55E'],
    actionText: 'View Details',
    actionIcon: 'arrow-forward-outline',
  },
  MissingDoc: {
    icon: 'alert-circle',
    color: theme.colors.accent.warningOrange,
    gradient: [theme.colors.accent.warningOrange, '#F97316'],
    actionText: 'Review Documents',
    actionIcon: 'document-text-outline',
  },
  FormApproved: {
    icon: 'checkmark-circle',
    color: theme.colors.accent.primaryGreen,
    gradient: [theme.colors.accent.primaryGreen, '#10B981'],
    actionText: 'View Application',
    actionIcon: 'document-text-outline',
  },
  OrientationScheduled: {
    icon: 'calendar',
    color: theme.colors.accent.medicalBlue,
    gradient: [theme.colors.accent.medicalBlue, '#3B82F6'],
    actionText: 'View Schedule',
    actionIcon: 'time-outline',
  },
  CardIssue: {
    icon: 'card',
    color: theme.colors.primary[500],
    gradient: [theme.colors.primary[500], theme.colors.primary[600]],
    actionText: 'View Health Card',
    actionIcon: 'card-outline',
  },
} as const;

export function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notification, isLoading, markAsRead, application } = useNotification(id);

  useEffect(() => {
    // Mark notification as read when viewed
    if (notification && !notification.isRead) {
      markAsRead();
    }
  }, [notification?.isRead]);

  if (isLoading) {
    return (
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading notification details...</Text>
        </View>
      </BaseScreen>
    );
  }

  if (!notification) {
    return (
      <BaseScreen>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={moderateScale(48)} color={theme.colors.semantic.error} />
          <Text style={styles.errorText}>Notification not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/notification')}>
            <Text style={styles.backButtonText}>Back to Notifications</Text>
          </TouchableOpacity>
        </View>
      </BaseScreen>
    );
  }

  const config = NOTIFICATION_CONFIG[notification.notificationType as keyof typeof NOTIFICATION_CONFIG] || {
    icon: 'notifications',
    color: theme.colors.accent.safetyGreen,
    gradient: [theme.colors.accent.safetyGreen, '#22C55E'],
    actionText: 'View Details',
    actionIcon: 'arrow-forward-outline',
  };
  const notificationDate = new Date(notification._creationTime);
  
  const handlePrimaryAction = () => {
    // For any notification with an applicationId, navigate to the application details
    if (notification.applicationId) {
      router.push(`/(screens)/(application)/${notification.applicationId}`);
      return;
    }
    
    // Fallback for specific types without applicationId
    switch (notification.notificationType) {
      case 'PaymentReceived':
      case 'PaymentSuccessful':
        if (notification.applicationId) {
          router.push(`/(screens)/(application)/${notification.applicationId}?section=payment`);
        }
        break;
      case 'MissingDoc':
        if (notification.applicationId) {
          router.push({
            pathname: '/(screens)/(shared)/documents/view-document',
            params: { formId: notification.applicationId }
          });
        }
        break;
      case 'FormApproved':
        if (notification.applicationId) {
          router.push(`/(screens)/(application)/${notification.applicationId}`);
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
      default:
        router.push('/(tabs)/application');
    }
  };

  return (
    <BaseScreen safeArea={false}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with solid color background */}
        <View
          style={[styles.header, { backgroundColor: config?.color || theme.colors.primary[500] }]}
        >
          <TouchableOpacity 
            style={styles.headerBackButton} 
            onPress={() => router.push('/(tabs)/notification')}
          >
            <Ionicons name="arrow-back" size={moderateScale(24)} color="white" />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons 
                name={config?.icon || 'notifications'} 
                size={moderateScale(36)} 
                color={config?.color || theme.colors.primary[500]}
              />
            </View>
          </View>
        </View>

        {/* Notification Content */}
        <View style={styles.content}>
          {/* Title and Time */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{notification.title || 'Notification'}</Text>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={moderateScale(16)} color={theme.colors.text.secondary} />
              <Text style={styles.time}>
                {notificationDate.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })} at {notificationDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </Text>
            </View>
          </View>

          {/* Message */}
          <View style={styles.messageCard}>
            <Text style={styles.message}>{notification.message}</Text>
          </View>

          {/* Application Info (if available) */}
          {application && (
            <View style={styles.applicationCard}>
              <Text style={styles.sectionTitle}>Related Application</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Application ID:</Text>
                <Text style={styles.infoValue}>#{application._id.slice(-8)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Job Category:</Text>
                <View style={styles.categoryContainer}>
                  <View 
                    style={[
                      styles.categoryDot, 
                      { backgroundColor: application.jobCategory?.colorCode }
                    ]} 
                  />
                  <Text style={styles.infoValue}>{application.jobCategory?.name}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Position:</Text>
                <Text style={styles.infoValue}>{application.form?.position}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: config?.color + '20' }]}>
                  <Text style={[styles.statusText, { color: config?.color }]}>
                    {application.status}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Quick Stats (for specific notification types) */}
          {notification.notificationType === 'PaymentReceived' && application?.payment && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="cash-outline" size={moderateScale(24)} color={theme.colors.accent.safetyGreen} />
                <Text style={styles.statValue}>₱{application.payment.amount}</Text>
                <Text style={styles.statLabel}>Amount Paid</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle-outline" size={moderateScale(24)} color={theme.colors.accent.safetyGreen} />
                <Text style={styles.statValue}>Confirmed</Text>
                <Text style={styles.statLabel}>Payment Status</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: config?.color || theme.colors.accent.safetyGreen }]}
              onPress={handlePrimaryAction}
            >
              <Ionicons name={config?.actionIcon || 'arrow-forward'} size={moderateScale(20)} color="white" />
              <Text style={styles.primaryButtonText}>{config?.actionText || 'View Details'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/(tabs)/notification')}
            >
              <Text style={styles.secondaryButtonText}>Back to Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BaseScreen>
  );
}
