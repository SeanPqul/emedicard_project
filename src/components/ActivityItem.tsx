import { getBorderRadius, getColor, getSpacing, getTypography } from '@/src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RecentActivity {
  id: string;
  type: 'application' | 'payment' | 'orientation' | 'card_issued';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

interface ActivityItemProps {
  activity: RecentActivity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'application': return 'document-text-outline';
      case 'payment': return 'card-outline';
      case 'orientation': return 'calendar-outline';
      case 'card_issued': return 'shield-checkmark-outline';
      default: return 'information-circle-outline';
    }
  };

  const getStatusColor = () => {
    switch (activity.status) {
      case 'success': return getColor('semantic.success');
      case 'error': return getColor('semantic.error');
      case 'warning': return getColor('semantic.warning');
      default: return getColor('text.secondary');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <View 
      style={styles.container}
      accessibilityLabel={`${activity.title}: ${activity.description}`}
      accessibilityHint={`Activity from ${formatTime(activity.timestamp)}`}
    >
      <View style={[styles.icon, { backgroundColor: getStatusColor() + '20' }]}>
        <Ionicons name={getActivityIcon() as any} size={18} color={getStatusColor()} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.description}>{activity.description}</Text>
        <Text style={styles.time}>
          {formatTime(activity.timestamp)}
        </Text>
      </View>
    </View>
  );
};

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
