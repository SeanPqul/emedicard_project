import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { styles } from './ActionCenter.styles';

export interface ActionCenterProps {
  dashboardStats: {
    pendingPayments: number;
    pendingAmount: number;
    uploadedDocuments?: number;
    activeApplications: number;
  };
  currentApplication: any;
  rejectedDocumentsCount?: number;
}

interface ActionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  urgency: 'high' | 'medium' | 'low';
  onPress: () => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  dashboardStats,
  currentApplication,
  rejectedDocumentsCount = 0,
}) => {
  const actions: ActionItem[] = [];

  // 1. Payment due (highest priority if overdue)
  if (dashboardStats.pendingPayments > 0 && currentApplication?._id) {
    const daysLeft = currentApplication.paymentDeadline 
      ? Math.floor((currentApplication.paymentDeadline - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    
    const isOverdue = daysLeft !== null && daysLeft < 0;
    const isDueSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

    actions.push({
      id: 'payment',
      icon: 'cash-outline',
      iconColor: isOverdue ? theme.colors.semantic.error : isDueSoon ? theme.colors.orange[600] : theme.colors.blue[600],
      title: `Payment ${isOverdue ? 'Overdue' : 'Due'}`,
      subtitle: `₱${dashboardStats.pendingAmount.toFixed(2)}${daysLeft !== null ? ` • ${daysLeft <= 0 ? 'Overdue' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}` : ''}`,
      urgency: isOverdue ? 'high' : isDueSoon ? 'medium' : 'low',
      onPress: () => router.push(`/(screens)/(application)/${currentApplication._id}?section=payment`),
    });
  }

  // 2. Rejected documents (high priority)
  if (rejectedDocumentsCount > 0 && currentApplication?._id) {
    actions.push({
      id: 'rejected-docs',
      icon: 'alert-circle-outline',
      iconColor: theme.colors.semantic.error,
      title: `${rejectedDocumentsCount} Document${rejectedDocumentsCount !== 1 ? 's' : ''} Rejected`,
      subtitle: 'Re-upload required documents',
      urgency: 'high',
      onPress: () => router.push(`/(screens)/(shared)/documents/upload-document?formId=${currentApplication._id}&rejectedOnly=true`),
    });
  }

  // 3. Orientation required (for Yellow card holders)
  const isFoodHandler = currentApplication?.jobCategory?.name?.toLowerCase().includes('food');
  const requiresOrientation = isFoodHandler && currentApplication?.jobCategory?.requireOrientation === 'Yes';
  // TODO: Check if orientation is already scheduled/completed
  const orientationScheduled = false; // currentApplication?.orientationScheduled

  if (requiresOrientation && !orientationScheduled) {
    actions.push({
      id: 'orientation',
      icon: 'school-outline',
      iconColor: theme.colors.orange[600],
      title: 'Food Safety Orientation Required',
      subtitle: 'Schedule your mandatory orientation',
      urgency: 'medium',
      onPress: () => router.push('/(screens)/(shared)/orientation'),
    });
  }

  // 4. Missing documents (only if no application exists)
  if (dashboardStats.activeApplications === 0) {
    actions.push({
      id: 'start-application',
      icon: 'document-text-outline',
      iconColor: theme.colors.blue[600],
      title: 'Start Your Application',
      subtitle: 'Apply for your health card today',
      urgency: 'low',
      onPress: () => router.push('/(tabs)/apply'),
    });
  }

  // Sort by urgency
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  actions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  // Don't show section if no actions
  if (actions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={moderateScale(20)} color={theme.colors.status.success} />
          <Text style={styles.title}>All Caught Up</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No pending actions. You're all set!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="list-circle" size={moderateScale(20)} color={theme.colors.primary[500]} />
        <Text style={styles.title}>Action Center</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{actions.length}</Text>
        </View>
      </View>

      <View style={styles.actionsList}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionItem,
              action.urgency === 'high' && styles.actionItemUrgent,
            ]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.iconColor + '15' }]}>
              <Ionicons name={action.icon} size={moderateScale(22)} color={action.iconColor} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[
                styles.actionTitle,
                action.urgency === 'high' && styles.actionTitleUrgent,
              ]}>
                {action.title}
              </Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
