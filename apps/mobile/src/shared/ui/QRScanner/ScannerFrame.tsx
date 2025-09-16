import React from 'react';
import { View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannerFrameProps } from './types';
import { styles } from './styles';
import { getColor } from '../../styles/theme';

export const ScannerFrame: React.FC<ScannerFrameProps> = ({
  scanning,
  scaleAnim,
  opacityAnim,
  scanLineTranslateY,
  accessibilityLabel,
}) => {
  return (
    <Animated.View
      style={[
        styles.scannerFrame,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      {/* Corner indicators */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
      
      {/* Scan line */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{ translateY: scanLineTranslateY }],
          },
        ]}
      />
      
      {/* Center focus indicator */}
      <View style={styles.centerIndicator}>
        <Ionicons 
          name="scan" 
          size={40} 
          color={getColor('primary.500')} 
        />
      </View>
    </Animated.View>
  );
};
