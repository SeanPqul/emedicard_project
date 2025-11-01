# Convex-Optimized Orientation Schema Migration

## 🎯 Goal
Leverage Convex's document-relational features for cleaner schema design.

---

## Current State (3 Tables)

```typescript
orientationSchedules    // Master schedule ✅
orientationSessions     // User bookings
orientations           // Attendance tracking
// Problem: Last two overlap
```

---

## Target State (2 Tables)

```typescript
orientationSchedules    // Master schedule ✅
orientationBookings     // Bookings + Attendance (merged)
```

---

## New Schema Definition

```typescript
// Table 1: orientationSchedules (keep as-is)
orientationSchedules: defineTable({
  date: v.float64(),
  startMinutes: v.float64(),
  endMinutes: v.float64(),
  durationMinutes: v.float64(),
  venue: v.object({
    name: v.string(),
    address: v.string(),
    capacity: v.float64(),
  }),
  instructor: v.optional(v.object({
    name: v.string(),
    designation: v.string(),
  })),
  totalSlots: v.float64(),
  availableSlots: v.float64(),
  isAvailable: v.boolean(),
  notes: v.optional(v.string()),
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
.index("by_date", ["date"])
.index("by_availability", ["isAvailable", "date"])
.index("by_date_time", ["date", "startMinutes"])

// Table 2: orientationBookings (NEW - replaces both old tables)
orientationBookings: defineTable({
  // References (Convex-optimized)
  applicationId: v.id("applications"),
  scheduleId: v.id("orientationSchedules"),  // ← Convex fast join
  userId: v.string(),
  
  // Booking lifecycle
  bookingStatus: v.union(
    v.literal("booked"),
    v.literal("checked-in"),
    v.literal("completed"),
    v.literal("cancelled"),
    v.literal("missed"),
    v.literal("excused")
  ),
  
  // QR Code
  qrCodeData: v.string(),
  qrCodeUrl: v.string(),
  
  // Attendance tracking
  checkInTime: v.optional(v.float64()),
  checkOutTime: v.optional(v.float64()),
  checkedInBy: v.optional(v.id("users")),
  checkedOutBy: v.optional(v.id("users")),
  attendanceDurationMinutes: v.optional(v.float64()),
  
  // Inspector notes
  inspectorNotes: v.optional(v.string()),
  cancellationReason: v.optional(v.string()),
  
  // Strategic denormalization (historical snapshot)
  scheduledDateSnapshot: v.float64(),  // Immutable booking date
  venueSnapshot: v.optional(v.object({  // Optional: for compliance
    name: v.string(),
    address: v.string(),
  })),
  
  // Reminders
  reminderSent: v.optional(v.boolean()),
  reminderSentAt: v.optional(v.float64()),
  
  // Admin override
  adminOverride: v.optional(v.boolean()),
  overrideReason: v.optional(v.string()),
  overriddenBy: v.optional(v.id("users")),
  
  // Timestamps
  bookedAt: v.float64(),
  completedAt: v.optional(v.float64()),
  cancelledAt: v.optional(v.float64()),
  createdAt: v.float64(),
  updatedAt: v.float64(),
})
.index("by_application", ["applicationId"])
.index("by_schedule", ["scheduleId"])
.index("by_user", ["userId"])
.index("by_status", ["bookingStatus"])
.index("by_schedule_status", ["scheduleId", "bookingStatus"])
.index("by_reminder", ["reminderSent", "bookedAt"])
```

---

## Migration Strategy

### Step 1: Add New Table

```typescript
// Add to schema.ts
orientationBookings: defineTable({...})
```

### Step 2: Migrate Data

