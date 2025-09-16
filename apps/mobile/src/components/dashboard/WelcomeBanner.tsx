import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../styles/theme';

interface WelcomeBannerProps {
  isNewUser: boolean;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ isNewUser }) => {
  if (!isNewUser) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="medical-outline" size={48} color={getColor('accent.medicalBlue')} />
      </View>
      <Text style={styles.title}>Welcome to eMediCard</Text>
      <Text style={styles.subtitle}>
        Get your Davao City health card digitally. No more long queues - apply, track, and manage everything from your phone.
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/(tabs)/apply')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={16} color={getColor('text.inverse')} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: getSpacing('lg'),
    marginVertical: getSpacing('md'),
    padding: getSpacing('lg'),
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: getBorderRadius('full'),
    backgroundColor: getColor('accent.medicalBlue') + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('md'),
  },
  title: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    marginBottom: getSpacing('sm'),
    textAlign: 'center',
  },
  subtitle: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    marginBottom: getSpacing('lg'),
    paddingHorizontal: getSpacing('md'),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('accent.medicalBlue'),
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('full'),
    gap: getSpacing('xs'),
  },
  buttonText: {
    ...getTypography('bodySmall'),
    color: getColor('text.inverse'),
    fontWeight: '600',
  },
});
