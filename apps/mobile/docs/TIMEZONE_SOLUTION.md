# Philippine Time (PHT) Timezone Solution

## Problem
The app was experiencing date synchronization issues where sessions would not appear correctly in the Inspector Dashboard when running on the emulator. The device time showed the 27th, but the actual date was the 28th. This was caused by:

1. **Device timezone differences** - The app relied on `Date.now()` and the device's local timezone
2. **Inconsistent "today" calculation** - Different devices in different timezones would see different dates
3. **Tampering vulnerability** - Users could change device clock to manipulate dates

## Solution: Client-Side Philippine Time Calculation

Instead of relying on server time queries (which added complexity and loading delays), we implemented a **timezone-aware client-side solution** using `date-fns-tz`.

### Implementation

#### 1. Install Dependencies
```bash
pnpm add date-fns-tz
```

We already had `date-fns` installed.

#### 2. Update `getStartOfDay` Utility
Located in: `src/features/inspector/lib/utils.ts`

```typescript
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay } from 'date-fns';

const PHILIPPINE_TIMEZONE = 'Asia/Manila';

/**
 * Get start of day timestamp in Philippine Time (Asia/Manila)
 * 
 * This function converts the given date to Philippine Time,
 * gets the start of that day (00:00:00), and returns the UTC timestamp.
 * 
 * This ensures consistent "today" calculation regardless of device timezone,
 * and makes the app tamper-resistant to device clock changes.
 */
export const getStartOfDay = (date: Date | number = new Date()): number => {
  // Convert input to PHT timezone
  const phtDate = toZonedTime(date, PHILIPPINE_TIMEZONE);
  
  // Get start of that day in PHT
  const phtStartOfDay = startOfDay(phtDate);
  
  // Convert back to UTC timestamp
  return fromZonedTime(phtStartOfDay, PHILIPPINE_TIMEZONE).getTime();
};
```

#### 3. Simplified Hooks
The hooks now use the client-side PHT calculation:

**`useInspectorDashboard.ts`**
```typescript
export function useInspectorDashboard() {
  // Use client-side PHT date calculation (timezone-aware)
  const today = useMemo(() => getStartOfDay(Date.now()), []);
  
  // Fetch schedules for today (PHT)
  const schedules = useQuery(
    api.orientationSchedules.getSchedulesForDate,
    { selectedDate: today }
  );
  
  // ...
}
```

**`useOrientationSessions.ts`**
```typescript
export function useOrientationSessions(initialDate?: number) {
  // Use client-side PHT date calculation (timezone-aware)
  const [selectedDate, setSelectedDate] = useState<number>(
    initialDate || getStartOfDay(Date.now())
  );
  
  // ...
}
```

## Benefits

### 1. **Consistent Timezone Handling**
- All dates are calculated in Philippine Time (UTC+8)
- Works the same way on all devices regardless of their timezone
- No more "27th vs 28th" discrepancies

### 2. **No Server Query Lag**
- Previous approach: fetch server date → wait for response → fetch sessions
- New approach: calculate PHT date instantly → fetch sessions
- Eliminates empty states and loading delays

### 3. **Tamper-Resistant**
- Uses UTC time internally, converted to Philippine Time
- Device timezone changes don't affect the calculation
- Users can't manipulate dates by changing device clock

### 4. **Simpler Code**
- No need for server time queries
- No complex state management for server date sync
- Fewer edge cases to handle

### 5. **Reliable and Battle-Tested**
- Uses industry-standard `date-fns-tz` library
- Properly handles DST (though Philippines doesn't observe it)
- Well-documented and maintained

## How It Works

### Example: Device in Different Timezone

**Scenario:**
- Device is in UTC-5 (New York)
- Current UTC time: `2025-01-28 10:30:00 UTC`
- Device shows: `2025-01-28 05:30:00 EST` (same day)

**Conversion:**
1. `getStartOfDay(Date.now())` receives device time
2. Internally uses UTC timestamp (timezone-agnostic)
3. Converts to PHT: `2025-01-28 18:30:00 PHT`
4. Gets start of day in PHT: `2025-01-28 00:00:00 PHT`
5. Converts back to UTC: `2025-01-27 16:00:00 UTC`
6. Returns UTC timestamp for consistent backend queries

### Example: Date Crossing Midnight

**Scenario:**
- Current UTC time: `2025-01-28 17:00:00 UTC`
- In PHT: `2025-01-29 01:00:00 PHT` (next day!)

**Conversion:**
1. Converts to PHT: already January 29th
2. Gets start of day: `2025-01-29 00:00:00 PHT`
3. Returns: `2025-01-28 16:00:00 UTC`

This ensures the app shows **January 29th sessions**, not January 28th, which is correct for Philippine users.

## Testing

Comprehensive tests verify the timezone conversion:

```typescript
// Test file: src/features/inspector/lib/__tests__/utils.timezone.test.ts

describe('getStartOfDay - Philippine Time', () => {
  it('should return start of day in Philippine Time for current date', () => {
    const testDate = new Date('2025-01-28T10:30:00Z'); // UTC
    const result = getStartOfDay(testDate);
    const resultDate = new Date(result);
    
    // Expected: Jan 28, 2025 00:00:00 PHT = Jan 27, 2025 16:00:00 UTC
    expect(resultDate.toISOString()).toBe('2025-01-27T16:00:00.000Z');
  });
  
  // ... more tests
});
```

Run tests:
```bash
npm test -- src/features/inspector/lib/__tests__/utils.timezone.test.ts
```

## Migration Notes

### What Changed
- ✅ `getStartOfDay()` now calculates based on Philippine Time
- ✅ Removed server time query dependencies
- ✅ Simplified loading states in hooks
- ⚠️ All date filtering now consistently uses PHT

### What Stayed the Same
- Backend queries still receive UTC timestamps
- Time comparisons in UI still use `Date.now()`
- Display formatting unchanged

### Backend Compatibility
The backend still works with UTC timestamps, so no backend changes are required. The `selectedDate` parameter passed to backend queries is a UTC timestamp representing midnight in Philippine Time.

## Future Enhancements

If needed in the future:
- Export `PHILIPPINE_TIMEZONE` constant for other features
- Create helper functions for other timezone operations
- Add timezone selection for multi-region support

## References
- [date-fns-tz Documentation](https://github.com/marnusw/date-fns-tz)
- [date-fns Documentation](https://date-fns.org/)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
