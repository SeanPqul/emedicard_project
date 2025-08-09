import React, { useEffect } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/src/styles/theme';
import { useAnimation } from '@/src/hooks/useAnimation';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  variant = 'text',
  animation = 'pulse',
}) => {
  const pulseAnimation = useAnimation(0.3);
  const waveAnimation = useAnimation(-1);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (animation === 'pulse') {
      // Pulse animation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation.value, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation.value, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    } else if (animation === 'wave') {
      // Wave animation
      const waveLoop = Animated.loop(
        Animated.timing(waveAnimation.value, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      waveLoop.start();

      return () => waveLoop.stop();
    }
  }, [animation]);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'circular':
        return {
          width: height,
          height: height,
          borderRadius: height / 2,
        };
      case 'rectangular':
        return {
          width,
          height,
          borderRadius: borderRadius || theme.borderRadius.md,
        };
      case 'text':
      default:
        return {
          width,
          height,
          borderRadius: borderRadius || theme.borderRadius.sm,
        };
    }
  };

  const renderContent = () => {
    if (animation === 'pulse') {
      return (
        <Animated.View
          style={[
            styles.skeleton,
            getVariantStyles(),
            { opacity: pulseAnimation.value },
            style,
          ]}
        />
      );
    } else if (animation === 'wave') {
      return (
        <View style={[styles.skeleton, getVariantStyles(), style]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                transform: [{
                  translateX: waveAnimation.value.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-screenWidth, screenWidth],
                  }),
                }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                theme.colors.background.tertiary,
                theme.colors.gray[200],
                theme.colors.background.tertiary,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            />
          </Animated.View>
        </View>
      );
    } else {
      return (
        <View style={[styles.skeleton, getVariantStyles(), style]} />
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
};

// Skeleton group for multiple items
interface SkeletonGroupProps {
  count?: number;
  children: React.ReactElement<SkeletonLoaderProps>;
  spacing?: number;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  count = 3,
  children,
  spacing = theme.spacing.sm,
}) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ marginBottom: index < count - 1 ? spacing : 0 }}>
          {React.cloneElement(children)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  skeleton: {
    backgroundColor: theme.colors.background.tertiary,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
});
