# Convex Directory Refactoring Guide

## Overview

The `convex/` directory has been refactored to improve maintainability, modularity, and code organization. This guide documents the new structure and how to work with it.

## New Directory Structure

```
convex/
├── _generated/          # Auto-generated files (unchanged)
├── admin/               # Admin utilities and database operations
│   ├── index.ts
│   ├── migrations.ts
│   └── seed.ts
├── config/              # Configuration files
│   ├── index.ts
│   ├── auth.config.ts
│   ├── http.ts
│   └── schema.ts
├── forms/               # Application form management
│   ├── index.ts
│   ├── create.ts
│   ├── getById.ts
│   ├── getUserApplications.ts
│   ├── submitApplicationForm.ts
│   └── update.ts
├── healthCards/         # Health card issuance and management
│   ├── index.ts
│   ├── getByFormId.ts
│   ├── getByVerificationToken.ts
│   ├── getUserCards.ts
│   ├── issue.ts
│   └── update.ts
├── jobCategories/       # Job category management
│   ├── index.ts
│   ├── create.ts
│   ├── delete.ts
│   ├── getAll.ts
│   ├── getById.ts
│   └── update.ts
├── notifications/       # Notification system
│   ├── index.ts
│   ├── create.ts
│   ├── getUnreadCount.ts
│   ├── getUserNotifications.ts
│   └── markAsRead.ts
├── orientations/        # Orientation scheduling
│   └── index.ts
├── payments/            # Payment processing
│   ├── index.ts
│   ├── create.ts
│   ├── getByFormId.ts
│   └── getUserPayments.ts
├── requirements/        # Document requirements and file management
│   ├── index.ts
│   ├── documentRequirements.ts
│   ├── getCategoryRequirements.ts
│   └── requirements.ts
├── users/               # User management
│   ├── index.ts
│   ├── create.ts
│   ├── getCurrent.ts
│   ├── getUsersByRole.ts
│   ├── update.ts
│   └── updateRole.ts
├── verification/        # QR verification and logging
│   ├── index.ts
│   └── verificationLogs.ts
├── README.md            # General documentation
├── RESTRUCTURE_MAPPING.md # Detailed mapping of old to new structure
└── tsconfig.json        # TypeScript configuration
```

## Backwards Compatibility

To maintain backwards compatibility, the following root-level files have been created as re-exports:

- `forms.ts` → re-exports from `./forms/index`
- `users.ts` → re-exports from `./users/index`
- `healthCards.ts` → re-exports from `./healthCards/index`
- `jobCategories.ts` → re-exports from `./jobCategories/index`
- `notifications.ts` → re-exports from `./notifications/index`
- `orientations.ts` → re-exports from `./orientations/index`
- `payments.ts` → re-exports from `./payments/index`
- `requirements.ts` → re-exports from `./requirements/index`
- `verificationLogs.ts` → re-exports from `./verification/index`
- `schema.ts` → re-exports from `./config/schema`
- `auth.config.ts` → re-exports from `./config/auth.config`
- `http.ts` → re-exports from `./config/http`
- `migrations.ts` → re-exports from `./admin/migrations`
- `seed.ts` → re-exports from `./admin/seed`
- `getCategoryRequirements.ts` → re-exports from `./requirements/getCategoryRequirements`

## Module Organization

### 1. Forms Module (`forms/`)
Handles all application form-related operations:
- Creating new application forms
- Retrieving form details
- Updating form information
- Submitting applications with payment and validation
- Getting user's application history

### 2. Users Module (`users/`)
Manages user-related operations:
- User creation from webhooks
- Retrieving current user information
- Updating user profiles
- Role management (admin functions)

### 3. Health Cards Module (`healthCards/`)
Handles health card issuance and management:
- Issuing new health cards
- Retrieving cards by various criteria
- Updating card information
- Verification token handling

### 4. Job Categories Module (`jobCategories/`)
Manages job categories:
- CRUD operations for job categories
- Category-specific configurations
- Orientation requirements

### 5. Notifications Module (`notifications/`)
Handles the notification system:
- Creating notifications
- Retrieving user notifications
- Marking notifications as read
- Bulk operations
- Real-time notification queries

### 6. Requirements Module (`requirements/`)
Manages document requirements and file operations:
- Document requirement definitions
- File upload and management
- Category-requirement relationships
- Admin document review functions

### 7. Payments Module (`payments/`)
Handles payment processing:
- Creating payment records
- Tracking payment status
- Payment history retrieval
- Payment retry functionality

### 8. Orientations Module (`orientations/`)
Manages orientation scheduling:
- Orientation creation and scheduling
- Check-in/check-out tracking
- Status management

### 9. Verification Module (`verification/`)
Handles QR code verification:
- Verification log creation
- QR scan logging
- Verification statistics
- Security and audit trails

### 10. Admin Module (`admin/`)
Contains administrative utilities:
- Database migrations
- Data seeding operations
- System maintenance functions

### 11. Config Module (`config/`)
Houses configuration files:
- Database schema definitions
- Authentication configuration
- HTTP routes and webhooks

## Import Patterns

### Within Modules
```typescript
// Within the same module
import { someFunction } from "./otherFile";

// From generated files
import { query, mutation } from "../_generated/server";
```

### Cross-Module Dependencies
```typescript
// Importing from other modules
import { createNotification } from "../notifications/create";
import { getCurrentUser } from "../users/getCurrent";
```

### External Usage (Client-side)
```typescript
// Still works as before
import { api } from "@/convex/_generated/api";

// Usage remains the same
const data = useQuery(api.forms.getUserApplications);
const createForm = useMutation(api.forms.createForm);
```

## Benefits of the New Structure

1. **Improved Maintainability**: Related functions are grouped together
2. **Better Code Organization**: Clear separation of concerns
3. **Easier Navigation**: Logical file structure
4. **Scalability**: Easy to add new functions to appropriate modules
5. **Backwards Compatibility**: Existing code continues to work
6. **Reduced File Sizes**: No more monolithic files
7. **Clear Dependencies**: Better understanding of module relationships

## Migration Guidelines

### For New Development
- Add new functions to the appropriate module directory
- Create new files for new functionality within modules
- Update the module's `index.ts` to export new functions

### For Existing Code
- No immediate changes required due to backwards compatibility
- Gradually migrate imports to use the new modular structure
- Update import paths when refactoring existing files

## Cross-Dependencies

Key cross-dependencies to be aware of:
- **Forms** heavily depends on requirements, payments, notifications, orientations
- **Requirements** depends on forms and users for validation
- **Payments** depends on forms and creates notifications
- **Orientations** depends on forms and creates notifications
- **Verification** depends on healthCards, forms, and users
- **All modules** depend on users for authentication

## Future Improvements

1. Consider breaking down large files like `requirements.ts` further
2. Implement shared utility functions in a common module
3. Add type definitions for cross-module interfaces
4. Consider implementing a plugin architecture for extensibility

---

This refactoring maintains full backwards compatibility while providing a much more organized and maintainable codebase structure.
