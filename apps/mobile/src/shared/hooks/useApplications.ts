import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../../backend/convex/_generated/api';
import { Id } from '../../../../../../../backend/convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;

export function useApplications(applicationId?: string) {
  const application = useQuery(
    api.applications.getApplicationById.getApplicationByIdQuery, 
    applicationId ? { applicationId: applicationId as ConvexId<"applications"> } : "skip"
  );
  const userApplications = useQuery(api.applications.getUserApplications.getUserApplicationsQuery);
  const createApplicationMutation = useMutation(api.applications.createApplication.createApplicationMutation);
  const updateApplicationMutation = useMutation(api.applications.updateApplication.updateApplicationMutation);
  const submitApplicationMutation = useMutation(api.applications.submitApplication.submitApplicationMutation);

  const createApplication = async (input: {
    applicationType: 'New' | 'Renew';
    jobCategoryId: ConvexId<'jobCategories'>;
    position: string;
    organization: string;
    civilStatus: string;
  }) => {
    return createApplicationMutation(input);
  };

  const updateApplication = async (applicationId: ConvexId<'applications'>, updates: any) => {
    return updateApplicationMutation({ applicationId, ...updates });
  };

  const submitApplicationForm = async (
    applicationId: ConvexId<'applications'>,
    paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall' | null,
    paymentReferenceNumber: string | null,
    receiptStorageId?: ConvexId<'_storage'>
  ) => {
    return submitApplicationMutation({
      applicationId,
      ...(paymentMethod !== null && { paymentMethod }),
      ...(paymentReferenceNumber !== null && { paymentReferenceNumber }),
      ...(receiptStorageId !== undefined && { paymentReceiptId: receiptStorageId }),
    });
  };

  return {
    data: {
      application,
      userApplications,
      // Backwards compatibility
      form: application,
    },
    isLoading: userApplications === undefined,
    isLoadingApplication: applicationId ? application === undefined : false,
    // Backwards compatibility
    isLoadingForm: applicationId ? application === undefined : false,
    
    mutations: {
      createApplication,
      updateApplication,
      submitApplicationForm,
      // Backwards compatibility aliases
      createForm: createApplication,
      updateForm: updateApplication,
    }
  };
}