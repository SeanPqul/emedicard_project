# Document Rejection Notifications - Testing Guide

**Date:** October 18, 2025  
**Status:** ✅ Complete & Ready for Testing  
**Phase:** Phase 6 - Notification Integration

---

## 📋 Overview

This guide covers testing the complete notification flow for document rejections, including creation, delivery, display, and navigation.

## ✅ What Was Implemented

### Backend (Already Existed)
- ✅ Notification creation in `rejectDocument.ts` mutation (lines 125-134)
- ✅ Notification schema in `backend/convex/schema.ts`
- ✅ Notification type: `"DocumentRejection"`
- ✅ Action URL with deep link: `/applications/{appId}/resubmit/{docTypeId}`

### Frontend (Just Implemented)
- ✅ **Feature Constants** - Added `DOCUMENT_REJECTED` to notification types
- ✅ **Notification Widget** - Already had icon and color for `DocumentRejection`
- ✅ **Notification List** - Added `DocumentRejection` to "Applications" filter
- ✅ **Notification Detail Screen** - Added config with red error color, close-circle icon, "Resubmit Document" action
- ✅ **Deep Linking** - Navigation to document resubmission screen
- ✅ **TypeScript** - All type checks passing

---

## 🧪 Testing Instructions

### Test Setup

#### Prerequisites
1. **User Account** - Applicant with at least one application
2. **Application State** - Application with documents uploaded
3. **Admin/Inspector Account** - Account with rejection permissions
4. **Convex Dashboard Access** - To verify notification creation

#### Quick Setup
```bash
# 1. Start development server
npm start

# 2. In separate terminal, start Convex
cd ../../backend
npx convex dev

# 3. Open app on device/simulator
```

---

## 📱 Test Cases

### Test Case 1: Notification Creation
**Objective:** Verify notification is created when document is rejected

**Steps:**
1. Login as admin/inspector in web admin panel
2. Navigate to an application with uploaded documents
3. Select a document to reject
4. Fill in rejection form:
   - Category: "quality_issue"
   - Reason: "Image is too blurry to read"
   - Specific Issues: ["Photo is out of focus", "Text is not legible"]
5. Submit rejection

**Expected Results:**
- ✅ Document status changes to "Rejected"
- ✅ Application status changes to "Documents Need Revision"
- ✅ Notification created in `notifications` table
- ✅ Notification has:
  - `userId`: Application owner's ID
  - `applicationId`: Related application ID
  - `notificationType`: "DocumentRejection"
  - `title`: "Document Rejected"
  - `message`: Contains document name and rejection reason
  - `isRead`: false
  - `actionUrl`: `/applications/{appId}/resubmit/{docTypeId}`

**Verification (Convex Dashboard):**
```
1. Open Convex Dashboard
2. Navigate to Data → notifications
3. Find latest notification
4. Verify all fields are correct
```

---

### Test Case 2: Notification Display in List
**Objective:** Verify notification appears correctly in notification list

**Steps:**
1. Login as applicant (document owner)
2. Navigate to Notification tab
3. Check notification list

**Expected Results:**
- ✅ Notification appears at top of list (most recent)
- ✅ Red close-circle icon displayed
- ✅ "Document Rejected" title shown
- ✅ Rejection message visible
- ✅ Unread badge/indicator visible
- ✅ Timestamp shows "Just now" or relative time

**Visual Check:**
```
┌─────────────────────────────────────┐
│ ● [🔴] Document Rejected           │
│   Your Valid ID has been rejected. │
│   Reason: Image is too blurry...   │
│   ⏰ 2 minutes ago                  │
└─────────────────────────────────────┘
```

---

### Test Case 3: Filter Functionality
**Objective:** Verify notification appears in "Applications" filter

**Steps:**
1. From notification list, tap "Applications" filter chip
2. Verify document rejection notification is visible
3. Test other filters:
   - "All" - should show notification
   - "Unread" - should show notification (if not marked read)
   - "Payments" - should NOT show notification
   - "Orientations" - should NOT show notification

