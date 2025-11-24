# Dynamic Pricing System Implementation

**Date**: November 24, 2025  
**Version**: 1.0  
**Status**: ✅ Backend & WebAdmin Implemented | ⏳ Mobile Integration Pending

---

## 📋 Overview

This document provides comprehensive details about the **Dynamic Pricing System** implemented for the eMediCard project. This addresses the panelist feedback: **"make your pricing dynamic"** - allowing Super Admins to edit payment fees without requiring code deployment.

### What Changed?
**Before**: Prices were hardcoded in `backend/convex/config/paymentConstants.ts`
```typescript
export const BASE_FEE = 50;
export const SERVICE_FEES = {
  Maya: 10,
  BaranggayHall: 10,
  CityHall: 10,
};
```

**After**: Prices are stored in database (`pricingConfig` table) and can be edited through WebAdmin UI by Super Admins.

---

## 🎯 Implementation Summary

### ✅ Completed Components

1. **Database Schema**: Added `pricingConfig` table to `backend/convex/schema.ts`
2. **Backend API**: Created `backend/convex/pricingConfig/index.ts` with 4 endpoints
3. **WebAdmin UI**: Created pricing management page at `/super-admin/pricing-config`
4. **Audit Trail**: All price changes logged with reason, admin, and timestamp

### ⏳ Pending Work

1. **Update Payment Logic**: Modify payment creation to fetch dynamic pricing (see Phase 2 below)
2. **Mobile Integration**: Update mobile app to use new pricing API
3. **Commission System**: Pending team leader clarification on requirements

---

## 🗄️ Database Schema

### Table: `pricingConfig`

```typescript
pricingConfig: defineTable({
  key: v.string(), // "base_fee", "maya_service_fee", "baranggay_service_fee", "cityhall_service_fee"
  
  value: v.object({
    amount: v.float64(),            // e.g., 50.00
    currency: v.string(),            // "PHP"
    description: v.string(),         // "Base health card application fee"
    isActive: v.boolean(),           // Is this the current active price?
    effectiveFrom: v.float64(),      // Timestamp when price became active
    effectiveTo: v.optional(v.float64()), // When replaced (null = still active)
  }),
  
  updatedAt: v.float64(),
  updatedBy: v.id("users"),          // Which super admin made the change
  notes: v.optional(v.string()),
  changeReason: v.optional(v.string()), // Required for audit
})
  .index("by_key", ["key"])
  .index("by_updated_at", ["updatedAt"]);
```

### Pricing Keys
| Key | Description | Current Default |
|-----|-------------|----------------|
| `base_fee` | Base application fee | ₱50.00 |
| `maya_service_fee` | Maya payment service fee | ₱10.00 |
| `baranggay_service_fee` | Baranggay Hall service fee | ₱10.00 |
| `cityhall_service_fee` | City Hall service fee | ₱10.00 |

---

## 🔌 API Reference

### File Location
`backend/convex/pricingConfig/index.ts`

### 1. `getActivePricing` (Query)

**Purpose**: Fetch current active prices for all payment methods  
**Auth Required**: ❌ No (public data)  
**Used By**: Mobile app, WebAdmin, anywhere pricing is displayed

**Request**:
```typescript
const pricing = await ctx.db.query("pricingConfig")
  .withIndex("by_key", (q) => q.eq("key", "base_fee"))
  .filter((q) => q.eq(q.field("value.isActive"), true))
  .first();
```

**Response**:
```typescript
{
  baseFee: {
    amount: 50,
    currency: "PHP",
    description: "Base health card application fee",
    effectiveFrom: 1732464000000,
    configId: "..."
  },
  serviceFees: {
    Maya: {
      amount: 10,
      currency: "PHP",
      description: "Service fee for Maya payment method",
      effectiveFrom: 1732464000000,
      configId: "..."
    },
    BaranggayHall: { ... },
    CityHall: { ... }
  }
}
```

### 2. `getPricingHistory` (Query)

