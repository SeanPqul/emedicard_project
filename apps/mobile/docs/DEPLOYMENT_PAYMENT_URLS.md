# Payment URLs - Deployment Configuration

## ⚠️ IMPORTANT: Pre-Deployment Checklist

Before deploying to production, all payment-related URLs **MUST** be centralized and updated to point to your actual hosting domain.

---

## Current Status

### 🔴 Hardcoded URLs Found

The following URLs are currently hardcoded and need centralization:

| Location | Current URL | Purpose | Status |
|----------|-------------|---------|--------|
| **Backend** `convex/payments/maya/checkout.ts` | `https://your-app.convex.site` | Payment redirect URLs | 🔴 Placeholder |
| **Frontend** Deep link handlers | App scheme: `emedicard://` | Return from Maya app | ⚠️ May need update |

---

## Payment URL Types

### 1. **Maya Redirect URLs** (Backend)
Used when Maya redirects users back after payment

**File:** `backend/convex/payments/maya/checkout.ts` (Lines 307-311)

**Current:**
```typescript
redirectUrl: {
  success: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=success&paymentId=${paymentId}&applicationId=${args.applicationId}`,
  failure: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=failure&paymentId=${paymentId}&applicationId=${args.applicationId}`,
  cancel: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=cancel&paymentId=${paymentId}&applicationId=${args.applicationId}`,
}
```

---

## Centralization Strategy

### ✅ **Recommended Approach: Environment Variables**

Create a centralized configuration for all payment URLs.

### Step 1: Backend Environment Variables

**File:** `backend/.env` or `backend/.env.local`

```bash
# Development
CONVEX_URL=http://localhost:3000
APP_BASE_URL=http://localhost:8081
MAYA_REDIRECT_BASE_URL=http://localhost:3000
MAYA_WEBHOOK_URL=http://localhost:3000/api/webhooks/maya

# Production (Free Hosting Example)
CONVEX_URL=https://emedicard-api.vercel.app
APP_BASE_URL=https://emedicard-app.netlify.app
MAYA_REDIRECT_BASE_URL=https://emedicard-api.vercel.app
MAYA_WEBHOOK_URL=https://emedicard-api.vercel.app/api/webhooks/maya
```

### Step 2: Create Configuration File

**Create:** `backend/convex/config/urls.ts`

```typescript
/**
 * Centralized URL Configuration
 * All payment and app URLs in one place
 */

export const URLs = {
  // Base URLs
  api: process.env.CONVEX_URL || 'http://localhost:3000',
  app: process.env.APP_BASE_URL || 'http://localhost:8081',
  
  // Payment Redirect URLs
  payment: {
    redirect: {
      base: process.env.MAYA_REDIRECT_BASE_URL || process.env.CONVEX_URL || 'http://localhost:3000',
      success: (paymentId: string, applicationId: string) => 
        `${URLs.payment.redirect.base}/payment-redirect?status=success&paymentId=${paymentId}&applicationId=${applicationId}`,
      failure: (paymentId: string, applicationId: string) => 
        `${URLs.payment.redirect.base}/payment-redirect?status=failure&paymentId=${paymentId}&applicationId=${applicationId}`,
      cancel: (paymentId: string, applicationId: string) => 
        `${URLs.payment.redirect.base}/payment-redirect?status=cancel&paymentId=${paymentId}&applicationId=${applicationId}`,
    },
    webhook: process.env.MAYA_WEBHOOK_URL || `${process.env.CONVEX_URL}/api/webhooks/maya`,
  },
  
  // Verification URL (for QR codes and sharing)
  verification: {
    base: process.env.VERIFICATION_URL || process.env.CONVEX_URL || 'http://localhost:3000',
    card: (registrationNumber: string) => 
      `${URLs.verification.base}/verify/${registrationNumber}`,
  },
  
  // Deep Link Schemes
  deepLink: {
    app: 'emedicard://',
    payment: {
      success: 'emedicard://payment/success',
      failure: 'emedicard://payment/failure',
      cancel: 'emedicard://payment/cancel',
    },
  },
} as const;

