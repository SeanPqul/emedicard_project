import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

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
  
  const generateUploadUrl = useMutation(api.requirements.generateUploadUrl);
  const uploadDocument = useMutation(api.requirements.uploadDocument);
  const updateDocumentField = useMutation(api.requirements.updateDocumentField);
  const deleteDocument = useMutation(api.requirements.deleteDocument);

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

  return {
    uploadFile,
    replaceFile,
    removeFile,
    retryUpload,
    getUploadState,
    uploadStates,
  };
};
