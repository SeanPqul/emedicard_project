# Migration Guide: Legacy to Lightweight Architecture

This guide helps you migrate from the legacy backend architecture to the new lightweight, mobile-first architecture.

## Overview

The migration removes heavy abstractions and replaces them with simpler, more direct patterns aligned with Convex best practices.

## Key Changes

### 1. Convex Client Management

#### Before (Legacy)
```typescript
// Using ConvexClientManager singleton
import { ConvexClientManager } from '../infrastructure/ConvexClientManager';

const clientManager = ConvexClientManager.getInstance();
const client = clientManager.getClient();
const result = await client.mutation(api.forms.createForm.createForm, data);
```

#### After (New)
```typescript
// Direct import of single client instance
import { convex } from '../lib/convexClient';

const result = await convex.mutation(api.forms.createForm.createForm, data);
```

### 2. Repository Pattern Removal

#### Before (Legacy)
```typescript
// Using repository abstraction
import { IRepository } from '../repositories/interfaces/IRepository';

class FormsRepository implements IRepository<Form> {
  async findById(id: string): Promise<Form | null> {
    // Complex abstraction layer
  }
}
```

#### After (New)
```typescript
// Direct API module functions
import { getFormById, createForm } from '../api/forms.api';

const form = await getFormById(formId);
const newFormId = await createForm(formData);
```

### 3. Service Layer Replacement

#### Before (Legacy)
```typescript
// Using ConvexService class
import { ConvexService } from '../services/convexClient';

ConvexService.initialize(client);
const applications = await ConvexService.getUserApplications();
```

#### After (New)
```typescript
// Using feature-scoped API modules
import { getUserApplications } from '../api/forms.api';

const applications = await getUserApplications();
```

### 4. Error Handling

#### Before (Legacy)
```typescript
// Generic error handling
try {
  const result = await operation();
} catch (error) {
  console.error('Operation failed:', error);
  throw error;
}
```

#### After (New)
```typescript
// Structured error handling with AppError
import { AppError, handleError } from '../lib/errors';

try {
  const result = await operation();
} catch (error) {
  const appError = handleError(error);
  throw appError;
}
```

### 5. Storage Management

#### Before (Legacy)
```typescript
// Using utility functions from utils/storage.ts
import { setItem, getItem } from '../utils/storage';

await setItem('key', 'value');
const value = await getItem('key');
```

#### After (New)
```typescript
// Using MMKV instances directly
import { storage, secureStorage, typedStorage } from '../lib/storage/mmkv';

storage.set('key', 'value');
const value = storage.getString('key');

// Or using typed helpers
typedStorage.setTheme('dark');
const theme = typedStorage.getTheme();
```

## Step-by-Step Migration

### Step 1: Update Convex Client Usage

1. **Remove ConvexClientManager imports**:
```bash
# Find all files using ConvexClientManager
grep -r "ConvexClientManager" src/
```

2. **Replace with direct client import**:
```typescript
// Replace this
import { ConvexClientManager } from '../infrastructure/ConvexClientManager';
const client = ConvexClientManager.getInstance().getClient();

// With this
import { convex } from '../lib/convexClient';
```

3. **Update Provider setup**:
```typescript
// In src/provider/ClerkAndConvexProvider.tsx
import { convex } from '../lib/convexClient';

export default function ClerkAndConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkLoaded>
          {children}
        </ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### Step 2: Migrate Service Layer Calls

1. **Replace ConvexService calls**:
```typescript
// Replace this
import { ConvexService } from '../services/convexClient';
const applications = await ConvexService.getUserApplications();

// With this
import { getUserApplications } from '../api/forms.api';
const applications = await getUserApplications();
```

2. **Update component hooks**:
```typescript
// In components, prefer Convex hooks
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

function MyComponent() {
  // Use this instead of service calls
  const applications = useQuery(api.forms.getUserApplications.getUserApplications);
  
  if (applications === undefined) return <Loading />;
  // Rest of component
}
```

### Step 3: Update Error Handling

1. **Replace generic error handling**:
```typescript
// Replace this
try {
  await operation();
} catch (error) {
  console.error('Error:', error);
  throw error;
}

// With this
import { handleError } from '../lib/errors';

try {
  await operation();
} catch (error) {
  const appError = handleError(error);
  console.error('Error:', appError.toJSON());
  throw appError;
}
```

2. **Use structured error types**:
```typescript
import { AppError, AppErrorType, isErrorType } from '../lib/errors';

// Check specific error types
if (isErrorType(error, AppErrorType.NETWORK_OFFLINE)) {
  showOfflineMessage();
}

