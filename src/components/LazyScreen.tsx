import React, { Suspense, ComponentType, ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface LazyScreenProps {
  fallback?: ReactNode;
}

interface LazyLoadOptions {
  fallback?: ReactNode;
}

export function createLazyScreen<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: LazyLoadOptions
) {
  const LazyComponent = React.lazy(importFunc);

  return function LazyScreen(props: P & LazyScreenProps) {
    const fallback = props.fallback || options?.fallback || <DefaultFallback />;

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

function DefaultFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary[500]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
});
