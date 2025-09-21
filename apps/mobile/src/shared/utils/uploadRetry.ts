import { formStorage } from '@shared/services/storage/formStorage';

interface RetryResult {
  success: boolean;
  retrySuccess?: number;
  retryFailed?: number;
  message: string;
  error?: string;
}

export const retryFailedUploads = async (requirements: any): Promise<RetryResult> => {
  const tempApp = formStorage.getTempApplication();
  if (!tempApp?.queueId) return { success: false, error: 'No queue found', message: 'No application queue found' };

  const operations = formStorage.getUploadOperations();
  const failedOps = Object.values(operations).filter(op => op.status === 'failed');
  
  if (failedOps.length === 0) {
    return { success: true, message: 'No failed uploads to retry' };
  }

  let retrySuccess = 0;
  let retryFailed = 0;

  for (const operation of failedOps) {
    try {
      // Reset to pending
      formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'pending', 0);
      
      // Update to uploading
      formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 0);
      
      // Validate file still exists
      console.log(`Retrying upload for ${operation.documentId}: ${operation.file.uri}`);
      try {
        const response = await fetch(operation.file.uri, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`File no longer accessible: ${response.status}`);
        }
      } catch {
        throw new Error(`Document file is no longer available: ${operation.file.name}`);
      }

      // Convert file to blob
      const fileResponse = await fetch(operation.file.uri);
      if (!fileResponse.ok) {
        throw new Error(`Failed to read file: ${fileResponse.status} ${fileResponse.statusText}`);
      }
      
      const fileBlob = await fileResponse.blob();
      const fileSize = fileBlob.size;
      
      // Update progress
      formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 25);
      
      // Get upload URL
      const uploadUrl = await requirements.mutations.generateUploadUrl();
      formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 50);

      // Fix content-type
      let contentType = operation.file.type || operation.file.mimeType;
      if (!contentType || contentType === 'image' || !contentType.includes('/')) {
        const fileUri = operation.file.uri || '';
        const fileName = operation.file.name || operation.file.fileName || '';
        
        if (fileUri.toLowerCase().includes('.png') || fileName.toLowerCase().includes('.png')) {
          contentType = 'image/png';
        } else if (fileUri.toLowerCase().includes('.pdf') || fileName.toLowerCase().includes('.pdf')) {
          contentType = 'application/pdf';
        } else {
          contentType = 'image/jpeg';
        }
      }
      
      formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 75);

      // Upload to storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: fileBlob,
        headers: {
          'Content-Type': contentType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const { storageId } = await uploadResponse.json();
      
      // Store upload result
      const uploadData = {
        storageId: storageId,
        fileName: operation.file.fileName || operation.file.name || 'document',
        fileType: contentType,
        fileSize: fileSize,
      };

      // Mark as completed
      formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'completed', 100, undefined, uploadData);
      retrySuccess++;
      
      console.log(`✅ Successfully retried upload: ${operation.file.name}`);

    } catch (error) {
      retryFailed++;
      const errorMessage = error instanceof Error ? error.message : 'Retry upload failed';
      console.error(`❌ Failed to retry upload ${operation.documentId}:`, errorMessage);
      
      formStorage.updateOperationStatus(
        tempApp.queueId, 
        operation.id, 
        'failed', 
        0, 
        errorMessage
      );
    }
  }

  return {
    success: retryFailed === 0,
    retrySuccess,
    retryFailed,
    message: `${retrySuccess} successful, ${retryFailed} failed`
  };
};

export const hasFailedUploads = (): boolean => {
  const operations = formStorage.getUploadOperations();
  return Object.values(operations).some(op => op.status === 'failed');
};