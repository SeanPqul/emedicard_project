import { Id } from '@backend/convex/_generated/dataModel';
import { AppError, AppErrorType } from '@shared/lib/errors';
import { PaymentMethod } from '@entities/payment';

// Re-export PaymentMethod from entities
export type { PaymentMethod };

export interface PaymentSubmissionData {
  applicationId: Id<"applications">;
  method: PaymentMethod;
  referenceNumber: string;
  amount?: number;
  receiptImage?: string; // Base64 or file URI
  metadata?: Record<string, any>;
}

export interface PaymentFlowResult {
  paymentId: Id<"payments">;
  status: 'processing' | 'completed' | 'failed';
  isExisting?: boolean;
  receiptUploaded?: boolean;
  transactionId?: string;
  checkoutUrl?: string; // For online payments like Maya
  message: string;
}

export interface PaymentServices {
  createPayment: (input: {
    applicationId: Id<'applications'>;
    amount: number;
    serviceFee: number;
    netAmount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    receiptStorageId?: Id<'_storage'>;
  }) => Promise<Id<"payments">>;
  generateUploadUrl: () => Promise<string>;
  uploadFile?: (url: string, file: Blob) => Promise<void>;
}

/**
 * Submit payment with receipt image
 */
export async function submitPayment(
  paymentData: PaymentSubmissionData,
  services: PaymentServices
): Promise<PaymentFlowResult> {
  try {
    // Validate payment data
    if (!paymentData.applicationId) {
      throw new AppError(AppErrorType.VALIDATION_FAILED, 'Application ID is required');
    }

    if (!paymentData.method) {
      throw new AppError(AppErrorType.VALIDATION_FAILED, 'Payment method is required');
    }

    if (!paymentData.referenceNumber) {
      throw new AppError(AppErrorType.VALIDATION_FAILED, 'Reference number is required');
    }

    // Calculate amounts
    const amount = paymentData.amount || 50; // Default health card fee
    const serviceFee = 10; // All payment methods have ₱10 processing fee
    const netAmount = amount + serviceFee;

    let receiptStorageId: Id<'_storage'> | undefined;

    // Upload receipt if provided
    if (paymentData.receiptImage) {
      try {
        const uploadUrl = await services.generateUploadUrl();
        
        if (services.uploadFile) {
          // Convert base64 to blob if necessary
          const blob = paymentData.receiptImage.startsWith('data:') 
            ? await fetch(paymentData.receiptImage).then(r => r.blob())
            : new Blob([paymentData.receiptImage]);
          
          await services.uploadFile(uploadUrl, blob);
          // Extract storage ID from URL (this is a simplified version)
          receiptStorageId = uploadUrl.split('/').pop() as Id<'_storage'>;
        }
      } catch (error) {
        console.warn('Receipt upload failed:', error);
        // Continue without receipt
      }
    }

    // Create payment record
    const paymentId = await services.createPayment({
      applicationId: paymentData.applicationId,
      amount,
      serviceFee,
      netAmount,
      paymentMethod: paymentData.method,
      referenceNumber: paymentData.referenceNumber,
      receiptStorageId,
    });

    // Return result based on payment method
    if (paymentData.method === 'Maya') {
      return {
        paymentId,
        status: 'processing',
        receiptUploaded: !!receiptStorageId,
        checkoutUrl: `maya://checkout/${paymentId}`, // Simplified URL
        message: 'Redirecting to Maya checkout...',
      };
    }

    return {
      paymentId,
      status: 'completed',
      receiptUploaded: !!receiptStorageId,
      message: receiptStorageId 
        ? 'Payment submitted successfully with receipt!'
        : 'Payment submitted successfully!',
    };

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.fromError(error);
  }
}

/**
 * Submit payment without receipt (for online payments)
 */
export async function submitPaymentWithoutReceipt(
  paymentData: PaymentSubmissionData,
  services: PaymentServices
): Promise<PaymentFlowResult> {
  return submitPayment(
    {
      ...paymentData,
      receiptImage: undefined, // Explicitly no receipt
    },
    services
  );
}
