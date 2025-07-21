import { useRef, useEffect } from 'react';
import { Animated, Easing, AccessibilityInfo } from 'react-native';

interface AnimationConfig {
  duration?: number;
  easing?: (value: number) => number;
  delay?: number;
  useNativeDriver?: boolean;
}

interface AnimationHook {
  value: Animated.Value;
  animateTo: (toValue: number, config?: AnimationConfig) => Promise<void>;
  spring: (toValue: number, config?: Partial<Animated.SpringAnimationConfig>) => Promise<void>;
  sequence: (animations: Animated.CompositeAnimation[]) => Promise<void>;
  parallel: (animations: Animated.CompositeAnimation[]) => Promise<void>;
  loop: (animation: Animated.CompositeAnimation, iterations?: number) => void;
  stop: () => void;
  reset: () => void;
  setValue: (value: number) => void;
}

export const useAnimation = (initialValue: number = 0): AnimationHook => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;
  const isReducedMotionEnabled = useRef(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      isReducedMotionEnabled.current = enabled;
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      enabled => {
        isReducedMotionEnabled.current = enabled;
      }
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  const animateTo = (toValue: number, config?: AnimationConfig): Promise<void> => {
    return new Promise((resolve) => {
      const animationConfig = {
        toValue,
        duration: isReducedMotionEnabled.current ? 0 : (config?.duration || 300),
        easing: config?.easing || Easing.inOut(Easing.ease),
        delay: config?.delay || 0,
        useNativeDriver: config?.useNativeDriver !== false,
      };

      Animated.timing(animatedValue, animationConfig).start(() => resolve());
    });
  };

  const spring = (toValue: number, config?: Partial<Animated.SpringAnimationConfig>): Promise<void> => {
    return new Promise((resolve) => {
      if (isReducedMotionEnabled.current) {
        animatedValue.setValue(toValue);
        resolve();
        return;
      }

      Animated.spring(animatedValue, {
        toValue,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
        ...config,
      }).start(() => resolve());
    });
  };

  const sequence = (animations: Animated.CompositeAnimation[]): Promise<void> => {
    return new Promise((resolve) => {
      if (isReducedMotionEnabled.current) {
        resolve();
        return;
      }

      Animated.sequence(animations).start(() => resolve());
    });
  };

  const parallel = (animations: Animated.CompositeAnimation[]): Promise<void> => {
    return new Promise((resolve) => {
      if (isReducedMotionEnabled.current) {
        resolve();
        return;
      }

      Animated.parallel(animations).start(() => resolve());
    });
  };

  const loop = (animation: Animated.CompositeAnimation, iterations: number = -1): void => {
    if (isReducedMotionEnabled.current) return;

    Animated.loop(animation, { iterations }).start();
  };

  const stop = (): void => {
    animatedValue.stopAnimation();
  };

  const reset = (): void => {
    animatedValue.setValue(initialValue);
  };

  const setValue = (value: number): void => {
    animatedValue.setValue(value);
  };

  return {
    value: animatedValue,
    animateTo,
    spring,
    sequence,
    parallel,
    loop,
    stop,
    reset,
    setValue,
  };
};
