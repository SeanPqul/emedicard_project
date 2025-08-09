# Data Service Interface Reference

This document catalogs all exported data methods from both `dataService.ts` and `convexService.ts` to ensure no functionality is lost during interface unification.

## Overview

The current codebase has two separate data service implementations:
- **`dataService.ts`**: Contains an interface-based approach with Convex implementation and mock service
- **`convexService.ts`**: Contains a static class-based service with enhanced error handling

## dataService.ts Exports

### Interface: `IDataService`
The main interface that defines the contract for data operations.

### Class: `ConvexDataService`
Convex implementation of the `IDataService` interface.

### Class: `MockDataService`
Mock implementation for testing purposes.

### Function: `createDataService`
Factory function to create data service instances.

## Complete Method Catalog

### User Operations

| Method | Source | Return Type | Parameters | Description |
|--------|---------|-------------|------------|-------------|
| `getCurrentUser()` | Both services | `Promise<User/any>` | None | Fetches the current authenticated user |
| `createUser()` | dataService only | `Promise<void>` | `userData: any` | Creates a new user account |
| `updateUser()` | dataService only | `Promise<void>` | `userData: any` | Updates user information |
| `updateUserProfile()` | convexService only | `Promise<boolean>` | `userData: Partial<User>` | Updates user profile with success status |

### Application Operations

| Method | Source | Return Type | Parameters | Description |
|--------|---------|-------------|------------|-------------|
| `getUserApplications()` | Both services | `Promise<Application[]/any[]>` | None | Fetches user's applications |
| `createApplication()` | Both services | `Promise<void/string\|null>` | `data: any/Omit<Application, '_id'>` | Creates new application |
| `updateApplicationStatus()` | Both services | `Promise<void/boolean>` | `id: Id<"forms">/string, status: string/Application['status']` | Updates application status |

### Payment Operations

| Method | Source | Return Type | Parameters | Description |
|--------|---------|-------------|------------|-------------|
| `getUserPayments()` | Both services | `Promise<Payment[]/any[]>` | None | Fetches user's payments |
| `createPayment()` | Both services | `Promise<void/string\|null>` | `data: any/Omit<Payment, '_id'>` | Creates new payment |
| `updatePaymentStatus()` | convexService only | `Promise<boolean>` | `paymentId: string, status: Payment['status']` | Updates payment status (not implemented) |

### Health Card Operations

| Method | Source | Return Type | Parameters | Description |
|--------|---------|-------------|------------|-------------|
| `getUserHealthCards()` | Both services | `Promise<HealthCard[]/any[]>` | None | Fetches user's health cards |
| `getHealthCardByToken()` | convexService only | `Promise<HealthCard\|null>` | `token: string` | Fetches health card by verification token |

### Notification Operations

| Method | Source | Return Type | Parameters | Description |
|--------|---------|-------------|------------|-------------|
| `getUserNotifications()` | Both services | `Promise<Notification[]/any[]>` | None | Fetches user's notifications |
| `markNotificationAsRead()` | Both services | `Promise<void/boolean>` | `id: Id<"notifications">/string` | Marks single notification as read |
| `markAllNotificationsAsRead()` | Both services | `Promise<void/boolean>` | None | Marks all notifications as read |

### Document Operations (convexService only)

| Method | Source | Return Type | Parameters | Description |
|--------|---------|-------------|------------|-------------|
| `uploadDocument()` | convexService only | `Promise<string\|null>` | `file: File, documentType: string` | Uploads a document |
| `deleteDocument()` | convexService only | `Promise<boolean>` | `documentId: string` | Deletes a document |

### Analytics Operations (convexService only)

| Method | Source | Return Type | Parameters | Description |
|--------|---------|-------------|------------|-------------|
| `getDashboardAnalytics()` | convexService only | `Promise<any>` | `userId: string` | Gets dashboard analytics (not implemented) |

### Utility Operations (convexService only)

| Method | Source | Return Type | Parameters | Description |
|--------|---------|-------------|------------|-------------|
| `healthCheck()` | convexService only | `Promise<boolean>` | None | Performs service health check (not implemented) |

## Key Differences Between Services

### Error Handling
- **dataService.ts**: Basic error propagation, relies on calling code for error handling
- **convexService.ts**: Enhanced error handling with try-catch blocks, console logging, and fallback return values

### Return Types
- **dataService.ts**: Uses `Promise<void>` for mutations, throws errors on failure
- **convexService.ts**: Uses `Promise<boolean>` for mutations to indicate success/failure status

### Type Safety
- **dataService.ts**: Uses `any` types and Convex `Id<>` types
- **convexService.ts**: Uses proper TypeScript types (`User`, `Application`, `Payment`, etc.)

### Implementation Pattern
- **dataService.ts**: Interface-based with dependency injection
- **convexService.ts**: Static class-based with centralized client management

## Missing Implementations

The following methods are defined in convexService.ts but noted as not implemented in the Convex backend:
- `updatePaymentStatus()` - Payment status updates
- `markAllNotificationsAsRead()` - Bulk notification marking
- `getDashboardAnalytics()` - Dashboard analytics
- `healthCheck()` - Service health checking

## Recommendations for Unified Interface

1. **Error Handling**: Adopt the enhanced error handling pattern from convexService.ts
2. **Return Types**: Use boolean return types for mutations to indicate success/failure
3. **Type Safety**: Implement proper TypeScript types throughout
4. **Method Coverage**: Include all unique methods from both services
5. **Implementation Status**: Clearly document which methods need backend implementation
6. **Testing**: Maintain mock implementation capability for testing

## Factory Functions

### dataService.ts
- `createDataService(client: ConvexReactClient): IDataService` - Creates service instances

### convexService.ts
- `ConvexService.initialize(client: ConvexReactClient)` - Initializes static service client

## Mock Services

### MockDataService
Complete mock implementation of `IDataService` for testing, providing:
- Console logging of operations
- Dummy data returns
- No actual database operations

This reference should guide the creation of a unified interface that preserves all existing functionality while improving consistency and type safety.
