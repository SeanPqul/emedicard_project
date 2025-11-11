# Mobile UI & Grammar Improvements - Max Attempts Feature
**Date:** November 10, 2025  
**Developer:** Web Admin Team  
**Target:** Mobile App Developer  
**Status:** 📋 Pending Implementation

---

## 📋 Overview

This document outlines UI and grammar improvements needed on the **mobile side** to align with the updated terminology and messaging for the max attempts feature. These changes improve clarity, professionalism, and user experience when applicants reach the maximum document resubmission limit.

**Context:** When applicants reach 3 failed document resubmission attempts, the system now uses **"Onsite Verification Required"** instead of **"Manual Review Required"** to better communicate the required action.

---

## 🎯 Changes Required

### 1. **Terminology Updates**

| **Old Term** | **New Term** | **Reason** |
|---|---|---|
| "Manual Review Required" | "Onsite Verification Required" | More specific and actionable |
| "Max attempts (4)" | "Max attempts (3)" | Correct count - 3 attempts allowed |
| "visit our office" | "visit the City Health Office" | Specific location |
| 🔒 (Lock icon) | ⚠️ (Warning icon) | Less punitive, more informative |

---

### 2. **File: ViewDocumentsScreen.tsx**

**Location:** `apps/mobile/src/screens/shared/ViewDocumentsScreen/ViewDocumentsScreen.tsx`

#### **Change 1: Document Status Display**

**Current Code (Estimated line ~150-200):**
```tsx
case 'ManualReviewRequired':
  color: '#DC2626' (Red)
  icon: 'alert-circle'
  label: 'Manual Review Required'
```

**Updated Code:**
```tsx
case 'ManualReviewRequired':
  color: '#DC2626' (Red)
  icon: 'alert-triangle' // Changed from alert-circle
  label: 'Onsite Verification Required' // Changed terminology
```

---

#### **Change 2: Application Status Message**

**Current Message (Estimated line ~250-300):**
```tsx
"Please visit our office with your original documents for 
in-person verification. Check Help Center for venue details."
```

**Updated Message:**
```tsx
"Your document requires in-person verification at the City Health Office. 
Please visit with your original documents. See details below."
```

---

#### **Change 3: Document Card Display - Max Attempts Alert**

**Current Display:**
```tsx
┌─────────────────────────────────────┐
│ 🏠 Visit Office for Verification   │
│                                     │
│ Max attempts reached. Please visit │
│ our office with your original      │
│ documents. Check Help Center for   │
│ venue location.                    │
└─────────────────────────────────────┘
```

**Updated Display:**
```tsx
┌──────────────────────────────────────────────────────┐
│ ⚠️ Onsite Verification Required                      │
│                                                       │
│ You've reached the maximum resubmission limit        │
│ (3 attempts) for this document.                      │
│                                                       │
│ 📍 Please visit the City Health Office:              │
│                                                       │
│ 🏥 City Health Office                                │
│    Magsaysay Park Complex, Door 7                    │
│    Davao City                                        │
│                                                       │
│ 🕐 Office Hours:                                      │
│    Monday-Friday, 8:00 AM - 5:00 PM                  │
│                                                       │
│ 📋 What to Bring:                                     │
│    • Original [Document Name]                        │
│    • Valid Government ID                             │
│    • This Application (Screenshot)                   │
│                                                       │
│ 💡 Our staff will verify in person and may approve   │
│    your application on the spot.                     │
│                                                       │
│ 📞 For appointment scheduling: 0926-686-1531          │
└──────────────────────────────────────────────────────┘
```

---

#### **Change 4: Status Badge Color & Icon**

**Current Badge:**
```tsx
<View style={{
  backgroundColor: '#FEE2E2', // Red background
  borderColor: '#DC2626',
}}>
  <Icon name="lock" /> {/* Lock icon */}
  <Text>Manual Review Required</Text>
</View>
```

**Updated Badge:**
```tsx
<View style={{
  backgroundColor: '#FEF3C7', // Yellow/Amber background (less harsh)
  borderColor: '#F59E0B',
}}>
  <Icon name="alert-triangle" /> {/* Warning triangle icon */}
  <Text>Onsite Verification Required</Text>
</View>
```

**Color Reasoning:**
- Red = "Rejected/Error" (too harsh)
- Yellow/Amber = "Action Required" (more appropriate)

---

### 3. **File: DocumentRejectionWidget.tsx**

**Location:** `apps/mobile/src/features/document-rejection/DocumentRejectionWidget.tsx`

#### **Change: Max Attempts Notification Display**

**Current Text (Estimated line ~100-150):**
```tsx
"Maximum attempts reached. Please visit venue for verification."
```

**Updated Text:**
```tsx
"Maximum resubmission attempts reached (3 attempts). 
In-person verification is now required at the City Health Office."
```

---

### 4. **File: DocumentRejectionHistoryWidget.tsx**

**Location:** `apps/mobile/src/features/document-rejection/DocumentRejectionHistoryWidget.tsx`

#### **Change: History Entry Label**

