import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Orientations API Module
 * 
 * Feature-scoped API functions for orientation operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Get user orientations
 */
export async function getUserOrientations() {
  return convex.query(api.orientations.getUserOrientations, {});
}
