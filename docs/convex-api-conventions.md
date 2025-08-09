# Convex API Conventions and Best Practices

This document outlines the conventions and best practices for working with Convex in the eMediCard project, following the lightweight architecture patterns.

## Project Structure Alignment

Our API modules align with Convex function organization:

```
convex/                          src/api/
├── forms/                  ←→   ├── forms.api.ts
│   ├── createForm.ts            │
│   ├── getById.ts               │
│   └── getUserApplications.ts   │
├── payments/               ←→   ├── payments.api.ts
├── healthCards/            ←→   ├── healthCards.api.ts
├── notifications/          ←→   ├── notifications.api.ts
├── users/                  ←→   ├── users.api.ts
└── requirements/           ←→   └── storage.api.ts
```

## API Module Patterns

### 1. Module Structure Template

```typescript
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { convex } from '../lib/convexClient';
import { withNetwork } from '../lib/network';
import { AppError, handleError } from '../lib/errors';

/**
 * [Feature] API Module
 * 
 * Feature-scoped API functions for [feature] operations.
 * Each function is small, focused, and handles errors consistently.
 */

// Types specific to this feature
export type FeatureStatus = 'status1' | 'status2';
export interface FeatureRecord { /* ... */ }
export interface CreateFeatureData { /* ... */ }

// Small, focused functions
export const getFeatureById = async (id: Id<'features'>) => {
  return withNetwork(async () => {
    try {
      return await convex.query(api.features.getById.getById, { id });
    } catch (error) {
      throw handleError(error);
    }
  });
};
```

### 2. Function Naming Conventions

#### Query Functions (Read Operations)
- `get[Entity]ById(id: Id<'table'>)` - Single entity by ID
- `get[Entity]s()` - All entities for current user
- `get[Entity]sByStatus(status)` - Filtered entities
- `search[Entity]s(query)` - Search operations

#### Mutation Functions (Write Operations)  
- `create[Entity](data)` - Create new entity
- `update[Entity](id, updates)` - Update existing entity
- `delete[Entity](id)` - Delete entity
- `[action][Entity](id, params)` - Specific actions (e.g., `approveApplication`)

#### Examples
```typescript
// Queries
export const getFormById = async (formId: Id<'forms'>) => { /* */ };
export const getUserApplications = async () => { /* */ };
export const getFormsByStatus = async (status: FormStatus) => { /* */ };

// Mutations
export const createForm = async (data: CreateFormData) => { /* */ };
export const updateForm = async (formId: Id<'forms'>, updates: UpdateFormData) => { /* */ };
export const submitApplicationForm = async (formId: Id<'forms'>) => { /* */ };
```

### 3. Type Usage Conventions

#### Use Convex Generated Types
```typescript
// ✅ Good: Use generated types
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';

export const getFormById = async (formId: Id<'forms'>) => {
  return await convex.query(api.forms.getById.getById, { formId });
};

// ❌ Avoid: Custom string types
export const getFormById = async (formId: string) => { /* */ };
```

#### Define API-Specific Interfaces
```typescript
// Input/output interfaces for the API layer
export interface CreateFormData {
  jobCategoryId: Id<'jobCategories'>;
  personalInfo: {
    firstName: string;
    lastName: string;
    // ... other fields
  };
}

export interface UpdateFormData {
  status?: FormStatus;
  personalInfo?: Partial<CreateFormData['personalInfo']>;
}
```

## Error Handling Patterns

### 1. Consistent Error Wrapping

```typescript
// All API functions should wrap errors consistently
export const createForm = async (formData: CreateFormData) => {
  return withNetwork(async () => {
    try {
      const formId = await convex.mutation(api.forms.createForm.createForm, formData);
      if (!formId) {
        throw new AppError('FORM_CREATION_FAILED', 'Failed to create form');
      }
      return formId;
    } catch (error) {
      throw handleError(error); // Convert to AppError
    }
  });
};
```

### 2. Graceful Degradation for Lists

