import { useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  
  // Convex queries and mutations
  const userProfile = useQuery(api.users.getCurrentUser);
  const createUser = useMutation(api.users.createUser);
  
  // Create user in Convex if signed in but not in database
  useEffect(() => {
    if (isSignedIn && user && userProfile === null) {
      // User is signed in with Clerk but doesn't exist in Convex
      createUser({
        username: user.username || user.emailAddresses[0]?.emailAddress || 'user',
        fullname: user.fullName || 'Full Name',
        email: user.emailAddresses[0]?.emailAddress || '',
        image: user.imageUrl || '',
        clerkId: user.id,
      }).catch(console.error);
    }
  }, [isSignedIn, user, userProfile, createUser]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)"
    
    // If not signed in and not in auth screen, redirect to sign-in
    if(!isSignedIn && !inAuthScreen) { router.replace("/(auth)/sign-in") }
      
    // If signed in and in auth screen, redirect to home
    else if (isSignedIn && inAuthScreen) { router.replace("/(tabs)") }
  
    }, [isLoaded, isSignedIn, router, segments])

    if (!isLoaded) return null;
    
    return <Stack screenOptions={{ headerShown: false }} />;
}
