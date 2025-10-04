import { useMutation, useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

export function useRequirements(jobCategoryId?: string, formId?: string) {
  const jobCategoryRequirements = useQuery(
    api.requirements.getJobCategoryRequirements.getJobCategoryRequirementsQuery,
    jobCategoryId ? { jobCategoryId: jobCategoryId as Id<'jobCategories'> } : "skip"
  );
  
  const formDocuments = useQuery(
    api.requirements.getFormDocumentsRequirements.getApplicationDocumentsRequirementsQuery,
    formId ? { applicationId: formId as Id<'applications'> } : "skip"
  );

  const uploadDocumentMutation = useMutation(api.requirements.uploadDocuments.uploadDocumentsMutation);
  const updateDocumentFieldMutation = useMutation(api.requirements.updateDocumentField.updateDocumentFieldMutation);
  const deleteDocumentMutation = useMutation(api.requirements.removeDocument.deleteDocumentMutation);
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);

  const uploadDocument = async (input: {
    applicationId: Id<'applications'>;
    fieldName: string;
    fieldIdentifier: string;
    storageId: Id<'_storage'>;
    fileName: string;
    fileType: string;
    fileSize: number;
    reviewStatus?: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: Id<'users'>;
    reviewedAt?: number;
    remarks?: string;
  }) => {
    return uploadDocumentMutation(input);
  };

  const updateDocumentField = async (input: {
    applicationId: Id<'applications'>;
    fieldName: string;
    fieldIdentifier: string;
    storageId: Id<'_storage'>;
    fileName: string;
    fileType: string;
    fileSize: number;
    reviewStatus?: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: Id<'users'>;
    reviewedAt?: number;
    remarks?: string;
  }) => {
    return updateDocumentFieldMutation(input);
  };

  const deleteDocument = async (input: {
    applicationId: Id<'applications'>;
    fieldName: string;
    storageId: Id<'_storage'>;
  }) => {
    return deleteDocumentMutation(input);
  };

  const generateUploadUrl = async () => {
    return generateUploadUrlMutation();
  };


  return {
    data: {
      jobCategoryRequirements,
      formDocuments,
    },
    isLoading: jobCategoryId ? jobCategoryRequirements === undefined : false,
    isLoadingFormDocuments: formId ? formDocuments === undefined : false,
    
    
    mutations: {
      uploadDocument,
      updateDocumentField,
      deleteDocument,
      generateUploadUrl,
    }
  };
}