```typescript
// Return empty arrays for failed list operations
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

### 3. Throw Errors for Critical Operations

```typescript
// Throw errors for operations that cannot gracefully degrade
export const getFormById = async (formId: Id<'forms'>) => {
  return withNetwork(async () => {
    try {
      const form = await convex.query(api.forms.getById.getById, { formId });
      return form;
    } catch (error) {
      throw handleError(error); // Let caller handle the error
    }
  });
};
```

## Network Integration

### 1. All API Functions Use Network Awareness

```typescript
// ✅ Good: Wrapped with network awareness
export const createPayment = async (data: CreatePaymentData) => {
  return withNetwork(async () => {
    // Convex operation
  });
};

// ❌ Avoid: Direct Convex calls without network wrapper
export const createPayment = async (data: CreatePaymentData) => {
  return await convex.mutation(api.payments.createPayment.createPayment, data);
};
```

### 2. Optional Network Operations

```typescript
// Use withNetworkOptional for non-critical operations
export const logAnalyticsEvent = async (event: AnalyticsEvent) => {
  return withNetworkOptional(async () => {
    await convex.mutation(api.analytics.logEvent.logEvent, event);
  });
};
```

## Component Integration Patterns

### 1. Prefer Convex Hooks in Components

```typescript
// ✅ Good: Use Convex hooks directly in components
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function ApplicationsList() {
  const applications = useQuery(api.forms.getUserApplications.getUserApplications);
  const createForm = useMutation(api.forms.createForm.createForm);

  if (applications === undefined) return <Loading />;
  
  return (
    <FlatList
      data={applications}
      renderItem={({ item }) => <ApplicationItem item={item} />}
    />
  );
}
```

### 2. Use API Modules in Non-Hook Contexts

```typescript
// ✅ Good: Use API modules in utilities, actions, etc.
import { getUserApplications, createForm } from '../api/forms.api';

