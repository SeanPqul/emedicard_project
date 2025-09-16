import React from 'react';
import { View, StatusBar } from 'react-native';
import { ScannerHeader } from './ScannerHeader';
import { ScannerOverlay } from './ScannerOverlay';
import { ScannerFrame } from './ScannerFrame';
import { ScannerControls } from './ScannerControls';
import { useScanLineAnimation, useScanFeedbackAnimation, useScannerState } from './hooks';
import { QRScannerProps } from './types';
import { styles } from './styles';

export const QRCodeScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  active = true,
  title = 'Scan QR Code',
  subtitle = 'Position the QR code within the frame',
  flashEnabled = false,
  onFlashToggle,
  accessibilityLabel = 'QR code scanner',
}) => {
  // Custom hooks for state and animations
  const { scanning, simulateScan } = useScannerState(onScan);
  const { scaleAnim, opacityAnim, triggerFeedback } = useScanFeedbackAnimation();
  const scanLineTranslateY = useScanLineAnimation(active);

  // Enhanced simulate scan with feedback
  const handleSimulateScan = () => {
    triggerFeedback();
    simulateScan();
  };

  if (!active) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      
      {/* Header */}
      <ScannerHeader
        title={title}
        subtitle={subtitle}
        onClose={onClose}
        flashEnabled={flashEnabled}
        onFlashToggle={onFlashToggle}
      />

      {/* Scanner Area */}
      <View style={styles.scannerArea}>
        <ScannerOverlay>
          <ScannerFrame
            scanning={scanning}
            scaleAnim={scaleAnim}
            opacityAnim={opacityAnim}
            scanLineTranslateY={scanLineTranslateY}
            accessibilityLabel={accessibilityLabel}
          />
        </ScannerOverlay>
      </View>

      {/* Controls */}
      <ScannerControls
        scanning={scanning}
        onSimulateScan={handleSimulateScan}
      />
    </View>
  );
};
