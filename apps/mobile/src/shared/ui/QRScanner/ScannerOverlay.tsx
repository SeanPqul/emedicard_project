import React from 'react';
import { View } from 'react-native';
import { ScannerOverlayProps } from './types';
import { styles } from './styles';

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ children }) => {
  return (
    <View style={styles.overlay}>
      {/* Top overlay */}
      <View style={styles.overlayTop} />
      
      {/* Middle row with side overlays and scanner frame */}
      <View style={styles.overlayMiddle}>
        <View style={styles.overlayLeft} />
        
        {children}
        
        <View style={styles.overlayRight} />
      </View>
      
      {/* Bottom overlay */}
      <View style={styles.overlayBottom} />
    </View>
  );
};
