# Payment Flow Implementation Guide

## Overview

This document explains the refactored payment flow implementation that combines upload + createPayment with resilience features. The implementation is React Native-friendly and network-aware, providing a robust solution for payment submission with optional receipt upload.

## Architecture

The payment flow implementation consists of several key components:

1. **Payment Flow Module** (`src/lib/payment/paymentFlow.ts`) - Core business logic
2. **Custom Hooks** (`src/hooks/usePaymentFlow.ts`) - State management
3. **UI Components** - React components for payment submission
4. **Error Handling** - Comprehensive error states and network resilience

## Core Features

### Network Resilience
- **Offline Detection**: Automatically detects network status
- **Retry Logic**: Automatic retry with exponential backoff
- **Error Recovery**: Graceful handling of network errors
- **Timeout Management**: Configurable request timeouts

### Payment Processing
- **Duplicate Prevention**: Checks for existing payments
- **Service Fee Calculation**: Automatic calculation based on payment method
- **Receipt Upload**: Optional receipt upload with error tolerance
- **Type Safety**: Full TypeScript support with proper Id types

### UI/UX Features
- **Loading States**: Skeleton loaders during async operations
- **Progress Tracking**: Step-by-step progress indicators
- **Error Display**: User-friendly error messages with retry options
- **Responsive Design**: Adaptive layouts for different screen sizes

## Usage Examples

### Basic Payment Submission

```typescript
import { submitPayment, PaymentSubmissionData } from '../lib/payment/paymentFlow';

const paymentData: PaymentSubmissionData = {
  formId: "j123456789" as Id<"forms">,
  method: "Gcash",
  referenceNumber: "REF123456789"
};

try {
  const result = await submitPayment(paymentData);
  console.log('Payment successful:', result.paymentId);
} catch (error) {
  console.error('Payment failed:', error.message);
}
```

### Using Payment Hooks

```typescript
import { usePaymentManager } from '../hooks/usePaymentFlow';

function PaymentScreen({ formId }) {
  const payment = usePaymentManager(50, {
    onSuccess: (result) => console.log('Success:', result.paymentId),
    onError: (error) => console.error('Error:', error.message),
  });

  const handleSubmit = () => {
    payment.submitCurrentPayment(formId, true); // with receipt
  };

  return (
    <View>
      {payment.isLoading && <LoadingSpinner />}
      {payment.state.error && <ErrorState error={payment.state.error} />}
      <Button onPress={handleSubmit} disabled={!payment.canSubmit} />
    </View>
  );
}
```

### Complete UI Implementation

```typescript
import { ImprovedPaymentScreen } from '../components/payment/ImprovedPaymentScreen';

function MyApp() {
  return (
    <ImprovedPaymentScreen
      formId={formId}
      onPaymentSuccess={(paymentId) => navigateToSuccess(paymentId)}
      onBack={() => navigation.goBack()}
    />
  );
}
```

## Payment Flow Steps

### 1. Duplicate Check
```typescript
// Automatically checks for existing payments
const existing = await getPaymentByFormId(formId);
if (existing) return existing._id;
```

### 2. Receipt Upload (Optional)
```typescript
// Optional receipt upload with error tolerance
try {
  receiptId = await handleReceiptUpload();
} catch (error) {
  // Continue without receipt - not critical
  console.warn("Receipt upload failed:", error);
}
```

### 3. Payment Creation
```typescript
// Network-resilient payment creation
const paymentId = await withNetwork(() =>
  retryAsync(() => createPayment(paymentData), 2, 400)
);
```

## Error Handling

### AppError Types
- `OFFLINE` - User is offline
- `NETWORK` - Network connectivity issues
- `TIMEOUT` - Request timeout
- `SERVER` - Server-side errors
- `VALIDATION` - Input validation errors
- `UNKNOWN` - Unexpected errors

### Error Display
```typescript
// Automatic error message mapping
const getErrorMessage = (error: AppError) => {
  switch (error.code) {
    case 'OFFLINE':
      return "You are offline. Please check your connection.";
    case 'NETWORK':
      return "Network error. Please try again.";
    // ... other cases
  }
};
```

## Payment Methods

### Supported Methods
- **Gcash** - Digital wallet (₱5 service fee)
- **Maya** - Digital wallet (₱5 service fee)  
- **BaranggayHall** - Government payment (no service fee)
- **CityHall** - Government payment (no service fee)

### Service Fee Calculation
```typescript
const getServiceFee = (method: PaymentMethod) => {
  return method === "Gcash" || method === "Maya" ? 5 : 0;
};

const calculateTotal = (baseAmount: number, method: PaymentMethod) => {
  return baseAmount + getServiceFee(method);
};
```

## Loading States

### Skeleton Loaders
```typescript
// Show loading skeletons while awaiting operations
{payment.isLoading && (
  <SkeletonGroup count={4}>
    <SkeletonLoader height={60} variant="rectangular" />
  </SkeletonGroup>
)}
```

