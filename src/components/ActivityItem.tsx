import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
      case 'success': return '#28A745';
      case 'error': return '#DC3545';
      case 'warning': return '#FFC107';
      default: return '#6C757D';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: getStatusColor() + '20' }]}>
        <Ionicons name={getActivityIcon() as any} size={16} color={getStatusColor()} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.description}>{activity.description}</Text>
        <Text style={styles.time}>
          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: '#6C757D',
  },
});
