import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;

export function useRequirements(jobCategoryId?: string, formId?: string) {
  const jobCategoryRequirements = useQuery(
    api.requirements.getJobCategoryRequirements.getJobCategoryRequirementsQuery,
    jobCategoryId ? { jobCategoryId: jobCategoryId as ConvexId<'jobCategory'> } : "skip"
  );
  
  const formDocuments = useQuery(
    api.requirements.getFormDocumentsRequirements.getFormDocumentsRequirementsQuery,
    formId ? { formId: formId as ConvexId<'forms'> } : "skip"
  );

  const uploadDocumentMutation = useMutation(api.requirements.uploadDocuments.uploadDocumentsMutation);
  const updateDocumentFieldMutation = useMutation(api.requirements.updateDocumentField.updateDocumentFieldMutation);
  const deleteDocumentMutation = useMutation(api.requirements.removeDocument.deleteDocumentMutation);

  const uploadDocument = async (input: {
    formId: ConvexId<'forms'>;
    fieldName: string;
    storageId: ConvexId<'_storage'>;
    fileName: string;
    fileType: string;
    fileSize: number;
    status?: 'Pending' | 'Approved' | 'Rejected';
    reviewBy?: ConvexId<'users'>;
    reviewAt?: number;
    remarks?: string;
  }) => {
    return uploadDocumentMutation(input);
  };

  const updateDocumentField = async (input: {
    formId: ConvexId<'forms'>;
    fieldName: string;
    storageId: ConvexId<'_storage'>;
    fileName: string;
    fileType: string;
    fileSize: number;
    status?: 'Pending' | 'Approved' | 'Rejected';
    reviewBy?: ConvexId<'users'>;
    reviewAt?: number;
    remarks?: string;
  }) => {
    return updateDocumentFieldMutation(input);
  };

  const deleteDocument = async (input: {
    formId: ConvexId<'forms'>;
    fieldName: string;
    storageId: ConvexId<'_storage'>;
  }) => {
    return deleteDocumentMutation(input);
  };

  return {
    data: {
      jobCategoryRequirements,
      formDocuments,
    },
    isLoading: jobCategoryId ? jobCategoryRequirements === undefined : false,
    isLoadingFormDocuments: formId ? formDocuments === undefined : false,
    
    service: requirementsService,
    
    mutations: {
      uploadDocument,
      updateDocumentField,
      deleteDocument,
    }
  };
}
