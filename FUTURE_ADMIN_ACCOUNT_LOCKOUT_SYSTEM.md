# Admin Account Lockout & Unlock System - Future Implementation

## 📋 Document Information

**Feature:** Admin Account Lockout & Password Reset System  
**Target Users:** Admin & System Admin (Web Dashboard Only)  
**Status:** Future Recommendation  
**Priority:** Medium-High (Security Enhancement)  
**Estimated Implementation Time:** 2-3 Days  
**Last Updated:** 2025-11-13

---

## 🎯 Problem Statement

### Current Situation

Currently, the webadmin login relies solely on Clerk's authentication without additional application-level security controls. This presents several concerns:

1. **No Lockout Mechanism:** Admins can attempt login indefinitely with failed passwords
2. **No Tracking:** Failed login attempts are not tracked or logged in our database
3. **No Control:** System Administrators cannot manually unlock accounts or reset passwords for locked admins
4. **Security Gap:** Potential brute-force attacks on admin accounts have no prevention layer
5. **Office Hours Constraint:** Since admins only work on-site during office hours (8 AM - 5 PM, Mon-Fri), email-based password recovery may face delays due to government email server restrictions

### Business Context

- **Environment:** Government office (Davao City Health Office)
- **Access Pattern:** On-site only, during office hours
- **Users:** Admins and System Admins work in same building
- **Email Domain:** @emedicard.com (government-assigned, may have strict spam filters)
- **Physical Security:** High (venue access controlled by security)

---

## ✅ Proposed Solution

### Overview

Implement a **Hybrid Token-Based Account Lockout System** with two unlock options:

1. **Simple Unlock:** For typos/CapsLock errors (admin remembers password)
2. **Token-Based Password Reset:** For forgotten passwords (no email dependency)

### Key Features

✅ Track failed login attempts at application level  
✅ Lock account after 5 failed attempts  
✅ Ban account in Clerk when locked  
✅ System Admin dashboard for managing locked accounts  
✅ Token-based password reset (no email delays)  
✅ In-app reset modal (triggered on login attempt only)  
✅ Full audit logging of all lockout/unlock activities  
✅ Real-time sync between Clerk and Convex  

---

## 🏗️ Architecture

### System Flow

```
┌─────────────────────────────────────────────────────────┐
│  Admin Attempts Login                                    │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  Step 1: Check Convex DB (Before Clerk)                 │
│  Query: users table → isLocked field                     │
└─────────────────────────────────────────────────────────┘
                      ↓
          ┌───────────┴───────────┐
          │                       │
    ✅ NOT LOCKED           ❌ LOCKED
          │                       │
          ↓                       ↓
┌──────────────────┐   ┌────────────────────────────────┐
│ Proceed to Clerk │   │ Block Login                    │
│ Authentication   │   │ Show Error Message:            │
└──────────────────┘   │ "Account locked. Visit System  │
          │            │ Administrator at Room 203"     │
   ┌──────┴──────┐     └────────────────────────────────┘
   │             │
SUCCESS      FAILED
   │             │
   ↓             ↓
┌────────┐  ┌──────────────────────────────────────┐
│ Login  │  │ Increment failedLoginAttempts in DB  │
│  OK    │  │ If failedLoginAttempts >= 5:         │
└────────┘  │   • Set isLocked = true              │
            │   • Call clerk.users.banUser()       │
            │   • Log lockout event                │
            └──────────────────────────────────────┘
```

### Database Architecture

```
┌──────────────────────────────────────────────┐
│ users table (EXTENDED)                       │
├──────────────────────────────────────────────┤
│ + isLocked: boolean                          │
│ + failedLoginAttempts: number                │
│ + lastFailedLoginAt: timestamp               │
│ + lockedAt: timestamp                        │
│ + lockedReason: string                       │
│ + unlockedBy: userId (foreign key)           │
│ + unlockedAt: timestamp                      │
│ + lastSuccessfulLoginAt: timestamp           │
└──────────────────────────────────────────────┘
                    ↓ references
┌──────────────────────────────────────────────┐
│ passwordResetTokens table (NEW)              │
├──────────────────────────────────────────────┤
│ userId: Id<"users">                          │
│ token: string (32-byte random)               │
│ expiresAt: timestamp (15 min from creation)  │
│ createdBy: Id<"users"> (system admin)        │
│ used: boolean                                │
│ usedAt: timestamp                            │
└──────────────────────────────────────────────┘
                    ↓ logs to
┌──────────────────────────────────────────────┐
│ adminActivityLogs table (EXISTING)           │
├──────────────────────────────────────────────┤
│ Used for logging:                            │
│ • Account lockouts                           │
│ • Unlock actions                             │
│ • Password resets                            │
└──────────────────────────────────────────────┘
```

