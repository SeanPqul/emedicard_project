# Convex Query Polling Solution

## 🔍 The Real Issue

You correctly identified that Convex has **automatic reactive updates**, so why do we need timers?

### The Problem:

**Convex is reactive to DATABASE changes, NOT time passing!**

```typescript
// Backend calculates status at QUERY time
const serverNow = Date.now();
isActive = serverPhtMinutes >= schedule.startMinutes && serverPhtMinutes <= schedule.endMinutes;
```

**Timeline:**
```
8:45 PM → Query runs: { isActive: false, isUpcoming: true }
8:46 PM → Session starts (but no DB change!)
          ❌ Convex doesn't re-run query
          ❌ Mobile still shows isActive: false
8:49 PM → User refreshes manually
          ✅ Query re-runs: { isActive: true }
```

### Why This Happens:

1. `isActive` is **computed** in the query (not stored in DB)
2. Schedule data in DB **doesn't change** at 8:46 PM
3. Convex only re-runs queries on **database mutations**
4. Time passing is **not a database mutation**!

## ✅ Proper Solutions

### Solution 1: Manual Query Polling (Recommended)

Add a useEffect to force refetch every 30 seconds when there are active/upcoming sessions:

```typescript
// In useInspectorDashboard.ts
useEffect(() => {
  if (!schedules || schedules.length === 0) return;

  // Check if any sessions are active or starting soon
  const hasActiveOrUpcoming = schedules.some(s =>
    s.isActive || s.isUpcoming
  );

  if (!hasActiveOrUpcoming) return;

  // Poll backend every 30 seconds to refresh status
  const pollInterval = setInterval(() => {
    // Convex will automatically refetch
    // This is done by re-subscribing to the query
  }, 30000);

  return () => clearInterval(pollInterval);
}, [schedules]);
```

**Note:** Convex React hooks don't expose a manual `refetch()` function. You'd need to use a state trigger or the lower-level Convex client.

### Solution 2: Database-Stored Status (Better Architecture)

Store the status in the database and update it via scheduled functions:

```typescript
// Backend: convex/crons.ts
export default {
  updateSessionStatuses: {
    schedule: "*/1 * * * *", // Every minute
    handler: async (ctx) => {
      const now = Date.now();
      const schedules = await ctx.db.query("orientationSchedules").collect();

      for (const schedule of schedules) {
        const isActive = /* calculate based on now */;
        const isPast = /* calculate based on now */;

        // Update the DATABASE
        await ctx.db.patch(schedule._id, {
          isActive,
          isPast,
          lastStatusUpdate: now
        });
      }
    }
  }
};
```

**Benefit:** Now status changes ARE database changes, so Convex auto-refresh works!

### Solution 3: Client-Side Polling with Convex Client

Use the Convex client directly to force refetches:

```typescript
import { useConvex } from 'convex/react';

const convex = useConvex();

useEffect(() => {
  const interval = setInterval(async () => {
    // Force query to re-execute
    await convex.query(api.orientationSchedules.getSchedulesForDate, {
      selectedDate: serverDate
    });
  }, 30000);

  return () => clearInterval(interval);
}, [serverDate]);
```

## 📊 Comparison

| Solution | Pros | Cons | Recommended? |
|----------|------|------|--------------|
| **Local 10s timer** | Simple, no backend changes | Doesn't update isActive flag | ❌ Incomplete |
| **Manual polling** | Works with current architecture | Slightly more network calls | ✅ **YES** |
| **DB-stored status** | True reactive updates | Requires backend cron job | ✅✅ **BEST** |
| **Client polling** | Most reliable | More complex code | ⚠️ Okay |

## 🎯 Recommended Approach

**Implement Solution 2 (DB-stored status):**

1. Add fields to schema:
```typescript
// schema.ts
orientationSchedules: defineTable({
  // ...existing fields...
  computedIsActive: v.boolean(),
  computedIsPast: v.boolean(),
  computedIsUpcoming: v.boolean(),
  statusLastUpdated: v.number(),
})
```

2. Add cron job:
```typescript
// convex/crons.ts
export default {
  updateOrientationStatuses: {
    schedule: "* * * * *", // Every minute
    handler: async (ctx) => {
      // Update all schedule statuses
    }
  }
};
```

3. Query just reads from DB:
```typescript
// Queries now just return the stored status
return {
  isActive: schedule.computedIsActive,
  isPast: schedule.computedIsPast,
  isUpcoming: schedule.computedIsUpcoming
};
```

**Result:** TRUE reactive updates! When status changes in DB, Convex automatically pushes to all clients! 🚀

## ⚡ Quick Fix (While Implementing Full Solution)

For now, the 10-second timer helps with countdown display, but you're right that it doesn't solve the core issue.

A quick bandaid:
```typescript
// Force backend refetch every 30 seconds when viewing dashboard
useEffect(() => {
  const interval = setInterval(() => {
    // Trigger component re-render which causes useQuery to re-subscribe
    setForceRefresh(prev => prev + 1);
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

---

**Bottom Line:** You caught a real architectural issue! The proper fix is to store computed status in the database and update it via cron, so Convex's reactivity works correctly.
