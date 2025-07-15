import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '@/src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color, 
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      accessibilityLabel={`${title}: ${value} ${subtitle}`}
      accessibilityHint={`Tap to view ${title.toLowerCase()}`}
      accessibilityRole="button"
    >
      <View style={[styles.icon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginHorizontal: getSpacing('xs'),
    minHeight: 120,
    justifyContent: 'center',
    ...getShadow('medium'),
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: getBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  value: {
    ...getTypography('h2'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
    fontWeight: '700',
  },
  title: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs') / 2,
  },
  subtitle: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    lineHeight: 16,
  },
});
