# Permission Helpers - Quick Start Guide

## TL;DR
Use centralized permission functions instead of manually checking `AdminRole()` everywhere.

## Common Patterns

### ✅ DO: Use Helper Functions
```typescript
import { requireAccess } from "./permissions";

// Protect a mutation
await requireAccess(ctx, "category", categoryId);
```

### ❌ DON'T: Manually Check Everywhere
```typescript
// This gets repetitive and error-prone
const privileges = await AdminRole(ctx);
if (!privileges.isAdmin) throw new Error("...");
if (privileges.managedCategories !== "all") {
  if (!privileges.managedCategories.includes(categoryId)) {
    throw new Error("...");
  }
}
```

## Most Common Use Cases

### 1. Protect a Mutation (Throw if Denied)
```typescript
export const approveDocument = mutation({
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.docId);
    
    // One line - throws if no access
    await requireAccess(ctx, "category", doc.jobCategoryId);
    
    // Continue with logic...
  }
});
```

### 2. Conditional Features (Check Without Throwing)
```typescript
export const getDocument = query({
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.docId);
    const canEdit = await hasAccess(ctx, "category", doc.jobCategoryId);
    
    return {
      ...doc,
      canEdit,
      showEditButton: canEdit
    };
  }
});
```

### 3. System Admin Only Features
```typescript
export const createAdmin = mutation({
  handler: async (ctx, args) => {
    // Only system admins can do this
    await requireAccess(ctx, "user_management");
    
    // Create admin user...
  }
});
```

### 4. Filter Data by Access
```typescript
export const listApplications = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("applications").collect();
    
    // Automatically filters based on user's categories
    return await filterByCategory(ctx, all);
  }
});
```

### 5. Get Categories for Dropdown
```typescript
export const getMyCategoriesDropdown = query({
  handler: async (ctx) => {
    const categoryIds = await getAccessibleCategories(ctx);
    
    if (categoryIds === "all") {
      return await ctx.db.query("jobCategories").collect();
    }
    
    return await Promise.all(
      categoryIds.map(id => ctx.db.get(id))
    );
  }
});
```

## Resource Types

| Resource | Who Has Access | Use Case |
|----------|---------------|----------|
| `"category"` | Admin with that category OR system admin | Document approval, application management |
| `"admin_panel"` | Any admin | Show admin menu |
| `"all_data"` | System admin only | View all reports, analytics |
| `"user_management"` | System admin only | Create/delete admins |
| `"system_config"` | System admin only | Change system settings |

## Quick Function Reference

```typescript
// Throw if no access
await requireAccess(ctx, "category", categoryId);
await requireAccess(ctx, "user_management");

// Check without throwing
const canEdit = await hasAccess(ctx, "category", categoryId);
const canManageUsers = await hasAccess(ctx, "user_management");

// Role checks
const isSysAdmin = await isSystemAdmin(ctx);
const isAnyAdmin = await isAdmin(ctx);

// Get categories
const categories = await getAccessibleCategories(ctx);
// Returns: "all" | Id<"jobCategories">[]

// Filter data
const accessible = await filterByCategory(ctx, allItems);
```

## Migration Guide

### Before (Old Way)
```typescript
const privileges = await AdminRole(ctx);

if (!privileges.isAdmin) {
  throw new Error("Admin required");
}

if (privileges.managedCategories === "all") {
  // Full access
} else if (!privileges.managedCategories.includes(categoryId)) {
  throw new Error("No access to category");
}
```

### After (New Way)
```typescript
await requireAccess(ctx, "category", categoryId);
```

**83% less code, easier to read, no bugs! 🎉**

## For Your Panel Defense

When asked about access control:

> "We use a centralized permission system with typed resource checks. All access control logic is in one place (`permissions.ts`), making it easy to audit and maintain. Instead of repeating access checks everywhere, we have simple helper functions like `requireAccess()` that enforce consistent security rules across the entire backend."

This shows:
- ✅ Security awareness
- ✅ Clean code practices (DRY)
- ✅ Maintainability focus
- ✅ Professional architecture

## Examples

See `permissions.examples.ts` for 7 complete, copy-paste ready examples.

## Support

Questions? Check:
- Full docs: `SYSTEM_ADMIN_ROLE.md`
- Code: `backend/convex/users/permissions.ts`
- Examples: `backend/convex/users/permissions.examples.ts`
