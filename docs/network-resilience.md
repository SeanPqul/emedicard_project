# Network Resilience - Online-Only Architecture

This document outlines the network resilience strategy for the eMediCard mobile application, designed around online-only resilience without offline queues.

## Philosophy: Graceful Degradation Over Offline Persistence

The application follows an **online-first** approach with graceful degradation when network connectivity is unavailable. This design choice prioritizes:

- **Simplicity**: No complex offline synchronization
- **Data Consistency**: Always work with fresh data when online
- **User Clarity**: Clear feedback about network requirements
- **Mobile Performance**: Optimized for mobile network conditions

## Network Architecture Components

### 1. Network Detection (`src/lib/network.ts`)

```typescript
// Real-time network state monitoring
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'other' | 'unknown';
}

// Utility functions
export const isOnline = async (): Promise<boolean> => {
  const networkState = await getNetworkState();
  return networkState.isConnected && networkState.isInternetReachable;
};
```

### 2. Network-Aware Wrappers

All API operations are wrapped with network awareness:

```typescript
// Automatic network checking with retry logic
export const withNetwork = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const networkAvailable = await isOnline();
  
  if (!networkAvailable) {
    throw new Error('Network unavailable. Please check your connection and try again.');
  }

  return retryWithBackoff(operation, options);
};
```

### 3. Exponential Backoff Retry

```typescript
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const config = { 
    maxAttempts: 3, 
    baseDelay: 1000, 
    maxDelay: 30000, 
    backoffMultiplier: 2,
    ...options 
  };

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === config.maxAttempts) throw error;
      
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

### 4. React Hook for Network Status

```typescript
// Component-level network monitoring
export const useNetwork = (): UseNetworkReturn => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true, // Optimistic default
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    const unsubscribe = addNetworkListener(setNetworkState);
    return unsubscribe;
  }, []);

  return {
    networkState,
    isConnected: networkState.isConnected,
    isOnline: networkState.isConnected && networkState.isInternetReachable,
    checkConnection: () => checkConnection(),
  };
};
```

## Resilience Patterns

### 1. Graceful Degradation in API Modules

```typescript
export const getUserApplications = async () => {
  return withNetwork(async () => {
    try {
      const applications = await convex.query(api.forms.getUserApplications.getUserApplications);
      return applications || [];
    } catch (error) {
      console.warn('Failed to fetch user applications:', error);
      return []; // Graceful degradation
    }
  });
};
```

### 2. Optional Network Operations

```typescript
// For non-critical operations that can be skipped
export const withNetworkOptional = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T | null> => {
  try {
    return await withNetwork(operation, options);
  } catch (error) {
    console.warn('Optional network operation failed:', error);
    return null; // Graceful failure
  }
};
```

### 3. Component-Level Network Awareness

```typescript
function ApplicationsList() {
  const { isOnline } = useNetwork();
  const applications = useQuery(api.forms.getUserApplications.getUserApplications);

  if (!isOnline) {
    return (
      <View style={styles.offlineContainer}>
        <Icon name="wifi-off" size={48} color="#666" />
        <Text style={styles.offlineText}>
          No internet connection. Please check your network and try again.
        </Text>
        <Button title="Retry" onPress={() => window.location.reload()} />
      </View>
    );
  }

  if (applications === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={applications}
      renderItem={({ item }) => <ApplicationItem item={item} />}
      refreshing={false}
      onRefresh={() => {/* Convex handles refresh automatically */}}
    />
  );
}
```

## Error Handling Strategy

### 1. Network Error Classification

```typescript
export enum NetworkErrorType {
  OFFLINE = 'OFFLINE',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
}

export class NetworkError extends Error {
  constructor(
    public type: NetworkErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }

  static fromError(error: unknown): NetworkError {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('offline') || errorMessage.includes('network')) {
      return new NetworkError(NetworkErrorType.OFFLINE, errorMessage);
    }
    
    if (errorMessage.includes('timeout')) {
      return new NetworkError(NetworkErrorType.TIMEOUT, errorMessage);
    }
    
