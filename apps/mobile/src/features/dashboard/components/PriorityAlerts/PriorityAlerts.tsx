import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PriorityAlertsProps } from '@features/dashboard/types';
import { styles } from './PriorityAlerts.styles';

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({ 
  dashboardStats, 
  currentApplication 
}) => {
  const hasPendingPayments = dashboardStats.pendingPayments > 0;
  
  // Check if orientation is required based on job category
  const isFoodHandler = currentApplication?.jobCategory?.name?.toLowerCase().includes('food');
  const requiresOrientation = isFoodHandler && currentApplication?.jobCategory?.requireOrientation;
  // TODO: Check orientation completion status from backend
  const hasNotCompletedOrientation = false; // requiresOrientation && !currentApplication?.orientationCompleted;
  
  const showAlerts = hasPendingPayments || hasNotCompletedOrientation;

  if (!showAlerts) return null;

  const handlePaymentPress = () => {
    router.push('/(screens)/(shared)/payment');
  };

  const handleOrientationPress = () => {
    router.push('/(screens)/(shared)/orientation');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="alert-circle" size={20} color={styles.headerIcon.color} />
        <Text style={styles.title}>Action Required</Text>
      </View>
      
      {hasPendingPayments && (
        <TouchableOpacity 
          style={styles.alertItem}
          onPress={handlePaymentPress}
          accessibilityLabel={`Pay ${dashboardStats.pendingAmount} pesos to proceed with your application`}
        >
          <Text style={styles.alertText}>
            Pay ₱{dashboardStats.pendingAmount.toFixed(2)} to proceed with your application
          </Text>
          <Ionicons name="chevron-forward" size={16} color={styles.chevronIcon.color} />
        </TouchableOpacity>
      )}
      
      {hasNotCompletedOrientation && (
        <TouchableOpacity 
          style={styles.alertItem}
          onPress={handleOrientationPress}
          accessibilityLabel="Schedule your required food safety orientation"
        >
          <Text style={styles.alertText}>
            Schedule your required food safety orientation
          </Text>
          <Ionicons name="chevron-forward" size={16} color={styles.chevronIcon.color} />
        </TouchableOpacity>
      )}
    </View>
  );
};