# WebAdmin Authentication Pattern

## ⚠️ Critical Pattern for All WebAdmin Pages

This document explains the **mandatory authentication pattern** that must be followed in all webadmin pages to prevent "Not authenticated" errors in Convex.

---

## The Problem

When webadmin pages load, they immediately call Convex queries **before authentication is fully established**. This causes:
- ❌ "Not authenticated" errors in Convex logs
- ❌ Failed queries that need to retry
- ❌ Poor user experience
- ❌ Confusion about whether users are actually authenticated

---

## The Solution: "Skip" Pattern

All authenticated queries MUST use the `"skip"` parameter to wait until authentication is ready.

### ✅ Correct Pattern

```typescript
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

export default function MyPage() {
  // 1. Get Clerk auth state
  const { user, isLoaded } = useUser();
  
  // 2. Get admin privileges (this query is safe - returns defaults if not authed)
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isLoaded && user ? undefined : "skip"
  );
  
  // 3. All other authenticated queries MUST wait for auth
  const data = useQuery(
    api.someModule.someQuery,
    isLoaded && user && adminPrivileges && adminPrivileges.isAdmin
      ? { /* your params */ }
      : "skip"  // CRITICAL: Skip if not authenticated!
  );
  
  // 4. Check loading state before rendering
  if (!isLoaded || !adminPrivileges) {
    return <LoadingScreen />;
  }
  
  // 5. Check permissions
  if (!user || !adminPrivileges.isAdmin) {
    return <ErrorMessage title="Access Denied" />;
  }
  
  return <div>{/* Your page content */}</div>;
}
```

### ❌ Incorrect Pattern (Causes Bugs!)

```typescript
// ❌ BAD: Query fires immediately even if not authenticated
const data = useQuery(api.someModule.someQuery, { params });

// ❌ BAD: Query fires with empty params (still makes the call)
const data = useQuery(
  api.someModule.someQuery,
  isLoaded && user ? { params } : {}  // Empty object still calls the query!
);

// ❌ BAD: Only checks after query already failed
const data = useQuery(api.someModule.someQuery, { params });
if (!user) {
  return <ErrorMessage />;  // Too late - query already fired!
}
```

---

## Step-by-Step Guide

### Step 1: Import Clerk's useUser Hook

```typescript
import { useUser } from '@clerk/nextjs';
```

### Step 2: Get Auth State

```typescript
const { user, isLoaded } = useUser();
```

### Step 3: Get Admin Privileges (Safe Query)

```typescript
const adminPrivileges = useQuery(
  api.users.roles.getAdminPrivileges,
  isLoaded && user ? undefined : "skip"
);
```

**Why is this safe?** The `getAdminPrivileges` query returns safe defaults when not authenticated:
```typescript
if (!identity) {
  return { isAdmin: false, isSuperAdmin: false, managedCategories: [] };
}
```

### Step 4: All Other Queries Use Skip Pattern

```typescript
const applications = useQuery(
  api.applications.list.list,
  isLoaded && user && adminPrivileges && adminPrivileges.isAdmin
    ? {
        status: statusFilter || undefined,
        jobCategory: categoryFilter || undefined,
        managedCategories: adminPrivileges.managedCategories
      }
    : "skip"
);
```

### Step 5: Handle Loading State

```typescript
if (!isLoaded || adminPrivileges === undefined) {
  return <LoadingScreen title="Loading..." message="Checking authentication..." />;
}
```

### Step 6: Check Permissions

```typescript
if (!user) {
  return <RedirectToSignIn />;
}

if (!adminPrivileges.isAdmin) {
  return (
    <ErrorMessage 
      title="Access Denied" 
      message="You do not have permission to view this page." 
    />
  );
}
```

---

## Common Scenarios

### Scenario 1: Dashboard with Statistics

