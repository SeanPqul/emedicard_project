# Orientation Booking System - Clean Schema Proposal

## 🎯 Problem Statement

Current orientation system has 3 tables with overlapping responsibilities:
- `orientationSchedules` - Available time slots ✅
- `orientationSessions` - User bookings (NEW)
- `orientations` - Attendance records (OLD)

This creates confusion about which table to query and leads to data duplication.

---

## ✅ Proposed Solution: 2-Table System

### **Clear Separation of Concerns:**

```
┌─────────────────────────┐
│ orientationSchedules    │  Master schedule (created by admins)
│ (What's available)      │  
└──────────┬──────────────┘
           │
           │ Many bookings per schedule
           ↓
┌─────────────────────────┐
│ orientationBookings     │  User reservations + attendance
│ (Who booked what)       │  
└─────────────────────────┘
```

---

## 📋 Schema Definition

### **Table 1: orientationSchedules** (Master Schedule)

```typescript
// Master schedule - Created by admins
// Defines available orientation time slots
orientationSchedules: defineTable({
  // Date & Time
  date: v.float64(),                    // Date at UTC midnight (e.g., 2025-01-15)
  startMinutes: v.float64(),            // Minutes since midnight (540 = 9:00 AM)
  endMinutes: v.float64(),              // Minutes since midnight (660 = 11:00 AM)
  durationMinutes: v.float64(),         // Duration (calculated: endMinutes - startMinutes)
  
  // Venue Information
  venue: v.object({
    name: v.string(),                   // "Gaisano Ilustre"
    address: v.string(),                // Full address
    capacity: v.float64(),              // Max attendees
  }),
  
  // Instructor Information
  instructor: v.optional(v.object({
    name: v.string(),                   // "Dr. Juan Dela Cruz"
    designation: v.string(),            // "Health Officer"
    contactNumber: v.optional(v.string()),
  })),
  
  // Slot Management
  totalSlots: v.float64(),              // Maximum capacity
  availableSlots: v.float64(),          // Current available (decreases on booking)
  isAvailable: v.boolean(),             // Can still be booked?
  
  // Additional Info
  requirements: v.optional(v.string()), // "Bring valid ID"
  notes: v.optional(v.string()),        // Admin notes
  
  // Timestamps
  createdAt: v.float64(),
  updatedAt: v.float64(),
  createdBy: v.id("users"),             // Admin who created
})
.index("by_date", ["date"])
.index("by_availability", ["isAvailable", "date"])
.index("by_date_time", ["date", "startMinutes"])
.index("by_venue", ["venue.name", "date"])
```

**Purpose:**
- ✅ Admins create available orientation slots
- ✅ Display to users during booking
- ✅ Capacity management (availableSlots)

**Key Fields:**
- `date` + `startMinutes/endMinutes` = When orientation happens
- `venue` = Where it happens
- `instructor` = Who conducts it
- `totalSlots/availableSlots` = Capacity tracking

---

### **Table 2: orientationBookings** (User Bookings + Attendance)

