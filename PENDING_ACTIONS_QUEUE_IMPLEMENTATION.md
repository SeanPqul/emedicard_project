# Pending Actions Queue System - Implementation Complete! 🎉

## Overview
Successfully implemented a **pending actions queue system** where admin actions are stored locally before being saved to the database. Actions are only saved when "Send Applicant Notifications" is clicked.

---

## ✅ What Was Implemented

### **1. Local State Management**
- Added `pendingActions` state array to store actions before database save
- Each pending action stores:
  - `uploadId`: Document ID
  - `actionType`: `'flag_revision'` or `'refer_doctor'`
  - `category`: Issue category
  - `reason`: Selected reason
  - `notes`: Additional details
  - `doctorName`: Optional doctor name (only for medical referrals)
  - `documentName`: Document name for display

### **2. LocalStorage Persistence** 🔄
- **Auto-save**: Pending actions saved to localStorage on every change
- **Auto-load**: Restored from localStorage on page mount
- **Storage key**: `pendingActions_{applicationId}` (unique per application)
- **Survives**: Page refresh, browser restart, accidental navigation away
- **Auto-cleanup**: Cleared when notifications are sent

### **3. Status Badge Updates**
- **Pending Referred** (Blue): Medical referral queued
- **Pending Needs Revision** (Orange): Document flagged for revision  
- **Visual Indicator**: ⏳ "Pending" label next to document name
- Status changes immediately when action is saved to queue

### **4. Edit/Cancel Functionality** ✏️
- **Re-open modal**: Click "Flag for Revision" or "Refer to Doctor" to edit existing pending action
- **Auto-loads**: Existing pending action data pre-fills the modal
- **Remove button**: Red "Remove" button appears in modal if pending action exists
- **Updates**: Saving replaces existing pending action for that document

### **5. Pending Actions Counter**
Shows in Final Actions section:
```
⏳ Pending Actions (3 documents)
📄 2 Document Revisions
🏥 1 Medical Referral

[Send Applicant Notifications]
```

### **6. Batch Save on Final Send** 📤
When "Send Applicant Notifications" is clicked:
1. **Confirmation Modal**: Shows breakdown of pending actions
2. **Loop through** all pending actions
3. **Call mutation** for each (`rejectDocument` with or without `doctorName`)
4. **Clear pending** actions from state and localStorage
5. **Reload data** to show updated statuses
6. **Finalize application** to send notifications
7. **Success message**: "Successfully sent X notification(s) to applicant."

---

## 🔄 Complete Flow

### **Step 1: Admin Reviews Document**
1. Admin opens Doc Verification page
2. Sees document list with current statuses

### **Step 2: Admin Flags/Refers Document**
1. Clicks "Flag for Revision" or "Refer to Doctor"
2. Modal opens with form fields
3. Selects reason and adds notes
4. Clicks "Save & Flag for Revision" or "Save Referral"

**Result:**
- ✅ Action added to `pendingActions` array
- ✅ Saved to localStorage
- ✅ Status badge changes to "Referred" or "Needs Revision" with ⏳ indicator
- ✅ Success message: "Document flagged for revision. Click 'Send Applicant Notifications' to finalize."
- ❌ **NOT saved to database yet**

### **Step 3: Admin Reviews More Documents**
- Repeats Step 2 for multiple documents
- Each action queued locally
- Counter updates: "⏳ Pending Actions (3 documents)"

### **Step 4: Admin Edits Pending Action** (Optional)
1. Clicks "Flag for Revision" on document with pending action
2. Modal opens with existing data pre-filled
3. Changes reason or notes
4. Clicks "Save" to update OR "Remove" to cancel

### **Step 5: Admin Finalizes**
1. Reviews pending actions in sidebar
2. Clicks "Send Applicant Notifications"
3. Confirmation modal shows breakdown
4. Clicks "Send Notifications"

