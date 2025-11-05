import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { CameraView, Camera, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { theme, getColor, getSpacing, getShadow, getTypography } from '@shared/styles/theme';
import { scaleFont, scaleSize } from '@shared/utils/responsive';

const { width, height } = Dimensions.get('window');

interface QRCodeScannerProps {
  onScan: (data: string) => Promise<void>;
  onClose: () => void;
  active?: boolean;
  title?: string;
  subtitle?: string;
  flashEnabled?: boolean;
  onFlashToggle?: () => void;
  accessibilityLabel?: string;
  resumeScanning?: boolean;
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
  resumeScanning = false,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [torchOn, setTorchOn] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const isScanningRef = useRef(false);

  useEffect(() => {
    // Request camera permission
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (active && hasPermission) {
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
  }, [active, hasPermission, scanLineAnim]);

  // Resume scanning when parent signals
  useEffect(() => {
    if (resumeScanning) {
      isScanningRef.current = false;
      setScanning(false);
    }
  }, [resumeScanning]);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    // Prevent multiple scans while processing - use ref for immediate blocking
    if (isScanningRef.current || scanning) {
      return;
    }
    
    // Lock scanning immediately (synchronous)
    isScanningRef.current = true;
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

    try {
      // Wait for parent to complete processing
      await onScan(data);
    } catch (error) {
      console.error('[QRScanner] Error processing scan:', error);
    }
    // Note: Don't unlock here - parent will control via resumeScanning prop
  };

  const handleFlashToggle = () => {
    setTorchOn(!torchOn);
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

  // Permission UI
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={getColor('ui.textMuted')} />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={getColor('status.error')} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings to scan QR codes.
          </Text>
          <TouchableOpacity style={styles.closeButtonAlt} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      
      {/* Real Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={isScanningRef.current ? undefined : handleBarCodeScanned}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          accessibilityLabel="Close scanner"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color={getColor('ui.white')} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.flashButton}
          onPress={handleFlashToggle}
          accessibilityLabel={`Turn flash ${torchOn ? 'off' : 'on'}`}
          accessibilityRole="button"
        >
          <Ionicons 
            name={torchOn ? "flash" : "flash-off"} 
            size={24} 
            color={torchOn ? getColor('accent.highlightYellow') : getColor('ui.white')} 
          />
        </TouchableOpacity>
      </View>

      {/* Scanner Area Overlay */}
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

      {/* Status Footer - with safe area padding */}
      <View style={styles.controls}>
        <View style={styles.controlsContent}>
          {/* Status indicator */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, scanning && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {scanning ? 'Processing...' : 'Ready to scan'}
            </Text>
          </View>
          
          {/* Help text */}
          <Text style={styles.helpText}>
            Position the QR code within the frame above
          </Text>
        </View>
        {/* Extra padding for bottom safe area */}
        <View style={styles.bottomSafeArea} />
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
  backButton: {
    padding: getSpacing('sm'),
    marginRight: getSpacing('md'),
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
    height: scaleSize(250),
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
    width: scaleSize(250),
    height: scaleSize(250),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: scaleSize(30),
    height: scaleSize(30),
    borderWidth: scaleSize(3),
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
    height: scaleSize(2),
    backgroundColor: getColor('primary.500'),
    shadowColor: getColor('primary.500'),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: scaleSize(4),
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
    paddingTop: getSpacing('lg'),
  },
  controlsContent: {
    alignItems: 'center',
    paddingBottom: getSpacing('md'),
  },
  bottomSafeArea: {
    height: Platform.OS === 'ios' ? 34 : 0, // iPhone safe area
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('lg'),
  },
  statusDot: {
    width: scaleSize(12),
    height: scaleSize(12),
    borderRadius: scaleSize(6),
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
  helpText: {
    ...getTypography('bodySmall'),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: scaleFont(20),
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing('xl'),
  },
  permissionTitle: {
    ...getTypography('h3'),
    color: getColor('ui.white'),
    marginTop: getSpacing('lg'),
    marginBottom: getSpacing('md'),
    textAlign: 'center',
  },
  permissionText: {
    ...getTypography('body'),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: scaleFont(22),
  },
  closeButtonAlt: {
    marginTop: getSpacing('xl'),
    paddingHorizontal: getSpacing('xl'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('primary.500'),
    borderRadius: 8,
  },
  closeButtonText: {
    ...getTypography('button'),
    color: getColor('ui.white'),
  },
});
