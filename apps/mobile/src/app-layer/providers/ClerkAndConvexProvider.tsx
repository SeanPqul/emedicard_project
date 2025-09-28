import { ClerkLoaded, ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useEffect } from "react";
import { useUsers } from "@entities/user";
import { generateDisplayNameFromEmail, hasPlaceholderName } from "@shared/utils/user-utils";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL as string
);

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

// Component to handle user setup logic
function UserSetupHandler() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  
  // Use custom hooks instead of direct Convex calls
  const { data: { currentUser: userProfile }, mutations: { createUser, updateUser } } = useUsers();
  
  // Create user in Convex if signed in but not in database
  useEffect(() => {
    if (isSignedIn && user && userProfile === null) {
      // User is signed in with Clerk but doesn't exist in Convex
      const email = user.emailAddresses[0]?.emailAddress || '';
      const emailUsername = email.split('@')[0]; // Extract username part from email
      
      // Create a better default name from email if fullName is not available
      const defaultFullName = user.fullName || generateDisplayNameFromEmail(email);
      
      console.log('Creating new user in Convex with applicant role:', {
        email,
        fullname: defaultFullName,
        clerkId: user.id
      });
      
      createUser({
        clerkId: user.id,
        email: email,
        firstName: user.firstName || generateDisplayNameFromEmail(email).split(' ')[0] || 'User',
        lastName: user.lastName || generateDisplayNameFromEmail(email).split(' ')[1] || '',
        username: user.username || emailUsername || 'user',
        image: user.imageUrl || '',
        // Note: role will default to "applicant" in the backend
      }).catch(console.error);
    }
  }, [isSignedIn, user, userProfile, createUser]);
  
  // Fix placeholder names for existing users
  useEffect(() => {
    if (isSignedIn && user && userProfile && hasPlaceholderName(userProfile.fullname)) {
      const email = user.emailAddresses[0]?.emailAddress || userProfile.email;
      if (email) {
        const betterName = user.fullName || generateDisplayNameFromEmail(email);
        const emailUsername = email.split('@')[0];
        
        const [firstName, lastName] = betterName.split(' ');
        updateUser({
          firstName: firstName || betterName,
          lastName: lastName || '',
        }).catch(console.error);
      }
    }
  }, [isSignedIn, user, userProfile, updateUser]);

  return null; // This component doesn't render anything
}

export default function ClerkAndConvexProvider({children}: {children: React.ReactNode}) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkLoaded>
          <UserSetupHandler />
          {children}
        </ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}