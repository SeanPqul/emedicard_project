# Performance Optimization Guide for eMediCard

## 1. React Native Performance Optimizations

### Image Optimization
```typescript
// Install react-native-fast-image for better image caching
npm install react-native-fast-image

// Implementation
import FastImage from 'react-native-fast-image';

const OptimizedImage = ({ uri, style }) => (
  <FastImage
    style={style}
    source={{
      uri,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    }}
    resizeMode={FastImage.resizeMode.contain}
  />
);
```

### List Performance
```typescript
// Optimize FlatList for large datasets
import { FlatList, View } from 'react-native';

const OptimizedList = ({ data }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
};
```

### Memory Management
```typescript
// Implement proper cleanup in components
import { useEffect, useRef } from 'react';

const useCleanup = () => {
  const subscriptions = useRef([]);
  
  useEffect(() => {
    return () => {
      subscriptions.current.forEach(sub => sub?.unsubscribe?.());
    };
  }, []);
  
  return {
    addSubscription: (sub) => subscriptions.current.push(sub)
  };
};
```

## 2. Code Splitting & Lazy Loading

```typescript
// Implement lazy loading for screens
import { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

const LazyHealthCardScreen = lazy(() => import('./screens/HealthCardScreen'));

const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="HealthCard">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <LazyHealthCardScreen />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);
```

## 3. API Call Optimization

```typescript
// Implement request caching and deduplication
import AsyncStorage from '@react-native-async-storage/async-storage';

class APICache {
  private cache = new Map();
  private pendingRequests = new Map();
  
  async fetch(url: string, options?: RequestInit, cacheTime = 5 * 60 * 1000) {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    // Check memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    // Make request
    const requestPromise = fetch(url, options)
      .then(res => res.json())
      .then(data => {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        this.pendingRequests.delete(cacheKey);
        return data;
      });
    
    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }
}

export const apiCache = new APICache();
```

## 4. Bundle Size Optimization

```json
// metro.config.js
module.exports = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
      compress: {
        drop_console: true,
      },
    },
  },
};
```

## 5. Performance Monitoring

```typescript
// Implement performance monitoring
import { InteractionManager } from 'react-native';

export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  
  InteractionManager.runAfterInteractions(() => {
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    
    // Send to analytics
    analytics.track('performance_metric', {
      name,
      duration: end - start,
    });
  });
};
```
