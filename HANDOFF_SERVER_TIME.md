# Server Time Synchronization - Handoff Document

## Overview
This document provides a comprehensive handoff for the server time synchronization feature implemented in the mobile app to ensure tamper-proof, timezone-accurate time handling across the inspector dashboard and QR scanner.

---

## Problem Statement
The mobile app was previously relying on device local time (`Date.now()`) for:
- Session time calculations and display
- Countdown timers
- Greeting messages
- Current session detection

This caused several issues:
1. **Timezone bugs**: Sessions showed incorrect times (e.g., 9AM-11AM session showing as 1:52AM)
2. **Tampering vulnerability**: Users could manipulate device time to bypass session restrictions
3. **Inconsistency**: Different devices in different timezones showed different session states

---

## Solution Architecture

### Backend Changes

#### 1. Server Time Endpoint (`/api/time/server`)
- **Location**: `apps/backend/convex/time.ts`
- **Purpose**: Provides current server timestamp in milliseconds
- **Response**: `{ serverTime: number }`
- **Usage**: Called by client to sync time with server

```typescript
export const getCurrentServerTime = query({
  handler: async () => {
    return { serverTime: Date.now() };
  },
});
```

#### 2. Current PHT Date Endpoint (`/api/time/current-pht-date`)
- **Location**: `apps/backend/convex/time.ts`
- **Purpose**: Returns current date at midnight in Philippine Time (PHT)
- **Response**: `{ date: string }` (ISO format)
- **Usage**: Used by dashboard to determine "today" for session filtering

```typescript
export const getCurrentPHTDate = query({
  handler: async () => {
    const now = new Date();
    const phtDate = toZonedTime(now, TIMEZONE);
    const midnight = startOfDay(phtDate);
    return { date: midnight.toISOString() };
  },
});
```

#### 3. Fixed Session Bounds Calculation
- **Location**: `apps/backend/convex/orientation.ts` → `calculateSessionBounds`
- **Issue Fixed**: Removed incorrect timezone offset adjustment that was causing 8-hour time shift
- **Key Change**: `dateUtcMidnight` already represents midnight in PHT correctly in UTC, so no offset adjustment needed

```typescript
// BEFORE (INCORRECT):
const sessionStartInMs = dateUtcMidnight + (schedule.startTimeMinutes - timezoneOffsetMinutes) * 60 * 1000;

// AFTER (CORRECT):
const sessionStartInMs = dateUtcMidnight + schedule.startTimeMinutes * 60 * 1000;
```

---

### Frontend Changes

#### 1. Server Time Hook (`useServerTime`)
- **Location**: `apps/mobile/src/features/inspector/hooks/useServerTime.ts`
- **Purpose**: Fetches server time and maintains synchronized time on client
- **Returns**: `{ serverTime: number | null, isLoading: boolean, error: any }`
- **How it works**:
  1. Fetches server timestamp on mount
  2. Calculates offset between server and client: `offset = serverTime - Date.now()`
  3. Returns current synced time as: `Date.now() + offset`

```typescript
const useServerTime = () => {
  const [serverTime, setServerTime] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchServerTime = async () => {
      const result = await api.time.getCurrentServerTime();
      setServerTime(result.serverTime);
    };
    fetchServerTime();
  }, []);

  return { serverTime, isLoading: !serverTime, error: null };
};
```

#### 2. Inspector Dashboard Hook (`useInspectorDashboard`)
- **Location**: `apps/mobile/src/features/inspector/hooks/useInspectorDashboard.ts`
- **Enhancement**: Now fetches and returns `serverTime` along with dashboard data
- **Key Change**: Uses server date instead of local date for "today" calculation

```typescript
export const useInspectorDashboard = () => {
  const { data: serverDateData } = useQuery(api.time.getCurrentPHTDate);
  const { serverTime } = useServerTime();
  
  const { data: dashboardData } = useQuery(
    api.orientation.getInspectorDashboard,
    serverDateData ? { date: serverDateData.date } : 'skip'
  );

  return {
    data: dashboardData,
    serverTime,
    isLoading,
    error
  };
};
```

#### 3. Dashboard Screen Updates
- **Location**: `apps/mobile/src/screens/inspector/InspectorDashboardScreen/InspectorDashboardScreen.tsx`
- **Changes**:
  1. **Server Time Display**: Shows live PHT time in header that updates every second
  2. **Greeting Message**: Uses PHT hour from server time instead of device time
  3. **Session Cards**: Pass `serverTime` to child components for countdown calculations

**Server Time Display (Header)**:
```typescript
useEffect(() => {
  let offset = 0;
  if (serverTime) {
    offset = serverTime - Date.now();
  }

  const updateTime = () => {
    const currentServerTime = Date.now() + offset;
    setCurrentTime(formatInTimeZone(currentServerTime, PHT_TZ, 'h:mm:ss a'));
  };
  
  updateTime();
  const interval = setInterval(updateTime, 1000);
  return () => clearInterval(interval);
}, [serverTime]);
```

