/**
 * Abandoned Payment Flow Process
 * 
 * End-to-end flow for detecting and recovering abandoned payments.
 * This process orchestrates across multiple features:
 * 
 * - Monitors payment status from the payment feature
 * - Detects when users abandon checkout (leave without completing)
 * - Automatically handles recovery based on configurable rules
 * - Updates application status in the application feature
 * - Provides manual cancellation options
 * 
 * Key Features:
 * - Auto-detection with configurable intervals
 * - Automatic recovery handling
 * - Manual intervention capabilities
 * - Cross-feature state synchronization
 * 
 * This is a true "process" in FSD terms because it:
 * 1. Crosses feature boundaries (payment ↔ application)
 * 2. Orchestrates a complete business workflow
 * 3. Manages complex state transitions
 * 4. Handles edge cases and recovery scenarios
 * 
 * @module processes/abandonedPaymentFlow
 */

export * from './model';
