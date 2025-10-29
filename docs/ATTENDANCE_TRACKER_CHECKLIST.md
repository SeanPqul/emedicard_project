# Attendance Tracker Testing Checklist

**Print this out or keep it open while testing!**

---

## ✅ Pre-Testing Setup

- [ ] Installed dependencies: `npm install`
- [ ] Can navigate to webadmin dashboard
- [ ] Have admin/inspector account credentials
- [ ] Test database has sample orientation sessions
- [ ] Know how to access Convex Dashboard

---

## 🧪 Automated Testing

Run these commands in `apps/webadmin`:

- [ ] `npm test -- attendance-tracker` (All tests pass)
- [ ] `npm test -- attendance-tracker --coverage` (Check coverage %)
- [ ] Review test output for any failures

---

## 📋 Core Business Logic Tests

### FINISHED Status (Completed Orientation)

- [ ] Applicant has both check-in AND check-out times
- [ ] Status badge shows "Completed" (green)
- [ ] Attendance shows "✓ Attended (In: X, Out: Y)"
- [ ] Times are displayed correctly in PHT

### MISSED Status (No Attendance)

- [ ] Applicant has NO check-in or NO check-out
- [ ] Status badge shows "Scheduled" (blue) or "Missed" (red)
- [ ] Attendance shows "⊘ Not Checked In"
- [ ] **Applicant is STILL VISIBLE** in list (not hidden)

### EXCUSED Status (Has Valid Excuse)

- [ ] Applicant has `orientationStatus = "Excused"`
- [ ] Inspector notes field is filled with excuse reason
- [ ] Status badge shows "Excused" (yellow)
- [ ] Notes are visible under applicant name

---

## 🔐 Security Tests

### Server Time Validation

- [ ] Check-in uses server time, not client time
- [ ] Cannot manipulate timestamps from browser console
- [ ] All times displayed in Philippine Time (UTC+8)

### Minimum Duration Enforcement

- [ ] Cannot check out before 20 minutes elapsed
- [ ] Error message shows time remaining
- [ ] Backend enforces duration, not just frontend

### Date Validation

- [ ] Can only check in on scheduled date (PHT)
- [ ] Attempting check-in on wrong date shows error
- [ ] Date validation happens on server side

---

## 🎯 Feature Tests

### Session Finalization

- [ ] "Finalize Session" button appears after session ends
- [ ] Click finalize shows confirmation
- [ ] Success message shows correct counts (completed/missed/excused)
- [ ] Completed applicants → status changes to "Approved"
- [ ] Missed applicants → status changes to "For Orientation"
- [ ] Excused applicants → status stays same (manual handling)
- [ ] Notifications sent to applicants

### Manual Status Update

- [ ] "Edit Status" button on each attendee row
- [ ] Modal opens with status dropdown and notes field
- [ ] Can select "Completed", "Excused", or "Missed"
- [ ] Can add/edit inspector notes
- [ ] "Update Status" button saves changes
- [ ] Status badge updates immediately
- [ ] Success message appears

### Search Functionality

- [ ] Search box appears above attendee list
- [ ] Typing filters attendees by name
- [ ] Search is case-insensitive
- [ ] Clearing search shows all attendees again

### Time Slot Filtering

- [ ] "All Time Slots" option shows all sessions
- [ ] Selecting specific time slot filters sessions
- [ ] Only matching sessions displayed
- [ ] Filter dropdown shows available time slots

### Date Selection

- [ ] Date picker defaults to today
- [ ] Changing date loads that date's sessions
- [ ] "No sessions" message if date has no data
- [ ] Time slot filter resets to "All" on date change

---

## 🎨 UI/UX Tests

### Layout & Responsiveness

- [ ] Page title: "Attendance Tracker"
- [ ] "Back to Dashboard" button works
- [ ] Responsive on mobile (< 768px width)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (> 1024px)

### Status Badges