**Current Label:**
```tsx
"Manual Review" or "Max Attempts"
```

**Updated Label:**
```tsx
"Onsite Verification Required"
```

---

### 5. **Notification Messages (Mobile Push/In-App)**

**File:** Any notification handling files (likely in `notifications/` or similar)

#### **Current Notification:**
```
⚠️ Manual Verification Required - Maximum Attempts Reached

You have reached the maximum number of resubmission attempts (4) 
for [Document Name].

Please visit our office for in-person verification.
Check Help Center for venue location and office hours.
```

#### **Updated Notification:**
```
⚠️ Onsite Verification Required - Maximum Attempts Reached

Your [Document Name] requires in-person verification after 3 
unsuccessful resubmissions.

📍 Please visit the City Health Office for verification:

🏥 Venue: City Health Office, Magsaysay Park Complex, Door 7, Davao City
🕐 Office Hours: Monday-Friday, 8:00 AM - 5:00 PM

📋 What to Bring: Original [Document Name]

💡 Our staff will verify your documents in person and may approve 
your application on the spot if everything is in order.

For appointment scheduling, contact: 0926-686-1531
```

---

## 🎨 Visual Improvements Summary

### **Color Palette Changes**

| Element | Old Color | New Color | Hex |
|---|---|---|---|
| Badge Background | Red (#FEE2E2) | Amber (#FEF3C7) | Less harsh |
| Badge Border | Red (#DC2626) | Amber (#F59E0B) | Warmer tone |
| Icon Color | Red | Amber | Matches new theme |

### **Icon Changes**

| Element | Old Icon | New Icon | Library |
|---|---|---|---|
| Status Badge | `lock` 🔒 | `alert-triangle` ⚠️ | react-native-vector-icons |
| Document Card | `alert-circle` | `alert-triangle` | Ionicons |

---

## 🔧 Implementation Guidelines

### **Step 1: Search & Replace**

Use global search in the mobile codebase:

1. **Search:** `"Manual Review Required"`  
   **Replace:** `"Onsite Verification Required"`

2. **Search:** `"Max attempts (4)"`  
   **Replace:** `"Max attempts (3)"`

3. **Search:** `"visit our office"`  
   **Replace:** `"visit the City Health Office"`

4. **Search:** `icon: 'lock'` (in ManualReviewRequired context)  
   **Replace:** `icon: 'alert-triangle'`

### **Step 2: Update Venue Information**

Ensure all instances display complete venue info:
```
City Health Office
Magsaysay Park Complex, Door 7
Davao City

Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
Contact: 0926-686-1531
```

### **Step 3: Test Scenarios**

1. **Test with 3 attempts:**
   - Upload document
   - Get rejected 3 times
   - Verify "Onsite Verification Required" shows on 4th attempt
   - Check notification message is correct

2. **Test UI:**
   - Verify amber/yellow color (not red)
   - Verify warning triangle icon (not lock)
   - Verify complete venue info displays

3. **Test messaging:**
   - Check "3 attempts" (not 4)
   - Check specific office name
   - Check contact info present

---

## 📂 Expected Files to Modify

Based on codebase structure analysis:

1. ✅ `ViewDocumentsScreen.tsx` - Main document view
2. ✅ `DocumentRejectionWidget.tsx` - Rejection display
3. ✅ `DocumentRejectionHistoryWidget.tsx` - History view
4. ⚠️ `NotificationHandler.tsx` (if exists) - Push notifications
5. ⚠️ Any status mapping utilities - Status label mapping

---

## 🚨 Important Notes

### **Do NOT Change:**
- ❌ Backend status value: `"ManualReviewRequired"` (keep as-is)
- ❌ Database field names
- ❌ API response structure

### **ONLY Change:**
- ✅ Display labels (user-facing text)
- ✅ UI colors and icons
- ✅ Notification messages
- ✅ Helper text and instructions

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] Badge shows "Onsite Verification Required" (not "Manual Review")
- [ ] Badge color is amber/yellow (not red)
- [ ] Icon is warning triangle ⚠️ (not lock 🔒)
- [ ] Message says "3 attempts" (not 4)
- [ ] Venue address is complete and correct
- [ ] Office hours are displayed
- [ ] Contact number (0926-686-1531) is present
- [ ] Application ID is visible/accessible for venue staff
- [ ] Notifications use new terminology
- [ ] No broken UI elements after changes

---

## 🔗 Related Backend Changes (Already Implemented)

For context, the following backend changes were already made:

1. **File:** `backend/convex/admin/documents/referDocument.ts`
   - Line 262: Updated admin remarks message
   - Line 276: Changed application status to "Onsite Verification Required"
   - Line 353-356: Updated notification messages

2. **File:** `apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx`
   - Line 1306: Changed badge text from "🔒 Manual Review" to "⚠️ Onsite Verification"

---

## 📞 Questions?

If you need clarification on any of these changes, contact the web admin team or check the backend changes in:
- `referDocument.ts` (Lines 254-356)
- `doc_verif/page.tsx` (Lines 1298-1311)

---

**End of Document**
