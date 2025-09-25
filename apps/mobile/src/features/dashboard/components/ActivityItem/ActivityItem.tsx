import { RecentActivity } from '@shared/types';
import { Activity } from '@entities/dashboard/model/types';
import { getBorderRadius, getColor, getSpacing, getTypography } from '@shared/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { 
  getActivityIcon as getIcon, 
  getActivityStatusColor, 
  formatTimestamp 
} from '@entities/activity/lib';

interface ActivityItemProps {
  activity: RecentActivity | Activity;
}

export const ActivityItem: React.FC<ActivityItemProps> = React.memo(({ activity }) => {
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
    return getColor('text.secondary');
  };

  return (
    <View 
      style={styles.container}
      accessibilityLabel={`${activity.title}: ${activity.description}`}
      accessibilityHint={`Activity from ${formatTimestamp(activity.timestamp)}`}
    >
      <View style={[styles.icon, { backgroundColor: getStatusColor() + '20' }]}>
        <Ionicons name={getActivityIcon() as any} size={18} color={getStatusColor()} />
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
    alignItems: 'center',
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('md'),
  },
  content: {
    flex: 1,
  },
  title: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs') / 2,
  },
  description: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs') / 2,
    lineHeight: 16,
  },
  time: {
    ...getTypography('caption'),
    color: getColor('text.tertiary'),
    fontSize: 11,
  },
});