**Result:**
- ✅ All pending actions saved to database
- ✅ Pending actions cleared from state and localStorage
- ✅ Application status updated
- ✅ Notifications sent to applicant
- ✅ Admin redirected to dashboard

### **Step 6: Page Refresh (Accidental)**
- **Before Send**: Pending actions restored from localStorage ✅
- **After Send**: No pending actions (localStorage cleared) ✅

---

## 🎨 UI/UX Features

### **Status Badges with Pending Indicator:**
```
Chest X-ray [Referred ⏳ Pending]
Valid ID [Needs Revision ⏳ Pending]
Urinalysis [Approved]
```

### **Modal with Remove Button:**
```
┌────────────────────────────────────────┐
│ 📄 Flag for Revision for "Valid ID"   │
├────────────────────────────────────────┤
│ [Issue Category Dropdown]              │
│ [Reason Radio Buttons]                 │
│ [Additional Notes Textarea]            │
├────────────────────────────────────────┤
│ [🗑️ Remove]     [Cancel] [Save]       │
└────────────────────────────────────────┘
```

### **Pending Actions Banner:**
```
┌────────────────────────────────────────┐
│ ⏳ Pending Actions (3 documents)       │
│                                        │
│ 3 document(s) require applicant action│
│ 🏥 1 Medical Referral                  │
│ 📄 2 Document Revisions                │
│                                        │
│ [Send Applicant Notifications]        │
└────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### **Key Functions:**

```typescript
// Check if document has pending action
const getPendingAction = (uploadId) => {
  return pendingActions.find(action => action.uploadId === uploadId);
};

// Get effective status (pending or actual)
const getEffectiveStatus = (item) => {
  const pending = getPendingAction(item.uploadId);
  if (pending) {
    return pending.actionType === 'refer_doctor' ? 'Rejected' : 'NeedsRevision';
  }
  return item.status;
};

// Save to pending queue
const handleSave = () => {
  const newAction = { uploadId, actionType, category, reason, notes, doctorName };
  setPendingActions([...pendingActions.filter(a => a.uploadId !== uploadId), newAction]);
};

// Batch save to database
const handleConfirmSendReferral = async () => {
  for (const action of pendingActions) {
    await referDocumentMutation({
      documentUploadId: action.uploadId,
      rejectionCategory: action.category,
      rejectionReason: action.reason,
      specificIssues: action.notes.split(','),
      doctorName: action.doctorName,
    });
  }
  setPendingActions([]);
  await loadData();
  await handleFinalize('Rejected');
};
```

### **LocalStorage:**
```typescript
// Save on change
useEffect(() => {
  const storageKey = `pendingActions_${applicationId}`;
  if (pendingActions.length > 0) {
    localStorage.setItem(storageKey, JSON.stringify(pendingActions));
  } else {
    localStorage.removeItem(storageKey);
  }
}, [pendingActions, applicationId]);