```typescript
// User bookings and attendance tracking
// One record per applicant per orientation
orientationBookings: defineTable({
  // References
  applicationId: v.id("applications"),      // Which application
  scheduleId: v.id("orientationSchedules"), // Which schedule slot
  userId: v.string(),                       // Clerk user ID (for quick queries)
  
  // Booking Status Lifecycle
  bookingStatus: v.union(
    v.literal("booked"),       // User booked slot
    v.literal("confirmed"),    // Admin confirmed attendance
    v.literal("checked-in"),   // Inspector scanned QR at entrance
    v.literal("completed"),    // Inspector scanned QR at exit (attended)
    v.literal("missed"),       // No-show (didn't check in)
    v.literal("cancelled"),    // User or admin cancelled
    v.literal("rescheduled")   // User requested reschedule
  ),
  
  // QR Code for Check-in/Check-out
  qrCodeData: v.string(),      // JSON with bookingId, userId, scheduleId
  qrCodeUrl: v.string(),       // Generated QR code image URL
  
  // Attendance Tracking
  checkInTime: v.optional(v.float64()),      // When user arrived
  checkOutTime: v.optional(v.float64()),     // When user left
  checkedInBy: v.optional(v.id("users")),    // Inspector who scanned in
  checkedOutBy: v.optional(v.id("users")),   // Inspector who scanned out
  
  // Duration Tracking
  attendanceDurationMinutes: v.optional(v.float64()), // checkOutTime - checkInTime
  
  // Certificates & Completion
  certificateGenerated: v.optional(v.boolean()),
  certificateId: v.optional(v.string()),
  certificateIssuedAt: v.optional(v.float64()),
  
  // Notes & Remarks
  inspectorNotes: v.optional(v.string()),    // Inspector comments
  userNotes: v.optional(v.string()),         // User's notes/questions
  cancellationReason: v.optional(v.string()),// Why cancelled
  
  // Notification Tracking
  reminderSent: v.optional(v.boolean()),     // Reminder notification sent?
  reminderSentAt: v.optional(v.float64()),
  
  // Timestamps
  bookedAt: v.float64(),         // When user made booking
  confirmedAt: v.optional(v.float64()),
  cancelledAt: v.optional(v.float64()),
  completedAt: v.optional(v.float64()),
  
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
.index("by_application", ["applicationId"])
.index("by_schedule", ["scheduleId"])
.index("by_user", ["userId"])
.index("by_status", ["bookingStatus"])
.index("by_date_status", ["scheduleId", "bookingStatus"])
.index("by_checked_in_by", ["checkedInBy", "checkInTime"])
.index("by_checked_out_by", ["checkedOutBy", "checkOutTime"])
```

**Purpose:**
- ✅ Track who booked which slot
- ✅ QR code check-in/check-out
- ✅ Attendance verification
- ✅ Certificate generation

**Key Fields:**
- `applicationId` + `scheduleId` = Booking link
- `bookingStatus` = Current state (booked → checked-in → completed)
- `checkInTime/checkOutTime` = Attendance proof
- `qrCodeUrl` = For inspector scanning

---

## 🔄 Booking Lifecycle

```
User Flow:
┌─────────┐    ┌──────────┐    ┌────────────┐    ┌───────────┐
│ Browse  │ →  │ Book     │ →  │ Check-in   │ →  │ Check-out │
│ Slots   │    │ Slot     │    │ (QR Scan)  │    │ (QR Scan) │
└─────────┘    └──────────┘    └────────────┘    └───────────┘
                    ↓                ↓                   ↓
Status:         "booked"      "checked-in"        "completed"
```

**Status Transitions:**

```typescript
// Normal flow
"booked" 
  → "confirmed" (admin confirms)
  → "checked-in" (inspector scans QR at entrance)
  → "completed" (inspector scans QR at exit)

// Edge cases
"booked" → "cancelled" (user cancels)
"booked" → "rescheduled" (user changes slot)
"booked" → "missed" (no-show, auto-update after schedule end time)
"checked-in" → "completed" (attended)
"checked-in" → "missed" (checked in but left early)
```

---

## 📊 Query Patterns

### **1. Show available slots to user**
```typescript
const availableSlots = await ctx.db
  .query("orientationSchedules")
  .withIndex("by_availability", q => 
    q.eq("isAvailable", true).gte("date", Date.now())
  )
  .collect();
```

### **2. Book a slot**
```typescript
// Create booking
const bookingId = await ctx.db.insert("orientationBookings", {
  applicationId,
  scheduleId,
  userId: clerkUserId,
  bookingStatus: "booked",
  qrCodeUrl: generateQRCode(bookingId),
  bookedAt: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Decrease available slots
await ctx.db.patch(scheduleId, {
  availableSlots: schedule.availableSlots - 1,
  isAvailable: schedule.availableSlots - 1 > 0,
  updatedAt: Date.now(),
});
```

