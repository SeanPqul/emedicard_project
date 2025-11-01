# Orientation Schema Migration - Audit & Cleanup Report

**Generated:** 2025-11-01  
**Branch:** orientation-schema-migration  
**Status:** ⚠️ INCOMPLETE - Action Required

---

## 🎯 Migration Goal
Migrate from 3-table system to 2-table system:
- **OLD:** `orientationSchedules` + `orientationSessions` + `orientations` ❌
- **NEW:** `orientationSchedules` + `orientationBookings` ✅

---

## ✅ Successfully Migrated Components

### 1. Backend API Endpoints ✅

#### **Booking Operations**
- ✅ `convex/orientationSchedules/bookOrientationSlot.ts`
  - NOW USES: `orientationBookings` table
  - Creates unified booking with status `"scheduled"`
  - Returns `bookingId` (with backward compat alias `sessionId`)

- ✅ `convex/orientationSchedules/cancelOrientationBooking.ts`
  - NOW USES: `orientationBookings` table
  - Accepts `bookingId` parameter (+ legacy `sessionId`)
  - Updates booking status to `"cancelled"`

- ✅ `convex/orientationSchedules/getUserOrientationSession.ts`
  - NOW QUERIES: `orientationBookings` table
  - Returns active booking for application

#### **Admin Operations**
- ✅ `convex/admin/orientation.ts`
  - `scheduleOrientation` - NOW USES `orientationBookings`
  - `getOrientationByApplicationId` - Queries bookings table
  - `getAvailableTimeSlots` - Queries bookings table

### 2. Mobile App ✅

#### **Service Layer**
- ✅ `src/features/orientation/services/orientationService.ts`
  - `bookSlot()` - Returns `bookingId` (correct type)
  - `cancelBooking()` - Accepts `Id<"orientationBookings">`
  - `getUserSession()` - Maps booking data correctly

#### **Type Definitions**
- ✅ Updated to use booking terminology
- Type compatibility maintained

### 3. Schema ✅

- ✅ `orientationBookings` table added with proper indexes
- ✅ `orientationMigrationLog` table added for tracking
- ⚠️ Old tables (`orientations`, `orientationSessions`) **STILL EXIST**

---

## ⚠️ CRITICAL ISSUES - Immediate Action Required

### 1. **`convex/orientations/attendance.ts` - NOT MIGRATED** 🔴

**Problem:** This file still uses the OLD `orientations` table extensively

**Current Implementation:**
```typescript
// ❌ Line 46: Still querying old table
const booking = await ctx.db
  .query("orientationBookings")  // ✅ Actually using NEW table!
  .withIndex("by_application", (q) => q.eq(...)
  
// Actually you DID update this file! Let me re-verify...
```

**Status:** ✅ **ACTUALLY UPDATED!** (False alarm - I was wrong)

Let me re-check the file... I see it's using `orientationBookings` on lines 46, 145, 237, 289, etc.

### 2. **`convex/admin/inspectorAvailability.ts` - NOT MIGRATED** 🔴

**Problem:** Still queries old `orientations` table

**Current Code:**
```typescript
// ❌ Line 18, 65, 111: Using old table
const allOrientations = await ctx.db
  .query("orientations")  // ❌ Should be orientationBookings
  .collect();
```

**Required Fix:**
```typescript
// ✅ Should be:
const allBookings = await ctx.db
  .query("orientationBookings")
  .collect();

// Update all references:
- orientation.assignedInspectorId → Check inspector from booking.checkedInBy
- orientation.orientationDate → booking.scheduledDate
- orientation.timeSlot → booking.scheduledTime
- orientation.orientationVenue → booking.venue.name
```

### 3. **`convex/orientations/getUserOrientations.ts` - INCOMPLETE** 🟡

**Current Status:** Returns empty array (placeholder)

**Required Implementation:**
```typescript
// ✅ Implement actual query:
const bookings = await ctx.db
  .query("orientationBookings")
  .withIndex("by_user", (q) => q.eq("userId", identity.subject))
  .collect();

// Enrich with schedule data
return Promise.all(bookings.map(async (booking) => ({
  ...booking,
  schedule: await ctx.db.get(booking.scheduleId),
})));
```

### 4. **WebAdmin Attendance Tracker - Type Mismatch** 🟡

**File:** `apps/webadmin/src/app/dashboard/attendance-tracker/page.tsx`

**Problem:** Uses old type `orientationId: Id<'orientations'>` (line 15, 62)

