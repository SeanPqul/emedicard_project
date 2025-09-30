import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
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
          <Ionicons name={icon as any} size={moderateScale(48)} color={theme.colors.text.tertiary} />
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
    paddingHorizontal: scale(theme.spacing.xl),
    paddingVertical: verticalScale(theme.spacing.xxl),
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
  },
  iconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.md),
  },
  title: {
    fontSize: moderateScale(theme.typography.h4.fontSize),
    fontWeight: theme.typography.h4.fontWeight,
    lineHeight: moderateScale(theme.typography.h4.lineHeight),
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.sm),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(theme.typography.body.fontSize),
    lineHeight: moderateScale(24),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: verticalScale(theme.spacing.lg),
  },
  button: {
    backgroundColor: theme.colors.accent.medicalBlue,
    paddingHorizontal: scale(theme.spacing.lg),
    paddingVertical: verticalScale(theme.spacing.md),
    borderRadius: theme.borderRadius.md,
    minHeight: moderateScale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: moderateScale(theme.typography.button.fontSize),
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: moderateScale(theme.typography.button.lineHeight),
    color: theme.colors.text.inverse,
  },
});
