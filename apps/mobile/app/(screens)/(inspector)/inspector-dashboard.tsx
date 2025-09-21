import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/styles/theme';
import { StatCard } from '@/src/features/dashboard/components';
import { LoadingSpinner } from '@/src/shared/components';
import { useRoleBasedNavigation } from '@/src/hooks/useRoleBasedNavigation';
import { useRouter } from 'expo-router';
import { User } from '@/src/types/domain/user';
import { useUsers } from '../../../src/hooks/useUsers';
import { styles } from '@/src/styles/screens/inspector-dashboard';

export default function InspectorDashboard() {
  // Use new hooks pattern
  const { data: { currentUser: userProfile }, isLoading: loading } = useUsers();
  const { canAccessScreen } = useRoleBasedNavigation(userProfile?.role);
  const router = useRouter();

  React.useEffect(() => {
    if (userProfile && !canAccessScreen('inspector-dashboard')) {
      router.replace('/(tabs)');
    }
  }, [userProfile, canAccessScreen, router]);

  if (loading) {
    return (
      <LoadingSpinner 
        visible={true} 
        message="Loading inspector dashboard..." 
        fullScreen 
        type="pulse" 
        icon="clipboard" 
      />
    );
  }

  if (!userProfile || userProfile.role !== 'inspector') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>Access Denied</Text>
          <Text style={styles.unauthorizedSubtext}>
            Inspector access required.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Inspector Dashboard</Text>
          <Text style={styles.subtitle}>Review & Approve Applications</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            icon="clipboard"
            title="Pending Review"
            value="42"
            subtitle="Applications"
            color={theme.colors.semantic.warning}
            onPress={() => router.push('/(screens)/(inspector)/review-applications')}
          />
          
          <StatCard
            icon="list"
            title="Queue"
            value="15"
            subtitle="Awaiting inspection"
            color={theme.colors.secondary[500]}
            onPress={() => router.push('/(screens)/(inspector)/inspection-queue')}
          />
          
          <StatCard
            icon="checkmark-circle"
            title="Completed"
            value="128"
            subtitle="This week"
            color={theme.colors.semantic.success}
            onPress={() => {}}
          />
          
          <StatCard
            icon="scan"
            title="Scanner"
            value="Ready"
            subtitle="QR Code scanner"
            color={theme.colors.primary[500]}
            onPress={() => router.push('/(screens)/(inspector)/scanner')}
          />
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.placeholderText}>
              Recent inspection activities will be displayed here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

