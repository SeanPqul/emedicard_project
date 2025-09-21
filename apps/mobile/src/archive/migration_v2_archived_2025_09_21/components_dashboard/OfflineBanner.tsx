import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getColor, getSpacing, getTypography } from '../../styles/theme';

interface OfflineBannerProps {
  isOnline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="wifi-off" size={16} color={getColor('ui.white')} />
      <Text style={styles.text}>You're offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: getColor('semantic.warning'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing('xs'),
    gap: getSpacing('xs'),
  },
  text: {
    ...getTypography('bodySmall'),
    color: getColor('ui.white'),
    fontWeight: '500',
  },
});