### Progress Indicators
```typescript
// Track progress through payment steps
const getProgressMessage = (progress) => {
  switch (progress) {
    case 'checking': return 'Checking existing payment...';
    case 'uploading': return 'Uploading receipt...';
    case 'creating': return 'Creating payment record...';
    case 'completed': return 'Payment completed!';
  }
};
```

## Network Awareness

### Connection Detection
```typescript
// Automatic network status detection
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !!state.isConnected && !!state.isInternetReachable;
}
```

### Retry Logic
```typescript
// Exponential backoff retry strategy
export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries = 2,
  baseDelayMs = 400
): Promise<T> {
  // Implementation with exponential backoff
}
```

### Network Wrapper
```typescript
// Ensures operations only run when online
export async function withNetwork<T>(fn: () => Promise<T>): Promise<T> {
  if (!(await isOnline())) {
    throw new AppError("You are offline", "OFFLINE");
  }
  return await fn();
}
```

## Best Practices

### 1. Always Use Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <PaymentScreen />
</ErrorBoundary>
```

### 2. Implement Loading States
```typescript
// Show appropriate loading states
{isLoading ? <SkeletonLoader /> : <ActualContent />}
```

### 3. Handle Offline Scenarios
```typescript
// Graceful offline handling
{error?.code === 'OFFLINE' && (
  <ErrorState 
    type="network" 
    message="You are offline. Please check your connection."
    onRetry={retryPayment}
  />
)}
```

### 4. Prevent Duplicate Submissions
```typescript
// Use the built-in duplicate prevention
const canSubmit = !isSubmitting && !submissionRef.current;
```

### 5. Provide User Feedback
```typescript
// Clear success and error feedback
{result && (
  <Alert>
    {result.receiptUploaded 
      ? 'Payment submitted with receipt!' 
      : 'Payment submitted successfully!'}
  </Alert>
)}
```

## Testing

### Unit Tests
```typescript
// Test payment flow functions
describe('submitPayment', () => {
  it('should prevent duplicate payments', async () => {
    // Mock existing payment
    jest.mocked(getPaymentByFormId).mockResolvedValue(mockPayment);
    
    const result = await submitPayment(paymentData);
    
    expect(result.isExisting).toBe(true);
    expect(result.paymentId).toBe(mockPayment._id);
  });
});
```

### Integration Tests
```typescript
// Test complete payment flow
describe('PaymentScreen', () => {
  it('should handle network errors gracefully', async () => {
    // Mock network error
    jest.mocked(createPayment).mockRejectedValue(new AppError('Network error', 'NETWORK'));
    
    render(<PaymentScreen formId={mockFormId} />);
    
    // Simulate payment submission
    fireEvent.press(screen.getByText('Submit Payment'));
    
    // Verify error display
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
```

## Performance Considerations

### 1. Image Compression
```typescript
// Compress images before upload
const pick = await ImagePicker.launchImageLibraryAsync({ 
  quality: 0.7, // Compress to 70% quality
  allowsEditing: true,
  aspect: [4, 3],
});
```

### 2. Lazy Loading
```typescript
// Lazy load payment components
const PaymentScreen = React.lazy(() => import('./PaymentScreen'));
```

### 3. Caching
```typescript
// Cache payment method selections
const [cachedMethod, setCachedMethod] = useMMKVStorage('payment_method');
```

## Security Considerations

### 1. Input Validation
```typescript
// Validate reference numbers
const validateReferenceNumber = (ref: string) => {
  return ref.trim().length >= 6 && /^[A-Za-z0-9]+$/.test(ref);
};
```

### 2. Sensitive Data Handling
```typescript
// Don't log sensitive payment information
console.log('Payment created:', { id: result._id }); // ✅ Good
console.log('Payment data:', paymentData); // ❌ Avoid
```

### 3. Network Security
```typescript
// Use HTTPS for all payment-related requests
const uploadUrl = await generateUploadUrl(); // Ensures HTTPS
```

## Troubleshooting

### Common Issues

1. **Payment Stuck in Loading**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Check for JavaScript errors in console

2. **Receipt Upload Failing**
   - Verify image picker permissions
   - Check file size limits
   - Ensure upload URL is valid

3. **Duplicate Payment Errors**
   - Clear application cache
   - Check for race conditions
   - Verify form ID is unique

### Debug Mode
```typescript
// Enable detailed error information in development
{__DEV__ && (
  <ErrorState showDetails={true} error={error} />
)}
```

## Conclusion

This refactored payment flow provides a robust, user-friendly solution for payment processing in React Native applications. It combines network resilience, comprehensive error handling, and excellent UX to ensure reliable payment submissions even in challenging network conditions.

The implementation follows React Native best practices and provides both simple function-based APIs and complete hook-based state management solutions for different use cases.