---

## 💾 Implementation Details

### 1. Database Schema Changes

**File:** `backend/convex/schema.ts`

#### Extend Users Table

```typescript
users: defineTable({
  // ... existing fields ...
  
  // NEW: Account Lockout Fields
  isLocked: v.optional(v.boolean()),
  failedLoginAttempts: v.optional(v.float64()),
  lastFailedLoginAt: v.optional(v.float64()),
  lockedAt: v.optional(v.float64()),
  lockedReason: v.optional(v.string()),
  unlockedBy: v.optional(v.id("users")),
  unlockedAt: v.optional(v.float64()),
  lastSuccessfulLoginAt: v.optional(v.float64()),
})
  .index("by_clerk_id", ["clerkId"])
  .index("by_role", ["role"])
  .index("by_email", ["email"])
  .index("by_locked_status", ["isLocked"]), // NEW INDEX
```

#### Add Password Reset Tokens Table

```typescript
passwordResetTokens: defineTable({
  userId: v.id("users"),
  token: v.string(), // 32-byte secure random token
  expiresAt: v.float64(), // Token valid for 15 minutes
  createdBy: v.id("users"), // Which system admin created it
  used: v.optional(v.boolean()),
  usedAt: v.optional(v.float64()),
  createdAt: v.float64(),
})
  .index("by_user", ["userId"])
  .index("by_token", ["token"])
  .index("by_expiry", ["expiresAt"]),
```

---

### 2. Backend Mutations

**File:** `backend/convex/users/accountLockout.ts` (NEW FILE)

