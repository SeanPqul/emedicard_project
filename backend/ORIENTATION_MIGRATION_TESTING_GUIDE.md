# Orientation Schema Migration - Backend Testing Guide

## 🎯 Overview

This guide walks you through safely testing the orientation schema migration from the old two-table structure (`orientations` + `orientationSessions`) to the new unified `orientationBookings` table.

**Branch:** `orientation-schema-migration`
**Status:** Backend migration complete, ready for testing

---

## 📋 Pre-Migration Checklist

Before running the migration, verify:

- [ ] You're on the `orientation-schema-migration` branch
- [ ] All backend code changes are committed
- [ ] You have access to Convex dashboard
- [ ] You have a backup/can rollback if needed

---

## 🚀 Step-by-Step Testing Process

### Step 1: Deploy Schema Changes (5 min)

```bash
cd C:\Em\backend
npx convex dev
```

**What this does:**
- Deploys the new `orientationBookings` table
- Deploys the `_orientationMigrationLog` table
- Keeps old tables (`orientations`, `orientationSessions`) intact

**Expected Output:**
```
✔ Convex functions ready at https://your-deployment.convex.cloud
```

**Verify in Convex Dashboard:**
1. Open https://dashboard.convex.dev
2. Go to "Data" tab
3. Confirm you see:
   - ✅ `orientationBookings` (empty)
   - ✅ `_orientationMigrationLog` (empty)
   - ✅ `orientations` (existing data)
   - ✅ `orientationSessions` (existing data)

---

### Step 2: Check Migration Stats (DRY RUN Preview)

**In Convex Dashboard:**
1. Go to "Functions" tab
2. Find: `migrations:getMigrationStats`
3. Click "Run"
4. No arguments needed
5. Click "Run function"

**Expected Response:**
```json
{
  "old": {
    "orientations": 15,      // Your actual count
    "sessions": 15           // Should match orientations
  },
  "new": {
    "bookings": 0            // Empty before migration
  },
  "migration": {
    "total": 0,
    "success": 0,
    "failed": 0,
    "skipped": 0
  },
  "isComplete": false
}
```

**✅ PASS if:** You see your current orientation/session counts
**❌ FAIL if:** Counts are way off or tables don't exist

---

### Step 3: Run Migration in DRY-RUN Mode (10 min)

**Purpose:** Preview what will happen WITHOUT making changes

**In Convex Dashboard:**
1. Go to "Functions" tab
2. Find: `migrations:migrateOrientationData`
3. Click "Run"
4. **Arguments:**
   ```json
   {
     "dryRun": true
   }
   ```
5. Click "Run function"

**Expected Response:**
```json
{
  "migrationBatch": "uuid-here",
  "success": 15,
  "failed": 0,
  "skipped": 0,
  "orphaned": 0,
  "duration": 2.34,
  "errors": [],
  "dryRun": true
}
```

**✅ PASS if:**
- `success` count matches your orientationSessions count
- `failed: 0`
- `orphaned: 0` (or very few)
- `errors: []`

**⚠️ WARNING if:**
- `orphaned > 0` - Check console logs for details
- `failed > 0` - Review error messages

**❌ STOP if:**
- `failed` count is high (>10% of records)
- Errors indicate schema issues

---

### Step 4: Review DRY-RUN Console Output

Check the console logs in Convex dashboard:

**Look for:**
```
🚀 Starting orientation migration (DRY RUN)
📦 Migration Batch ID: abc-123
📊 Found 15 orientation sessions
📊 Found 15 orientation records
✅ Processed 10 sessions...
⏭️  Session xyz already migrated, skipping
⚠️  Orphaned orientation found: ...
====================================
🎉 Migration Preview Complete!
====================================
✅ Success: 15
❌ Failed: 0
⏭️  Skipped: 0
⚠️  Orphaned: 0
⏱️  Duration: 2.34s
====================================
```

**✅ PASS if:** Clean output with expected counts
**❌ FAIL if:** Many errors or warnings

---

### Step 5: Run ACTUAL Migration (5 min)

**⚠️ IMPORTANT:** Only proceed if Step 4 passed!

**In Convex Dashboard:**
1. Go to "Functions" tab
2. Find: `migrations:migrateOrientationData`
3. Click "Run"
4. **Arguments:**
   ```json
   {
     "dryRun": false
   }
   ```
5. Click "Run function"

**Expected Response:**
```json
{
  "migrationBatch": "uuid-different-from-dry-run",
  "success": 15,
  "failed": 0,
  "skipped": 0,
  "orphaned": 0,
  "duration": 2.45,
  "errors": [],
  "dryRun": false
}
```

**Save this `migrationBatch` UUID** - you'll need it for rollback if necessary!

---

### Step 6: Verify Migration Success (10 min)

#### 6.1: Check Migration Stats Again

Run `migrations:getMigrationStats` again:

**Expected Response:**
```json
{
  "old": {
    "orientations": 15,
    "sessions": 15
  },
  "new": {
    "bookings": 15          // ✅ Should now match old count!
  },
  "migration": {
    "total": 30,            // sessions + orientations
    "success": 30,
    "failed": 0,
    "skipped": 0
  },
  "isComplete": true        // ✅ Should be true!
}
```

**✅ PASS if:**
- `bookings` count = `sessions` count
- `isComplete: true`
- `failed: 0`

