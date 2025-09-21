import { getBorderRadius, getColor, getSpacing, getTypography } from '@/src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  message?: string; // Alternative to subtitle for compatibility
  actionText?: string;
  onAction?: () => void; // Test compatibility alias
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'information-circle-outline',
  title,
  subtitle,
  message,
  actionText,
  onAction,
  onActionPress,
}) => {
  // Use message as fallback for subtitle for compatibility
  const displaySubtitle = subtitle || message;
  // Use onAction as fallback for onActionPress for compatibility
  const handleAction = onActionPress || onAction;
  return (
    <View 
      style={styles.container}
      accessibilityLabel={`${title}: ${displaySubtitle}`}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={48} color={getColor('text.tertiary')} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {displaySubtitle && (
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
      )}
      {actionText && handleAction && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAction}
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
