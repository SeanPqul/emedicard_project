# Maya Webhook Debugging Guide
## eMediCard Project

---

## 🔍 Overview

This guide helps you debug Maya payment webhook integration issues. The webhook is crucial for receiving real-time payment status updates from Maya.

---

## 🏗️ Current Architecture

### Webhook Flow
1. **Maya sends webhook** → Your endpoint at `/maya-webhook`
2. **Signature validation** → Verify the request is from Maya
3. **Event processing** → Handle different payment statuses
4. **Database updates** → Update payment and application records
5. **User notifications** → Send notifications to users

### Key Files
- `backend/convex/http.ts` - HTTP router configuration
- `backend/convex/payments/maya/webhook.ts` - Main webhook handler
- `backend/convex/payments/maya/statusUpdates.ts` - Status update functions
- `backend/convex/payments/maya/client.ts` - Signature validation

---

## 🐛 Common Webhook Issues

### 1. Webhook Not Receiving Events

**Symptoms:**
- No logs showing webhook requests
- Maya dashboard shows webhook failures

**Solutions:**
```bash
# Check if your webhook URL is accessible
curl -X POST https://your-domain.com/maya-webhook

# For local development, use ngrok
ngrok http 3000
# Then update Maya webhook URL to the ngrok URL
```

### 2. Signature Validation Failures

**Symptoms:**
- Getting 401 Unauthorized responses
- "Invalid signature" errors in logs

**Debug Steps:**
```javascript
// In webhook.ts, temporarily add logging
console.log("Received signature:", signature);
console.log("Webhook body:", body);
console.log("Webhook secret exists:", !!process.env.MAYA_WEBHOOK_SECRET);
```

**Common Causes:**
- Wrong `MAYA_WEBHOOK_SECRET` in environment
- Webhook secret not set in Convex environment
- Character encoding issues

### 3. Payment Not Found Errors

**Symptoms:**
- "Payment not found for Maya ID" in logs
- Orphaned webhook events

**Debug Steps:**
```javascript
// Check if payment exists in database
// In Convex dashboard, run this query:
db.payments
  .filter(q => q.eq(q.field("mayaPaymentId"), "your_maya_payment_id"))
  .collect()
```

**Solutions:**
- Ensure payment record is created before webhook arrives
- Check if `mayaPaymentId` is properly stored during checkout creation
- Verify the index `by_maya_payment` exists in schema

### 4. Status Not Updating

**Symptoms:**
- Webhook received but payment status unchanged
- Application status not progressing

**Debug Steps:**
1. Check payment logs table for webhook events
2. Verify status mapping in constants
3. Check for duplicate prevention logic

---

## 🧪 Testing Webhooks

### Local Testing with Test Script

```bash
# Navigate to the test script directory
cd backend/convex/payments/maya

# Test connectivity
node test-webhook.js connectivity

# Test signature validation
node test-webhook.js signature

# Test all events
WEBHOOK_URL=http://localhost:3000/maya-webhook \
MAYA_WEBHOOK_SECRET=your_secret_here \
node test-webhook.js test

# Test specific payment
node test-webhook.js payment pay_123456789
```

### Using Convex Dev Environment

```bash
# Start Convex in development mode with logs
npx convex dev --verbose

# In another terminal, run the webhook test
cd backend/convex/payments/maya
node test-webhook.js test
```

### Production Testing

1. **Check Maya Dashboard:**
   - Go to Maya Developer Dashboard
   - Navigate to Webhooks section
   - Check webhook delivery status
   - View failed webhook attempts

2. **Verify Webhook Registration:**
   ```bash
   # List registered webhooks (using Maya API)
   curl -X GET https://pg-sandbox.paymaya.com/checkout/v1/webhooks \
     -H "Authorization: Basic $(echo -n 'sk-YOUR_SECRET_KEY:' | base64)"
   ```

3. **Test with Real Payment:**
   - Create a test checkout session
   - Complete payment in sandbox
   - Monitor webhook logs

---

## 📊 Debugging Checklist

### Environment Setup
- [ ] `MAYA_API_URL` is set correctly (sandbox vs production)
- [ ] `MAYA_PUBLIC_KEY` is configured
- [ ] `MAYA_SECRET_KEY` is configured
- [ ] `MAYA_WEBHOOK_SECRET` is configured in Convex environment
- [ ] Webhook URL is registered with Maya

