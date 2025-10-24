# Orientation & Attendance Flow Changes

## Overview
Refactored the orientation scheduling and attendance validation system for Yellow Card (Food Handler) applicants with clear status flow and track attendance feature for Yellow Card Admin.

---

## Status Flow

### Application Status Values (Updated)
```typescript
applicationStatus: v.union(
  v.literal("Submitted"),
  v.literal("For Orientation"),           // NEW: Yellow Card applicants after payment
  v.literal("For Document Verification"), // NEW: Non-Yellow Card after payment
  v.literal("Payment Validation"),
  v.literal("Scheduled"),                 // NEW: After booking orientation
  v.literal("Attendance Validation"),     // NEW: After completing orientation
  v.literal("Under Review"),
  v.literal("Approved"),
  v.literal("Rejected"),
  v.literal("Expired")
)
```

### Orientation Status Values (Updated)
```typescript
orientationStatus: v.union(
  v.literal("Scheduled"),
  v.literal("Completed"),
  v.literal("Missed"),
  v.literal("Excused")  // NEW: For applicants with valid reasons (emergency, etc.)
)
```

---

## Complete Status Flow

### For Yellow Card Applicants (Food Handler)
```
1. Submitted
   ↓ (Payment Sent & Complete)
2. For Orientation
   ↓ (Orientation Booked)
3. Scheduled
   ↓ (Inspector Check-in + Check-out completed)
4. Attendance Validation
   ↓ (Yellow Admin validates attendance)
5. Approved (Ready for Health Card)
```

### For Non-Yellow Card Applicants
```
1. Submitted
   ↓ (Payment Sent & Complete)
2. For Document Verification
   ↓ (Documents reviewed and approved)
3. Approved (Ready for Health Card)
```

---

## Key Changes

### 1. Schema Updates (`backend/convex/schema.ts`)
- **Added new applicationStatus values**: `For Orientation`, `For Document Verification`, `Scheduled`, `Attendance Validation`
- **Added new orientationStatus value**: `Excused`
- **Added new field**: `inspectorNotes: v.optional(v.string())` in orientations table
- **Enforced type safety**: Changed applicationStatus from `v.string()` to strict union type

### 2. Payment Success Flow (`backend/convex/payments/maya/statusUpdates.ts`)
- After payment success, checks if job category requires orientation (Yellow Card)
- **Yellow Card** → Status: `For Orientation`
- **Non-Yellow Card** → Status: `For Document Verification`

### 3. Orientation Booking (`backend/convex/orientationSchedules/bookOrientationSlot.ts`)
- When Yellow Card applicant books orientation:
  - Updates applicationStatus to `Scheduled`
  - Sends notification with schedule details

### 4. Inspector Check-out (`backend/convex/orientations/attendance.ts`)
- When inspector completes check-in + check-out:
  - Updates orientationStatus to `Completed`
  - Updates applicationStatus to `Attendance Validation`
  - Notifies applicant that attendance is being validated

### 5. Track Attendance Feature (Enhanced)
**Query: `getOrientationSchedulesForDate`**
- Shows all schedules for a selected date
- Displays attendees with:
  - Full name
  - **Gender** (NEW)
  - Job category (color-coded)
  - Orientation status
  - Check-in/out times
  - **Inspector notes** (NEW)
- Only shows Yellow Card applicants (requireOrientation = true)

**New Mutation: `updateInspectorNotes`**
- Allows inspectors to add notes to orientation records
- Can mark applicants as "Excused" with reason
- Logs all inspector actions

### 6. Bulk Attendance Validation (`finalizeSessionAttendance`)
**For Completed Orientations:**
- Updates applicationStatus to `Approved`
- Notifies: "Your application is now approved and your health card will be issued soon."

**For Missed/Not Completed:**
- Updates orientationStatus to `Missed`
- Updates applicationStatus back to `For Orientation` (must rebook)
- Notifies: "You did not complete the orientation. Please schedule a new session."

**For Excused:**
- Keeps current status for manual handling
- Inspector notes explain the reason

**Returns:**
```typescript
{
  success: true,
  completedCount: number,
  missedCount: number,
  excusedCount: number,
  message: string
}
```

---

## API Endpoints

### Queries
- `getOrientationSchedulesForDate(selectedDate)` - Get all schedules with attendance for Track Attendance
- `getAttendanceStatus(applicationId)` - Get orientation attendance status for an application
- `getAttendeesForSession(orientationDate, timeSlot, orientationVenue)` - Get attendees for specific session

### Mutations
- `checkIn(applicationId)` - Inspector checks in applicant (QR scan)
- `checkOut(applicationId)` - Inspector checks out applicant (QR scan)
- `updateInspectorNotes(orientationId, notes, status?)` - Add notes/mark as excused
- `finalizeSessionAttendance(scheduleId, selectedDate, timeSlot, venue)` - Bulk validate attendance (Yellow Admin)

---

## Track Attendance UI Flow

1. **Yellow Card Admin** selects a date
2. System shows all orientation schedules for that date
3. For each schedule, displays table with:
   - Applicant full name
   - Gender
   - Orientation status (Completed, Scheduled, Missed, Excused)
   - Check-in time
   - Check-out time
   - Inspector notes (if any)
4. Inspector can add notes or mark as "Excused" if needed
5. Admin clicks **"Validate Attendance"** button
6. System processes all applicants:
   - **Completed** → Status: `Approved`
   - **Missed** → Status: `For Orientation` (rejected, must rebook)
   - **Excused** → No change (manual handling)

---

## Business Rules

### Yellow Card Requirement
- Only job categories with `requireOrientation: true` or `requireOrientation: "true"` require orientation
- These are Food Handler positions (Yellow Card)

### Attendance Validation
- Must have both check-in AND check-out to be marked "Completed"
- Missing either = "Missed" status
- Excused status prevents automatic rejection

### Status Transitions
- Applications can only move forward (except for missed orientations)
- Missed orientations send applicant back to "For Orientation"
- Once "Approved", ready for health card issuance

---

## Testing Checklist

- [ ] Yellow Card applicant: Payment → For Orientation → Book → Scheduled → Check-in/out → Attendance Validation → Approved
- [ ] Non-Yellow Card: Payment → For Document Verification → Approved
- [ ] Missed orientation: Check if status reverts to "For Orientation"
- [ ] Excused status: Verify it's not auto-processed during validation
- [ ] Inspector notes: Add/update notes and verify in Track Attendance
- [ ] Bulk validation: Test with multiple applicants (some completed, some missed, some excused)
- [ ] Notifications: Verify all status change notifications are sent

---

## Notes for Frontend Development

### Track Attendance Table Columns
```typescript
{
  fullname: string,
  gender: "Male" | "Female" | "Other" | "N/A",
  jobCategory: string,
  jobCategoryColor: string,
  applicationStatus: string,
  orientationStatus: "Scheduled" | "Completed" | "Missed" | "Excused",
  checkInTime?: number,
  checkOutTime?: number,
  inspectorNotes?: string,
  orientationId: Id<"orientations">,
  applicationId: Id<"applications">
}
```

### Status Badge Colors (Suggested)
- **Completed**: Green
- **Scheduled**: Blue
- **Missed**: Red
- **Excused**: Yellow/Orange
- **Attendance Validation**: Purple

---

## Migration Notes

⚠️ **IMPORTANT**: The schema changes are backward compatible, but you may need to:
1. Update existing applications with old status strings to new union values
2. Run data migration to ensure all orientations have proper status values
3. Clear any cached application status values on the frontend

---

## Author
Updated: 2025-10-24
Version: 2.0
