# Health Card Real Data Fix ✅

## Problem
Mobile app was displaying **mock/hardcoded health card data** ("John Doe") instead of fetching real health card data from the backend.

## Root Cause
The `DashboardWidget.enhanced.tsx` was using hardcoded mock data:
```typescript
const mockHealthCard = {
  fullName: 'John Doe',  // ❌ Hardcoded
  cardNumber: 'HC-2025-001234',  // ❌ Hardcoded
  // ...
}
```

## Solution Overview
1. Enhanced backend query to return full health card details
2. Updated dashboard hook to expose health card data
3. Replaced mock data with real backend data in dashboard widget

---

## Changes Made

### 1. Backend - Enhanced Health Card Data (`convex/dashboard/getDashboardData.ts`)

**Lines 164-195:** Added full application and job category details to health cards

```typescript
// Valid health cards with full details
healthCards: await Promise.all(
  healthCards
    .filter(card => card.expiryDate > Date.now())
    .map(async (card) => {
      const application = applications.find(app => app._id === card.applicationId);
      const jobCategory = application ? await ctx.db.get(application.jobCategoryId) : null;
      
      return {
        _id: card._id,
        applicationId: card.applicationId,
        registrationNumber: card.registrationNumber,
        issuedDate: card.issuedDate,
        expiryDate: card.expiryDate,
        status: card.status,
        createdAt: card.createdAt,
        application: application ? {
          _id: application._id,
          firstName: application.firstName,
          middleName: application.middleName,
          lastName: application.lastName,
          position: application.position,
          organization: application.organization,
        } : null,
        jobCategory: jobCategory ? {
          _id: jobCategory._id,
          name: jobCategory.name,
          colorCode: jobCategory.colorCode,
        } : null,
      };
    })
),
```

**Impact:** Health cards now include complete applicant information

---

### 2. Dashboard Hook - Added Health Card (`mobile/src/features/dashboard/hooks/useOptimizedDashboard.ts`)

**Lines 210-214:** Extract health card from dashboard data

```typescript
// Get health card (first valid one)
const healthCard = useMemo(() => {
  const healthCards = effectiveDashboardData?.healthCards;
  return healthCards && healthCards.length > 0 ? healthCards[0] : null;
}, [effectiveDashboardData?.healthCards]);
```

**Line 226:** Added to return value

```typescript
return {
  // ... other data
  healthCard, // Add health card data
  // ...
};
```

**Impact:** Dashboard hook now exposes real health card data

---

### 3. Dashboard Widget - Use Real Data (`mobile/src/widgets/dashboard/DashboardWidget.enhanced.tsx`)

**Lines 62-74:** Replaced mock data with real backend data

```typescript
// Use real health card data from backend (no more mock data)
const realHealthCard = healthCard ? {
  id: healthCard._id,
  cardNumber: healthCard.registrationNumber || healthCard.verificationToken || 'N/A',
  issueDate: new Date(healthCard.issuedDate || healthCard.issuedAt || Date.now()).toISOString(),
  expiryDate: new Date(healthCard.expiryDate || healthCard.expiresAt || Date.now()).toISOString(),
  status: healthCard.status || 'active',
  type: healthCard.jobCategory?.name || 'Health Card',
  fullName: healthCard.application?.firstName && healthCard.application?.lastName
    ? `${healthCard.application.firstName} ${healthCard.application.middleName || ''} ${healthCard.application.lastName}`.trim()
    : userProfile?.fullname || 'User',
  qrCodeData: `https://emedicard.davao.gov.ph/verify/${healthCard.registrationNumber || healthCard.verificationToken}`,
} : null;
```

**Line 118:** Updated component prop

```typescript
<HealthCardPreview
  healthCard={realHealthCard}  // ✅ Now using real data
  currentApplication={currentApplication}
  userProfile={userProfile}
  isNewUser={isNewUser}
/>
```

**Impact:** Mobile app now displays actual applicant data

---

## Data Flow

```
1. User approves application in WebAdmin
   ↓
2. Backend generates health card with real data
   ↓
3. getDashboardData query fetches health cards with:
   - registrationNumber
   - issuedDate/expiryDate
   - status
   - application (firstName, middleName, lastName, position)
   - jobCategory (name)
   ↓
4. useOptimizedDashboard hook exposes healthCard
   ↓
5. DashboardWidget.enhanced maps to preview format
   ↓
6. HealthCardPreview displays real applicant data
```

---

## Before vs After

| Field | Before | After |
|-------|--------|-------|
| Full Name | "John Doe" (hardcoded) | "Ichihara Lapasanda" (from application) |
| Card Number | "HC-2025-001234" (hardcoded) | "000001-25" (from registrationNumber) |
| Occupation | "Medical Health Card" (hardcoded) | "Food Category" (from jobCategory.name) |
| Issue Date | "2025-01-01" (hardcoded) | Actual issued date |
| Expiry Date | "2026-01-01" (hardcoded) | Actual expiry date (1 year) |
| QR Code | "HC-2025-001234\|MEDICAL..." | "https://emedicard.davao.gov.ph/verify/000001-25" |

---

## Backward Compatibility

The code includes fallbacks for both old and new field names:
- `issuedDate || issuedAt`
- `expiryDate || expiresAt`
- `registrationNumber || verificationToken`

This ensures older health cards (if any exist) still display correctly.

---

## Testing Checklist

### Backend
- [x] Health cards include application data
- [x] Health cards include job category data
- [x] Only active/valid cards are returned
- [ ] Multiple health cards handled correctly
- [ ] Expired cards filtered out

### Mobile Dashboard
- [x] Real health card data fetched from backend
- [x] Full name displays correctly (firstName + middleName + lastName)
- [x] Registration number displays
- [x] Job category/occupation displays
- [x] Dates display correctly
- [ ] Test with applicant without middle name
- [ ] Test with expired health card
- [ ] Test with no health card (should show application status)

### Integration
- [ ] Approve application → Health card appears in mobile
- [ ] Correct applicant name shows immediately
- [ ] QR code contains registration number
- [ ] Tap to view details works
- [ ] Download button shows real PDF with correct data

---

## Files Modified

1. ✅ `convex/dashboard/getDashboardData.ts` - Enhanced health card data
2. ✅ `apps/mobile/src/features/dashboard/hooks/useOptimizedDashboard.ts` - Added health card to hook
3. ✅ `apps/mobile/src/widgets/dashboard/DashboardWidget.enhanced.tsx` - Replaced mock with real data

---

## Next Steps

1. **Delete Old Mock Health Card QR Screen** (if exists)
   - The screenshot shows "Health Card QR" screen with "ID: HC-FH-2024-001"
   - This appears to be a different/older mock implementation
   - May need to update or remove this screen

2. **Test Complete Flow**
   - Approve application
   - Check mobile dashboard shows correct name
   - Verify QR code uses registration number
   - Test download functionality

3. **Update Health Cards List Screen**
   - Ensure `/health-cards` route uses same real data
   - Update list view to show all user's health cards
   - Ensure detail view matches dashboard preview

---

## Related Documentation

- `C:\Em\HEALTH_CARD_DATA_AND_UI_FIXES.md` - Backend data fixes
- `C:\Em\HEALTH_CARD_UI_IMPLEMENTATION_COMPLETE.md` - UI implementation
- `C:\Em\HEALTH_CARD_SCHEMA_FIXES.md` - TypeScript fixes

---

**Status**: ✅ **COMPLETE** - Mock data removed, real data integrated
**Date**: 2025-01-10
**Impact**: Mobile app now displays actual applicant names and data from backend
