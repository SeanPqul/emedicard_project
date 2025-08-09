import { useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generateDisplayNameFromEmail, hasPlaceholderName } from "../utils/user-utils";
import { useDeepLink } from "../hooks/useDeepLink";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useRoleBasedNavigation } from "../hooks/useRoleBasedNavigation";

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
  
  // Role-based navigation hook
  const { permissions, canAccessScreen } = useRoleBasedNavigation(userProfile?.role);
  
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

  // Role-based navigation and access control
  useEffect(() => {
    if (!isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)";
    const currentScreen = segments[1]; // Current tab/screen name
    
    // If not signed in and not in auth screen, redirect to sign-in
    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)/sign-in");
      return;
    }
      
    // If signed in and in auth screen, redirect to role-based default route
    if (isSignedIn && inAuthScreen && userProfile) {
      router.replace(permissions.defaultRoute);
      return;
    }

    // If signed in but user profile is not loaded yet, wait
    if (isSignedIn && !inAuthScreen && userProfile === null) {
      return; // Wait for user profile to load
    }

    // Check access control for current screen
    if (isSignedIn && !inAuthScreen && userProfile && currentScreen) {
      if (!canAccessScreen(currentScreen)) {
        // Redirect to role-appropriate default route if access denied
        router.replace(permissions.defaultRoute);
        return;
      }
    }
  }, [isLoaded, isSignedIn, router, segments, userProfile, permissions.defaultRoute, canAccessScreen]);

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
