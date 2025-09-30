import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Id } from '@backend/convex/_generated/dataModel';
import { formStorage } from '../services/formStorage';
import { DocumentRequirement } from '@/src/entities/application/model/types';
import { JobCategory } from '@/src/entities/jobCategory/model/types';

type ApplicationType = 'New' | 'Renew';
type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

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

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return;
    
    // Final validation before submission
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
    
    // Validate all required documents are queued
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
    
    // Check for failed operations that need attention
    const failedOperations = Object.values(queue.uploadOperations).filter(op => op.status === 'failed');
    if (failedOperations.length > 0) {
      Alert.alert(
        'Submission Error',
        'Cannot submit application. Please fix failed document uploads before proceeding.'
      );
      return;
    }
    
    // Check queue status
    if (queue.status === 'submitting') {
      Alert.alert('Please Wait', 'Application is already being submitted.');
      return;
    }
    
    setLoading(true);
    try {
      // NEW FLOW: Submit without payment
      await submitApplicationWithoutPayment();
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  }, [validateCurrentStep, requirementsByJobCategory, formData]);

  const handlePaymentMethodSelected = useCallback((paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall') => {
    // For digital payments, show reference number input
    if (paymentMethod === 'Gcash' || paymentMethod === 'Maya') {
      Alert.prompt(
        'Payment Reference',
        `Please enter your ${paymentMethod} reference number:`,
        async (referenceNumber) => {
          if (referenceNumber && referenceNumber.trim()) {
            await submitApplicationWithPayment(paymentMethod, referenceNumber.trim());
          } else {
            Alert.alert('Invalid Reference', 'Please provide a valid reference number.');
            setLoading(false);
          }
        }
      );
    } else {
      // For manual payments, just use a placeholder reference
      const referenceNumber = `MANUAL-${Date.now()}`;
      Alert.alert(
        'Manual Payment',
        `Please proceed to ${paymentMethod === 'BaranggayHall' ? 'Barangay Hall' : 'City Hall'} to complete your payment. Your reference number is: ${referenceNumber}`,
        [
          {
            text: 'OK',
            onPress: () => submitApplicationWithPayment(paymentMethod, referenceNumber),
          },
        ]
      );
    }
  }, []);

  const submitApplicationWithPayment = useCallback(async (
    paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall',
    referenceNumber: string
  ) => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp?.queueId) {
      Alert.alert('Error', 'No application data found. Please try again.');
      setLoading(false);
      return;
    }

    // Check if we can resume an existing draft application
    const existingApplicationId = formStorage.getApplicationId();
    if (existingApplicationId) {
      // Resuming existing draft application
    } else {
      // Starting new application submission process
    }

    try {
      // Check if job categories are loaded
      if (!jobCategoriesData || jobCategoriesData.length === 0) {
        showError('Data Loading', 'Job categories are still loading. Please wait a moment and try again.');
        setLoading(false);
        return;
      }

      // Check if form data has a selected job category
      if (!formData.jobCategory) {
        showError('Validation Error', 'Please select a job category before submitting.');
        setLoading(false);
        return;
      }

      // Mark queue as submitting
      formStorage.updateQueueStatus(tempApp.queueId, 'submitting');

      // Validate job category first
      const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
      if (!selectedCategory) {
        throw new Error(`Invalid job category selected. Selected: ${formData.jobCategory}, Available: ${jobCategoriesData?.length || 0} categories`);
      }

      // IMPROVED FLOW: Step 1 - Create draft application first (as recommended)
      // This prevents orphaned storage files and enables resume

      // Step 1: Create or get draft application first
      let applicationId: string;
      const existingAppId = formStorage.getApplicationId();
      
      if (existingAppId) {
        applicationId = existingAppId;
        // Update application with latest form data in case user made changes
        await applications.mutations.updateApplication(existingAppId as Id<'applications'>, {
          applicationType: formData.applicationType,
          jobCategoryId: formData.jobCategory as Id<'jobCategories'>,
          position: formData.position,
          organization: formData.organization,
          civilStatus: formData.civilStatus,
        });
      } else {
        // Create new draft application
        applicationId = await applications.mutations.createApplication({
          applicationType: formData.applicationType,
          jobCategoryId: formData.jobCategory as Id<'jobCategories'>,
          position: formData.position,
          organization: formData.organization,
          civilStatus: formData.civilStatus,
        });
        
        // Save application ID to local storage for future resume capability
        formStorage.setApplicationId(applicationId);
      }

      // Save current form progress to MMKV (local draft)
      formStorage.saveApplicationProgress(formData, tempApp.selectedDocuments, tempApp.currentStep, applicationId);

      // Step 2: Upload documents with application reference
      const queue = formStorage.getDeferredQueue(tempApp.queueId);
      if (!queue) {
        throw new Error('Document queue not found');
      }
      
      const operations = Object.values(queue.uploadOperations);
      const uploadedDocuments: { [key: string]: { storageId: string; fileName: string; fileType: string; fileSize: number } } = {};
      
      if (operations.length === 0) {
        // No documents to upload
      } else {
        
        let successCount = 0;
        let failureCount = 0;
        
        for (const operation of operations) {
          // Skip already completed operations
          if (operation.status === 'completed' && operation.uploadResult) {
            uploadedDocuments[operation.documentId] = operation.uploadResult;
            successCount++;
            continue;
          }
          
          try {
            // Update operation status to uploading
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 0);
            
            // Validate file still exists and is accessible
            try {
              const response = await fetch(operation.file.uri, { method: 'HEAD' });
              if (!response.ok) {
                throw new Error(`File no longer accessible: ${response.status}`);
              }
            } catch (headError) {
              throw new Error(`Document file is no longer available: ${operation.file.name}`);
            }

            // Convert file to blob with progress tracking
            let fileResponse;
            try {
              fileResponse = await fetch(operation.file.uri);
            } catch (fetchError) {
              throw new Error(`Failed to fetch file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
            }
            
            if (!fileResponse.ok) {
              throw new Error(`Failed to read file: ${fileResponse.status} ${fileResponse.statusText}`);
            }
            
            let fileBlob;
            try {
              fileBlob = await fileResponse.blob();
            } catch (blobError) {
              throw new Error(`Failed to convert file to blob: ${blobError instanceof Error ? blobError.message : 'Unknown error'}`);
            }
            const fileSize = fileBlob.size;
            
            // Validate file size hasn't changed
            if (operation.file.size && Math.abs(fileSize - operation.file.size) > 1024) {
              // File size mismatch detected but proceeding
            }

            // Update progress to 25% after file validation
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 25);
            
            // Update progress to 50% before upload
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 50);

            // Step 1: Get upload URL from Convex
            let uploadUrl;
            try {
              uploadUrl = await requirements.mutations.generateUploadUrl();
            } catch (urlError) {
              throw new Error(`Failed to get upload URL: ${urlError instanceof Error ? urlError.message : 'Unknown error'}`);
            }
            
            // Update progress to 60%
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 60);

            // Step 2: Upload file directly to Convex storage
            // Fix content-type to ensure it's a valid MIME type
            let contentType = operation.file.type || operation.file.mimeType;
            
            // Validate and fix content-type
            if (!contentType || contentType === 'image' || !contentType.includes('/')) {
              // Try to infer from file name or URI
              const fileUri = operation.file.uri || '';
              const fileName = operation.file.name || operation.file.fileName || '';
              
              if (fileUri.toLowerCase().includes('.png') || fileName.toLowerCase().includes('.png')) {
                contentType = 'image/png';
              } else if (fileUri.toLowerCase().includes('.pdf') || fileName.toLowerCase().includes('.pdf')) {
                contentType = 'application/pdf';
              } else {
                // Default to JPEG for images
                contentType = 'image/jpeg';
              }
            }
            
            let uploadResponse;
            try {
              uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: fileBlob,
                headers: {
                  'Content-Type': contentType,
                },
              });
            } catch (uploadError) {
              throw new Error(`Upload request failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
            }

            if (!uploadResponse.ok) {
              throw new Error(`File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }

            const { storageId } = await uploadResponse.json();
            
            // Update progress to 80%
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 80);

            // Store upload result for later use (NOT saving to database yet)
            const uploadData = {
              storageId: storageId,
              fileName: operation.file.fileName || operation.file.name || 'document',
              fileType: contentType, // Use the validated content type
              fileSize: fileSize,
            };
            uploadedDocuments[operation.documentId] = uploadData;

            // Mark operation as completed with upload result
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'completed', 100, undefined, uploadData);
            successCount++;

          } catch (error) {
            failureCount++;
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            
            formStorage.updateOperationStatus(
              tempApp.queueId, 
              operation.id, 
              'failed', 
              0, 
              errorMessage
            );
            
            // Continue with other uploads instead of failing completely
            // This allows partial submissions to still work
          }
        }
        
        // If any documents failed, abort the submission process
        if (failureCount > 0) {
          throw new Error(
            `Failed to upload ${failureCount} document(s). Please check your internet connection and try again.`
          );
        }
      }

      // Step 3: Link uploaded documents to the draft application
      
      // Step 4: Save document metadata to the application
      for (const [documentId, uploadData] of Object.entries(uploadedDocuments)) {
        try {
          await requirements.mutations.uploadDocument({
            applicationId: applicationId,
            fieldIdentifier: documentId,
            storageId: uploadData.storageId,
            fileName: uploadData.fileName,
            fileType: uploadData.fileType,
            fileSize: uploadData.fileSize,
            reviewStatus: 'Pending',
          });
        } catch (error) {
          // Note: We might want to delete the application if document linking fails
          throw new Error(`Failed to link document ${documentId} to application. Please try again.`);
        }
      }

      // Step 4: Submit application with payment (this validates all documents are uploaded)
      const result = await applications.mutations.submitApplicationForm(
        applicationId,
        paymentMethod,
        referenceNumber
      );

      if (result.success) {
        // Step 5: Mark queue as completed and clear data
        formStorage.updateQueueStatus(tempApp.queueId, 'completed');
        formStorage.clearTempApplication();
        
        // Step 6: Show success notification ONLY after everything is complete
        showSuccess('Application Submitted Successfully!', `Your application has been submitted with payment reference: ${referenceNumber}`);
        
        Alert.alert(
          'Application Submitted Successfully!',
          `Your application has been submitted with payment reference: ${referenceNumber}\n\nTotal Amount: ?${result.totalAmount}\nPayment Method: ${result.paymentMethod}\n\n${result.requiresOrientation ? '?? Note: Food safety orientation is required for your health card category.' : ''}\n\nYou will receive notifications about your application status.`,
          [
            {
              text: 'View Applications',
              onPress: () => {
                resetForm(); // Reset the form after successful submission
                router.push('/(tabs)/application');
              },
            },
          ]
        );
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Mark queue as failed
      if (tempApp?.queueId) {
        formStorage.updateQueueStatus(tempApp.queueId, 'failed');
      }
      
      Alert.alert(
        'Submission Error',
        error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [formData, requirementsByJobCategory, jobCategoriesData, applications, requirements, showSuccess, resetForm]);

  // NEW FLOW: Submit without payment - sets status to "Pending Payment"
  const submitApplicationWithoutPayment = useCallback(async () => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp?.queueId) {
      Alert.alert('Error', 'No application data found. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Check if job categories are loaded
      if (!jobCategoriesData || jobCategoriesData.length === 0) {
        showError('Data Loading', 'Job categories are still loading. Please wait a moment and try again.');
        setLoading(false);
        return;
      }

      // Check if form data has a selected job category
      if (!formData.jobCategory) {
        showError('Validation Error', 'Please select a job category before submitting.');
        setLoading(false);
        return;
      }

      // Mark queue as submitting
      formStorage.updateQueueStatus(tempApp.queueId, 'submitting');

      // Validate job category first
      const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
      if (!selectedCategory) {
        throw new Error(`Invalid job category selected. Selected: ${formData.jobCategory}, Available: ${jobCategoriesData?.length || 0} categories`);
      }

      // Step 1: Create or get draft application first
      let applicationId: string;
      const existingAppId = formStorage.getApplicationId();
      
      if (existingAppId) {
        applicationId = existingAppId;
        // Update application with latest form data in case user made changes
        await applications.mutations.updateApplication(existingAppId as Id<'applications'>, {
          applicationType: formData.applicationType,
          jobCategoryId: formData.jobCategory as Id<'jobCategories'>,
          position: formData.position,
          organization: formData.organization,
          civilStatus: formData.civilStatus,
        });
      } else {
        // Create new draft application
        applicationId = await applications.mutations.createApplication({
          applicationType: formData.applicationType,
          jobCategoryId: formData.jobCategory as Id<'jobCategories'>,
          position: formData.position,
          organization: formData.organization,
          civilStatus: formData.civilStatus,
        });
        
        // Save application ID to local storage for future resume capability
        formStorage.setApplicationId(applicationId);
      }

      // Save current form progress to MMKV (local draft)
      formStorage.saveApplicationProgress(formData, tempApp.selectedDocuments, tempApp.currentStep, applicationId);

      // Step 2: Upload documents with application reference
      const queue = formStorage.getDeferredQueue(tempApp.queueId);
      if (!queue) {
        throw new Error('Document queue not found');
      }
      
      const operations = Object.values(queue.uploadOperations);
      const uploadedDocuments: { [key: string]: { storageId: string; fileName: string; fileType: string; fileSize: number } } = {};
      
      if (operations.length > 0) {
        let successCount = 0;
        let failureCount = 0;
        
        for (const operation of operations) {
          // Skip already completed operations
          if (operation.status === 'completed' && operation.uploadResult) {
            uploadedDocuments[operation.documentId] = operation.uploadResult;
            successCount++;
            continue;
          }
          
          try {
            // Upload file logic (same as before)
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 0);
            
            const response = await fetch(operation.file.uri, { method: 'HEAD' });
            if (!response.ok) {
              throw new Error(`File no longer accessible: ${response.status}`);
            }
            
            const fileResponse = await fetch(operation.file.uri);
            const fileBlob = await fileResponse.blob();
            const fileSize = fileBlob.size;
            
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 50);
            
            const uploadUrl = await requirements.mutations.generateUploadUrl();
            
            let contentType = operation.file.type || operation.file.mimeType || 'image/jpeg';
            if (!contentType.includes('/')) {
              const fileName = operation.file.name || operation.file.fileName || '';
              if (fileName.toLowerCase().includes('.png')) {
                contentType = 'image/png';
              } else if (fileName.toLowerCase().includes('.pdf')) {
                contentType = 'application/pdf';
              } else {
                contentType = 'image/jpeg';
              }
            }
            
            const uploadResponse = await fetch(uploadUrl, {
              method: 'POST',
              body: fileBlob,
              headers: {
                'Content-Type': contentType,
              },
            });
            
            if (!uploadResponse.ok) {
              throw new Error(`File upload failed: ${uploadResponse.status}`);
            }
            
            const { storageId } = await uploadResponse.json();
            
            const uploadData = {
              storageId: storageId,
              fileName: operation.file.fileName || operation.file.name || 'document',
              fileType: contentType,
              fileSize: fileSize,
            };
            uploadedDocuments[operation.documentId] = uploadData;
            
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'completed', 100, undefined, uploadData);
            successCount++;
            
          } catch (error) {
            failureCount++;
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'failed', 0, errorMessage);
          }
        }
        
        if (failureCount > 0) {
          throw new Error(`Failed to upload ${failureCount} document(s). Please check your internet connection and try again.`);
        }
      }

      // Step 3: Link uploaded documents to the application
      for (const [documentId, uploadData] of Object.entries(uploadedDocuments)) {
        await requirements.mutations.uploadDocument({
          applicationId: applicationId,
          fieldIdentifier: documentId,
          storageId: uploadData.storageId,
          fileName: uploadData.fileName,
          fileType: uploadData.fileType,
          fileSize: uploadData.fileSize,
          reviewStatus: 'Pending',
        });
      }

      // Step 4: Submit application WITHOUT payment - this will set status to "Pending Payment"
      const result = await applications.mutations.submitApplicationForm(
        applicationId,
        null, // No payment method yet
        null  // No reference number yet
      );

      if (result.success) {
        // Mark queue as completed and clear data
        formStorage.updateQueueStatus(tempApp.queueId, 'completed');
        formStorage.clearTempApplication();
        
        // Show success notification
        showSuccess('Application Submitted!', 'Your application has been submitted successfully. Please proceed to payment.');
        
        Alert.alert(
          'Application Submitted!',
          'Your application has been successfully submitted.\n\nYou have 7 days to complete the payment of ?60.\n\nYou can pay now or later from your applications list.',
          [
            {
              text: 'Pay Now',
              onPress: () => {
                resetForm();
                // Navigate to application details with payment section
                router.replace(`/(screens)/(shared)/(screens)/(shared)/application/${applicationId}`);
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
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Mark queue as failed
      if (tempApp?.queueId) {
        formStorage.updateQueueStatus(tempApp.queueId, 'failed');
      }
      
      Alert.alert(
        'Submission Error',
        error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [formData, requirementsByJobCategory, jobCategoriesData, applications, requirements, showSuccess, resetForm]);

  return {
    loading,
    handleSubmit,
  };
};