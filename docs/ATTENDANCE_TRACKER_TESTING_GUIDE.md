# Attendance Tracker Testing Guide

**Last Updated**: January 29, 2025  
**Feature**: Webadmin Attendance Tracker for Food Safety Orientation  
**Developer**: Your Team

---

## 📋 Overview

This guide provides comprehensive test scenarios for the **Attendance Tracker** feature in the webadmin dashboard. The feature tracks attendance for food safety orientation sessions and manages applicant status based on check-in/check-out behavior.

---

## 🎯 Core Business Logic

### Attendance Status Rules

The system determines attendance status based on the following rules:

1. **FINISHED (Completed)**
   - ✅ Both `checkInTime` AND `checkOutTime` are filled
   - ✅ `orientationStatus` = "Completed"
   - → Applicant fully attended the food orientation
   - → Inspector has validated attendance

2. **MISSED**
   - ❌ No `checkInTime` OR no `checkOutTime`
   - ❌ `orientationStatus` = "Scheduled" or "Missed"
   - → Applicant did not attend or did not complete
   - → Applicant remains visible in the list (required by business)

3. **EXCUSED**
   - ⚠️ Has `inspectorNotes` with excuse reason
   - ⚠️ `orientationStatus` = "Excused"
   - → Applicant attended but has valid excuse
   - → Requires manual admin handling

### Timezone Security

- ✅ All timestamps use **server-side Date.now()** (not client time)
- ✅ Prevents time manipulation/cheating
- ✅ Uses **Philippine Time (UTC+8)** for display
- ✅ Minimum duration enforcement (default 20 minutes before check-out allowed)
- ✅ Check-in only allowed on scheduled date (PHT)

---

## 🧪 Automated Testing

### Running Jest Tests

```bash
cd apps/webadmin
npm test -- attendance-tracker
```

### Test Coverage

The automated test suite (`page.test.tsx`) covers:

- ✅ Attendance status logic (Finished, Missed, Excused)
- ✅ Session finalization workflow
- ✅ Manual status updates
- ✅ Search and filtering
- ✅ Date selection
- ✅ UI display and badges
- ✅ Timezone security concepts

---

## 🔍 Manual Test Scenarios

### Test Scenario 1: View Attendance Tracker

**Prerequisites**: Admin/Inspector logged in, sessions scheduled for today

**Steps**:
1. Navigate to Dashboard → "Attendance Tracker"
2. Verify page displays with header "Attendance Tracker"
3. Check date picker defaults to today's date
4. Verify time slot filter shows "All Time Slots"

**Expected Results**:
- ✅ Page loads without errors
- ✅ Date picker shows current date
- ✅ Sessions for selected date are displayed (if any)
- ✅ No sessions message appears if no data

---

### Test Scenario 2: Validate FINISHED Status

**Prerequisites**: Session with applicants who have both check-in and check-out

**Test Data**:
```javascript
{
  fullname: "Maria Santos",
  checkInTime: 1730188800000,  // Oct 29, 2025 9:05 AM PHT
  checkOutTime: 1730196000000, // Oct 29, 2025 11:05 AM PHT
  orientationStatus: "Completed"
}
```

**Steps**:
1. Navigate to attendance tracker
2. Select date with completed session
3. Locate "Maria Santos" in the attendee list
4. Check her status badge

**Expected Results**:
- ✅ Status badge shows "Completed" (green)
- ✅ Attendance column shows "✓ Attended (In: 9:05 AM, Out: 11:05 AM)"
- ✅ Check-in and check-out times are displayed

---

### Test Scenario 3: Validate MISSED Status

**Prerequisites**: Session with applicants who did not attend

**Test Data**:
```javascript
{
  fullname: "Jose Rizal",
  checkInTime: undefined,
  checkOutTime: undefined,
  orientationStatus: "Scheduled"
}
```

**Steps**:
1. Navigate to attendance tracker
2. Select session date
3. Locate "Jose Rizal" in the attendee list
4. Verify he is still visible (not hidden)

