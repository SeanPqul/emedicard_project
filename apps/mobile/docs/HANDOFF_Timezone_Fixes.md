# Timezone Fixes Handoff Document

**Date**: January 27, 2025  
**Changes By**: AI Agent (via Warp)  
**Status**: ✅ Implemented & Ready for Testing

---

## 🎯 Problem Summary

The mobile app had two critical timezone-related bugs:

1. **CurrentSessionCard LIVE status mismatch**: The frontend used device local time (`Date.now()` and JS `Date`) to calculate countdown timers and session context (e.g., "Starts in X minutes", "Ends in X minutes"), which conflicted with the backend's PHT-based `session.isActive` flag. This caused incorrect LIVE badges to appear at 2:42 AM when sessions were actually scheduled for 9:00 AM PHT.

2. **Date picker timezone mismatch**: The native `DateTimePicker` returned a `Date` object in the device's local timezone. When users selected a date, the app called `changeDate(date.getTime())` which created a UTC timestamp from the device's local midnight, causing off-by-one-day errors for users in different timezones.

---

## ✅ Changes Implemented

### 1. **CurrentSessionCard.tsx** - PHT-Aware Time Context

**File**: `src/features/inspector/components/CurrentSessionCard/CurrentSessionCard.tsx`

**Changes**:
- Added imports for `date-fns-tz` (`toZonedTime`, `formatInTimeZone`) and `date-fns` (`isSameDay`, `isBefore`)
- Created `parseTimeString()` helper to convert time strings (e.g., "9:00 AM") to minutes since midnight
- Created `getSessionTimestamps()` helper to calculate session start/end timestamps in PHT
- Rewrote `getTimeContext()` function to:
  - Trust backend `session.isActive` flag for LIVE status (no frontend recalculation)
  - Use PHT timezone for all countdown calculations and date comparisons
  - Format dates/times using `formatInTimeZone()` with PHT timezone
  - Calculate "same day" using PHT calendar dates via `isSameDay()`
- Updated countdown logic to display:
  - For LIVE sessions: "Ends in X minutes" or "⚠️ Ending in X minutes" (if < 15 min)
  - For UPCOMING sessions: "Starts in X minutes" (if today) or "Starts EEE, MMM d at h:mm a" (if future date)
  - For PAST sessions: "Session ended"

**Key principle**: The backend `isActive`, `isUpcoming`, and `isPast` flags are authoritative. The frontend only calculates countdown text and formatting.

---

### 2. **OrientationSessionsScreen.tsx** - Date Picker Timezone Conversion

**File**: `src/screens/inspector/OrientationSessionsScreen/OrientationSessionsScreen.tsx`

**Changes**:
- Added import for `date-fns-tz` (`toZonedTime`) and `useMemo` from React
- Fixed `handleDateChange()`:
  - Extracts Y-M-D from the device-local picker date
  - Creates a normalized Date at noon to avoid DST issues
  - Passes to `changeDate()` which applies `getStartOfDay()` (PHT midnight conversion)
- Fixed date picker `value` prop:
  - Converts `selectedDate` (PHT midnight timestamp) to PHT Date object
  - Extracts Y-M-D and reconstructs as device-local Date at noon
  - Ensures picker displays the correct PHT calendar date regardless of device timezone

**Result**: Users selecting Oct 28 in any timezone will query sessions for Oct 28 PHT midnight, not device-local midnight.

---

## 🔧 Supporting Infrastructure (Already in Place)

The following utilities already existed and work correctly with PHT:

- **`getStartOfDay()`** (`src/features/inspector/lib/utils.ts`): Converts any date/timestamp to PHT midnight (00:00:00 Asia/Manila)
- **`formatTime()`** and **`formatDate()`**: Format timestamps in PHT using `toZonedTime()` and `toLocaleTimeString()`/`toLocaleDateString()`
- Backend query `getSchedulesForDate`: Returns sessions with `isActive`, `isUpcoming`, `isPast` flags computed server-side in PHT

---

## 🧪 Testing Checklist

### Manual Testing Scenarios

Run these tests on devices/emulators set to different timezones:

1. **Timezone Variations**:
   - [ ] America/Los_Angeles (UTC-8)
   - [ ] Europe/London (UTC+0)
   - [ ] Asia/Tokyo (UTC+9)
   - [ ] Asia/Manila (UTC+8)

