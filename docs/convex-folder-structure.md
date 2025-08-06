# Convex Folder Structure and Naming Conventions

## Overview

This document establishes the hierarchy and naming conventions for the `convex/` folder in the eMediaCard project. The structure is designed to promote maintainability, scalability, and developer productivity.

## Folder Hierarchy

```
convex/
├── admin/                    # Administrative operations
├── config/                   # Configuration files
├── forms/                    # Form handling modules
├── healthCards/             # Health card management
├── jobCategories/           # Job category operations
├── notifications/           # Notification system
├── orientations/            # Orientation management
├── payments/                # Payment processing
├── requirements/            # Document and category requirements
├── users/                   # User management
├── verification/            # Verification and logging
├── _generated/              # Auto-generated files (do not edit)
└── [root files]             # Schema, config, and entry point files
```

## Naming Conventions

### Directory Names
- **Format**: `camelCase` for multi-word directories
- **Examples**: 
  - ✅ `jobCategories`
  - ✅ `healthCards`
  - ❌ `job-categories`
  - ❌ `job_categories`

### File Names
- **Format**: `camelCase` with descriptive action names
- **Pattern**: `[action][Entity].ts` or `[descriptiveAction].ts`
- **Examples**:
  - ✅ `getUserCards.ts`
  - ✅ `getByFormId.ts`
  - ✅ `submitApplicationForm.ts`
  - ❌ `get-user-cards.ts`
  - ❌ `user_cards.ts`

### Function Export Names
- **Format**: `camelCase` matching the filename (without extension)
- **Examples**:
  - File: `getUserCards.ts` → Export: `getUserCards`
  - File: `submitApplicationForm.ts` → Export: `submitApplicationForm`

## Directory Descriptions

### `/admin`
**Purpose**: Administrative scripts and operations
- `migrations.ts` - Database schema migrations
- `seed.ts` - Initial data seeding
- `index.ts` - Administrative function exports

### `/config`
**Purpose**: Configuration and setup files
- `auth.config.ts` - Authentication configuration
- `http.ts` - HTTP endpoint configurations
- `schema.ts` - Database schema definitions
- `index.ts` - Configuration exports

### `/forms`
**Purpose**: Application form handling and processing
- `create.ts` - Form creation logic
- `getById.ts` - Retrieve form by ID
- `getUserApplications.ts` - User's application retrieval
- `submitApplicationForm.ts` - Form submission processing
- `update.ts` - Form update operations
- `index.ts` - Form function exports

### `/healthCards`
**Purpose**: Health card issuance and management
- `getByFormId.ts` - Retrieve cards by form ID
- `getByVerificationToken.ts` - Retrieve cards by verification token
- `getUserCards.ts` - User's health cards
- `issue.ts` - Health card issuance
- `update.ts` - Health card updates
- `index.ts` - Health card function exports

### `/jobCategories`
**Purpose**: Job category CRUD operations
- `create.ts` - Create new job categories
- `delete.ts` - Delete job categories
- `getAll.ts` - Retrieve all categories
- `getById.ts` - Retrieve category by ID
- `update.ts` - Update job categories
- `index.ts` - Job category function exports

### `/notifications`
**Purpose**: User notification system
- `create.ts` - Create notifications
- `getUnreadCount.ts` - Get unread notification count
- `getUserNotifications.ts` - User's notifications
- `markAsRead.ts` - Mark notifications as read
- `index.ts` - Notification function exports

### `/orientations`
**Purpose**: Orientation management (currently minimal)
- `index.ts` - Orientation function exports

### `/payments`
**Purpose**: Payment processing and tracking
- `create.ts` - Create payment records
- `getByFormId.ts` - Retrieve payments by form ID
- `getUserPayments.ts` - User's payment history
- `index.ts` - Payment function exports

### `/requirements`
**Purpose**: Document and category requirement management
- `documentRequirements.ts` - Document requirement logic
- `getCategoryRequirements.ts` - Category-specific requirements
- `requirements.ts` - General requirement operations
- `index.ts` - Requirement function exports

### `/users`
**Purpose**: User management and operations
- `create.ts` - User creation
- `getCurrent.ts` - Current user retrieval
- `getUsersByRole.ts` - Users filtered by role
- `update.ts` - User profile updates
- `updateRole.ts` - User role management
- `index.ts` - User function exports

### `/verification`
**Purpose**: Verification processes and logging
- `verificationLogs.ts` - Verification logging operations
- `index.ts` - Verification function exports

### `/_generated`
**Purpose**: Auto-generated TypeScript files (do not modify)
- Contains API definitions and server types
- Automatically updated by Convex CLI

## File Organization Rules

### Index Files
- Every directory MUST contain an `index.ts` file
- Index files serve as the public API for the directory
- Export only the functions intended for external use
- Use re-export syntax: `export { functionName } from './fileName';`

### Function Organization
- One primary function per file (exceptions for closely related helper functions)
- File name should clearly describe the function's purpose
- Use descriptive action verbs: `get`, `create`, `update`, `delete`, `submit`, `issue`, etc.

### Import Organization
- Group imports by type:
  1. Convex framework imports
  2. Internal type imports
  3. Utility imports
- Use relative imports for files within the same directory
- Use absolute imports for cross-directory references

## Best Practices

### Consistency
- Follow the established naming patterns consistently
- Use similar file structures within each directory
- Maintain consistent export patterns in index files

### Scalability
- Group related functionality into appropriate directories
- Consider creating new directories when functionality grows
- Maintain clear separation of concerns

### Documentation
- Include JSDoc comments for complex functions
- Maintain this structure documentation as the project grows
- Document any deviations from these conventions

## Future Considerations

As the project grows, consider:
- Creating subdirectories within existing directories if they become too large
- Adding a `/shared` or `/common` directory for cross-cutting concerns
- Implementing feature-based organization alongside domain-based organization
- Adding `/types` directory for shared TypeScript interfaces

## Migration Notes

When restructuring existing code:
1. Update import statements to reflect new file locations
2. Ensure index files export all necessary functions
3. Test that all API endpoints continue to work
4. Update any documentation references to old file paths

---

This structure follows Convex best practices and provides a scalable foundation for the eMediaCard project's backend logic.
