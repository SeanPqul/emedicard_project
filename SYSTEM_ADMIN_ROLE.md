# System Administrator Role Implementation

## Overview
The system now has a clear **three-tier role hierarchy** for better professionalism and clarity:

```
System Administrator (system_admin)   ← Highest privilege (full access)
         ↓
Administrator (admin)                 ← Category-specific access
         ↓
Inspector (inspector)                 ← Review & verification only
         ↓
Applicant (applicant)                 ← Regular users
```

## Role Definitions

### 1. **System Administrator** (`system_admin`)
- **Highest privilege level**
- Full access to all system features and categories
- Can manage all job categories without restrictions
- Can create and manage other administrators
- Intended for IT/platform management
- **No `managedCategories` field needed** - has universal access

### 2. **Administrator** (`admin`)
- Mid-level administrative access
- Limited to specific job categories (via `managedCategories` array)
- Can review documents, approve applications within assigned categories
- Cannot access categories outside their assigned scope
- Intended for category-specific administrative staff

### 3. **Inspector** (`inspector`)
- Document review and verification
- Limited to inspection duties
- No administrative capabilities

### 4. **Applicant** (`applicant`)
- Regular end-users
- Can submit applications and track status

## What Changed?

### Schema Updates
**File:** `backend/convex/schema.ts`
```typescript
role: v.optional(
  v.union(
    v.literal("applicant"),
    v.literal("inspector"),
    v.literal("admin"),
    v.literal("system_admin")  // ← NEW
  )
)
```

### TypeScript Type Updates
Updated in **4 locations**:
1. `packages/types/src/user.ts`
2. `packages/types/src/user.d.ts`
3. `apps/mobile/src/entities/user/model/types.ts`
4. `apps/mobile/src/entities/auth/model/types.ts`

```typescript
export type UserRole = 'applicant' | 'inspector' | 'admin' | 'system_admin';
```

### Role Checking Logic
**File:** `backend/convex/users/roles.ts`

The `AdminRole` function now returns:
```typescript
{
  isAdmin: boolean,        // true for both admin and system_admin
  isSuperAdmin: boolean,   // true only for system_admin
  managedCategories: "all" | Id<"jobCategories">[] | []
}
```

**Logic:**
- `role === "system_admin"` → Full access (`managedCategories: "all"`)
- `role === "admin"` + no `managedCategories` → Full access (backward compatibility)
- `role === "admin"` + has `managedCategories` → Limited access to those categories

## Migration Required

### Running the Migration

After deploying the schema changes, you **MUST** run the migration to convert existing super admins:

#### Step 1: Deploy Schema Changes
```bash
cd backend
npx convex deploy
```

#### Step 2: Run Migration
Open Convex Dashboard → Functions → Internal → Run:
```
migrations/migrateToSystemAdmin:migrateToSystemAdmin
```

This will:
- ✅ Find all `admin` users with no `managedCategories`
- ✅ Convert them to `system_admin` role
- ⏭️ Skip `admin` users with `managedCategories` (keep as regular admins)

#### Step 3: Verify Results
Check the console output in Convex dashboard:
```
🔄 Starting migration: Super Admin → System Administrator
📊 Found 2 admin users to review
✅ Migrated: admin@emedicard.com → system_admin
⏭️  Skipped: johndoe@emedicard.com (has managed categories)

📈 Migration Summary:
   ✅ Updated: 1 users to system_admin
   ⏭️  Skipped: 1 regular admins
   ⏱️  Duration: 234ms
✨ Migration completed successfully!
```

### Rollback (If Needed)
If something goes wrong, you can rollback:
```
migrations/migrateToSystemAdmin:rollbackSystemAdmin
```

## Creating New System Administrators

### Option 1: Via Web Interface
1. Login as existing System Administrator
2. Go to Super Admin Dashboard
3. Click "Create Admin Account"
4. Select role: **"System Administrator"**
5. Leave `managedCategories` empty (or it will auto-apply "all")

### Option 2: Via Convex Function
Call the `createAdmin` mutation:
```typescript
await convex.mutation(api.superAdmin.mutations.createAdmin, {
  email: "newsysadmin@emedicard.com",
  password: "SecurePass123!",
  managedCategoryIds: [], // Empty for system_admin
  role: "system_admin",
  fullname: "System Admin Name"
});
```

## Checking Roles in Code

### Backend (Convex) - Using Permission Helpers ✨ NEW

**RECOMMENDED:** Use the centralized permission helpers for cleaner, consistent code:

```typescript
import { requireAccess, hasAccess, isSystemAdmin } from "./users/permissions";

// ✅ BEST: Require access (throws if denied)
await requireAccess(ctx, "category", categoryId);
await requireAccess(ctx, "user_management"); // System admin only

// ✅ Check without throwing (for conditional logic)
const canEdit = await hasAccess(ctx, "category", categoryId);
const isSysAdmin = await isSystemAdmin(ctx);

// ✅ Filter data by accessible categories
const apps = await filterByCategory(ctx, allApplications);
```

