import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { PaymentMethod } from '@entities/application';

export interface ManualPaymentReceipt {
  uri: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageId?: Id<"_storage">;
}

export interface ManualPaymentInput {
  applicationId: Id<"applications">;
  paymentMethod: PaymentMethod;
  paymentLocation?: string;
  referenceNumber: string;
  receipt: ManualPaymentReceipt;
}

export function useManualPaymentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);
  const createPayment = useMutation(api.payments.createPayment.createPaymentMutation);

  const submitManualPayment = async (input: ManualPaymentInput) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload receipt to storage
      setUploadProgress(20);
      const uploadUrl = await generateUploadUrl();

      setUploadProgress(40);
      const response = await fetch(input.receipt.uri);
      const blob = await response.blob();

      setUploadProgress(60);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': input.receipt.fileType },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const { storageId } = await uploadResponse.json();
      setUploadProgress(80);

      // Step 2: Create payment record
      // All payments include ₱10 processing fee (charged by payment centers)
      const paymentId = await createPayment({
        applicationId: input.applicationId,
        amount: 50, // Application fee
        serviceFee: 10, // Processing fee (charged by payment center)
        netAmount: 60, // Total amount (base fee + processing)
        paymentMethod: input.paymentMethod,
        paymentLocation: input.paymentLocation,
        referenceNumber: input.referenceNumber,
        receiptStorageId: storageId,
      });

      setUploadProgress(100);

      return {
        success: true,
        paymentId,
        message: 'Payment submitted successfully. Please wait for admin verification.',
      };
    } catch (error) {
      console.error('Manual payment upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit payment',
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    submitManualPayment,
    isUploading,
    uploadProgress,
  };
}
