# Health Card Verification URL - Deployment Configuration

## ⚠️ IMPORTANT: Pre-Deployment Checklist

Before deploying the mobile app to production, the health card verification URLs **MUST** be updated to point to the actual production domain.

---

## Current Status

### 🔴 URLs Need to Be Updated for Free Hosting

⚠️ **Note:** If deploying to **free hosting** instead of the official Davao City government domain, ALL verification URLs must be updated to your free hosting domain.

The following files currently contain URLs that need to be replaced:

| File | Current URL | Line(s) | Status |
|------|------------|---------|--------|
| `src/features/healthCards/lib/health-card-display-utils.ts` | `https://yourdomain.com/verify/${token}` | ~81 | 🔴 Placeholder |
| `src/screens/shared/HealthCardsScreen/HealthCardsScreen.tsx` | Uses `generateVerificationUrl()` | N/A | ✅ Will use updated function |
| `src/screens/shared/QRCodeScreen/QRCodeScreen.tsx` | `https://emedicard.davao.gov.ph/verify/${token}` | ~81, ~158 | 🔴 Hardcoded - needs update |

---

## What Needs to Be Updated

### 1. **Verification URL Generator**

**File:** `src/features/healthCards/lib/health-card-display-utils.ts`

**Function:** `generateVerificationUrl()`

```typescript
// ❌ CURRENT (Placeholder)
export const generateVerificationUrl = (card: HealthCardData | BackendHealthCard): string => {
  const token = 'registrationNumber' in card ? card.registrationNumber : (card as any).verificationToken;
  return `https://yourdomain.com/verify/${token}`;
};

// ✅ UPDATE TO YOUR FREE HOSTING DOMAIN
export const generateVerificationUrl = (card: HealthCardData | BackendHealthCard): string => {
  const token = 'registrationNumber' in card ? card.registrationNumber : (card as any).verificationToken;
  
  // Replace with your actual hosting domain:
  // Examples:
  // - Vercel: https://emedicard-verification.vercel.app/verify/${token}
  // - Netlify: https://emedicard-verify.netlify.app/verify/${token}
  // - Railway: https://emedicard.up.railway.app/verify/${token}
  // - Render: https://emedicard-api.onrender.com/verify/${token}
  
  return `https://YOUR-FREE-HOSTING-DOMAIN.com/verify/${token}`;
  
  // OR use environment variable (RECOMMENDED):
  // return `${process.env.EXPO_PUBLIC_VERIFICATION_URL}/verify/${token}`;
};
```

### 2. **QR Code Screen**

**File:** `src/screens/shared/QRCodeScreen/QRCodeScreen.tsx`

**Locations:**
- Line ~81 - Share message
- Line ~158 - QR Code value

```typescript
// ✅ ALREADY CORRECT (Verify before deployment)
// Line 81:
message: `🏥 Health Card QR Code\n\n...\n✅ Verify at: https://emedicard.davao.gov.ph/verify/${healthCard.registrationNumber}`

// Line 158:
<QRCode
  value={`https://emedicard.davao.gov.ph/verify/${healthCard.registrationNumber}`}
  ...
/>
```

---

## Recommended Approach: Use Environment Variables

### Benefits:
- ✅ Easy to switch between dev/staging/production
- ✅ No need to modify code for different environments
- ✅ Secure and maintainable

### Implementation:

#### 1. Create `.env` files:

**`.env.development`:**
```bash
EXPO_PUBLIC_VERIFICATION_URL=http://localhost:3000
EXPO_PUBLIC_APP_ENV=development
```

**`.env.production`:**
```bash
# Update with your actual free hosting domain
EXPO_PUBLIC_VERIFICATION_URL=https://YOUR-FREE-HOSTING-DOMAIN.com
EXPO_PUBLIC_APP_ENV=production

# Examples for popular free hosting platforms:
# EXPO_PUBLIC_VERIFICATION_URL=https://emedicard-verify.vercel.app
# EXPO_PUBLIC_VERIFICATION_URL=https://emedicard-api.netlify.app
# EXPO_PUBLIC_VERIFICATION_URL=https://emedicard.up.railway.app
# EXPO_PUBLIC_VERIFICATION_URL=https://emedicard-api.onrender.com
```

#### 2. Update the code:

```typescript
// src/features/healthCards/lib/health-card-display-utils.ts
export const generateVerificationUrl = (card: HealthCardData | BackendHealthCard): string => {
  const token = 'registrationNumber' in card ? card.registrationNumber : (card as any).verificationToken;
  const baseUrl = process.env.EXPO_PUBLIC_VERIFICATION_URL || 'https://emedicard.davao.gov.ph';
  return `${baseUrl}/verify/${token}`;
};
```

#### 3. Update QRCodeScreen.tsx:

```typescript
import { generateVerificationUrl } from '@features/healthCards';

// Replace hardcoded URLs with:
const verificationUrl = generateVerificationUrl(healthCard);

// Use in QR Code:
<QRCode value={verificationUrl} ... />