### Backend (Convex) - Direct Role Check (Legacy)

If you need low-level access to privileges:

```typescript
import { AdminRole } from "./users/roles";

const privileges = await AdminRole(ctx);

if (!privileges.isSuperAdmin) {
  throw new Error("System Administrator access required");
}

if (privileges.managedCategories === "all") {
  // Full access
} else if (privileges.managedCategories.includes(categoryId)) {
  // Has access to this category
}
```

### Frontend (Web Admin)
```typescript
const user = useQuery(api.users.index.getCurrentUser);

if (user?.role === 'system_admin') {
  // Show system admin features
}

if (user?.role === 'admin' || user?.role === 'system_admin') {
  // Show admin features
}
```

## Permission Helper Functions

We've centralized all permission logic in `backend/convex/users/permissions.ts` to avoid code duplication and ensure consistency.

### Available Functions:

| Function | Purpose | Example |
|----------|---------|----------|
| `requireAccess()` | Throw error if access denied | `await requireAccess(ctx, "category", catId)` |
| `hasAccess()` | Check access without throwing | `const canEdit = await hasAccess(ctx, "category", catId)` |
| `isSystemAdmin()` | Check if user is system admin | `if (await isSystemAdmin(ctx)) { ... }` |
| `isAdmin()` | Check if user is any admin | `if (await isAdmin(ctx)) { ... }` |
| `getAccessibleCategories()` | Get all accessible categories | `const cats = await getAccessibleCategories(ctx)` |
| `filterByCategory()` | Filter items by category access | `const apps = await filterByCategory(ctx, allApps)` |

### Protected Resources:

- `"category"` - Job category management (requires category ID)
- `"admin_panel"` - Admin dashboard access (any admin)
- `"all_data"` - Full system data access (system admin only)
- `"user_management"` - Create/manage admins (system admin only)
- `"system_config"` - System configuration (system admin only)

### Why Use These Helpers?

✅ **DRY (Don't Repeat Yourself)** - Write access logic once, use everywhere  
✅ **Consistency** - Same permission rules across all functions  
✅ **Maintainability** - Change logic in one place, affects entire app  
✅ **Readability** - `requireAccess()` is clearer than nested if statements  
✅ **Type Safety** - TypeScript autocomplete for resource types

See `backend/convex/users/permissions.examples.ts` for 7 detailed usage examples.

## Database Structure

### Before Migration
```javascript
{
  _id: "user123",
  email: "admin@emedicard.com",
  role: "admin",
  managedCategories: undefined  // Super admin (has all access)
}
```

### After Migration
```javascript
{
  _id: "user123",
  email: "admin@emedicard.com",
  role: "system_admin",  // ← Explicit role
  managedCategories: undefined  // Not needed for system_admin
}
```

### Regular Admin (No Change)
```javascript
{
  _id: "user456",
  role: "admin",
  managedCategories: ["category1", "category2"]  // Limited access
}
```

## UI/UX Recommendations

### Display Names
- Backend: `"system_admin"` (code)
- Frontend: **"System Administrator"** (display label)

### Route Protection
```typescript
// Super Admin only routes
if (user?.role !== 'system_admin') {
  redirect('/dashboard');
}

// Admin or higher
if (!['admin', 'system_admin'].includes(user?.role)) {
  redirect('/unauthorized');
}
```

## Benefits for Panel Review

When your panelist reviews the backend:

✅ **Clear role hierarchy** - No ambiguity about who has what access
✅ **Professional terminology** - "System Administrator" sounds more formal than "Super Admin"
✅ **Explicit in schema** - Role is defined directly in the database schema
✅ **Backward compatible** - Old admins without categories still work (treated as system_admin in logic)
✅ **Auditable** - Easy to query all system administrators: `db.query("users").filter(u => u.role === "system_admin")`

## Testing Checklist

- [ ] Deploy schema changes successfully
- [ ] Run migration and verify console output
- [ ] Login as System Administrator - verify full access
- [ ] Login as regular Admin - verify category restrictions work
- [ ] Create new System Administrator account
- [ ] Create new regular Administrator with specific categories
- [ ] Test role-based route protection
- [ ] Verify frontend displays "System Administrator" label
- [ ] Test AdminRole() function returns correct privileges

## Troubleshooting

### Issue: Migration didn't update any users
**Cause:** No admins found without `managedCategories`
**Solution:** Check if your current super admins actually have `managedCategories: undefined` in DB

### Issue: TypeScript errors after update
**Cause:** Need to rebuild types
**Solution:** 
```bash
cd packages/types
npm run build

cd ../../backend
npx convex dev  # Regenerate Convex types
```

### Issue: Frontend still shows old role labels
**Cause:** Cached user data
**Solution:** Hard refresh (Ctrl+Shift+R) or clear browser cache

## Support

For questions or issues, contact the development team or check:
- Schema: `backend/convex/schema.ts`
- Role Logic: `backend/convex/users/roles.ts`
- Migration: `backend/convex/migrations/migrateToSystemAdmin.ts`
