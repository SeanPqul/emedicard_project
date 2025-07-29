import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/src/styles/theme';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