### **3. Check-in via QR scan**
```typescript
await ctx.db.patch(bookingId, {
  bookingStatus: "checked-in",
  checkInTime: Date.now(),
  checkedInBy: inspectorUserId,
  updatedAt: Date.now(),
});
```

### **4. Check-out via QR scan**
```typescript
const booking = await ctx.db.get(bookingId);
const duration = (Date.now() - booking.checkInTime!) / (1000 * 60); // minutes

await ctx.db.patch(bookingId, {
  bookingStatus: "completed",
  checkOutTime: Date.now(),
  checkedOutBy: inspectorUserId,
  attendanceDurationMinutes: duration,
  completedAt: Date.now(),
  updatedAt: Date.now(),
});

// Generate certificate
await generateCertificate(bookingId);
```

### **5. Get user's bookings**
```typescript
const myBookings = await ctx.db
  .query("orientationBookings")
  .withIndex("by_user", q => q.eq("userId", clerkUserId))
  .collect();

// Enrich with schedule details
const enriched = await Promise.all(
  myBookings.map(async (booking) => ({
    ...booking,
    schedule: await ctx.db.get(booking.scheduleId),
  }))
);
```

### **6. Get schedule attendees (for inspectors)**
```typescript
const attendees = await ctx.db
  .query("orientationBookings")
  .withIndex("by_schedule", q => q.eq("scheduleId", scheduleId))
  .collect();

// Group by status
const summary = {
  booked: attendees.filter(a => a.bookingStatus === "booked").length,
  checkedIn: attendees.filter(a => a.bookingStatus === "checked-in").length,
  completed: attendees.filter(a => a.bookingStatus === "completed").length,
  missed: attendees.filter(a => a.bookingStatus === "missed").length,
};
```

---

## ⚡ Performance Considerations

### **Indexes Explained:**

```typescript
// orientationSchedules
.index("by_date", ["date"])                    // List schedules by date
.index("by_availability", ["isAvailable", "date"]) // Only show available
.index("by_date_time", ["date", "startMinutes"])   // Sort by time
.index("by_venue", ["venue.name", "date"])     // Filter by venue

// orientationBookings
.index("by_application", ["applicationId"])    // User's bookings
.index("by_schedule", ["scheduleId"])          // Schedule's attendees
.index("by_user", ["userId"])                  // All user bookings
.index("by_status", ["bookingStatus"])         // Group by status
.index("by_date_status", ["scheduleId", "bookingStatus"]) // Composite
```

### **Avoiding Race Conditions:**

```typescript
// Use atomic operations for slot management
const schedule = await ctx.db.get(scheduleId);

if (schedule.availableSlots <= 0) {
  throw new Error("No slots available");
}

// Transaction-like update
await ctx.db.patch(scheduleId, {
  availableSlots: schedule.availableSlots - 1,
  isAvailable: schedule.availableSlots - 1 > 0,
});
```

---

## 🔄 Migration Plan

### **Option 1: Clean Migration (Recommended)**

If you can afford data loss (testing environment):

1. **Drop old tables:**
   ```typescript
   // Remove from schema.ts
   // orientations (old)
   // orientationSessions (old)
   ```

2. **Deploy new schema:**
   ```bash
   npx convex deploy
   ```

3. **Seed test data:**
   ```bash
   npm run seed:orientationSchedules
   ```

### **Option 2: Data Preservation Migration**

If you have production data:

1. **Add new table alongside old:**
   ```typescript
   // Keep: orientations, orientationSessions
   // Add: orientationBookings
   ```

