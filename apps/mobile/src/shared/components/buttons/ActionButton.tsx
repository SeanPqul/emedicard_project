import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '@shared/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface ActionButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isPrimary?: boolean;
  style?: any;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  isPrimary = false,
  style 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isPrimary && styles.primaryContainer,
        style
      ]} 
      onPress={onPress}
      accessibilityLabel={`${title}: ${subtitle}`}
      accessibilityHint={`Tap to ${subtitle.toLowerCase()}`}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, isPrimary && styles.primaryIconContainer]}>
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={isPrimary ? getColor('text.inverse') : getColor('accent.medicalBlue')} 
        />
      </View>
      <Text style={[
        styles.title,
        isPrimary && styles.primaryTitle
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.subtitle,
        isPrimary && styles.primarySubtitle
      ]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 52) / 2,
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('md'),
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    ...getShadow('medium'),
  },
  primaryContainer: {
    backgroundColor: getColor('accent.medicalBlue'),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue') + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  primaryIconContainer: {
    backgroundColor: getColor('text.inverse') + '20',
  },
  title: {
    ...getTypography('bodySmall'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs') / 2,
    textAlign: 'center',
  },
  primaryTitle: {
    color: getColor('text.inverse'),
  },
  subtitle: {
    ...getTypography('caption'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    lineHeight: 16,
  },
  primarySubtitle: {
    color: getColor('text.inverse'),
    opacity: 0.8,
  },
});
