# Inspector Feature Implementation Plan

**Project:** eMediCard Mobile App - Inspector Module  
**Feature:** Food Safety Orientation Attendance Tracking  
**Start Date:** January 23, 2025  
**Estimated Duration:** 7-10 days  
**Status:** 🔄 In Progress

---

## 📋 Overview

### Purpose
Implement a complete inspector interface for tracking food safety orientation attendance via QR code scanning. Inspectors are staff members who manage check-in/check-out for Yellow card (food handler) applicants attending mandatory orientation sessions.

### Scope
- ✅ **In Scope:** QR scanning, attendance tracking, session management, scan history
- ❌ **Out of Scope:** Document review (admin role only), payment processing, application approval

### Key Requirements
- Inspector can only interact with Yellow card applicants (food handlers)
- Single venue per implementation (typically "Gaisano Ilustre") but flexible for future changes
- Multiple time slots per day (e.g., 8-9 AM, 9-10 AM, 10-11 AM, etc.)
- Real-time attendance updates across all inspector devices
- Scan history logging for accountability

---

## 🏗️ Architecture Overview

### Technology Stack
- **Framework:** React Native + Expo Router
- **Backend:** Convex (real-time database)
- **UI Components:** Custom components following FSD architecture
- **Navigation:** File-based routing (Expo Router)
- **State Management:** Convex queries + React hooks

### File Structure
```
src/
├── features/
│   └── inspector/
│       ├── components/           # Reusable UI components
│       │   ├── AttendanceStatusBadge/
│       │   ├── AttendeeListItem/
│       │   ├── CurrentSessionCard/
│       │   ├── InspectorStats/
│       │   ├── ScanHistoryItem/
│       │   ├── SessionCard/
│       │   └── index.ts
│       ├── hooks/                # Data fetching & business logic
│       │   ├── useInspectorDashboard.ts
│       │   ├── useOrientationSessions.ts
│       │   ├── useScanHistory.ts
│       │   ├── useSessionAttendees.ts
│       │   └── index.ts
│       ├── lib/                  # Utilities & constants
│       │   ├── constants.ts
│       │   ├── types.ts
│       │   ├── utils.ts
│       │   └── index.ts
│       └── index.ts
│
├── screens/
│   └── inspector/
│       ├── InspectorDashboardScreen/      # Main dashboard (enhance existing)
│       ├── OrientationAttendanceScreen/   # QR scanner (already exists)
│       ├── OrientationSessionsScreen/     # Session list (new)
│       ├── ScanHistoryScreen/             # Scan log (new)
│       ├── SessionAttendeesScreen/        # Attendee list (new)
│       └── index.ts
│
└── app/
    └── (screens)/
        └── (inspector)/
            ├── dashboard.tsx                   # Route: /(screens)/(inspector)/dashboard
            ├── orientation-attendance.tsx      # Route: /(screens)/(inspector)/orientation-attendance
            ├── sessions.tsx                    # Route: /(screens)/(inspector)/sessions (new)
            ├── attendees.tsx                   # Route: /(screens)/(inspector)/attendees (new)
            ├── scan-history.tsx                # Route: /(screens)/(inspector)/scan-history (new)
            └── _layout.tsx
```

---

## 📱 Screen Specifications

### 1. Inspector Dashboard
**Route:** `/(screens)/(inspector)/dashboard`  
**File:** `src/screens/inspector/InspectorDashboardScreen/`  
**Status:** 🔄 Enhance Existing

**Purpose:** Main entry point showing today's orientation overview and quick actions.

