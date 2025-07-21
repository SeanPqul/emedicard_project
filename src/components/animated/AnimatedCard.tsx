import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  ViewStyle,
  StyleSheet,
  Platform,
} from 'react-native';
import { theme } from '@/src/styles/theme';
import { useAnimation } from '@/src/hooks/useAnimation';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  elevation?: number;
  borderRadius?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  elevation = 4,
  borderRadius = theme.borderRadius.lg,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scaleAnimation = useAnimation(1);
  const elevationAnimation = useAnimation(elevation);

  const handlePressIn = async () => {
    if (disabled) return;
    
    // Material Design press feedback
    await Promise.all([
      scaleAnimation.spring(0.98, {
        tension: 100,
        friction: 10,
      }),
      elevationAnimation.animateTo(elevation * 0.5, {
        duration: 150,
      }),
    ]);
  };

  const handlePressOut = async () => {
    if (disabled) return;
    
    await Promise.all([
      scaleAnimation.spring(1, {
        tension: 40,
        friction: 7,
      }),
      elevationAnimation.animateTo(elevation, {
        duration: 150,
      }),
    ]);
    
    if (onPress) onPress();
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnimation.value }],
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.ui.black,
        shadowOffset: {
          width: 0,
          height: elevationAnimation.value.interpolate({
            inputRange: [0, elevation],
            outputRange: [0, elevation / 2],
          }),
        },
        shadowOpacity: elevationAnimation.value.interpolate({
          inputRange: [0, elevation],
          outputRange: [0, 0.2],
        }),
        shadowRadius: elevationAnimation.value.interpolate({
          inputRange: [0, elevation],
          outputRange: [0, elevation],
        }),
      },
      android: {
        elevation: elevationAnimation.value,
      },
    }),
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <Animated.View
        style={[
          styles.card,
          { borderRadius },
          animatedStyle,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
  },
});