// Get user-friendly messages
const userMessage = error instanceof AppError 
  ? error.getUserFriendlyMessage()
  : 'Something went wrong';
```

### Step 4: Migrate Storage Usage

1. **Replace utility storage calls**:
```typescript
// Replace this
import { setItem, getItem, storage } from '../utils/storage';

// With this
import { storage, secureStorage, typedStorage } from '../lib/storage/mmkv';
```

2. **Use appropriate storage instances**:
```typescript
// General data
storage.set('user_preference', JSON.stringify(preferences));

// Sensitive data
secureStorage.set('auth_token', token);

// Typed operations
typedStorage.setUserPreferences(preferences);
typedStorage.setOnboardingCompleted(true);
```

### Step 5: Add Network Awareness

1. **Add network monitoring to components**:
```typescript
import { useNetwork } from '../hooks/useNetwork';

function MyComponent() {
  const { isOnline, networkState } = useNetwork();
  
  return (
    <View>
      {!isOnline && (
        <OfflineBanner message="No internet connection" />
      )}
      {/* Rest of component */}
    </View>
  );
}
```

2. **Use network-aware API calls**:
```typescript
// API modules already include network awareness
// No additional changes needed for basic usage
import { getUserApplications } from '../api/forms.api';

try {
  const applications = await getUserApplications();
} catch (error) {
  if (error.message.includes('Network unavailable')) {
    showOfflineMessage();
  }
}
```

### Step 6: Update Type Imports

1. **Use Convex generated types**:
```typescript
// Replace custom types with Convex generated types
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';

// Use Id<"table"> for type safety
interface FormData {
  _id: Id<'forms'>;
  userId: Id<'users'>;
  // ... other fields
}
```

## Testing Your Migration

### 1. Component Tests
```typescript
// Test network-aware components
import { render, screen } from '@testing-library/react-native';
import { useNetwork } from '../hooks/useNetwork';

// Mock the network hook
jest.mock('../hooks/useNetwork');

test('shows offline banner when offline', () => {
  (useNetwork as jest.Mock).mockReturnValue({
    isOnline: false,
    networkState: { isConnected: false, isInternetReachable: false }
  });
  
  render(<MyComponent />);
  expect(screen.getByText('No internet connection')).toBeTruthy();
});
```

### 2. API Module Tests
```typescript
// Test API modules
import { getUserApplications } from '../api/forms.api';
import { convex } from '../lib/convexClient';

jest.mock('../lib/convexClient');

test('getUserApplications handles errors gracefully', async () => {
  (convex.query as jest.Mock).mockRejectedValue(new Error('Network error'));
  
  const result = await getUserApplications();
  expect(result).toEqual([]); // Graceful degradation
});
```

## Common Migration Issues

### Issue 1: Circular Dependencies
**Problem**: Import cycles between modules

**Solution**: 
- Keep API modules focused on single features
- Use proper import paths
- Avoid cross-feature dependencies

### Issue 2: Network Calls in Loops
**Problem**: Multiple network calls without batching

**Solution**:
```typescript
// Instead of multiple calls
const results = await Promise.all(
  ids.map(id => getFormById(id))
);

// Consider batch operations or single queries
const forms = await getFormsByIds(ids);
```

### Issue 3: Missing Error Boundaries
**Problem**: Unhandled errors crash the app

**Solution**:
```typescript
// Add error boundaries around network-dependent components
<ErrorBoundary fallback={<ErrorFallback />}>
  <NetworkDependentComponent />
</ErrorBoundary>
```

## Verification Checklist

- [ ] All `ConvexClientManager` references removed
- [ ] Repository pattern calls replaced with API modules
- [ ] Service layer calls replaced with direct API calls
- [ ] Error handling updated to use `AppError`
- [ ] Storage calls migrated to MMKV instances
- [ ] Network awareness added to critical components
- [ ] Type imports updated to use Convex generated types
- [ ] Tests updated for new patterns
- [ ] No circular dependencies
- [ ] Error boundaries in place

## Rollback Plan

If issues arise during migration:

1. **Keep old files temporarily**: Don't delete legacy files until migration is complete
2. **Feature flags**: Use feature flags to switch between old and new implementations
3. **Gradual migration**: Migrate one feature at a time
4. **Monitor errors**: Watch for increased error rates after deployment

## Performance Considerations

The new architecture should provide:

- **Faster startup**: Single client instance, no heavy singletons
- **Reduced bundle size**: Removed unnecessary abstractions
- **Better offline handling**: Graceful degradation instead of crashes
- **Improved type safety**: Catch errors at compile time

Monitor these metrics after migration to ensure improvements are realized.
