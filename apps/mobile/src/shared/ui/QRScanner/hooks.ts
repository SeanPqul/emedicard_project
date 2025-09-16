import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ScannerState, MockQRData } from './types';

export const useScanLineAnimation = (active: boolean) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const animateScanLine = () => {
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(animateScanLine);
      };
      animateScanLine();
    }
  }, [active, scanLineAnim]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return scanLineTranslateY;
};

export const useScanFeedbackAnimation = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const triggerFeedback = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    scaleAnim,
    opacityAnim,
    triggerFeedback,
  };
};

export const useScannerState = (
  onScan: (data: string) => void
): ScannerState & { simulateScan: () => void } => {
  const [scanning, setScanning] = useState(false);

  const simulateScan = () => {
    if (scanning) return;
    
    setScanning(true);
    
    // Simulate scan process
    setTimeout(() => {
      setScanning(false);
      
      // Generate mock QR data
      const mockQRData: MockQRData = {
        cardId: 'HC-FH-2024-001',
        type: 'Food Handler',
        status: 'Valid',
        expiryDate: '2025-01-15',
        holderName: 'John Doe',
        issuedDate: '2024-01-15',
        clinic: 'Davao City Health Center',
      };
      
      onScan(JSON.stringify(mockQRData));
    }, 2000);
  };

  return {
    scanning,
    setScanning,
    simulateScan,
  };
};

export const useFlashState = () => {
  const [flashEnabled, setFlashEnabled] = useState(false);

  const toggleFlash = () => {
    setFlashEnabled(prev => !prev);
  };

  return {
    flashEnabled,
    toggleFlash,
  };
};
