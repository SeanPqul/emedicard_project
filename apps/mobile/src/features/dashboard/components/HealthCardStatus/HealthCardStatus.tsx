import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { HealthCardStatusProps } from '@features/dashboard/types';
import { styles } from './HealthCardStatus.styles';

export const HealthCardStatus: React.FC<HealthCardStatusProps> = ({ dashboardStats }) => {
  if (dashboardStats.validHealthCards === 0) return null;

  const handleViewCards = () => {
    router.push('/(screens)/(shared)/health-cards');
  };

  const getCardText = () => {
    const count = dashboardStats.validHealthCards;
    return `${count} Active Health Card${count > 1 ? 's' : ''}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Health Cards</Text>
      <TouchableOpacity 
        style={styles.cardPreview}
        onPress={handleViewCards}
        accessibilityLabel="View health cards"
        accessibilityHint="Tap to view, download, or show QR code"
      >
        <View style={styles.cardIcon}>
          <Ionicons 
            name="shield-checkmark" 
            size={32} 
            color={styles.icon.color} 
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {getCardText()}
          </Text>
          <Text style={styles.cardSubtitle}>
            Tap to view, download, or show QR code
          </Text>
        </View>
        <View style={styles.chevron}>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={styles.chevronIcon.color} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};