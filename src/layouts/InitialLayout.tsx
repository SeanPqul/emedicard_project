import { useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generateDisplayNameFromEmail, hasPlaceholderName } from "../utils/user-utils";
import { useDeepLink } from "../hooks/useDeepLink";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  
  // Initialize deep linking
  useDeepLink();
  
  // Convex queries and mutations
  const userProfile = useQuery(api.users.getCurrentUser);
  const createUser = useMutation(api.users.createUser);
  const updateUser = useMutation(api.users.updateUser);
  
  // Create user in Convex if signed in but not in database
  useEffect(() => {
    if (isSignedIn && user && userProfile === null) {
      // User is signed in with Clerk but doesn't exist in Convex
      const email = user.emailAddresses[0]?.emailAddress || '';
      const emailUsername = email.split('@')[0]; // Extract username part from email
      
      // Create a better default name from email if fullName is not available
      const defaultFullName = user.fullName || generateDisplayNameFromEmail(email);
      
      createUser({
        username: user.username || emailUsername || 'user',
        fullname: defaultFullName,
        email: email,
        image: user.imageUrl || '',
        clerkId: user.id,
      }).catch(console.error);
    }
  }, [isSignedIn, user, userProfile, createUser]);
  
  // Fix placeholder names for existing users
  useEffect(() => {
    if (isSignedIn && user && userProfile && hasPlaceholderName(userProfile)) {
      const email = user.emailAddresses[0]?.emailAddress || userProfile.email;
      if (email) {
        const betterName = user.fullName || generateDisplayNameFromEmail(email);
        const emailUsername = email.split('@')[0];
        
        updateUser({
          fullname: betterName,
          username: user.username || emailUsername || userProfile.username,
        }).catch(console.error);
      }
    }
  }, [isSignedIn, user, userProfile, updateUser]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)"
    
    // If not signed in and not in auth screen, redirect to sign-in
    if(!isSignedIn && !inAuthScreen) { router.replace("/(auth)/sign-in") }
      
    // If signed in and in auth screen, redirect to home
    else if (isSignedIn && inAuthScreen) { router.replace("/(tabs)") }
  
    }, [isLoaded, isSignedIn, router, segments])

    if (!isLoaded) {
      return (
        <LoadingSpinner 
          visible={true} 
          message="Loading..." 
          fullScreen 
          type="pulse" 
          icon="shield-checkmark" 
        />
      );
    }
    
    return (
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal'
        }} 
      />
    );
}
