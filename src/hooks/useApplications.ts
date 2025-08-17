import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;

export function useApplications(formId?: string) {
  const form = useQuery(
    api.forms.getFormById.getFormByIdQuery, 
    formId ? { formId: formId as ConvexId<"forms"> } : "skip"
  );
  const userApplications = useQuery(api.forms.getUserApplications.getUserApplicationsQuery);
  const createFormMutation = useMutation(api.forms.createForm.createFormMutation);
  const updateFormMutation = useMutation(api.forms.updateForm.updateFormMutation);
  const submitApplicationMutation = useMutation(api.forms.submitApplicationForm.submitApplicationFormMutation);

  const createForm = async (input: {
    applicationType: 'New' | 'Renew';
    jobCategory: ConvexId<'jobCategory'>;
    position: string;
    organization: string;
    civilStatus: string;
  }) => {
    return createFormMutation(input);
  };

  const updateForm = async (formId: ConvexId<'forms'>, updates: any) => {
    return updateFormMutation({ formId, ...updates });
  };

  const submitApplicationForm = async (
    formId: ConvexId<'forms'>,
    paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall',
    paymentReferenceNumber: string,
    paymentReceiptId?: ConvexId<'_storage'>
  ) => {
    return submitApplicationMutation({
      formId,
      paymentMethod,
      paymentReferenceNumber,
      ...(paymentReceiptId !== undefined && { paymentReceiptId }),
    });
  };

  return {
    data: {
      form,
      userApplications,
    },
    isLoading: userApplications === undefined,
    isLoadingForm: formId ? form === undefined : false,
    
    service: applicationsService,
    
    mutations: {
      createForm,
      updateForm,
      submitApplicationForm,
    }
  };
}