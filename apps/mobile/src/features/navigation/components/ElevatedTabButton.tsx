import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from '@shared/utils/responsive';

interface ElevatedTabButtonProps {
  onPress: () => void;
  focused?: boolean;
  testID?: string;
}

export default function ElevatedTabButton({ onPress, focused = false, testID }: ElevatedTabButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Scan QR code"
      testID={testID}
    >
      <LinearGradient
        colors={['#8B5CF6', '#6366F1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, focused && styles.gradientFocused]}
      >
        <Ionicons name="qr-code" size={moderateScale(28)} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -moderateScale(32),
    left: '50%',
    marginLeft: -moderateScale(30),
    width: moderateScale(60),
    height: moderateScale(60),
    zIndex: 10,
  },
  gradient: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradientFocused: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});
