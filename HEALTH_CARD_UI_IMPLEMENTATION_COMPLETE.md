# Health Card UI Implementation Complete ✅

## Summary
Successfully implemented health card viewing and downloading functionality in both WebAdmin and mobile app, integrating with the automatic health card generation system.

## Changes Made

### 1. WebAdmin - doc_verif Page Updates

**File**: `C:\Em\apps\webadmin\src\app\dashboard\[id]\doc_verif\page.tsx`

#### Added State
```typescript
const [isHealthCardExpanded, setIsHealthCardExpanded] = useState(false);
```

#### Added Query
```typescript
const healthCardDetails = useQuery(api.healthCards.getHealthCard.getByApplication, { 
  applicationId: params.id 
});
```

#### New Health Card Section
- **Location**: After Orientation Details section, before Actions Card
- **Features**:
  - Collapsible card with status badge (✅ Issued / ⏰ Expired / 🚫 Revoked / 🔄 Generating...)
  - Shows card details when expanded:
    - Registration Number (highlighted in teal)
    - Issue Date
    - Expiry Date
    - Status
    - Revocation reason (if revoked)
  - "View Health Card" button that opens HTML in new browser tab
  - Loading state for cards being generated
  - Empty state for applications not yet approved

#### View Health Card Functionality
```typescript
onClick={() => {
  const blob = new Blob([healthCardDetails.htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}}
```

### 2. Mobile App - Health Card Hook Update

**File**: `C:\Em\apps\mobile\src\features\healthCards\hooks\useHealthCards.ts`

#### Updated Interface
```typescript
export interface BackendHealthCard {
  _id: Id<"healthCards">;
  _creationTime: number;
  applicationId: Id<"applications">;
  registrationNumber: string;        // NEW
  htmlContent: string;               // NEW
  issuedDate: number;                // NEW (was issuedAt)
  expiryDate: number;                // NEW (was expiresAt)
  status: "active" | "revoked" | "expired"; // NEW
  createdAt: number;                 // NEW
  revokedAt?: number;                // NEW
  revokedReason?: string;            // NEW
  application?: { ... };
  jobCategory?: { ... };
}
```

### 3. Mobile App - Display Utils Update

**File**: `C:\Em\apps\mobile\src\features\healthCards\lib\health-card-display-utils.ts`

#### Updated Functions

**getCardStatus()**
- Now checks `status` field directly from database
- Falls back to calculating from expiry date for old schema
- Returns: `'active' | 'expired' | 'revoked'`

**generateVerificationUrl()**
- Uses `registrationNumber` for new schema
- Falls back to `verificationToken` for old schema

**generateCardHtml()**
- **Primary**: Returns stored `htmlContent` from database (official CHO Davao format)
- **Fallback**: Generates simple HTML for old schema cards
- Supports both field naming conventions (issuedDate/issuedAt, expiryDate/expiresAt)

### 4. Mobile App - HealthCardsScreen Update

**File**: `C:\Em\apps\mobile\src\screens\shared\HealthCardsScreen\HealthCardsScreen.tsx`

#### Updated Display Fields
```typescript
// Registration number display
<Text style={styles.cardId}>
  Card ID: {card.registrationNumber || (card as any).verificationToken}
</Text>

// Issue date display
<Text style={styles.cardDates}>
  Issued: {formatDate(card.issuedDate || (card as any).issuedAt)}
</Text>

// Expiry date display
<Text style={styles.cardDates}>
  Expires: {formatDate(card.expiryDate || (card as any).expiresAt)}
</Text>
```

#### Download Functionality
- Uses `generateCardHtml()` which returns stored HTML content
- Converts HTML to PDF using `expo-print`
- Saves to device gallery using `expo-media-library`
- Official CHO Davao format preserved in download

## User Flow

### WebAdmin Flow
1. Admin approves application
2. Backend automatically generates health card with official CHO Davao format
3. Health Card section appears in doc_verif page
4. Status badge shows "🔄 Generating..." briefly
5. Once generated, shows "✅ Issued" with registration number
6. Admin clicks "View Health Card" → Opens official health card in new tab
7. Admin can verify details match applicant information