```typescript
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isLoaded && user ? undefined : "skip"
  );
  
  // Wait for admin privileges before fetching data
  const applications = useQuery(
    api.applications.list.list,
    isLoaded && user && adminPrivileges && adminPrivileges.isAdmin
      ? { managedCategories: adminPrivileges.managedCategories }
      : "skip"
  );
  
  const stats = useQuery(
    api.dashboard.getStats,
    isLoaded && user && adminPrivileges && adminPrivileges.isAdmin
      ? {}
      : "skip"
  );
  
  // ... loading and permission checks ...
}
```

### Scenario 2: Detail Page with Application ID

```typescript
export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoaded } = useUser();
  
  const application = useQuery(
    api.applications.getById,
    isLoaded && user
      ? { applicationId: params.id }
      : "skip"
  );
  
  const documents = useQuery(
    api.documents.getForApplication,
    isLoaded && user
      ? { applicationId: params.id }
      : "skip"
  );
  
  // ... rest of the component ...
}
```

### Scenario 3: System Admin Only Page

```typescript
export default function SystemAdminPage() {
  const { user, isLoaded } = useUser();
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isLoaded && user ? undefined : "skip"
  );
  
  // Only system admins can access
  const allUsers = useQuery(
    api.users.getAllUsers,
    isLoaded && user && adminPrivileges && adminPrivileges.isSuperAdmin
      ? {}
      : "skip"
  );
  
  if (!isLoaded || !adminPrivileges) {
    return <LoadingScreen />;
  }
  
  if (!adminPrivileges.isSuperAdmin) {
    return <ErrorMessage title="System Admin Only" />;
  }
  
  // ... render system admin content ...
}
```

---

## Role-Based Access Control

### Understanding Admin Privileges

```typescript
type AdminPrivileges = {
  isAdmin: boolean;           // true for admin or system_admin
  isSuperAdmin: boolean;      // true only for system_admin
  managedCategories: "all" | Id<"jobCategories">[] | [];
};
```

### Checking Access Levels

```typescript
// Check if user is any type of admin
if (adminPrivileges.isAdmin) {
  // Show admin features
}

// Check if user is system admin (full access)
if (adminPrivileges.isSuperAdmin) {
  // Show system admin features
}

// Check if user has access to all categories
if (adminPrivileges.managedCategories === "all") {
  // Show all categories
} else if (Array.isArray(adminPrivileges.managedCategories)) {
  // Filter by managed categories
  const allowedData = data.filter(item =>
    adminPrivileges.managedCategories.includes(item.categoryId)
  );
}
```

---

## Backend Query Best Practices

### For Public/Semi-Public Queries

Return safe defaults when not authenticated:

```typescript
export const getAdminPrivileges = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Return safe defaults - don't throw!
    if (!identity) {
      return { isAdmin: false, isSuperAdmin: false, managedCategories: [] };
    }
    
    // ... rest of logic ...
  }
});
```

### For Protected Queries

Throw descriptive errors for auth failures:

```typescript
export const getApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Throw if not authenticated - frontend should skip this query
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user || user.role !== "admin") {
      throw new Error("Insufficient permissions");
    }
    
    // ... rest of logic ...
  }
});
```

---

## Testing Checklist

When implementing a new webadmin page:

- [ ] Import `useUser` from `@clerk/nextjs`
- [ ] Get `isLoaded` and `user` from `useUser()`
- [ ] All `useQuery` calls use "skip" parameter
- [ ] `adminPrivileges` query waits for `isLoaded && user`
- [ ] All other queries wait for `isLoaded && user && adminPrivileges`
- [ ] Loading state checks for `!isLoaded || !adminPrivileges`
- [ ] Permission checks after loading is complete
- [ ] No "Not authenticated" errors in Convex logs during page load
- [ ] Page works correctly for both admin and system_admin roles
- [ ] Page shows appropriate error for non-admin users

---

## Debugging Auth Issues

### Check These Common Mistakes

