# Maya Payment Integration Setup Guide

This guide explains how to set up and configure Maya payment integration for the eMediCard application.

## Overview

The Maya payment integration uses a redirect flow:
1. User initiates payment from mobile app
2. Maya checkout session is created with redirect URLs pointing to Convex HTTP endpoints
3. User completes payment in Maya (browser or Maya app)
4. Maya redirects to Convex HTTP endpoint
5. Convex endpoint updates payment status and redirects to mobile app via deep link

## Environment Variables

### Required Environment Variables

Add these to your `.env.local` file for Convex:

```env
# Maya API Configuration
MAYA_API_URL=https://pg-sandbox.paymaya.com  # Use https://pg.paymaya.com for production
MAYA_PUBLIC_KEY=your_maya_public_key_here
MAYA_SECRET_KEY=your_maya_secret_key_here
MAYA_WEBHOOK_SECRET=your_webhook_secret_here

# Convex Public URL (automatically set in production)
CONVEX_URL=https://your-project-name.convex.site
```

### Development vs Production

For development:
```env
MAYA_API_URL=https://pg-sandbox.paymaya.com
MAYA_PUBLIC_KEY=pk-Z0OSzLvIcOI2UIvDhdTGVVfRSSeiGStnceqwUE7n0Ah
MAYA_SECRET_KEY=sk-X8qolYjy62kIzEbr0QRK1h4b4KDVHaNcwMYk39jInSl
```

For production:
```env
MAYA_API_URL=https://pg.paymaya.com
MAYA_PUBLIC_KEY=your_production_public_key
MAYA_SECRET_KEY=your_production_secret_key
```

## Redirect Flow

### 1. Checkout Creation
When creating a checkout, redirect URLs are set as:
```typescript
redirectUrl: {
  success: `${CONVEX_URL}/payment-redirect?status=success&paymentId=${paymentId}&applicationId=${applicationId}`,
  failure: `${CONVEX_URL}/payment-redirect?status=failure&paymentId=${paymentId}&applicationId=${applicationId}`,
  cancel: `${CONVEX_URL}/payment-redirect?status=cancel&paymentId=${paymentId}&applicationId=${applicationId}`,
}
```

### 2. Payment Redirect Handler
The `/payment-redirect` endpoint:
- Receives redirect from Maya
- Updates payment status in database
- Returns HTML that redirects to mobile app

### 3. Mobile App Deep Links
The mobile app handles these deep link patterns:
- Success: `emedicardproject://payment/success?paymentId=xxx&applicationId=yyy`
- Failed: `emedicardproject://payment/failed?paymentId=xxx&applicationId=yyy`  
- Cancelled: `emedicardproject://payment/cancelled?paymentId=xxx&applicationId=yyy`

## Maya Dashboard Configuration

### 1. Webhook URL
Configure in Maya dashboard:
```
https://your-project-name.convex.site/maya-webhook
```

### 2. Allowed Redirect URLs
Add these URLs to Maya's allowed redirect list:
```
https://your-project-name.convex.site/payment-redirect
```

## Testing

### Local Testing with ngrok
For local testing, you can use ngrok to expose your local Convex instance:

1. Install ngrok: `npm install -g ngrok`
2. Run Convex dev server: `npx convex dev`
3. In another terminal: `ngrok http 3000`
4. Update `CONVEX_URL` with the ngrok URL

### Test Payments in Sandbox
Maya sandbox test cards:
- Success: 4111 1111 1111 1111
- Failed: 4000 0000 0000 0002

## Troubleshooting

### Payment Status Not Updating
1. Check webhook configuration in Maya dashboard
2. Verify webhook secret is correct
3. Check payment logs in Convex dashboard
4. Ensure `syncPaymentStatus` is called when user returns

### "Back to Merchant" Button Issues
- The button uses the `cancel` redirect URL
- Ensure `CONVEX_URL` is set correctly
- Check browser console for deep link errors

### Deep Link Not Working
- Ensure app is configured to handle `emedicardproject://` scheme
- Check mobile app linking configuration
- Test with manual redirect button in HTML

## Payment Status Flow

1. **Processing**: Initial status when checkout is created
2. **Complete**: Payment successfully processed
3. **Failed**: Payment failed
4. **Cancelled**: User cancelled payment
5. **Expired**: Checkout session expired

## Security Considerations

1. Always validate webhook signatures
2. Never expose secret keys in client code
3. Use HTTPS for all redirect URLs
4. Implement idempotency for webhook processing
5. Log all payment events for audit trail
