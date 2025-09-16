import { useQuery as convexUseQuery, useMutation as convexUseMutation } from 'convex/react';
import { api } from '../../../../../backend/convex/_generated/api';
import { Id } from '../../../../../backend/convex/_generated/dataModel';
import { errorHandlers } from './error-handling';

// Re-export commonly used types
export type ConvexId<T extends string> = Id<T>;

/**
 * Centralized Convex Hook Factory
 * Provides consistent patterns for API calls across features
 */

// ===== QUERY HOOKS =====

/**
 * Creates a standardized query hook with consistent loading states and error handling
 */
export function createQueryHook<TInput, TOutput>(
  queryFunction: any,
  options?: {
    skipWhen?: (input: TInput) => boolean;
    errorMessage?: string;
  }
) {
  return function useCustomQuery(input: TInput | "skip") {
    const shouldSkip = input === "skip" || (options?.skipWhen && input !== "skip" && options.skipWhen(input));
    
    const data = convexUseQuery(queryFunction, shouldSkip ? "skip" : input);
    
    return {
      data,
      isLoading: data === undefined,
      error: null, // TODO: Implement proper error handling when Convex supports it
    };
  };
}

// ===== MUTATION HOOKS =====

/**
 * Creates a standardized mutation hook with consistent error handling
 */
export function createMutationHook<TInput, TOutput>(
  mutationFunction: any,
  options?: {
    onSuccess?: (result: TOutput) => void;
    onError?: (error: any) => void;
    successMessage?: string;
  }
) {
  return function useCustomMutation() {
    const mutation = convexUseMutation(mutationFunction);
    
    const mutate = async (input: TInput): Promise<TOutput | null> => {
      try {
        const result = await mutation(input);
        
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (error) {
        const handledError = errorHandlers.handleApiError(error);
        
        if (options?.onError) {
          options.onError(handledError);
        } else {
          errorHandlers.showError(handledError);
        }
        
        return null;
      }
    };
    
    return {
      mutate,
      isLoading: false, // TODO: Track mutation loading state
    };
  };
}

// ===== COMMON API PATTERNS =====

/**
 * Standard CRUD operations pattern
 */
export function createCrudHooks<TEntity, TCreateInput, TUpdateInput>(
  entityName: string,
  apiEndpoints: {
    get: any;
    getById: any;
    create: any;
    update: any;
    delete?: any;
  }
) {
  // Get all entities
  const useGetAll = () => {
    const data = convexUseQuery(apiEndpoints.get, {});
    
    return {
      data,
      isLoading: data === undefined,
      error: null,
    };
  };
  
  // Get entity by ID
  const useGetById = (id?: ConvexId<any>) => {
    const data = convexUseQuery(
      apiEndpoints.getById,
      id ? { id } : "skip"
    );
    
    return {
      data,
      isLoading: id ? data === undefined : false,
      error: null,
    };
  };
  
  // Create entity
  const useCreate = () => {
    const mutation = convexUseMutation(apiEndpoints.create);
    
    const create = async (input: TCreateInput) => {
      try {
        return await mutation(input);
      } catch (error) {
        const handledError = errorHandlers.handleApiError(error);
        errorHandlers.showError(handledError);
        throw error;
      }
    };
    
    return { create };
  };
  
  // Update entity
  const useUpdate = () => {
    const mutation = convexUseMutation(apiEndpoints.update);
    
    const update = async (id: ConvexId<any>, input: TUpdateInput) => {
      try {
        return await mutation({ id, ...input });
      } catch (error) {
        const handledError = errorHandlers.handleApiError(error);
        errorHandlers.showError(handledError);
        throw error;
      }
    };
    
    return { update };
  };
  
  return {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
  };
}

// ===== CONVEX CLIENT RE-EXPORT =====

// Re-export the Convex client for direct usage when needed
export { convex } from '../../lib/convexClient';

// ===== API ENDPOINTS =====

// Centralized API endpoints for easy access
export const apiEndpoints = {
  users: {
    getCurrentUser: api.users.getCurrentUser.getCurrentUserQuery,
    getUsersByRole: api.users.getUsersByRole.getUsersByRoleQuery,
    createUser: api.users.createUser.createUserMutation,
    updateUser: api.users.updateUser.updateUserMutation,
    updateRole: api.users.updateRole.updateRoleMutation,
  },
  applications: {
    getById: api.applications.getApplicationById.getApplicationByIdQuery,
    getUserApplications: api.applications.getUserApplications.getUserApplicationsQuery,
    create: api.applications.createApplication.createApplicationMutation,
    update: api.applications.updateApplication.updateApplicationMutation,
    submit: api.applications.submitApplication.submitApplicationMutation,
  },
  healthCards: {
    // TODO: Add health card API endpoints when available
  },
  payments: {
    // TODO: Add payment API endpoints when available
  },
} as const;