```typescript
"use node";
import { createClerkClient } from "@clerk/backend";
import { v } from "convex/values";
import { action, mutation } from "../_generated/server";
import { api } from "../_generated/api";
import crypto from "crypto";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Track failed login attempt
export const trackFailedLogin = mutation({
  args: {
    email: v.string(),
    timestamp: v.float64(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return { success: false, message: "User not found" };

    // Skip if applicants (only track admins/system_admins)
    if (user.role === "applicant") {
      return { success: true, locked: false };
    }

    const newAttempts = (user.failedLoginAttempts || 0) + 1;
    const shouldLock = newAttempts >= 5;

    await ctx.db.patch(user._id, {
      failedLoginAttempts: newAttempts,
      lastFailedLoginAt: args.timestamp,
      ...(shouldLock && {
        isLocked: true,
        lockedAt: args.timestamp,
        lockedReason: "Too many failed login attempts (5+)",
      }),
    });

    // Log the failed attempt
    await ctx.db.insert("adminActivityLogs", {
      adminId: user._id,
      activityType: shouldLock ? "account_locked" : "failed_login",
      details: shouldLock 
        ? `Account automatically locked after ${newAttempts} failed attempts`
        : `Failed login attempt ${newAttempts}/5`,
      timestamp: args.timestamp,
    });

    return { 
      success: true, 
      locked: shouldLock,
      attempts: newAttempts,
    };
  },
});

// Lock account in Clerk (called after mutation)
export const lockAccountInClerk = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.index.getUserById, {
      userId: args.userId,
    });

    if (!user) throw new Error("User not found");

    try {
      // Ban user in Clerk
      await clerk.users.banUser(user.clerkId);
      return { success: true };
    } catch (error: any) {
      console.error("Failed to ban user in Clerk:", error);
      return { success: false, message: error.message };
    }
  },
});

// Clear failed attempts after successful login
export const clearFailedAttempts = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return;

    await ctx.db.patch(user._id, {
      failedLoginAttempts: 0,
      lastFailedLoginAt: undefined,
      lastSuccessfulLoginAt: Date.now(),
    });
  },
});

// Generate secure token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Unlock account (with two options)
export const unlockUserAccount = action({
  args: {
    userId: v.id("users"),
    unlockedBy: v.id("users"),
    notes: v.string(),
    requirePasswordReset: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.index.getUserById, {
      userId: args.userId,
    });

    if (!user) return { success: false, message: "User not found" };

    try {
      // Step 1: Unban in Clerk
      await clerk.users.unbanUser(user.clerkId);

      // Step 2: Update Convex DB
      await ctx.runMutation(api.users.accountLockout.updateLockStatus, {
        userId: args.userId,
        isLocked: false,
        failedLoginAttempts: 0,
        unlockedBy: args.unlockedBy,
        unlockedAt: Date.now(),
      });

      // Step 3: Log the unlock
      await ctx.runMutation(api.admin.activityLogs.logActivity, {
        adminId: args.unlockedBy,
        action: `Unlocked account for ${user.email}`,
        details: `Method: ${args.requirePasswordReset ? 'With password reset' : 'Simple unlock'}. Notes: ${args.notes}`,
        timestamp: Date.now(),
      });

      // Step 4: If password reset required, generate token
      if (args.requirePasswordReset) {
        const token = generateSecureToken();
        
        await ctx.runMutation(api.users.accountLockout.createResetToken, {
          userId: args.userId,
          token: token,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
          createdBy: args.unlockedBy,
        });

        return {
          success: true,
          message: "Account unlocked. Tell admin to refresh and try logging in - password reset required.",
          requiresReset: true,
        };
      }

      return {
        success: true,
        message: "Account unlocked. Admin can try logging in with existing password.",
        requiresReset: false,
      };

    } catch (error: any) {
      console.error("Failed to unlock account:", error);
      return { success: false, message: error.message };
    }
  },
});

// Update lock status (mutation helper)
export const updateLockStatus = mutation({
  args: {
    userId: v.id("users"),
    isLocked: v.boolean(),
    failedLoginAttempts: v.float64(),
    unlockedBy: v.id("users"),
    unlockedAt: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isLocked: args.isLocked,
      failedLoginAttempts: args.failedLoginAttempts,
      unlockedBy: args.unlockedBy,
      unlockedAt: args.unlockedAt,
    });
  },
});

// Create reset token (mutation helper)
export const createResetToken = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.float64(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Delete any existing tokens for this user
    const existingTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const token of existingTokens) {
      await ctx.db.delete(token._id);
    }

    // Create new token
    await ctx.db.insert("passwordResetTokens", {
      userId: args.userId,
      token: args.token,
      expiresAt: args.expiresAt,
      createdBy: args.createdBy,
      used: false,
      createdAt: Date.now(),
    });
  },
});

// Reset password with token
export const resetPasswordWithToken = action({
  args: {
    token: v.string(),
    email: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify token
    const resetToken = await ctx.runQuery(api.users.accountLockout.verifyResetToken, {
      token: args.token,
    });

    if (!resetToken.valid) {
      return { success: false, message: "Invalid or expired token" };
    }

    try {
      // Get user
      const user = await ctx.runQuery(api.users.getUserByEmail, {
        email: args.email,
      });

      if (!user) return { success: false, message: "User not found" };

      // Update password in Clerk
      await clerk.users.updateUser(user.clerkId, {
        password: args.newPassword,
      });

      // Mark token as used
      await ctx.runMutation(api.users.accountLockout.markTokenUsed, {
        token: args.token,
      });

      // Log password reset
      await ctx.runMutation(api.admin.activityLogs.logActivity, {
        adminId: user._id,
        action: `Password reset via token`,
        details: `Admin ${user.email} successfully reset password using unlock token`,
        timestamp: Date.now(),
      });

      return { success: true };

    } catch (error: any) {
      console.error("Failed to reset password:", error);
      return { success: false, message: error.message };
    }
  },
});

// Mark token as used
export const markTokenUsed = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (resetToken) {
      await ctx.db.patch(resetToken._id, {
        used: true,
        usedAt: Date.now(),
      });
    }
  },
});
```

---

### 3. Backend Queries

**File:** `backend/convex/users/accountLockoutQueries.ts` (NEW FILE)

