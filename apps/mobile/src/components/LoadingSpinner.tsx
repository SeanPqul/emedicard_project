import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColor, getTypography, getSpacing } from '../styles/theme';

interface LoadingSpinnerProps {
  visible?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  type?: 'spinner' | 'dots' | 'pulse';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullScreen?: boolean;
  progress?: number; // For progress indicators
  icon?: keyof typeof Ionicons.glyphMap;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible = true,
  size = 'medium',
  color = getColor('primary.500'),
  message,
  overlay = false,
  type = 'spinner',
  style,
  textStyle,
  fullScreen = false,
  progress,
  icon,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const dotAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start animations based on type
      if (type === 'spinner') {
        startSpinnerAnimation();
      } else if (type === 'dots') {
        startDotsAnimation();
      } else if (type === 'pulse') {
        startPulseAnimation();
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, type]);

  const startSpinnerAnimation = () => {
    const spinAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  };

  const startDotsAnimation = () => {
    const dotAnimations = dotAnims.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    });
    
    const combinedAnimation = Animated.stagger(0, dotAnimations);
    combinedAnimation.start();
    return () => combinedAnimation.stop();
  };

  const startPulseAnimation = () => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  };

  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 30;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  const renderSpinner = () => {
    const sizeValue = getSizeValue();
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.spinnerContainer,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <ActivityIndicator size={sizeValue} color={color} />
      </Animated.View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {dotAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: color,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.5],
                    }),
                  },
                ],
                opacity: anim,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderPulse = () => {
    return (
      <Animated.View
        style={[
          styles.pulseContainer,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim,
          },
        ]}
      >
        {icon ? (
          <Ionicons name={icon} size={getSizeValue()} color={color} />
        ) : (
          <View style={[styles.pulseCircle, { backgroundColor: color }]} />
        )}
      </Animated.View>
    );
  };

  const renderProgress = () => {
    if (progress === undefined) return null;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progress}%`, 
                backgroundColor: color 
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, textStyle]}>
          {Math.round(progress)}%
        </Text>
      </View>
    );
  };

  const renderLoading = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  const content = (
    <Animated.View
      style={[
        overlay ? styles.overlayContainer : styles.container,
        fullScreen && styles.fullScreenContainer,
        { opacity: fadeAnim },
        style,
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading content'}
      accessibilityLiveRegion="polite"
      accessibilityState={{
        busy: visible,
      }}
    >
      <View style={styles.loadingContent}>
        {renderLoading()}
        {message && (
          <Text 
            style={[styles.message, textStyle]}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
          >
            {message}
          </Text>
        )}
        {renderProgress()}
      </View>
    </Animated.View>
  );

  if (!visible) return null;

  if (overlay || fullScreen) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        statusBarTranslucent
        accessibilityViewIsModal={true}
        onRequestClose={() => {}} // Prevent closing during loading
      >
        {content}
      </Modal>
    );
  }

  return content;
};

// Skeleton loading component for lists
export const SkeletonLoader: React.FC<{
  count?: number;
  height?: number;
  style?: ViewStyle;
}> = ({ count = 3, height = 60, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.skeletonItem,
            {
              height,
              opacity: pulseAnim,
              marginBottom: index < count - 1 ? getSpacing('md') : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing('md'),
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  fullScreenContainer: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getColor('background.primary'),
    padding: getSpacing('xl'),
    borderRadius: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  spinnerContainer: {
    marginBottom: getSpacing('md'),
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing('md'),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  pulseContainer: {
    marginBottom: getSpacing('md'),
  },
  pulseCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  message: {
    ...getTypography('bodyMedium'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginTop: getSpacing('md'),
  },
  progressContainer: {
    width: '100%',
    marginTop: getSpacing('md'),
  },
  progressTrack: {
    height: 4,
    backgroundColor: getColor('border.light'),
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginTop: getSpacing('sm'),
  },
  skeletonItem: {
    backgroundColor: getColor('border.light'),
    borderRadius: 8,
  },
});
