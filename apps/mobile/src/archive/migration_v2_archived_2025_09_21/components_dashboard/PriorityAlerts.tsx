import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBorderRadius, getColor, getSpacing, getTypography, getShadow } from '../../styles/theme';
import { DashboardStats } from '../../types';

interface PriorityAlertsProps {
  dashboardStats: DashboardStats;
  currentApplication: any;
}

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({ 
  dashboardStats, 
  currentApplication 
}) => {
  const isFoodHandler = currentApplication?.jobCategory?.name?.toLowerCase().includes('food');
  const needsOrientation = isFoodHandler && (
    dashboardStats.upcomingOrientations > 0 || 
    (!currentApplication?.orientationCompleted && !dashboardStats.upcomingOrientations)
  );
  
  const showAlerts = dashboardStats.pendingPayments > 0 || needsOrientation;

  if (!showAlerts) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="alert-circle" size={20} color={getColor('semantic.error')} />
        <Text style={styles.title}>Action Required</Text>
      </View>
      
      {dashboardStats.pendingPayments > 0 && (
        <TouchableOpacity 
          style={styles.alertItem}
          onPress={() => router.push('/(screens)/(shared)/payment')}
        >
          <Text style={styles.alertText}>
            Pay ₱{dashboardStats.pendingAmount} to proceed with your application
          </Text>
          <Ionicons name="chevron-forward" size={16} color={getColor('semantic.error')} />
        </TouchableOpacity>
      )}
      
      {needsOrientation && (
        <TouchableOpacity 
          style={styles.alertItem}
          onPress={() => router.push('/(screens)/(shared)/orientation')}
        >
          <Text style={styles.alertText}>
            {dashboardStats.upcomingOrientations > 0 
              ? "Attend your scheduled food safety orientation"
              : "Schedule your required food safety orientation"
            }
          </Text>
          <Ionicons name="chevron-forward" size={16} color={getColor('semantic.error')} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: getSpacing('lg'),
    marginVertical: getSpacing('sm'),
    padding: getSpacing('md'),
    backgroundColor: getColor('semantic.error') + '10',
    borderRadius: getBorderRadius('lg'),
    borderWidth: 1,
    borderColor: getColor('semantic.error') + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
    gap: getSpacing('xs'),
  },
  title: {
    ...getTypography('bodySmall'),
    color: getColor('semantic.error'),
    fontWeight: '600',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing('xs'),
  },
  alertText: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    flex: 1,
  },
});
