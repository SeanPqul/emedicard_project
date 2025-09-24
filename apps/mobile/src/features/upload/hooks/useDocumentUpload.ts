import { useState, useCallback, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from 'backend/convex/_generated/api';
import { Id } from 'backend/convex/_generated/dataModel';
import {
  cacheDocumentReactive,
  getCachedDocument,
  getCachedDocumentsByForm,
  updateCachedDocumentStatusReactive,
  removeCachedDocumentReactive,
  clearFormCache,
  smartCacheCleanup,
  type CachedDocument,
} from '../services/documentCache';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

interface DocumentUploadResult {
  requirementId: Id<"documentTypes">;
  fieldName: string;
  fieldIdentifier: string; // Add this for API compatibility
  storageId: Id<"_storage">;
  fileName: string;
  fileType: string;
  fileSize: number;
  status?: "Pending" | "Approved" | "Rejected";
  reviewBy?: Id<"users"> | undefined;
  reviewAt?: number | undefined;
  remarks?: string | undefined;
}

export const useDocumentUpload = (applicationId: Id<"applications">) => {
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const [cachedDocuments, setCachedDocuments] = useState<CachedDocument[]>([]);
  
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);
  const uploadDocument = useMutation(api.requirements.uploadDocuments.uploadDocumentsMutation);
  const updateDocumentField = useMutation(api.requirements.updateDocumentField.updateDocumentFieldMutation);
  const deleteDocument = useMutation(api.requirements.removeDocument.deleteDocumentMutation);

  // Load cached documents on mount with smart cleanup
  useEffect(() => {
    const loadCachedDocuments = async () => {
      // Perform smart cleanup first (now async)
      await smartCacheCleanup();
      
      const cached = getCachedDocumentsByForm(applicationId);
      setCachedDocuments(cached);
      
      // Initialize upload states for cached documents
      const initialStates: Record<string, UploadState> = {};
      cached.forEach(doc => {
        initialStates[doc.fieldName] = {
          uploading: doc.status === 'uploading',
          progress: doc.status === 'uploaded' ? 100 : 0,
          error: doc.error || null,
          success: doc.status === 'uploaded',
        };
      });
      setUploadStates(initialStates);
    };
    
    loadCachedDocuments();
  }, [applicationId]);

  const validateFile = useCallback((file: any, fieldName: string) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit. Maximum size: 10MB`);
    }

    return true;
  }, []);

  const setUploadState = useCallback((fieldName: string, state: Partial<UploadState>) => {
    setUploadStates(prev => {
      const currentState = prev[fieldName] || {
        uploading: false,
        progress: 0,
        error: null,
        success: false,
      };
      return {
        ...prev,
        [fieldName]: { ...currentState, ...state },
      };
    });
  }, []);

  const uploadFile = useCallback(async (
    file: any,
    fieldName: string
  ): Promise<DocumentUploadResult> => {
    try {
      // Validate file
      validateFile(file, fieldName);

      // Reset state
      setUploadState(fieldName, {
        uploading: true,
        progress: 0,
        error: null,
        success: false
      });

      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file with progress tracking
      const uploadPromise = fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadStates(prev => {
          const currentState: UploadState = prev[fieldName] || { uploading: false, progress: 0, error: null, success: false };
          if (currentState.progress < 90) {
            return {
              ...prev,
              [fieldName]: {
                uploading: true,
                progress: currentState.progress + 10,
                error: null,
                success: false
              }
            };
          }
          return prev;
        });
      }, 200);

      const uploadResponse = await uploadPromise;

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      clearInterval(progressInterval);
      
      const { storageId } = await uploadResponse.json();

      // Save document metadata
      const uploadResult = await uploadDocument({
        applicationId,
        fieldIdentifier: fieldName,
        storageId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Update state to complete
      setUploadState(fieldName, {
        uploading: false,
        progress: 100,
        error: null,
        success: true
      });

      // Map API response to DocumentUploadResult interface
      const result: DocumentUploadResult = {
        requirementId: uploadResult.requirementId,
        fieldName: fieldName, // Use the original fieldName parameter
        fieldIdentifier: uploadResult.fieldIdentifier,
        storageId: uploadResult.storageId,
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType,
        fileSize: uploadResult.fileSize,
        status: uploadResult.status,
        reviewBy: uploadResult.reviewBy,
        reviewAt: uploadResult.reviewAt,
        remarks: uploadResult.remarks
      };

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState(fieldName, {
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });
      throw error;
    }
  }, [applicationId, generateUploadUrl, uploadDocument, validateFile, setUploadState]);

  const replaceFile = useCallback(async (
    file: any,
    fieldName: string
  ): Promise<DocumentUploadResult> => {
    try {
      // Validate file
      validateFile(file, fieldName);

      // Reset state
      setUploadState(fieldName, {
        uploading: true,
        progress: 0,
        error: null,
        success: false
      });

      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file with progress tracking
      const uploadPromise = fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadStates(prev => {
          const currentState = prev[fieldName] || { uploading: false, progress: 0, error: null, success: false };
          if (currentState.progress < 90) {
            return {
              ...prev,
              [fieldName]: {
                ...currentState,
                uploading: true,
                progress: currentState.progress + 10,
                error: null,
                success: false
              }
            };
          }
          return prev;
        });
      }, 200);

      const uploadResponse = await uploadPromise;

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      clearInterval(progressInterval);
      
      const { storageId } = await uploadResponse.json();

      // Update document field
      const result = await updateDocumentField({
        applicationId,
        fieldName,
        storageId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Update state to complete
      setUploadState(fieldName, {
        uploading: false,
        progress: 100,
        error: null,
        success: true
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState(fieldName, {
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });
      throw error;
    }
  }, [applicationId, generateUploadUrl, updateDocumentField, validateFile, setUploadState]);

  const removeFile = useCallback(async (
    fieldName: string,
    storageId: Id<"_storage">
  ): Promise<void> => {
    try {
      await deleteDocument({
        applicationId,
        fieldName,
        storageId,
      });

      // Clear upload state
      setUploadStates(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      setUploadState(fieldName, {
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });
      throw error;
    }
  }, [applicationId, deleteDocument, setUploadState]);

  const retryUpload = useCallback(async (
    file: any,
    fieldName: string
  ): Promise<DocumentUploadResult> => {
    // Clear previous error state
    setUploadState(fieldName, {
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });

    // Retry upload
    return uploadFile(file, fieldName);
  }, [uploadFile, setUploadState]);

  const getUploadState = useCallback((fieldName: string): UploadState => {
    return uploadStates[fieldName] || {
      uploading: false,
      progress: 0,
      error: null,
      success: false
    };
  }, [uploadStates]);

  // MMKV Cache Functions
  
  /**
   * Cache a document locally before upload
   */
  const cacheFileForUpload = useCallback(async (
    file: any,
    fieldName: string
  ): Promise<CachedDocument> => {
    try {
      validateFile(file, fieldName);
      
      const cachedDoc = await cacheDocumentReactive(applicationId, fieldName, {
        uri: file.uri,
        name: file.name || `document_${fieldName}.${file.type?.split('/')[1] || 'jpg'}`,
        type: file.type || 'image/jpeg',
        size: file.size,
      });
      
      // Update local state
      setCachedDocuments(prev => {
        const filtered = prev.filter(doc => doc.fieldName !== fieldName);
        return [...filtered, cachedDoc];
      });
      
      setUploadState(fieldName, {
        uploading: false,
        progress: 0,
        error: null,
        success: false
      });
      
      return cachedDoc;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cache document';
      setUploadState(fieldName, {
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });
      throw error;
    }
  }, [applicationId, validateFile, setUploadState]);
  
  /**
   * Upload a cached document to Convex using direct file upload
   */
  const uploadCachedDocument = useCallback(async (
    fieldName: string,
    documentRequirementId?: Id<"documentTypes">
  ): Promise<DocumentUploadResult> => {
    try {
      const cachedDoc = getCachedDocument(applicationId, fieldName);
      if (!cachedDoc) {
        throw new Error('No cached document found');
      }
      
      // Update status to uploading
      updateCachedDocumentStatusReactive(applicationId, fieldName, { 
        status: 'uploading',
        error: null 
      });
      
      setUploadState(fieldName, {
        uploading: true,
        progress: 0,
        error: null,
        success: false
      });
      
      // Use the original file URI to create a new file object
      const response = await fetch(cachedDoc.fileUri);
      const blob = await response.blob();
      const file = new File([blob], cachedDoc.fileName, { type: cachedDoc.fileType });
      
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file with progress tracking
      const progressInterval = setInterval(() => {
        setUploadStates(prev => {
          const currentState = prev[fieldName] || { uploading: false, progress: 0, error: null, success: false };
          if (currentState.progress < 90) {
            return {
              ...prev,
              [fieldName]: {
                ...currentState,
                uploading: true,
                progress: currentState.progress + 10,
                error: null,
                success: false
              }
            };
          }
          return prev;
        });
      }, 200);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': cachedDoc.fileType,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      clearInterval(progressInterval);
      const { storageId } = await uploadResponse.json();
      
      // Save document metadata to Convex using the uploadDocument mutation
      const uploadResult = await uploadDocument({
        applicationId,
        fieldIdentifier: fieldName,
        storageId,
        fileName: cachedDoc.fileName,
        fileType: cachedDoc.fileType,
        fileSize: cachedDoc.fileSize,
      });
      
      // Update cached document with storage ID using reactive updates
      updateCachedDocumentStatusReactive(applicationId, fieldName, {
        status: 'uploaded',
        convexStorageId: storageId,
        error: null
      });
      
      // Update UI state
      setUploadState(fieldName, {
        uploading: false,
        progress: 100,
        error: null,
        success: true
      });
      
      return {
        requirementId: uploadResult.requirementId,
        fieldName,
        fieldIdentifier: uploadResult.fieldIdentifier,
        storageId: uploadResult.storageId,
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType,
        fileSize: uploadResult.fileSize,
        status: uploadResult.status,
        reviewBy: uploadResult.reviewBy,
        reviewAt: uploadResult.reviewAt,
        remarks: uploadResult.remarks
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Update cached document status with reactive updates
      updateCachedDocumentStatusReactive(applicationId, fieldName, {
        status: 'failed',
        error: errorMessage,
        retryCount: (getCachedDocument(applicationId, fieldName)?.retryCount || 0) + 1
      });
      
      setUploadState(fieldName, {
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });
      
      throw error;
    }
  }, [applicationId, generateUploadUrl, uploadDocument, setUploadState]);
  
  /**
   * Batch upload all cached documents for the form with concurrency control
   */
  const batchUploadCachedDocuments = useCallback(async (): Promise<{
    successful: DocumentUploadResult[];
    failed: { fieldName: string; error: string }[];
    memoryCleanup: boolean;
  }> => {
    const cachedDocs = getCachedDocumentsByForm(applicationId);
    const toUpload = cachedDocs.filter(doc => doc.status === 'cached' || doc.status === 'failed');
    
    // Check memory limits before starting
    const { checkMemoryLimits } = await import('../services/documentCache');
    const memoryCheck = checkMemoryLimits();
    if (memoryCheck.exceedsLimits) {
      console.warn('Memory limits exceeded before bulk upload:', memoryCheck.recommendations);
      // Perform cleanup
      await smartCacheCleanup();
    }
    
    const successful: DocumentUploadResult[] = [];
    const failed: { fieldName: string; error: string }[] = [];
    const concurrencyLimit = 3; // Upload max 3 files simultaneously
    
    // Process uploads in chunks to manage memory
    for (let i = 0; i < toUpload.length; i += concurrencyLimit) {
      const chunk = toUpload.slice(i, i + concurrencyLimit);
      
      // Upload chunk concurrently
      const chunkResults = await Promise.allSettled(
        chunk.map(doc => uploadCachedDocument(doc.fieldName))
      );
      
      // Process results
      chunkResults.forEach((result, index) => {
        const doc = chunk[index];
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push({
            fieldName: doc.fieldName,
            error: result.reason instanceof Error ? result.reason.message : 'Upload failed'
          });
        }
      });
      
      // Small delay between chunks to prevent overwhelming the system
      if (i + concurrencyLimit < toUpload.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Final memory cleanup
    const finalMemoryCleanup = await smartCacheCleanup();
    
    return { 
      successful, 
      failed, 
      memoryCleanup: finalMemoryCleanup.removedCount > 0 
    };
  }, [applicationId, uploadCachedDocument]);
  
  /**
   * Remove a cached document
   */
  const removeCachedFile = useCallback((fieldName: string): void => {
    removeCachedDocumentReactive(applicationId, fieldName);
    
    // Update local state
    setCachedDocuments(prev => prev.filter(doc => doc.fieldName !== fieldName));
    
    // Clear upload state
    setUploadStates(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  }, [applicationId]);
  
  /**
   * Clear all cached documents for the form
   */
  const clearAllCachedDocuments = useCallback((): void => {
    clearFormCache(applicationId);
    setCachedDocuments([]);
    setUploadStates({});
  }, [applicationId]);
  
  /**
   * Get a cached document by field name
   */
  const getCachedFile = useCallback((fieldName: string): CachedDocument | null => {
    return getCachedDocument(applicationId, fieldName);
  }, [applicationId]);
  
  /**
   * Retry uploading a failed document
   */
  const retryCachedUpload = useCallback(async (fieldName: string): Promise<DocumentUploadResult> => {
    const cachedDoc = getCachedDocument(applicationId, fieldName);
    if (!cachedDoc) {
      throw new Error('No cached document found to retry');
    }
    
    // Reset error state
    updateCachedDocumentStatusReactive(applicationId, fieldName, {
      status: 'cached',
      error: null
    });
    
    return uploadCachedDocument(fieldName);
  }, [applicationId, uploadCachedDocument]);

  /**
   * Enhanced bulk upload with queue management and progress tracking
   */
  const bulkUploadWithQueue = useCallback(async (
    onProgress?: (progress: {
      completed: number;
      total: number;
      currentFile?: string;
      failed: number;
    }) => void
  ): Promise<{
    successful: DocumentUploadResult[];
    failed: { fieldName: string; error: string }[];
    totalProcessed: number;
    memoryStats: any;
  }> => {
    const { 
      addToUploadQueue, 
      getNextUploadBatch, 
      removeFromUploadQueue, 
      checkMemoryLimits 
    } = await import('../services/documentCache');
    
    const cachedDocs = getCachedDocumentsByForm(applicationId);
    const toUpload = cachedDocs.filter(doc => doc.status === 'cached' || doc.status === 'failed');
    
    if (toUpload.length === 0) {
      return { successful: [], failed: [], totalProcessed: 0, memoryStats: null };
    }
    
    // Add documents to upload queue with priorities
    const queueItems = toUpload.map(doc => ({
      applicationId,
      fieldName: doc.fieldName,
      priority: doc.status === 'failed' ? 2 : 1, // Retry failed uploads first
    }));
    
    addToUploadQueue(queueItems);
    
    const successful: DocumentUploadResult[] = [];
    const failed: { fieldName: string; error: string }[] = [];
    let totalProcessed = 0;
    
    // Process uploads in batches from the queue
    while (true) {
      const batch = getNextUploadBatch(3); // Process 3 at a time
      if (batch.length === 0) break;
      
      // Check memory limits before each batch
      const memoryCheck = checkMemoryLimits();
      if (memoryCheck.exceedsLimits) {
        console.warn('Memory limits exceeded during bulk upload');
        await smartCacheCleanup();
      }
      
      // Upload batch concurrently
      const batchResults = await Promise.allSettled(
        batch.map(item => uploadCachedDocument(item.fieldName))
      );
      
      // Process batch results
      const processedItems: { applicationId: string; fieldName: string }[] = [];
      
      batchResults.forEach((result, index) => {
        const item = batch[index];
        totalProcessed++;
        
        if (result.status === 'fulfilled') {
          successful.push(result.value);
          processedItems.push({ applicationId: item.applicationId, fieldName: item.fieldName });
        } else {
          failed.push({
            fieldName: item.fieldName,
            error: result.reason instanceof Error ? result.reason.message : 'Upload failed'
          });
          // Don't remove failed items from queue immediately - they might be retried
        }
        
        // Report progress
        onProgress?.({
          completed: successful.length,
          total: toUpload.length,
          currentFile: item.fieldName,
          failed: failed.length,
        });
      });
      
      // Remove successfully processed items from queue
      if (processedItems.length > 0) {
        removeFromUploadQueue(processedItems);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Final cleanup and stats
    const memoryStats = await smartCacheCleanup();
    
    return {
      successful,
      failed,
      totalProcessed,
      memoryStats,
    };
  }, [applicationId, uploadCachedDocument, getCachedDocumentsByForm]);

  return {
    // Original functions
    uploadFile,
    replaceFile,
    removeFile,
    retryUpload,
    getUploadState,
    uploadStates,
    
    // MMKV Cache functions
    cacheFileForUpload,
    uploadCachedDocument,
    batchUploadCachedDocuments,
    removeCachedFile,
    clearAllCachedDocuments,
    getCachedFile,
    retryCachedUpload,
    cachedDocuments,
    
    // Enhanced bulk upload
    bulkUploadWithQueue,
  };
};