**Expected Results**:
- ✅ "Jose Rizal" appears in the list
- ✅ Status badge shows "Scheduled" (blue)
- ✅ Attendance column shows "⊘ Not Checked In"
- ✅ Applicant is NOT removed from view (business requirement)

---

### Test Scenario 4: Validate EXCUSED Status

**Prerequisites**: Session with applicant marked as excused

**Test Data**:
```javascript
{
  fullname: "Ana Reyes",
  checkInTime: 1730188800000,
  checkOutTime: undefined,
  orientationStatus: "Excused",
  inspectorNotes: "Medical emergency - doctor's note provided"
}
```

**Steps**:
1. Navigate to attendance tracker
2. Locate "Ana Reyes" in attendee list
3. Check status badge and notes

**Expected Results**:
- ✅ Status badge shows "Excused" (yellow)
- ✅ Inspector notes visible: "Note: Medical emergency - doctor's note provided"
- ✅ Distinguishable from "Missed" status

---

### Test Scenario 5: Partially Attended (Checked In Only)

**Prerequisites**: Applicant checked in but never checked out

**Test Data**:
```javascript
{
  fullname: "Pedro Cruz",
  checkInTime: 1730188800000,
  checkOutTime: undefined,
  orientationStatus: "Scheduled"
}
```

**Steps**:
1. Navigate to attendance tracker
2. Locate "Pedro Cruz"
3. Review attendance status

**Expected Results**:
- ✅ Status badge shows "Scheduled" (not "Completed")
- ✅ Attendance shows "⏳ Checked In (9:05 AM)"
- ✅ System recognizes incomplete attendance (missing check-out)

---

### Test Scenario 6: Session Finalization

**Prerequisites**: Session past end time with mixed attendance statuses

**Steps**:
1. Navigate to attendance tracker
2. Select past session date
3. Review attendee list (mix of Completed, Missed, Excused)
4. Click "Finalize Session" button
5. Confirm finalization

**Expected Results**:
- ✅ Success alert shows: "✅ Session finalized. 2 approved, 2 missed, 1 excused."
- ✅ Completed applicants → `applicationStatus: "Approved"`
- ✅ Missed applicants → `applicationStatus: "For Orientation"` (can rebook)
- ✅ Excused applicants → keep current status (manual handling)
- ✅ Notifications sent to applicants

**Backend Verification** (Convex Dashboard):
```javascript
// Query orientations table
ctx.db.query("orientations")
  .withIndex("by_date_timeslot_venue", q => 
    q.eq("orientationDate", selectedDate)
  )
  .collect()

// Check applications table for updated statuses
```

---

### Test Scenario 7: Manual Status Update

**Prerequisites**: Admin wants to manually change attendance status

**Steps**:
1. Navigate to attendance tracker
2. Select session and locate applicant
3. Click "Edit Status" button
4. Select "Excused" from dropdown
5. Enter notes: "Family emergency, will reschedule"
6. Click "Update Status"

**Expected Results**:
- ✅ Modal opens with status dropdown and notes field
- ✅ Status updates successfully
- ✅ Success message: "✅ Orientation status updated to Excused"
- ✅ Inspector notes saved in database
- ✅ Badge updates to "Excused" (yellow)

---

### Test Scenario 8: Search Attendees

**Prerequisites**: Session with multiple attendees

**Steps**:
1. Navigate to attendance tracker
2. In search box, type "Maria"
3. Observe filtered results

**Expected Results**:
- ✅ Only "Maria Santos" visible
- ✅ Other attendees filtered out
- ✅ Search is case-insensitive
- ✅ Clearing search shows all attendees

---

### Test Scenario 9: Filter by Time Slot

**Prerequisites**: Multiple sessions on same date at different times

**Steps**:
1. Navigate to attendance tracker
2. Select date with multiple sessions
3. Verify "All Time Slots" shows all sessions
4. Select "9:00 AM - 11:00 AM" from dropdown
5. Observe filtered sessions

**Expected Results**:
- ✅ Only morning session (9:00 AM - 11:00 AM) displayed
- ✅ Afternoon sessions hidden
- ✅ Selecting "All Time Slots" shows all again

---

### Test Scenario 10: Date Selection

