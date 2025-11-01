# Orientation Schema Migration - Execution Guide

## 🎯 Overview
Migrating from 3 tables to 2 tables for cleaner schema:
- **Before**: `orientationSchedules` + `orientationSessions` + `orientations` (confusing!)
- **After**: `orientationSchedules` + `orientationBookings` (clean!)

## ✅ Pre-Migration Checklist

### 1. Verify Current Branch
```bash
git branch --show-current
# Should output: orientation-schema-migration
```

### 2. Deploy New Schema
```bash
cd C:\Em\backend
npx convex deploy
```
This adds the `orientationBookings` table while keeping old tables for backward compatibility.

### 3. Verify Schema Deployment
Check Convex dashboard to ensure:
- ✅ `orientationBookings` table exists
- ✅ `orientationMigrationLog` table exists
- ✅ Old tables (`orientationSessions`, `orientations`) still exist

---

## 🚀 Migration Execution

### Step 1: Run Data Migration

```bash
cd C:\Em\backend
npx convex run orientationBookings:migrateToUnifiedBookings
```

**Expected Output:**
```
🚀 Starting migration batch: <uuid>
📋 Found X orientation sessions
✅ Migrated session ... → booking ...
📋 Checking Y orientation records for orphans
✅ Migrated orphaned orientation ... → booking ...

📊 Migration Summary:
   Batch ID: <uuid>
   Sessions processed: X
   Orientations processed: Y
   Bookings created: Z
   Errors: 0
```

### Step 2: Verify Migration

```bash
npx convex run orientationBookings:verifyMigration
```

**Expected Output:**
```
📊 Migration Verification:
   Old tables: X records
     - Sessions: X
     - Orientations: Y
   New table: Z bookings
   Migration logs: Z
     - Success: Z
     - Failed: 0
     - Skipped: 0
```

**⚠️ If there are failures**, check the `orientationMigrationLog` table in Convex dashboard for details.

---

## 📝 Code Updates Required

### Backend API Updates

#### Files to Update:
1. `C:\Em\backend\convex\orientationSchedules\bookOrientationSlot.ts`
2. `C:\Em\backend\convex\orientations\attendance.ts` (checkIn, checkOut)
3. `C:\Em\backend\convex\orientationSchedules\cancelOrientationBooking.ts`
4. `C:\Em\backend\convex\orientations\getUserOrientations.ts`
5. `C:\Em\backend\convex\admin\orientation.ts` (scheduleOrientation)

#### Status Mapping Guide:
```typescript
// Old → New mapping
orientationSessions.status      | orientations.orientationStatus | → orientationBookings.status
--------------------------------|--------------------------------|-----------------------------
"scheduled"                     | "Scheduled"                    | → "scheduled"
"scheduled" + checkInTime       | "Scheduled" + checkInTime      | → "checked-in"
"scheduled" + checkOutTime      | "Completed"                    | → "completed"
"cancelled"                     | -                              | → "cancelled"
"no-show"                       | "Missed"                       | → "missed"
-                               | "Excused"                      | → "excused"
```

### Mobile App Updates

#### Files to Update:
1. `C:\Em\apps\mobile\src\features\orientation\services\orientationService.ts`
2. `C:\Em\apps\mobile\src\features\orientation\model\types.ts`

**API Changes:**
- `bookOrientationSlotMutation` → returns `orientationBookings` ID
- `getUserOrientationSessionQuery` → queries `orientationBookings`
- `cancelOrientationBookingMutation` → updates `orientationBookings`

### WebAdmin Updates

#### Files to Update:
1. `C:\Em\apps\webadmin\src\app\dashboard\[id]\orientation-scheduler\page.tsx`
2. `C:\Em\apps\webadmin\src\app\super-admin\orientation-schedules\page.tsx`

**Changes Needed:**
- Update `scheduleOrientation` to use `orientationBookings`
- Update attendance tracking queries

---

## 🧪 Testing Checklist

### Mobile App Testing
- [ ] Book a new orientation slot
- [ ] View booked orientation details
- [ ] Cancel booking
- [ ] Check QR code displays correctly
- [ ] Verify notifications

### WebAdmin Testing
- [ ] View orientation bookings for a schedule
- [ ] Check-in attendee via QR scan
- [ ] Check-out attendee via QR scan
- [ ] View attendance reports
- [ ] Schedule new orientation (admin)

### Inspector Testing
- [ ] Scan QR code for check-in
- [ ] Verify minimum duration enforcement
- [ ] Scan QR code for check-out
- [ ] Add inspector notes
- [ ] Mark as excused/missed

---

## 🗑️ Cleanup Phase

**⚠️ ONLY after ALL testing passes!**

### Step 1: Remove Old Table References

Remove these lines from `C:\Em\backend\convex\schema.ts`:

```typescript
// DELETE THESE SECTIONS:
orientations: defineTable({ ... })
orientationSessions: defineTable({ ... })
```

### Step 2: Archive Old Backend Files

Move these to an `_archived` folder:
- `convex/orientations/` (old attendance code)
- `convex/orientationSchedules/` (old booking code that references old tables)

### Step 3: Deploy Final Schema

```bash
cd C:\Em\backend
npx convex deploy
```

### Step 4: Verify Cleanup

Check Convex dashboard:
- ✅ Only `orientationSchedules` and `orientationBookings` exist
- ✅ Old tables are gone
- ✅ All queries/mutations work

---

## 🔄 Rollback Plan

If something goes wrong:

### Option 1: Revert Code Changes
```bash
git reset --hard HEAD
git checkout main
```

### Option 2: Keep Both Tables
- Keep old tables in schema
- Revert code changes to use old tables
- The new `orientationBookings` table can stay (unused)

### Option 3: Re-run Migration
If data is inconsistent:
```bash
# Delete all bookings
npx convex run orientationBookings:deleteAllBookings

# Re-run migration
npx convex run orientationBookings:migrateToUnifiedBookings
```

---

## 📊 Data Flow Comparison

### Old Flow (3 tables):
```
User books → orientationSessions (booking)
          → orientations (QR code + attendance)
Inspector scans → orientations.checkInTime
Inspector scans → orientations.checkOutTime
```

### New Flow (2 tables):
```
User books → orientationBookings (status: "scheduled")
Inspector scans → orientationBookings (status: "checked-in" + checkInTime)
Inspector scans → orientationBookings (status: "completed" + checkOutTime)
```

---

## 🚨 Common Issues

### Issue: "Table orientationBookings not found"
**Solution:** Run `npx convex deploy` to create the table

### Issue: Migration shows errors
**Solution:** Check `orientationMigrationLog` table for details. Common causes:
- Orphaned records (no matching schedule)
- Missing user/application records

### Issue: Duplicate bookings
**Solution:** Migration script automatically skips duplicates. Check logs.

### Issue: Mobile app crashes after update
**Solution:** 
1. Check API endpoint names match
2. Verify type definitions are updated
3. Clear app cache and rebuild

---

## 📞 Support

If you encounter issues:
1. Check migration logs in Convex dashboard
2. Review error messages in console
3. Verify all files are updated correctly
4. Test on a single record first before full deployment

---

## ✅ Success Criteria

Migration is complete when:
- ✅ All data migrated successfully (0 errors)
- ✅ Mobile app: booking, cancellation works
- ✅ WebAdmin: check-in/check-out works
- ✅ Inspector flow: QR scanning works
- ✅ No references to old tables in code
- ✅ Old tables removed from schema
- ✅ All tests pass

---

**Good luck with your migration! 🚀**
