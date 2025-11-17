# System Administrator Read-Only Oversight Mode

## Overview

The **System Administrator** role (`system_admin`) has been enhanced with **Read-Only Oversight Mode** for the admin dashboard. This allows system administrators to view all data across all categories without being able to make changes to applications, documents, or payments.

## Key Features

### ✅ What System Admins CAN Do

- ✔️ **View all applications** across all job categories
- ✔️ **Access all admin dashboard pages** (document verification, payment validation, etc.)
- ✔️ **See all data and statistics** without restrictions
- ✔️ **Monitor admin activity** and system health
- ✔️ **Access the super admin dashboard** for system-wide analytics
- ✔️ **Create and manage admin accounts** (still have full access to user management)
- ✔️ **Configure system settings** via the super admin panel

### ❌ What System Admins CANNOT Do (Read-Only)

- ❌ **Approve or reject documents**
- ❌ **Validate or reject payments**
- ❌ **Finalize applications**
- ❌ **Refer documents to doctors**
- ❌ **Flag documents for revision**
- ❌ **Permanently reject applications**
- ❌ **Any mutation that modifies application data**

## Architecture

### Backend Implementation

#### 1. Role Flag in `roles.ts`

```typescript
// backend/convex/users/roles.ts
if (user.role === "system_admin") {
    return {
        isAdmin: true,
        isSuperAdmin: true,
        managedCategories: "all",
        isReadOnlyOversight: true, // 🔒 Read-only for dashboard
    };
}
```

#### 2. Permission Guards in `permissions.ts`

Two new helper functions:

```typescript
// Check if user is in read-only mode
export async function isReadOnlyOversight(ctx): Promise<boolean>

// Require write access - throws error if read-only
export async function requireWriteAccess(ctx): Promise<void>
```

#### 3. Mutation Protection

All critical mutations are protected with `requireWriteAccess(ctx)`:

- `reviewDocument.ts` - Document approval/rejection
- `finalizeApplication.ts` - Application finalization
- `validatePayment.ts` - Payment validation
- `rejectPayment.ts` - Payment rejection
- `referDocument.ts` - Document referral/flagging
- `rejectApplicationFinal.ts` - Permanent rejection

**Example:**

```typescript
// backend/convex/admin/reviewDocument.ts
export const review = mutation({
  handler: async (ctx, args) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) throw new Error("Not authorized");
    
    // 🔒 Prevent system admins from modifying documents
    await requireWriteAccess(ctx);
    
    // ... rest of mutation logic
  },
});
```

### Frontend Implementation

#### 1. ReadOnlyBanner Component

`apps/webadmin/src/components/ReadOnlyBanner.tsx`

A visual banner that displays at the top of dashboard pages when a system admin is viewing in oversight mode.

#### 2. Dashboard Integration

```typescript
// Dashboard page checks adminPrivileges.isReadOnlyOversight
{adminPrivileges.isReadOnlyOversight && <ReadOnlyBanner />}
```

#### 3. Button/Form Disabling (To Be Implemented)

When `adminPrivileges.isReadOnlyOversight === true`, all action buttons should be:
- Disabled with appropriate styling
- Show tooltips explaining read-only mode
- Optionally hidden for critical actions

**Example Pattern:**

```tsx
<button
  onClick={handleApprove}
  disabled={adminPrivileges.isReadOnlyOversight}
  className={`btn ${adminPrivileges.isReadOnlyOversight ? 'opacity-50 cursor-not-allowed' : ''}`}
  title={adminPrivileges.isReadOnlyOversight ? 'Read-only mode: Cannot modify applications' : ''}
>
  Approve Document
</button>
```

## User Experience

### For System Administrators

1. **Login** → System admin credentials
2. **Navigate** → Admin Dashboard (via "Oversee Admin Dashboard" button)
3. **See Banner** → Blue "Read-Only Oversight Mode" banner appears
4. **View Data** → All applications, documents, payments visible
5. **Attempt Action** → Backend returns error: "Access denied: System Administrators have read-only access..."
6. **Return to Super Admin** → Full functionality restored in super admin panel

### Error Messages

When a system admin attempts to modify data, they receive a clear error message:

```
Access denied: System Administrators have read-only access to the admin dashboard. 
You can view all data but cannot make changes to applications, documents, or payments. 
Please use a regular admin account to perform this action.
```

## Security Considerations

