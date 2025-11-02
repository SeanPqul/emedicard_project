# Error Handling & Logging Guide

## 🔐 Security Principles

This application implements **secure error handling** to protect user data and system integrity:

1. **User-Facing Errors**: Always sanitized, user-friendly, and non-technical
2. **Developer Logs**: Detailed technical information ONLY visible in development mode
3. **Production Safety**: Minimal console logs, sensitive data never exposed
4. **Error Tracking**: Production errors sent to secure monitoring services (Sentry, etc.)

---

## 📚 Available Utilities

### 1. **Authentication Errors** (`authErrorHandler.ts`)
For Clerk authentication and login-related errors.

```typescript
import { getUserFriendlyErrorMessage, logAuthError } from '../utils/authErrorHandler';

try {
  await signIn.create({ identifier: email, password });
} catch (err) {
  const userMessage = getUserFriendlyErrorMessage(err);
  setError(userMessage); // Show to user
  logAuthError(err, { email, timestamp: new Date().toISOString() });
}
```

**User sees**: "Invalid email or password. Please try again."  
**Developer sees** (dev mode only): Full error stack, Clerk error codes, browser info, etc.

---

### 2. **General Errors** (`errorLogger.ts`)
For all other application errors (API calls, data processing, etc.)

```typescript
import { logError, getUserFriendlyError, ErrorSeverity } from '../utils/errorLogger';

try {
  const result = await fetchData();
} catch (err) {
  const userMessage = getUserFriendlyError(err);
  showToast(userMessage); // Show to user
  
  logError(err, {
    component: 'PaymentValidation',
    action: 'fetchPaymentData',
    userId: userId
  }, ErrorSeverity.HIGH);
}
```

---

### 3. **Async Error Wrapper**
Automatically handle async errors without repetitive try-catch blocks:

```typescript
import { handleAsyncError } from '../utils/errorLogger';

const data = await handleAsyncError(
  async () => {
    return await api.fetchUserData(userId);
  },
  { component: 'UserProfile', action: 'fetchData' },
  (error) => {
    toast.error('Failed to load user data');
  }
);
```

---

## 🎯 Best Practices

### ✅ DO:
- Use `getUserFriendlyErrorMessage()` or `getUserFriendlyError()` for user-facing messages
- Use `logError()` or `logAuthError()` for developer debugging
- Specify component and action context when logging
- Use appropriate error severity levels
- Test error handling in both development and production builds

### ❌ DON'T:
- Never log passwords, tokens, or API keys
- Don't show technical stack traces to users
- Don't use `console.error()` directly - use logging utilities
- Don't expose database errors or internal system details to users

---

## 🏗️ Error Severity Levels

```typescript
enum ErrorSeverity {
  LOW = 'low',        // Minor issues, doesn't affect functionality
  MEDIUM = 'medium',  // Expected errors (validation, not found, etc.)
  HIGH = 'high',      // Unexpected errors that affect user experience
  CRITICAL = 'critical' // System failures, data loss risks
}
```

---

## 🔍 What Gets Logged Where?

### Development Mode (localhost)
- ✅ Full error stack traces
- ✅ Component context
- ✅ User email (sanitized: `em***@domain.com`)
- ✅ Browser information
- ✅ Network details
- ✅ All console.log/warn/error messages

### Production Mode
- ✅ Error name and severity only
- ✅ Timestamp
- ✅ Component name (no sensitive data)
- ❌ NO stack traces in browser console
- ❌ NO user emails or personal data
- ❌ NO sensitive system information
- ✅ Errors sent to Sentry/monitoring service (when configured)

---

## 🚨 Error Boundary Usage

Wrap components with ErrorBoundary to catch React rendering errors:

```tsx
import { ErrorBoundary } from '../components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## 🎨 Example: Complete Error Handling Flow

```typescript
// Component: PaymentValidation.tsx
import { useState } from 'react';
import { logError, getUserFriendlyError, ErrorSeverity } from '../utils/errorLogger';

export default function PaymentValidation() {
  const [error, setError] = useState('');

  const handleValidatePayment = async () => {
    try {
      setError('');
      const result = await validatePaymentAPI(paymentId);
      
      // Success handling
      toast.success('Payment validated successfully');
    } catch (err) {
      // Get user-friendly message
      const userMessage = getUserFriendlyError(err);
      setError(userMessage);
      
      // Log detailed error for developers
      logError(err, {
        component: 'PaymentValidation',
        action: 'handleValidatePayment',
        additionalData: { paymentId }
      }, ErrorSeverity.HIGH);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {/* Rest of component */}
    </div>
  );
}
```

---

## 🔧 Setting Up Error Tracking (Production)

### Recommended Services:
1. **Sentry** - Most popular, great for React/Next.js
2. **LogRocket** - Session replay + error tracking
3. **DataDog** - Enterprise-grade monitoring
4. **Rollbar** - Lightweight and easy to integrate

### Example: Sentry Integration

```typescript
// In errorLogger.ts (uncomment the TODO sections)
import * as Sentry from '@sentry/nextjs';

if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error, {
    level: severity,
    contexts: { app: sanitizedContext },
    tags: { component, action }
  });
}
```

---

## 📊 Monitoring Dashboard

Once error tracking is configured, you'll see:
- Error frequency and trends
- Affected users (anonymized)
- Browser/device breakdown
- Error resolution status
- Performance impact

---

## 🛡️ Security Checklist

Before deploying to production:

- [ ] All sensitive data is sanitized in logs
- [ ] Error tracking service is configured
- [ ] Production build tested with `NODE_ENV=production`
- [ ] User-facing errors are friendly and non-technical
- [ ] Console logs don't expose system internals
- [ ] Error boundaries are in place for critical components
- [ ] API keys and secrets are in environment variables

---

## 💡 Quick Reference

| Scenario | Use |
|----------|-----|
| Login/Auth errors | `authErrorHandler.ts` |
| API/Network errors | `errorLogger.ts` |
| React component errors | `<ErrorBoundary>` |
| Async operations | `handleAsyncError()` |
| User-facing message | `getUserFriendlyError()` |
| Developer logging | `logError()` with context |

---

## 📞 Support

For questions about error handling:
1. Check this guide first
2. Review `errorLogger.ts` and `authErrorHandler.ts` source code
3. Test in development mode to see detailed logs
4. Consult the team lead for production error tracking setup
