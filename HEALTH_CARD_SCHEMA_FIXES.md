# Health Card Schema Migration - TypeScript Fixes ✅

## Summary
Fixed 25 TypeScript errors caused by the health card schema migration from old field names to new ones.

## Schema Changes
| Old Field | New Field |
|-----------|-----------|
| `issuedAt` | `issuedDate` |
| `expiresAt` | `expiryDate` |
| `verificationToken` | `registrationNumber` |
| `cardUrl` | `htmlContent` |
| N/A | `status` (active/revoked/expired) |
| N/A | `createdAt` |
| N/A | `revokedAt` (optional) |
| N/A | `revokedReason` (optional) |

## Files Fixed

### 1. `convex/dashboard/getDashboardData.ts`
**Changes:**
- Line 107: `card.expiresAt` → `card.expiryDate`
- Line 166: `card.expiresAt` → `card.expiryDate`
- Line 170: `card.issuedAt` → `card.issuedDate`
- Line 171: `card.expiresAt` → `card.expiryDate`
- Line 172: `card.verificationToken` → `card.registrationNumber`

**Impact:** Dashboard health card stats now use correct field names

---

### 2. `convex/healthCards/generateHealthCard.ts`
**Changes:**
- Line 3: Added `internalAction` import (changed from `action`)
- Line 352: Changed `action` to `internalAction` for internal API access
- Line 356: Added explicit return type annotation
- Line 412: Added type annotation for `healthCardId`
- Lines 459-466: Fixed photo URL retrieval (changed from `storageId` to `fileUrl`)
- Line 473: Fixed `dateOfBirth` to use `user.birthDate`
- Lines 475-476: Fixed `nationality` and `workplace` fallbacks

**Impact:** 
- Function can now be called via `internal` API from finalizeApplication
- Proper type checking
- Correct field access for user data and documents

---

### 3. `convex/healthCards/issueHealthCard.ts`
**Changes:**
- Removed `cardUrl` argument
- Removed `issuedAt` → Added `issuedDate`
- Removed `expiresAt` → Added `expiryDate`
- Removed `verificationToken` → Added `registrationNumber`
- Added `htmlContent` argument
- Added `status: "active"` and `createdAt: Date.now()` to insert

**Impact:** Function now matches new health card schema

---

### 4. `convex/healthCards/updateHealthCard.ts`
**Changes:**
- Removed `cardUrl`, `expiresAt`, `verificationToken` arguments
- Added `status`, `expiryDate`, `revokedAt`, `revokedReason` arguments
- Updated types to match new schema

**Impact:** Can now update status and revocation fields

---

### 5. `convex/verification/createVerificationLog.ts`
**Changes:**
- Line 20: `healthCard.expiresAt` → `healthCard.expiryDate`

**Impact:** Expiry validation uses correct field

---

### 6. `convex/verification/logQRScan.ts`
**Changes:**
- Line 27: Changed index from `by_verification_token` to `by_registration`
- Line 27: Changed field from `verificationToken` to `registrationNumber`
- Line 28: Changed `.unique()` to `.first()` (query method update)
- Line 36: `healthCard.expiresAt` → `healthCard.expiryDate`

**Impact:** QR code scanning uses registration number for lookup

---

### 7. `convex/verification/logVerificationAttempt.ts`
**Changes:**
- Line 19: Changed index from `by_verification_token` to `by_registration`
- Line 19: Changed field from `verificationToken` to `registrationNumber`
- Line 20: Changed `.unique()` to `.first()` (query method update)

**Impact:** Verification logging uses registration number

---

## Breaking Changes

### API Changes
1. **issueHealthCard mutation** - Parameters changed:
   ```typescript
   // OLD
   {
     cardUrl: string;
     issuedAt: number;
     expiresAt: number;
     verificationToken: string;
   }
   
   // NEW
   {
     registrationNumber: string;
     htmlContent: string;
     issuedDate: number;
     expiryDate: number;
   }
   ```

2. **updateHealthCard mutation** - Parameters changed:
   ```typescript
   // OLD
   {
     cardUrl?: string;
     expiresAt?: number;
     verificationToken?: string;
   }
   
   // NEW
   {
     status?: "active" | "revoked" | "expired";
     expiryDate?: number;
     revokedAt?: number;
     revokedReason?: string;
   }
   ```

3. **Verification functions** - Now use `registrationNumber` instead of `verificationToken`

### Database Index Changes
- `by_verification_token` → `by_registration` (already updated in schema)

## Migration Notes

### Backward Compatibility
- Mobile app updated with fallbacks for both old and new field names
- Display utils check for both `issuedAt`/`issuedDate` and `expiresAt`/`expiryDate`
- Old health cards (if any exist) will still work until regenerated

### Data Migration
**No database migration needed** because:
1. This is a new feature (health cards are auto-generated on approval)
2. Old health cards (if any) will continue to work via mobile app fallbacks
3. New cards will be generated with the new schema automatically

## Testing Checklist

### Backend
- [x] TypeScript compilation passes
- [ ] Health card generation on approval works
- [ ] Registration numbers are unique and sequential
- [ ] HTML content is stored correctly
- [ ] Dates are in correct format (timestamps)
- [ ] Status field defaults to "active"

### WebAdmin
- [ ] Health card section appears in doc_verif
- [ ] "View Health Card" button opens HTML correctly
- [ ] All fields display properly (registration, dates, status)
- [ ] Official CHO Davao format renders correctly

### Mobile App
- [ ] Health cards list loads
- [ ] Registration numbers display
- [ ] Download button works
- [ ] Downloaded PDF contains official format
- [ ] QR code verification works

### Verification
- [ ] QR scan uses registration number
- [ ] Expiry validation works
- [ ] Verification logs are created
- [ ] by_registration index works correctly

## Files Changed

1. ✅ `convex/dashboard/getDashboardData.ts`
2. ✅ `convex/healthCards/generateHealthCard.ts`
3. ✅ `convex/healthCards/issueHealthCard.ts`
4. ✅ `convex/healthCards/updateHealthCard.ts`
5. ✅ `convex/verification/createVerificationLog.ts`
6. ✅ `convex/verification/logQRScan.ts`
7. ✅ `convex/verification/logVerificationAttempt.ts`

## Related Documentation

- `C:\Em\HEALTH_CARD_IMPLEMENTATION_GUIDE.md` - Original implementation
- `C:\Em\HEALTH_CARD_UI_IMPLEMENTATION_COMPLETE.md` - UI implementation
- `C:\Em\backend\convex\schema.ts` - Health card schema definition

---

**Status**: ✅ **ALL FIXES COMPLETE**
**Date**: 2025-01-10
**TypeScript Errors**: 25 → 0