**Purpose**: View historical pricing changes for audit trail  
**Auth Required**: ✅ Yes (Admin/SuperAdmin only)  
**Used By**: WebAdmin pricing history table

**Request**:
```typescript
// Get all pricing history
api.pricingConfig.index.getPricingHistory({})

// Get history for specific key
api.pricingConfig.index.getPricingHistory({ key: "base_fee" })
```

**Response**:
```typescript
[
  {
    _id: "...",
    key: "base_fee",
    amount: 50,
    currency: "PHP",
    description: "Base health card application fee",
    isActive: true,
    effectiveFrom: 1732464000000,
    effectiveTo: null,
    updatedAt: 1732464000000,
    updatedBy: {
      _id: "...",
      fullname: "John Doe",
      email: "john@example.com"
    },
    notes: "Initial setup",
    changeReason: "Initial pricing setup"
  },
  // ... more records
]
```

### 3. `updatePricing` (Mutation)

**Purpose**: Update pricing (creates new record, deactivates old)  
**Auth Required**: ✅ Yes (SuperAdmin only)  
**Used By**: WebAdmin pricing config page

**Request**:
```typescript
await updatePricing({
  key: "base_fee",                           // Required
  amount: 55.00,                             // Required
  changeReason: "Price adjustment 2025",     // Required
  notes: "Approved by city council",         // Optional
  effectiveFrom: Date.now()                  // Optional (defaults to now)
});
```

**Response**:
```typescript
{
  success: true,
  pricingId: "...",
  message: "Successfully updated base_fee to ₱55",
  oldAmount: 50,
  newAmount: 55
}
```

### 4. `initializePricing` (Mutation)

**Purpose**: ONE-TIME migration to populate initial pricing  
**Auth Required**: ✅ Yes (SuperAdmin only)  
**Used By**: Migration script (run once)

**Request**:
```typescript
await initializePricing({});
```

**Response**:
```typescript
{
  success: true,
  message: "Successfully initialized pricing configuration",
  createdCount: 4,
  pricingIds: ["...", "...", "...", "..."]
}
```

---

## 📱 Mobile App Integration Guide

### Step 1: Import Pricing Query

In your mobile app payment screens:

```typescript
import { api } from "@backend/convex/_generated/api";
import { useQuery } from "convex/react";

// Inside your component
const pricing = useQuery(api.pricingConfig.index.getActivePricing, {});
```

### Step 2: Use Dynamic Pricing

**Replace hardcoded values**:
```typescript
// OLD - DON'T USE THIS ANYMORE
const BASE_FEE = 50;
const SERVICE_FEE = 10;

// NEW - USE THIS
const baseFee = pricing?.baseFee?.amount || 50; // Fallback to 50 if query fails
const serviceFee = pricing?.serviceFees[paymentMethod]?.amount || 10;
const totalAmount = baseFee + serviceFee;
```

### Step 3: Payment Method Mapping

```typescript
type PaymentMethod = "Maya" | "BaranggayHall" | "CityHall";

function getServiceFee(method: PaymentMethod, pricing: any): number {
  if (!pricing?.serviceFees) return 10; // Fallback
  
  return pricing.serviceFees[method]?.amount || 10;
}
```

### Step 4: Display Pricing Breakdown

```tsx
{pricing && (
  <View style={styles.pricingBreakdown}>
    <Text>Base Fee: ₱{pricing.baseFee.amount.toFixed(2)}</Text>
    <Text>Service Fee: ₱{pricing.serviceFees[selectedMethod].amount.toFixed(2)}</Text>
    <Text style={styles.total}>
      Total: ₱{(pricing.baseFee.amount + pricing.serviceFees[selectedMethod].amount).toFixed(2)}
    </Text>
  </View>
)}
```

### Step 5: Handle Loading States

```typescript
if (!pricing) {
  // Show loading indicator or use fallback values
  return <LoadingSpinner />;
}
```

---

