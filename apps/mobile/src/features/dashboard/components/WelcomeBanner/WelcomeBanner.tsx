import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WelcomeBannerProps } from '@features/dashboard/types';
import { styles } from './WelcomeBanner.styles';

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ isNewUser }) => {
  if (!isNewUser) return null;

  const handleGetStarted = () => {
    router.push('/(tabs)/apply');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="medical-outline" 
          size={48} 
          color={styles.icon.color} 
        />
      </View>
      <Text style={styles.title}>Welcome to eMediCard</Text>
      <Text style={styles.subtitle}>
        Get your Davao City health card digitally. No more long queues - apply, track, and manage everything from your phone.
      </Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleGetStarted}
        accessibilityLabel="Get Started with your health card application"
      >
        <Text style={styles.buttonText}>Get Started</Text>
        <Ionicons 
          name="arrow-forward" 
          size={16} 
          color={styles.buttonIcon.color} 
        />
      </TouchableOpacity>
    </View>
  );
};