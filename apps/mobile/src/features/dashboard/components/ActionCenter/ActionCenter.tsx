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
  userApplications?: any[];
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
  userApplications = [],
  rejectedDocumentsCount = 0,
}) => {
  const actions: ActionItem[] = [];

  // Normalize and dedupe applications by id
  const apps = Array.isArray(userApplications) ? userApplications : [];
  const uniqueAppsMap = new Map<string, any>();
  apps.filter(Boolean).forEach((a: any) => {
    if (a?._id && !uniqueAppsMap.has(a._id)) uniqueAppsMap.set(a._id, a);
  });
  const uniqueApps = Array.from(uniqueAppsMap.values());

  // Statuses that still require user action (exclude Rejected/Approved/Cancelled)
  const ACTIONABLE_STATUSES = new Set(['Pending Payment', 'Submitted', 'Under Review']);

  // 1. Payment due (highest priority if overdue) - evaluate across all applications
  const DEFAULT_TOTAL_AMOUNT = 60;
  const paymentApps = uniqueApps.filter((app: any) => app?.status === 'Pending Payment');
  paymentApps.forEach((app: any) => {
    const daysLeft = app?.paymentDeadline
      ? Math.floor((app.paymentDeadline - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    const isOverdue = daysLeft !== null && daysLeft < 0;
    const isDueSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;
    // Determine amount to display per application
    // - If the app has its own payment record with a positive netAmount, use it
    // - If the app is Pending Payment with no payment record yet, use the default total (₱60)
    // - If there's exactly one pending payment overall, use the aggregated pendingAmount
    // - Otherwise, fall back to default total
    const amount = (() => {
      const perAppAmount = (app as any)?.payment?.netAmount;
      if (typeof perAppAmount === 'number' && perAppAmount > 0) {
        return perAppAmount;
      }
      if ((app as any)?.status === 'Pending Payment' && !(app as any)?.hasPayment) {
        return DEFAULT_TOTAL_AMOUNT;
      }
      if (
        typeof dashboardStats?.pendingAmount === 'number' &&
        dashboardStats.pendingAmount > 0 &&
        typeof dashboardStats?.pendingPayments === 'number' &&
        dashboardStats.pendingPayments === 1
      ) {
        return dashboardStats.pendingAmount;
      }
      return DEFAULT_TOTAL_AMOUNT;
    })();

    actions.push({
      id: `payment-${app._id}`,
      icon: 'cash-outline',
      iconColor: isOverdue ? theme.colors.semantic.error : isDueSoon ? theme.colors.orange[600] : theme.colors.blue[600],
      title: `Payment ${isOverdue ? 'Overdue' : 'Due'}`,
      subtitle: `₱${Number(amount).toFixed(2)}${daysLeft !== null ? ` • ${daysLeft <= 0 ? 'Overdue' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}` : ''}`,
      urgency: 'high',
      onPress: () => router.push(`/(screens)/(application)/${app._id}?section=payment`),
    });
  });

  // 2. Documents rejected (per application)
  const rejectedApps = uniqueApps.filter((app: any) => {
    const count = (app as any)?.rejectedDocumentsCount ?? (app as any)?.rejectionCount ?? 0;
    const hasFlag = (app as any)?.hasRejectedDocuments === true;
    return (count > 0) || hasFlag; // Only show when there are outstanding rejections for that app
  });

  rejectedApps.forEach((app: any) => {
    const countForThisApp = (app as any)?.rejectedDocumentsCount ?? (app as any)?.rejectionCount ?? (currentApplication?._id === app._id ? rejectedDocumentsCount : 0);
    actions.push({
      id: `rejected-${app._id}`,
      icon: 'alert-circle-outline',
      iconColor: theme.colors.semantic.error,
      title: `${countForThisApp} Rejected Document${countForThisApp !== 1 ? 's' : ''}`,
      subtitle: 'Review remarks and resubmit',
      urgency: 'high',
      onPress: () => router.push(`/(screens)/(shared)/documents/view-document?formId=${app._id}&openRejected=true`),
    });
  });

  // 3. Orientation required (for Yellow card holders) - evaluate across actionable applications only
  const orientationApps = uniqueApps
    .filter((app: any) => ACTIONABLE_STATUSES.has(app?.status) && app?.status !== 'Pending Payment')
    .filter((app: any) => {
      const name = app?.jobCategory?.name?.toLowerCase?.() || '';
      const isFoodHandler = name.includes('food');
      const requireOrientationFlag = app?.jobCategory?.requireOrientation;
      const requiresOrientation = isFoodHandler && (requireOrientationFlag === 'Yes' || requireOrientationFlag === true);
      return requiresOrientation;
    });

  // TODO: wire orientation schedule/completion state when backend is ready
  const orientationScheduled = false;

  orientationApps.forEach((app: any) => {
    if (!orientationScheduled) {
      actions.push({
        id: `orientation-${app._id}`,
        icon: 'school-outline',
        iconColor: theme.colors.orange[600],
        title: 'Food Safety Orientation Required',
        subtitle: 'Schedule your mandatory orientation',
        urgency: 'medium',
        onPress: () => router.push(`/(screens)/(shared)/orientation?applicationId=${app._id}`),
      });
    }
  });

  // Sort by urgency
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  actions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  // Don't show section if no urgent actions
  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="alert-circle" size={moderateScale(20)} color={theme.colors.orange[600]} />
        <Text style={styles.title}>Action Required</Text>
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
