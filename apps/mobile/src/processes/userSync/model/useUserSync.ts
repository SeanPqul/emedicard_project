import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useUsers } from '@features/profile';
import { generateDisplayNameFromEmail, hasPlaceholderName } from '@shared/utils/user-utils';

/**
 * Syncs Clerk user data with Convex database
 * 
 * PRIMARY: Clerk webhook creates users immediately on signup (backend/convex/http.ts)
 * FALLBACK: This hook ensures user exists if webhook failed or was missed
 * 
 * Additional responsibilities:
 * - Creates user in Convex if webhook creation failed
 * - Updates placeholder names for existing users with better names from Clerk
 */
export function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { data: { currentUser: userProfile }, mutations: { createUser, updateUser } } = useUsers();
  
  // Create user in Convex if signed in but not in database
  useEffect(() => {
    if (isSignedIn && user && userProfile === null) {
      const email = user.emailAddresses[0]?.emailAddress || '';
      const emailUsername = email.split('@')[0];
      const defaultFullName = user.fullName || generateDisplayNameFromEmail(email);
      
      createUser({
        clerkId: user.id,
        email: email,
        firstName: user.firstName || generateDisplayNameFromEmail(email).split(' ')[0] || 'User',
        lastName: user.lastName || generateDisplayNameFromEmail(email).split(' ')[1] || '',
        username: user.username || emailUsername || 'user',
        image: user.imageUrl || '',
      }).catch(console.error);
    }
  }, [isSignedIn, user, userProfile, createUser]);
  
  // Fix placeholder names for existing users
  useEffect(() => {
    if (isSignedIn && user && userProfile && hasPlaceholderName(userProfile.fullname)) {
      const email = user.emailAddresses[0]?.emailAddress || userProfile.email;
      if (email) {
        const betterName = user.fullName || generateDisplayNameFromEmail(email);
        const [firstName, lastName] = betterName.split(' ');
        
        updateUser({
          firstName: firstName || betterName,
          lastName: lastName || '',
        }).catch(console.error);
      }
    }
  }, [isSignedIn, user, userProfile, updateUser]);
}
