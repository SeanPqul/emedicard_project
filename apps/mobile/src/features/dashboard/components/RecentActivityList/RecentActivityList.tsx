import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ActivityItem } from '@features/dashboard/components/ActivityItem';
import { EmptyState } from '@shared/components/feedback';
import { RecentActivityListProps } from '@features/dashboard/types';
import { styles } from './RecentActivityList.styles';

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ recentActivities }) => {
  const handleViewAll = () => {
    router.push('/(screens)/(shared)/activity');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity 
          onPress={handleViewAll}
          accessibilityLabel="View all activities"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {recentActivities.length > 0 ? (
        <View style={styles.activityList}>
          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="document-outline"
          title="No recent activity"
          subtitle="Your activities will appear here"
        />
      )}
    </View>
  );
};