```typescript
import { v } from "convex/values";
import { query } from "../_generated/server";

// Check account status before login
export const checkAccountStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return {
        exists: false,
        isLocked: false,
        hasResetToken: false,
      };
    }

    // Only check lockout for admins/system_admins (skip applicants)
    if (user.role === "applicant") {
      return {
        exists: true,
        isLocked: false,
        hasResetToken: false,
      };
    }

    // Check for pending reset token
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("used"), false),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .first();

    return {
      exists: true,
      isLocked: user.isLocked || false,
      hasResetToken: !!resetToken,
      token: resetToken?.token || null,
      failedAttempts: user.failedLoginAttempts || 0,
      lockedAt: user.lockedAt,
    };
  },
});

// Get all locked accounts (for System Admin dashboard)
export const getLockedAccounts = query({
  args: {},
  handler: async (ctx) => {
    const lockedUsers = await ctx.db
      .query("users")
      .withIndex("by_locked_status", (q) => q.eq("isLocked", true))
      .collect();

    // Filter only admins/system_admins (exclude applicants if any got locked)
    const adminAccounts = lockedUsers.filter(
      (user) => user.role === "admin" || user.role === "system_admin"
    );

    // Enrich with category info
    const enrichedAccounts = await Promise.all(
      adminAccounts.map(async (user) => {
        let categoryNames: string[] = [];
        
        if (user.managedCategories && user.managedCategories.length > 0) {
          const categories = await Promise.all(
            user.managedCategories.map((catId) => ctx.db.get(catId))
          );
          categoryNames = categories
            .filter((cat) => cat !== null)
            .map((cat) => cat!.name);
        } else if (user.role === "system_admin") {
          categoryNames = ["All Categories (System Admin)"];
        }

        return {
          ...user,
          categoryNames,
        };
      })
    );

    return enrichedAccounts;
  },
});

// Verify reset token validity
export const verifyResetToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken) {
      return { valid: false, reason: "Token not found" };
    }

    if (resetToken.used) {
      return { valid: false, reason: "Token already used" };
    }

    if (resetToken.expiresAt < Date.now()) {
      return { valid: false, reason: "Token expired" };
    }

    return { valid: true };
  },
});

// Get lockout history for audit
export const getLockoutHistory = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("adminActivityLogs");

    if (args.userId) {
      query = query.withIndex("by_admin_timestamp", (q) =>
        q.eq("adminId", args.userId)
      );
    }

    const logs = await query
      .filter((q) =>
        q.or(
          q.eq(q.field("activityType"), "account_locked"),
          q.eq(q.field("activityType"), "account_unlocked"),
          q.eq(q.field("activityType"), "password_reset"),
          q.eq(q.field("activityType"), "failed_login")
        )
      )
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});

// Get user by email (helper)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by ID (helper)
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
```

---

### 4. Frontend Login Page Updates

**File:** `apps/webadmin/src/app/page.tsx`

**Changes Required:**

1. Import `useConvex` and `useAction`
2. Add state for password reset modal
3. Update `handleLogin` to check lockout status first
4. Track failed attempts

```typescript
// Add imports
import { useConvex, useAction } from "convex/react";

// Add state (around line 54)
const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
const [resetToken, setResetToken] = useState<string | null>(null);
const convex = useConvex();

// Update handleLogin function (replace existing - around line 80)
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isSignInLoaded) return;

  setError('');
  setLoading(true);

  try {
    // STEP 1: Check account status in Convex BEFORE Clerk
    const accountStatus = await convex.query(api.users.accountLockoutQueries.checkAccountStatus, {
      email: email,
    });

    // STEP 2A: Account locked - block login
    if (accountStatus.isLocked) {
      setError(
        'Account locked due to multiple failed attempts. ' +
        'Please visit System Administrator at Room 203 or call Local 123. ' +
        'Office Hours: Monday - Friday, 8:00 AM - 5:00 PM.'
      );
      setLoading(false);
      return;
    }

    // STEP 2B: Password reset token exists - show modal
    if (accountStatus.hasResetToken) {
      setResetToken(accountStatus.token);
      setShowPasswordResetModal(true);
      setLoading(false);
      return;
    }

    // STEP 3: Proceed with normal Clerk login
    const attempt = await signIn.create({
      identifier: email,
      password,
    });

    if (attempt.status === 'complete') {
      await setActive({ session: attempt.createdSessionId });
      
      // Clear failed attempts on successful login
      await convex.mutation(api.users.accountLockout.clearFailedAttempts, {
        email: email,
      });
      
      setShowLoginModal(false);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Incomplete authentication:', { status: attempt.status });
      }
      setError('Please complete the additional verification steps.');
    }

  } catch (err: any) {
    // Failed login - track in database
    await convex.mutation(api.users.accountLockout.trackFailedLogin, {
      email: email,
      timestamp: Date.now(),
    });

    const errorContext: ErrorContext = {
      email: email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    const userFriendlyMessage = getUserFriendlyErrorMessage(err);
    setError(userFriendlyMessage);
    logAuthError(err, errorContext);
    
  } finally {
    setLoading(false);
  }
};
```

