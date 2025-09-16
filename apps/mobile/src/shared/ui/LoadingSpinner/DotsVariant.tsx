import React from 'react';
import { View, Animated } from 'react-native';
import { useDotsAnimation } from './hooks';
import { styles } from './styles';
import { DotsVariantProps } from './types';

export const DotsVariant: React.FC<DotsVariantProps> = ({
  visible,
  color,
  style,
}) => {
  const dotAnims = useDotsAnimation(visible);

  return (
    <View style={[styles.dotsContainer, style]}>
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
