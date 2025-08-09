import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Job Categories API Module
 * 
 * Feature-scoped API functions for job category operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Get all job categories
 */
export async function getAllJobCategories() {
  return convex.query(api.jobCategories.getAllJobType, {});
}

/**
 * Get job category by ID
 */
export async function getJobCategoryById(jobCategoryId: Id<'jobCategories'>) {
  return convex.query(api.jobCategories.getById, { jobCategoryId });
}

/**
 * Create a new job category
 */
export async function createJobCategory(input: {
  name: string;
  description?: string;
  requirements?: string[];
}) {
  return convex.mutation(api.jobCategories.createJobType, input);
}

/**
 * Update a job category
 */
export async function updateJobCategory(jobCategoryId: Id<'jobCategories'>, updates: {
  name?: string;
  description?: string;
  requirements?: string[];
}) {
  return convex.mutation(api.jobCategories.updateJobType, { jobCategoryId, ...updates });
}

/**
 * Delete a job category
 */
export async function deleteJobCategory(jobCategoryId: Id<'jobCategories'>) {
  return convex.mutation(api.jobCategories.deleteJobType, { jobCategoryId });
}