### Database Schema
- [ ] `payments` table has Maya-specific fields
- [ ] `by_maya_payment` index exists
- [ ] `paymentLogs` table exists for audit trail

### Code Verification
- [ ] Webhook endpoint is properly routed in `http.ts`
- [ ] Signature validation is working
- [ ] All payment status mappings are correct
- [ ] Error handling doesn't swallow exceptions

### Network & Security
- [ ] Webhook endpoint is publicly accessible
- [ ] SSL certificate is valid (for production)
- [ ] No firewall blocking Maya IPs
- [ ] Request timeout is sufficient (30s recommended)

---

## 📝 Logging & Monitoring

### Add Enhanced Logging

```typescript
// In webhook.ts, add detailed logging
export const handleMayaWebhook = httpAction(async (ctx, request: Request) => {
  const requestId = `webhook_${Date.now()}`;
  console.log(`[${requestId}] Webhook received`);
  
  try {
    // Log headers
    console.log(`[${requestId}] Headers:`, {
      signature: request.headers.get(MAYA_HEADERS.SIGNATURE),
      contentType: request.headers.get('Content-Type'),
    });
    
    // ... rest of the handler
  } catch (error) {
    console.error(`[${requestId}] Webhook error:`, error);
  }
});
```

### Monitor Payment Logs

```javascript
// Query payment logs in Convex dashboard
db.paymentLogs
  .filter(q => q.gte(q.field("timestamp"), Date.now() - 86400000)) // Last 24 hours
  .order("desc")
  .take(100)
```

---

## 🚨 Emergency Response

### If Webhooks Stop Working

1. **Immediate Actions:**
   ```bash
   # Check if endpoint is accessible
   curl -I https://your-domain.com/maya-webhook
   
   # Check Convex logs
   npx convex logs --follow
   ```

2. **Fallback Mechanism:**
   - Implement payment status polling
   - Use `syncPaymentStatus` mutation periodically
   - Check payment status on user action

3. **Recovery Steps:**
   - Re-register webhook with Maya
   - Process missed webhooks from Maya dashboard
   - Reconcile payment statuses

### Manual Status Sync

```javascript
// Manually sync a payment status
// Run in Convex dashboard
await ctx.runMutation("payments:maya:statusUpdates:syncPaymentStatus", {
  paymentId: "payment_id_here"
});
```

---

## 🔗 Useful Resources

### Maya Documentation
- [Webhook Integration Guide](https://developers.maya.ph/docs/webhooks)
- [Webhook Events Reference](https://developers.maya.ph/reference/webhook-events)
- [Signature Validation](https://developers.maya.ph/docs/webhook-signature)

### Debugging Tools
- [ngrok](https://ngrok.com/) - Expose local server for webhook testing
- [RequestBin](https://requestbin.com/) - Inspect webhook payloads
- [Postman](https://www.postman.com/) - Test webhook endpoints

### Support Contacts
- Maya Developer Support: developers@maya.ph
- Maya Technical Documentation: https://developers.maya.ph

---

## 📈 Best Practices

1. **Always Log Webhook Events**
   - Store raw payload for debugging
   - Log processing results
   - Track webhook performance

2. **Implement Idempotency**
   - Prevent duplicate processing
   - Handle webhook retries gracefully
   - Use Maya payment ID as unique key

3. **Handle All Status Types**
   - Don't assume only success events
   - Process failures and expirations
   - Handle edge cases

4. **Monitor Webhook Health**
   - Set up alerts for webhook failures
   - Track webhook processing time
   - Monitor for missing webhooks

5. **Secure Your Endpoint**
   - Always validate signatures
   - Use HTTPS in production
   - Implement rate limiting
   - Whitelist Maya IPs if possible

---

## 🆘 Troubleshooting Commands

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/maya-webhook \
  -H "Content-Type: application/json" \
  -H "Maya-Signature: test" \
  -d '{"test": true}'

# Check Convex environment variables
npx convex env list

# Set webhook secret in Convex
npx convex env set MAYA_WEBHOOK_SECRET "your_webhook_secret"

# View recent Convex logs
npx convex logs --since 1h

# Test with actual Maya webhook
cd backend/convex/payments/maya
WEBHOOK_URL=https://your-domain.com/maya-webhook \
MAYA_WEBHOOK_SECRET=your_actual_secret \
node test-webhook.js test
```

---

*Remember: Always test webhooks in sandbox environment before going to production!*