**Required Fix:**
```typescript
// ❌ Old:
interface Attendee {
  orientationId: Id<'orientations'>;  // Wrong table!
  ...
}

// ✅ New:
interface Attendee {
  bookingId: Id<'orientationBookings'>;  // Correct table!
  ...
}
```

**API Call Check:**
- Line 75: Uses `api.orientations.attendance.getOrientationSchedulesForDate`
- ✅ This API has been updated to use `orientationBookings`
- ⚠️ Verify the response matches the new schema

---

## 🗑️ Code Ready for Deletion

### 1. Schema Tables (After Verification)

**File:** `backend/convex/schema.ts`

```typescript
// 🗑️ DELETE THESE (Lines ~121-143):
orientations: defineTable({
  applicationId: v.id("applications"),
  checkInTime: v.optional(v.float64()),
  // ... entire definition
}).index(...),

// 🗑️ DELETE THESE (Lines ~173-201):
orientationSessions: defineTable({
  userId: v.string(),
  applicationId: v.id("applications"),
  // ... entire definition
}).index(...),
```

**⚠️ DO NOT DELETE UNTIL:**
1. All backend APIs updated
2. All frontend code updated
3. Migration script executed
4. Full testing complete

### 2. Old Migration Scripts

Keep for reference but can be archived:
- `convex/orientationBookings/migrateToUnifiedBookings.ts` (keep for rollback)
- `convex/migrations/migrateOrientationTables.ts` (existing script)

---

## 📋 Required Actions Checklist

### Phase 1: Fix Backend APIs 🔴 **DO THIS FIRST**

- [ ] **Fix `convex/admin/inspectorAvailability.ts`**
  - [ ] Replace all `orientations` queries with `orientationBookings`
  - [ ] Update field mappings (orientationDate → scheduledDate, etc.)
  - [ ] Test inspector availability check
  - [ ] Test getInspectorsWithAvailability query
  - [ ] Test getInspectorDailySchedule query

- [ ] **Implement `convex/orientations/getUserOrientations.ts`**
  - [ ] Replace empty array with actual booking query
  - [ ] Join with schedule data
  - [ ] Test return value matches expected type

- [ ] **Verify all backend mutations/queries**
  ```bash
  # Search for any remaining references
  cd C:\Em\backend\convex
  grep -r "orientationSessions" .
  grep -r "\"orientations\"" .
  ```

### Phase 2: Fix Frontend TypeScript Types 🟡

- [ ] **Update WebAdmin Types**
  - [ ] Fix `attendance-tracker/page.tsx` - Change `orientationId` to `bookingId`
  - [ ] Update interface to use `Id<'orientationBookings'>`
  - [ ] Verify API responses match new schema
  - [ ] Test attendance tracking flow

- [ ] **Mobile App Type Verification**
  - [ ] Confirm all orientation types use booking terminology
  - [ ] Check for any `Id<'orientations'>` or `Id<'orientationSessions'>` references
  - [ ] Run TypeScript compiler to catch type errors

### Phase 3: Testing 🧪

- [ ] **Backend API Testing**
  ```bash
  cd C:\Em\backend
  npx convex dev
  # Test each endpoint manually via Convex dashboard
  ```
  - [ ] bookOrientationSlot → creates booking correctly
  - [ ] checkIn → updates booking status to "checked-in"
  - [ ] checkOut → updates booking status to "completed"
  - [ ] cancelOrientationBooking → updates status to "cancelled"
  - [ ] getUserOrientations → returns user's bookings
  - [ ] getInspectorsWithAvailability → works without old table

- [ ] **Mobile App Testing**
  - [ ] Book orientation slot
  - [ ] View booked session details
  - [ ] Cancel booking
  - [ ] Verify QR code generation
  - [ ] Test notifications

- [ ] **WebAdmin Testing**
  - [ ] View attendance tracker
  - [ ] Check-in attendee via QR scan
  - [ ] Check-out attendee via QR scan
  - [ ] Finalize session
  - [ ] Update attendance status manually
  - [ ] Verify inspector availability check

- [ ] **Inspector App Testing** (if separate)
  - [ ] View daily schedule
  - [ ] Scan QR for check-in
  - [ ] Scan QR for check-out
  - [ ] Add inspector notes

### Phase 4: Schema Cleanup 🗑️

**⚠️ ONLY AFTER ALL TESTS PASS**

- [ ] **Remove Old Tables from Schema**
  ```typescript
  // Delete from backend/convex/schema.ts:
  - orientations: defineTable({...})
  - orientationSessions: defineTable({...})
  ```

- [ ] **Deploy Schema Changes**
  ```bash
  cd C:\Em\backend
  npx convex deploy
  ```