2. **CurrentSessionCard**:
   - [ ] At 02:42 AM PHT: Verify session shows "UPCOMING" badge, not "LIVE"
   - [ ] During session (e.g., 9:30 AM PHT): Verify "LIVE" badge and countdown shows "Ends in X min"
   - [ ] Before session (e.g., 8:50 AM PHT): Verify "UPCOMING" badge and countdown shows "Starts in 10 minutes"
   - [ ] After session ends: Verify "Session ended" text

3. **Date Picker**:
   - [ ] Select Oct 28 from picker → Verify app queries and displays Oct 28 PHT sessions
   - [ ] Change device timezone → Verify selecting same date still queries correct PHT date
   - [ ] Cross midnight PHT boundary (23:55 → 00:05) → Verify date picker updates correctly

4. **Edge Cases**:
   - [ ] Near midnight PHT: Test picker and session display
   - [ ] Device DST transition days (if device supports DST)
   - [ ] Cross-verify displayed sessions with Convex admin panel data

---

## 🔍 Backend Verification

Ensure backend is returning correct data:

```javascript
// Backend query: getSchedulesForDate
// Should return:
{
  scheduleId: "...",
  date: 1698451200000, // PHT midnight timestamp
  time: "9:00 AM - 11:00 AM",
  venue: { name: "..." },
  isActive: false,    // Computed server-side in PHT
  isUpcoming: true,   // Computed server-side in PHT
  isPast: false,      // Computed server-side in PHT
  attendees: [...],
  serverTime: 1698451234567 // Current server time
}
```

---

## 🚨 Known Issues / Future Work

1. **Test file errors**: `src/features/inspector/lib/__tests__/utils.timezone.test.ts` has TypeScript errors (missing Jest types) - this existed before our changes and needs separate fix
2. **Unit tests needed**: Add tests for `getTimeContext()` and `handleDateChange()` timezone logic (see TODO list)
3. **Other date pickers**: Scan codebase for other date/time pickers that might need similar fixes

---

## 🔄 Rollback Plan

If timezone fixes cause unexpected issues:

1. **Revert CurrentSessionCard**:
   ```bash
   git checkout HEAD~1 -- src/features/inspector/components/CurrentSessionCard/CurrentSessionCard.tsx
   ```

2. **Revert OrientationSessionsScreen**:
   ```bash
   git checkout HEAD~1 -- src/screens/inspector/OrientationSessionsScreen/OrientationSessionsScreen.tsx
   ```

3. **Feature flag option** (if needed for staged rollout):
   - Add config flag `ENABLE_PHT_TIMEZONE_FIX`
   - Conditionally use old/new logic based on flag
   - Roll out to small user group first

---

## 📝 Key Principles for Future Development

1. **Backend is source of truth**: Always trust `isActive`, `isUpcoming`, `isPast` flags from backend
2. **Format in PHT**: Use `formatInTimeZone(timestamp, 'Asia/Manila', pattern)` for all user-facing dates/times
3. **Date comparisons in PHT**: Use `isSameDay(toZonedTime(a, 'Asia/Manila'), toZonedTime(b, 'Asia/Manila'))` for "today" checks
4. **Date pickers**: Always convert picker output to PHT before querying backend
5. **Countdowns**: Calculate using epoch milliseconds (`endTime - now`), but derive context labels using PHT date comparisons

---

## 📚 References

- `date-fns-tz` docs: https://date-fns.org/docs/Time-Zones
- Philippine Time: UTC+8 (no DST)
- Backend timezone utils: `C:\Em\backend\convex\lib\timezone.ts`
- Frontend timezone utils: `C:\Em\apps\mobile\src\features\inspector\lib\utils.ts`

---

## ✅ Sign-off

**Implementation completed**: ✅  
**TypeScript check**: ✅ (no errors in modified files)  
**Manual QA required**: ⏳ (pending)  
**Unit tests required**: ⏳ (pending)

---

**Next Steps**:
1. Run manual QA across different timezones
2. Add unit tests for timezone logic
3. Monitor production for any edge cases
4. Consider adding timezone indicator in UI for transparency
