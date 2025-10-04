import { 
  cardVariants,
  colorWithOpacity
} from '@shared/styles';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
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

/**
 * StatCard Component - Interactive statistics display card
 * 
 * REFACTORED: Enhanced touch target size and visual prominence
 * - Minimum height increased to 140px for better touch accessibility
 * - Added activeOpacity for better touch feedback
 * - Icon background uses 20% opacity of accent color
 * 
 * @param {StatCardProps} props - Component props
 * @returns {React.ReactElement} Rendered stat card
 */
export const StatCard: React.FC<StatCardProps> = React.memo(({
  icon,
  title,
  value,
  subtitle,
  color,
  onPress,
}) => {
  // Create background color with opacity
  const getBackgroundColor = (color: string) => {
    // If it's already a hex color, append opacity
    if (color.startsWith('#')) {
      return color + '20';
    }
    // Try to get color with opacity from theme
    return colorWithOpacity[20](color) || color + '20';
  };

  return (
    <TouchableOpacity 
      style={[cardVariants.base, cardVariants.interactive, styles.container]} 
      onPress={onPress}
      accessibilityLabel={`${title}: ${value} ${subtitle}`}
      accessibilityHint={`Tap to view ${title.toLowerCase()}`}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      <View style={[styles.icon, { backgroundColor: getBackgroundColor(color) }]}>
        <Ionicons name={icon as any} size={moderateScale(24)} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
});

StatCard.displayName = 'StatCard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: scale(theme.spacing.xs),
    minHeight: moderateScale(140),
    justifyContent: 'center',
    // Enhanced touch target
    minWidth: moderateScale(150),
  },
  icon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(theme.spacing.sm),
  },
  value: {
    fontSize: moderateScale(theme.typography.h2.fontSize),
    fontWeight: '700',
    lineHeight: moderateScale(theme.typography.h2.lineHeight),
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs),
  },
  title: {
    fontSize: moderateScale(theme.typography.bodySmall.fontSize),
    fontWeight: '600',
    lineHeight: moderateScale(theme.typography.bodySmall.lineHeight),
    color: theme.colors.text.primary,
    marginBottom: verticalScale(theme.spacing.xs / 2),
  },
  subtitle: {
    fontSize: moderateScale(theme.typography.caption.fontSize),
    lineHeight: moderateScale(16),
    color: theme.colors.text.secondary,
  },
});
