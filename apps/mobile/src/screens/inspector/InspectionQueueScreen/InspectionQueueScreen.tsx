import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@shared/styles/theme';

export function InspectionQueueScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Inspection Queue</Text>
        <Text style={styles.subtitle}>
          Queue management interface will be implemented here:
          {'\n\n'}• View pending inspections
          {'\n'}• Schedule inspections
          {'\n'}• Track inspection status
          {'\n'}• Assign inspectors
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
