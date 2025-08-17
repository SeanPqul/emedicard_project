// Refactored payment flow (RN-friendly, network-aware)
// End-to-end example combining upload + createPayment with resilience

import * as ImagePicker from "expo-image-picker";
// Services removed - use hooks directly for payment flow operations
import { withNetwork, retryAsync } from "../network";
import { AppError } from "../errors";
import { Id } from "../../../convex/_generated/dataModel";

export type PaymentMethod = "Gcash" | "Maya" | "BaranggayHall" | "CityHall";

export interface PaymentSubmissionData {
  formId: Id<"forms">;
  method: PaymentMethod;
  referenceNumber: string;
}

export interface PaymentFlowResult {
  paymentId: Id<"payments">;
  isExisting: boolean;
  receiptUploaded: boolean;
}

/**
 * Upload receipt with resilience
 */
async function uploadReceiptAsync(local: { uri: string; name: string; type: string }): Promise<Id<"_storage">> {
  try {
    const uploadUrl = await withNetwork(() => storageService.generateUploadUrl());
    
    const formData = new FormData();
    formData.append("file", { 
      uri: local.uri, 
      name: local.name, 
      type: local.type 
    } as any);
    
    const res = await retryAsync(
      () => fetch(uploadUrl, { method: "POST", body: formData }), 
      2, 
      400
    );
    
    if (!res.ok) {
      throw new AppError(`Upload failed with status ${res.status}`, "SERVER");
    }
    
    const { storageId } = await res.json();
    return storageId as Id<"_storage">;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to upload receipt", "NETWORK");
  }
}

/**
 * Request image picker permissions and handle receipt upload
 */
async function handleReceiptUpload(): Promise<Id<"_storage"> | undefined> {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      throw new AppError("Permission denied for media library access", "VALIDATION");
    }

    // Launch image picker
    const pick = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    // Handle image selection
    if (!pick.canceled && pick.assets[0]) {
      const asset = pick.assets[0];
      const receiptId = await uploadReceiptAsync({ 
        uri: asset.uri, 
        name: `receipt_${Date.now()}.jpg`, 
        type: "image/jpeg" 
      });
      return receiptId;
    }
    
    return undefined;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to handle receipt upload", "UNKNOWN");
  }
}

/**
 * Calculate payment amounts with service fees
 */
function calculatePaymentAmounts(method: PaymentMethod) {
  const amount = 50; // Base amount
  const serviceFee = method === "Gcash" || method === "Maya" ? 5 : 0;
  const netAmount = amount + serviceFee;
  
  return { amount, serviceFee, netAmount };
}

/**
 * Main payment submission flow with resilience
 * 
 * Features:
 * - Prevents duplicate payments
 * - Optional receipt upload with error handling
 * - Network-aware operations with retry logic
 * - Comprehensive error handling
 * - Type-safe with proper Id types
 */
export async function submitPayment({
  formId,
  method,
  referenceNumber,
}: PaymentSubmissionData): Promise<PaymentFlowResult> {
  try {
    // Step 1: Prevent duplicate payment
    const existing = await withNetwork(() => paymentsService.getPaymentByFormId(formId));
    if (existing) {
      return {
        paymentId: existing._id,
        isExisting: true,
        receiptUploaded: false,
      };
    }

    // Step 2: Optional receipt upload
    let receiptId: Id<"_storage"> | undefined;
    let receiptUploaded = false;
    
    try {
      receiptId = await handleReceiptUpload();
      receiptUploaded = !!receiptId;
    } catch (error) {
      // Receipt upload is optional - log error but continue with payment
      console.warn("Receipt upload failed:", error);
      // Don't throw here - payment can proceed without receipt
    }

    // Step 3: Calculate payment amounts
    const { amount, serviceFee, netAmount } = calculatePaymentAmounts(method);

    // Step 4: Create payment with network resilience
    const paymentId = await withNetwork(() =>
      retryAsync(
        () => paymentsService.createPayment({ 
          formId, 
          amount, 
          serviceFee, 
          netAmount, 
          method, 
          referenceNumber, 
          receiptId 
        }),
        2,
        400
      )
    );

    return {
      paymentId: paymentId._id,
      isExisting: false,
      receiptUploaded,
    };

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Payment submission failed", "UNKNOWN");
  }
}

/**
 * Simplified payment submission without receipt upload
 * For cases where receipt is not required
 */
export async function submitPaymentWithoutReceipt({
  formId,
  method,
  referenceNumber,
}: PaymentSubmissionData): Promise<PaymentFlowResult> {
  try {
    // Prevent duplicate payment
    const existing = await withNetwork(() => paymentsService.getPaymentByFormId(formId));
    if (existing) {
      return {
        paymentId: existing._id,
        isExisting: true,
        receiptUploaded: false,
      };
    }

    // Calculate payment amounts
    const { amount, serviceFee, netAmount } = calculatePaymentAmounts(method);

    // Create payment with network resilience
    const paymentId = await withNetwork(() =>
      retryAsync(
        () => paymentsService.createPayment({ 
          formId, 
          amount, 
          serviceFee, 
          netAmount, 
          method, 
          referenceNumber 
        }),
        2,
        400
      )
    );

    return {
      paymentId: paymentId._id,
      isExisting: false,
      receiptUploaded: false,
    };

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Payment submission failed", "UNKNOWN");
  }
}

/**
 * Utility function to get payment method display name
 */
export function getPaymentMethodDisplayName(method: PaymentMethod): string {
  switch (method) {
    case "Gcash":
      return "GCash";
    case "Maya":
      return "Maya";
    case "BaranggayHall":
      return "Barangay Hall";
    case "CityHall":
      return "City Hall";
    default:
      return method;
  }
}

/**
 * Utility function to check if payment method has service fee
 */
export function hasServiceFee(method: PaymentMethod): boolean {
  return method === "Gcash" || method === "Maya";
}

/**
 * Get service fee amount for a payment method
 */
export function getServiceFee(method: PaymentMethod): number {
  return hasServiceFee(method) ? 5 : 0;
}
