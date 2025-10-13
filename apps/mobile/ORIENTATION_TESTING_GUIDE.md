# Orientation Scheduling - Testing Guide

## 🚀 Quick Start Testing

### Step 1: Seed Test Data (One-time setup)

1. **Open Convex Dashboard:**
   - Go to: https://dashboard.convex.dev
   - Select your project
   - Click "Functions" in the sidebar

2. **Run Seed Function:**
   - Find: `orientationSchedules` → `seedOrientationSchedules`
   - Click "Run"
   - No arguments needed - just click "Run function"
   - You should see: `{ success: true, message: "Successfully created 8 orientation schedules", count: 8 }`

3. **Verify Data:**
   - Click "Data" in sidebar
   - Select `orientationSchedules` table
   - You should see 8 schedules with different dates/times

---

### Step 2: Set Up Test Application

1. **Go to Convex Dashboard → Data → applications**

2. **Find or Create a test application**

3. **Update the application status:**
   - Click on an application
   - Change `applicationStatus` field to: `For Orientation`
   - Save

---

### Step 3: Test the Feature

#### **A. View Orientation CTA**
1. Open the mobile app
2. Go to Dashboard
3. You should see the application card
4. The CTA should say: "Schedule orientation" ✅

#### **B. Open Orientation Screen**
1. Tap on "Schedule Orientation Session"
2. You should see:
   - Header with back button
   - List of available schedules
   - Calendar-style date cards
   - Slot availability indicators (green/yellow/red)

#### **C. Book an Orientation**
1. Select any schedule with available slots
2. Confirm button should appear at bottom
3. Tap "Confirm Booking"
4. Confirm in the alert dialog
5. You should see success message
6. Screen navigates back to application detail

#### **D. View Booked Session**
1. Go back to "Schedule Orientation" screen
2. You should now see your booked session with:
   - ✅ "Booked" badge
   - Date and time
   - Venue details
   - Important instructions
   - "Cancel Booking" button

#### **E. Cancel Booking**
1. Tap "Cancel Booking"
2. Confirm cancellation
3. Success message appears
4. Navigate back
5. Go to schedule screen again
6. Should show available schedules again

---

### Step 4: Test Edge Cases

#### **Already Booked**
- Try booking when you already have a session
- Should show error: "You already have an orientation session booked"

#### **Full Schedule**
- The seed data includes one fully booked schedule
- It should be grayed out and disabled

#### **Low Slots**
- Schedules with ≤3 slots show yellow warning
- Still bookable but indicates urgency

#### **No Schedules**
- Run `clearAllSchedules` mutation in Convex
- App should show "No Available Schedules" empty state

---

## 🗄️ Database Verification

### Check in Convex Dashboard:

**orientationSchedules table:**
- Should have 8 records
- Various dates (3-23 days from now)
- Different venues
- One with 0 availableSlots (fully booked)

**orientationSessions table:**
- After booking: Should have 1 record
- Fields: userId, applicationId, scheduleId, scheduledDate, status
- status should be "scheduled"

**When you book:**
- orientationSessions gets new record
- orientationSchedules.availableSlots decrements
- If slots reach 0, isAvailable becomes false

**When you cancel:**
- orientationSessions status becomes "cancelled"
- orientationSchedules.availableSlots increments
- isAvailable becomes true again

---

## 🔄 Reset Test Data

If you need to start fresh:

1. **Clear all schedules:**
   ```
   Convex Dashboard → Functions
   → orientationSchedules.clearAllSchedules()
   ```

2. **Reseed:**
   ```
   → orientationSchedules.seedOrientationSchedules()
   ```

3. **Clear sessions:**
   ```
   Data → orientationSessions table
   → Delete all records manually
   ```

---

## ✅ Expected Behavior

### **UI States:**
- ✅ Loading: Shows spinner
- ✅ Empty: Shows "No schedules" message
- ✅ Available: Shows schedule cards
- ✅ Booked: Shows booked session details
- ✅ Error: Shows alert with error message

### **Button States:**
- ✅ Disabled when fully booked
- ✅ Shows loading during booking
- ✅ Proper feedback on success/error

### **Real-time Updates:**
- ✅ Slot counts update immediately after booking
- ✅ Schedule disappears if you booked the last slot
- ✅ Booked session appears instantly

---

## 🐛 Troubleshooting

**"No schedules showing"**
- Check if seed function ran successfully
- Verify dates are in the future (seed uses relative dates)
- Check Convex logs for errors

**"Cannot book"**
- Verify application status is "For Orientation"
- Check if you already have a booking
- Ensure user is authenticated

**"Slots not updating"**
- Refresh the app
- Check Convex real-time connection
- Verify mutation completed successfully

---

## 📊 Test Coverage

- [x] View available schedules
- [x] Book orientation slot
- [x] View booked session
- [x] Cancel booking
- [x] Prevent double booking
- [x] Handle full schedules
- [x] Show low slot warnings
- [x] Empty state handling
- [x] Error handling
- [x] Loading states
- [x] Real-time updates
- [x] Atomic slot management

---

## 🎉 Success Criteria

Your feature is working if:
1. ✅ You can see 8 schedules
2. ✅ You can book a schedule
3. ✅ Slot count decreases
4. ✅ Booked session displays correctly
5. ✅ You can cancel and rebook
6. ✅ Cannot double-book
7. ✅ Full schedules are disabled
8. ✅ All states render properly

---

Happy Testing! 🚀