### Mobile App Flow
1. Applicant's application gets approved
2. Health card appears in "Health Cards" tab
3. Card displays:
   - Registration number (e.g., 000001-25)
   - Issue and expiry dates
   - Status badge (active/expired/revoked)
   - Job category
4. Applicant can:
   - **View QR Code**: Tap QR icon to display verification QR
   - **Download**: Downloads official CHO Davao formatted card as PDF to gallery
   - **Share**: Shares verification URL and card details
   - **Print**: Generates printable PDF for physical printing

## Backend Integration

The UI integrates with these backend functions:

### WebAdmin Query
```typescript
api.healthCards.getHealthCard.getByApplication
// Returns: { registrationNumber, htmlContent, issuedDate, expiryDate, status, ... }
```

### Mobile Queries
```typescript
api.healthCards.getUserCards.getUserCardsQuery
// Returns: Array of health cards with application and job category details
```

## Health Card Format

The generated health card follows the official **CHO DAVAO** format:
- Header: "CITY HEALTH OFFICE - Davao City"
- Form number: EHS Form No. 102-A
- Title: "HEALTH CERTIFICATE"
- Legal references: P.D. 522, P.D. 856, City Ord. No. 078
- Applicant details with photo
- Registration number
- Issue and expiry dates (1 year validity)
- Official signatures (Sanitation Chief and City Health Officer)
- QR code for verification
- CHO DAVAO watermark

## Backward Compatibility

All updates maintain backward compatibility with old schema:
- Field name fallbacks (issuedAt/issuedDate, expiresAt/expiryDate)
- Token fallbacks (verificationToken/registrationNumber)
- HTML generation fallback for cards without htmlContent
- Status calculation fallback for cards without status field

## Testing Checklist

### WebAdmin
- [ ] Health Card section appears after orientation details
- [ ] Status badge shows correctly (Issued/Generating/Expired/Revoked)
- [ ] Registration number displays correctly
- [ ] Dates display in correct format
- [ ] "View Health Card" button opens card in new tab
- [ ] Official CHO Davao format renders correctly
- [ ] All applicant details match
- [ ] Photo displays correctly in card
- [ ] QR code generates correctly

### Mobile App
- [ ] Health cards list loads correctly
- [ ] Registration numbers display
- [ ] Dates display correctly
- [ ] Status badges show correctly
- [ ] Download button saves PDF to gallery
- [ ] Downloaded PDF contains official format
- [ ] Share button works
- [ ] Print button generates PDF
- [ ] QR code displays when tapped
- [ ] Expired cards show "Renew" button

## Next Steps

1. ✅ Backend generation system (COMPLETE)
2. ✅ WebAdmin viewing UI (COMPLETE)
3. ✅ Mobile download functionality (COMPLETE)
4. ⏳ Test complete flow end-to-end
5. ⏳ Verify PDF quality on mobile devices
6. ⏳ Test QR code verification flow
7. ⏳ Add admin ability to revoke health cards (future enhancement)

## Files Modified

1. `C:\Em\apps\webadmin\src\app\dashboard\[id]\doc_verif\page.tsx`
2. `C:\Em\apps\mobile\src\features\healthCards\hooks\useHealthCards.ts`
3. `C:\Em\apps\mobile\src\features\healthCards\lib\health-card-display-utils.ts`
4. `C:\Em\apps\mobile\src\screens\shared\HealthCardsScreen\HealthCardsScreen.tsx`

## Related Documentation

- See: `C:\Em\HEALTH_CARD_IMPLEMENTATION_GUIDE.md` - Backend implementation
- See: `C:\Em\backend\convex\healthCards\generateHealthCard.ts` - Generation logic
- See: `C:\Em\backend\convex\schema.ts` - Health card schema

---

**Status**: ✅ **COMPLETE** - Ready for testing
**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
