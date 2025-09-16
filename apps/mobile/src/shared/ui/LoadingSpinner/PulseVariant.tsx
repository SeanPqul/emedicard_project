import React from 'react';
import { View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePulseAnimation } from './hooks';
import { styles, getSizeValue } from './styles';
import { PulseVariantProps } from './types';

export const PulseVariant: React.FC<PulseVariantProps> = ({
  visible,
  size = 'medium',
  color,
  icon,
  style,
}) => {
  const pulseAnim = usePulseAnimation(visible);
  const sizeValue = getSizeValue(size);

  return (
    <Animated.View
      style={[
        styles.pulseContainer,
        {
          transform: [{ scale: pulseAnim }],
          opacity: pulseAnim,
        },
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={sizeValue} color={color} />
      ) : (
        <View style={[styles.pulseCircle, { backgroundColor: color }]} />
      )}
    </Animated.View>
  );
};
