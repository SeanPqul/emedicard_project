# Orientation Schedule Time Improvements

## Summary
Replaced free-text time input with structured time pickers in the web admin, along with backend schema improvements to eliminate parsing errors and ensure consistent time handling.

---

## ✅ Changes Made

### 1. Backend Time Utilities (`backend/convex/orientationSchedules/timeUtils.ts`)
- Parse 12-hour time strings → minutes since midnight
- Format minutes → 12-hour display ("9:00 AM")
- Validate time ranges (30min–8hrs, start < end)
- Calculate duration

### 2. Updated Backend Mutations (`backend/convex/orientationSchedules/mutations.ts`)
**New fields:**
- `startMinutes`: number (0-1439) - minutes since midnight
- `endMinutes`: number (0-1439)
- `durationMinutes`: number (auto-calculated)
- `time`: string (auto-generated for display, e.g., "9:00 AM - 11:00 AM")

**Mutations updated:**
- `createSchedule` - now accepts `startMinutes` + `endMinutes`
- `updateSchedule` - can update times using structured fields
- `bulkCreateSchedules` - uses same structured fields

**Server-side validation:**
- Minimum duration: 30 minutes
- Maximum duration: 8 hours
- Start must be before end

### 3. Migration Script (`backend/convex/orientationSchedules/migrateTimeFields.ts`)
- Parses existing time strings
- Populates `startMinutes`, `endMinutes`, `durationMinutes`
- Standardizes time format

**To run:**
```bash
cd C:\Em\backend
npx convex run orientationSchedules:migrateExistingSchedules
```

### 4. Web Admin Time Utilities (`webadmin/src/lib/timeUtils.ts`)
- Convert HH:MM (24-hour) ↔ minutes
- Format for 12-hour display
- Calculate and format duration
- Client-side validation

### 5. Web Admin UI Updates
**Both ScheduleModal and BulkCreateModal now have:**
- Two `<input type="time" step="900">` controls (15-min increments)
- Live preview showing "9:00 AM - 11:00 AM" format
- Duration display ("2 hours", "1.5 hours", etc.)
- Instant validation with error messages
- Visual feedback (green preview box)

---

## 🎯 Benefits

### Before (Text Input)
```
Time Slot: [9:00 AM - 11:00 AM     ]
```
**Problems:**
- Users type "9am", "9:00AM", "09:00 AM" (inconsistent)
- AM/PM confusion (12:00 AM vs 12:00 PM)
- No validation until backend
- Parse errors crash mobile app
- Can't reliably sort/filter

### After (Time Pickers)
```
Start Time: [09:00 ▼]  End Time: [11:00 ▼]

┌─────────────────────────────────┐
│ Time Slot: 9:00 AM - 11:00 AM  │
│ Duration: 2 hours               │
└─────────────────────────────────┘
```
**Benefits:**
- ✅ Browser-native pickers (mobile-optimized)
- ✅ Consistent HH:MM format
- ✅ 15-minute step intervals
- ✅ Live preview + validation
- ✅ No parsing errors
- ✅ Accessible (screen readers)

---

## 🚀 Next Steps (Mobile App)

The mobile app currently parses `time` strings. Once all schedules are migrated, update it to use `startMinutes`/`endMinutes` directly:

```ts
// Instead of parsing "9:00 AM - 11:00 AM"
const { start, end } = parseTimeSlot(session.time); // ❌ Old way

// Use structured fields directly
const { startTs, endTs } = getSessionBounds(
  session.date,
  session.timeSlot // Still works during migration
);

// Eventually switch to:
const startTs = session.date + (session.startMinutes * 60 * 1000);
const endTs = session.date + (session.endMinutes * 60 * 1000);
```

**Already implemented in mobile:**
- `getSessionBounds()` helper in `utils.ts` (can be updated later)
- `isTimeSlotActive()` and `isTimeSlotEnded()` use the helper

---

## 📝 Testing Checklist

- [ ] Run migration: `npx convex run orientationSchedules:migrateExistingSchedules`
- [ ] Create new schedule in web admin
  - [ ] Time pickers show with 15-min steps
  - [ ] Preview updates live
  - [ ] Validation prevents invalid ranges
  - [ ] Schedule saves successfully
- [ ] Edit existing schedule
  - [ ] Times pre-populate correctly
  - [ ] Can update times
- [ ] Bulk create schedules
  - [ ] Time pickers work
  - [ ] All schedules created with correct times
- [ ] Mobile app displays times correctly
  - [ ] Current/upcoming sessions show properly
  - [ ] No parse errors in console
  - [ ] Session status badges (LIVE/UPCOMING) accurate

---

## 🔧 Troubleshooting

**Issue:** Migration fails with parse errors
- **Fix:** Some schedules have malformed time strings. Check the error output, manually fix in database, re-run migration.

**Issue:** Web admin shows "undefined" for times
- **Fix:** Ensure migration ran successfully. Old schedules need `startMinutes`/`endMinutes` fields.

**Issue:** Mobile app still shows wrong times
- **Fix:** The mobile `getSessionBounds` helper already handles this correctly. If issues persist, check that `getStartOfDay()` returns UTC midnight.

---

## 📚 Additional Notes

- **Timezone:** All dates are UTC midnight. Times are local (displayed as 12-hour in preview, stored as minutes since midnight).
- **Time step:** 15-minute increments (`step="900"` seconds).
- **Browser compatibility:** `<input type="time">` supported in all modern browsers. Degrades to text input in older browsers (rare in admin tools).
- **Accessibility:** Native time pickers are screen-reader friendly.

---

## 🎉 Result

Robust, user-friendly time management with:
- Zero parsing ambiguity
- Server-side validation
- Live feedback
- Mobile-optimized UI
- No more "9am vs 9:00 AM" bugs!
