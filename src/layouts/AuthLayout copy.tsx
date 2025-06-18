import React from 'react';
import { View } from 'react-native';
import { styles } from '@/assets/styles/auth-styles/auth-layout';

interface AuthLayoutProps {
  children: React.ReactNode;
  style?: any;
}

export default function AuthLayout({ 
  children, 
  style
}: AuthLayoutProps) {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}