    return new NetworkError(NetworkErrorType.CONNECTION_ERROR, errorMessage);
  }
}
```

### 2. User-Friendly Error Messages

```typescript
export const getNetworkErrorMessage = (error: NetworkError): string => {
  switch (error.type) {
    case NetworkErrorType.OFFLINE:
      return 'No internet connection. Please check your network settings and try again.';
    case NetworkErrorType.TIMEOUT:
      return 'Request timed out. Please try again.';
    case NetworkErrorType.SERVER_ERROR:
      return 'Server is temporarily unavailable. Please try again later.';
    default:
      return 'Connection error. Please check your internet connection.';
  }
};
```

## UI Patterns for Network States

### 1. Offline Banner

```typescript
function OfflineBanner() {
  const { isOnline } = useNetwork();
  
  if (isOnline) return null;

  return (
    <View style={styles.offlineBanner}>
      <Icon name="wifi-off" size={16} color="white" />
      <Text style={styles.offlineText}>No Internet Connection</Text>
    </View>
  );
}
```

### 2. Network-Aware Buttons

```typescript
function NetworkButton({ onPress, title, ...props }) {
  const { isOnline } = useNetwork();
  
  return (
    <Button
      title={isOnline ? title : 'No Connection'}
      onPress={isOnline ? onPress : undefined}
      disabled={!isOnline}
      style={[
        styles.button,
        !isOnline && styles.buttonDisabled
      ]}
      {...props}
    />
  );
}
```

### 3. Retry Mechanisms

```typescript
function RetryableContent({ children, onRetry }) {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    try {
      await onRetry();
    } catch (err) {
      setError(err);
    } finally {
      setIsRetrying(false);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error instanceof NetworkError 
            ? getNetworkErrorMessage(error)
            : 'Something went wrong'}
        </Text>
        <Button
          title={isRetrying ? 'Retrying...' : 'Retry'}
          onPress={handleRetry}
          disabled={isRetrying}
        />
      </View>
    );
  }

  return children;
}
```

## Caching Strategy

### 1. Short-term Memory Cache

```typescript
// Cache successful responses briefly to avoid repeated requests
const responseCache = new Map();

export const withCache = async <T>(
  key: string,
  operation: () => Promise<T>,
  ttlMs: number = 30000 // 30 seconds default
): Promise<T> => {
  const cached = responseCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data;
  }

  const data = await operation();
  responseCache.set(key, { data, timestamp: Date.now() });
  
  return data;
};
```

### 2. MMKV for Persistent Cache

```typescript
// Use MMKV for longer-term caching of non-critical data
export const setCachedData = <T>(
  key: string, 
  data: T, 
  expirationMs = 5 * 60 * 1000 // 5 minutes
) => {
  const cacheItem = {
    data,
    expiration: Date.now() + expirationMs,
  };
  cacheStorage.set(key, JSON.stringify(cacheItem));
};

export const getCachedData = <T>(key: string): T | null => {
  try {
    const cached = cacheStorage.getString(key);
    if (!cached) return null;

    const cacheItem = JSON.parse(cached);
    
    if (Date.now() > cacheItem.expiration) {
      cacheStorage.delete(key);
      return null;
    }
    
    return cacheItem.data;
  } catch {
    return null;
  }
};
```

## Performance Considerations

### 1. Request Deduplication

```typescript
const pendingRequests = new Map<string, Promise<any>>();

export const withDeduplication = async <T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = operation().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};
```

### 2. Batch Operations

```typescript
// Batch multiple operations where possible
export const batchOperations = async <T>(
  operations: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(op => op()));
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.warn('Batch operation failed:', result.reason);
      }
    });

    // Small delay between batches to avoid overwhelming the server
    if (i + batchSize < operations.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
};
```

## Testing Network Resilience

### 1. Network Condition Simulation

```typescript
// Mock network conditions for testing
export const mockNetworkCondition = (condition: 'online' | 'offline' | 'slow') => {
  switch (condition) {
    case 'offline':
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network request failed'));
      break;
    case 'slow':
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 5000))
      );
      break;
    case 'online':
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
      break;
  }
};
```

### 2. Resilience Tests

```typescript
describe('Network Resilience', () => {
  test('handles offline gracefully', async () => {
    mockNetworkCondition('offline');
    
    const result = await getUserApplications();
    expect(result).toEqual([]); // Graceful degradation
  });

  test('retries on network failure', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([{ id: '1', title: 'Test' }]);

    const result = await retryWithBackoff(mockFn, { maxAttempts: 3 });
    
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(result).toEqual([{ id: '1', title: 'Test' }]);
  });
});
```

## Best Practices

### 1. **Always Show Network Status**
- Use offline banners or indicators
- Disable actions when offline
- Provide clear feedback about network requirements

### 2. **Implement Smart Retry Logic**
- Use exponential backoff
- Limit retry attempts
- Different strategies for different error types

### 3. **Cache Appropriately**
- Short-term memory cache for repeated requests
- Persistent cache for non-critical data
- Always validate cache freshness

### 4. **Graceful Degradation**
- Return empty arrays instead of throwing errors
- Provide fallback UI states
- Cache last successful responses when possible

### 5. **Monitor Network Performance**
- Track success/failure rates
- Monitor retry patterns
- Alert on network issues

This online-only architecture with graceful degradation provides a robust, maintainable solution that works well for mobile applications while keeping complexity manageable.