- [ ] **Completed** = Green with ✓ icon
- [ ] **Missed** = Red with X icon
- [ ] **Excused** = Yellow with clock icon
- [ ] **Scheduled** = Blue with clock icon

### Session Header

- [ ] Session title: "Food Safety Orientation"
- [ ] Time slot displayed (e.g., "9:00 AM - 11:00 AM")
- [ ] Venue name displayed (e.g., "Gaisano Ilustre")
- [ ] Instructor name displayed (if assigned)
- [ ] Attendee count: "X/Y Registered"

### Statistics Cards

- [ ] "Checked In" count correct
- [ ] "Completed" count correct
- [ ] "Pending" count correct (total - completed)
- [ ] Icons displayed correctly

### Attendee Table

- [ ] Headers: Name, Gender, Job Category, Status, Attendance, Actions
- [ ] Rows display all attendees
- [ ] Job category has colored badge
- [ ] Inspector notes shown (if present)
- [ ] "Edit Status" button on each row

---

## 📊 Data Integrity Tests

### Backend Verification (Convex Dashboard)

Check these after finalizing a session:

- [ ] `orientations` table: status updated correctly
- [ ] `applications` table: status changed to "Approved" or "For Orientation"
- [ ] `notifications` table: notifications sent to applicants
- [ ] `adminActivityLogs` table: finalization logged

### Test Data Scenarios

Create these test cases:

1. **All Completed** - 5 applicants, all check in + check out
   - [ ] All show "Completed" badge
   - [ ] Finalize → all become "Approved"

2. **All Missed** - 5 applicants, none check in
   - [ ] All show "Scheduled" badge
   - [ ] Finalize → all stay "For Orientation"

3. **Mixed Statuses** - 2 completed, 2 missed, 1 excused
   - [ ] Each shows correct badge
   - [ ] Finalize → correct counts in alert

4. **Partial Attendance** - Check in only, no check out
   - [ ] Shows "⏳ Checked In (time)"
   - [ ] Finalize → treated as "Missed"

---

## 🐛 Edge Cases

- [ ] Session with 0 attendees (shows "No attendees" message)
- [ ] Session with 100+ attendees (performance OK)
- [ ] Multiple sessions same date/time (all load correctly)
- [ ] Future date selected (shows sessions or empty state)
- [ ] Past date selected (finalize button appears)
- [ ] Today's date, ongoing session (no finalize button yet)

---

## ⚡ Performance Tests

- [ ] Page loads in < 3 seconds
- [ ] Search filters in < 500ms
- [ ] Date change loads in < 2 seconds
- [ ] Finalize completes in < 5 seconds
- [ ] No console errors or warnings

---

## 📝 Documentation Review

- [ ] Read `ATTENDANCE_TRACKER_TEST_SUMMARY.md`
- [ ] Read `ATTENDANCE_TRACKER_TESTING_GUIDE.md`
- [ ] Understand business logic flowchart
- [ ] Know where to find backend code
- [ ] Know how to report bugs

---

## 🚀 Production Readiness

- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] Security tests pass
- [ ] UI is polished and responsive
- [ ] No critical bugs found
- [ ] Documentation is clear
- [ ] Team lead approval obtained

---

## 📋 Bug Reporting

If you find issues, document:

1. **What happened** (actual result)
2. **What should happen** (expected result)
3. **Steps to reproduce**
4. **Screenshots** (if applicable)
5. **Browser/OS/Role**
6. **Severity**: Critical / High / Medium / Low

---

## ✅ Sign-Off

**Tester Name**: ________________  
**Date**: ________________  
**Result**: Pass ✅ / Fail ❌ / Needs Work ⚠️

**Notes**:
```
_______________________________________
_______________________________________
_______________________________________
```

---

**Good luck with testing!** 🎯

For help, see:
- Quick Start: `apps/webadmin/src/app/dashboard/attendance-tracker/__tests__/README.md`
- Full Guide: `docs/ATTENDANCE_TRACKER_TESTING_GUIDE.md`