2. **Create migration script:**
   ```typescript
   // convex/migrations/migrateOrientations.ts
   export const migrateOrientationData = mutation({
     handler: async (ctx) => {
       // Migrate orientationSessions → orientationBookings
       const sessions = await ctx.db.query("orientationSessions").collect();
       
       for (const session of sessions) {
         await ctx.db.insert("orientationBookings", {
           applicationId: session.applicationId,
           scheduleId: session.scheduleId,
           userId: session.userId,
           bookingStatus: mapOldStatusToNew(session.status),
           qrCodeUrl: generateQRCode(session),
           bookedAt: session.createdAt,
           createdAt: session.createdAt,
           updatedAt: session.updatedAt || Date.now(),
         });
       }
       
       // Migrate orientations attendance data
       const orientations = await ctx.db.query("orientations").collect();
       
       for (const orientation of orientations) {
         const booking = await ctx.db
           .query("orientationBookings")
           .withIndex("by_application", q => 
             q.eq("applicationId", orientation.applicationId)
           )
           .first();
         
         if (booking) {
           await ctx.db.patch(booking._id, {
             checkInTime: orientation.checkInTime,
             checkOutTime: orientation.checkOutTime,
             checkedInBy: orientation.checkedInBy,
             checkedOutBy: orientation.checkedOutBy,
             inspectorNotes: orientation.inspectorNotes,
           });
         }
       }
     }
   });
   ```

3. **Test migration:**
   ```bash
   npx convex run migrations:migrateOrientationData
   ```

4. **Update all queries/mutations to use new table**

5. **After verification, drop old tables**

---

## ✅ Benefits of This Approach

| Aspect | Improvement |
|--------|------------|
| **Clarity** | ✅ Clear separation: schedules vs bookings |
| **Storage** | ✅ No data duplication (venue, instructor) |
| **Queries** | ✅ Simpler queries, fewer joins |
| **Consistency** | ✅ Single source of truth per booking |
| **Scalability** | ✅ Efficient indexes for common patterns |
| **Maintenance** | ✅ Easier to understand and modify |

---

## 🎯 Comparison: Old vs New

### **Old System (3 tables):**
```typescript
orientationSchedules     // Master schedule ✅
  ↓
orientationSessions      // User bookings ⚠️
  ↓
orientations             // Attendance ⚠️
// Problem: Overlap between sessions & orientations
```

### **New System (2 tables):**
```typescript
orientationSchedules     // Master schedule ✅
  ↓
orientationBookings      // Bookings + Attendance ✅
// Solution: Single table handles both
```

---

## 📝 Implementation Checklist

### **Phase 1: Schema Update**
- [ ] Add `orientationBookings` table to schema.ts
- [ ] Deploy to Convex
- [ ] Test table creation

### **Phase 2: Backend Functions**
- [ ] Create booking mutation
- [ ] Create cancel booking mutation
- [ ] Create check-in mutation (QR scan)
- [ ] Create check-out mutation (QR scan)
- [ ] Create get user bookings query
- [ ] Create get schedule attendees query

### **Phase 3: Frontend Integration**
- [ ] Update booking flow UI
- [ ] Update QR code scanner
- [ ] Update attendance tracking screen
- [ ] Update user booking history

### **Phase 4: Migration (if needed)**
- [ ] Write migration script
- [ ] Test migration on staging
- [ ] Run migration on production
- [ ] Verify data integrity

### **Phase 5: Cleanup**
- [ ] Remove old table references
- [ ] Update documentation
- [ ] Remove unused functions

---

## 🚀 Next Steps

1. **Review this proposal** - Does it match your business requirements?
2. **Decide on migration** - Clean slate or data preservation?
3. **Update schema.ts** - Implement new tables
4. **Create mutations** - Booking, check-in, check-out logic
5. **Test thoroughly** - Ensure no race conditions in slot management

---

**Questions to Answer:**

1. Do users need to reschedule bookings?
2. Should there be a booking deadline (e.g., 24 hours before)?
3. Do you send reminder notifications?
4. Is there a waiting list if slots are full?
5. Can admins override bookings?

Let me know and I can refine the schema further! 🎯
