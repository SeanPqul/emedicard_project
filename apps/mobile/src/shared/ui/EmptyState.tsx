import { getBorderRadius, getColor, getSpacing, getTypography } from '@/src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionText,
  onActionPress,
}) => {
  return (
    <View 
      style={styles.container}
      accessibilityLabel={`${title}: ${subtitle}`}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={48} color={getColor('text.tertiary')} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onActionPress}
          accessibilityLabel={actionText}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing('xl'),
    paddingVertical: getSpacing('xxl'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('background.secondary'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  title: {
    ...getTypography('h4'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
    textAlign: 'center',
  },
  subtitle: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginBottom: getSpacing('lg'),
    lineHeight: 24,
  },
  button: {
    backgroundColor: getColor('accent.medicalBlue'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    borderRadius: getBorderRadius('md'),
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...getTypography('button'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
});
