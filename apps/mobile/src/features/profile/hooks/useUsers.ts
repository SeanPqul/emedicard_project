import { useMutation, useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

export function useUsers(role?: "applicant" | "inspector" | "admin") {
  const currentUser = useQuery(api.users.getCurrentUser.getCurrentUserQuery, {});
  const usersByRole = useQuery(
    api.users.getUsersByRole.getUsersByRoleQuery,
    role ? { role } : "skip"
  );

  const createUserMutation = useMutation(api.users.createUser.createUserMutation);
  const updateUserMutation = useMutation(api.users.updateUser.updateUserMutation);
  const updateRoleMutation = useMutation(api.users.updateRole.updateRoleMutation);

  const createUser = async (input: {
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    image: string;
    role?: "applicant" | "inspector";
    phoneNumber?: string;
    address?: string;
    gender?: string;
    birthDate?: string;
  }) => {
    const payload: Parameters<typeof createUserMutation>[0] = {
      clerkId: input.clerkId,
      email: input.email,
      username: input.username,
      fullname: `${input.firstName} ${input.lastName}`,
      image: input.image,
    };

    if (input.role !== undefined) {
      payload.role = input.role;
    }
    if (input.phoneNumber !== undefined) {
      payload.phoneNumber = input.phoneNumber;
    }
    if (input.gender !== undefined) {
      payload.gender = input.gender;
    }
    if (input.birthDate !== undefined) {
      payload.birthDate = input.birthDate;
    }

    return createUserMutation(payload);
  };

  const updateUser = async (updates: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    profileImage?: string;
    metadata?: Record<string, any>;
  }) => {
    return updateUserMutation(updates);
  };

  const updateUserRole = async (
    userId: Id<'users'>,
    role: "admin" | "applicant" | "inspector"
  ) => {
    return updateRoleMutation({ userId, role });
  };

  return {
    data: {
      currentUser,
      usersByRole,
    },
    isLoading: currentUser === undefined,
    isLoadingUsersByRole: role ? usersByRole === undefined : false,
    
    mutations: {
      createUser,
      updateUser,
      updateUserRole,
    }
  };
}