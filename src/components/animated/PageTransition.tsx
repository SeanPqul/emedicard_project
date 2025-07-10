import React, { useEffect } from 'react';
import {
  Animated,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { useAnimation } from '@/src/hooks/useAnimation';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'slideUp';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

const { height: screenHeight } = Dimensions.get('window');

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  style,
}) => {
  const fadeAnimation = useAnimation(0);
  const slideAnimation = useAnimation(50);
  const scaleAnimation = useAnimation(0.95);

  useEffect(() => {
    const animateIn = async () => {
      // Wait for delay if specified
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      switch (type) {
        case 'fade':
          await fadeAnimation.animateTo(1, { duration });
          break;
        case 'slide':
          await Promise.all([
            fadeAnimation.animateTo(1, { duration }),
            slideAnimation.animateTo(0, { duration }),
          ]);
          break;
        case 'scale':
          await Promise.all([
            fadeAnimation.animateTo(1, { duration }),
            scaleAnimation.spring(1, { tension: 50, friction: 8 }),
          ]);
          break;
        case 'slideUp':
          slideAnimation.setValue(screenHeight);
          await Promise.all([
            fadeAnimation.animateTo(1, { duration }),
            slideAnimation.spring(0, { tension: 40, friction: 8 }),
          ]);
          break;
      }
    };

    animateIn();
  }, [type, duration, delay]);

  const getAnimatedStyle = (): any => {
    switch (type) {
      case 'fade':
        return {
          opacity: fadeAnimation.value,
        };
      case 'slide':
        return {
          opacity: fadeAnimation.value,
          transform: [{ translateX: slideAnimation.value }],
        };
      case 'scale':
        return {
          opacity: fadeAnimation.value,
          transform: [{ scale: scaleAnimation.value }],
        };
      case 'slideUp':
        return {
          opacity: fadeAnimation.value,
          transform: [{ translateY: slideAnimation.value }],
        };
      default:
        return {};
    }
  };

  return (
    <Animated.View style={[{ flex: 1 }, getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

// Stagger children animation component
interface StaggerChildrenProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerDelay = 100,
  animationType = 'fade',
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <PageTransition
          type={animationType}
          delay={index * staggerDelay}
          duration={300}
        >
          {child}
        </PageTransition>
      ))}
    </>
  );
};