**Layout:**
```
┌─────────────────────────────────────────┐
│  🎯 Inspector Dashboard                 │ ← Green header (HEADER_CONSTANTS)
│  Food Safety Orientation Tracker        │
└─────────────────────────────────────────┘

📊 TODAY'S STATS
┌──────────────┬──────────────┐
│ 🔔 Scheduled │ ✅ Checked In│
│     24       │      18      │
└──────────────┴──────────────┘
┌──────────────┬──────────────┐
│ 🚪 Checked Out│ ⏳ Pending  │
│     12       │      6       │
└──────────────┴──────────────┘

🎬 CURRENT SESSION
┌─────────────────────────────────────────┐
│ 9:00 AM - 10:00 AM                      │
│ 📍 Gaisano Ilustre                      │
│ ────────────────────────────────────────│
│ 12 attendees • 8 checked in • 4 pending │
│                                          │
│ [📱 Scan QR Code]  [👥 View Attendees]  │
└─────────────────────────────────────────┘

📅 UPCOMING SESSIONS TODAY
┌─────────────────────────────────────────┐
│ 10:00 AM - 11:00 AM                     │
│ 📍 Gaisano Ilustre                      │
│ 8 attendees scheduled                    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 1:00 PM - 2:00 PM                       │
│ 📍 Gaisano Ilustre                      │
│ 15 attendees scheduled                   │
└─────────────────────────────────────────┘

📜 [View All Sessions]  📊 [Scan History]
```

**Features:**
- Real-time stats from `orientations.getOrientationSchedulesForDate(today)`
- Current session detection (active time slot)
- Quick navigation to scanner and attendees
- Link to all sessions and scan history
- Auto-refresh every 30 seconds

**Components:**
- `InspectorStats` - 4 stat cards
- `CurrentSessionCard` - Highlighted active session
- `SessionCard` - Upcoming session previews

---

### 2. Orientation Sessions Screen
**Route:** `/(screens)/(inspector)/sessions`  
**File:** `src/screens/inspector/OrientationSessionsScreen/`  
**Status:** ⭐ New

**Purpose:** View all orientation sessions for any date with time slot breakdown.

**Layout:**
```
┌─────────────────────────────────────────┐
│  [←] Orientation Sessions               │ ← Green header
│  View scheduled sessions by date        │
└─────────────────────────────────────────┘

📅 Date: [Jan 23, 2025 ▼]  [📆 Picker]

🎬 8:00 AM - 9:00 AM
┌─────────────────────────────────────────┐
│ 📍 Gaisano Ilustre                      │
│ ────────────────────────────────────────│
│ 15 of 15 attendees                       │
│ ✅ 10 completed • 🟡 3 ongoing • ⚪ 2    │
│                                          │
│ [📱 Scan QR]      [👥 View Attendees]   │
└─────────────────────────────────────────┘

🎬 9:00 AM - 10:00 AM
┌─────────────────────────────────────────┐
│ 📍 Gaisano Ilustre                      │
│ ────────────────────────────────────────│
│ 8 of 12 attendees                        │
│ ✅ 6 completed • 🟡 2 ongoing • ⚪ 4     │
│                                          │
│ [📱 Scan QR]      [👥 View Attendees]   │
└─────────────────────────────────────────┘

🎬 10:00 AM - 11:00 AM
┌─────────────────────────────────────────┐
│ 📍 Gaisano Ilustre                      │
│ ────────────────────────────────────────│
│ 0 of 8 attendees                         │
│ ⏰ Starts in 35 minutes                  │
│                                          │
│ [📱 Scan QR]      [👥 View Attendees]   │
└─────────────────────────────────────────┘

[No more sessions today]
```

**Features:**
- Date picker to view any date (past/future)
- Dynamic venue display (adapts if venue changes)
- Time slot breakdown (e.g., 8-9, 9-10, 10-11, etc.)
- Attendance summary per session
- Status breakdown: Completed / Ongoing / Pending
- Quick scan and view attendees buttons
- Empty state for days with no sessions

**Backend Query:**
```typescript
orientations.getOrientationSchedulesForDate({ selectedDate })
```

**Components:**
- `SessionCard` - Per time slot card

---

### 3. Session Attendees Screen
**Route:** `/(screens)/(inspector)/attendees?date={timestamp}&timeSlot={string}&venue={string}`  
**File:** `src/screens/inspector/SessionAttendeesScreen/`  
**Status:** ⭐ New

**Purpose:** View list of attendees for a specific session with real-time status updates.

