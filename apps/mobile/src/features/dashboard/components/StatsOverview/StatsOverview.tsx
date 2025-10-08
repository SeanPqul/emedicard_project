import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatCard } from '@features/dashboard/components/StatCard';
import { StatsOverviewProps } from '@features/dashboard/types';
import { styles } from './StatsOverview.styles';
import { theme } from '@shared/styles/theme';

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  dashboardStats, 
  currentApplication,
  showForNewUser
}) => {
  if (showForNewUser) return null;

  const isFoodHandler = currentApplication?.jobCategory?.name?.toLowerCase().includes('food');
  
  const getFoodSafetyStatus = () => {
    if (!isFoodHandler) return { value: "Not Required", subtitle: "Non-food worker" };
    // TODO: Check orientation completion status from backend
    // if (currentApplication?.orientationCompleted) return { value: "Completed", subtitle: "Requirements met" };
    return { value: "Required", subtitle: "Schedule required" };
  };

  const getFoodSafetyColor = () => {
    if (!isFoodHandler) return theme.colors.text.secondary;
    // TODO: Check orientation completion status from backend
    // if (currentApplication?.orientationCompleted) return theme.colors.status.success;
    return theme.colors.status.error;
  };

  const getFoodSafetyIcon = () => {
    if (!isFoodHandler) return 'checkmark-circle-outline';
    // TODO: Check orientation completion status from backend
    // if (currentApplication?.orientationCompleted) return 'checkmark-circle';
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
          color={theme.colors.blue[500]}
          onPress={() => router.push('/(tabs)/application')}
        />
        
        <StatCard
          icon={dashboardStats.pendingPayments > 0 ? "alert-circle-outline" : "checkmark-circle-outline"}
          title="Payments"
          value={dashboardStats.pendingPayments > 0 ? `${dashboardStats.pendingPayments} Due` : "Clear"}
          subtitle={dashboardStats.pendingPayments > 0 ? `₱${dashboardStats.pendingAmount.toFixed(2)} due` : "All payments up to date"}
          color={dashboardStats.pendingPayments > 0 ? theme.colors.status.error : theme.colors.status.success}
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
          color={theme.colors.status.success}
          onPress={() => router.push('/(screens)/(shared)/health-cards')}
        />
      </View>
    </View>
  );
};
