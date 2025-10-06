# Maya Payment Integration Implementation Plan
## eMediCard Project

---

## 📋 Executive Summary

This plan outlines the integration of Maya payment gateway into the eMediCard project using REST API approach. The integration will enable secure online payments for health card applications while maintaining the existing payment infrastructure.

---

## 🎯 Integration Approach

**Selected Method:** REST API Integration
- **Why REST API:** Platform-independent, works with React Native and Next.js
- **Architecture:** Server-side processing via Convex backend
- **Security:** API keys stored in backend, no client-side exposure

---

## 📊 Current vs. Proposed Payment Schema

### Current Schema Analysis
Your existing payment schema is well-structured but needs minor enhancements for Maya integration:

```typescript
// Current payments table
payments: defineTable({
  applicationId: v.id("applications"),
  amount: v.float64(),
  serviceFee: v.float64(),
  netAmount: v.float64(),
  paymentMethod: v.union(
    v.literal("Gcash"),
    v.literal("Maya"),  // ✅ Already supports Maya
    v.literal("BaranggayHall"),
    v.literal("CityHall")
  ),
  referenceNumber: v.string(),
  receiptStorageId: v.optional(v.id("_storage")),
  paymentStatus: v.union(
    v.literal("Pending"),
    v.literal("Complete"),
    v.literal("Failed"),
    v.literal("Refunded"),
    v.literal("Cancelled")
  ),
  updatedAt: v.optional(v.float64()),
})
```

### Proposed Schema Enhancements

```typescript
// Enhanced payments table with Maya-specific fields
payments: defineTable({
  // ... existing fields remain unchanged ...
  
  // New Maya-specific fields
  mayaPaymentId: v.optional(v.string()),        // Maya's payment ID
  mayaCheckoutId: v.optional(v.string()),       // Maya checkout session ID
  checkoutUrl: v.optional(v.string()),          // Maya checkout URL
  webhookPayload: v.optional(v.any()),          // Store webhook data for debugging
  paymentProvider: v.optional(v.union(          // Track which provider handled payment
    v.literal("maya_api"),
    v.literal("manual"),
    v.literal("cash")
  )),
  transactionFee: v.optional(v.float64()),      // Maya transaction fees
  settlementDate: v.optional(v.float64()),      // When funds will be settled
  failureReason: v.optional(v.string()),        // Reason for failed payments
  
  // Keep existing fields
  applicationId: v.id("applications"),
  amount: v.float64(),
  serviceFee: v.float64(),
  netAmount: v.float64(),
  paymentMethod: v.union(
    v.literal("Gcash"),
    v.literal("Maya"),
    v.literal("BaranggayHall"),
    v.literal("CityHall")
  ),
  referenceNumber: v.string(),
  receiptStorageId: v.optional(v.id("_storage")),
  paymentStatus: v.union(
    v.literal("Pending"),
    v.literal("Processing"),  // New status for Maya checkout
    v.literal("Complete"),
    v.literal("Failed"),
    v.literal("Refunded"),
    v.literal("Cancelled"),
    v.literal("Expired")      // New status for expired checkouts
  ),
  updatedAt: v.optional(v.float64()),
}).index("by_application", ["applicationId"])
  .index("by_maya_payment", ["mayaPaymentId"])  // New index for Maya lookups
```

---

## 🏗️ Implementation Phases

### **Phase 1: Backend Infrastructure (Week 1)**

#### Progress Tracking

##### Environment & Setup
- [x] Create Git branch for Maya payment integration
- [x] Update integration plan with progress tracking
- [x] Set up environment configuration files
- [x] Configure Convex environment variables

##### API Client Development  
- [x] Create Maya API client structure
- [x] Implement authentication headers
- [x] Create HTTP client with error handling
- [x] Add request/response logging

##### Core Payment Functions
- [x] Create checkout session function
- [x] Implement payment status checking
- [x] Add payment confirmation handler
- [ ] Create refund processing function

##### Database Schema Updates
- [x] Add Maya-specific fields to payments table
- [x] Create payment_logs table for audit
- [x] Add indexes for Maya payment lookups
- [x] Update schema TypeScript definitions

##### Testing Setup
- [ ] Create test environment configuration
- [ ] Set up Maya sandbox credentials
- [ ] Create unit test structure
- [ ] Add integration test helpers

