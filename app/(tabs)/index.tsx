import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StatCard, ActionButton, ActivityItem, EmptyState } from '../../src/components';
import { styles } from '../../assets/styles/tabs-styles/dashboard';

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
              icon="document-text-outline"
              title="Document Requirements"
              subtitle="View required documents"
              onPress={() => router.push('/document-requirements')}
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
            <ActionButton
              icon="settings-outline"
              title="Admin - Seed DB"
              subtitle="Setup database"
              onPress={() => router.push('/admin-seed')}
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
            <EmptyState
              icon="document-outline"
              title="No recent activity"
              subtitle="Your activities will appear here"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Functions
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};