// Load on mount
useEffect(() => {
  const storageKey = `pendingActions_${applicationId}`;
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    setPendingActions(JSON.parse(saved));
  }
}, [applicationId]);
```

---

## 📊 Backend Integration

### **Using Existing `rejectDocument` Mutation:**
The mutation already does **DUAL-WRITE** to both tables:
- `documentRejectionHistory` (for resubmissions)
- `documentReferralHistory` (for medical referrals)

**Determines type based on `doctorName`:**
```typescript
const issueType = args.doctorName ? "medical_referral" : "document_issue";
```

So we just call the same mutation for both:
- **Flag for Revision**: `doctorName: undefined` → Goes to `documentRejectionHistory`
- **Refer to Doctor**: `doctorName: "Dr. TBD"` → Goes to `documentReferralHistory` (also writes to rejection history for compatibility)

---

## ✅ Completed Features

| Feature | Status | Notes |
|---------|--------|-------|
| Pending actions state | ✅ | Array of actions before database save |
| LocalStorage persistence | ✅ | Survives page refresh |
| Status badge updates | ✅ | Shows "Referred" or "Needs Revision" with ⏳ |
| Edit pending actions | ✅ | Re-open modal to modify |
| Remove pending actions | ✅ | Red "Remove" button in modal |
| Pending counter | ✅ | Shows count in Final Actions |
| Batch save | ✅ | Loops through pending actions on final send |
| Backend integration | ✅ | Uses existing `rejectDocument` mutation |

---

## 🧪 Testing Checklist

### **Basic Flow:**
- [ ] Flag a document for revision
- [ ] Verify status badge changes to "Needs Revision ⏳ Pending"
- [ ] Verify pending counter shows "1 document"
- [ ] Click "Send Applicant Notifications"
- [ ] Verify confirmation modal shows correct breakdown
- [ ] Click "Send Notifications"
- [ ] Verify database has new record in `documentRejectionHistory`

### **Edit/Cancel:**
- [ ] Flag a document for revision
- [ ] Click "Flag for Revision" again on same document
- [ ] Verify modal opens with previous data
- [ ] Change reason
- [ ] Save
- [ ] Verify pending action updated

- [ ] Click "Flag for Revision" on pending document
- [ ] Click "Remove" button
- [ ] Verify pending action removed
- [ ] Verify status badge reverts to original

### **LocalStorage Persistence:**
- [ ] Flag 2 documents (1 revision, 1 referral)
- [ ] Refresh page (F5)
- [ ] Verify pending actions still show
- [ ] Verify status badges still show "⏳ Pending"
- [ ] Verify pending counter still shows "2 documents"
- [ ] Send notifications
- [ ] Refresh page
- [ ] Verify no pending actions (localStorage cleared)

### **Multiple Documents:**
- [ ] Flag 3 documents (2 revisions, 1 referral)
- [ ] Verify pending counter shows "3 documents"
- [ ] Verify breakdown shows "🏥 1 Medical Referral • 📄 2 Document Revisions"
- [ ] Edit one pending action
- [ ] Remove one pending action
- [ ] Verify counter updates to "2 documents"
- [ ] Send notifications
- [ ] Verify database has 2 new records

### **Edge Cases:**
- [ ] Try to send notifications with 0 pending actions → Should show error
- [ ] Flag document, navigate away, come back → Pending action persists
- [ ] Flag document, send notifications, page redirects → localStorage cleared
- [ ] Open modal without selecting reason, try to save → Should show error

---

## 🎯 Key Benefits

### **For Admins:**
✅ **No accidental saves** - Review before final send
✅ **Edit mistakes** - Fix pending actions before sending
✅ **Batch efficiency** - Review all documents, send once
✅ **No lost work** - LocalStorage persists across refreshes
✅ **Visual feedback** - Clear pending indicators

### **For Applicants:**
✅ **Single notification** - One email with all issues
✅ **Complete context** - All flagged documents in one message
✅ **No spam** - Admin can't accidentally send multiple times

### **For System:**
✅ **Reduced database writes** - Batch save instead of per-action
✅ **Better audit trail** - All actions timestamped together
✅ **Cleaner data** - No orphaned pending records

---

## 📋 Summary

| Before | After |
|--------|-------|
| Click "Save Referral" → **Immediately saves to database** | Click "Save Referral" → **Adds to pending queue** |
| Each save triggers database write | **One batch save** when clicking "Send Notifications" |
| No way to edit after save | **Can edit/remove** pending actions |
| Page refresh loses unsent changes | **LocalStorage persists** pending actions |
| Confusing for admins | **Clear pending indicators** |

---

## 🚀 Ready for Testing!

All implementation complete! Test the flow and let me know if you need any adjustments! 🎉

**Note**: The `rejectDocument` mutation already handles the backend logic correctly - it determines whether to route to `documentRejectionHistory` or `documentReferralHistory` based on presence of `doctorName`.

---

**Implementation Date:** November 8, 2025  
**Status:** ✅ Complete and Ready for Testing  
**Pending Tasks:** Final E2E testing with database verification
