import React from 'react';
import { View, Text } from 'react-native';
import { CustomButton } from '../../ui/Button';
import { ScannerControlsProps } from './types';
import { styles } from './styles';
import { StatusIndicator } from './StatusIndicator';

export const ScannerControls: React.FC<ScannerControlsProps> = ({
  scanning,
  onSimulateScan,
}) => {
  return (
    <View style={styles.controls}>
      <View style={styles.controlsContent}>
        {/* Status indicator */}
        <StatusIndicator scanning={scanning} />

        {/* Scan button */}
        <CustomButton
          title={scanning ? 'Scanning...' : 'Simulate Scan'}
          variant="primary"
          size="large"
          onPress={onSimulateScan}
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
  );
};
