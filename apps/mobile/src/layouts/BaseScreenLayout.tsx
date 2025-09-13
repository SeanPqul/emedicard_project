import React from 'react';
import { View } from 'react-native';
import { theme } from '../styles/theme';

interface BaseScreenLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export const BaseScreenLayout: React.FC<BaseScreenLayoutProps> = ({
  children,
  backgroundColor = theme.colors.background.secondary,
}) => {
  return (
    <View style={{ flex: 1, backgroundColor }}>
      {children}
    </View>
  );
};