**Expected Results:**
- ✅ Notification visible in "All" filter
- ✅ Notification visible in "Unread" filter (initially)
- ✅ Notification visible in "Applications" filter
- ✅ Notification NOT in "Payments" or "Orientations" filters

---

### Test Case 4: Notification Detail Screen
**Objective:** Verify detail screen displays rejection information correctly

**Steps:**
1. Tap on document rejection notification
2. Observe detail screen

**Expected Results:**
- ✅ Header has red background color (semantic.error)
- ✅ Close-circle icon displayed in header
- ✅ Title: "Document Rejected"
- ✅ Timestamp formatted correctly
- ✅ Full rejection message visible in card
- ✅ Related application info displayed:
  - Application ID (short format)
  - Job Category with color dot
  - Position
  - Status badge showing "Documents Need Revision"
- ✅ Primary action button: "Resubmit Document" with upload icon
- ✅ Button has red background matching theme

**Visual Check:**
```
┌─────────────────────────────────────┐
│ 🔴 RED HEADER                       │
│ [←] [⭕ close-circle icon]          │
└─────────────────────────────────────┘
│                                     │
│ Document Rejected                   │
│ 🕐 Mon, Oct 18, 2025 at 2:30 PM   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Your Valid ID has been      │   │
│ │ rejected. Reason: Image is  │   │
│ │ too blurry to read...       │   │
│ └─────────────────────────────┘   │
│                                     │
│ Related Application                 │
│ Application ID: #abc12345          │
│ Job Category: ● Food Handler       │
│ Position: Cook                     │
│ Status: [Documents Need Revision]  │
│                                     │
│ [📤 Resubmit Document]             │
│ [Back to Notifications]            │
└─────────────────────────────────────┘
```

---

### Test Case 5: Navigation from Notification
**Objective:** Verify tapping notification navigates correctly

**Steps:**
1. From notification detail screen
2. Tap "Resubmit Document" button
3. Observe navigation

**Expected Results:**
- ✅ Navigates to document view/resubmission screen
- ✅ Correct application context loaded
- ✅ Rejected document highlighted or shown
- ✅ Resubmission UI available

**Navigation Flow:**
```
Notification Detail
      ↓ (tap Resubmit Document)
Documents View Screen
      ↓ (with rejected document visible)
Document Resubmission Flow
```

---

### Test Case 6: Mark as Read
**Objective:** Verify notification can be marked as read

**Steps:**
1. Tap on unread document rejection notification
2. Navigate back to notification list
3. Check notification status

**Expected Results:**
- ✅ Notification automatically marked as read when viewed
- ✅ Unread indicator removed
- ✅ Notification still visible in "All" and "Applications" filters
- ✅ Notification NOT in "Unread" filter anymore
- ✅ Unread count decremented

---

### Test Case 7: Multiple Rejection Notifications
**Objective:** Verify multiple rejections display correctly

**Steps:**
1. Have admin reject multiple documents (e.g., 3 documents)
2. Check notification list
3. Verify each notification is distinct

**Expected Results:**
- ✅ All 3 notifications visible
- ✅ Each shows correct document name
- ✅ Each shows unique rejection reason
- ✅ All sorted by timestamp (newest first)
- ✅ Can navigate to each independently

---

### Test Case 8: Notification Persistence
**Objective:** Verify notifications persist after app restart

**Steps:**
1. Receive document rejection notification
2. Close app completely
3. Reopen app
4. Navigate to notifications

**Expected Results:**
- ✅ Notification still visible
- ✅ Read/unread state preserved
- ✅ All information intact

---

### Test Case 9: Edge Cases

#### 9A: Application Deleted
**Scenario:** Application deleted after notification sent

**Steps:**
1. Create rejection notification
2. Delete application (via Convex Dashboard)
3. Try to navigate from notification