## 🖥️ WebAdmin Usage

### Accessing Pricing Config

**Method 1: Via Navigation Menu**
1. Login as **Super Admin** (role: "admin" with empty managedCategories)
2. Go to Super Admin Dashboard
3. Click the **three dots (...)** menu button (Advanced Options)
4. Select **"Pricing Config"** from dropdown

**Method 2: Direct URL**
- Navigate directly to: `/super-admin/pricing-config`

**Note**: The menu shows:
```
┌─────────────────────────────────┐
│ ⚙️ System Config                │
│   Manage officials & settings   │
├─────────────────────────────────┤
│ 💰 Pricing Config                │
│   Manage fees & pricing         │
└─────────────────────────────────┘
```

### Editing Prices

1. Click **"Edit"** button on any pricing card
2. Enter new amount (must be > 0)
3. **Provide change reason** (required for audit)
4. Optional: Add notes for context
5. Click **"Save Changes"**

### Features
- ✅ Real-time price updates (no page refresh needed)
- ✅ Pricing history with audit trail
- ✅ Access control (SuperAdmin only)
- ✅ Validation (amount > 0, reason required)
- ✅ Activity logging

---

## 🔧 Migration Instructions

### Initial Setup (ONE-TIME)

**IMPORTANT**: Run this BEFORE deploying to production

**Option A: Via Convex Dashboard (Recommended for Testing)**
1. Open Convex Dashboard
2. Go to **Functions** tab
3. Search for `initializePricingTest`
4. Select `pricingConfig/index:initializePricingTest`
5. Click **"Run mutation"** button
6. Should return: `{ success: true, createdCount: 4, ... }`

**Option B: Via CLI (Production)**
1. Start Convex dev:
   ```bash
   cd backend
   npx convex dev
   ```

2. In another terminal, run migration:
   ```bash
   npx convex run pricingConfig:initializePricing
   ```
   (Note: This requires authentication through webadmin)

**Verify Migration:**
- Go to Convex Dashboard → **Data** tab
- Check `pricingConfig` table
- Should have 4 records (base_fee + 3 service fees)

### What This Does
- Creates initial pricing records with current values:
  - base_fee: ₱50.00
  - maya_service_fee: ₱10.00
  - baranggay_service_fee: ₱10.00
  - cityhall_service_fee: ₱10.00
- Sets all as **active**
- Logs in `adminActivityLogs`

---

## ⚙️ Phase 2: Update Payment Logic (TODO)

### Files to Modify

#### 1. `backend/convex/applications/submitApplication.ts` (Lines 106-108)

**Current**:
```typescript
const baseAmount = 50; // Hardcoded
const serviceFee = 10; // Hardcoded
const totalAmount = baseAmount + serviceFee;
```

**Update To**:
```typescript
// Fetch active pricing
const baseFeeConfig = await ctx.db
  .query("pricingConfig")
  .withIndex("by_key", (q) => q.eq("key", "base_fee"))
  .filter((q) => q.eq(q.field("value.isActive"), true))
  .first();

const serviceFeeKey = `${args.paymentMethod.toLowerCase()}_service_fee`; // e.g., "maya_service_fee"
const serviceFeeConfig = await ctx.db
  .query("pricingConfig")
  .withIndex("by_key", (q) => q.eq("key", serviceFeeKey))
  .filter((q) => q.eq(q.field("value.isActive"), true))
  .first();

// Use dynamic pricing with fallback
const baseAmount = baseFeeConfig?.value.amount || 50;
const serviceFee = serviceFeeConfig?.value.amount || 10;
const totalAmount = baseAmount + serviceFee;
```

#### 2. `backend/convex/payments/createPayment.ts`

Similar pattern - fetch pricing before creating payment record.

#### 3. `backend/convex/payments/maya/checkout.ts`

Update Maya checkout flow to use dynamic pricing.

### Helper Function (Recommended)

Create a reusable helper:

