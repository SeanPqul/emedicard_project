import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Id } from '@backend/convex/_generated/dataModel';
import { formStorage } from '../services/formStorage';
import { DocumentRequirement } from '@/src/entities/application/model/types';
import { JobCategory } from '@/src/entities/jobCategory/model/types';
import { ApplicationFormData } from '../lib/validation';

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
      age: formData.age,
      nationality: formData.nationality,
      gender: formData.gender,
    });
    formStorage.setApplicationId(applicationId);
    return applicationId;
  }, [applications, formData]);

  const uploadDocuments = useCallback(async (queueId: string) => {
    const queue = formStorage.getDeferredQueue(queueId);
    if (!queue) throw new Error('Document queue not found');

    const operations = Object.values(queue.uploadOperations);
    const uploadedDocuments: { [key: string]: { storageId: string; fileName: string; fileType: string; fileSize: number } } = {};

    if (operations.length === 0) return uploadedDocuments;

    let failureCount = 0;

    for (const operation of operations) {
      if (operation.status === 'completed' && operation.uploadResult) {
        uploadedDocuments[operation.documentId] = operation.uploadResult;
        continue;
      }

      try {
        formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 10);

        try {
          const response = await fetch(operation.file.uri, { method: 'HEAD' });
          if (!response.ok) throw new Error(`File no longer accessible: ${response.status}`);
        } catch {
          throw new Error(`Document file is no longer available: ${operation.file.name}`);
        }

        formStorage.updateOperationStatus(queueId, operation.id, 'uploading', 20);

        let fileResponse: Response;
        try {
          fileResponse = await fetch(operation.file.uri);
        } catch (fetchError) {
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
          uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: fileBlob,
            headers: { 'Content-Type': contentType },
          });
        } catch (uploadError) {
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
      } catch (error) {
        failureCount++;
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        formStorage.updateOperationStatus(queueId, operation.id, 'failed', 0, errorMessage);
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
    try {
      await submitApplicationWithoutPayment();
    } catch {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  }, [validateCurrentStep, requirementsByJobCategory, formData]);

  const submitApplicationWithoutPayment = useCallback(async () => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp?.queueId) {
      Alert.alert('Error', 'No application data found. Please try again.');
      setLoading(false);
      return;
    }

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

      const applicationId = await ensureDraftApplication();

      formStorage.saveApplicationProgress(formData, tempApp.selectedDocuments, tempApp.currentStep, applicationId);

      const uploadedDocuments = await uploadDocuments(tempApp.queueId);

      await linkDocuments(applicationId, uploadedDocuments);

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
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      if (tempApp?.queueId) {
        formStorage.updateQueueStatus(tempApp.queueId, 'failed');
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
