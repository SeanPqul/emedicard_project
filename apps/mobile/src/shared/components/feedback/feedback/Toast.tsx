import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/styles/theme';
import { verticalScale } from '@shared/utils/responsive';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  position?: 'top' | 'bottom';
  actionLabel?: string;
  onActionPress?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
  position = 'bottom',
  actionLabel,
  onActionPress,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const hideTimer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(hideTimer);
    }
    return undefined;
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) {
        onHide();
      }
    });
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = (): string => {
    switch (type) {
      case 'success':
        return theme.colors.semantic.success;
      case 'error':
        return theme.colors.semantic.error;
      case 'warning':
        return theme.colors.semantic.warning;
      case 'info':
      default:
        return theme.colors.semantic.info;
    }
  };

  if (!visible) return null;

  const containerStyle: ViewStyle = position === 'top' 
    ? styles.containerTop 
    : styles.containerBottom;

  return (
    <SafeAreaView style={containerStyle} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor() },
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${type} notification: ${message}`}
      >
        <Ionicons
          name={getIcon()}
          size={24}
          color={theme.colors.ui.white}
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {actionLabel && (
          <TouchableOpacity
            onPress={() => {
              if (onActionPress) onActionPress();
              hide();
            }}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  containerBottom: {
    position: 'absolute',
    bottom: verticalScale(80), // Add padding above tab bar
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.large,
    maxWidth: '90%',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.ui.white,
  },
  actionButton: {
    marginLeft: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  actionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.ui.white,
    fontWeight: '600',
  },
});
