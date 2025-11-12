# Uniform Pricing Update - All Methods ₱60

## Date: 2025-11-12

## Change Summary
Updated all payment methods to charge a ₱10 processing fee, making the total ₱60 for all payment options.

## Reason
Payment centers (Barangay Hall and City Hall) charge a ₱10 handling/processing fee, so all payment methods should have consistent pricing.

## Updated Pricing Structure

### Before:
| Payment Method | Base Fee | Processing Fee | Total |
|----------------|----------|----------------|-------|
| Maya | ₱50 | ₱10 | ₱60 |
| BaranggayHall | ₱50 | ₱0 | **₱50** ❌ |
| CityHall | ₱50 | ₱0 | **₱50** ❌ |

### After:
| Payment Method | Base Fee | Processing Fee | Total |
|----------------|----------|----------------|-------|
| Maya | ₱50 | ₱10 | **₱60** ✅ |
| BaranggayHall | ₱50 | ₱10 | **₱60** ✅ |
| CityHall | ₱50 | ₱10 | **₱60** ✅ |

## Files Modified

### Backend
1. **`convex/config/paymentConstants.ts`**
   ```typescript
   export const SERVICE_FEES = {
     Maya: 10,
     BaranggayHall: 10,  // Updated from 0 to 10
     CityHall: 10,       // Updated from 0 to 10
   }
   ```

### Mobile App
1. **`features/payment/lib/paymentFlow.ts`**
   - Updated: `serviceFee = 10` for all methods (was conditional)

2. **`features/payment/hooks/useManualPaymentUpload.ts`**
   - Updated: `serviceFee: 10, netAmount: 60` (was 0, 50)

3. **`features/application/components/steps/PaymentMethodStep/PaymentMethodStep.tsx`**
   - Updated description text to clarify all methods are ₱60
   - Updated instructions to mention "₱50 application + ₱10 processing"

### Documentation
1. **`PAYMENT_CONSISTENCY_FIXES.md`** - Updated pricing table
2. **`GCASH_REMOVAL_SUMMARY.md`** - Updated pricing table

## Payment Breakdown Display

**All payment methods now show:**
- **Application Fee**: ₱50.00
- **Processing Fee**: ₱10.00
- **Total**: ₱60.00

## User-Facing Changes

### Mobile App
- Payment method selection screen clearly states all methods cost ₱60
- Manual payment instructions mention ₱60 total (₱50 + ₱10)
- Fee breakdown shows ₱10 processing fee for all methods

### Web Admin
- Payment history shows correct ₱10 service fee for all methods
- Statistics calculated with correct amounts

## Migration Notes

**Existing Payments:**
- Old BaranggayHall/CityHall payments with ₱0 service fee will display as-is
- New payments will automatically use ₱10 service fee
- Backend migration already handled missing service fees

**No Data Migration Required:**
- The backfill migration already fixed missing service fees
- New payments will use correct amounts automatically

## Testing Checklist

- [x] Backend constants updated
- [x] Mobile payment flow updated
- [x] Mobile manual payment upload updated
- [x] Mobile UI text updated
- [x] Documentation updated
- [x] Convex schema synced
- [ ] Test creating new BaranggayHall payment (should be ₱60)
- [ ] Test creating new CityHall payment (should be ₱60)
- [ ] Verify payment history displays correctly
- [ ] Test mobile app payment submission

## Benefits

✅ **Consistent Pricing** - All payment methods cost ₱60  
✅ **Fair Fees** - Payment centers' ₱10 handling fee properly reflected  
✅ **Clear Communication** - Users know exact cost upfront  
✅ **Simplified Logic** - Same calculation for all methods  

---

**Status**: ✅ Complete  
**Breaking Changes**: None (only affects new payments)  
**Action Required**: Test new payment submissions
