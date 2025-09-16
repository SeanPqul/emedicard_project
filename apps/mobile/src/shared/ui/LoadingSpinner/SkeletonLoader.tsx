import React from 'react';
import { View, Animated } from 'react-native';
import { useSkeletonAnimation } from './hooks';
import { styles } from './styles';
import { getSpacing } from '../../styles/theme';
import { SkeletonLoaderProps } from './types';

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 3,
  height = 60,
  style,
}) => {
  const pulseAnim = useSkeletonAnimation();

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