// Use in share message:
message: `... ✅ Verify at: ${verificationUrl}`
```

---

## Where These URLs Are Used

### 1. **Share Feature** (Text)
When users tap "Share" button on health cards, the verification URL is shared as text:
```
Health Card Verification

Card ID: 000001-25
Status: active
Expiry: Nov 10, 2026

Verify at: https://emedicard.davao.gov.ph/verify/000001-25
```

### 2. **QR Code Generation**
QR codes encode the verification URL:
- Health Cards Screen (tap to view QR)
- QR Code Screen (dedicated QR view)
- Generated PDFs (printed cards)

### 3. **Print/Save PDF**
When users download/print their health card, the QR code embedded in the PDF contains the verification URL.

---

## Backend Requirements

### The verification endpoint must:

1. **Accept GET requests** at `/verify/:token` or `/verify/:registrationNumber`
2. **Return health card information** including:
   - Card holder name
   - Card ID/Registration number
   - Issue date
   - Expiry date
   - Card status (active/expired/revoked)
   - Job category
3. **Handle invalid tokens** gracefully (404 or error page)
4. **Support both web browsers AND QR scanner apps**

### Example endpoint behavior:

```
GET https://emedicard.davao.gov.ph/verify/000001-25

Response (Web Page):
- Display health card verification page
- Show card holder information
- Show verification status
- Include security indicators

Response (API for mobile scanner):
- JSON with card details
- Status code: 200 (valid), 404 (not found), 410 (expired/revoked)
```

---

## Testing Checklist

Before production deployment, verify:

- [ ] Update verification URL in `health-card-display-utils.ts`
- [ ] Verify QRCodeScreen.tsx URLs are correct
- [ ] Test Share feature - check URL in shared text
- [ ] Test QR Code generation - scan and verify URL
- [ ] Test PDF generation - verify QR code in PDF
- [ ] Confirm backend verification endpoint is live
- [ ] Test with expired/revoked cards
- [ ] Test with invalid card numbers
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Test QR scanning with different scanner apps

---

## Related Files

All files that reference verification URLs:

1. **Core Logic:**
   - `src/features/healthCards/lib/health-card-display-utils.ts` - URL generator
   - `src/features/healthCards/lib/index.ts` - Export

2. **UI Components:**
   - `src/screens/shared/HealthCardsScreen/HealthCardsScreen.tsx` - Share & Print
   - `src/screens/shared/QRCodeScreen/QRCodeScreen.tsx` - QR display & share
   - `src/features/dashboard/components/HealthCardPreview/HealthCardPreview.tsx` - Dashboard preview

3. **Generated Content:**
   - PDF generation (via `generateCardHtml()`)
   - QR codes (via `QRCode` component)
   - Share messages (via `Share.share()`)

---

## Security Considerations

1. **HTTPS Only:** Always use HTTPS in production
2. **Token Security:** Registration numbers should be unpredictable
3. **Rate Limiting:** Backend should rate-limit verification requests
4. **Logging:** Log all verification attempts for audit trail
5. **Expiry Checks:** Backend must validate card status and expiry

---

## Free Hosting Options for Backend

If deploying the verification backend to free hosting, here are recommended platforms:

### 1. **Vercel** (Recommended for Next.js/Node.js)
- ✅ Free tier includes serverless functions
- ✅ Custom domains supported
- ✅ Automatic HTTPS
- ✅ Fast global CDN
- 🔗 URL format: `https://your-project.vercel.app`

### 2. **Netlify** (Good for static + serverless)
- ✅ Free tier with serverless functions
- ✅ Custom domains
- ✅ Automatic HTTPS
- 🔗 URL format: `https://your-project.netlify.app`

### 3. **Railway** (Good for full backend services)
- ✅ Free tier for small apps
- ✅ Supports databases
- ✅ Docker support
- 🔗 URL format: `https://your-project.up.railway.app`

### 4. **Render** (Full-stack hosting)
- ✅ Free tier for web services
- ✅ Auto-deploy from GitHub
- ✅ Free PostgreSQL database
- 🔗 URL format: `https://your-project.onrender.com`

### 5. **Fly.io** (Container-based)
- ✅ Free tier available
- ✅ Global deployment
- ✅ Good for Docker apps
- 🔗 URL format: `https://your-project.fly.dev`

### Recommended Setup:

1. **Backend API** → Deploy to **Vercel** or **Railway**
2. **Database** → Use **Convex** (already using) or **Railway PostgreSQL**
3. **Custom Domain** (optional) → Use a free domain from:
   - Freenom (free .tk, .ml, .ga domains)
   - Or use the platform's default subdomain

---

## Contact

For questions about deployment or backend integration:
- Mobile Team: [Your contact]
- Backend Team: [Backend contact]
- DevOps: [DevOps contact]

---

**Last Updated:** 2025-11-10  
**Version:** 1.1  
**Status:** 🔴 Requires action before production deployment
**Note:** Updated for free hosting deployment scenario
