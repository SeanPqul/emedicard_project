# Terminology Update: "Service Fee" → "Processing Fee"

## Date: 2025-11-12

## Change Summary
Updated all user-facing labels from "Service Fee" to "Processing Fee" for better clarity and professionalism in the Philippine government health card context.

## Reason
"Processing Fee" is more appropriate and commonly used in Philippine government documentation (e.g., NBI Clearance, Passport, LTO License). It's clearer and more specific than "Service Fee" which can be ambiguous.

## Files Updated

### Mobile App (7 files)

1. **`screens/shared/PaymentDetailScreen/PaymentDetailScreen.tsx`**
   - Line 115: "Service Fee" → "Processing Fee"
   - **Location**: Amount breakdown section in payment details

2. **`widgets/payment/PaymentWidget.tsx`**
   - Line 220: "Service Fee:" → "Processing Fee:"
   - **Location**: Fee breakdown in payment widget

3. **`screens/shared/ManualPaymentScreen/ManualPaymentScreen.tsx`**
   - Line 207: "Service Fee" → "Processing Fee"
   - **Location**: Fee breakdown in manual payment screen

4. **`widgets/application-detail/ApplicationDetailWidget.tsx`**
   - Line 429: "Service Fee" → "Processing Fee"
   - **Location**: Fee breakdown in application detail card

5. **`processes/mayaPaymentFlow/lib/utils.ts`**
   - Line 17: Code comment updated
   - **Location**: calculateTotalAmount function comment

### Web Admin (1 file)

6. **`app/dashboard/payment-history/page.tsx`**
   - Line 92: CSV header "Service Fee" → "Processing Fee"
   - Line 235: "After service fees" → "After processing fees"
   - Line 238: Card title "Service Fees" → "Processing Fees"
   - Line 447: Modal label "Service Fee" → "Processing Fee"

## Code Variable Names (Unchanged)

**Note**: All code variable names remain as `serviceFee` for consistency with:
- Database schema
- API contracts
- Backend functions
- Type definitions

This maintains backward compatibility while improving user-facing terminology.

## Display Changes

### Before:
```
Application Fee: ₱50.00
Service Fee:     ₱10.00
Total:           ₱60.00
```

### After:
```
Application Fee: ₱50.00
Processing Fee:  ₱10.00
Total:           ₱60.00
```

## Benefits

✅ **Clearer Intent** - Users understand they're paying for application processing  
✅ **Professional** - Aligns with PH government terminology standards  
✅ **Consistent** - Same term used across all payment methods  
✅ **Familiar** - Filipinos recognize "Processing Fee" from other gov't services  

## Locations Updated

### Mobile App Screens:
- ✅ Payment Detail Screen (amount breakdown)
- ✅ Manual Payment Screen (fee display)
- ✅ Payment Widget (fee selection)
- ✅ Application Detail Widget (payment section)

### Web Admin:
- ✅ Payment History Table (display)
- ✅ Payment Details Modal (breakdown)
- ✅ Statistics Cards (summary)
- ✅ CSV Export (headers)

## Testing Checklist

- [x] Mobile payment detail screen
- [x] Mobile manual payment screen
- [x] Mobile application detail
- [x] Web admin payment history
- [x] Web admin payment modal
- [x] CSV export headers
- [ ] Test all screens in production
- [ ] Verify no broken UI layouts
- [ ] Check translations if applicable

## Impact

**Breaking Changes**: None  
**User Impact**: Terminology only - same functionality  
**Developer Impact**: Variable names unchanged - no code refactoring needed

---

**Status**: ✅ Complete  
**Code Variables**: Unchanged (`serviceFee`)  
**User-Facing Text**: Updated to "Processing Fee"
