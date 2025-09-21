import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../../styles/theme';
import { DashboardStats } from '../../types';

interface HealthCardStatusProps {
  dashboardStats: DashboardStats;
}

export const HealthCardStatus: React.FC<HealthCardStatusProps> = ({ dashboardStats }) => {
  if (dashboardStats.validHealthCards === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Health Cards</Text>
      <TouchableOpacity 
        style={styles.cardPreview}
        onPress={() => router.push('/(screens)/(shared)/health-cards')}
        accessibilityLabel="View health cards"
      >
        <View style={styles.cardIcon}>
          <Ionicons name="shield-checkmark" size={32} color={getColor('accent.safetyGreen')} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {dashboardStats.validHealthCards} Active Health Card{dashboardStats.validHealthCards > 1 ? 's' : ''}
          </Text>
          <Text style={styles.cardSubtitle}>
            Tap to view, download, or show QR code
          </Text>
        </View>
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={20} color={getColor('text.secondary')} />
        </View>
      </TouchableOpacity>
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
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    ...getShadow('medium'),
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: getBorderRadius('md'),
    backgroundColor: getColor('accent.safetyGreen') + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing('md'),
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...getTypography('bodySmall'),
    color: getColor('text.primary'),
    fontWeight: '600',
    marginBottom: getSpacing('xs') / 2,
  },
  cardSubtitle: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
  },
  chevron: {
    marginLeft: getSpacing('sm'),
  },
});