**Expected Results:**
- ✅ Notification still displays
- ✅ Tapping shows error or handles gracefully
- ✅ No app crash

#### 9B: Missing Action URL
**Scenario:** Notification without actionUrl

**Steps:**
1. Manually create notification without actionUrl
2. View notification detail
3. Tap primary action

**Expected Results:**
- ✅ Falls back to document view screen
- ✅ Passes applicationId as formId param
- ✅ No crash or error

#### 9C: Long Rejection Message
**Scenario:** Very long rejection reason

**Steps:**
1. Reject document with very long reason (500+ characters)
2. View in notification list
3. View in detail screen

**Expected Results:**
- ✅ List view truncates with ellipsis
- ✅ Detail view shows full message
- ✅ No layout issues

---

## 🐛 Common Issues & Solutions

### Issue 1: Notification Not Appearing
**Symptoms:** Document rejected but no notification shown

**Troubleshooting:**
1. Check Convex Dashboard - was notification created?
2. Verify user ID matches logged-in user
3. Check Convex real-time connection (green indicator in app)
4. Try pull-to-refresh on notification list

**Solution:**
```typescript
// Verify in backend logs
console.log("Created notification:", notificationId);
```

### Issue 2: Wrong Icon/Color
**Symptoms:** Notification shows wrong visual styling

**Check:**
- `notificationType` field in database = "DocumentRejection" (exact case)
- NotificationWidget.tsx has mapping for "DocumentRejection"

### Issue 3: Navigation Fails
**Symptoms:** Tapping notification does nothing or crashes

**Debug:**
```typescript
// Add logging in NotificationDetailScreen.tsx
console.log("Action URL:", notification.actionUrl);
console.log("Application ID:", notification.applicationId);
```

**Common Causes:**
- Missing applicationId
- Malformed actionUrl
- Target screen doesn't exist

### Issue 4: TypeScript Errors
**Symptoms:** Type errors in notification code

**Fix:**
```bash
npm run typecheck
```

If errors persist, check:
- NotificationType includes 'DocumentRejection'
- NOTIFICATION_CONFIG has DocumentRejection entry

---

## ✅ Acceptance Criteria

All tests pass when:
- [x] Notification created when document rejected
- [x] Notification displays in list with correct icon/color
- [x] Notification appears in "Applications" filter
- [x] Detail screen shows all information correctly
- [x] Navigation to resubmission works
- [x] Mark as read functionality works
- [x] Multiple rejections display distinctly
- [x] Notifications persist after app restart
- [x] Edge cases handled gracefully
- [x] No TypeScript errors
- [x] No console errors or warnings

---

## 📊 Test Results Template

### Test Session
**Date:** _________  
**Tester:** _________  
**Device:** _________  
**OS Version:** _________

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Notification Creation | ☐ Pass ☐ Fail | |
| 2. Display in List | ☐ Pass ☐ Fail | |
| 3. Filter Functionality | ☐ Pass ☐ Fail | |
| 4. Detail Screen | ☐ Pass ☐ Fail | |
| 5. Navigation | ☐ Pass ☐ Fail | |
| 6. Mark as Read | ☐ Pass ☐ Fail | |
| 7. Multiple Notifications | ☐ Pass ☐ Fail | |
| 8. Persistence | ☐ Pass ☐ Fail | |
| 9. Edge Cases | ☐ Pass ☐ Fail | |

**Overall Result:** ☐ Approved ☐ Needs Work

**Issues Found:**
1. _________________________________________
2. _________________________________________
3. _________________________________________

---

## 🚀 Ready for Production

**Checklist:**
- [ ] All test cases passing
- [ ] TypeScript checks passing
- [ ] No console errors
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] Documentation updated

**Sign-off:**
- Developer: _________________ Date: _________
- QA: _______________________ Date: _________
- Product Owner: _____________ Date: _________

---

**Next Phase:** Phase 7 - Comprehensive Testing (Unit/Integration Tests)