#### 1.1 Environment Configuration
```bash
# .env.local (backend/convex)
MAYA_PUBLIC_KEY=pk-Z0OSzLvIcOI2UIvDhdTGVVfRSSeiGStnceqwUE7n0Ah
MAYA_SECRET_KEY=sk-X8qolYjy62kIzEbr0QRK1h4b4KDVHaNcwMYk39jInSl
MAYA_API_URL=https://pg-sandbox.paymaya.com
MAYA_WEBHOOK_SECRET=whsec_xxx
```

#### 1.2 Maya API Client
```typescript
// backend/convex/payments/maya/client.ts
import { httpAction } from "../../_generated/server";

const MAYA_CONFIG = {
  apiUrl: process.env.MAYA_API_URL!,
  publicKey: process.env.MAYA_PUBLIC_KEY!,
  secretKey: process.env.MAYA_SECRET_KEY!,
};

export const createMayaHeaders = (useSecret = false) => {
  const key = useSecret ? MAYA_CONFIG.secretKey : MAYA_CONFIG.publicKey;
  const encoded = Buffer.from(`${key}:`).toString('base64');
  return {
    'Authorization': `Basic ${encoded}`,
    'Content-Type': 'application/json',
  };
};

export const mayaApiCall = async (
  endpoint: string,
  method: string,
  data?: any,
  useSecret = false
) => {
  const response = await fetch(`${MAYA_CONFIG.apiUrl}${endpoint}`, {
    method,
    headers: createMayaHeaders(useSecret),
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Maya API Error: ${error.message || response.statusText}`);
  }

  return response.json();
};
```

#### 1.3 Core Payment Functions
```typescript
// backend/convex/payments/maya/checkout.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { mayaApiCall } from "./client";

export const createMayaCheckout = mutation({
  args: {
    applicationId: v.id("applications"),
    amount: v.number(),
    serviceFee: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Validate application
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");
    
    // 2. Get user details
    const user = await ctx.db.get(application.userId);
    if (!user) throw new Error("User not found");
    
    // 3. Calculate total amount
    const totalAmount = args.amount + args.serviceFee;
    
    // 4. Create Maya checkout session
    const checkoutData = {
      totalAmount: {
        value: totalAmount,
        currency: "PHP"
      },
      buyer: {
        firstName: user.fullname.split(' ')[0],
        lastName: user.fullname.split(' ').slice(1).join(' ') || "N/A",
        email: user.email,
        phone: user.phoneNumber || "",
      },
      items: [
        {
          name: "Health Card Application",
          quantity: 1,
          amount: {
            value: args.amount
          }
        },
        {
          name: "Service Fee",
          quantity: 1,
          amount: {
            value: args.serviceFee
          }
        }
      ],
      requestReferenceNumber: `EMC-${application._id}-${Date.now()}`,
      redirectUrl: {
        success: `${process.env.APP_URL}/payment/success`,
        failure: `${process.env.APP_URL}/payment/failure`,
        cancel: `${process.env.APP_URL}/payment/cancel`
      }
    };
    
    const mayaResponse = await mayaApiCall('/checkout/v1/checkouts', 'POST', checkoutData);
    
    // 5. Create payment record
    const paymentId = await ctx.db.insert("payments", {
      applicationId: args.applicationId,
      amount: args.amount,
      serviceFee: args.serviceFee,
      netAmount: totalAmount,
      paymentMethod: "Maya",
      referenceNumber: checkoutData.requestReferenceNumber,
      paymentStatus: "Processing",
      mayaCheckoutId: mayaResponse.checkoutId,
      mayaPaymentId: mayaResponse.paymentId,
      checkoutUrl: mayaResponse.redirectUrl,
      paymentProvider: "maya_api",
      updatedAt: Date.now(),
    });
    
    // 6. Update application status
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "For Payment Validation",
      updatedAt: Date.now(),
    });
    
    return {
      paymentId,
      checkoutUrl: mayaResponse.redirectUrl,
      checkoutId: mayaResponse.checkoutId,
    };
  },
});
```

### **Phase 2: Webhook Integration (Week 1-2)**

#### Progress Tracking

##### Webhook Setup
- [x] Create HTTP action for webhook endpoint
- [x] Implement signature verification
- [x] Parse webhook payload
- [x] Handle different event types

##### Status Handlers
- [x] Implement payment success handler (already done in statusUpdates.ts)
- [x] Implement payment failed handler (already done in statusUpdates.ts)
- [x] Implement payment expired handler (already done in statusUpdates.ts)
- [x] Add idempotency checks

##### Webhook Registration
- [ ] Register webhook URL with Maya
- [ ] Configure webhook events to listen for
- [ ] Test webhook delivery in sandbox
- [ ] Implement retry mechanism

#### 2.1 Webhook Handler
```typescript
// backend/convex/payments/maya/webhook.ts
import { httpAction } from "../../_generated/server";
import { api } from "../../_generated/api";
import crypto from "crypto";