**Prerequisites**: Sessions on multiple dates

**Steps**:
1. Navigate to attendance tracker
2. Default date is today
3. Change date picker to past date (e.g., Oct 28, 2025)
4. Observe sessions update

**Expected Results**:
- ✅ Query executes for selected date (PHT midnight)
- ✅ Sessions for Oct 28 displayed
- ✅ No sessions message if date has no data
- ✅ Time slot filter resets to "All Time Slots"

---

## 🔒 Timezone Security Tests

### Test Scenario 11: Server Time Validation

**Objective**: Verify server-side timestamps prevent client time manipulation

**Steps**:
1. Open browser DevTools → Console
2. Attempt to change client time: `Date.now = () => 9999999999999`
3. Navigate to attendance tracker
4. Try to check in an applicant

**Expected Results**:
- ✅ Backend uses server `Date.now()` regardless of client manipulation
- ✅ Check-in timestamp is server time, not client time
- ✅ No errors or security vulnerabilities

**Backend Code Reference** (`attendance.ts`):
```typescript
// Line 85: checkIn mutation
const checkInTime = Date.now(); // Server timestamp only
await ctx.db.patch(orientation._id, {
  checkInTime,
  checkedInBy: currentUser._id,
});
```

---

### Test Scenario 12: Minimum Duration Enforcement

**Objective**: Verify 20-minute minimum duration before check-out

**Prerequisites**: Applicant checked in less than 20 minutes ago

**Steps**:
1. Check in applicant at 9:00 AM
2. Immediately try to check out at 9:05 AM (5 minutes later)
3. Observe error

**Expected Results**:
- ✅ Backend throws error:
  ```
  Cannot check out yet. This orientation requires 20 minutes. 
  Time elapsed: 5 minutes. Please wait 15 more minutes.
  ```
- ✅ Check-out blocked until 20 minutes elapsed
- ✅ Prevents fraudulent early check-outs

**Backend Code Reference** (`attendance.ts` lines 180-188):
```typescript
const timeElapsed = Date.now() - orientation.checkInTime;
if (timeElapsed < requiredDurationMs) {
  throw new Error(`Cannot check out yet...`);
}
```

---

### Test Scenario 13: Date Validation (PHT)

**Objective**: Verify check-in only allowed on scheduled date

**Prerequisites**: Orientation scheduled for Oct 29, 2025 (PHT)

**Steps**:
1. Set server date to Oct 28, 2025 (one day before)
2. Attempt to check in applicant
3. Observe error

**Expected Results**:
- ✅ Backend throws error:
  ```
  Cannot check in. This orientation is scheduled for 10/29/2025. 
  Please return on the scheduled date.
  ```
- ✅ Check-in blocked if not scheduled date (PHT)
- ✅ Uses server-side date comparison, not client date

**Backend Code Reference** (`attendance.ts` lines 67-81):
```typescript
if (orientation.orientationDate) {
  const orientationDate = new Date(orientation.orientationDate);
  const today = new Date();
  
  orientationDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (orientationDate.getTime() !== today.getTime()) {
    throw new Error("Cannot check in. Not scheduled date.");
  }
}
```

---

## 📊 Test Data Setup

### Creating Test Sessions (Convex Dashboard)

Use these mutations to create test data:

#### 1. Create Orientation Schedule
```javascript
// Convex Dashboard → orientationSchedules
ctx.db.insert("orientationSchedules", {
  date: new Date('2025-10-29').setHours(0, 0, 0, 0),
  time: "9:00 AM - 11:00 AM",
  startMinutes: 540,
  endMinutes: 660,
  durationMinutes: 120,
  venue: {
    name: "Gaisano Ilustre",
    address: "Davao City",
    capacity: 50
  },
  totalSlots: 50,
  availableSlots: 45,
  isAvailable: true,
  createdAt: Date.now()
});
```

