# Maximum Rejection Attempts System

## Overview
This system prevents applicants from submitting invalid documents/payments indefinitely by enforcing attempt limits and providing progressive warnings.

---

## 📋 Configuration

### Location
`backend/convex/config/rejectionLimits.ts`

### Default Settings
```typescript
DOCUMENTS: {
  MAX_ATTEMPTS: 3,              // Maximum attempts per document type
  WARNING_THRESHOLD: 2,         // Show warning at attempt 2
  FINAL_ATTEMPT_WARNING: 3      // Final attempt at 3
}

PAYMENTS: {
  MAX_ATTEMPTS: 3,              // Maximum payment attempts
  WARNING_THRESHOLD: 2,         // Show warning at attempt 2
  FINAL_ATTEMPT_WARNING: 3      // Final attempt at 3
}

BEHAVIOR: {
  AUTO_LOCK_APPLICATION: true,  // Lock app after max attempts
  ALLOW_ADMIN_OVERRIDE: true,   // Admins can unlock
  NOTIFY_SUPPORT_TEAM: true,    // Notify when max reached
  GRACE_PERIOD_HOURS: 48        // 48 hours for manual review
}
```

---

## 🔔 Notification Flow

### For Applicants

#### **Attempt 1** (Normal)
```
Title: Document Rejected
Message: Your [Document Name] has been rejected.

Reason: [Rejection Reason]

Specific Issues:
• Issue 1
• Issue 2

This is attempt 1 of 3.
```

#### **Attempt 2** (Warning)
```
Title: Document Rejected
Message: ⚠️ Your [Document Name] has been rejected.

Reason: [Rejection Reason]

Attempts: 2 of 3

⚠️ Warning: You have 1 attempt(s) remaining. Please review carefully before resubmitting.
```

#### **Attempt 3** (Final Warning)
```
Title: ⚠️ Final Attempt Warning
Message: 🚨 FINAL ATTEMPT: This is your last chance to submit [Document Name] correctly.

Reason for rejection: [Rejection Reason]

Attempts: 3 of 3

Please review the requirements carefully before resubmitting. If you need help, contact our support team.
```

#### **After Max Attempts Reached** (Locked)
```
Title: 🚨 Maximum Attempts Reached
Message: You have reached the maximum number of attempts (3) for [Document Name].

Your application has been locked and will be reviewed by our support team.

Last Rejection Reason: [Reason]

Our team will contact you within 48 hours. You may also contact support for immediate assistance.
```

---

### For Admins

#### **Max Attempts Alert**
```
Title: ⚠️ Max Attempts Reached - [Applicant Name]
Message: [Applicant Name] has reached maximum attempts (3) for [Document Name]. 
Application is locked and requires manual review.

Action URL: /dashboard/[applicationId]/doc_verif
```

---

## 🔒 Application Locking

### When Max Attempts Reached
1. **Application Status** → `"Locked - Max Attempts"`
2. **Admin Remarks** → Records which document/payment caused lock
3. **All admins** managing the category are notified
4. **Applicant** receives critical notification
5. **Resubmission** is blocked until admin review

### Application Status Values
- `"Locked - Max Attempts"` - Locked due to max rejections
- `"Under Review"` - Normal rejection, can resubmit

---

## 🎯 Where Notifications Are Sent

### 1. **Document Rejection**
**File:** `backend/convex/admin/documents/rejectDocument.ts`
**When:** Admin rejects a document
**Sends to:**
- ✅ Applicant (with attempt warning)
- ✅ All admins (if max attempts reached)

### 2. **Payment Rejection**
**File:** `backend/convex/admin/payments/rejectPayment.ts`
**When:** Admin rejects a payment
**Sends to:**
- ✅ Applicant (with attempt warning)
- ✅ All admins (if max attempts reached)
- ✅ Other admins managing category (for info)

---

## 📊 API Response

### Document/Payment Rejection Returns
```typescript
{
  success: true,
  rejectionId: string,
  attemptNumber: number,
  maxAttemptsReached: boolean,        // NEW
  isFinalAttempt: boolean,            // NEW
  remainingAttempts: number,          // NEW
  message: string
}
```

**Frontend can use this to:**
- Show warning badges
- Display remaining attempts
- Block resubmission if maxAttemptsReached
- Show special UI for final attempts

---

## 🛠️ Admin Override Feature

### Future Implementation
Admins should be able to:
1. **View locked applications** in a special queue
2. **Unlock application** with reason
3. **Reset attempt counter** for specific document
4. **Approve with notes** despite issues
5. **Contact applicant** directly from system