// In a utility function or action
export const processApplications = async () => {
  const applications = await getUserApplications();
  
  for (const app of applications) {
    // Process each application
  }
};
```

## Validation Patterns

### 1. Client-Side Validation

```typescript
// Include validation functions in API modules
export const validateFormData = (formData: Partial<CreateFormData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.jobCategoryId) {
    errors.push('Job category is required');
  }

  if (!formData.personalInfo?.firstName?.trim()) {
    errors.push('First name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Use validation before API calls
export const createForm = async (formData: CreateFormData) => {
  const validation = validateFormData(formData);
  if (!validation.isValid) {
    throw new AppError('VALIDATION_FAILED', validation.errors.join(', '));
  }

  return withNetwork(async () => {
    // Proceed with creation
  });
};
```

### 2. Server-Side Validation Handling

```typescript
// Handle server validation errors from Convex
export const createForm = async (formData: CreateFormData) => {
  return withNetwork(async () => {
    try {
      return await convex.mutation(api.forms.createForm.createForm, formData);
    } catch (error) {
      // Convert Convex validation errors to AppError
      if (error.message?.includes('validation')) {
        throw new AppError('VALIDATION_FAILED', error.message);
      }
      throw handleError(error);
    }
  });
};
```

## Utility Functions

### 1. Display Helpers

```typescript
// Include display utilities in API modules
export const getFormStatusDisplay = (status: FormStatus): { label: string; color: string } => {
  const statusMap = {
    draft: { label: 'Draft', color: '#6B7280' },
    submitted: { label: 'Submitted', color: '#3B82F6' },
    approved: { label: 'Approved', color: '#10B981' },
    // ...
  };
  return statusMap[status] || { label: 'Unknown', color: '#6B7280' };
};
```

### 2. Business Logic Helpers

```typescript
// Include business logic in API modules
export const canCreateForm = async (): Promise<boolean> => {
  try {
    const applications = await getUserApplications();
    const hasPendingApplication = applications.some(app => 
      app.status === 'submitted' || app.status === 'under_review'
    );
    return !hasPendingApplication;
  } catch (error) {
    console.warn('Failed to check form creation eligibility:', error);
    return true; // Default to allowing creation
  }
};
```

## Performance Considerations

### 1. Batch Operations Where Possible

```typescript
// ✅ Good: Batch multiple related operations
export const uploadMultipleDocuments = async (uploads: DocumentUpload[]) => {
  const success: Id<'documents'>[] = [];
  const failed: { file: string; error: string }[] = [];

  for (const upload of uploads) {
    try {
      const documentId = await uploadDocument(upload);
      success.push(documentId);
    } catch (error) {
      failed.push({
        file: upload.file.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { success, failed };
};
```

### 2. Avoid N+1 Query Patterns

```typescript
// ❌ Avoid: Multiple individual queries
const forms = await getUserApplications();
const formDetails = await Promise.all(
  forms.map(form => getFormById(form._id))
);

// ✅ Better: Single query that returns complete data
const formsWithDetails = await getUserApplicationsWithDetails();
```

## Testing Conventions

### 1. Mock Convex Client

```typescript
// Test setup
import { convex } from '../lib/convexClient';
import { getUserApplications } from '../api/forms.api';

jest.mock('../lib/convexClient');

test('getUserApplications returns applications', async () => {
  const mockApplications = [
    { _id: 'form1', title: 'Application 1' },
    { _id: 'form2', title: 'Application 2' },
  ];

  (convex.query as jest.Mock).mockResolvedValue(mockApplications);

  const result = await getUserApplications();
  expect(result).toEqual(mockApplications);
  expect(convex.query).toHaveBeenCalledWith(
    expect.objectContaining({
      // Match the API call
    })
  );
});
```

### 2. Test Error Handling

```typescript
test('getUserApplications handles errors gracefully', async () => {
  (convex.query as jest.Mock).mockRejectedValue(new Error('Network error'));

  const result = await getUserApplications();
  expect(result).toEqual([]); // Graceful degradation
});
```

## Documentation Standards

### 1. Module-Level Documentation

```typescript
/**
 * Forms API Module
 * 
 * Feature-scoped API functions for form operations.
 * Each function is small, focused, and handles errors consistently.
 * Use these functions in non-hook contexts (actions, utils, etc.).
 * For UI components, prefer useQuery/useMutation hooks.
 */
```

### 2. Function Documentation

```typescript
/**
 * Create a new form/application
 * 
 * @param formData - The form data to create
 * @returns Promise<Id<'forms'>> - The ID of the created form
 * @throws {AppError} - When form creation fails or validation errors occur
 */
export const createForm = async (formData: CreateFormData): Promise<Id<'forms'>> => {
  // Implementation
};
```

## Migration from Legacy Patterns

### 1. Replace Service Calls

```typescript
// ❌ Old: Service layer
import { ConvexService } from '../services/convexClient';
const applications = await ConvexService.getUserApplications();

// ✅ New: API module
import { getUserApplications } from '../api/forms.api';
const applications = await getUserApplications();
```

### 2. Replace Repository Pattern

```typescript
// ❌ Old: Repository abstraction
const repository = new FormsRepository();
const form = await repository.findById(formId);

// ✅ New: Direct API call
import { getFormById } from '../api/forms.api';
const form = await getFormById(formId);
```

## Best Practices Summary

1. **Keep API modules focused** - One feature per module
2. **Use Convex generated types** - Leverage strong typing
3. **Wrap all operations with network awareness** - Use `withNetwork`
4. **Handle errors consistently** - Use `handleError` and `AppError`
5. **Provide graceful degradation** - Return empty arrays for lists
6. **Include validation and utilities** - Keep related code together
7. **Document thoroughly** - Clear JSDoc comments
8. **Test error scenarios** - Mock network failures
9. **Prefer Convex hooks in components** - Direct integration
10. **Use API modules in non-hook contexts** - Utilities and actions

This approach ensures consistency, maintainability, and optimal integration with Convex while providing robust error handling and network resilience.
