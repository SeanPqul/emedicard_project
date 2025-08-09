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
  jobCategory: Id<'jobCategories'>;
  position: string;
  organization: string;
  civilStatus: string;
}) {
  return convex.mutation(api.forms.createForm, input);
}

/**
 * Get form by ID
 */
export async function getFormById(formId: Id<'forms'>) {
  return convex.query(api.forms.getById, { formId });
}

/**
 * Get all applications for the current user
 */
export async function getUserApplications() {
  return convex.query(api.forms.getUserApplications, {});
}

/**
 * Update form data
 */
export async function updateForm(formId: Id<'forms'>, updates: any) {
  return convex.mutation(api.forms.updateForm, { formId, ...updates });
}

/**
 * Submit application form
 */
export async function submitApplicationForm(formId: Id<'forms'>) {
  return convex.mutation(api.forms.submitApplicationForm, { formId });
}

