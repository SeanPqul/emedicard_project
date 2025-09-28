import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;

export function useRequirements(jobCategoryId?: string, formId?: string) {
  const jobCategoryRequirements = useQuery(
    api.requirements.getJobCategoryRequirements.getJobCategoryRequirementsQuery,
    jobCategoryId ? { jobCategoryId: jobCategoryId as ConvexId<'jobCategories'> } : "skip"
  );
  
  const formDocuments = useQuery(
    api.requirements.getFormDocumentsRequirements.getApplicationDocumentsRequirementsQuery,
    formId ? { applicationId: formId as ConvexId<'applications'> } : "skip"
  );

  const uploadDocumentMutation = useMutation(api.requirements.uploadDocuments.uploadDocumentsMutation);
  const updateDocumentFieldMutation = useMutation(api.requirements.updateDocumentField.updateDocumentFieldMutation);
  const deleteDocumentMutation = useMutation(api.requirements.removeDocument.deleteDocumentMutation);
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);

  const uploadDocument = async (input: {
    applicationId: ConvexId<'applications'>;
    fieldIdentifier: string; // Changed from fieldName to fieldIdentifier to match backend
    storageId: ConvexId<'_storage'>;
    fileName: string;
    fileType: string;
    fileSize: number;
    adminRemarks?: string;
    reviewStatus?: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: ConvexId<'users'>;
    reviewedAt?: number;
  }) => {
    return uploadDocumentMutation(input);
  };

  const updateDocumentField = async (input: {
    applicationId: ConvexId<'applications'>;
    fieldIdentifier: string; // Changed from fieldName to fieldIdentifier to match backend
    storageId: ConvexId<'_storage'>;
    fileName: string;
    fileType: string;
    fileSize: number;
    adminRemarks?: string;
    reviewStatus?: 'Pending' | 'Approved' | 'Rejected';
    reviewedBy?: ConvexId<'users'>;
    reviewedAt?: number;
  }) => {
    return updateDocumentFieldMutation(input);
  };

  const deleteDocument = async (input: {
    applicationId: ConvexId<'applications'>;
    fieldName: string;
    storageId: ConvexId<'_storage'>;
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