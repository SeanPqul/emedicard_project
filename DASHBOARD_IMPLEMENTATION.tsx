import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

// Types for our data
interface DashboardStats {
  activeApplications: number;
  pendingPayments: number;
  upcomingOrientations: number;
  validHealthCards: number;
  pendingAmount: number;
  nextOrientationDate?: string;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'payment' | 'orientation' | 'card_issued';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

export default function Dashboard() {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Convex queries
  const userProfile = useQuery(api.users.getCurrentUser);
  const userApplications = useQuery(api.forms.getUserApplications);
  const userNotifications = useQuery(api.notifications.getUserNotifications);
  const userPayments = useQuery(api.payments.getUserPayments);
  const userHealthCards = useQuery(api.healthCards.getUserHealthCards);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate dashboard stats
  const getDashboardStats = (): DashboardStats => {
    const activeApplications = userApplications?.filter(app => 
      app.status === 'Submitted' || app.status === 'Under Review'
    ).length || 0;

    const pendingPayments = userPayments?.filter(payment => 
      payment.status === 'Pending'
    ).length || 0;

    const pendingAmount = userPayments?.filter(payment => 
      payment.status === 'Pending'
    ).reduce((sum, payment) => sum + payment.netAmount, 0) || 0;

    const validHealthCards = userHealthCards?.filter(card => 
      card.expiresAt > Date.now()
    ).length || 0;

    const upcomingOrientations = 0; // TODO: Implement orientations query

    return {
      activeApplications,
      pendingPayments,
      upcomingOrientations,
      validHealthCards,
      pendingAmount,
    };
  };

  // Get recent activities
  const getRecentActivities = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    // Add from notifications
    userNotifications?.slice(0, 3).forEach(notification => {
      activities.push({
        id: notification._id,
        type: 'application',
        title: notification.messag, // Note: typo in schema
        description: `Notification received`,
        timestamp: new Date().toISOString(), // TODO: Add timestamp to schema
        status: 'pending'
      });
    });

    // Add from payments
    userPayments?.slice(0, 2).forEach(payment => {
      activities.push({
        id: payment._id,
        type: 'payment',
        title: `Payment ${payment.status}`,
        description: `₱${payment.netAmount} via ${payment.method}`,
        timestamp: new Date().toISOString(),
        status: payment.status === 'Complete' ? 'success' : payment.status === 'Failed' ? 'error' : 'pending'
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refetch data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const stats = getDashboardStats();
  const recentActivities = getRecentActivities();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profilePicture}>
              <Image
                source={{ uri: user?.imageUrl || userProfile?.image }}
                style={styles.profileImage}
                placeholder="👤"
              />
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Good {getGreeting()}</Text>
              <Text style={styles.userName}>{user?.fullName || userProfile?.fullname}</Text>
              <Text style={styles.currentTime}>
                {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/(tabs)/notification')}>
            <Ionicons name="notifications-outline" size={24} color="#212529" />
            {(userNotifications?.filter(n => !n.read).length || 0) > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {userNotifications?.filter(n => !n.read).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              icon="document-text-outline"
              title="Active Applications"
              value={stats.activeApplications.toString()}
              subtitle="In progress"
              color="#2E86AB"
              onPress={() => router.push('/(tabs)/application')}
            />
            <StatCard
              icon="card-outline"
              title="Pending Payments"
              value={stats.pendingPayments.toString()}
              subtitle={`₱${stats.pendingAmount}`}
              color="#F18F01"
              onPress={() => router.push('/payment')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="calendar-outline"
              title="Upcoming Orientations"
              value={stats.upcomingOrientations.toString()}
              subtitle={stats.nextOrientationDate || "None scheduled"}
              color="#A23B72"
              onPress={() => router.push('/orientation')}
            />
            <StatCard
              icon="shield-checkmark-outline"
              title="Valid Health Cards"
              value={stats.validHealthCards.toString()}
              subtitle="Active cards"
              color="#28A745"
              onPress={() => router.push('/health-cards')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="add-circle-outline"
              title="New Application"
              subtitle="Apply for health card"
              onPress={() => router.push('/(tabs)/apply')}
              isPrimary
            />
            <ActionButton
              icon="cloud-upload-outline"
              title="Upload Documents"
              subtitle="Submit requirements"
              onPress={() => router.push('/upload-documents')}
            />
            <ActionButton
              icon="card-outline"
              title="Make Payment"
              subtitle="Pay application fees"
              onPress={() => router.push('/payment')}
            />
            <ActionButton
              icon="qr-code-outline"
              title="View QR Code"
              subtitle="Show health card QR"
              onPress={() => router.push('/qr-code')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/activity')}>
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
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#6C757D" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateSubtext}>Your activities will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
const StatCard = ({ icon, title, value, subtitle, color, onPress }: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.statCard} onPress={onPress}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const ActionButton = ({ icon, title, subtitle, onPress, isPrimary = false }: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isPrimary?: boolean;
}) => (
  <TouchableOpacity 
    style={[styles.actionButton, isPrimary && styles.primaryActionButton]} 
    onPress={onPress}
  >
    <Ionicons 
      name={icon as any} 
      size={24} 
      color={isPrimary ? "#FFFFFF" : "#2E86AB"} 
    />
    <Text style={[styles.actionTitle, isPrimary && styles.primaryActionTitle]}>
      {title}
    </Text>
    <Text style={[styles.actionSubtitle, isPrimary && styles.primaryActionSubtitle]}>
      {subtitle}
    </Text>
  </TouchableOpacity>
);

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
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
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: getStatusColor() + '20' }]}>
        <Ionicons name={getActivityIcon() as any} size={16} color={getStatusColor()} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        <Text style={styles.activityTime}>
          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

// Helper Functions
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '400',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginTop: 2,
  },
  currentTime: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6C757D',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionButton: {
    backgroundColor: '#2E86AB',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginTop: 8,
    textAlign: 'center',
  },
  primaryActionTitle: {
    color: '#FFFFFF',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
    textAlign: 'center',
  },
  primaryActionSubtitle: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  recentActivityContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#6C757D',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
});