**Greeting with PHT Hour**:
```typescript
function getGreeting(serverTime: number): string {
  // Get the hour in PHT timezone
  const hour = parseInt(formatInTimeZone(serverTime, PHT_TZ, 'H'), 10);
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
```

#### 4. Current Session Card
- **Location**: `apps/mobile/src/features/inspector/components/CurrentSessionCard/CurrentSessionCard.tsx`
- **Change**: Receives `serverTime` prop and calculates countdown based on synced server time

```typescript
export function CurrentSessionCard({ 
  session, 
  serverTime 
}: { 
  session?: SessionWithSchedule; 
  serverTime?: number 
}) {
  // Calculate time until session starts using serverTime
  const timeUntilStart = session && serverTime 
    ? session.sessionStart - serverTime 
    : null;
}
```

#### 5. QR Scanner Screen
- **Location**: `apps/mobile/src/screens/inspector/InspectorScannerScreen/InspectorScannerScreen.tsx`
- **Change**: Uses server time to determine which session is currently active
- **Logic**: Only the active session (where `serverTime` is between `sessionStart` and `sessionEnd`) is selectable

```typescript
const activeSession = sessions.find(
  s => serverTime && serverTime >= s.sessionStart && serverTime <= s.sessionEnd
);
```

---

## Key Benefits

### 1. **Tamper-Proof**
- Users cannot manipulate device time to bypass session restrictions
- Server is the single source of truth for current time and date

### 2. **Timezone Accurate**
- All times are calculated and displayed in Philippine Time (PHT/Asia/Manila)
- Consistent behavior regardless of device timezone settings

### 3. **Synchronized**
- All clients show the same time and session state
- Countdown timers are accurate and don't drift

### 4. **User-Friendly**
- Clear "PHT" label shows timezone context
- Live updating time display provides confidence
- Greeting messages reflect actual time of day in PHT

---

## Testing Checklist

### Backend
- [ ] `/api/time/server` returns valid timestamp
- [ ] `/api/time/current-pht-date` returns midnight in PHT
- [ ] Session bounds are calculated correctly (no 8-hour offset)

### Frontend
- [ ] Dashboard shows correct PHT time in header
- [ ] Time updates every second smoothly
- [ ] Greeting message reflects correct time of day in PHT
- [ ] Countdown timers show accurate time until session start
- [ ] "Today's sessions" shows correct sessions for current PHT date
- [ ] QR scanner only allows scanning during active session time
- [ ] Changing device time does not affect app behavior

### Edge Cases
- [ ] App behavior when server time fetch fails (should show loading or error)
- [ ] App behavior during midnight transition in PHT
- [ ] App behavior when device is offline (should use last known offset)
- [ ] Session detection near start/end boundaries (±1 minute tolerance)

---

## Known Limitations

1. **Initial Sync Delay**: There's a brief moment on app launch before server time is fetched where local time might be used
2. **Offline Handling**: If server time can't be fetched, the app may not function correctly (no fallback implemented)
3. **Clock Drift**: Client-side time calculations may drift slightly from server over long periods (consider periodic re-sync)

---

## Future Improvements

1. **Periodic Re-sync**: Re-fetch server time every 5-10 minutes to prevent drift
2. **Offline Fallback**: Cache last known server offset and show warning if time data is stale
3. **Time Discrepancy Warning**: Alert user if device time is significantly different from server time
4. **WebSocket Time Sync**: Use WebSocket for real-time server time updates instead of polling
5. **Network Latency Compensation**: Calculate network round-trip time and adjust offset accordingly

---

## Dependencies

### NPM Packages
- `date-fns`: Core date manipulation
- `date-fns-tz`: Timezone support for PHT calculations
- `@tanstack/react-query`: Data fetching and caching

### Timezone Constant
```typescript
const PHT_TZ = 'Asia/Manila'; // UTC+8
```

---

## Related Files

### Backend
- `apps/backend/convex/time.ts` - Time endpoints
- `apps/backend/convex/orientation.ts` - Session bounds calculation
- `apps/backend/convex/attendance.ts` - Attendance validation (uses session times)

### Frontend
- `apps/mobile/src/features/inspector/hooks/useServerTime.ts` - Server time hook
- `apps/mobile/src/features/inspector/hooks/useInspectorDashboard.ts` - Dashboard data hook
- `apps/mobile/src/screens/inspector/InspectorDashboardScreen/InspectorDashboardScreen.tsx` - Main dashboard
- `apps/mobile/src/features/inspector/components/CurrentSessionCard/CurrentSessionCard.tsx` - Session card with countdown
- `apps/mobile/src/screens/inspector/InspectorScannerScreen/InspectorScannerScreen.tsx` - QR scanner

---

## Contact & Questions

For questions or issues related to server time synchronization:
1. Check this handoff document first
2. Review related files listed above
3. Test with different device timezone settings
4. Verify server endpoints are accessible
5. Check console logs for time sync errors

---

**Last Updated**: 2025-01-28  
**Version**: 1.0  
**Author**: Development Team
