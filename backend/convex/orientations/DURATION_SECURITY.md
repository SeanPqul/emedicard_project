# Orientation Duration Security - Dynamic Configuration

## Overview
The orientation attendance system now enforces **minimum duration requirements** to prevent fraudulent early check-outs. The duration is **dynamically configurable** by admins when creating orientation schedules.

## How It Works

### 🎯 Admin Configures Duration
When creating an orientation schedule, admins can set the `durationMinutes` field:

```typescript
{
  date: timestamp,
  time: "9:00 AM - 11:00 AM",
  venue: { ... },
  durationMinutes: 120, // 2 hours required
  // ... other fields
}
```

### 🔒 System Enforces Duration
When inspector scans for check-out, the system:
1. Gets the check-in time
2. Looks up the orientation schedule
3. Reads the `durationMinutes` from schedule
4. Calculates time elapsed
5. **Blocks check-out** if minimum time not met

## Configuration

### In Database Schema
**File:** `backend/convex/schema.ts`

```typescript
orientationSchedules: defineTable({
  // ... other fields
  durationMinutes: v.optional(v.float64()), // NEW FIELD
  // ... other fields
})
```

### Default Duration
**File:** `backend/convex/orientations/attendance.ts`

```typescript
const DEFAULT_MINIMUM_DURATION_MINUTES = 20; // Used if not specified
```

## Admin Usage

### Creating a Schedule with Duration

#### Web Admin Example:
```typescript
await createOrientationSchedule({
  date: Date.now(),
  time: "9:00 AM - 12:00 PM",
  venue: {
    name: "City Hall Training Room",
    address: "123 Main St",
    capacity: 50
  },
  totalSlots: 50,
  durationMinutes: 180, // 3-hour orientation
  instructor: {
    name: "Dr. Smith",
    designation: "Food Safety Specialist"
  }
});
```

#### Different Durations for Different Sessions:
```typescript
// Morning session - Full orientation (2 hours)
{
  time: "9:00 AM - 11:00 AM",
  durationMinutes: 120
}

// Afternoon refresher course (1 hour)
{
  time: "2:00 PM - 3:00 PM",
  durationMinutes: 60
}

// Weekend intensive (4 hours)
{
  time: "9:00 AM - 1:00 PM",
  durationMinutes: 240
}
```

## Validation Flow

### Check-Out Process

```typescript
export const checkOut = mutation({
  handler: async (ctx, args) => {
    // 1. Verify inspector role ✓
    // 2. Get orientation record ✓
    // 3. Check if already checked out ✓
    // 4. Check if checked in first ✓
    
    // 5. 🆕 GET SCHEDULE TO CHECK DURATION
    const schedule = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date", (q) => q.eq("date", orientation.orientationDate))
      .filter((q) => q.eq(q.field("time"), orientation.timeSlot))
      .first();
    
    const requiredMinutes = schedule?.durationMinutes || DEFAULT_MINIMUM_DURATION_MINUTES;
    const requiredMs = requiredMinutes * 60 * 1000;
    
    // 6. 🆕 VALIDATE TIME ELAPSED
    const timeElapsed = Date.now() - orientation.checkInTime;
    
    if (timeElapsed < requiredMs) {
      const elapsed = Math.floor(timeElapsed / 60000);
      const remaining = Math.ceil((requiredMs - timeElapsed) / 60000);
      
      throw new Error(
        `Cannot check out yet. This orientation requires ${requiredMinutes} minutes. ` +
        `Time elapsed: ${elapsed} minutes. Please wait ${remaining} more minutes.`
      );
    }
    
    // 7. Proceed with check-out ✓
  }
});
```

## User Experience

### Scenario 1: Normal Check-Out (After Required Time) ✅
```
Inspector: *scans QR after 2 hours and 5 minutes*
System: ✅ "Check-Out Successful! Orientation completed."
```

### Scenario 2: Early Check-Out Attempt (Blocked) 🚫
```
Inspector: *scans QR after only 45 minutes*
System: ❌ "Cannot check out yet. This orientation requires 120 minutes. 
           Time elapsed: 45 minutes. Please wait 75 more minutes."
```

### Scenario 3: Using Default Duration
```
Schedule has no durationMinutes set → System uses 20-minute default
Inspector: *scans QR after 25 minutes*
System: ✅ "Check-Out Successful!"
```

