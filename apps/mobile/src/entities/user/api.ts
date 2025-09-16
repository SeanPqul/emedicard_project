import { useQuery, useMutation } from 'convex/react';
import { apiEndpoints, ConvexId } from '../../shared/api';
import { User, CreateUserInput, UpdateUserInput, UserRole, createUserPayload } from './model';

/**
 * User Entity - API Layer
 * Centralized user API operations extracted from useUsers.ts
 */

// ===== QUERY HOOKS =====

/**
 * Hook to get the current authenticated user
 */
export const useCurrentUser = () => {
  const currentUser = useQuery(apiEndpoints.users.getCurrentUser, {});
  
  return {
    data: currentUser as User | undefined,
    isLoading: currentUser === undefined,
    error: null,
  };
};

/**
 * Hook to get users filtered by role
 */
export const useUsersByRole = (role?: UserRole) => {
  const usersByRole = useQuery(
    apiEndpoints.users.getUsersByRole,
    role ? { role } : "skip"
  );
  
  return {
    data: usersByRole as User[] | undefined,
    isLoading: role ? usersByRole === undefined : false,
    error: null,
  };
};

/**
 * Combined user data hook (maintains backward compatibility with useUsers)
 */
export const useUsers = (role?: UserRole) => {
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useCurrentUser();
  const { data: usersByRole, isLoading: isLoadingUsersByRole } = useUsersByRole(role);

  return {
    data: {
      currentUser,
      usersByRole,
    },
    isLoading: isLoadingCurrentUser,
    isLoadingUsersByRole,
  };
};

// ===== MUTATION HOOKS =====

/**
 * Hook for creating a new user
 */
export const useCreateUser = () => {
  const createUserMutation = useMutation(apiEndpoints.users.createUser);
  
  const createUser = async (input: CreateUserInput): Promise<User | null> => {
    try {
      const payload = createUserPayload(input);
      const result = await createUserMutation(payload);
      return result as User;
    } catch (error) {
      console.error('Create user error:', error);
      return null;
    }
  };

  return {
    createUser,
    isLoading: false, // TODO: Track mutation loading state
  };
};

/**
 * Hook for updating user profile
 */
export const useUpdateUser = () => {
  const updateUserMutation = useMutation(apiEndpoints.users.updateUser);
  
  const updateUser = async (updates: UpdateUserInput): Promise<User | null> => {
    try {
      const result = await updateUserMutation(updates);
      return result as User;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  };

  return {
    updateUser,
    isLoading: false, // TODO: Track mutation loading state
  };
};

/**
 * Hook for updating user role (admin only)
 */
export const useUpdateUserRole = () => {
  const updateRoleMutation = useMutation(apiEndpoints.users.updateRole);
  
  const updateUserRole = async (
    userId: ConvexId<'users'>,
    role: UserRole
  ): Promise<User | null> => {
    try {
      const result = await updateRoleMutation({ userId, role });
      return result as User;
    } catch (error) {
      console.error('Update user role error:', error);
      return null;
    }
  };

  return {
    updateUserRole,
    isLoading: false, // TODO: Track mutation loading state
  };
};

/**
 * Combined mutations hook (maintains backward compatibility)
 */
export const useUserMutations = () => {
  const { createUser } = useCreateUser();
  const { updateUser } = useUpdateUser();
  const { updateUserRole } = useUpdateUserRole();

  return {
    mutations: {
      createUser,
      updateUser,
      updateUserRole,
    }
  };
};
