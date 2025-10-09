/**
 * Maya Payment Flow Process
 * 
 * End-to-end orchestration of Maya payment integration.
 * 
 * This process manages the complete payment workflow through Maya's payment gateway,
 * coordinating between multiple features and external systems:
 * 
 * ## Key Responsibilities:
 * 
 * 1. **Payment Initiation**
 *    - Validates payment amounts and parameters
 *    - Creates checkout session with Maya API
 *    - Manages payment state throughout the flow
 * 
 * 2. **App-to-App Integration**
 *    - Detects Maya app availability
 *    - Opens Maya app with universal links
 *    - Falls back to in-app browser when needed
 * 
 * 3. **Deep Link Management**
 *    - Listens for payment completion deep links
 *    - Handles success/failure/cancellation returns
 *    - Synchronizes status with backend
 * 
 * 4. **Cross-Feature Coordination**
 *    - Links payments to applications (application feature)
 *    - Updates payment records (payment feature)
 *    - Manages navigation flow (navigation system)
 *    - Integrates with external Maya system
 * 
 * ## Architecture:
 * 
 * ```
 * mayaPaymentFlow/
 * ├── model/          # Business logic and state management
 * │   ├── hooks.ts    # useMayaPayment - main orchestration hook
 * │   └── types.ts    # TypeScript interfaces and types
 * ├── lib/            # Utilities and integrations
 * │   ├── maya-app-integration.ts  # Maya app detection and opening
 * │   ├── deep-link-handler.ts     # Deep link routing and parsing
 * │   └── utils.ts                 # Helper functions
 * └── ui/             # Process-specific UI (if needed)
 * ```
 * 
 * ## Why This is a Process:
 * 
 * 1. **Multi-Feature Orchestration**: Coordinates between payment, application, and navigation features
 * 2. **External System Integration**: Manages complex integration with Maya's payment system
 * 3. **State Machine Management**: Handles payment states across app lifecycle
 * 4. **Complex Flow Control**: Manages app-to-app communication and fallback strategies
 * 
 * ## Usage:
 * 
 * ```typescript
 * import { useMayaPayment } from '@processes/mayaPaymentFlow';
 * 
 * const { 
 *   initiatePayment, 
 *   isProcessing, 
 *   paymentResult 
 * } = useMayaPayment();
 * 
 * // Initiate payment
 * const result = await initiatePayment(applicationId, amount, serviceFee);
 * ```
 * 
 * @module processes/mayaPaymentFlow
 */

// Export everything from model (hooks, types, constants)
export * from './model';

// Export utilities directly from source file for EAS build compatibility
export {
  formatCurrency,
  calculateTotalAmount,
  getPaymentStatusMessage,
  generatePaymentReference,
} from './lib/utils';
