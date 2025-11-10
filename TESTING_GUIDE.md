# 🧪 Quick Testing Guide - Attendance Tracker

## 🚀 Fast Start

### 1. Start the Backend
```bash
cd backend
npx convex dev
```

### 2. Start the Frontend
```bash
cd apps/webadmin
npm run dev
```

### 3. Open Convex Dashboard
Visit: https://dashboard.convex.dev

---

## 📝 Test Functions Available

### Get a Test Schedule
**Function:** `_orientationSchedules:getTestSchedule`  
**Purpose:** Finds a past, unfinalized session to test with

**How to Run:**
1. Go to Convex Dashboard > Functions
2. Search for `getTestSchedule`
3. Click "Run" (no arguments needed)
4. Note the `scheduleId` returned

**Expected Output:**
```json
{
  "found": true,
  "schedule": {
    "_id": "j17abc123xyz",
    "date": 1731225600000,
    "time": "9:00 AM - 11:00 AM",
    "venue": { "name": "Main Hall" },
    "isFinalized": false
  },
  "bookings": [...]
}
```

---

### Test Finalization
**Function:** `_orientationSchedules:testFinalizeSession`  
**Purpose:** Simulates finalizing a session

**How to Run:**
1. Get a scheduleId from `getTestSchedule`
2. Run `testFinalizeSession` with args:
```json
{
  "scheduleId": "j17abc123xyz"
}
```

**Expected Output:**
```json
{
  "success": true,
  "message": "✅ Finalization test completed successfully!",
  "results": {
    "totalBookings": 25,
    "completed": 20,
    "wouldBeMissed": 5,
    "excused": 0
  }
}
```

---

### Check All Schedules Status
**Function:** `_orientationSchedules:getAllFinalizationStatus`  
**Purpose:** See which schedules are finalized

**How to Run:**
1. Run function (no arguments)
2. Review the stats and schedule list

**Expected Output:**
```json
{
  "stats": {
    "total": 10,
    "finalized": 3,
    "notFinalized": 7
  },
  "schedules": [...]
}
```

---

### Reset Finalization (For Re-testing)
**Function:** `_orientationSchedules:resetFinalization`  
**Purpose:** Undo finalization to test again

**How to Run:**
```json
{
  "scheduleId": "j17abc123xyz"
}
```

**Expected Output:**
```json
{
  "success": true,
  "message": "✅ Schedule reset to unfinalized state"
}
```

---

## 🎯 UI Testing Checklist

### Test 1: Confirmation Modal
- [ ] Navigate to Attendance Tracker
- [ ] Find a past session (blue "Completed" badge)
- [ ] Click "Finalize Session" button
- [ ] **Verify:** Modal appears with:
  - Warning icon (orange)
  - "This action cannot be undone!" message
  - List of 4 consequences
  - Session details (date, time, venue, attendees)
  - Cancel and Confirm buttons

### Test 2: Finalization Flow
- [ ] Click "Yes, Finalize Session" in modal
- [ ] **Verify:** Success modal shows:
  - Green checkmark icon
  - "Session Validated Successfully!" title
  - Breakdown of Completed/Missed/Excused counts
  - Continue button

### Test 3: Locked State
- [ ] Find a finalized session
- [ ] **Verify:** Session shows:
  - Gray "Finalized" badge in header
  - Gray gradient on card header
  - "Locked" badges instead of "Edit Status" buttons
  - No "Finalize Session" button
  - Footer message: "Session Finalized: ..."

### Test 4: Active Session
- [ ] Find an active session (or create one for current time)
- [ ] **Verify:** Session shows:
  - Green "Active Now" badge (animated pulse)
  - Emerald gradient on header
  - No "Finalize Session" button
  - Footer shows QR tracking message

### Test 5: Cancel Finalization
- [ ] Click "Finalize Session" button
- [ ] Modal appears
- [ ] Click "Cancel"
- [ ] **Verify:** Modal closes, session remains editable

---

## 🐛 Common Issues

### Issue: "No past unfinalized sessions found"
**Solution:** 
1. Create a past orientation schedule first
2. Or adjust the date on an existing schedule to the past

### Issue: Backend not compiling
**Solution:**
```bash
cd backend
npm install
npx convex dev
```

### Issue: Modal not appearing
**Solution:**
- Check browser console for errors
- Verify React state updates in dev tools
- Check if `confirmModal.show` is being set to true

### Issue: Session not showing as finalized after test
**Solution:**
- Refresh the page
- Check Convex dashboard logs
- Verify `isFinalized` field was updated in database

---

## 📸 Visual Reference

### States to Look For:

**1. Active Session (Green)**
```
┌───────────────────────────────┐
│ 🟢 Active Now (pulsing)       │
│ [Emerald gradient header]     │
│ ...                           │
└───────────────────────────────┘
```

**2. Past Session (Blue)**
```
┌───────────────────────────────┐
│ 🔵 Completed                  │
│ [Blue gradient header]        │
│ [Finalize Session] button     │
└───────────────────────────────┘
```

**3. Finalized Session (Gray)**
```
┌───────────────────────────────┐
│ 🔒 Finalized                  │
│ [Gray gradient header]        │
│ [Locked] badges               │
└───────────────────────────────┘
```

---

## ⚡ Quick Commands

```bash
# Start everything
cd backend && npx convex dev &
cd apps/webadmin && npm run dev

# Check Convex schema
cd backend && npx convex dev --once

# Reset database (careful!)
cd backend && npx convex import --replace

# View logs
cd backend && npx convex logs
```

---

## ✅ Success Criteria

Your implementation is working if:

1. ✅ Confirmation modal appears before finalization
2. ✅ Session becomes locked after finalization
3. ✅ Status badges display correct colors
4. ✅ Edit buttons become "Locked" badges
5. ✅ Success modal shows correct counts
6. ✅ Backend logs show finalization activity
7. ✅ No console errors in browser

---

## 📞 Need Help?

1. Check `ATTENDANCE_TRACKER_REDESIGN.md` for full documentation
2. Review console logs in browser dev tools
3. Check Convex dashboard for backend errors
4. Verify all files saved properly

---

**Ready to test!** 🚀
