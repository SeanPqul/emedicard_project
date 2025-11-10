# Back Navigation Fix - Session Attendees Screen

## Problem

When viewing **Session Attendees** and pressing the back button:
1. ❌ Shows "Loading inspector dashboard..." unnecessarily
2. ❌ Always navigates to **Overview** instead of the screen you came from
3. ❌ Loses navigation context (doesn't remember if you came from Dashboard or Sessions list)

## Root Cause

The screen used `router.back()` which relies on navigation history. In Expo Router, this can be unpredictable when:
- Navigation stack is complex
- User navigated from different entry points
- App state was restored

## Solution

Implemented **explicit navigation with `returnTo` parameter**:

### How It Works

1. **When navigating TO attendees screen**, pass a `returnTo` param:
   ```typescript
   // From Dashboard
   router.push({
     pathname: '/(screens)/(inspector)/attendees',
     params: {
       date: '...',
       scheduledTime: '...',
       venue: '...',
       returnTo: 'dashboard', // 👈 NEW
     },
   });
   
   // From Sessions List
   router.push({
     pathname: '/(screens)/(inspector)/attendees',
     params: {
       date: '...',
       scheduledTime: '...',
       venue: '...',
       returnTo: 'sessions', // 👈 NEW
     },
   });
   ```

2. **Back button navigation** reads the param and navigates correctly:
   ```typescript
   onPress={() => {
     if (params.returnTo === 'sessions') {
       router.push('/(inspector-tabs)/sessions');
     } else {
       router.push('/(inspector-tabs)/dashboard');
     }
   }}
   ```

## Benefits

✅ **No Loading**: Directly navigates to the correct tab screen (no re-loading)
✅ **Correct Destination**: Always returns to where you came from
✅ **Predictable**: Explicit navigation instead of relying on history stack
✅ **Fast**: Instant navigation with no delays

## Navigation Flow

### From Dashboard → Attendees → Back
```
Dashboard (Overview Tab)
    ↓ Click "View Attendees" (returnTo: 'dashboard')
Session Attendees
    ↓ Click Back Button
Dashboard (Overview Tab) ✅ Correct!
```

### From Sessions List → Attendees → Back
```
Sessions List (Sessions Tab)
    ↓ Click Session Card (returnTo: 'sessions')
Session Attendees
    ↓ Click Back Button
Sessions List (Sessions Tab) ✅ Correct!
```

## Files Modified

1. ✅ `src/features/inspector/components/SessionCard/SessionCard.tsx`
   - Added `returnTo: 'sessions'` param

2. ✅ `src/features/inspector/components/CurrentSessionCard/CurrentSessionCard.tsx`
   - Added `returnTo: 'dashboard'` param

3. ✅ `src/screens/inspector/SessionAttendeesScreen/SessionAttendeesScreen.tsx`
   - Added `returnTo` to params type
   - Replaced `router.back()` with explicit navigation based on `returnTo`

## Testing Checklist

### ✅ Test Case 1: From Dashboard
1. Navigate to **Inspector Dashboard** (Overview tab)
2. Click **"View Attendees"** on current session card
3. View attendees screen loads
4. Click **Back button**
5. **Expected**: Returns to Dashboard (Overview tab) ✅
6. **Expected**: No loading spinner ✅

### ✅ Test Case 2: From Sessions List
1. Navigate to **Orientation Sessions** tab
2. Click on any **session card**
3. View attendees screen loads
4. Click **Back button**
5. **Expected**: Returns to Sessions List ✅
6. **Expected**: No loading spinner ✅

### ✅ Test Case 3: Direct Link (no returnTo)
1. If someone opens attendees without returnTo param
2. Click **Back button**
3. **Expected**: Returns to Dashboard (default fallback) ✅

## Alternative Approaches Considered

### ❌ Using `router.back()`
- **Problem**: Unreliable with complex navigation stacks
- **Problem**: Can't control destination
- **Problem**: May trigger unnecessary re-renders

### ❌ Using Navigation History API
- **Problem**: Not available in Expo Router file-based routing
- **Problem**: More complex to implement

### ✅ Using `returnTo` Parameter (CHOSEN)
- **Advantage**: Simple and explicit
- **Advantage**: No dependency on navigation stack
- **Advantage**: Easy to debug
- **Advantage**: Predictable behavior

## Future Enhancements

If more entry points are added (e.g., from notifications, deep links):

```typescript
params: {
  returnTo: 'dashboard' | 'sessions' | 'notifications' | 'scanner'
}

// Back button handler
switch (params.returnTo) {
  case 'sessions':
    router.push('/(inspector-tabs)/sessions');
    break;
  case 'scanner':
    router.push('/(inspector-tabs)/scanner');
    break;
  case 'notifications':
    router.push('/(screens)/notifications');
    break;
  default:
    router.push('/(inspector-tabs)/dashboard');
}
```

## Notes

- This pattern can be applied to other screens with multiple entry points
- Always use `router.push()` instead of `router.back()` for predictable navigation
- Consider adding analytics to track where users are navigating from

---

**Fix Applied**: November 10, 2025 (PHT)
