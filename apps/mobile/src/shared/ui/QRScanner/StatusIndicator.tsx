import React from 'react';
import { View, Text } from 'react-native';
import { StatusIndicatorProps } from './types';
import { styles } from './styles';

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  scanning,
}) => {
  return (
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, scanning && styles.statusDotActive]} />
      <Text style={styles.statusText}>
        {scanning ? 'Scanning...' : 'Ready to scan'}
      </Text>
    </View>
  );
};
