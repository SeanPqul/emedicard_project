import { RecentActivity } from '@shared/types';
import { Activity } from '@entities/dashboard/model/types';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { 
  getActivityIcon as getIcon, 
  getActivityStatusColor, 
  formatTimestamp 
} from '@entities/activity';

interface ActivityItemProps {
  activity: RecentActivity | Activity;
  isLast?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = React.memo(({ activity, isLast = false }) => {
  const getActivityIcon = () => {
    // Handle the different type formats between RecentActivity and Activity
    if ('type' in activity) {
      const type = activity.type;
      // Check if it's one of the Activity types
      if (['application', 'payment', 'orientation', 'card_issued', 'document_upload'].includes(type)) {
        return getIcon(type as any);
      }
      // Handle additional types that might be in RecentActivity
      if (type.includes('notification')) return 'notifications-outline';
      if (type.includes('verification')) return 'shield-checkmark-outline';
      if (type.includes('health_card')) return 'card-outline';
    }
    return 'information-circle-outline';
  };

  const getStatusColor = () => {
    // Handle both RecentActivity and Activity types - provide default if no status
    const status = 'status' in activity ? activity.status : 'pending';
    // Use shared utility for standard statuses
    if (['success', 'error', 'warning', 'pending'].includes(status)) {
      const color = getActivityStatusColor(status as any);
      // Convert hex to theme color if needed
      return color;
    }
    return theme.colors.text.secondary;
  };

  return (
    <View 
      style={[styles.container, isLast && styles.containerLast]}
      accessibilityLabel={`${activity.title}: ${activity.description}`}
      accessibilityHint={`Activity from ${formatTimestamp(activity.timestamp)}`}
    >
      <View style={[styles.icon, { backgroundColor: getStatusColor() + '20' }]}>
        <Ionicons name={getActivityIcon() as any} size={moderateScale(18)} color={getStatusColor()} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.description}>{activity.description}</Text>
        <Text style={styles.time}>
          {formatTimestamp(activity.timestamp)}
        </Text>
      </View>
    </View>
  );
});

ActivityItem.displayName = 'ActivityItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  containerLast: {
    borderBottomWidth: 0,
  },
  icon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  description: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(4),
  },
  time: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
  },
});
