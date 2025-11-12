# Document Requirements Screen Update

## Date: 2025-11-12

## Changes Summary
1. **Removed GCash payment option** from all payment method displays
2. **Renamed "City Hall" to "Sanggunian Hall"** throughout the mobile app

## Reason
- GCash payment method has been deprecated
- "Sanggunian Hall" is the more accurate/official name for the payment location in Davao City

## Files Modified

### Core Payment Methods Configuration

1. **`features/healthCards/lib/health-card-display-utils.ts`**
   - Removed GCash entry from `getPaymentMethods()` function
   - Changed "City Hall" → "Sanggunian Hall"
   - Updated description: "Pay at the Sanggunian Hall cashier - business hours only"

### Document Requirements Screen

2. **`screens/shared/DocumentRequirementsScreen/DocumentRequirementsScreen.tsx`**
   - Removed unused GCash logo import
   - Removed GCash conditional rendering in payment options
   - Updated instruction note: "Barangay Hall or Sanggunian Hall payments"

### Payment Method Selection

3. **`features/application/components/steps/PaymentMethodStep/PaymentMethodStep.tsx`**
   - Updated display name: "City Hall" → "Sanggunian Hall"
   - Updated description: "Pay in person at Sanggunian Hall"
   - Updated instructions text to mention "Sanggunian Hall"

### Display Formatters

4. **`entities/payment/lib/formatters.ts`**
   - Fixed typo: "Sangunian" → "Sanggunian" (double 'g')
   - `formatPaymentMethod()` now returns "Sanggunian Hall" for CityHall code

### Application Detail Widget

5. **`widgets/application-detail/ApplicationDetailWidget.tsx`**
   - Fixed typo: "Sangunian Hall" → "Sanggunian Hall"
   - Display name now shows "Sanggunian Hall"

### Manual Payment Screen

6. **`screens/shared/ManualPaymentScreen/ManualPaymentScreen.tsx`**
   - Updated paymentMethodName mapping: "City Hall" → "Sanggunian Hall"

### Payment Widget

7. **`widgets/payment/PaymentWidget.tsx`**
   - Fixed typo in instructions: "Sangunian" → "Sanggunian"
   - Instructions now say "Visit the Sanggunian Hall"

## Current Payment Methods

### Available Options:
1. **Maya** - Online payment via PayMaya
2. **Barangay Hall** - Cash payment at local Barangay Hall
3. **Sanggunian Hall** - Cash payment at Sanggunian Hall

### Display Names:
| Code Value | Display Name |
|------------|--------------|
| `Maya` | Maya |
| `BaranggayHall` | Barangay Hall |
| `CityHall` | Sanggunian Hall |

**Note**: Code value remains `CityHall` for backward compatibility with database and API contracts.

## Screenshots Reference

User's original screenshot showed:
- ❌ GCash option (removed)
- ❌ "City Hall" text (changed to "Sanggunian Hall")

## Testing Checklist

- [x] Remove GCash from payment methods list
- [x] Update all "City Hall" display text to "Sanggunian Hall"
- [x] Fix all typos (Sangunian → Sanggunian)
- [x] Remove unused GCash logo import
- [x] Update payment instructions text
- [ ] Test Document Requirements screen display
- [ ] Test Payment Method Step in application flow
- [ ] Test Manual Payment screen
- [ ] Verify no broken layouts or missing icons

## Impact

**Breaking Changes**: None  
**Database Schema**: Unchanged (code value still `CityHall`)  
**User-Facing**: 
- GCash option no longer visible
- "City Hall" renamed to "Sanggunian Hall" everywhere

---

**Status**: ✅ Complete  
**Code Values**: Unchanged  
**Display Text**: Updated