**Layout:**
```
┌─────────────────────────────────────────┐
│  [←] Attendees                          │ ← Green header
│  9:00 AM - 10:00 AM • Gaisano Ilustre   │
└─────────────────────────────────────────┘

📊 12 of 15 attendees checked in

🔍 [Search attendee by name...]

✅ Juan Dela Cruz
   🟢 Checked in: 8:55 AM
   🏁 Checked out: 9:58 AM

✅ Maria Santos
   🟢 Checked in: 9:02 AM
   🏁 Checked out: 10:00 AM

🟡 Pedro Garcia
   🟡 Checked in: 9:10 AM
   ⏳ Not yet checked out

🟡 Ana Rodriguez
   🟡 Checked in: 9:15 AM
   ⏳ Not yet checked out

⚪ Rosa Lim
   ⏳ Not yet checked in

⚪ Carlos Tan
   ⏳ Not yet checked in

────────────────────────────────────────

[📱 Scan QR Code]
```

**Features:**
- Real-time status updates via Convex subscriptions
- Search/filter by attendee name
- Status badges:
  - ✅ Green = Completed (checked in + out)
  - 🟡 Yellow = Checked in only
  - ⚪ Gray = Not yet checked in
- Timestamps for check-in/out
- Pull-to-refresh
- Auto-scrolls to newly scanned attendee

**Backend Query:**
```typescript
orientations.getAttendeesForSession({
  orientationDate,
  timeSlot,
  orientationVenue
})
```

**Components:**
- `AttendeeListItem` - Per attendee row
- `AttendanceStatusBadge` - Status indicator

---

### 4. Scan History Screen
**Route:** `/(screens)/(inspector)/scan-history`  
**File:** `src/screens/inspector/ScanHistoryScreen/`  
**Status:** ⭐ New

**Purpose:** View inspector's personal scan log for accountability and reporting.

**Layout:**
```
┌─────────────────────────────────────────┐
│  [←] Scan History                       │ ← Green header
│  My attendance scans                     │
└─────────────────────────────────────────┘

📅 Filter: [Last 7 Days ▼]  [📆 Custom Range]

📆 TODAY - January 23, 2025

✅ CHECK-OUT • 10:58 AM
┌─────────────────────────────────────────┐
│ Juan Dela Cruz                           │
│ 9:00 AM - 10:00 AM session              │
│ Duration: 2h 3m                          │
└─────────────────────────────────────────┘

✅ CHECK-OUT • 10:55 AM
┌─────────────────────────────────────────┐
│ Maria Santos                             │
│ 9:00 AM - 10:00 AM session              │
│ Duration: 1h 53m                         │
└─────────────────────────────────────────┘

🟡 CHECK-IN • 9:10 AM
┌─────────────────────────────────────────┐
│ Pedro Garcia                             │
│ 9:00 AM - 10:00 AM session              │
│ Status: Still in session                 │
└─────────────────────────────────────────┘

🟡 CHECK-IN • 9:02 AM
┌─────────────────────────────────────────┐
│ Maria Santos                             │
│ 9:00 AM - 10:00 AM session              │
└─────────────────────────────────────────┘

────────────────────────────────────────

📆 YESTERDAY - January 22, 2025

✅ CHECK-OUT • 4:58 PM
┌─────────────────────────────────────────┐
│ Carlos Mendez                            │
│ 3:00 PM - 4:00 PM session               │
│ Duration: 1h 55m                         │
└─────────────────────────────────────────┘

[Load More...]

────────────────────────────────────────
Total Scans: 45 this week
[📊 Export Report]
```

**Features:**
- Chronological scan log (newest first)
- Grouped by date
- Filter options:
  - Last 7 days
  - Last 30 days
  - Custom date range
  - Check-in only / Check-out only
- Shows:
  - Scan type (check-in/out)
  - Timestamp
  - Attendee name
  - Session time/venue
  - Duration (for completed sessions)
- Export to CSV/PDF
- Pagination/infinite scroll

**Backend Query:**
```typescript
// New query needed in backend
orientations.getInspectorScanHistory({
  inspectorId,
  startDate,
  endDate,
  scanType?: 'check-in' | 'check-out'
})
```

**Components:**
- `ScanHistoryItem` - Per scan event card

---

## 🎨 UI/UX Standards

