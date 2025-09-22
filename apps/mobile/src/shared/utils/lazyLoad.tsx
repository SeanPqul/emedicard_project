import React, { Suspense, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

// Loading fallback component
const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.green[500]} />
  </View>
);

LoadingFallback.displayName = 'LoadingFallback';

// Type for lazy loaded components
type LazyComponent<T = {}> = React.LazyExoticComponent<ComponentType<T>>;

// Enhanced lazy loading function with error boundary support
export function lazyLoadScreen<T = {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
): ComponentType<T> {
  const LazyComponent = React.lazy(importFunc) as LazyComponent<T>;
  
  const LazyScreenWrapper = (props: T) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  LazyScreenWrapper.displayName = `LazyScreen(${LazyComponent.displayName || 'Component'})`;
  
  return LazyScreenWrapper;
}

// Batch lazy loading for multiple components
export function lazyLoadScreens<T extends Record<string, () => Promise<{ default: ComponentType<any> }>>>(
  screens: T
): { [K in keyof T]: ComponentType<any> } {
  const lazyScreens: any = {};
  
  Object.keys(screens).forEach((key) => {
    lazyScreens[key] = lazyLoadScreen(screens[key]);
  });
  
  return lazyScreens;
}

// Preload component function
export async function preloadScreen(
  importFunc: () => Promise<{ default: ComponentType<any> }>
): Promise<void> {
  try {
    await importFunc();
  } catch (error) {
    console.error('Failed to preload screen:', error);
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
});
