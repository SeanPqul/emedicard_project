import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getSpacing, getBorderRadius, getShadow, getTypography } from '@/src/styles/theme';
import { CustomButton } from '../ui/Button';

const { width, height } = Dimensions.get('window');

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  active?: boolean;
  title?: string;
  subtitle?: string;
  flashEnabled?: boolean;
  onFlashToggle?: () => void;
  accessibilityLabel?: string;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan,
  onClose,
  active = true,
  title = 'Scan QR Code',
  subtitle = 'Position the QR code within the frame',
  flashEnabled = false,
  onFlashToggle,
  accessibilityLabel = 'QR code scanner',
}) => {
  const [scanning, setScanning] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      // Start scan line animation
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

  const handleSimulateScan = () => {
    if (scanning) return;
    
    setScanning(true);
    
    // Animate scanning feedback
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

    // Simulate scan process
    setTimeout(() => {
      setScanning(false);
      
      // Simulate successful scan
      const mockQRData = JSON.stringify({
        cardId: 'HC-FH-2024-001',
        type: 'Food Handler',
        status: 'Valid',
        expiryDate: '2025-01-15',
        holderName: 'John Doe',
        issuedDate: '2024-01-15',
        clinic: 'Davao City Health Center',
      });
      
      onScan(mockQRData);
    }, 2000);
  };

  const handleFlashToggle = () => {
    if (onFlashToggle) {
      onFlashToggle();
    }
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  if (!active) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Close scanner"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={28} color={getColor('ui.white')} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        
        {onFlashToggle && (
          <TouchableOpacity
            style={styles.flashButton}
            onPress={handleFlashToggle}
            accessibilityLabel={`Turn flash ${flashEnabled ? 'off' : 'on'}`}
            accessibilityRole="button"
          >
            <Ionicons 
              name={flashEnabled ? "flash" : "flash-off"} 
              size={24} 
              color={flashEnabled ? getColor('accent.highlightYellow') : getColor('ui.white')} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Scanner Area */}
      <View style={styles.scannerArea}>
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />
          
          {/* Middle row with side overlays and scanner frame */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlayLeft} />
            
            {/* Scanner Frame */}
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
            
            <View style={styles.overlayRight} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom} />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsContent}>
          {/* Status indicator */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, scanning && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {scanning ? 'Scanning...' : 'Ready to scan'}
            </Text>
          </View>

          {/* Scan button */}
          <CustomButton
            title={scanning ? 'Scanning...' : 'Simulate Scan'}
            variant="primary"
            size="large"
            onPress={handleSimulateScan}
            disabled={scanning}
            loading={scanning}
            buttonStyle={styles.scanButton}
            accessibilityLabel="Simulate QR code scan"
          />
          
          {/* Help text */}
          <Text style={styles.helpText}>
            Position the QR code within the frame above
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: getSpacing('lg'),
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: getSpacing('sm'),
    marginLeft: -getSpacing('sm'),
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...getTypography('h3'),
    color: getColor('ui.white'),
    marginBottom: getSpacing('xs'),
  },
  headerSubtitle: {
    ...getTypography('bodySmall'),
    color: 'rgba(255,255,255,0.8)',
  },
  flashButton: {
    padding: getSpacing('sm'),
    marginRight: -getSpacing('sm'),
  },
  scannerArea: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
    width: '100%',
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayRight: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: getColor('primary.500'),
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: getColor('primary.500'),
    shadowColor: getColor('primary.500'),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  centerIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('xl'),
    paddingBottom: Platform.OS === 'ios' ? 40 : getSpacing('xl'),
  },
  controlsContent: {
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('lg'),
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: getColor('gray.400'),
    marginRight: getSpacing('sm'),
  },
  statusDotActive: {
    backgroundColor: getColor('primary.500'),
  },
  statusText: {
    ...getTypography('body'),
    color: getColor('ui.white'),
  },
  scanButton: {
    minWidth: 200,
    marginBottom: getSpacing('lg'),
  },
  helpText: {
    ...getTypography('bodySmall'),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
