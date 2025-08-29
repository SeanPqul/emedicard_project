import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Id } from '../../convex/_generated/dataModel';
import { formStorage } from '../utils/formStorage';
import { DocumentRequirement, JobCategory } from '../types/domain/application';
import { blobToBase64 } from '../utils/fileUtils';

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
      // TEMPORARY: Auto-submit with test payment for testing purposes
      console.log('Auto-submitting with test payment data...');
      const testReferenceNumber = `TEST-${Date.now()}`;
      
      Alert.alert(
        'Test Payment Mode',
        `Automatically processing payment for testing.\nReference: ${testReferenceNumber}`,
        [
          {
            text: 'Continue',
            onPress: () => submitApplicationWithPayment('BaranggayHall', testReferenceNumber),
          },
        ]
      );
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

      // Step 1: Create the application in database
      console.log('Job categories data:', jobCategoriesData?.length, 'items');
      console.log('Selected job category ID:', formData.jobCategory);
      console.log('Form data:', formData);
      
      const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
      if (!selectedCategory) {
        console.log('Available categories:', jobCategoriesData?.map(cat => ({ id: cat._id, name: cat.name })));
        throw new Error(`Invalid job category selected. Selected: ${formData.jobCategory}, Available: ${jobCategoriesData?.length || 0} categories`);
      }

      const applicationId = await applications.mutations.createApplication({
        applicationType: formData.applicationType,
        jobCategoryId: formData.jobCategory as Id<'jobCategories'>,
        position: formData.position,
        organization: formData.organization,
        civilStatus: formData.civilStatus,
      });

      // Step 2: Upload all documents from deferred queue
      const queue = formStorage.getDeferredQueue(tempApp.queueId);
      if (!queue) {
        throw new Error('Document queue not found');
      }
      
      const operations = Object.values(queue.uploadOperations);
      if (operations.length === 0) {
        console.log('No documents to upload');
      } else {
        console.log(`Uploading ${operations.length} documents from queue...`);
        
        let successCount = 0;
        let failureCount = 0;
        
        for (const operation of operations) {
          // Skip already completed operations
          if (operation.status === 'completed') {
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
            const fileResponse = await fetch(operation.file.uri);
            if (!fileResponse.ok) {
              throw new Error(`Failed to read file: ${fileResponse.status}`);
            }
            
            const fileBlob = await fileResponse.blob();
            const fileSize = fileBlob.size;
            
            // Validate file size hasn't changed
            if (operation.file.size && Math.abs(fileSize - operation.file.size) > 1024) {
              console.warn(`File size mismatch for ${operation.file.name}: expected ${operation.file.size}, got ${fileSize}`);
            }

            // Update progress to 25% before converting file
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 25);

            // Convert file to base64 for centralized upload
            const fileBase64 = await blobToBase64(fileBlob);
            
            // Update progress to 50% before upload
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 50);

            // Use centralized upload function (handles all 3 steps internally)
            const uploadResult = await requirements.mutations.uploadDocumentWithFile({
              applicationId: applicationId,
              fieldIdentifier: operation.documentId,
              fileName: operation.file.fileName || operation.file.name || 'document',
              fileType: operation.file.type || operation.file.mimeType || 'image/jpeg',
              fileSize: fileSize,
              fileBase64: fileBase64,
              reviewStatus: 'Pending',
            });
            
            if (!uploadResult.success) {
              throw new Error('Failed to upload document');
            }

            // Mark operation as completed
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'completed', 100);
            successCount++;
            
            console.log(`✅ Successfully uploaded: ${operation.file.name}`);

          } catch (error) {
            failureCount++;
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            console.error(`❌ Failed to upload document ${operation.documentId}:`, errorMessage);
            
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
        
        console.log(`Document upload summary: ${successCount} successful, ${failureCount} failed`);
        
        // If any documents failed, abort the submission process
        if (failureCount > 0) {
          throw new Error(
            `Failed to upload ${failureCount} document(s). Please check your internet connection and try again.`
          );
        }
      }

      // Step 3: Submit application with payment (this validates all documents are uploaded)
      console.log(`Submitting application ${applicationId} with payment method ${paymentMethod}`);
      const result = await applications.mutations.submitApplicationForm(
        applicationId,
        paymentMethod,
        referenceNumber
      );

      if (result.success) {
        // Step 4: Mark queue as completed and clear data
        formStorage.updateQueueStatus(tempApp.queueId, 'completed');
        formStorage.clearTempApplication();
        
        // Step 5: Show success notification ONLY after everything is complete
        showSuccess('Application Submitted Successfully!', `Your application has been submitted with payment reference: ${referenceNumber}`);
        
        Alert.alert(
          'Application Submitted Successfully!',
          `Your application has been submitted with payment reference: ${referenceNumber}\n\nTotal Amount: ₱${result.totalAmount}\nPayment Method: ${result.paymentMethod}\n\n${result.requiresOrientation ? '📚 Note: Food safety orientation is required for your health card category.' : ''}\n\nYou will receive notifications about your application status.`,
          [
            {
              text: 'View Applications',
              onPress: () => router.push('/(tabs)/application'),
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
  }, [formData, requirementsByJobCategory, jobCategoriesData, applications, requirements, showSuccess]);

  return {
    loading,
    handleSubmit,
  };
};