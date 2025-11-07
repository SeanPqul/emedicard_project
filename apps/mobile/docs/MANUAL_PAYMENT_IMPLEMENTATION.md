# Manual Payment Implementation

## Overview
This document describes the implementation of manual payment upload for Barangay Hall and City Hall payment methods in the mobile application.

## Features Implemented

### 1. Manual Payment Upload Screen
**Location:** `src/screens/shared/ManualPaymentScreen/ManualPaymentScreen.tsx`

Features:
- Payment method display (Barangay Hall / City Hall)
- Fee breakdown display (Application Fee + Service Fee = Total)
- Payment instructions
- Reference number input field
- Receipt image upload (from gallery or camera)
- Image preview with file information
- Upload progress indicator
- Form validation
- Success/error handling

### 2. Manual Payment Upload Hook
**Location:** `src/features/payment/hooks/useManualPaymentUpload.ts`

Functionality:
- Handles receipt image upload to Convex storage
- Submits payment record with receipt reference
- Manages upload progress state
- Error handling and retry logic

### 3. Updated Payment Flow
**Location:** `src/features/application/hooks/useApplicationDetail.ts`

Changes:
- When user selects Barangay Hall or City Hall payment method
- Navigates to manual payment upload screen instead of showing alert
- Passes applicationId and paymentMethod as route parameters

### 4. Backend Integration
**Location:** `backend/convex/payments/createPayment.ts`

Updates:
- First-time manual payments now update application status to "For Payment Validation"
- Sends notification to applicant confirming payment submission
- Supports receipt storage ID for manual payments

## Payment Flow

### User Journey:
1. User views application details
2. Clicks on "Barangay Hall" or "City Hall" payment option
3. Redirected to Manual Payment Screen
4. Views payment amount and instructions
5. Enters reference number from official receipt
6. Uploads photo of receipt (gallery or camera)
7. Reviews preview and submits
8. Receives confirmation
9. Application status changes to "For Payment Validation"
10. Admin reviews and approves/rejects payment

### Technical Flow:
```
ApplicationDetailWidget
  ↓ (select Barangay/CityHall)
useApplicationDetail.handlePaymentMethodSelect()
  ↓ (router.push)
ManualPaymentScreen
  ↓ (submit)
useManualPaymentUpload.submitManualPayment()
  ↓ (upload receipt)
Convex Storage API
  ↓ (create payment)
createPaymentMutation
  ↓ (update status)
Application Status → "For Payment Validation"
```

## Files Created/Modified

### Created Files:
1. `src/features/payment/hooks/useManualPaymentUpload.ts` - Manual payment logic
2. `src/screens/shared/ManualPaymentScreen/ManualPaymentScreen.tsx` - UI component
3. `src/screens/shared/ManualPaymentScreen/ManualPaymentScreen.styles.ts` - Styles
4. `src/screens/shared/ManualPaymentScreen/index.ts` - Export
5. `app/(screens)/(shared)/manual-payment.tsx` - Expo router route

### Modified Files:
1. `src/features/application/hooks/useApplicationDetail.ts` - Navigation update
2. `src/features/payment/hooks/index.ts` - Export new hook
3. `backend/convex/payments/createPayment.ts` - Application status update

## Payment Methods Supported

| Method | Type | Implementation Status |
|--------|------|----------------------|
| Maya | Third-party | ✅ Implemented |
| GCash | Third-party | 🚧 Coming Soon |
| Barangay Hall | Manual Upload | ✅ **NEW** |
| City Hall | Manual Upload | ✅ **NEW** |

## Validation Rules

### Reference Number:
- Required field
- Must not be empty or whitespace only

### Receipt Image:
- Required
- Accepts: JPEG, PNG images
- Can be selected from gallery or taken with camera
- Preview shown before submission

### Payment Amount:
- Fixed: ₱60.00 (₱50 Application Fee + ₱10 Service Fee)
- Amount validation handled by backend

## Backend Schema

### Payment Record:
```typescript
{
  applicationId: Id<"applications">,
  amount: 50,
  serviceFee: 10,
  netAmount: 60,
  paymentMethod: "BaranggayHall" | "CityHall",
  referenceNumber: string,
  receiptStorageId: Id<"_storage">, // NEW: Receipt image
  paymentStatus: "Pending", // Initially pending, admin changes to Complete/Failed
}
```

## Security Considerations

1. **Authentication**: All payment operations require authenticated user
2. **Authorization**: Users can only submit payments for their own applications
3. **Validation**: Backend validates payment amounts and application exists
4. **Receipt Storage**: Images stored securely in Convex storage
5. **Status Management**: Only admins can change payment status

## Error Handling

### User-facing errors:
- Missing reference number
- Missing receipt image
- Image picker permission denied
- Upload failure
- Network errors
- Duplicate payment attempts

### All errors show user-friendly messages with retry options

## Future Enhancements

1. **Receipt Compression**: Optimize image size before upload
2. **Multiple Receipt Upload**: Support multiple receipt images
3. **OCR Integration**: Auto-extract reference number from receipt
4. **Payment History**: Show past payment attempts
5. **Offline Support**: Queue payments when offline
6. **Receipt Preview**: Full-screen receipt viewer

## Testing Checklist

- [ ] Select Barangay Hall payment method
- [ ] Select City Hall payment method
- [ ] Enter reference number
- [ ] Upload image from gallery
- [ ] Take photo with camera
- [ ] Preview uploaded receipt
- [ ] Remove uploaded receipt
- [ ] Submit with valid data
- [ ] Submit without reference number (validation)
- [ ] Submit without receipt (validation)
- [ ] Check application status after submission
- [ ] Verify notification received
- [ ] Check backend payment record created
- [ ] Verify receipt stored in Convex

## Breaking Changes

**None** - This is a purely additive feature. Existing payment flows (Maya) continue to work as before.

## Migration Notes

No migration required. The feature uses existing backend mutations and adds new UI flows only.

---

**Implementation Date:** 2025-01-05
**Status:** ✅ Complete
**Version:** 1.0.0
