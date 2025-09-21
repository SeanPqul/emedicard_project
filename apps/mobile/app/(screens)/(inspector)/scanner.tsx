import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '@shared/styles/screens/inspector-scanner';

export default function Scanner() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>QR Scanner</Text>
        <Text style={styles.subtitle}>
          Scanner interface will be implemented here:
          {'\n\n'}• Scan user QR codes
          {'\n'}• Validate health card authenticity
          {'\n'}• Display scanning results
        </Text>
      </View>
    </View>
  );
}
