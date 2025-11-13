// src/app/hooks/useStoreUser.ts

import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useState } from "react";

export const useStoreUser = () => {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  
  // We can give our state a proper type now
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  // This mutation now correctly takes no arguments
  const storeUser = useMutation(api.users.index.getOrCreateUser);

  useEffect(() => {
    // If the user is not logged in, do nothing.
    if (!isAuthenticated) {
      return;
    }

    // This function will run once the user is loaded.
    const createUserInConvex = async () => {
      // We need to wait for the user object from Clerk to be loaded.
      if (user) {
        // =================================================================
        // == THIS IS THE FIX ==
        // We now call `storeUser` with NO arguments, because the backend
        // will get all the user info it needs from the auth token.
        // =================================================================
        const id = await storeUser();
        setUserId(id);
      }
    };

    createUserInConvex();

  }, [isAuthenticated, user, storeUser]); // Rerun when auth state or user object changes

  return userId;
};