```typescript
export const migrateOrientationData = internalMutation({
  handler: async (ctx) => {
    // Get all sessions
    const sessions = await ctx.db
      .query("orientationSessions")
      .collect();
    
    for (const session of sessions) {
      // Find corresponding orientation
      const orientation = await ctx.db
        .query("orientations")
        .withIndex("by_application", q => 
          q.eq("applicationId", session.applicationId)
        )
        .first();
      
      // Create unified booking record
      await ctx.db.insert("orientationBookings", {
        applicationId: session.applicationId,
        scheduleId: session.scheduleId,
        userId: session.userId,
        
        // Map status
        bookingStatus: mapStatus(session.status, orientation),
        
        // From orientation
        qrCodeData: orientation?.qrCodeUrl || `EMC-${session.applicationId}`,
        qrCodeUrl: orientation?.qrCodeUrl || `EMC-${session.applicationId}`,
        checkInTime: orientation?.checkInTime,
        checkOutTime: orientation?.checkOutTime,
        checkedInBy: orientation?.checkedInBy,
        checkedOutBy: orientation?.checkedOutBy,
        inspectorNotes: orientation?.inspectorNotes,
        
        // Historical snapshot
        scheduledDateSnapshot: session.scheduledDate,
        venueSnapshot: session.venue,
        
        // Timestamps
        bookedAt: session.createdAt,
        completedAt: session.completedDate,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt || Date.now(),
      });
    }
    
    console.log(`Migrated ${sessions.length} bookings`);
  }
});

function mapStatus(sessionStatus, orientation) {
  if (orientation?.checkOutTime) return "completed";
  if (orientation?.checkInTime) return "checked-in";
  if (sessionStatus === "cancelled") return "cancelled";
  if (sessionStatus === "no-show") return "missed";
  return "booked";
}
```

### Step 3: Update Mutations

```typescript
// bookOrientationSlot.ts
export const bookOrientationSlot = mutation({
  handler: async (ctx, args) => {
    // ... validation ...
    
    // Create unified booking
    await ctx.db.insert("orientationBookings", {
      applicationId,
      scheduleId,
      userId: clerkUserId,
      bookingStatus: "booked",
      qrCodeUrl: generateQRCode(),
      scheduledDateSnapshot: schedule.date,
      bookedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update slots
    await ctx.db.patch(scheduleId, {
      availableSlots: schedule.availableSlots - 1,
      isAvailable: schedule.availableSlots - 1 > 0,
    });
  }
});

// attendance.ts - checkIn
export const checkIn = mutation({
  handler: async (ctx, args) => {
    // Get booking
    const booking = await ctx.db
      .query("orientationBookings")
      .withIndex("by_application", q => 
        q.eq("applicationId", args.applicationId)
      )
      .first();
    
    // Update with check-in
    await ctx.db.patch(booking._id, {
      bookingStatus: "checked-in",
      checkInTime: Date.now(),
      checkedInBy: inspector._id,
      updatedAt: Date.now(),
    });
  }
});
```

### Step 4: Update Queries

```typescript
// Get user bookings (Convex-optimized)
export const getUserBookings = query({
  handler: async (ctx) => {
    const bookings = await ctx.db
      .query("orientationBookings")
      .withIndex("by_user", q => q.eq("userId", clerkUserId))
      .collect();
    
    // Enrich with schedule data (Convex fast join)
    return Promise.all(
      bookings.map(async (booking) => ({
        ...booking,
        schedule: await ctx.db.get(booking.scheduleId),
      }))
    );
  }
});
```

### Step 5: Remove Old Tables

```typescript
// After testing, remove from schema.ts:
// - orientationSessions
// - orientations
```

---

## Benefits in Convex

1. ✅ **Fast joins** - `scheduleId` reference is optimized
2. ✅ **Type safety** - `v.id("orientationSchedules")` enforced
3. ✅ **Reactive queries** - Changes propagate automatically
4. ✅ **ACID transactions** - Atomic booking operations
5. ✅ **Clean schema** - 2 tables instead of 3
6. ✅ **Less duplication** - Schedule data in one place

---

## Testing Checklist

- [ ] Book a new orientation slot
- [ ] Check-in via QR code
- [ ] Check-out via QR code
- [ ] Cancel booking
- [ ] View booking history
- [ ] Inspector view attendees
- [ ] Verify slot count updates
- [ ] Test edge cases (double booking, etc.)

---

## Rollback Plan

If issues arise:
1. Keep old tables in schema temporarily
2. Run migration script to populate new table
3. Test new queries alongside old ones
4. Switch over gradually
5. Remove old tables only after verification