// Type exports
export type UrlConfig = typeof URLs;
```

### Step 3: Update Backend Payment Code

**File:** `backend/convex/payments/maya/checkout.ts`

**Before:**
```typescript
redirectUrl: {
  success: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=success&paymentId=${paymentId}&applicationId=${args.applicationId}`,
  failure: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=failure&paymentId=${paymentId}&applicationId=${args.applicationId}`,
  cancel: `${process.env.CONVEX_URL || 'https://your-app.convex.site'}/payment-redirect?status=cancel&paymentId=${paymentId}&applicationId=${args.applicationId}`,
}
```

**After:**
```typescript
import { URLs } from '../../config/urls';

// ...

redirectUrl: {
  success: URLs.payment.redirect.success(paymentId, args.applicationId),
  failure: URLs.payment.redirect.failure(paymentId, args.applicationId),
  cancel: URLs.payment.redirect.cancel(paymentId, args.applicationId),
}
```

---

## Frontend Configuration (Optional)

If you need to reference payment URLs in the mobile app:

**Create:** `src/config/urls.ts`

```typescript
/**
 * Frontend URL Configuration
 */

const isDev = process.env.NODE_ENV === 'development';

export const AppURLs = {
  // API Base
  api: process.env.EXPO_PUBLIC_API_URL || (isDev 
    ? 'http://localhost:3000' 
    : 'https://emedicard-api.vercel.app'),
  
  // Verification
  verification: process.env.EXPO_PUBLIC_VERIFICATION_URL || (isDev
    ? 'http://localhost:3000'
    : 'https://emedicard-verify.vercel.app'),
  
  // Deep Links
  deepLink: {
    scheme: 'emedicard://',
    payment: {
      success: 'emedicard://payment/success',
      failure: 'emedicard://payment/failure',
      cancel: 'emedicard://payment/cancel',
    },
  },
} as const;
```

**Frontend `.env` files:**

**`.env.development`**
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_VERIFICATION_URL=http://localhost:3000
EXPO_PUBLIC_APP_ENV=development
```

**`.env.production`**
```bash
# Update with your actual free hosting domains
EXPO_PUBLIC_API_URL=https://emedicard-api.vercel.app
EXPO_PUBLIC_VERIFICATION_URL=https://emedicard-verify.vercel.app
EXPO_PUBLIC_APP_ENV=production
```

---

## Payment Flow URLs Explained

### 1. **Redirect URLs** (Web-based return)
When user completes payment in browser:
```
https://your-backend.vercel.app/payment-redirect?status=success&paymentId=xxx&applicationId=yyy
```

**Purpose:** Maya redirects browser back to your backend
**Handler:** Backend processes the redirect and updates payment status
**Then:** Backend can show a success page or deep link back to app

### 2. **Webhook URL** (Server-to-server)
Maya sends payment status updates:
```
https://your-backend.vercel.app/api/webhooks/maya
```

**Purpose:** Real-time payment notifications from Maya
**Security:** Must validate webhook signatures
**Critical:** This ensures payment status sync even if user closes browser

### 3. **Deep Links** (App-to-app return)
When user completes payment in Maya app:
```
emedicard://payment/success?paymentId=xxx&applicationId=yyy
```

**Purpose:** Maya app returns directly to your mobile app
**Handler:** Mobile app's deep link listeners
**Note:** Only works if user has Maya mobile app installed

---

## Free Hosting Deployment Guide

### Recommended Architecture:

```
┌─────────────────────────────────────────────────┐
│                 Free Hosting                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Backend API (Vercel/Railway)                   │
│  ├─ /payment-redirect                           │
│  ├─ /api/webhooks/maya                          │
│  └─ /verify/:registrationNumber                 │
│                                                 │
│  Mobile App (Expo)                              │
│  ├─ Deep link: emedicard://                     │
│  └─ Payment listeners                           │
│                                                 │
│  Database (Convex Cloud)                        │
│  └─ Payment records storage                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Platform-Specific Examples:

#### **Vercel** (Recommended)
```bash
# .env.production
CONVEX_URL=https://emedicard.vercel.app
MAYA_REDIRECT_BASE_URL=https://emedicard.vercel.app
MAYA_WEBHOOK_URL=https://emedicard.vercel.app/api/webhooks/maya
VERIFICATION_URL=https://emedicard.vercel.app
```

#### **Netlify**
```bash
# .env.production
CONVEX_URL=https://emedicard.netlify.app
MAYA_REDIRECT_BASE_URL=https://emedicard.netlify.app
MAYA_WEBHOOK_URL=https://emedicard.netlify.app/.netlify/functions/maya-webhook
VERIFICATION_URL=https://emedicard.netlify.app
```

#### **Railway**
```bash
# .env.production
CONVEX_URL=https://emedicard.up.railway.app
MAYA_REDIRECT_BASE_URL=https://emedicard.up.railway.app
MAYA_WEBHOOK_URL=https://emedicard.up.railway.app/api/webhooks/maya
VERIFICATION_URL=https://emedicard.up.railway.app
```

---

## Testing Checklist

Before production deployment:

### Backend URLs:
- [ ] Update `CONVEX_URL` in backend environment
- [ ] Update `MAYA_REDIRECT_BASE_URL` in backend environment
- [ ] Update `MAYA_WEBHOOK_URL` in backend environment
- [ ] Create centralized `config/urls.ts` file
- [ ] Update `checkout.ts` to use centralized URLs
- [ ] Test redirect URLs return correct responses
- [ ] Verify webhook URL is accessible from internet
- [ ] Configure Maya dashboard with webhook URL

### Frontend URLs:
- [ ] Update `EXPO_PUBLIC_API_URL` in mobile app
- [ ] Update `EXPO_PUBLIC_VERIFICATION_URL` in mobile app
- [ ] Test deep link handling in app
- [ ] Verify payment success/failure flows
- [ ] Test with both Maya app and browser fallback

### Maya Dashboard Configuration:
- [ ] Register webhook URL in Maya dashboard
- [ ] Set redirect URLs for success/failure/cancel
- [ ] Test with Maya sandbox environment first
- [ ] Verify production API keys are set

---

## Security Considerations

1. **HTTPS Only:** All production URLs must use HTTPS
2. **Webhook Signatures:** Always validate Maya webhook signatures
3. **Environment Variables:** Never commit API keys or secrets
4. **CORS:** Configure CORS properly for payment redirects
5. **Rate Limiting:** Implement rate limits on payment endpoints
6. **Logging:** Log all payment transactions for audit trail

---

## Related Files

### Backend:
- `backend/convex/payments/maya/checkout.ts` - Creates checkout sessions with redirect URLs
- `backend/convex/payments/maya/webhook.ts` - Handles Maya webhook callbacks
- `backend/convex/config/urls.ts` - Centralized URL configuration (to create)

### Frontend:
- `src/processes/mayaPaymentFlow/lib/maya-app-integration.ts` - Opens Maya checkout
- `src/processes/mayaPaymentFlow/lib/deep-link-handler.ts` - Handles deep link returns
- `src/config/urls.ts` - Frontend URL configuration (optional, to create)

---

## Maya Dashboard Setup

After deployment, configure in Maya Partner Portal:

1. **Login:** https://dashboard.maya.ph/
2. **Navigate to:** Settings → Webhooks
3. **Add Webhook URL:** Your `MAYA_WEBHOOK_URL`
4. **Select Events:**
   - `PAYMENT_SUCCESS`
   - `PAYMENT_FAILED`
   - `PAYMENT_EXPIRED`
5. **Save webhook secret** to environment variables

---

## Contact

For questions about payment integration:
- Mobile Team: [Your contact]
- Backend Team: [Backend contact]
- Maya Support: developers@maya.ph

---

**Last Updated:** 2025-11-10  
**Version:** 1.0  
**Status:** 🔴 Requires action before production deployment  
**Priority:** 🔥 CRITICAL - Payment URLs must be configured for Maya integration to work