1. **Missing "skip" parameter**
   ```typescript
   // ❌ Wrong
   const data = useQuery(api.module.query, { params });
   
   // ✅ Correct
   const data = useQuery(
     api.module.query,
     isLoaded && user ? { params } : "skip"
   );
   ```

2. **Using empty object instead of "skip"**
   ```typescript
   // ❌ Wrong - still makes the call!
   const data = useQuery(api.module.query, isLoaded ? { params } : {});
   
   // ✅ Correct
   const data = useQuery(api.module.query, isLoaded ? { params } : "skip");
   ```

3. **Checking auth AFTER query is called**
   ```typescript
   // ❌ Wrong - query already fired before this check
   const data = useQuery(api.module.query, { params });
   if (!user) return <ErrorMessage />;
   
   // ✅ Correct - prevent query from firing
   const data = useQuery(
     api.module.query,
     user ? { params } : "skip"
   );
   ```

4. **Not waiting for adminPrivileges to load**
   ```typescript
   // ❌ Wrong - adminPrivileges might be undefined
   const data = useQuery(api.module.query, {
     managedCategories: adminPrivileges.managedCategories  // undefined error!
   });
   
   // ✅ Correct
   const data = useQuery(
     api.module.query,
     adminPrivileges ? { managedCategories: adminPrivileges.managedCategories } : "skip"
   );
   ```

### Check Convex Logs

Look for these error patterns:
```
Error: Not authenticated
  at handler (backend/convex/someQuery.ts:10)
```

If you see these errors on page load, the query is being called before auth is ready!

---

## Migration Guide

If you're fixing an existing page with auth issues:

1. **Find the useQuery calls** without skip logic
2. **Add useUser hook** at the top of the component
3. **Add skip parameter** to each query
4. **Add loading state checks** before rendering
5. **Test the page** - verify no "Not authenticated" errors

### Example Migration

**Before (Buggy):**
```typescript
export default function MyPage() {
  const data = useQuery(api.module.query, { params });
  
  return <div>{data?.name}</div>;
}
```

**After (Fixed):**
```typescript
import { useUser } from '@clerk/nextjs';

export default function MyPage() {
  const { user, isLoaded } = useUser();
  
  const data = useQuery(
    api.module.query,
    isLoaded && user ? { params } : "skip"
  );
  
  if (!isLoaded || !data) {
    return <LoadingScreen />;
  }
  
  return <div>{data.name}</div>;
}
```

---

## References

- **Example Files (Correct Pattern):**
  - `apps/webadmin/src/app/dashboard/page.tsx`
  - `apps/webadmin/src/app/super-admin/page.tsx`
  - `apps/webadmin/src/app/dashboard/rejection-history/page.tsx`
  
- **Backend Auth:**
  - `backend/convex/users/roles.ts` - AdminRole function
  - `backend/convex/users/permissions.ts` - Permission helpers

- **Related Documentation:**
  - `SYSTEM_ADMIN_ROLE.md` - Role hierarchy and permissions
  - `WEBADMIN_CHANGES_NOV_13_2025.md` - Recent webadmin updates

---

## Quick Reference Card

```typescript
// 1. Import
import { useUser } from '@clerk/nextjs';

// 2. Get auth state
const { user, isLoaded } = useUser();

// 3. Get privileges
const adminPrivileges = useQuery(
  api.users.roles.getAdminPrivileges,
  isLoaded && user ? undefined : "skip"
);

// 4. All other queries
const data = useQuery(
  api.module.query,
  isLoaded && user && adminPrivileges && adminPrivileges.isAdmin
    ? { ...params }
    : "skip"
);

// 5. Loading check
if (!isLoaded || !adminPrivileges) {
  return <LoadingScreen />;
}

// 6. Permission check
if (!user || !adminPrivileges.isAdmin) {
  return <ErrorMessage />;
}

// 7. Render page
return <div>{/* content */}</div>;
```

---

**Last Updated:** November 15, 2025  
**Maintainer:** Development Team