### Design System Compliance
All screens follow the standards from `UI_UX_HANDOFF.md`:

#### Green Header Pattern
```typescript
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';

// All inspector screens use:
{
  backgroundColor: theme.colors.primary[500],
  borderBottomLeftRadius: moderateScale(24),
  borderBottomRightRadius: moderateScale(24),
  paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
  paddingTop: HEADER_CONSTANTS.TOP_PADDING,
  paddingBottom: HEADER_CONSTANTS.BOTTOM_PADDING,
}
```

#### Card Styling
```typescript
{
  backgroundColor: theme.colors.background.primary, // White
  borderRadius: moderateScale(12),
  padding: moderateScale(20),
  marginBottom: verticalScale(16),
  marginHorizontal: scale(16),
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
}
```

#### Status Colors
```typescript
export const ATTENDANCE_STATUS = {
  COMPLETED: {
    color: '#10B981', // Green
    icon: 'checkmark-circle',
    label: 'Completed',
  },
  CHECKED_IN: {
    color: '#F59E0B', // Yellow/Orange
    icon: 'time',
    label: 'Checked In',
  },
  PENDING: {
    color: '#9CA3AF', // Gray
    icon: 'ellipse-outline',
    label: 'Pending',
  },
  MISSED: {
    color: '#EF4444', // Red
    icon: 'close-circle',
    label: 'Missed',
  },
};
```

#### Typography
- **Screen Title:** 22px, semibold, white (on green header)
- **Screen Subtitle:** 13px, regular, white/80% opacity
- **Section Title:** 16px, bold, uppercase, gray
- **Card Title:** 16px, semibold, primary text
- **Card Body:** 14px, regular, secondary text
- **Timestamps:** 12px, regular, tertiary text

---

## 🔧 Backend Integration

### Existing Convex Queries (No Changes Needed)

#### 1. Get Orientation Schedules for Date
```typescript
// File: backend/convex/orientations/attendance.ts
orientations.getOrientationSchedulesForDate({
  selectedDate: number // Timestamp (start of day)
})

// Returns:
{
  schedules: Array<{
    _id: Id<"orientationSchedules">,
    date: number,
    timeSlot: string, // "8:00 AM - 9:00 AM"
    venue: string,    // "Gaisano Ilustre"
    maxCapacity: number,
    currentBookings: number,
    attendees: Array<{
      applicationId: Id<"applications">,
      userId: Id<"users">,
      fullname: string,
      checkInTime?: number,
      checkOutTime?: number,
      orientationStatus: "Scheduled" | "Completed" | "Missed"
    }>
  }>
}
```

#### 2. Get Attendees for Session
```typescript
// File: backend/convex/orientations/attendance.ts
orientations.getAttendeesForSession({
  orientationDate: number,    // Timestamp
  timeSlot: string,           // "9:00 AM - 10:00 AM"
  orientationVenue: string    // "Gaisano Ilustre"
})

// Returns:
Array<{
  applicationId: Id<"applications">,
  fullname: string,
  orientationStatus: "Scheduled" | "Completed" | "Missed",
  checkInTime?: number,
  checkOutTime?: number,
  qrCodeUrl: string
}>
```

#### 3. Check-In Mutation (Existing - Used by Scanner)
```typescript
// File: backend/convex/orientations/attendance.ts
orientations.checkIn({
  applicationId: Id<"applications">
})

// Returns:
{
  success: boolean,
  message: string,
  checkInTime?: number
}
```

#### 4. Check-Out Mutation (Existing - Used by Scanner)
```typescript
// File: backend/convex/orientations/attendance.ts
orientations.checkOut({
  applicationId: Id<"applications">
})

// Returns:
{
  success: boolean,
  message: string,
  checkOutTime?: number
}
```

### New Backend Query Needed

#### Get Inspector Scan History
```typescript
// File: backend/convex/orientations/attendance.ts (ADD THIS)
orientations.getInspectorScanHistory = query({
  args: {
    inspectorId: v.id("users"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    scanType: v.optional(v.union(v.literal("check-in"), v.literal("check-out"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Get all orientations within date range
    // 2. Filter by check-in/out performed by this inspector
    // 3. Join with application and user data
    // 4. Return chronological list
    
    // NOTE: This requires adding `checkedInBy` and `checkedOutBy` 
    // fields to orientations table to track which inspector performed the scan
  }
});
```

