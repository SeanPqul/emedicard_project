# Gcash Payment Method Removal Summary

## Date: 2025-11-12

## Reason
Gcash payment method has been deprecated and is no longer supported.

## Files Modified

### Backend (Convex)

1. **`convex/schema.ts`** - Removed Gcash from paymentMethod union
   ```typescript
   // Before: v.literal("Gcash"), v.literal("Maya"), ...
   // After: v.literal("Maya"), v.literal("BaranggayHall"), v.literal("CityHall")
   ```

2. **`convex/config/paymentConstants.ts`** - Removed Gcash from SERVICE_FEES
   ```typescript
   // Before: { Maya: 10, Gcash: 10, BaranggayHall: 0, CityHall: 0 }
   // After: { Maya: 10, BaranggayHall: 0, CityHall: 0 }
   ```

3. **`convex/payments/createPayment.ts`** - Removed Gcash from args validation

4. **`convex/payments/getPaymentHistory.ts`** - Removed Gcash from methodBreakdown stats

5. **`convex/payments/getAllPayments.ts`** - Removed Gcash from byMethod stats

6. **`convex/admin/payments/testResubmission.ts`** - Removed Gcash from test mutation args

7. **`convex/applications/submitApplication.ts`** - Removed Gcash from paymentMethod args

### Web Admin

1. **`apps/webadmin/src/app/dashboard/payment-history/page.tsx`** - Removed Gcash from payment method filter dropdown
   ```tsx
   // Removed: <option value="Gcash">Gcash</option>
   ```

### Mobile App

**✅ Already Clean!** Mobile app was already using the correct payment methods:
- `entities/payment/model/types.ts`: Only Maya, BaranggayHall, CityHall
- `entities/application/model/types.ts`: Only Maya, BaranggayHall, CityHall
- `features/application/components/steps/PaymentMethodStep`: No Gcash option

## Current Payment Methods

### Supported Methods:
1. **Maya** - Online payment with ₱10 service fee
2. **BaranggayHall** - Cash payment at local Barangay Hall (₱0 service fee)
3. **CityHall** - Cash payment at Davao City Hall (₱0 service fee)

### Payment Structure:
- **Base Fee**: ₱50.00
- **Processing Fees** (all methods):
  - Maya: ₱10.00
  - BaranggayHall: ₱10.00
  - CityHall: ₱10.00
- **Total** (all methods):
  - All payment methods: **₱60.00**

## Migration Status

✅ **Backend**: All Gcash references removed  
✅ **Web Admin**: Gcash removed from filters  
✅ **Mobile App**: Already using correct payment methods  
✅ **Schema**: Compiled successfully  
✅ **Type Safety**: All TypeScript errors resolved  

## Existing Gcash Payments

**Note**: Historic payments made via Gcash will still be displayed in payment history with the "Gcash" label for audit trail purposes. Only new payments are restricted to the three supported methods above.

## Testing Checklist

- [x] Backend schema compiles without errors
- [x] Web admin filter dropdown updated
- [x] Mobile payment selection doesn't include Gcash
- [x] Payment constants updated
- [ ] Test creating new payment (should not allow Gcash)
- [ ] Verify historic Gcash payments still display correctly
- [ ] Test payment statistics dashboard

---

**Status**: ✅ Complete  
**Breaking Changes**: None (existing Gcash payments preserved)  
**Action Required**: None
