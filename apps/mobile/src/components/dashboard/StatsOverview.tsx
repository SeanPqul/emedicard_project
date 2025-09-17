import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatCard } from '../stats';
import { getColor, getSpacing, getTypography } from '../../styles/theme';
import { DashboardStats } from '../../types';

interface StatsOverviewProps {
  dashboardStats: DashboardStats;
  currentApplication: any;
  showForNewUser: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  dashboardStats, 
  currentApplication,
  showForNewUser
}) => {
  if (showForNewUser) return null;

  const isFoodHandler = currentApplication?.jobCategory?.name?.toLowerCase().includes('food');
  
  const getFoodSafetyStatus = () => {
    if (!isFoodHandler) return { value: "Not Required", subtitle: "Non-food worker" };
    if (dashboardStats.upcomingOrientations > 0) return { value: "Scheduled", subtitle: "Attend scheduled session" };
    if (currentApplication?.orientationCompleted) return { value: "Completed", subtitle: "Requirements met" };
    return { value: "Required", subtitle: "Schedule required" };
  };

  const getFoodSafetyColor = () => {
    if (!isFoodHandler) return getColor('text.secondary');
    if (dashboardStats.upcomingOrientations > 0) return getColor('accent.warningOrange');
    if (currentApplication?.orientationCompleted) return getColor('accent.safetyGreen');
    return getColor('semantic.error');
  };

  const getFoodSafetyIcon = () => {
    if (!isFoodHandler) return 'checkmark-circle-outline';
    if (dashboardStats.upcomingOrientations > 0) return 'calendar';
    return 'calendar-outline';
  };

  const foodSafetyStatus = getFoodSafetyStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Overview</Text>
      
      <View style={styles.statsRow}>
        <StatCard
          icon="document-text-outline"
          title="Applications"
          value={dashboardStats.activeApplications.toString()}
          subtitle={dashboardStats.activeApplications > 0 ? "In progress" : "Ready to apply"}
          color={getColor('accent.medicalBlue')}
          onPress={() => router.push('/(tabs)/application')}
        />
        
        <StatCard
          icon={dashboardStats.pendingPayments > 0 ? "alert-circle-outline" : "checkmark-circle-outline"}
          title="Payments"
          value={dashboardStats.pendingPayments > 0 ? `${dashboardStats.pendingPayments} Due` : "Clear"}
          subtitle={dashboardStats.pendingPayments > 0 ? `₱${dashboardStats.pendingAmount} due` : "All payments up to date"}
          color={dashboardStats.pendingPayments > 0 ? getColor('semantic.error') : getColor('accent.safetyGreen')}
          onPress={() => router.push('/(screens)/(shared)/payment')}
        />
      </View>
      
      <View style={styles.statsRow}>
        <StatCard
          icon={getFoodSafetyIcon()}
          title="Food Safety"
          value={foodSafetyStatus.value}
          subtitle={foodSafetyStatus.subtitle}
          color={getFoodSafetyColor()}
          onPress={() => router.push('/(screens)/(shared)/orientation')}
        />
        
        <StatCard
          icon="shield-checkmark-outline"
          title="Health Cards"
          value={dashboardStats.validHealthCards.toString()}
          subtitle={dashboardStats.validHealthCards > 0 ? "Active" : "None issued"}
          color={getColor('accent.safetyGreen')}
          onPress={() => router.push('/(screens)/(shared)/health-cards')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
  },
  sectionTitle: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing('sm'),
  },
});