### ✅ Defense in Depth

1. **Frontend Checks** - UI disables buttons (user convenience)
2. **Backend Guards** - Mutations throw errors (security enforcement)
3. **Role-Based** - Only system_admin role triggers read-only mode
4. **Audit Trail** - All attempted actions are logged (if implemented)

### 🔒 Backend is Source of Truth

The frontend UI changes are for **user experience** only. The backend `requireWriteAccess()` guard is the **actual security layer** that prevents unauthorized modifications.

## Testing

### Test Scenarios

#### ✅ Read-Only Enforcement

1. Login as `system_admin`
2. Navigate to any application's document verification page
3. Attempt to approve/reject a document
4. **Expected:** Error message displayed, no changes saved

#### ✅ Super Admin Functions Still Work

1. Login as `system_admin`
2. Navigate to Super Admin Dashboard
3. Create a new admin account
4. **Expected:** Account created successfully

#### ✅ Regular Admins Unaffected

1. Login as `admin` (regular admin)
2. Navigate to document verification
3. Approve/reject documents
4. **Expected:** Actions succeed as normal

## Future Enhancements

### Phase 1 (Current)
- ✅ Backend read-only guards
- ✅ Read-only banner component
- ✅ Basic frontend integration

### Phase 2 (Recommended)
- [ ] Disable all action buttons in read-only mode
- [ ] Add tooltips explaining read-only restrictions
- [ ] Hide sensitive action buttons entirely
- [ ] Add read-only indicator to navbar

### Phase 3 (Advanced)
- [ ] Audit log for attempted read-only violations
- [ ] Configurable read-only permissions per resource
- [ ] Temporary write access for system admins (time-limited)
- [ ] Read-only mode toggle in user settings

## Configuration

### Enabling/Disabling Read-Only Mode

To change the read-only behavior, modify `backend/convex/users/roles.ts`:

```typescript
// Enable read-only (default)
if (user.role === "system_admin") {
    return {
        // ...
        isReadOnlyOversight: true,
    };
}

// Disable read-only (give full write access)
if (user.role === "system_admin") {
    return {
        // ...
        isReadOnlyOversight: false,
    };
}
```

## API Reference

### Backend Functions

```typescript
// Get admin privileges (includes isReadOnlyOversight flag)
const privileges = await AdminRole(ctx);
// Returns: { isAdmin, isSuperAdmin, managedCategories, isReadOnlyOversight }

// Check if user is read-only
const isReadOnly = await isReadOnlyOversight(ctx);
// Returns: boolean

// Require write access (throws if read-only)
await requireWriteAccess(ctx);
// Returns: void or throws Error
```

### Frontend Props

```typescript
// Admin privileges from useQuery
const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
// Type: { isAdmin: boolean, isSuperAdmin: boolean, managedCategories: "all" | Id[], isReadOnlyOversight?: boolean }

// Check read-only status
if (adminPrivileges?.isReadOnlyOversight) {
  // Show read-only UI
}
```

## Migration Guide

### For Existing System Admins

No migration needed. The role automatically includes read-only oversight when accessing the admin dashboard.

### For Developers

1. **Update imports** in mutation files:
   ```typescript
   import { requireWriteAccess } from "../users/permissions";
   ```

2. **Add guard** at the start of mutation handlers:
   ```typescript
   await requireWriteAccess(ctx);
   ```

3. **Update UI** to check `adminPrivileges.isReadOnlyOversight`

4. **Test** with system_admin account

## Troubleshooting

### Issue: System admin can still modify data

**Cause:** Missing `requireWriteAccess()` guard in mutation
**Solution:** Add the guard to the mutation handler

### Issue: Regular admins getting read-only errors

**Cause:** Incorrect role check logic
**Solution:** Verify `isReadOnlyOversight` only returns true for `system_admin` role

### Issue: Banner not showing

**Cause:** Frontend not checking `adminPrivileges.isReadOnlyOversight`
**Solution:** Add conditional rendering: `{adminPrivileges.isReadOnlyOversight && <ReadOnlyBanner />}`

## Support

For questions or issues with read-only mode:
- Review this documentation
- Check `backend/convex/users/permissions.ts` for implementation details
- Test with system_admin and regular admin accounts
- Verify backend logs for error messages

---

**Implementation Date:** November 2025  
**Last Updated:** November 2025  
**Status:** ✅ Production Ready
