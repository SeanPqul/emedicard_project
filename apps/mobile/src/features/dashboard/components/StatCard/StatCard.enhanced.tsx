import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { styles } from './StatCard.enhanced.styles';

interface StatCardEnhancedProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
  color?: string;
  gradient?: [string, string];
  onPress: () => void;
  progress?: {
    current: number;
    total: number;
  };
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  badge?: {
    text: string;
    color: string;
  };
}

export const StatCardEnhanced: React.FC<StatCardEnhancedProps> = ({
  icon,
  title,
  value,
  subtitle,
  color,
  gradient,
  onPress,
  progress,
  trend,
  badge,
}) => {
  const cardColor = gradient ? gradient[0] : (color || '#10B981');
  
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove-outline';
    }
  };

  const getTrendColor = () => {
    if (!trend) return theme.colors.text.secondary;
    switch (trend.direction) {
      case 'up':
        return theme.colors.semantic.success;
      case 'down':
        return theme.colors.semantic.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.85 },
      ]}
      onPress={onPress}
      android_ripple={{ color: 'transparent' }}
      accessibilityLabel={`${title}: ${value} ${subtitle}`}
      accessibilityHint={`Tap to view ${title.toLowerCase()}`}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={gradient || [cardColor, cardColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Header with Icon and Badge */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={icon as any} 
              size={moderateScale(28)} 
              color={theme.colors.ui.white}
            />
          </View>
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeText}>{badge.text}</Text>
            </View>
          )}
        </View>

        {/* Value Section */}
        <View style={styles.valueSection}>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {value}
          </Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={getTrendIcon() as any} 
                size={moderateScale(16)} 
                color={theme.colors.ui.white}
              />
              <Text style={styles.trendText}>{trend.value}</Text>
            </View>
          )}
        </View>

        {/* Title and Subtitle */}
        <View style={styles.textSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>

        {/* Progress Bar if provided */}
        {progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(progress.current / progress.total) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress.current} of {progress.total}
            </Text>
          </View>
        )}

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle} />
      </LinearGradient>

      {/* Action Indicator */}
      <View style={styles.actionIndicator}>
        <Ionicons 
          name="chevron-forward" 
          size={moderateScale(20)} 
          color={color || '#10B981'}
        />
      </View>
    </Pressable>
  );
};

// Export a set of preset stat cards for common use cases
export const PresetStatCards = {
  Applications: (props: Partial<StatCardEnhancedProps>) => (
    <StatCardEnhanced
      icon="document-text"
      title="Applications"
      gradient={[theme.colors.blue[500], theme.colors.blue[600]]}
      {...props}
      value={props.value || '0'}
      subtitle={props.subtitle || 'View all applications'}
      onPress={props.onPress || (() => {})}
    />
  ),
  
  HealthCards: (props: Partial<StatCardEnhancedProps>) => (
    <StatCardEnhanced
      icon="shield-checkmark"
      title="Health Cards"
      gradient={[theme.colors.primary[500], theme.colors.primary[600]]}
      {...props}
      value={props.value || '0'}
      subtitle={props.subtitle || 'Active cards'}
      onPress={props.onPress || (() => {})}
    />
  ),

  DocumentVerification: (props: Partial<StatCardEnhancedProps>) => (
    <StatCardEnhanced
      icon="shield-checkmark-outline"
      title="Document Status"
      gradient={[theme.colors.indigo[500], theme.colors.indigo[600]]}
      {...props}
      value={props.value || '-'}
      subtitle={props.subtitle || 'No documents yet'}
      onPress={props.onPress || (() => {})}
    />
  ),

  HealthCard: (props: Partial<StatCardEnhancedProps>) => (
    <StatCardEnhanced
      icon="shield-checkmark"
      title="Health Card"
      gradient={[theme.colors.primary[500], theme.colors.primary[600]]}
      {...props}
      value={props.value || '-'}
      subtitle={props.subtitle || 'No active card'}
      onPress={props.onPress || (() => {})}
    />
  ),

};