**Schema Change Required:**
```typescript
// backend/convex/schema.ts
orientations: defineTable({
  // ... existing fields
  checkedInBy: v.optional(v.id("users")),    // NEW: Inspector who checked in
  checkedOutBy: v.optional(v.id("users")),   // NEW: Inspector who checked out
})
```

---

## 📦 Implementation Phases

### Phase 1: Setup & Infrastructure (1 day)
**Objective:** Create folder structure and base types

**Tasks:**
- [ ] 1.1: Create `src/features/inspector/` folder structure
- [ ] 1.2: Create `src/features/inspector/lib/constants.ts`
- [ ] 1.3: Create `src/features/inspector/lib/types.ts`
- [ ] 1.4: Create `src/features/inspector/lib/utils.ts`
- [ ] 1.5: Create barrel exports (`index.ts` files)

**Deliverables:**
- ✅ Complete folder structure
- ✅ TypeScript types defined
- ✅ Constants file with status colors, labels

**Files Created:**
```
src/features/inspector/
├── components/
│   └── index.ts
├── hooks/
│   └── index.ts
├── lib/
│   ├── constants.ts
│   ├── types.ts
│   ├── utils.ts
│   └── index.ts
└── index.ts
```

---

### Phase 2: Dashboard Screen Enhancement (2 days)
**Objective:** Enhance existing dashboard with real data

**Tasks:**
- [ ] 2.1: Create `useInspectorDashboard` hook
- [ ] 2.2: Create `InspectorStats` component
- [ ] 2.3: Create `CurrentSessionCard` component
- [ ] 2.4: Update `InspectorDashboardScreen` with real data
- [ ] 2.5: Add green header to dashboard
- [ ] 2.6: Add navigation to new screens

**Deliverables:**
- ✅ Dashboard shows real-time stats
- ✅ Current session detection
- ✅ Navigation to sessions and scan history

**Testing:**
- Verify stats calculate correctly
- Test current session detection at different times
- Test navigation buttons

---

### Phase 3: Session List Screen (2 days)
**Objective:** Create screen to view sessions by date

**Tasks:**
- [ ] 3.1: Create `useOrientationSessions` hook
- [ ] 3.2: Create `SessionCard` component
- [ ] 3.3: Create `OrientationSessionsScreen`
- [ ] 3.4: Add green header to sessions screen
- [ ] 3.5: Add date picker functionality
- [ ] 3.6: Create route file `app/(screens)/(inspector)/sessions.tsx`

**Deliverables:**
- ✅ Session list with time slot breakdown
- ✅ Date picker to view any date
- ✅ Navigation to attendees screen

**Testing:**
- Test with different dates (past/future/empty)
- Test multiple time slots
- Test venue display (if it changes)

---

### Phase 4: Session Attendees Screen (2 days)
**Objective:** Create attendee list with real-time updates

**Tasks:**
- [ ] 4.1: Create `useSessionAttendees` hook with subscriptions
- [ ] 4.2: Create `AttendeeListItem` component
- [ ] 4.3: Create `AttendanceStatusBadge` component
- [ ] 4.4: Create `SessionAttendeesScreen`
- [ ] 4.5: Add green header with session details
- [ ] 4.6: Add search functionality
- [ ] 4.7: Add pull-to-refresh
- [ ] 4.8: Create route file `app/(screens)/(inspector)/attendees.tsx`

**Deliverables:**
- ✅ Attendee list with real-time updates
- ✅ Status badges with color coding
- ✅ Search by name
- ✅ Auto-refresh on scan

**Testing:**
- Test real-time updates (scan QR, verify list updates)
- Test search functionality
- Test pull-to-refresh
- Test with empty attendee list

---

### Phase 5: Scan History Screen (1-2 days)
**Objective:** Create scan log for inspectors