- [ ] **Verify Deployment**
  - [ ] Check Convex dashboard - old tables gone
  - [ ] Verify apps still work
  - [ ] Run smoke tests

### Phase 5: Documentation 📝

- [ ] Update API documentation
- [ ] Update README files
- [ ] Document breaking changes (if any)
- [ ] Update migration guide status

---

## 🔍 Verification Commands

### Check for Old Table References

```bash
cd C:\Em

# Backend - Search for old tables
cd backend/convex
grep -r "orientationSessions" . --exclude-dir=node_modules
grep -r '"orientations"' . --exclude-dir=node_modules

# Mobile App
cd ../../apps/mobile
grep -r "orientationSessions" . --exclude-dir=node_modules
grep -r "Id<'orientations'>" . --exclude-dir=node_modules

# WebAdmin
cd ../webadmin
grep -r "orientationSessions" . --exclude-dir=node_modules
grep -r "Id<'orientations'>" . --exclude-dir=node_modules
```

### Run TypeScript Check

```bash
# Backend
cd C:\Em\backend
npx tsc --noEmit

# Mobile
cd C:\Em\apps\mobile
npm run type-check

# WebAdmin
cd C:\Em\apps\webadmin
npm run type-check
```

---

## 🚨 Breaking Changes

### API Response Changes

**Before:**
```typescript
{
  sessionId: Id<"orientationSessions">
  session: { status: "scheduled" | "cancelled" | "completed" | "no-show" }
}
```

**After:**
```typescript
{
  bookingId: Id<"orientationBookings">
  booking: { status: "scheduled" | "checked-in" | "completed" | "cancelled" | "missed" | "excused" }
}
```

### Status Values Changed

| Old Status | New Status |
|------------|------------|
| `"scheduled"` | `"scheduled"` ✅ Same |
| `"completed"` | `"completed"` ✅ Same |
| `"cancelled"` | `"cancelled"` ✅ Same |
| `"no-show"` | `"missed"` ⚠️ **Changed** |
| N/A | `"checked-in"` ✨ **New** |
| N/A | `"excused"` ✨ **New** |

### Old `orientations` Status Mapping

| Old `orientationStatus` | New `status` |
|-------------------------|--------------|
| `"Scheduled"` | `"scheduled"` |
| `"Completed"` | `"completed"` |
| `"Missed"` | `"missed"` |
| `"Excused"` | `"excused"` |

---

## 📊 Migration Progress

```
████████████████████████░░░░  75% Complete

✅ Schema Updated (orientationBookings table added)
✅ Migration Script Created
✅ Booking Mutations Updated
✅ Mobile App Service Updated
⚠️  Inspector Availability NOT UPDATED
⚠️  WebAdmin Types Need Fix
⚠️  getUserOrientations Incomplete
❌ Old Tables Still in Schema
❌ Full Testing Incomplete
```

---

## 🎯 Next Steps (In Order)

1. **FIX** `convex/admin/inspectorAvailability.ts` (30 min)
2. **IMPLEMENT** `convex/orientations/getUserOrientations.ts` (15 min)
3. **UPDATE** WebAdmin types (`attendance-tracker/page.tsx`) (10 min)
4. **RUN** grep commands to find any remaining old references (5 min)
5. **TEST** all critical flows (Mobile + WebAdmin + Inspector) (1-2 hours)
6. **REMOVE** old table definitions from schema (5 min)
7. **DEPLOY** to production (10 min)
8. **VERIFY** production functionality (30 min)

**Estimated Total Time:** 3-4 hours

---

## ✅ Success Criteria

Migration is complete when:

- ✅ Zero references to `orientationSessions` table in code
- ✅ Zero references to `orientations` table in code (except migrations)
- ✅ All TypeScript compiles without errors
- ✅ Mobile app: book, cancel, view bookings works
- ✅ WebAdmin: attendance tracking, check-in/out works
- ✅ Inspector: QR scanning, session viewing works
- ✅ Old tables removed from schema
- ✅ Production deployment successful

---

## 🆘 Rollback Plan

If critical issues arise:

1. **Revert Code Changes:**
   ```bash
   git checkout main
   ```

2. **Keep Old Tables:**
   - Don't delete old tables from schema
   - They still have data if migration needs to re-run

3. **Re-run Migration:**
   ```bash
   npx convex run orientationBookings:migrateToUnifiedBookings
   ```

---

**🔗 Related Documents:**
- [Migration Execution Guide](./ORIENTATION_MIGRATION_EXECUTION_GUIDE.md)
- [Original Migration Plan](./orientation-convex-migration.md)
- [Schema Proposal](./orientation-schema-proposal.md)