### Suggested Admin Actions
```typescript
// Dashboard actions for locked applications
[ 🔓 Unlock Application ]
[ ✅ Override & Approve ]
[ 📧 Contact Applicant ]
[ ❌ Permanently Reject ]
```

---

## 🎨 UI Recommendations

### Mobile App (Applicant)

#### Before Resubmission
```typescript
// Check if max attempts reached before allowing resubmission
const canResubmit = !maxAttemptsReached && remainingAttempts > 0;

if (!canResubmit) {
  // Show locked message
  // Display support contact info
  // Block upload UI
}
```

#### Warning Displays
```
[Attempt 1] → Normal rejection message
[Attempt 2] → ⚠️ Yellow warning banner + 1 attempt left
[Attempt 3] → 🚨 Red critical banner + FINAL ATTEMPT
[Locked]    → 🔒 Full screen lock message + support contact
```

### Admin Dashboard

#### Rejection History Display
```typescript
{
  attemptNumber: 3,
  maxReached: true,
  status: "🔴 Locked"
}
```

#### Application Status Badge
```
Normal:  🟢 Under Review
Warning: 🟡 2 of 3 Attempts
Locked:  🔴 Max Attempts - Locked
```

---

## 🔄 Testing Scenarios

### Test Case 1: Document Max Attempts
1. Submit document → Reject (Attempt 1)
2. Resubmit → Reject (Attempt 2 - Warning)
3. Resubmit → Reject (Attempt 3 - Final Warning)
4. Try to resubmit → BLOCKED + Application Locked
5. Verify admin notification sent

### Test Case 2: Payment Max Attempts
1. Submit payment → Reject (Attempt 1)
2. Resubmit → Reject (Attempt 2 - Warning)
3. Resubmit → Reject (Attempt 3 - Final Warning)
4. Try to resubmit → BLOCKED + Application Locked
5. Verify admin notification sent

### Test Case 3: Different Documents
1. Document A → Reject 3 times → Lock on Document A only
2. Document B → Should still allow submission
3. Verify separate counters per document type

---

## 📝 Configuration Adjustment

To change limits, edit `rejectionLimits.ts`:

```typescript
// More lenient (5 attempts)
MAX_ATTEMPTS: 5,
WARNING_THRESHOLD: 3,
FINAL_ATTEMPT_WARNING: 5

// Stricter (2 attempts only)
MAX_ATTEMPTS: 2,
WARNING_THRESHOLD: 1,
FINAL_ATTEMPT_WARNING: 2

// Disable auto-lock (manual review only)
AUTO_LOCK_APPLICATION: false
```

---

## 🎯 Best Practices

### For Admins
✅ Always provide clear rejection reasons
✅ List specific issues when possible
✅ Review locked applications promptly (within 48h)
✅ Use professional language in rejection messages

### For System Design
✅ Progressive warnings (gentle → firm → critical)
✅ Always show remaining attempts
✅ Lock gracefully with support contact info
✅ Notify admins when intervention needed
✅ Keep audit trail of all attempts

---

## 📧 Support Contact Info

When applicants are locked, they should see:
- 📞 Support Phone: [Your Phone]
- 📧 Support Email: [Your Email]
- 💬 Live Chat: [If available]
- 🕒 Business Hours: [Your Hours]

---

## ✅ Implementation Checklist

- [x] Create rejection limits config
- [x] Update document rejection with notifications
- [x] Update payment rejection with notifications
- [x] Progressive warning system (1st, 2nd, final)
- [x] Auto-lock application on max attempts
- [x] Notify admins when max reached
- [ ] Add unlock/override admin UI
- [ ] Block resubmission in mobile app
- [ ] Display attempt warnings in mobile
- [ ] Add locked application dashboard view
- [ ] Test all scenarios thoroughly

---

## 🚀 Next Steps

1. **Frontend Integration**
   - Block resubmission when maxAttemptsReached
   - Show attempt counters
   - Display warning banners

2. **Admin Dashboard**
   - Create "Locked Applications" view
   - Add unlock/override functionality
   - Show attempt history clearly

3. **Mobile App**
   - Handle locked state gracefully
   - Show support contact prominently
   - Disable upload UI when locked

4. **Testing**
   - End-to-end test all scenarios
   - Verify notifications work
   - Check admin alerts

---

## 📞 Questions?

This system is designed to be:
- **Fair**: Multiple attempts with clear warnings
- **Professional**: Empathetic communication
- **Flexible**: Configurable limits and admin override
- **Secure**: Prevents abuse while helping genuine applicants

Adjust the configuration in `rejectionLimits.ts` to match your business requirements!