**Tasks:**
- [ ] 5.1: Create backend query `getInspectorScanHistory`
- [ ] 5.2: Add schema fields `checkedInBy`, `checkedOutBy`
- [ ] 5.3: Update check-in/out mutations to track inspector
- [ ] 5.4: Create `useScanHistory` hook
- [ ] 5.5: Create `ScanHistoryItem` component
- [ ] 5.6: Create `ScanHistoryScreen`
- [ ] 5.7: Add green header with filters
- [ ] 5.8: Add date range picker
- [ ] 5.9: Create route file `app/(screens)/(inspector)/scan-history.tsx`

**Deliverables:**
- ✅ Scan history with date filtering
- ✅ Grouped by date
- ✅ Export functionality (optional)

**Testing:**
- Test date filtering
- Test scan type filtering (check-in/out only)
- Test with large history (pagination)

---

### Phase 6: Integration & Navigation (1 day)
**Objective:** Wire up all screens with navigation

**Tasks:**
- [ ] 6.1: Update dashboard navigation to sessions
- [ ] 6.2: Add session card navigation to attendees
- [ ] 6.3: Add scan history link to dashboard header
- [ ] 6.4: Add quick scan buttons to all screens
- [ ] 6.5: Test deep linking and back navigation

**Deliverables:**
- ✅ All screens connected via navigation
- ✅ Quick scan accessible from anywhere
- ✅ Back buttons work correctly

**Testing:**
- Navigate through all screens
- Test back button behavior
- Test deep links with parameters

---

### Phase 7: Real-time Updates (1 day)
**Objective:** Implement Convex subscriptions for live data

**Tasks:**
- [ ] 7.1: Add Convex subscriptions to `useSessionAttendees`
- [ ] 7.2: Add optimistic updates to scan flow
- [ ] 7.3: Add auto-refresh to dashboard (every 30s)
- [ ] 7.4: Add loading states during updates

**Deliverables:**
- ✅ Attendee list updates in real-time
- ✅ Dashboard auto-refreshes
- ✅ Smooth optimistic UI updates

**Testing:**
- Scan QR on one device, verify another device updates
- Test multiple inspectors scanning simultaneously
- Test offline behavior

---

### Phase 8: Polish & UX Enhancements (1-2 days)
**Objective:** Add loading states, errors, empty states

**Tasks:**
- [ ] 8.1: Create loading skeleton components
- [ ] 8.2: Create error state components with retry
- [ ] 8.3: Create empty state components
- [ ] 8.4: Add search bar to attendees screen
- [ ] 8.5: Add fade-in animations
- [ ] 8.6: Add success/error toasts

**Deliverables:**
- ✅ Loading skeletons for all lists
- ✅ Error states with retry buttons
- ✅ Empty states with helpful messages
- ✅ Smooth animations

**Testing:**
- Test loading states
- Force errors and test retry
- Test empty states (no sessions, no attendees)

---

### Phase 9: Testing & Validation (1-2 days)
**Objective:** Comprehensive testing of all features

**Tasks:**
- [ ] 9.1: Test dashboard with today's sessions
- [ ] 9.2: Test session list with different dates
- [ ] 9.3: Test attendee list real-time updates
- [ ] 9.4: Test scan history filtering
- [ ] 9.5: Test navigation flows
- [ ] 9.6: Test error scenarios (offline, network errors)
- [ ] 9.7: Test on different devices/screen sizes

**Deliverables:**
- ✅ All features tested and working
- ✅ Bug list documented
- ✅ Fixes applied

**Test Cases:**
- Empty day (no sessions)
- Single session
- Multiple overlapping sessions
- All attendees checked in
- No attendees checked in
- Offline mode
- Network errors
- Invalid QR codes

---

### Phase 10: Documentation & Handoff (1 day)
**Objective:** Document implementation for future developers

**Tasks:**
- [ ] 10.1: Create `INSPECTOR_IMPLEMENTATION.md`
- [ ] 10.2: Update `UI_UX_HANDOFF.md` with screenshots
- [ ] 10.3: Update `AGENT_HANDOFF.md` with new features
- [ ] 10.4: Create component usage examples
- [ ] 10.5: Update README with inspector features

