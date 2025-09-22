/**
 * Processes Layer - Cross-Feature Business Workflows
 * 
 * This layer contains complex business processes that orchestrate multiple features
 * to achieve end-to-end user flows. Processes coordinate between features while
 * maintaining loose coupling and clear boundaries.
 * 
 * Key Responsibilities:
 * - Multi-step business flows that cross feature boundaries
 * - Complex state machines and workflow orchestration
 * - Cross-feature transaction management
 * - Business process error handling and recovery
 * 
 * Current Processes:
 * - paymentFlow/ - End-to-end payment submission workflow including:
 *   - Payment method validation
 *   - Receipt upload handling
 *   - Transaction state management
 *   - Error recovery and retry logic
 *   - Success/failure flow coordination
 * 
 * - abandonedPaymentFlow/ - Abandoned payment detection and recovery:
 *   - Monitors payment status across features
 *   - Detects when users abandon checkout
 *   - Automatically handles recovery workflows
 *   - Synchronizes state between payment and application features
 * 
 * - mayaPaymentFlow/ - Maya e-wallet payment integration:
 *   - Maya app detection and validation
 *   - Deep link generation and handling
 *   - Payment initialization and processing
 *   - Return flow management and status tracking
 *   - Error handling and recovery mechanisms
 *
 * Structure Pattern:
 * processes/
 * └── [processName]/
 *     ├── model/      # Business logic, state management, hooks
 *     ├── ui/         # Process-specific UI components (if needed)
 *     ├── lib/        # Process utilities and helpers
 *     └── index.ts    # Public API exports
 * 
 * Usage Example:
 * ```typescript
 * import { usePaymentFlow } from '@processes/paymentFlow';
 * import { useAbandonedPayment } from '@processes/abandonedPaymentFlow';
 * import { useMayaPayment } from '@processes/mayaPaymentFlow';
 * 
 * const { submitWithReceipt, state } = usePaymentFlow({
 *   onSuccess: (result) => console.log('Payment completed'),
 *   onError: (error) => console.error('Payment failed')
 * });
 * 
 * const { initiatePayment, isProcessing } = useMayaPayment();
 * ```
 * 
 * @module processes
 */

// Export all processes
export * from './paymentFlow';
export * from './abandonedPaymentFlow';
export * from './mayaPaymentFlow';
