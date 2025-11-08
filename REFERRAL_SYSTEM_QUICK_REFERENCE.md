# Referral System Quick Reference Guide
## Phase 4 Migration: Medical Terminology Update

---

## 🎨 Color & Icon System

### Medical Referrals (Doctor Visit Required)
- **Color**: `#3B82F6` (Blue)
- **Icon**: `medkit-outline`
- **Badge Text**: "Medical Referral"
- **Message**: "Medical consultation required"

### Document Issues (Resubmission Needed)
- **Color**: `#F59E0B` (Orange)
- **Icon**: `document-text-outline`
- **Badge Text**: "Docs Needed" / "Needs Revision"
- **Message**: "Document needs correction"

### Legacy Rejection (DEPRECATED)
- **Color**: `#DC2626` (Red)
- **Icon**: `alert-circle-outline`
- **Badge Text**: "Rejected"
- **Message**: "Document rejected"

---

## 📋 Status Types

### New Application Statuses
```typescript
'Documents Need Revision' // Non-medical document issues
'Referred for Medical Management' // Medical findings requiring doctor
```

### New Notification Types
```typescript
'DocumentReferredMedical' // Medical finding notification
'DocumentIssueFlagged' // Document issue notification
'MedicalReferralResubmission' // After doctor visit
'DocumentResubmission' // After fixing docs
```

---

## 🔧 Code Patterns

### 1. Check Status Type
```typescript
import { isMedicalReferralStatus, isDocumentIssueStatus } from '@entities/application';

if (isMedicalReferralStatus(application.status)) {
  // Show doctor info, blue theme
}

if (isDocumentIssueStatus(application.status)) {
  // Show resubmit button, orange theme
}
```

### 2. Get Status Configuration
```typescript
import { getStatusConfig } from '@entities/application';

const config = getStatusConfig(application.status);
// Returns: { label, color, icon, description, category, isActionRequired, ... }
```

### 3. Use Referral Counts Hook
```typescript
import { useReferredDocumentsCount } from '@features/document-rejection/hooks';

const { totalIssues, medicalReferrals, documentIssues } = useReferredDocumentsCount(userId);
```

### 4. Display Status Badge
```typescript
const statusColor = ApplicationStatusColors[application.status];
const statusIcon = ApplicationStatusIcons[application.status];
const statusLabel = ApplicationStatusLabels[application.status];
```

---

## 🧩 Component Updates

### Dashboard Widget
```typescript
// OLD
const { count: rejectedDocumentsCount } = useRejectedDocumentsCount(userId);

// NEW
const { totalIssues, medicalReferrals, documentIssues } = useReferredDocumentsCount(userId);
```

### ActionCenter
```typescript
// NEW Props
<ActionCenter
  medicalReferralsCount={medicalReferrals}
  documentIssuesCount={documentIssues}
  rejectedDocumentsCount={totalIssues} // Backward compat
/>
```

### Status Display
```typescript
// Medical Referral
{status === 'Referred for Medical Management' && (
  <Text style={{ color: '#3B82F6' }}>
    📋 Medical referral - see doctor for clearance
  </Text>
)}

// Document Issue
{status === 'Documents Need Revision' && (
  <Text style={{ color: '#F59E0B' }}>
    {count} document(s) need correction
  </Text>
)}
```

---

## 🛣️ Routing Patterns

### Medical Referral Navigation
```typescript
router.push(`/(screens)/(shared)/documents/referral-history?formId=${appId}&type=medical`);
```

### Document Issue Navigation
```typescript
router.push(`/(screens)/(shared)/documents/referral-history?formId=${appId}&type=document`);
```

### Legacy Rejection (Backward Compat)
```typescript
router.push(`/(screens)/(shared)/documents/view-document?formId=${appId}&openRejected=true`);
```

---

## ✅ Backward Compatibility Checklist

When updating components:
- [ ] Keep legacy prop names with DEPRECATED comment
- [ ] Support both old and new notification types
- [ ] Handle both old and new status values
- [ ] Provide fallbacks for missing data
- [ ] Mark old code paths as DEPRECATED in comments

---

## 🚫 What NOT to Do

❌ **Don't remove** old notification types yet  
❌ **Don't break** existing rejection flows  
❌ **Don't change** prop names without adding new ones first  
❌ **Don't use** "rejected" in NEW UI text  
❌ **Don't forget** to test with legacy data  

---

## ✅ What TO Do

✅ **Add** new status types alongside old ones  
✅ **Use** proper medical terminology in new code  
✅ **Separate** medical referrals from document issues  
✅ **Mark** deprecated code with comments  
✅ **Test** both old and new flows  

---

## 📝 File Naming Convention

### Old (DEPRECATED)
- `DocumentRejectionWidget`
- `useRejectionHistory`
- `rejection-history.tsx`

### New (Preferred)
- `DocumentReferralWidget`
- `useReferralHistory`
- `referral-history.tsx`

**Note**: Keep old files for backward compatibility during transition!

---

## 🎯 Testing Scenarios

### Test Case 1: Medical Referral Flow
1. Admin refers document WITH doctor name
2. User sees blue "Medical Referral" badge
3. User navigates to referral history
4. User sees doctor information
5. Status shows "Referred for Medical Management"

### Test Case 2: Document Issue Flow
1. Admin flags document WITHOUT doctor name
2. User sees orange "Docs Needed" badge
3. User navigates to referral history
4. User sees issue list and resubmit button
5. Status shows "Documents Need Revision"

### Test Case 3: Legacy Support
1. Old rejection data still exists
2. User sees red "Rejected" badge (deprecated)
3. Old rejection flow still works
4. No errors or crashes

---

## 📚 Import Paths

```typescript
// Application constants
import {
  ApplicationStatusLabels,
  ApplicationStatusColors,
  ApplicationStatusIcons,
  getStatusConfig,
  isMedicalReferralStatus,
  isDocumentIssueStatus,
} from '@entities/application';

// Notification types
import { NOTIFICATION_TYPES } from '@features/notification/constants';
import type { NotificationType } from '@entities/notification';

// Hooks
import { useReferredDocumentsCount } from '@features/document-rejection/hooks';
import { useReferralHistory } from '@features/document-rejection/hooks';
import { useDocumentReferralDetails } from '@features/document-rejection/hooks';
```

---

## 🔍 Common Pitfalls

### Pitfall 1: Using Wrong Color
```typescript
// ❌ WRONG
<Badge color="#DC2626">Medical Referral</Badge>

// ✅ CORRECT
<Badge color="#3B82F6">Medical Referral</Badge>
```

### Pitfall 2: Wrong Status Check
```typescript
// ❌ WRONG (old way)
if (status === 'Rejected') { /* ... */ }

// ✅ CORRECT (new way)
if (isMedicalReferralStatus(status)) { /* ... */ }
```

### Pitfall 3: Single Action Item
```typescript
// ❌ WRONG (combining both types)
<ActionItem>X Documents Need Attention</ActionItem>

// ✅ CORRECT (separate items)
<ActionItem>Medical Consultation Required</ActionItem>
<ActionItem>X Documents Need Revision</ActionItem>
```

---

**Quick Reference v1.0 - Updated 2025-11-08**