export const handleMayaWebhook = httpAction(async (ctx, request) => {
  // 1. Verify webhook signature
  const signature = request.headers.get("Maya-Signature");
  const body = await request.text();
  
  const expectedSignature = crypto
    .createHmac("sha256", process.env.MAYA_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  
  if (signature !== expectedSignature) {
    return new Response("Invalid signature", { status: 401 });
  }
  
  // 2. Parse webhook data
  const data = JSON.parse(body);
  
  // 3. Handle different event types
  switch (data.paymentStatus) {
    case "PAYMENT_SUCCESS":
      await ctx.runMutation(api.payments.maya.updatePaymentSuccess, {
        mayaPaymentId: data.id,
        webhookData: data,
      });
      break;
      
    case "PAYMENT_FAILED":
      await ctx.runMutation(api.payments.maya.updatePaymentFailed, {
        mayaPaymentId: data.id,
        failureReason: data.failureReason,
        webhookData: data,
      });
      break;
      
    case "PAYMENT_EXPIRED":
      await ctx.runMutation(api.payments.maya.updatePaymentExpired, {
        mayaPaymentId: data.id,
        webhookData: data,
      });
      break;
  }
  
  return new Response("OK", { status: 200 });
});
```

#### 2.2 Payment Status Update Functions
```typescript
// backend/convex/payments/maya/statusUpdates.ts
import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const updatePaymentSuccess = mutation({
  args: {
    mayaPaymentId: v.string(),
    webhookData: v.any(),
  },
  handler: async (ctx, args) => {
    // Find payment by Maya ID
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_maya_payment", q => q.eq("mayaPaymentId", args.mayaPaymentId))
      .unique();
    
    if (!payment) {
      console.error("Payment not found for Maya ID:", args.mayaPaymentId);
      return;
    }
    
    // Update payment status
    await ctx.db.patch(payment._id, {
      paymentStatus: "Complete",
      webhookPayload: args.webhookData,
      updatedAt: Date.now(),
    });
    
    // Update application status
    const application = await ctx.db.get(payment.applicationId);
    if (application) {
      await ctx.db.patch(application._id, {
        applicationStatus: "For Orientation",
        updatedAt: Date.now(),
      });
      
      // Send notification
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: application._id,
        title: "Payment Successful",
        message: "Your payment has been confirmed. Please proceed to orientation scheduling.",
        notificationType: "Payment",
        isRead: false,
      });
    }
  },
});
```

### **Phase 3: Mobile App Integration (Week 2)**

#### Progress Tracking

##### React Native Integration
- [x] Create usePaymentMaya hook (created in src/hooks/usePaymentMaya.ts)
- [x] Implement WebBrowser integration (using expo-web-browser)
- [x] Add deep linking support (Linking API integrated)
- [x] Handle payment callbacks (success/failure/cancelled states)

##### UI Components
- [x] Create MayaPaymentButton component (integrated in EnhancedPaymentScreen)
- [x] Build PaymentStatus display component (integrated in usePaymentMaya hook)
- [ ] Create PaymentReceipt component
- [x] Add loading states and animations (LoadingSpinner in EnhancedPaymentScreen)

##### Payment Flow
- [x] Integrate with application submission flow (EnhancedPaymentScreen)
- [x] Handle payment retry logic (resetPayment function in hook)
- [x] Add error recovery mechanisms (error states and retries)
- [x] Implement timeout handling (in payment status sync)

##### Testing
- [ ] Test in-app browser flow
- [ ] Test deep linking returns
- [ ] Test error scenarios
- [ ] Test on iOS and Android

#### 3.1 Payment Hook
```typescript
// apps/mobile/src/hooks/usePaymentMaya.ts
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../backend/convex/_generated/api";
import { Id } from "../../../backend/convex/_generated/dataModel";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

