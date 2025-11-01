# Orientation Migration - Quick Reference Card

## 🎯 TL;DR

**Old Schema:** 2 tables (confusing, duplicated data)
- `orientations` - attendance tracking
- `orientationSessions` - booking records

**New Schema:** 1 unified table (clean, simple)
- `orientationBookings` - everything in one place

---

## 📦 What Changed

### Schema Changes
```typescript
// OLD: Two separate queries needed
const session = await db.query("orientationSessions")...
const orientation = await db.query("orientations")...

// NEW: One unified query
const booking = await db.query("orientationBookings")...
```

### Status Flow
```
OLD:
orientationSessions.status: "scheduled" | "completed" | "cancelled" | "no-show"
orientations.orientationStatus: "Scheduled" | "Completed" | "Missed" | "Excused"

NEW (unified):
orientationBookings.status: "scheduled" | "checked-in" | "completed" |
                            "cancelled" | "missed" | "excused" | "no-show"
```

### New Status: `checked-in`
```
Before: scheduled → completed (no in-between)
After:  scheduled → checked-in → completed (clear progression)
```

---

## 🚀 3-Step Migration

```bash
# 1. Deploy schema
cd C:\Em\backend
npx convex dev

# 2. Test migration (safe preview)
# In Convex Dashboard: migrations:migrateOrientationData
# Args: { "dryRun": true }

# 3. Run migration (actual)
# In Convex Dashboard: migrations:migrateOrientationData
# Args: { "dryRun": false }
```

---

## ✅ Quick Validation

After migration, check:
```bash
# 1. Counts match
migrations:getMigrationStats
# old.sessions === new.bookings ✅

# 2. No errors
migrations:verifyMigration
# isValid: true ✅

# 3. Functions work
orientationSchedules:getUserOrientationSession({ applicationId: "..." })
# Returns booking ✅
```

---

## 🔧 Updated Functions

All these now use `orientationBookings`:

**Attendance** (`orientations/attendance.ts`):
- `checkIn()` - Updates status to "checked-in"
- `checkOut()` - Updates status to "completed"
- `getAttendanceStatus()` - Queries bookings
- `getAttendeesForSession()` - Gets booking attendees
- `finalizeSessionAttendance()` - Batch updates bookings
- All inspector functions

**Booking** (`orientationSchedules/`):
- `bookOrientationSlot()` - Creates booking
- `cancelOrientationBooking()` - Updates status to "cancelled"
- `getUserOrientationSession()` - Gets user's booking

**Admin** (`admin/orientation.ts`):
- `getOrientationByApplicationId()` - Queries bookings
- `getAvailableTimeSlots()` - Uses bookings for counting

---

## 🔄 Rollback (Emergency)

If something breaks:
```bash
# In Convex Dashboard:
migrations:rollbackMigration({
  "migrationBatch": "YOUR_BATCH_UUID_HERE",
  "confirm": true
})
```

**This will:**
- Delete all created `orientationBookings`
- Restore to pre-migration state
- Old tables remain untouched

---

## 📊 Migration Logs

Check migration status:
```typescript
// Get overall stats
migrations:getMigrationStats()

// Verify data integrity
migrations:verifyMigration()

// View migration log table
// Dashboard → Data → _orientationMigrationLog
```

---

## 🚨 If Tests Fail

**High failure rate?**
- Check error messages in Convex console
- Look for schema mismatches
- Verify old data is clean

**Orphaned records?**
- Normal for old/cancelled bookings
- Should be <5% of total
- Review console warnings

**Missing fields?**
- Check sample booking in Data tab
- Compare with old session record
- Verify all fields migrated

---

## 📞 Support Checklist

Before asking for help:
1. [ ] Migration batch UUID
2. [ ] Output from `getMigrationStats`
3. [ ] Output from `verifyMigration`
4. [ ] Console error messages
5. [ ] Sample data comparison

---

## 🎉 Success = All Green

- ✅ Schema deployed
- ✅ Dry-run passed (0 failures)
- ✅ Migration completed
- ✅ Counts match
- ✅ Verification passed
- ✅ Functions tested

**→ Ready for frontend updates!**

---

**Need detailed guide?** See `ORIENTATION_MIGRATION_TESTING_GUIDE.md`
