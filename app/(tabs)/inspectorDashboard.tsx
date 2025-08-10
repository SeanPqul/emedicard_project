import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/styles/theme';
import { StatCard } from '@/src/components/StatCard';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { useRoleBasedNavigation } from '@/src/hooks/useRoleBasedNavigation';
import { useRouter } from 'expo-router';

export default function InspectorDashboard() {
  const userProfile = useQuery(api.users.getCurrentUser);
  const { canAccessScreen } = useRoleBasedNavigation(userProfile?.role);
  const router = useRouter();

  React.useEffect(() => {
    if (userProfile && !canAccessScreen('inspectorDashboard')) {
      router.replace('/(tabs)');
    }
  }, [userProfile, canAccessScreen, router]);

  if (!userProfile) {
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

  if (userProfile.role !== 'inspector') {
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
            onPress={() => router.push('/(screens)/(inspector)/reviewApplications')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 16,
  },
  recentActivity: {
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: theme.colors.ui.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.semantic.error,
    marginBottom: 8,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
