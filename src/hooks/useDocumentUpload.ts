import { useState, useCallback, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
  cacheDocument,
  getCachedDocument,
  getCachedDocumentsByForm,
  updateCachedDocumentStatus,
  removeCachedDocument,
  clearFormCache,
  base64ToBlob,
  type CachedDocument,
} from '../utils/documentCache';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

interface DocumentUploadResult {
  requirementId: Id<"requirements">;
  fieldName: string;
  storageId: Id<"_storage">;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const useDocumentUpload = (formId: Id<"forms">) => {
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const [cachedDocuments, setCachedDocuments] = useState<CachedDocument[]>([]);
  
  const generateUploadUrl = useMutation(api.requirements.generateUploadUrl);
  const uploadDocument = useMutation(api.requirements.uploadDocument);
  const updateDocumentField = useMutation(api.requirements.updateDocumentField);
  const deleteDocument = useMutation(api.requirements.deleteDocument);

  // Load cached documents on mount
  useEffect(() => {
    const loadCachedDocuments = () => {
      const cached = getCachedDocumentsByForm(formId);
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
  }, [formId]);

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
    setUploadStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], ...state }
    }));
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

      // Save document metadata
      const result = await uploadDocument({
        formId,
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
  }, [formId, generateUploadUrl, uploadDocument, validateFile, setUploadState]);

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
        formId,
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
  }, [formId, generateUploadUrl, updateDocumentField, validateFile, setUploadState]);

  const removeFile = useCallback(async (
    fieldName: string,
    storageId: Id<"_storage">
  ): Promise<void> => {
    try {
      await deleteDocument({
        formId,
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
  }, [formId, deleteDocument, setUploadState]);

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
      
      const cachedDoc = await cacheDocument(formId, fieldName, {
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
  }, [formId, validateFile, setUploadState]);
  
  /**
   * Upload a cached document to Convex
   */
  const uploadCachedDocument = useCallback(async (
    fieldName: string,
    documentRequirementId?: Id<"documentRequirements">
  ): Promise<DocumentUploadResult> => {
    try {
      const cachedDoc = getCachedDocument(formId, fieldName);
      if (!cachedDoc) {
        throw new Error('No cached document found');
      }
      
      // Update status to uploading
      updateCachedDocumentStatus(formId, fieldName, { 
        status: 'uploading',
        error: undefined 
      });
      
      setUploadState(fieldName, {
        uploading: true,
        progress: 0,
        error: null,
        success: false
      });
      
      // Convert base64 back to file for upload
      const blob = base64ToBlob(cachedDoc.base64Data, cachedDoc.fileType);
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
      
      // Save document metadata to Convex using the new formDocuments model
      const result = {
        requirementId: documentRequirementId as Id<"requirements">, // Legacy compatibility
        fieldName,
        storageId,
        fileName: cachedDoc.fileName,
        fileType: cachedDoc.fileType,
        fileSize: cachedDoc.fileSize,
      };
      
      // Update cached document with storage ID
      updateCachedDocumentStatus(formId, fieldName, {
        status: 'uploaded',
        convexStorageId: storageId,
        error: undefined
      });
      
      // Update UI state
      setUploadState(fieldName, {
        uploading: false,
        progress: 100,
        error: null,
        success: true
      });
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Update cached document status
      updateCachedDocumentStatus(formId, fieldName, {
        status: 'failed',
        error: errorMessage,
        retryCount: (getCachedDocument(formId, fieldName)?.retryCount || 0) + 1
      });
      
      setUploadState(fieldName, {
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });
      
      throw error;
    }
  }, [formId, generateUploadUrl, setUploadState]);
  
  /**
   * Batch upload all cached documents for the form
   */
  const batchUploadCachedDocuments = useCallback(async (): Promise<{
    successful: DocumentUploadResult[];
    failed: { fieldName: string; error: string }[];
  }> => {
    const cachedDocs = getCachedDocumentsByForm(formId);
    const toUpload = cachedDocs.filter(doc => doc.status === 'cached' || doc.status === 'failed');
    
    const successful: DocumentUploadResult[] = [];
    const failed: { fieldName: string; error: string }[] = [];
    
    for (const doc of toUpload) {
      try {
        const result = await uploadCachedDocument(doc.fieldName);
        successful.push(result);
      } catch (error) {
        failed.push({
          fieldName: doc.fieldName,
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }
    
    return { successful, failed };
  }, [formId, uploadCachedDocument]);
  
  /**
   * Remove a cached document
   */
  const removeCachedFile = useCallback((fieldName: string): void => {
    removeCachedDocument(formId, fieldName);
    
    // Update local state
    setCachedDocuments(prev => prev.filter(doc => doc.fieldName !== fieldName));
    
    // Clear upload state
    setUploadStates(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  }, [formId]);
  
  /**
   * Clear all cached documents for the form
   */
  const clearAllCachedDocuments = useCallback((): void => {
    clearFormCache(formId);
    setCachedDocuments([]);
    setUploadStates({});
  }, [formId]);
  
  /**
   * Get a cached document by field name
   */
  const getCachedFile = useCallback((fieldName: string): CachedDocument | null => {
    return getCachedDocument(formId, fieldName);
  }, [formId]);
  
  /**
   * Retry uploading a failed document
   */
  const retryCachedUpload = useCallback(async (fieldName: string): Promise<DocumentUploadResult> => {
    const cachedDoc = getCachedDocument(formId, fieldName);
    if (!cachedDoc) {
      throw new Error('No cached document found to retry');
    }
    
    // Reset error state
    updateCachedDocumentStatus(formId, fieldName, {
      status: 'cached',
      error: undefined
    });
    
    return uploadCachedDocument(fieldName);
  }, [formId, uploadCachedDocument]);

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
  };
};