#### 2. Create Test Applications & Orientations
```javascript
// Create 5 test applicants with different statuses
const testCases = [
  { name: "Maria Santos", status: "Completed", hasCheckIn: true, hasCheckOut: true },
  { name: "Jose Rizal", status: "Scheduled", hasCheckIn: false, hasCheckOut: false },
  { name: "Ana Reyes", status: "Excused", hasCheckIn: true, hasCheckOut: false, notes: "Medical" },
  { name: "Pedro Cruz", status: "Scheduled", hasCheckIn: true, hasCheckOut: false },
  { name: "Carmen Lopez", status: "Completed", hasCheckIn: true, hasCheckOut: true }
];

// Insert via backend mutations or Convex dashboard
```

---

## 🐛 Known Issues & Edge Cases

### Edge Case 1: Cross-Midnight Sessions
- **Scenario**: Session spans midnight (11:30 PM - 12:30 AM)
- **Expected**: Handled by `calculateSessionBounds()` in timezone utils
- **Status**: ✅ Supported

### Edge Case 2: DST Transitions
- **Scenario**: Device in DST timezone, server in PHT (no DST)
- **Expected**: Server time (PHT) always authoritative
- **Status**: ✅ No issues (Philippines doesn't observe DST)

### Edge Case 3: Concurrent Finalizations
- **Scenario**: Two admins finalize same session simultaneously
- **Expected**: Backend transactions prevent race conditions
- **Status**: ⚠️ Requires testing (Convex handles optimistic concurrency)

---

## 🚀 Performance Testing

### Load Test Scenarios

1. **Large Session (100+ attendees)**
   - Navigate to attendance tracker
   - Select session with 100 attendees
   - Measure page load time
   - **Target**: < 2 seconds

2. **Multiple Sessions Same Date**
   - 10 sessions on same date
   - Measure query performance
   - **Target**: < 3 seconds

3. **Search Performance**
   - 200 attendees in session
   - Type search query
   - Measure filter time
   - **Target**: < 500ms

---

## ✅ Test Checklist

Before deploying to production:

### Functional Tests
- [ ] FINISHED status displays correctly
- [ ] MISSED status displays correctly  
- [ ] EXCUSED status displays correctly
- [ ] Partial attendance (check-in only) handled
- [ ] Session finalization workflow works
- [ ] Manual status updates work
- [ ] Search functionality works
- [ ] Time slot filtering works
- [ ] Date selection works

### Security Tests
- [ ] Server time prevents client manipulation
- [ ] Minimum duration enforced (20 min)
- [ ] Check-in date validation (PHT)
- [ ] Admin role verification
- [ ] Inspector role verification

### UI/UX Tests
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Status badges color-coded correctly
- [ ] Loading states display
- [ ] Error messages user-friendly
- [ ] Success alerts clear

### Data Integrity Tests
- [ ] Application status updates correctly
- [ ] Notifications sent to applicants
- [ ] Admin activity logs recorded
- [ ] No data loss on errors

---

## 📝 Reporting Test Results

### Bug Report Template

```markdown
**Bug**: [Brief description]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]

**Actual Result**: [What actually happened]

**Screenshots**: [Attach if applicable]

**Environment**:
- Browser: Chrome 120.0
- OS: Windows 11
- User Role: Admin
- Date Tested: 2025-10-29

**Severity**: High / Medium / Low
```

---

## 🔗 Related Documentation

- **Schema**: `backend/convex/schema.ts` (lines 118-140 for orientations table)
- **Backend Logic**: `backend/convex/orientations/attendance.ts`
- **Frontend Component**: `apps/webadmin/src/app/dashboard/attendance-tracker/page.tsx`
- **Timezone Utils**: `backend/convex/lib/timezone.ts`
- **Timezone Fixes**: `apps/mobile/docs/HANDOFF_Timezone_Fixes.md`

---

## 🎓 Testing Tips

1. **Use Convex Dashboard** for quick data inspection
2. **Mock server time** using Convex action overrides (advanced)
3. **Test with real QR scans** using mobile inspector app
4. **Verify email notifications** are sent correctly
5. **Check admin activity logs** for audit trail

---

## 📧 Contact

For questions or issues:
- **Team Lead**: [Your Leader's Name]
- **QA Lead**: [QA Contact]
- **Documentation**: This file + inline comments in code

---

**Happy Testing!** 🚀
