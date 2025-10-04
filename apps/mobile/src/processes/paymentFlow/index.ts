/**
 * Payment Flow Process
 * 
 * Orchestrates the complete payment submission workflow across multiple features:
 * - Validates payment method and amount
 * - Handles receipt image upload (optional)
 * - Creates payment transaction records
 * - Manages submission state and progress tracking
 * - Provides error handling and recovery mechanisms
 * - Prevents duplicate submissions
 * 
 * This process coordinates between:
 * - Payment feature (payment method validation)
 * - Upload feature (receipt image handling)
 * - Application feature (linking payments to applications)
 * - Storage services (image persistence)
 * 
 * Key Features:
 * - Async submission with progress tracking
 * - Automatic duplicate detection
 * - Network error resilience
 * - Success/failure callbacks
 * - Built-in user feedback (alerts)
 * 
 * @module processes/paymentFlow
 */

export * from './model';