**Add Password Reset Modal at end of return statement (before closing </div>):**

```tsx
{/* Password Reset Modal */}
{showPasswordResetModal && resetToken && (
  <PasswordResetModal
    isOpen={showPasswordResetModal}
    onClose={() => {
      setShowPasswordResetModal(false);
      setResetToken(null);
    }}
    email={email}
    token={resetToken}
    onSuccess={() => {
      setShowPasswordResetModal(false);
      setShowLoginModal(false);
      // User will be auto-redirected by useEffect after login
    }}
  />
)}
```

---

### 5. Password Reset Modal Component

**File:** `apps/webadmin/src/components/PasswordResetModal.tsx` (NEW FILE)

```tsx
'use client';

import { useSignIn } from "@clerk/nextjs";
import { useConvex } from "convex/react";
import { useState } from "react";
import { api } from "@backend/convex/_generated/api";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  token: string;
  onSuccess: () => void;
}

export default function PasswordResetModal({
  isOpen,
  onClose,
  email,
  token,
  onSuccess,
}: PasswordResetModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, setActive } = useSignIn();
  const convex = useConvex();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify token is still valid
      const tokenCheck = await convex.query(api.users.accountLockoutQueries.verifyResetToken, {
        token: token,
      });

      if (!tokenCheck.valid) {
        setError(`Token ${tokenCheck.reason}. Please contact System Administrator.`);
        setLoading(false);
        return;
      }

      // Step 2: Reset password via action (updates Clerk)
      const result = await convex.action(api.users.accountLockout.resetPasswordWithToken, {
        token: token,
        email: email,
        newPassword: newPassword,
      });

      if (!result.success) {
        setError(result.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      // Step 3: Auto-login with new password
      const loginAttempt = await signIn!.create({
        identifier: email,
        password: newPassword,
      });

      if (loginAttempt.status === 'complete') {
        await setActive!({ session: loginAttempt.createdSessionId });
        onSuccess();
      }

    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-slideUp">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Password Reset Required</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Your account was recently unlocked by the System Administrator.
            For security, please set a new password to continue.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all disabled:bg-emerald-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting Password...
              </span>
            ) : "Set Password & Login"}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Password must be at least 8 characters long
          </p>
        </form>
      </div>
    </div>
  );
}
```

---

### 6. System Admin Account Management Page

**File:** `apps/webadmin/src/app/super-admin/account-management/page.tsx` (NEW FILE)

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useAction } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import Navbar from "@/components/shared/Navbar";
import LoadingScreen from "@/components/shared/LoadingScreen";
import ErrorMessage from "@/components/ErrorMessage";
import { RedirectToSignIn } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import type { Id } from "@backend/convex/_generated/dataModel";