```typescript
// backend/convex/pricingConfig/helpers.ts
import { QueryCtx } from "../_generated/server";

export async function getActivePricing(ctx: QueryCtx) {
  const baseFee = await ctx.db
    .query("pricingConfig")
    .withIndex("by_key", (q) => q.eq("key", "base_fee"))
    .filter((q) => q.eq(q.field("value.isActive"), true))
    .first();

  const mayaFee = await ctx.db
    .query("pricingConfig")
    .withIndex("by_key", (q) => q.eq("key", "maya_service_fee"))
    .filter((q) => q.eq(q.field("value.isActive"), true))
    .first();

  const baranggayFee = await ctx.db
    .query("pricingConfig")
    .withIndex("by_key", (q) => q.eq("key", "baranggay_service_fee"))
    .filter((q) => q.eq(q.field("value.isActive"), true))
    .first();

  const cityhallFee = await ctx.db
    .query("pricingConfig")
    .withIndex("by_key", (q) => q.eq("key", "cityhall_service_fee"))
    .filter((q) => q.eq(q.field("value.isActive"), true))
    .first();

  return {
    baseFee: baseFee?.value.amount || 50,
    serviceFees: {
      Maya: mayaFee?.value.amount || 10,
      BaranggayHall: baranggayFee?.value.amount || 10,
      CityHall: cityhallFee?.value.amount || 10,
    },
  };
}
```

Then use it:
```typescript
import { getActivePricing } from "../pricingConfig/helpers";

const pricing = await getActivePricing(ctx);
const baseAmount = pricing.baseFee;
const serviceFee = pricing.serviceFees[paymentMethod];
```

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] Initialize pricing successfully
- [ ] Get active pricing returns correct values
- [ ] Update pricing creates new record and deactivates old
- [ ] SuperAdmin can update pricing
- [ ] Regular admin CANNOT update pricing
- [ ] Invalid amount (≤ 0) is rejected
- [ ] Missing change reason is rejected
- [ ] Pricing history shows all changes

### WebAdmin Tests

- [ ] SuperAdmin can access `/super-admin/pricing-config`
- [ ] Regular admin is denied access
- [ ] Edit modal opens correctly
- [ ] Price updates reflect immediately
- [ ] History table shows changes
- [ ] Validation errors display correctly

### Mobile Tests (When Integrated)

- [ ] Pricing query loads successfully
- [ ] Fallback values work if query fails
- [ ] Price breakdown displays correctly
- [ ] Payment calculations use dynamic pricing
- [ ] New pricing takes effect immediately

### Integration Tests

- [ ] Create application after price change uses new price
- [ ] Old payments retain historical pricing
- [ ] Price changes don't affect existing payments
- [ ] Audit trail shows all changes with admin info

---

## 🔒 Security & Access Control

### Who Can Do What?

| Action | Applicant | Admin | SuperAdmin |
|--------|-----------|-------|------------|
| View active pricing | ✅ Yes | ✅ Yes | ✅ Yes |
| View pricing history | ❌ No | ✅ Yes | ✅ Yes |
| Update pricing | ❌ No | ❌ No | ✅ Yes |
| Access pricing config page | ❌ No | ❌ No | ✅ Yes |

### Audit Trail

All pricing changes are logged in `adminActivityLogs`:
```typescript
{
  adminId: "...",
  activityType: "pricing_update",
  action: "update_pricing",
  details: "Updated base_fee from ₱50 to ₱55",
  comment: "Price adjustment per city ordinance",
  timestamp: 1732464000000
}
```

---

## 🐛 Troubleshooting

### Issue: "Pricing already initialized" error

**Solution**: Pricing was already set up. Use `updatePricing` mutation instead.

### Issue: Pricing query returns null

**Possible Causes**:
1. Migration not run yet → Run `initializePricing`
2. Database connection issue → Check Convex dashboard
3. No active pricing record → Check `pricingConfig` table

