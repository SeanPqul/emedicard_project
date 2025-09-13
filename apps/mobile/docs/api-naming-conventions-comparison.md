# API Naming Conventions Comparison

## Current Structure: `*.api.ts`
```
src/api/
├── users.api.ts
├── forms.api.ts  
├── payments.api.ts
└── notifications.api.ts
```

**Pros:**
- Clear API intent
- Feature-based organization
- Consistent naming
- Easy to locate API functions

**Cons:**
- Generic "api" name doesn't specify database operations

## Alternative 1: `*.service.ts` (Service Layer Pattern)
```
src/services/
├── users.service.ts
├── forms.service.ts  
├── payments.service.ts
└── notifications.service.ts
```

**Pros:**
- More enterprise-standard naming
- Implies business logic layer
- Commonly understood in backend development

**Cons:**
- Less specific about database operations
- Can include non-database logic

## Alternative 2: `*.repository.ts` (Repository Pattern)
```
src/repositories/
├── users.repository.ts
├── forms.repository.ts  
├── payments.repository.ts
└── notifications.repository.ts
```

**Pros:**
- Clear database abstraction layer
- Repository pattern is well-known
- Specifically for data access

**Cons:**
- More formal/enterprise-heavy naming
- Might be overkill for simple CRUD

## Alternative 3: `*.queries.ts` (Query-Specific)
```
src/queries/
├── users.queries.ts
├── forms.queries.ts  
├── payments.queries.ts
└── notifications.queries.ts
```

**Pros:**
- Very specific to database queries
- Clear intent for data fetching

**Cons:**
- Doesn't cover mutations
- Might need separate files for mutations

## Alternative 4: `*.data.ts` (Data Access Layer)
```
src/data/
├── users.data.ts
├── forms.data.ts  
├── payments.data.ts
└── notifications.data.ts
```

**Pros:**
- Clear data access intent
- Simple and descriptive

**Cons:**
- Less specific about API nature

## Alternative 5: Mixed Approach
```
src/database/
├── users.db.ts
├── forms.db.ts  
├── payments.db.ts
└── notifications.db.ts
```

**Pros:**
- Very explicit about database operations
- Short and clear

## Recommendation for Your Project

**Keep your current `*.api.ts` naming!** Here's why it's actually excellent for your use case:

1. **Convex Integration**: Since you're using Convex, "api" aligns well with Convex's API structure
2. **React Native Context**: In mobile development, "api" is more intuitive than "repository"  
3. **Team Understanding**: More developers understand "api" than "repository pattern"
4. **Consistency**: You already have it implemented consistently

## Optional Enhancement: Add JSDoc

Consider adding more descriptive JSDoc comments to make the purpose even clearer:

```typescript
/**
 * Users API Module
 * 
 * Centralized database transactions for user-related operations.
 * All functions interact with Convex backend for user data management.
 * 
 * @module UsersAPI
 */
```

## Folder Structure Enhancement

If you want to be more explicit about database transactions, you could organize like this:

```
src/
├── api/           # Current structure (KEEP THIS)
│   ├── users.api.ts
│   └── forms.api.ts
├── database/      # Optional: Direct DB utilities
│   └── migrations/
└── storage/       # File/media operations
    └── uploads.ts
```

## Conclusion

Your current `*.api.ts` naming is **perfect** for your project because:
- It's appropriate for Convex backend integration
- Clear and consistent across your codebase  
- Familiar to React Native developers
- Already implemented and working well

**Recommendation: Keep your current naming convention!**
