import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Forms API Module
 * 
 * Feature-scoped API functions for form operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Create a new form/application
 */
export async function createForm(input: {
  applicationType: 'New' | 'Renew';
  jobCategory: Id<'jobCategory'>;
  position: string;
  organization: string;
  civilStatus: string;
}) {
  return convex.mutation(api.forms.createForm.createFormMutation, input);
}

/**
 * Get form by ID
 */
export async function getFormById(formId: Id<'forms'>) {
  return convex.query(api.forms.getFormById.getFormByIdQuery, { formId });
}

/**
 * Get all applications for the current user
 */
export async function getUserApplications() {
  return convex.query(api.forms.getUserApplications.getUserApplicationsQuery, {});
}

/**
 * Update form data
 */
export async function updateForm(formId: Id<'forms'>, updates: any) {
  return convex.mutation(api.forms.updateForm.updateFormMutation, { formId, ...updates });
}

/**
 * Submit application form
 */
export async function submitApplicationForm(
  formId: Id<'forms'>,
  paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall',
  paymentReferenceNumber: string,
  paymentReceiptId?: Id<'_storage'>,
) {
  return convex.mutation(api.forms.submitApplicationForm.submitApplicationFormMutation, {
    formId,
    paymentMethod,
    paymentReferenceNumber,
    paymentReceiptId,
  });
}