#### 6.2: Verify Migration Integrity

Run `migrations:verifyMigration`:

**Expected Response:**
```json
{
  "isValid": true,
  "issues": [],
  "counts": {
    "sessions": 15,
    "bookings": 15,
    "successfulMigrations": 15
  }
}
```

**✅ PASS if:** `isValid: true` and `issues: []`
**❌ FAIL if:** Issues array contains errors

#### 6.3: Inspect Sample Data

**In Convex Dashboard Data tab:**

1. Click `orientationBookings` table
2. Check a few random records
3. **Verify fields exist:**
   - ✅ `userId` (Clerk ID string)
   - ✅ `applicationId`
   - ✅ `scheduleId`
   - ✅ `scheduledDate`, `scheduledTime`
   - ✅ `venue` (object with name/address)
   - ✅ `status` (e.g., "scheduled", "completed")
   - ✅ `qrCodeUrl`
   - ✅ `checkInTime`, `checkOutTime` (if completed)
   - ✅ `createdAt`

4. Compare with original record in `orientationSessions`:
   - Find matching `applicationId`
   - Verify data matches

**✅ PASS if:** Data looks correct and complete

---

### Step 7: Test Backend Functions (15 min)

Now test the updated backend functions work with new schema:

#### 7.1: Test `getUserOrientationSession`

**In Convex Dashboard Functions:**
1. Find: `orientationSchedules:getUserOrientationSession`
2. **Arguments:**
   ```json
   {
     "applicationId": "INSERT_REAL_APP_ID_HERE"
   }
   ```
   (Get an applicationId from your orientationBookings table)
3. Run it

**Expected:** Returns the booking record for that application
**✅ PASS if:** You get the booking object back

#### 7.2: Test `getAttendanceStatus`

1. Find: `orientations:attendance:getAttendanceStatus`
2. **Arguments:**
   ```json
   {
     "applicationId": "INSERT_REAL_APP_ID_HERE"
   }
   ```
3. Run it

**Expected:**
```json
{
  "hasOrientation": true,
  "status": "scheduled",
  "isCheckedIn": false,
  "isCheckedOut": false,
  "isCompleted": false
}
```

**✅ PASS if:** Status matches the booking's actual status

#### 7.3: Test `getOrientationSchedulesForDate`

1. Find: `orientations:attendance:getOrientationSchedulesForDate`
2. **Arguments:**
   ```json
   {
     "selectedDate": 1735603200000
   }
   ```
   (Use a timestamp from your actual data)
3. Run it

**Expected:** Returns array of schedules with attendees
**✅ PASS if:** You see attendee arrays populated from bookings

---

## 🔄 Rollback Procedure (If Something Goes Wrong)

**If migration failed or data looks wrong:**

```bash
# In Convex Dashboard Functions:
# Find: migrations:rollbackMigration

# Arguments:
{
  "migrationBatch": "INSERT_YOUR_BATCH_UUID_FROM_STEP_5",
  "confirm": true
}
```

**This will:**
- Delete all `orientationBookings` created in this batch
- Delete migration log entries
- Leave old tables intact

**After rollback:**
- Review error messages
- Fix issues in migration script
- Try again

---

## ✅ Success Criteria Checklist

Migration is successful if ALL of these pass:

- [ ] Step 2: Migration stats show correct old table counts
- [ ] Step 3: Dry-run completed with 0 failures
- [ ] Step 5: Actual migration completed successfully
- [ ] Step 6.1: New bookings count matches old sessions count
- [ ] Step 6.2: Verification shows `isValid: true`
- [ ] Step 6.3: Sample data inspection looks correct
- [ ] Step 7.1-7.3: All function tests return expected results

---

## 🚨 Common Issues & Solutions

### Issue 1: "No matching orientationSession found"
**Cause:** Orphaned orientation records without sessions
**Solution:** This is expected for old/cancelled bookings. Check if count is reasonable (<5% of total).

### Issue 2: High failure rate
**Cause:** Schema mismatch or missing required fields
**Solution:**
1. Check error messages in console
2. May need to adjust migration script
3. Rollback and fix before retrying

### Issue 3: Status mapping seems wrong
**Cause:** Status determination logic needs adjustment
**Solution:**
1. Check `determineUnifiedStatus` function in migration script
2. Verify old vs new status mapping is correct

### Issue 4: Missing scheduleId in bookings
**Cause:** Admin-created orientations may not have matching schedule
**Solution:** This is a known issue - admin scheduling needs separate handling (documented in admin/orientation.ts TODO)

---

## 📊 Next Steps After Successful Migration

Once ALL tests pass:

1. **Document batch ID:** Save your migration batch UUID
2. **Notify team:** Migration completed successfully
3. **Continue to frontend:** Proceed with Phase 4 (mobile app updates)
4. **Keep old tables:** Don't delete yet - we'll archive in Phase 7

---

## 🆘 Need Help?

**Before asking for help, provide:**
1. Migration batch UUID
2. Output from `getMigrationStats`
3. Output from `verifyMigration`
4. Error messages from console
5. Sample data comparison (old vs new)

**Common fixes:**
- Re-run dry-run to see latest state
- Check Convex dashboard console logs
- Verify you're on correct branch
- Confirm schema deployed successfully

---

**Created:** January 2025
**Last Updated:** January 2025
**Migration Version:** 1.0
