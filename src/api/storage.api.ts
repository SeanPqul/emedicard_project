import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Storage API Module
 * 
 * Feature-scoped API functions for file storage and document operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Generate upload URL for file storage
 */
export async function generateUploadUrl() {
  return convex.mutation(api.storage.generateUploadUrl.generateUploadUrlMutation, {});
}

