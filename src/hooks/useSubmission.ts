import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Id } from '../../convex/_generated/dataModel';
import { formStorage } from '../utils/formStorage';
import { DocumentRequirement, JobCategory } from '../types/domain/application';

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

      // Validate job category first
      console.log('Job categories data:', jobCategoriesData?.length, 'items');
      console.log('Selected job category ID:', formData.jobCategory);
      console.log('Form data:', formData);
      
      const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
      if (!selectedCategory) {
        console.log('Available categories:', jobCategoriesData?.map(cat => ({ id: cat._id, name: cat.name })));
        throw new Error(`Invalid job category selected. Selected: ${formData.jobCategory}, Available: ${jobCategoriesData?.length || 0} categories`);
      }

      // Step 1: Upload all documents from deferred queue FIRST
      const queue = formStorage.getDeferredQueue(tempApp.queueId);
      if (!queue) {
        throw new Error('Document queue not found');
      }
      
      const operations = Object.values(queue.uploadOperations);
      const uploadedDocuments: { [key: string]: { storageId: string; fileName: string; fileType: string; fileSize: number } } = {};
      
      if (operations.length === 0) {
        console.log('No documents to upload');
      } else {
        console.log(`Uploading ${operations.length} documents from queue...`);
        
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
            console.log(`Checking file URI for ${operation.documentId}: ${operation.file.uri}`);
            try {
              const response = await fetch(operation.file.uri, { method: 'HEAD' });
              if (!response.ok) {
                console.error(`HEAD request failed for ${operation.documentId}:`, response.status, response.statusText);
                throw new Error(`File no longer accessible: ${response.status}`);
              }
            } catch (headError) {
              console.error(`HEAD request error for ${operation.documentId}:`, headError);
              throw new Error(`Document file is no longer available: ${operation.file.name}`);
            }

            // Convert file to blob with progress tracking
            console.log(`Fetching file for ${operation.documentId} from URI: ${operation.file.uri}`);
            let fileResponse;
            try {
              fileResponse = await fetch(operation.file.uri);
            } catch (fetchError) {
              console.error(`Failed to fetch file for ${operation.documentId}:`, fetchError);
              throw new Error(`Failed to fetch file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
            }
            
            if (!fileResponse.ok) {
              console.error(`File fetch response not OK for ${operation.documentId}:`, fileResponse.status, fileResponse.statusText);
              throw new Error(`Failed to read file: ${fileResponse.status} ${fileResponse.statusText}`);
            }
            
            let fileBlob;
            try {
              fileBlob = await fileResponse.blob();
            } catch (blobError) {
              console.error(`Failed to convert to blob for ${operation.documentId}:`, blobError);
              throw new Error(`Failed to convert file to blob: ${blobError instanceof Error ? blobError.message : 'Unknown error'}`);
            }
            const fileSize = fileBlob.size;
            console.log(`File blob created for ${operation.documentId}, size: ${fileSize} bytes`);
            
            // Validate file size hasn't changed
            if (operation.file.size && Math.abs(fileSize - operation.file.size) > 1024) {
              console.warn(`File size mismatch for ${operation.file.name}: expected ${operation.file.size}, got ${fileSize}`);
            }

            // Update progress to 25% after file validation
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 25);
            
            // Update progress to 50% before upload
            formStorage.updateOperationStatus(tempApp.queueId, operation.id, 'uploading', 50);

            // Step 1: Get upload URL from Convex
            console.log(`Getting upload URL for ${operation.documentId}...`);
            let uploadUrl;
            try {
              uploadUrl = await requirements.mutations.generateUploadUrl();
              console.log(`Got upload URL for ${operation.documentId}`);
            } catch (urlError) {
              console.error(`Failed to get upload URL for ${operation.documentId}:`, urlError);
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
            
            console.log(`Uploading ${operation.documentId} to storage, content-type: ${contentType}`);
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
              console.error(`Upload request failed for ${operation.documentId}:`, uploadError);
              throw new Error(`Upload request failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
            }

            if (!uploadResponse.ok) {
              console.error(`Upload response not OK for ${operation.documentId}:`, uploadResponse.status, uploadResponse.statusText);
              const responseText = await uploadResponse.text();
              console.error(`Upload response body:`, responseText);
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
            
            console.log(`✅ Successfully uploaded file to storage: ${operation.file.name}`);

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

      // Step 2: Create the application in database ONLY after documents are uploaded successfully
      console.log('Creating application with uploaded documents...');
      const applicationId = await applications.mutations.createApplication({
        applicationType: formData.applicationType,
        jobCategoryId: formData.jobCategory as Id<'jobCategories'>,
        position: formData.position,
        organization: formData.organization,
        civilStatus: formData.civilStatus,
      });

      // Step 3: Save document metadata to the created application
      console.log('Linking uploaded documents to application...');
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
          console.log(`✅ Linked document ${documentId} to application`);
        } catch (error) {
          console.error(`Failed to link document ${documentId} to application:`, error);
          // Note: We might want to delete the application if document linking fails
          throw new Error(`Failed to link document ${documentId} to application. Please try again.`);
        }
      }

      // Step 4: Submit application with payment (this validates all documents are uploaded)
      console.log(`Submitting application ${applicationId} with payment method ${paymentMethod}`);
      const result = await applications.mutations.submitApplicationForm(
        applicationId,
        paymentMethod,
        referenceNumber
      );
      
      console.log('Application submission result:', result);

      if (result.success) {
        // Step 5: Mark queue as completed and clear data
        formStorage.updateQueueStatus(tempApp.queueId, 'completed');
        formStorage.clearTempApplication();
        
        // Step 6: Show success notification ONLY after everything is complete
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