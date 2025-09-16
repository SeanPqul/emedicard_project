import React from 'react';
import { Animated, ActivityIndicator } from 'react-native';
import { useSpinnerAnimation } from './hooks';
import { styles, getSizeValue } from './styles';
import { SpinnerVariantProps } from './types';

export const SpinnerVariant: React.FC<SpinnerVariantProps> = ({
  visible,
  size = 'medium',
  color,
  style,
}) => {
  const spin = useSpinnerAnimation(visible);
  const sizeValue = getSizeValue(size);

  return (
    <Animated.View
      style={[
        styles.spinnerContainer,
        {
          transform: [{ rotate: spin }],
        },
        style,
      ]}
    >
      <ActivityIndicator size={sizeValue} color={color} />
    </Animated.View>
  );
};
