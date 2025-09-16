import { useQuery, useMutation } from 'convex/react';
import { apiEndpoints, ConvexId } from '../../shared/api';
import { 
  Application, 
  CreateApplicationInput, 
  UpdateApplicationInput, 
  SubmitApplicationInput,
  PaymentMethod
} from './model';

/**
 * Application Entity - API Layer
 * Centralized application API operations extracted from useApplications.ts
 */

// ===== QUERY HOOKS =====

/**
 * Hook to get a specific application by ID
 */
export const useApplicationById = (applicationId?: string) => {
  const application = useQuery(
    apiEndpoints.applications.getById,
    applicationId ? { applicationId: applicationId as ConvexId<"applications"> } : "skip"
  );

  return {
    data: application as Application | undefined,
    isLoading: applicationId ? application === undefined : false,
    error: null,
  };
};

/**
 * Hook to get all applications for the current user
 */
export const useUserApplications = () => {
  const userApplications = useQuery(apiEndpoints.applications.getUserApplications, {});

  return {
    data: userApplications as Application[] | undefined,
    isLoading: userApplications === undefined,
    error: null,
  };
};

/**
 * Combined applications hook (maintains backward compatibility with useApplications)
 */
export const useApplications = (applicationId?: string) => {
  const { data: application, isLoading: isLoadingApplication } = useApplicationById(applicationId);
  const { data: userApplications, isLoading: isLoadingUserApplications } = useUserApplications();

  return {
    data: {
      application,
      userApplications,
      // Backwards compatibility
      form: application,
    },
    isLoading: isLoadingUserApplications,
    isLoadingApplication,
    // Backwards compatibility
    isLoadingForm: isLoadingApplication,
  };
};

// ===== MUTATION HOOKS =====

/**
 * Hook for creating a new application
 */
export const useCreateApplication = () => {
  const createApplicationMutation = useMutation(apiEndpoints.applications.create);

  const createApplication = async (input: CreateApplicationInput): Promise<Application | null> => {
    try {
      const result = await createApplicationMutation(input);
      return result as Application;
    } catch (error) {
      console.error('Create application error:', error);
      return null;
    }
  };

  return {
    createApplication,
    isLoading: false, // TODO: Track mutation loading state
  };
};

/**
 * Hook for updating an application
 */
export const useUpdateApplication = () => {
  const updateApplicationMutation = useMutation(apiEndpoints.applications.update);

  const updateApplication = async (
    applicationId: ConvexId<'applications'>, 
    updates: UpdateApplicationInput
  ): Promise<Application | null> => {
    try {
      const result = await updateApplicationMutation({ applicationId, ...updates });
      return result as Application;
    } catch (error) {
      console.error('Update application error:', error);
      return null;
    }
  };

  return {
    updateApplication,
    isLoading: false, // TODO: Track mutation loading state
  };
};

/**
 * Hook for submitting an application
 */
export const useSubmitApplication = () => {
  const submitApplicationMutation = useMutation(apiEndpoints.applications.submit);

  const submitApplicationForm = async (
    applicationId: ConvexId<'applications'>,
    paymentMethod: PaymentMethod,
    paymentReferenceNumber: string,
    receiptStorageId?: ConvexId<'_storage'>
  ): Promise<Application | null> => {
    try {
      const payload = {
        applicationId,
        paymentMethod,
        paymentReferenceNumber,
        ...(receiptStorageId !== undefined && { paymentReceiptId: receiptStorageId }),
      };
      
      const result = await submitApplicationMutation(payload);
      return result as Application;
    } catch (error) {
      console.error('Submit application error:', error);
      return null;
    }
  };

  return {
    submitApplicationForm,
    isLoading: false, // TODO: Track mutation loading state
  };
};

/**
 * Combined mutations hook (maintains backward compatibility)
 */
export const useApplicationMutations = () => {
  const { createApplication } = useCreateApplication();
  const { updateApplication } = useUpdateApplication();
  const { submitApplicationForm } = useSubmitApplication();

  return {
    mutations: {
      createApplication,
      updateApplication,
      submitApplicationForm,
      // Backwards compatibility aliases
      createForm: createApplication,
      updateForm: updateApplication,
    }
  };
};
