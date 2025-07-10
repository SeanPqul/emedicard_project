import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { EmptyState } from '../src/components';

interface Activity {
  id: string;
  type: 'application' | 'payment' | 'orientation' | 'card_issued' | 'document_upload';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

export default function ActivityScreen() {
  const [filter, setFilter] = useState<string>('all');

  // Mock data - replace with Convex queries
  const activities: Activity[] = [
    {
      id: '1',
      type: 'application',
      title: 'Application Submitted',
      description: 'Food Handler health card application',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Processed',
      description: '₱60 payment via GCash',
      timestamp: '2024-01-15T11:00:00Z',
      status: 'success',
    },
    {
      id: '3',
      type: 'document_upload',
      title: 'Documents Uploaded',
      description: 'Medical certificate and ID uploaded',
      timestamp: '2024-01-15T11:30:00Z',
      status: 'success',
    },
    {
      id: '4',
      type: 'application',
      title: 'Application Under Review',
      description: 'Your application is being reviewed',
      timestamp: '2024-01-16T09:00:00Z',
      status: 'pending',
    },
    {
      id: '5',
      type: 'card_issued',
      title: 'Health Card Issued',
      description: 'Your health card is ready for download',
      timestamp: '2024-01-18T14:00:00Z',
      status: 'success',
    },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'application', label: 'Applications' },
    { id: 'payment', label: 'Payments' },
    { id: 'card_issued', label: 'Cards' },
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return 'document-text-outline';
      case 'payment':
        return 'card-outline';
      case 'orientation':
        return 'calendar-outline';
      case 'card_issued':
        return 'shield-checkmark-outline';
      case 'document_upload':
        return 'cloud-upload-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#28A745';
      case 'error':
        return '#DC3545';
      case 'warning':
        return '#FFC107';
      default:
        return '#6C757D';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
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
        {filteredActivities.length > 0 ? (
          <View style={styles.activityList}>
            {filteredActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: getStatusColor(activity.status) + '20' }]}>
                  <Ionicons 
                    name={getActivityIcon(activity.type) as any} 
                    size={20} 
                    color={getStatusColor(activity.status)} 
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
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activity.status) }]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  filterTabActive: {
    backgroundColor: '#2E86AB',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  activityList: {
    paddingVertical: 16,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
