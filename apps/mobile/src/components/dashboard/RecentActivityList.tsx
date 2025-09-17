import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityItem } from '../activity/ActivityItem';
import { EmptyState } from '../common/EmptyState';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../../styles/theme';
import { RecentActivity } from '../../types';

interface RecentActivityListProps {
  recentActivities: RecentActivity[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ recentActivities }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity 
          onPress={() => router.push('/(screens)/(shared)/activity')}
          accessibilityLabel="View all activities"
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    marginTop: getSpacing('sm'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  sectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
  },
  viewAllText: {
    ...getTypography('bodySmall'),
    color: getColor('accent.medicalBlue'),
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('xs'),
    ...getShadow('medium'),
  },
});