**Deliverables:**
- ✅ Complete documentation
- ✅ Code examples
- ✅ Screenshots of all screens

---

## 📊 Progress Tracker

### Overall Progress
```
Phase 1: Setup & Infrastructure        [ ] 0/5 tasks   (0%)
Phase 2: Dashboard Enhancement         [ ] 0/6 tasks   (0%)
Phase 3: Session List Screen           [ ] 0/6 tasks   (0%)
Phase 4: Session Attendees Screen      [ ] 0/8 tasks   (0%)
Phase 5: Scan History Screen           [ ] 0/9 tasks   (0%)
Phase 6: Integration & Navigation      [ ] 0/5 tasks   (0%)
Phase 7: Real-time Updates             [ ] 0/4 tasks   (0%)
Phase 8: Polish & UX Enhancements      [ ] 0/6 tasks   (0%)
Phase 9: Testing & Validation          [ ] 0/7 tasks   (0%)
Phase 10: Documentation & Handoff      [ ] 0/5 tasks   (0%)

Total: 0/61 tasks completed (0%)
```

### Timeline
```
Week 1:
  Day 1-2: Phase 1 (Setup) + Phase 2 (Dashboard)
  Day 3-4: Phase 3 (Session List)
  Day 5-6: Phase 4 (Attendees List)
  Day 7:   Phase 5 (Scan History)

Week 2:
  Day 8:   Phase 6 (Integration) + Phase 7 (Real-time)
  Day 9:   Phase 8 (Polish)
  Day 10:  Phase 9 (Testing) + Phase 10 (Documentation)
```

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] Inspector can view today's orientation sessions
- [ ] Inspector can view sessions for any date
- [ ] Inspector can see attendee list for each session
- [ ] Real-time status updates when QR codes are scanned
- [ ] Inspector can view their scan history
- [ ] Search attendees by name
- [ ] Filter scan history by date/type
- [ ] All screens follow UI/UX design standards
- [ ] Navigation works correctly between all screens

### Performance Requirements
- [ ] Dashboard loads in < 2 seconds
- [ ] Session list loads in < 2 seconds
- [ ] Attendee list updates in < 500ms after scan
- [ ] Smooth scrolling in all lists (60 FPS)
- [ ] App works offline (cached data)

### Quality Requirements
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] Follows FSD architecture
- [ ] Follows existing code patterns
- [ ] All components reusable
- [ ] Comprehensive error handling

---

## 🚧 Known Challenges & Solutions

### Challenge 1: Real-time Updates Across Devices
**Problem:** Multiple inspectors scanning simultaneously  
**Solution:** Use Convex's built-in subscriptions for real-time data sync

### Challenge 2: Scan History Storage
**Problem:** Need to track which inspector performed which scan  
**Solution:** Add `checkedInBy` and `checkedOutBy` fields to orientations table

### Challenge 3: Venue Flexibility
**Problem:** Currently single venue, but may change in future  
**Solution:** Make venue dynamic in all queries/displays

### Challenge 4: Time Zone Handling
**Problem:** Sessions scheduled in local time  
**Solution:** Always use timestamps, convert to local display time

---

## 📝 Notes

- **Inspector Role:** Only Yellow card (food handler) applicants require orientation
- **Backend Status:** ✅ All required queries already exist (except scan history)
- **QR Scanner:** ✅ Already fully implemented in `OrientationAttendanceScreen`
- **Design System:** ✅ All standards defined in `UI_UX_HANDOFF.md`
- **Architecture:** ✅ FSD structure already established

---

## 🔗 Related Documentation

- [UI/UX Handoff Document](./UI_UX_HANDOFF.md)
- [Agent Handoff Document](./AGENT_HANDOFF.md)
- [Orientation Attendance Handoff](./ORIENTATION_ATTENDANCE_HANDOFF.md)
- [FSD Architecture Guide](./FSD_ARCHITECTURE.md)
- [Header Standardization Guide](./HEADER_STANDARDIZATION.md)

---

**Last Updated:** January 23, 2025  
**Status:** 🔄 Ready to Start  
**Next Action:** Begin Phase 1 - Setup & Infrastructure
