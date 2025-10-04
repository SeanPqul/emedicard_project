import React from 'react';
import { ActivityIndicator, Text, View, ViewStyle } from 'react-native';
import { styles } from './LoadingView.styles';
import { theme } from '@shared/styles/theme';

interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ 
  message, 
  size = 'large',
  color = theme.colors.brand.primary,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};