## Benefits

### 🛡️ Security
- Prevents fraud: Can't fake attendance by checking in/out immediately
- Audit trail: All timestamps preserved
- Flexible enforcement: Different durations for different orientation types

### 👨‍💼 For Admins
- **Full control**: Set duration per schedule
- **Flexibility**: Different durations for different sessions
- **Easy to adjust**: Change duration as needed
- **No code changes**: All configuration in database

### 👮 For Inspectors
- **Clear feedback**: Shows exactly how long to wait
- **Real-time validation**: Immediate error message
- **No manual tracking**: System handles timing automatically

### 👥 For Applicants
- **Fair enforcement**: Everyone follows same rules
- **Prevents confusion**: Can't leave early accidentally
- **Quality assurance**: Ensures proper orientation completion

## Configuration Examples

### Common Duration Settings

```typescript
// Standard food safety orientation
durationMinutes: 120  // 2 hours

// Refresher course
durationMinutes: 60   // 1 hour

// Extended training
durationMinutes: 240  // 4 hours

// Short briefing
durationMinutes: 30   // 30 minutes

// Testing/development
durationMinutes: 5    // 5 minutes (for testing only!)
```

## Migration Plan

### For Existing Schedules (No Duration Set)
- System uses **DEFAULT_MINIMUM_DURATION_MINUTES (20 minutes)**
- Backward compatible - no breaking changes
- Admins can update existing schedules to add duration

### Updating Existing Schedules
```typescript
// Update mutation to add duration to old schedules
await updateOrientationSchedule({
  scheduleId: "existing_id",
  durationMinutes: 120  // Add duration to existing schedule
});
```

## Testing

### Test Cases

1. **Test with 20-minute default:**
   - Create schedule without durationMinutes
   - Check in
   - Wait 20+ minutes
   - Check out → Should succeed

2. **Test with custom 60 minutes:**
   - Create schedule with durationMinutes: 60
   - Check in
   - Try check out after 30 minutes → Should fail
   - Wait 60+ minutes
   - Check out → Should succeed

3. **Test error messages:**
   - Verify clear, helpful error messages
   - Check remaining time calculation
   - Ensure elapsed time is accurate

4. **Test edge cases:**
   - Check out at exactly required time
   - Check out 1 second before required time
   - Multiple attempts to check out early

## API Documentation

### Creating Schedule with Duration
```typescript
POST /api/orientationSchedules/create

{
  "date": 1699228800000,
  "time": "9:00 AM - 11:00 AM",
  "venue": {
    "name": "City Hall",
    "address": "123 Main St",
    "capacity": 50
  },
  "totalSlots": 50,
  "durationMinutes": 120,  // ← NEW FIELD
  "instructor": {
    "name": "Dr. Smith",
    "designation": "Food Safety Specialist"
  }
}
```

### Check-Out Error Response
```typescript
{
  "success": false,
  "error": "Cannot check out yet. This orientation requires 120 minutes. Time elapsed: 45 minutes. Please wait 75 more minutes."
}
```

## Future Enhancements

Potential improvements:

1. **Grace Period:**
   - Allow check-out 5-10 minutes early
   - Configurable grace period per schedule

2. **Break Time Handling:**
   - Pause timer during scheduled breaks
   - Track active attendance time vs. total time

3. **Admin Override:**
   - Allow admins to manually check out early (with reason)
   - Log all manual overrides

4. **Analytics:**
   - Track average attendance duration
   - Identify patterns of early check-out attempts
   - Generate compliance reports

## Summary

✅ **Dynamic Configuration**: Admins set duration per schedule  
✅ **Backward Compatible**: Uses 20-minute default if not specified  
✅ **Strong Validation**: Prevents premature check-outs  
✅ **Clear Feedback**: Shows exact time remaining  
✅ **Audit Trail**: All timestamps preserved  
✅ **Flexible**: Different durations for different orientations  

The system now provides **flexible, admin-controlled enforcement** of orientation attendance requirements while maintaining strong security against fraud.

---

**Implementation Date:** January 2025  
**Status:** ✅ Fully Implemented  
**Default Duration:** 20 minutes  
**Configurable:** Yes, per schedule