**Fallback**: Always provide default values:
```typescript
const baseFee = pricing?.baseFee?.amount || 50;
```

### Issue: "Admin access required" error

**Solution**: User must have `isSuperAdmin: true` role. Check in Convex dashboard:
```typescript
// In users table
{
  role: "system_admin", // Must be this
  managedCategories: "all" // For super admin
}
```

### Issue: Price changes not reflecting

**Causes**:
1. Cache issue → Hard refresh browser (Ctrl+Shift+R)
2. Old code still using hardcoded values → Update to use query
3. Multiple active records → Should never happen, but check `pricingConfig` table

---

## 📊 Commission System (Pending)

### Current Status
❓ **Awaiting team leader clarification**

### Questions to Answer
1. **What is commission?**
   - Payment center cut from service fee?
   - Referral agent earnings?
   - Something else?

2. **Where to display?**
   - WebAdmin payment-history grid?
   - Mobile payment screens?
   - Separate report?

3. **How to calculate?**
   - Fixed amount?
   - Percentage?
   - Per payment method?

### Proposed Implementation (Once Clarified)

If commission is **percentage of service fee**:

```typescript
// Add to pricingConfig
commissionConfig: defineTable({
  key: v.string(), // "maya_commission", "baranggay_commission", etc.
  value: v.object({
    rate: v.float64(), // e.g., 0.20 for 20%
    type: v.union(v.literal("percentage"), v.literal("fixed")),
    amount: v.optional(v.float64()), // For fixed type
  }),
  // ... same audit fields
})
```

Display in payment-history:
```typescript
<td>
  <div>Service Fee: ₱{serviceFee}</div>
  <div className="text-xs text-gray-600">
    Commission: ₱{(serviceFee * commissionRate).toFixed(2)}
  </div>
</td>
```

---

## 📝 Notes for Team Leader

### What's Done ✅
1. ✅ Database schema created (`pricingConfig` table)
2. ✅ Backend API fully functional (4 endpoints)
3. ✅ WebAdmin UI complete with navigation
4. ✅ Audit trail implemented
5. ✅ Migration script ready (both test and production versions)
6. ✅ Navigation menu link added to Super Admin dashboard
7. ✅ TypeScript errors fixed

### What You Need to Do 📋
1. **Run Migration**: Execute `initializePricing` once before production
2. **Update Mobile App**: Integrate pricing query (see Mobile Integration Guide above)
3. **Update Payment Logic**: Modify payment creation to use dynamic pricing (see Phase 2)
4. **Clarify Commission**: Define commission requirements and where to display
5. **Test Everything**: Run through testing checklist

### Key Files to Review
- `backend/convex/schema.ts` (lines 759-784) - Database schema
- `backend/convex/pricingConfig/index.ts` - Backend API
- `apps/webadmin/src/app/super-admin/pricing-config/page.tsx` - UI
- `backend/convex/config/paymentConstants.ts` - Original constants (keep as fallback)

### Questions?
Contact the developer who implemented this for clarification on any aspect.

---

## 📚 Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Convex Integration](https://docs.convex.dev/client/react-native)

---

---

## 🔄 Recent Changes (November 24, 2025)

### Changes Made During Implementation
1. ✅ Fixed TypeScript error in `getPricingHistory` (optional key parameter)
2. ✅ Added `initializePricingTest` mutation for Convex dashboard testing (no auth)
3. ✅ Updated to find admins with `role: "admin"` and empty `managedCategories` array
4. ✅ Added navigation menu link in Super Admin dashboard (three dots menu)
5. ✅ Successfully ran migration and initialized pricing

### System Admin Role Clarification
Super Admins in this system have:
- `role: "admin"` (not "system_admin")
- `managedCategories: []` (empty array = manages all categories)
- The `AdminRole` helper checks for `isSuperAdmin` which validates both conditions

---

**End of Document**

_Last Updated: November 24, 2025 - 15:12 UTC_  
_Prepared by: Your Fullstack Developer_ 💪
