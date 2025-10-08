import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityItem } from '@features/dashboard/components/ActivityItem';
import { EmptyState } from '../../../../shared/components/feedback';
import { RecentActivityListProps } from '@features/dashboard/types';
import { styles } from './RecentActivityList.styles';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';

const INITIAL_ITEMS_TO_SHOW = 3;

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ recentActivities }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleViewAll = () => {
    router.push('/(screens)/(shared)/activity');
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const displayedActivities = isExpanded 
    ? recentActivities 
    : recentActivities.slice(0, INITIAL_ITEMS_TO_SHOW);
  
  const hasMore = recentActivities.length > INITIAL_ITEMS_TO_SHOW;

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
        <>
          <View style={styles.activityList}>
            {displayedActivities.map((activity, index) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity}
                isLast={index === displayedActivities.length - 1}
              />
            ))}
          </View>
          
          {hasMore && (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={handleToggleExpand}
              accessibilityLabel={isExpanded ? 'Show less activities' : 'Show more activities'}
            >
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Show Less' : `Show More (${recentActivities.length - INITIAL_ITEMS_TO_SHOW} more)`}
              </Text>
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={moderateScale(18)} 
                color={theme.colors.primary[500]} 
              />
            </TouchableOpacity>
          )}
        </>
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