export const usePaymentMaya = () => {
  const createCheckout = useMutation(api.payments.maya.createMayaCheckout);
  const getPaymentStatus = useQuery(api.payments.getForApplication);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | 'cancelled' | null>(null);
  
  const initiatePayment = async (
    applicationId: Id<"applications">,
    amount: number,
    serviceFee: number
  ) => {
    try {
      setIsProcessing(true);
      setPaymentResult(null);
      
      // 1. Create checkout session
      const { checkoutUrl, paymentId, checkoutId } = await createCheckout({
        applicationId,
        amount,
        serviceFee,
      });
      
      // 2. Open Maya checkout in in-app browser
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        showTitle: true,
        enableBarCollapsing: false,
        dismissButtonStyle: 'close',
      });
      
      // 3. Handle browser close
      if (result.type === 'dismiss') {
        // User closed the browser, check payment status
        const paymentStatus = await getPaymentStatus({ applicationId });
        
        if (paymentStatus?.paymentStatus === 'Complete') {
          setPaymentResult('success');
          return { success: true, paymentId };
        } else if (paymentStatus?.paymentStatus === 'Failed') {
          setPaymentResult('failed');
          return { success: false, reason: 'Payment failed' };
        } else {
          setPaymentResult('cancelled');
          return { success: false, reason: 'Payment cancelled' };
        }
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentResult('failed');
      return { 
        success: false, 
        reason: error instanceof Error ? error.message : 'Payment failed' 
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Set up deep linking to handle redirect from Maya
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url.includes('/payment/success')) {
        setPaymentResult('success');
      } else if (url.includes('/payment/failure')) {
        setPaymentResult('failed');
      } else if (url.includes('/payment/cancel')) {
        setPaymentResult('cancelled');
      }
    };
    
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  return {
    initiatePayment,
    isProcessing,
    paymentResult,
  };
};
```

#### 3.2 Payment UI Component
```typescript
// apps/mobile/src/components/payment/MayaPaymentButton.tsx
import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { usePaymentMaya } from '../../hooks/usePaymentMaya';
import { Id } from '../../../../backend/convex/_generated/dataModel';

