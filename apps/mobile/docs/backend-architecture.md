# Backend Architecture - Lightweight & Mobile-First

This document outlines the lightweight backend architecture for the eMediCard project, designed with mobile-first principles and Convex-native patterns.

## Architecture Principles

### 1. Single Convex Client Instance
- **One client instance app-wide**: Shared between Provider and non-hook calls
- **Location**: `src/lib/convexClient.ts`
- **Usage**:
  - In React components: Use hooks (`useQuery`, `useMutation`)
  - In non-hook contexts: Import client and use `convex.query`/`convex.mutation`

### 2. Feature-Scoped API Modules
Each feature has its own API module with small, focused async functions:

- **Forms**: `src/api/forms.api.ts`
- **Payments**: `src/api/payments.api.ts`
- **Health Cards**: `src/api/healthCards.api.ts`
- **Notifications**: `src/api/notifications.api.ts`
- **Users**: `src/api/users.api.ts`
- **Storage**: `src/api/storage.api.ts`

### 3. Strong Typing
- Use `Id<"table">` types from Convex generated types
- All API functions are strongly typed
- Interfaces for data structures and API responses

### 4. Network-Aware Operations
- **Online-only resilience**: No offline queue, graceful degradation
- Network utilities in `src/lib/network.ts`
- Retry mechanisms with exponential backoff
- Network status monitoring via `useNetwork` hook

### 5. Minimal Abstraction
- **Removed**: `IRepository`, `ConvexClientManager`, legacy services
- **Direct Convex integration**: Close to Convex recommended patterns
- **Feature code proximity**: API functions close to where they're used

## Directory Structure

```
src/
├── lib/
│   ├── convexClient.ts     # Single Convex client instance
│   ├── network.ts          # Network utilities & retry logic
│   ├── errors.ts           # Error taxonomy & handling
│   └── storage/
│       └── mmkv.ts         # MMKV storage instances
├── api/
│   ├── forms.api.ts        # Forms operations
│   ├── payments.api.ts     # Payment operations
│   ├── healthCards.api.ts  # Health card operations
│   ├── notifications.api.ts # Notification operations
│   ├── users.api.ts        # User operations
│   └── storage.api.ts      # File storage operations
└── hooks/
    └── useNetwork.ts       # Network status hook
```

## Key Components

### Convex Client (`src/lib/convexClient.ts`)
```typescript
// Single instance shared across the app
export const convex = new ConvexReactClient(convexUrl);

// Usage in components (preferred)
const applications = useQuery(api.forms.getUserApplications.getUserApplications);

// Usage in utilities/actions
import { convex } from '../lib/convexClient';
const result = await convex.mutation(api.forms.createForm.createForm, data);
```

### Network Utilities (`src/lib/network.ts`)
```typescript
// Network-aware wrapper with retry
export const withNetwork = async <T>(operation: () => Promise<T>) => {
  const networkAvailable = await isOnline();
  if (!networkAvailable) {
    throw new Error('Network unavailable');
  }
  return retryWithBackoff(operation);
};
```

### API Modules Pattern
Each API module follows this pattern:
```typescript
// Small, focused functions
export const createForm = async (data: CreateFormData) => {
  return withNetwork(async () => {
    try {
      return await convex.mutation(api.forms.createForm.createForm, data);
    } catch (error) {
      throw handleError(error);
    }
  });
};
```

### Error Handling (`src/lib/errors.ts`)
```typescript
export enum AppErrorType {
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  // ... more error types
}

export class AppError extends Error {
  constructor(public type: AppErrorType, message: string) {
    super(message);
  }
  
  getUserFriendlyMessage(): string {
    // Returns user-friendly error messages
  }
}
```

### Storage (`src/lib/storage/mmkv.ts`)
```typescript
// Multiple MMKV instances for different purposes
export const storage = new MMKV({ id: 'emedicard-storage' });
export const secureStorage = new MMKV({ 
  id: 'emedicard-secure-storage',
  encryptionKey: 'secure-key' 
});
export const cacheStorage = new MMKV({ id: 'emedicard-cache' });
```

## Usage Patterns

### In React Components (Preferred)
```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function MyComponent() {
  // Use Convex hooks directly
  const applications = useQuery(api.forms.getUserApplications.getUserApplications);
  const createForm = useMutation(api.forms.createForm.createForm);
  
  // Handle loading/error states
  if (applications === undefined) return <Loading />;
}
```

### In Non-Hook Contexts
```typescript
import { getUserApplications, createForm } from '../api/forms.api';

// In utilities, actions, or service functions
async function processApplications() {
  const applications = await getUserApplications();
  // Process applications...
}
```

### Network-Aware Operations
```typescript
import { useNetwork } from '../hooks/useNetwork';

function MyComponent() {
  const { isOnline, networkState } = useNetwork();
  
  return (
    <div>
      {!isOnline && <OfflineBanner />}
      {/* Component content */}
    </div>
  );
}
```

## Benefits

1. **Simplicity**: Removed unnecessary abstractions
2. **Performance**: Direct Convex integration, optimized for mobile
3. **Maintainability**: Feature-scoped modules, clear separation
4. **Reliability**: Network-aware with graceful degradation
5. **Type Safety**: Strong typing throughout
6. **Developer Experience**: Close to Convex patterns, easy to understand

## Migration Notes

- Replace `ConvexClientManager.getInstance()` with direct import of `convex`
- Replace repository patterns with direct API module calls
- Update error handling to use new `AppError` taxonomy
- Migrate storage calls to new MMKV instances
- Update components to use network-aware patterns

This architecture keeps the codebase lean while providing robust error handling, network resilience, and strong typing suitable for a mobile-first application.
