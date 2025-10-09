import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BaseScreenLayout } from '@/src/shared/components/layout/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { EmptyState } from '@shared/components';
import { getColor } from '@shared/styles/theme';
import { styles } from '@shared/styles/screens/shared-activity';
import { 
  Activity,
  getActivityIcon,
  getActivityStatusColor,
  formatTimestamp
} from '@entities/activity';
import { ACTIVITY_FILTERS } from '@features/activity/constants';
import { useDashboardData } from '@features/dashboard/hooks/useDashboardData';

export function ActivityScreen() {
  const [filter, setFilter] = useState<string>('all');
  const dashboardData = useDashboardData();

  // Transform recentActivities to Activity format
  const activities: Activity[] = dashboardData.recentActivities?.map((activity) => ({
    id: activity.id,
    userId: activity.userId,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    timestamp: activity.timestamp instanceof Date ? activity.timestamp : new Date(activity.timestamp),
    status: activity.status,
    metadata: activity.metadata,
  })) || [];

  const filters = ACTIVITY_FILTERS;

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => {
        // Match based on activity type patterns
        if (filter === 'application') {
          return activity.type.startsWith('application_');
        }
        if (filter === 'payment') {
          return activity.type.startsWith('payment_');
        }
        if (filter === 'card_issued') {
          return activity.type === 'health_card_issued';
        }
        return activity.type === filter;
      });


  return (
    <BaseScreenLayout>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContainer}
        >
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[
                styles.filterTab,
                filter === filterItem.id && styles.filterTabActive,
              ]}
              onPress={() => setFilter(filterItem.id)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === filterItem.id && styles.filterTabTextActive,
                ]}
              >
                {filterItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {dashboardData.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={getColor('primary.500')} />
            <Text style={styles.loadingText}>Loading activities...</Text>
          </View>
        ) : filteredActivities.length > 0 ? (
          <View style={styles.activityList}>
            {filteredActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: getActivityStatusColor(activity.status) + '20' }]}>
                  <Ionicons 
                    name={getActivityIcon(activity.type) as any} 
                    size={20} 
                    color={getActivityStatusColor(activity.status)} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>
                      {formatTimestamp(activity.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getActivityStatusColor(activity.status) }]}>
                    <Text style={styles.statusText}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="time-outline"
            title="No Activities"
            subtitle="No activities found for the selected filter."
          />
        )}
      </ScrollView>
    </BaseScreenLayout>
  );
}