interface MayaPaymentButtonProps {
  applicationId: Id<"applications">;
  amount: number;
  serviceFee: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const MayaPaymentButton: React.FC<MayaPaymentButtonProps> = ({
  applicationId,
  amount,
  serviceFee,
  onSuccess,
  onError,
}) => {
  const { initiatePayment, isProcessing, paymentResult } = usePaymentMaya();
  
  const handlePayment = async () => {
    const result = await initiatePayment(applicationId, amount, serviceFee);
    
    if (result.success) {
      onSuccess?.();
    } else {
      onError?.(result.reason || 'Payment failed');
    }
  };
  
  if (isProcessing) {
    return (
      <View className="bg-green-500 p-4 rounded-lg items-center">
        <ActivityIndicator color="white" />
        <Text className="text-white mt-2">Processing payment...</Text>
      </View>
    );
  }
  
  return (
    <TouchableOpacity
      onPress={handlePayment}
      className="bg-green-500 p-4 rounded-lg items-center"
      disabled={isProcessing}
    >
      <Text className="text-white font-bold text-lg">Pay with Maya</Text>
      <Text className="text-white text-sm mt-1">
        Total: ₱{(amount + serviceFee).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};
```

### **Phase 4: Testing & Deployment (Week 3)**

#### Progress Tracking

##### Sandbox Testing
- [ ] Create Maya sandbox account
- [ ] Generate test API keys
- [ ] Test checkout creation
- [ ] Test payment success flow
- [ ] Test payment failure scenarios
- [ ] Test webhook delivery
- [ ] Test refund process
- [ ] Test error handling
- [ ] Test network failures
- [ ] Test timeout scenarios

##### Integration Testing
- [ ] End-to-end payment flow test
- [ ] Test with different payment methods
- [ ] Test concurrent payments
- [ ] Test edge cases

##### Production Preparation
- [ ] Security review
- [ ] Load testing
- [ ] Documentation update
- [ ] Create deployment guide

##### Go-Live
- [ ] Production API keys setup
- [ ] Production webhook registration
- [ ] Deploy backend changes
- [ ] Deploy mobile app update
- [ ] Monitor first transactions

#### 4.1 Test Scenarios
```typescript
// backend/convex/payments/maya/__tests__/checkout.test.ts
describe('Maya Payment Integration', () => {
  test('Create checkout session', async () => {
    // Test checkout creation
  });
  
  test('Handle successful payment webhook', async () => {
    // Test success webhook
  });
  
  test('Handle failed payment webhook', async () => {
    // Test failure webhook
  });
  
  test('Handle expired checkout', async () => {
    // Test expiry handling
  });
});
```

#### 4.2 Sandbox Testing Checklist
- [ ] Create Maya sandbox account
- [ ] Generate test API keys
- [ ] Test checkout creation
- [ ] Test payment success flow
- [ ] Test payment failure scenarios
- [ ] Test webhook delivery
- [ ] Test refund process
- [ ] Test error handling
- [ ] Test network failures
- [ ] Test timeout scenarios

---

## 📁 Project Structure

```
backend/convex/
├── payments/
│   ├── maya/
│   │   ├── client.ts           # Maya API client
│   │   ├── checkout.ts         # Checkout creation
│   │   ├── webhook.ts          # Webhook handler
│   │   ├── statusUpdates.ts    # Status update functions
│   │   ├── refund.ts           # Refund handling
│   │   └── reconciliation.ts   # Payment reconciliation
│   ├── createPayment.ts        # Updated for Maya
│   └── updatePaymentStatus.ts  # Updated for Maya

apps/mobile/src/
├── hooks/
│   ├── usePaymentMaya.ts       # Maya payment hook
│   └── usePaymentStatus.ts     # Payment status polling
├── components/
│   └── payment/
│       ├── MayaPaymentButton.tsx
│       ├── PaymentStatus.tsx
│       └── PaymentReceipt.tsx
```

---

## 🔐 Security Considerations

1. **API Key Management**
   - Store keys in environment variables
   - Never expose keys in client code
   - Rotate keys regularly
   - Use separate keys for sandbox/production

2. **Webhook Security**
   - Verify webhook signatures
   - Whitelist Maya IP addresses
   - Implement idempotency checks
   - Log all webhook events

3. **PCI Compliance**
   - Never store card details
   - Use Maya's hosted checkout
   - Implement proper SSL/TLS
   - Regular security audits

---

## 📈 Monitoring & Logging

```typescript
// backend/convex/payments/maya/logging.ts
export const logPaymentEvent = async (ctx, event: {
  type: 'checkout_created' | 'payment_success' | 'payment_failed' | 'webhook_received',
  paymentId?: string,
  mayaPaymentId?: string,
  amount?: number,
  error?: string,
}) => {
  console.log('[Maya Payment]', {
    timestamp: new Date().toISOString(),
    ...event,
  });
  
  // Optional: Store in database for audit trail
  await ctx.db.insert("payment_logs", {
    ...event,
    timestamp: Date.now(),
  });
};
```

---

## 🚀 Deployment Checklist

### Pre-Production
- [ ] Complete sandbox testing
- [ ] Security review
- [ ] Load testing
- [ ] Error handling verification
- [ ] Documentation complete

### Production Setup
- [ ] Production API keys configured
- [ ] Production webhook URL registered
- [ ] SSL certificates verified
- [ ] Monitoring alerts configured
- [ ] Backup payment methods ready

### Go-Live
- [ ] Deploy backend changes
- [ ] Deploy mobile app update
- [ ] Monitor first transactions
- [ ] Verify webhook delivery
- [ ] Check settlement reports

---

## 📊 Success Metrics

- Payment success rate > 95%
- Checkout abandonment rate < 20%
- Average payment processing time < 30 seconds
- Zero security incidents
- 100% webhook delivery rate

---

## 📚 Resources

- [Maya Developer Documentation](https://developers.maya.ph)
- [Maya Sandbox Environment](https://pg-sandbox.paymaya.com)
- [Maya Support](mailto:developers@maya.ph)
- [API Reference](https://developers.maya.ph/reference)

---

## 🎯 Timeline

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1 | Backend Infrastructure | API client, checkout creation, basic functions |
| 1-2 | Webhook Integration | Webhook handler, status updates, notifications |
| 2 | Mobile Integration | Payment hook, UI components, deep linking |
| 3 | Testing & Refinement | End-to-end testing, error handling, edge cases |
| 4 | Production Deployment | Production setup, monitoring, go-live |

---

## 🔄 Backward Compatibility

The implementation maintains full backward compatibility:
- Existing payment methods (GCash, cash) continue to work
- Current payment records remain unchanged
- New fields are optional
- Gradual migration path available

---

## ✅ Next Steps

1. **Immediate Actions:**
   - Request Maya sandbox account
   - Review and approve schema changes
   - Set up development environment

2. **Development Start:**
   - Implement Phase 1 backend infrastructure
   - Begin integration testing
   - Create UI mockups

3. **Stakeholder Communication:**
   - Update team on timeline
   - Schedule testing sessions
   - Prepare user documentation

---

*This plan is a living document and will be updated as the integration progresses.*
