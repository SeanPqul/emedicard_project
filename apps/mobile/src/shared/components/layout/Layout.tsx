/**
 * Shared Layout Component
 * 
 * Provides consistent layout structure with safe areas, status bar, and common layout patterns
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColor, getSpacing } from '@shared/styles/theme';

export interface LayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'centered' | 'padded' | 'fullscreen';
  safeArea?: boolean | 'top' | 'bottom' | 'sides';
  backgroundColor?: string;
  statusBarStyle?: 'auto' | 'inverted' | 'light' | 'dark';
  statusBarBackgroundColor?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  testID?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  variant = 'default',
  safeArea = true,
  backgroundColor,
  statusBarStyle = 'auto',
  statusBarBackgroundColor,
  style,
  contentStyle,
  testID,
}) => {
  const getVariantStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      backgroundColor: backgroundColor || getColor('background.primary'),
    };

    switch (variant) {
      case 'centered':
        return {
          ...baseStyle,
          justifyContent: 'center',
          alignItems: 'center',
        };
      
      case 'padded':
        return {
          ...baseStyle,
          padding: getSpacing('md'),
        };
      
      case 'fullscreen':
        return {
          ...baseStyle,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        };
      
      default:
        return baseStyle;
    }
  };

  const getSafeAreaEdges = () => {
    if (safeArea === true) return ['top', 'bottom', 'left', 'right'];
    if (safeArea === false) return [];
    if (safeArea === 'top') return ['top'];
    if (safeArea === 'bottom') return ['bottom'];
    if (safeArea === 'sides') return ['left', 'right'];
    return [];
  };

  const renderStatusBar = () => {
    if (statusBarStyle === 'auto') return null;
    
    return (
      <StatusBar
        barStyle={statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
        backgroundColor={statusBarBackgroundColor || getColor('background.primary')}
        translucent={false}
      />
    );
  };

  const renderContent = () => (
    <View style={[getVariantStyle(), style]} testID={testID}>
      {renderStatusBar()}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );

  if (safeArea === false) {
    return renderContent();
  }

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: backgroundColor || getColor('background.primary') }]}
      edges={getSafeAreaEdges() as any}
    >
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

Layout.displayName = 'Layout';