export default function AccountManagementPage() {
  const { isLoaded: isClerkLoaded, user } = useUser();
  const router = useRouter();
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
  const lockedAccounts = useQuery(api.users.accountLockoutQueries.getLockedAccounts);
  const unlockAccountAction = useAction(api.users.accountLockout.unlockUserAccount);

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [unlockMethod, setUnlockMethod] = useState<'simple' | 'reset'>('simple');
  const [notes, setNotes] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleUnlock = async () => {
    if (!selectedAccount || !notes.trim()) {
      setError("Please provide verification notes");
      return;
    }

    setIsUnlocking(true);
    setError('');

    try {
      const currentUser = await useQuery(api.users.getCurrentUser.getCurrentUserQuery, {});
      
      const result = await unlockAccountAction({
        userId: selectedAccount._id,
        unlockedBy: currentUser!._id,
        notes: notes,
        requirePasswordReset: unlockMethod === 'reset',
      });

      if (result.success) {
        setSuccessMessage(result.message);
        setShowUnlockModal(false);
        setSelectedAccount(null);
        setNotes('');
        // Refresh locked accounts list
      } else {
        setError(result.message || "Failed to unlock account");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Account Management" message="Please wait..." />;
  }

  if (!user) {
    return <RedirectToSignIn />;
  }

  if (!adminPrivileges || adminPrivileges.managedCategories !== "all") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          title="Access Denied"
          message="Only System Administrators can access account management."
          onCloseAction={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
              <p className="text-gray-600 mt-1">Manage locked admin accounts</p>
            </div>
          </div>
        </header>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Locked Accounts Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Locked Accounts ({lockedAccounts?.length || 0})</h2>
          </div>

          {!lockedAccounts || lockedAccounts.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No locked accounts</p>
              <p className="text-gray-500 text-sm mt-1">All admin accounts are currently active</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Locked At</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Failed Attempts</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lockedAccounts.map((account) => (
                    <tr key={account._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{account.fullname}</div>
                          <div className="text-sm text-gray-600">{account.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {account.categoryNames.join(", ") || "No categories"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {account.lockedAt 
                            ? formatDistanceToNow(new Date(account.lockedAt), { addSuffix: true })
                            : "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          {account.failedLoginAttempts || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowUnlockModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          Unlock Account
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Unlock Modal */}
      {showUnlockModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Unlock Account</h3>
              <button
                onClick={() => {
                  setShowUnlockModal(false);
                  setSelectedAccount(null);
                  setError('');
                  setNotes('');
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-semibold text-gray-900">{selectedAccount.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Locked At:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {selectedAccount.lockedAt 
                      ? formatDistanceToNow(new Date(selectedAccount.lockedAt), { addSuffix: true })
                      : "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Failed Attempts:</span>
                  <span className="ml-2 font-semibold text-red-600">{selectedAccount.failedLoginAttempts || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-semibold text-gray-900">{selected Account.categoryNames.join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Unlock Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose unlock method:
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                  <input
                    type="radio"
                    name="unlockMethod"
                    value="simple"
                    checked={unlockMethod === 'simple'}
                    onChange={(e) => setUnlockMethod(e.target.value as 'simple' | 'reset')}
                    className="mt-1 w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Unlock Only</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Admin can try logging in with their existing password.
                      <br />
                      <span className="text-xs">(Use if admin remembers password but had typos/CapsLock errors)</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all">
                  <input
                    type="radio"
                    name="unlockMethod"
                    value="reset"
                    checked={unlockMethod === 'reset'}
                    onChange={(e) => setUnlockMethod(e.target.value as 'simple' | 'reset')}
                    className="mt-1 w-5 h-5 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Unlock + Force Password Reset</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Admin must create a new password via in-app modal before logging in.
                      <br />
                      <span className="text-xs">(Use if admin forgot their password)</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Verification Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Verification Notes (Required)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
                placeholder="e.g., Verified employee ID: EMP-2024-001. Reason: Had CapsLock on."
                rows={3}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUnlockModal(false);
                  setSelectedAccount(null);
                  setError('');
                  setNotes('');
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                disabled={isUnlocking}
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={isUnlocking || !notes.trim()}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                {isUnlocking ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Unlocking...
                  </span>
                ) : "Unlock Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 User Flows

### Flow 1: Account Gets Locked

```
Admin tries login with wrong password (Attempt 1)
         ↓
trackFailedLogin mutation called
         ↓
failedLoginAttempts = 1 (logged in DB)
         ↓
[Admin tries again... 4 more times]
         ↓
Attempt 5 fails
         ↓
trackFailedLogin detects >= 5 attempts
         ↓
Set isLocked = true in DB
         ↓
Call lockAccountInClerk action
         ↓
clerk.users.banUser(clerkId) executed
         ↓
Log lockout event to adminActivityLogs
         ↓
Admin sees error: "Account locked. Visit System Administrator at Room 203"
```

### Flow 2: System Admin Unlocks (Simple Method)

```
8:15 AM - Admin walks to System Admin desk
         ↓
System Admin logs into dashboard
         ↓
Goes to /super-admin/account-management
         ↓
Sees locked account in table
         ↓
Clicks "Unlock Account" button
         ↓
Modal opens with 2 options
         ↓
System Admin selects: "Unlock Only"
         ↓
Enters notes: "Verified ID, had CapsLock on"
         ↓
Clicks "Unlock Account"
         ↓
Backend unlockUserAccount action runs:
  1. clerk.users.unbanUser(clerkId)
  2. Update DB: isLocked = false
  3. Reset failedLoginAttempts = 0
  4. Log unlock activity
         ↓
System Admin tells admin: "Try logging in again"
         ↓
8:17 AM - Admin returns to workstation
         ↓
Admin enters email + password (same password)
         ↓
Login succeeds!
         ↓
TOTAL TIME: 2-3 minutes
```

### Flow 3: System Admin Unlocks (With Reset)

```
8:15 AM - Admin walks to System Admin desk
         ↓
System Admin: "Do you remember your password?"
Admin: "No, I forgot it"
         ↓
System Admin selects: "Unlock + Force Password Reset"
         ↓
Enters notes: "Verified ID, admin forgot password"
         ↓
Clicks "Unlock Account"
         ↓
Backend unlockUserAccount action runs:
  1. clerk.users.unbanUser(clerkId)
  2. Update DB: isLocked = false
  3. Generate secure token (32 bytes random)
  4. Store token in passwordResetTokens table
  5. Token expires in 15 minutes
  6. Log unlock + reset activity
         ↓
System Admin: "Go back and try logging in"
         ↓
8:17 AM - Admin returns to workstation
         ↓
Admin enters email + password (any password)
         ↓
Frontend checkAccountStatus query detects reset token
         ↓
Modal appears: "Password Reset Required"
         ↓
Admin enters new password (2x for confirmation)
         ↓
Clicks "Set Password & Login"
         ↓
Backend resets password in Clerk
         ↓
Mark token as used in DB
         ↓
Auto-login with new password
         ↓
Redirect to dashboard
         ↓
TOTAL TIME: 5-6 minutes
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] `trackFailedLogin` increments counter correctly
- [ ] Account locks after exactly 5 failed attempts
- [ ] `clearFailedAttempts` resets counter on successful login
- [ ] Token generation creates unique 32-byte tokens
- [ ] Token expiration works (15 min)
- [ ] Token can only be used once

### Integration Tests

- [ ] Failed login attempt tracked in both Clerk and Convex
- [ ] Clerk ban/unban syncs with Convex lockout status
- [ ] Password reset updates Clerk and marks token as used
- [ ] Audit logs created for all lockout/unlock actions

### End-to-End Tests

- [ ] Admin can be locked after 5 failed attempts
- [ ] Locked admin cannot login (even with correct password)
- [ ] System Admin can see locked accounts in dashboard
- [ ] Simple unlock allows admin to use same password
- [ ] Reset unlock forces new password creation
- [ ] Reset modal only appears on login attempt (not page load)
- [ ] Token expires after 15 minutes
- [ ] Used token cannot be reused

### Security Tests

- [ ] Tokens are cryptographically secure (32 bytes)
- [ ] Tokens expire correctly
- [ ] Used tokens rejected
- [ ] Only System Admins can unlock accounts
- [ ] Audit trail complete for all actions
- [ ] Failed attempts not trackable by applicants (admin only)

---

## 📈 Performance Considerations

- **Database Queries:** Indexed on `isLocked`, `by_email`, `by_token`
- **Token Cleanup:** Create cron job to delete expired tokens daily
- **Audit Log Size:** Consider archiving logs older than 1 year

---

## 🔒 Security Considerations

1. **Token Security:**
   - 32-byte random tokens (256-bit entropy)
   - 15-minute expiration
   - Single-use only
   - Stored securely in database

2. **Clerk Integration:**
   - Always sync ban/unban actions
   - Don't rely solely on Clerk's lockout (add app-level control)

3. **Audit Trail:**
   - Log every lockout, unlock, and password reset
   - Include who performed action and why
   - Immutable logs (never delete)

4. **Rate Limiting:**
   - 5 attempts is generous for office environment
   - Consider reducing to 3 for higher security

---

## 📅 Implementation Timeline

### Phase 1: Database & Backend (Day 1)
- [ ] Update schema (users table + passwordResetTokens table)
- [ ] Deploy schema changes
- [ ] Create accountLockout.ts mutations
- [ ] Create accountLockoutQueries.ts queries
- [ ] Test mutations/queries in Convex dashboard

### Phase 2: Frontend Components (Day 2 Morning)
- [ ] Create PasswordResetModal component
- [ ] Update landing page login handler
- [ ] Test modal appears correctly
- [ ] Test password reset flow

### Phase 3: System Admin Dashboard (Day 2 Afternoon)
- [ ] Create account-management page
- [ ] Add unlock modal with 2 options
- [ ] Test both unlock methods
- [ ] Verify audit logging

### Phase 4: Testing & Polish (Day 3)
- [ ] End-to-end testing
- [ ] Security review
- [ ] Documentation
- [ ] Deploy to production

---

## 🎓 Training for System Administrators

### Quick Reference Card

```
┌────────────────────────────────────────────────────────┐
│  ADMIN ACCOUNT LOCKOUT - SYSTEM ADMIN GUIDE            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. WHEN ADMIN GETS LOCKED:                            │
│     • After 5 failed password attempts                 │
│     • Admin sees: "Account locked. Visit Room 203"     │
│                                                        │
│  2. TO UNLOCK:                                         │
│     • Login to webadmin dashboard                      │
│     • Go to Super Admin → Account Management           │
│     • Click "Unlock Account" on locked admin           │
│                                                        │
│  3. CHOOSE METHOD:                                     │
│     A) Unlock Only (if admin remembers password)       │
│        ✅ Admin can use same password                  │
│        ✅ Faster (2-3 minutes total)                   │
│                                                        │
│     B) Unlock + Force Reset (if password forgotten)    │
│        ✅ Admin creates new password                   │
│        ✅ More secure                                  │
│        ✅ Takes 5-6 minutes total                      │
│                                                        │
│  4. VERIFICATION:                                      │
│     • Always verify employee ID in person              │
│     • Enter notes explaining reason                    │
│     • Example: "Verified ID: EMP-2024-001,             │
│                Had CapsLock on"                        │
│                                                        │
│  5. AFTER UNLOCK:                                      │
│     • Tell admin to try logging in again               │
│     • If reset required, they'll see modal             │
│     • automatically                                    │
│                                                        │
│  OFFICE HOURS: Mon-Fri, 8:00 AM - 5:00 PM              │
│  LOCATION: Room 203                                    │
│  LOCAL EXT: 123                                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 💡 Future Enhancements (Phase 2)

1. **Email Fallback:**
   - Add option to send Clerk password reset email
   - Useful if admin left office before unlock

2. **2FA Integration:**
   - Add SMS verification before unlock
   - Higher security for sensitive accounts

3. **IP Whitelisting:**
   - Only allow login from office IP range
   - Extra layer of security

4. **Biometric Unlock:**
   - Integrate fingerprint scanner
   - Faster verification process

5. **Mobile App for System Admin:**
   - Unlock accounts from mobile device
   - Push notifications for lockouts

6. **Analytics Dashboard:**
   - Track lockout patterns
   - Identify potential security issues
   - Generate monthly reports

---

## 🤝 Contributing

When implementing this feature:

1. **Follow existing code patterns** in the codebase
2. **Test thoroughly** before deploying
3. **Document changes** in commit messages
4. **Update this document** if making modifications
5. **Train System Administrators** before going live

---

## 📞 Support

For questions about this implementation:

- **Technical Lead:** [Your Leader's Name]
- **Documentation:** This file
- **Codebase Location:** `backend/convex/users/`, `apps/webadmin/src/`

---

## ✅ Conclusion

This implementation provides:

✅ **Security:** Account lockout prevents brute-force attacks  
✅ **Convenience:** Token-based reset (no email delays)  
✅ **Flexibility:** Two unlock methods (simple or reset)  
✅ **Audit Trail:** Complete logging of all activities  
✅ **Office-Friendly:** Perfect for on-site, office-hours scenario  
✅ **User-Friendly:** Modal only appears when expected (no random popups)  
✅ **Scalable:** Clean architecture, easy to maintain  

**Estimated ROI:**
- **Security Improvement:** High (prevents unauthorized access)
- **User Experience:** High (faster unlock than email-based)
- **Admin Workload:** Low (self-service after System Admin unlock)
- **Implementation Time:** 2-3 days
- **Maintenance:** Low (clean, documented code)

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-13  
**Status:** Ready for Implementation  
**Approved By:** [Pending]

---

*This feature is designed specifically for the eMediCard government health card system with on-site admin access during office hours. Implementation details may need adjustment based on specific organizational requirements.*
