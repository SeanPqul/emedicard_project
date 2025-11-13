import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { Id } from '@backend/convex/_generated/dataModel';
import { formStorage } from '../services/formStorage';
import { DocumentRequirement } from '@/src/entities/application/model/types';
import { JobCategory } from '@/src/entities/jobCategory/model/types';
import { ApplicationFormData } from '../lib/validation';
import { ErrorLogger } from '@/src/shared/utils/errorLogger';

interface UseSubmissionProps {
  formData: ApplicationFormData;
  requirementsByJobCategory: DocumentRequirement[];
  jobCategoriesData: JobCategory[];
  applications: any;
  requirements: any;
  validateCurrentStep: () => boolean;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message?: string) => void;
  resetForm: () => void;
}

export const useSubmission = ({
  formData,
  requirementsByJobCategory,
  jobCategoriesData,
  applications,
  requirements,
  validateCurrentStep,
  showSuccess,
  showError,
  resetForm,
}: UseSubmissionProps) => {
  const [loading, setLoading] = useState(false);
  const submissionLockRef = useRef(false); // Prevents double-submit race condition

  /**
   * Determines if an error is transient (network-related) and should be retried
   */
  const isTransientError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    const transientKeywords = [
      'timeout',
      'network',
      'connection',
      'fetch',
      'abort',
      'econnreset',
      'enotfound',
      'etimedout',
    ];
    return transientKeywords.some(keyword => message.includes(keyword));
  };

  /**
   * Sleep utility for retry delays
   */
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const ensureDraftApplication = useCallback(async (): Promise<string> => {
    const existingAppId = formStorage.getApplicationId();

    if (existingAppId) {
      await applications.mutations.updateApplication(existingAppId as Id<'applications'>, {
        applicationType: formData.applicationType,
        jobCategoryId: formData.jobCategory as Id<'jobCategories'>,
        position: formData.position,
        organization: formData.organization,
        civilStatus: formData.civilStatus,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        suffix: formData.suffix,
        age: formData.age,
        nationality: formData.nationality,
        gender: formData.gender,
      });
      return existingAppId;
    }

    const applicationId = await applications.mutations.createApplication({
      applicationType: formData.applicationType,
      jobCategoryId: formData.jobCategory as Id<'jobCategories'>,
      position: formData.position,
      organization: formData.organization,
      civilStatus: formData.civilStatus,
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      suffix: formData.suffix,
      age: formData.age,
      nationality: formData.nationality,
      gender: formData.gender,
    });
    formStorage.setApplicationId(applicationId);
    return applicationId;
  }, [applications, formData]);

  /**
   * Uploads documents with retry logic for transient failures.
   * Returns uploaded documents with storageIds.
   */
  const uploadDocuments = useCallback(async (queueId: string) => {
    // Check network connection first
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      throw new Error('No internet connection. Please check your connection and try again.');
    }

    const queue = formStorage.getDeferredQueue(queueId);
    if (!queue) throw new Error('Document queue not found');

    const operations = Object.values(queue.uploadOperations);
    const uploadedDocuments: { [key: string]: { storageId: string; fileName: string; fileType: string; fileSize: number } } = {};

    if (operations.length === 0) return uploadedDocuments;

    let failureCount = 0;
    const maxRetries = 3;

    for (const operation of operations) {
      if (operation.status === 'completed' && operation.uploadResult) {
        uploadedDocuments[operation.documentId] = operation.uploadResult;
        continue;
      }

      let lastError: Error | null = null;

      // Retry loop with exponential backoff
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const isRetry = attempt > 1;
          if (isRetry) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            await sleep(delay);
            
            // Re-check network before retry
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) {
              throw new Error('No internet connection. Please check your connection and try again.');
            }
          }
        formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 10);

        // Check file accessibility with timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
          
          const response = await fetch(operation.file.uri, { 
            method: 'HEAD',
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) throw new Error(`File no longer accessible: ${response.status}`);
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('File check timeout. Please check your connection.');
          }
          throw new Error(`Document file is no longer available: ${operation.file.name}`);
        }

        formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 20);

        let fileResponse: Response;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
          
          fileResponse = await fetch(operation.file.uri, { signal: controller.signal });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('File fetch timeout. Please check your connection.');
          }
          throw new Error(`Failed to fetch file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        }
        if (!fileResponse.ok) {
          throw new Error(`Failed to read file: ${fileResponse.status} ${fileResponse.statusText}`);
        }

        formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 40);

        let fileBlob: Blob;
        try {
          fileBlob = await fileResponse.blob();
        } catch (blobError) {
          throw new Error(`Failed to convert file to blob: ${blobError instanceof Error ? blobError.message : 'Unknown error'}`);
        }
        const fileSize = fileBlob.size;

        formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 60);

        let uploadUrl: string;
        try {
          uploadUrl = await requirements.mutations.generateUploadUrl();
        } catch (urlError) {
          throw new Error(`Failed to get upload URL: ${urlError instanceof Error ? urlError.message : 'Unknown error'}`);
        }

        let contentType = operation.file.type || operation.file.mimeType;
        if (!contentType || contentType === 'image' || !contentType.includes('/')) {
          const fileUri = operation.file.uri || '';
          const fileName = operation.file.name || operation.file.fileName || '';
          if (fileUri.toLowerCase().includes('.png') || fileName.toLowerCase().includes('.png')) contentType = 'image/png';
          else if (fileUri.toLowerCase().includes('.pdf') || fileName.toLowerCase().includes('.pdf')) contentType = 'application/pdf';
          else contentType = 'image/jpeg';
        }

        formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 70);

        let uploadResponse: Response;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s upload timeout
          
          uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: fileBlob,
            headers: { 'Content-Type': contentType },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
        } catch (uploadError) {
          if (uploadError instanceof Error && uploadError.name === 'AbortError') {
            throw new Error('Upload timeout. Please check your connection and try again.');
          }
          throw new Error(`Upload request failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
        if (!uploadResponse.ok) {
          throw new Error(`File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 90);

        const { storageId } = await uploadResponse.json();

        const uploadData = {
          storageId,
          fileName: operation.file.fileName || operation.file.name || 'document',
          fileType: contentType,
          fileSize,
        };
        uploadedDocuments[operation.documentId] = uploadData;

        formStorage.updateOperationStatus(queueId, operation.id, 'completed', 100, undefined, uploadData);
        
        // Success - break retry loop
        lastError = null;
        break;
      } catch (error) {
        lastError = error as Error;
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        // Check if error is retryable
        if (isTransientError(error) && attempt < maxRetries) {
          // Will retry on next iteration
          formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 10);
          continue;
        }
        
        // Non-retryable error or max retries reached
        formStorage.updateOperationStatus(queueId, operation.id, 'failed', 0, errorMessage);
        break;
      }
    }

    // If all retries failed, increment failure count
    if (lastError) {
      failureCount++;
    }
  }

    if (failureCount > 0) {
      throw new Error(`Failed to upload ${failureCount} document(s). Please check your internet connection and try again.`);
    }

    return uploadedDocuments;
  }, [requirements]);

  const linkDocuments = useCallback(
    async (applicationId: string, uploadedDocuments: { [key: string]: { storageId: string; fileName: string; fileType: string; fileSize: number } }) => {
      for (const [documentId, uploadData] of Object.entries(uploadedDocuments)) {
        try {
          await requirements.mutations.uploadDocument({
            applicationId,
            fieldIdentifier: documentId,
            storageId: uploadData.storageId,
            fileName: uploadData.fileName,
            fileType: uploadData.fileType,
            fileSize: uploadData.fileSize,
            reviewStatus: 'Pending',
          });
        } catch {
          throw new Error(`Failed to link document ${documentId} to application. Please try again.`);
        }
      }
    },
    [requirements]
  );

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;

    // Prevent double-submit (race condition protection)
    if (submissionLockRef.current) {
      Alert.alert('Please Wait', 'Your application is already being submitted. Please wait...');
      return;
    }

    const tempApp = formStorage.getTempApplication();
    if (!tempApp?.queueId) {
      Alert.alert('Error', 'No application data found. Please restart the application process.');
      return;
    }

    const queue = formStorage.getDeferredQueue(tempApp.queueId);
    if (!queue) {
      Alert.alert('Error', 'Application queue not found. Please restart the application process.');
      return;
    }

    const requiredDocuments = requirementsByJobCategory.filter(doc => doc.required);
    const missingRequired = requiredDocuments.filter(doc => {
      const operation = queue.uploadOperations[doc.fieldName];
      return !operation || (operation.status !== 'pending' && operation.status !== 'completed');
    });
    if (missingRequired.length > 0) {
      Alert.alert(
        'Submission Error',
        `Cannot submit application. Missing required documents: ${missingRequired.map(doc => doc.name).join(', ')}`
      );
      return;
    }

    const failedOperations = Object.values(queue.uploadOperations).filter(op => op.status === 'failed');
    if (failedOperations.length > 0) {
      Alert.alert('Submission Error', 'Cannot submit application. Please fix failed document uploads before proceeding.');
      return;
    }

    if (queue.status === 'submitting') {
      Alert.alert('Please Wait', 'Application is already being submitted.');
      return;
    }

    setLoading(true);
    submissionLockRef.current = true; // Acquire lock
    
    try {
      await submitApplicationWithoutPayment();
    } catch {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
      setLoading(false);
    } finally {
      submissionLockRef.current = false; // Always release lock
    }
  }, [validateCurrentStep, requirementsByJobCategory, formData]);

  const submitApplicationWithoutPayment = useCallback(async () => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp?.queueId) {
      Alert.alert('Error', 'No application data found. Please try again.');
      setLoading(false);
      return;
    }

    // Track resources for rollback
    const uploadedStorageIds: string[] = [];
    let createdApplicationId: string | null = null;

    try {
      if (!jobCategoriesData || jobCategoriesData.length === 0) {
        showError('Data Loading', 'Job categories are still loading. Please wait a moment and try again.');
        setLoading(false);
        return;
      }

      if (!formData.jobCategory) {
        showError('Validation Error', 'Please select a job category before submitting.');
        setLoading(false);
        return;
      }

      formStorage.updateQueueStatus(tempApp.queueId, 'submitting');

      const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
      if (!selectedCategory) {
        throw new Error(`Invalid job category selected. Selected: ${formData.jobCategory}, Available: ${jobCategoriesData?.length || 0} categories`);
      }

      // ========================================
      // PHASE 1: Upload documents first (with retry logic)
      // ========================================
      const uploadedDocuments = await uploadDocuments(tempApp.queueId);
      
      // Track uploaded storage IDs for potential rollback
      uploadedStorageIds.push(...Object.values(uploadedDocuments).map(doc => doc.storageId));

      // ========================================
      // PHASE 2: Create application (only if uploads succeeded)
      // ========================================
      const applicationId = await ensureDraftApplication();
      createdApplicationId = applicationId;

      // Save progress after application is created
      formStorage.saveApplicationProgress(formData, tempApp.selectedDocuments, tempApp.currentStep, applicationId);

      // ========================================
      // PHASE 3: Link uploaded documents to application
      // ========================================
      await linkDocuments(applicationId, uploadedDocuments);

      // ========================================
      // PHASE 4: Submit application (changes status from Draft to Submitted)
      // ========================================
      const result = await applications.mutations.submitApplicationForm(applicationId, null, null);

      if (result.success) {
        formStorage.updateQueueStatus(tempApp.queueId, 'completed');
        formStorage.clearTempApplication();

        showSuccess('Application Submitted!', 'Your application has been submitted successfully. Please proceed to payment.');

        Alert.alert(
          'Application Submitted!',
          'Your application has been successfully submitted.\n\nYou have 7 days to complete the payment of ₱60.\n\nYou can pay now or later from your applications list.',
          [
            {
              text: 'Pay Now',
              onPress: () => {
                resetForm();
                router.replace(`/(screens)/(application)/${applicationId}`);
              },
            },
            {
              text: 'Pay Later',
              onPress: () => {
                resetForm();
                router.replace('/(tabs)/application');
              },
              style: 'cancel',
            },
          ]
        );

        // Clear tracking since submission succeeded
        uploadedStorageIds.length = 0;
        createdApplicationId = null;
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      // ========================================
      // ROLLBACK: Clean up resources on failure
      // ========================================
      
      // Log submission failure
      ErrorLogger.logCritical('Application submission failed', error, {
        queueId: tempApp?.queueId,
        applicationId: createdApplicationId,
        uploadedFilesCount: uploadedStorageIds.length,
        jobCategory: formData.jobCategory,
      });
      
      if (tempApp?.queueId) {
        formStorage.updateQueueStatus(tempApp.queueId, 'failed');
      }

      // Delete created application if it exists
      if (createdApplicationId) {
        try {
          await applications.mutations.deleteApplication(createdApplicationId);
          // Local storage will be cleared when clearTempApplication() is called
        } catch (deleteError) {
          ErrorLogger.logRollbackFailure('application_deletion', deleteError, {
            applicationId: createdApplicationId,
            queueId: tempApp.queueId,
          });
          // Continue with storage file cleanup even if app deletion fails
        }
      }

      // Delete uploaded storage files
      for (const storageId of uploadedStorageIds) {
        try {
          await requirements.mutations.deleteStorageFile(storageId);
        } catch (deleteError) {
          ErrorLogger.logRollbackFailure('storage_deletion', deleteError, {
            storageId,
            applicationId: createdApplicationId,
            queueId: tempApp.queueId,
          });
          // Continue cleaning up other files
        }
      }

      Alert.alert('Submission Error', error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, jobCategoriesData, applications, requirements, showSuccess, resetForm, ensureDraftApplication, uploadDocuments, linkDocuments]);

  return {
    loading,
    handleSubmit,
  };
};
