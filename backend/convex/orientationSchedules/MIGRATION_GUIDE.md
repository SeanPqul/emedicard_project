# Orientation Schedules - Structured Time Migration Guide

## Overview

This migration updates the orientation schedules system to use structured time fields (`startMinutes` and `endMinutes`) instead of relying solely on free-text time strings. This improves data validation, prevents parsing errors, and enables better time-based queries and sorting.

## What Changed

### Schema Changes (schema.ts)

Added three new fields to `orientationSchedules` table:
- `startMinutes` (optional): Minutes since midnight (0-1439), e.g., 540 = 9:00 AM
- `endMinutes` (optional): Minutes since midnight (0-1439), e.g., 660 = 11:00 AM
- `durationMinutes` (optional): Auto-calculated duration in minutes

The `time` field remains but is now auto-generated from the structured fields for display purposes.

### Backend Changes

#### Mutations Updated
- `createSchedule`: Now requires `startMinutes` and `endMinutes`
- `updateSchedule`: Supports updating time via structured fields
- `bulkCreateSchedules`: Uses structured time fields
- `autoCreateSchedulesHandler`: Updated to use structured time config

All mutations now:
1. Validate time ranges (30 min - 8 hours duration)
2. Auto-generate the `time` display string
3. Auto-calculate `durationMinutes`

### Frontend Changes

#### Web Admin
- Already uses structured time inputs (`<input type="time">`)
- Shows live preview and validation
- No changes needed - already compatible!

#### Mobile App
- Uses the auto-generated `time` string for display
- No parsing required
- No changes needed - already compatible!

## Migration Steps

### Step 1: Deploy Schema Update

```bash
cd C:\Em\backend
npx convex deploy
```

This will add the new optional fields to the schema.

### Step 2: Run Migration Dry Run (Optional but Recommended)

First, preview what will be migrated:

```bash
npx convex run orientationSchedules/migrateTimeFields:dryRunMigration
```

This shows:
- How many schedules need migration
- How many are already migrated
- Any schedules that would fail to parse

### Step 3: Run Migration

Execute the migration to backfill existing schedules:

```bash
npx convex run orientationSchedules/migrateTimeFields:migrateExistingSchedules
```

The migration will:
- Skip schedules that already have `startMinutes` and `endMinutes`
- Parse the `time` string for schedules that need migration
- Populate `startMinutes`, `endMinutes`, and `durationMinutes`
- Standardize the `time` string format
- Report any errors encountered

### Step 4: Verify Migration

Check the migration results:
- Review the console output for counts and errors
- Query the database to ensure all schedules have the structured fields
- Test creating new schedules via web admin

### Step 5: Make Fields Required (Optional - Future)

Once all existing schedules are migrated and the system is stable, you can update the schema to make these fields required:

```typescript
startMinutes: v.float64(), // Remove v.optional()
endMinutes: v.float64(),   // Remove v.optional()
```

Then deploy again:
```bash
npx convex deploy
```

## Validation Rules

The system enforces these validation rules:

1. **Time Range**: `startMinutes` must be before `endMinutes`
2. **Minimum Duration**: At least 30 minutes
3. **Maximum Duration**: No more than 8 hours (480 minutes)
4. **Valid Range**: Both values must be between 0-1439 (full day)

## Time Conversion Reference

Minutes are counted from midnight:
- 0 = 12:00 AM (midnight)
- 540 = 9:00 AM
- 660 = 11:00 AM
- 840 = 2:00 PM
- 960 = 4:00 PM
- 1439 = 11:59 PM

## Default Schedule Configuration

The auto-create handler now uses structured time:

```typescript
timeSlots: [
  { startMinutes: 540, endMinutes: 660 },  // 9:00 AM - 11:00 AM
  { startMinutes: 840, endMinutes: 960 },  // 2:00 PM - 4:00 PM
]
```

To customize, edit `autoCreateSchedulesHandler.ts`.

## Rollback Plan

If issues arise, you can:

1. **Keep using the `time` field** - It's still populated and won't be removed
2. **Revert schema changes** - The fields are optional, so old code will still work
3. **Re-run migration** - The script is idempotent and can be run multiple times safely

## Testing Checklist

After migration, verify:

- [ ] Existing schedules display correctly in web admin
- [ ] Existing schedules display correctly in mobile app
- [ ] Creating new schedules works via web admin
- [ ] Bulk creating schedules works
- [ ] Time validation prevents invalid ranges
- [ ] Auto-create cron job uses structured time
- [ ] Booking schedules still works from mobile app
- [ ] Time display is consistent across platforms

## Troubleshooting

### Migration Fails for Some Schedules

**Symptom**: Migration reports errors for specific schedules

**Solution**: 
1. Check the error details in the migration output
2. Manually inspect problematic schedules in the database
3. Fix the `time` string format or manually set `startMinutes`/`endMinutes`
4. Re-run migration

### Time Display Looks Wrong

**Symptom**: Times show incorrectly formatted

**Solution**:
- The `formatTimeRange` utility generates "9:00 AM - 11:00 AM" format
- If different format needed, update `timeUtils.ts` in backend

### Validation Too Strict

**Symptom**: Can't create schedules with desired duration

**Solution**:
- Edit validation rules in `backend/convex/orientationSchedules/timeUtils.ts`
- Update `validateTimeRange` function minimum/maximum duration

## Benefits After Migration

✅ **Data Integrity**: Structured time prevents parsing errors
✅ **Better Validation**: Enforces valid time ranges at mutation level
✅ **Easier Queries**: Can query/sort by start time directly
✅ **Conflict Detection**: Can check for overlapping schedules
✅ **Timezone Clarity**: Minutes since midnight is timezone-agnostic
✅ **Consistent Display**: Auto-generated time string ensures uniform format

## Questions or Issues?

Refer to:
- `backend/convex/orientationSchedules/timeUtils.ts` - Time conversion utilities
- `backend/convex/orientationSchedules/mutations.ts` - Mutation handlers
- `backend/convex/orientationSchedules/migrateTimeFields.ts` - Migration script
