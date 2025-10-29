# Inspector Conflict Management Feature

## Overview
This feature prevents double-booking of health inspectors when scheduling food health orientations. It provides real-time availability checking and conflict warnings.

## Features Implemented

### 1. **Backend Validation Functions**
Location: `backend/convex/admin/inspectorAvailability.ts`

Three new query functions:
- `checkInspectorAvailability` - Check if a specific inspector is available
- `getInspectorsWithAvailability` - Get all inspectors with their availability status
- `getInspectorDailySchedule` - View an inspector's full daily schedule

### 2. **Enhanced Scheduling Mutation**
Location: `backend/convex/admin/orientation.ts`

The `scheduleOrientation` mutation now:
- ✅ Validates inspector availability before saving
- ✅ Throws error if conflict detected
- ✅ Allows override with `allowConflict: true` flag
- ✅ Handles both new schedules and updates

### 3. **Smart UI with Conflict Detection**
Location: `apps/webadmin/src/app/dashboard/[id]/orientation-scheduler/page.tsx`

Features:
- 📅 Date and time slot selection
- 👨‍⚕️ Inspector dropdown with real-time availability
- ⚠️ Visual conflict warnings
- ☑️ Manual override option
- ✓ Shows "Available" or "Busy (X scheduled)" for each inspector

### 4. **Auto-Scheduler Support**
Location: `backend/convex/orientationSchedules/autoCreateSchedulesHandler.ts`

- Optional round-robin inspector assignment
- Configure via `autoAssignInspectors: true/false`
- Defaults to using instructor from config if disabled

---

## How to Use

### For Manual Scheduling (WebAdmin)

1. **Navigate to orientation scheduler**
   - Go to applicant's dashboard
   - Click "Schedule Orientation"

2. **Select date and time**
   - Choose orientation date
   - Select time slot from dropdown

3. **Choose inspector**
   - Dropdown shows all inspectors
   - ✓ Available inspectors marked with checkmark
   - ⚠️ Busy inspectors show conflict count

4. **Handle conflicts**
   - If conflict detected, yellow warning appears
   - Check "I understand and want to assign anyway" to override
   - Save button remains disabled until acknowledged

5. **Save**
   - Click "Save Schedule" or "Update Schedule"
   - Success/error message displays

### For Bulk Scheduling

The system automatically prevents conflicts when:
- Creating bulk orientation schedules
- Running auto-scheduler cron jobs

**No additional configuration needed!**

---

## Configuration

### Time Slots
Default time slots (can be customized):
```typescript
const timeSlots = [
  '9:00 AM - 11:00 AM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
];
```

### Auto-Scheduler Inspector Assignment
Edit `backend/convex/orientationSchedules/autoCreateSchedulesHandler.ts`:

```typescript
const DEFAULT_CONFIG = {
  // ... other config
  autoAssignInspectors: false, // Set to true to enable
};
```

---

## API Reference

### Check Inspector Availability
```typescript
const availability = useQuery(
  api.admin.inspectorAvailability.checkInspectorAvailability,
  {
    inspectorId: "j123...",
    orientationDate: 1234567890000,
    timeSlot: "9:00 AM - 11:00 AM",
    excludeApplicationId: "k123...", // Optional
  }
);

// Returns:
// {
//   isAvailable: boolean,
//   conflictCount: number,
//   conflicts: Array<{applicationId, timeSlot, venue}>
// }
```

### Get All Inspectors with Availability
```typescript
const inspectors = useQuery(
  api.admin.inspectorAvailability.getInspectorsWithAvailability,
  {
    orientationDate: 1234567890000,
    timeSlot: "9:00 AM - 11:00 AM",
    excludeApplicationId: "k123...", // Optional
  }
);

// Returns array of:
// {
//   _id: string,
//   fullname: string,
//   email: string,
//   isAvailable: boolean,
//   assignedCount: number,
//   conflicts: Array<{applicationId, venue}>
// }
```

### Schedule with Conflict Override
```typescript
await scheduleOrientation({
  applicationId: "k123...",
  orientationDate: 1234567890000,
  timeSlot: "9:00 AM - 11:00 AM",
  assignedInspectorId: "j123...",
  orientationVenue: "City Health Office",
  allowConflict: true, // Override conflicts
});
```

---

## Mobile App (Not Affected)

✅ **No changes to mobile code**
- Mobile apps continue working as before
- Inspectors can still check in/out attendees
- All existing mobile features remain unchanged

---

## Technical Notes

### Conflict Detection Logic
1. Query all orientations from database
2. Filter by same inspector + same date + same time slot
3. Exclude current application (for updates)
4. Return conflict count and details

### Performance Considerations
- Queries use indexed fields (`by_role`, `by_application`)
- Conflict checking happens on user action (not real-time)
- Minimal database queries (1-2 per check)

### Edge Cases Handled
- ✅ Updating existing orientation (excludes self)
- ✅ Multiple conflicts at same time
- ✅ No inspectors available
- ✅ Date/time changes (resets inspector selection)
- ✅ Manual conflict override

---

## Testing Checklist

- [ ] Schedule orientation with available inspector
- [ ] Try scheduling with busy inspector (should warn)
- [ ] Override conflict with checkbox
- [ ] Update existing schedule to new inspector
- [ ] Change date/time and verify inspector dropdown reloads
- [ ] Verify mobile app still works
- [ ] Test auto-scheduler (if enabled)

---

## Future Enhancements

Possible improvements:
1. **Inspector workload dashboard** - View all assignments per inspector
2. **Calendar view** - Visual schedule for all inspectors
3. **Notification system** - Alert inspectors of new assignments
4. **Availability rules** - Inspectors can set their own availability
5. **Smart suggestions** - AI-powered inspector recommendations

---

## Troubleshooting

### Inspector dropdown is empty
- Ensure inspectors exist in database with `role: "inspector"`
- Check date and time slot are selected first

### Conflict warning not showing
- Verify `allowConflict` is not set to `true` by default
- Check inspector is actually assigned to conflicting time

### Mobile app issues
- **This feature doesn't affect mobile** - check other causes

---

## Support

For questions or issues, contact the development team or refer to:
- Main documentation: `WARP.md`
- Inspector implementation: `apps/mobile/docs/INSPECTOR_IMPLEMENTATION_HANDOFF.md`
- Orientation flow: `ORIENTATION_FLOW_CHANGES.md`
