import { useAuth} from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  const segments = useSegments();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)"
    
    // If not signed in and not in auth screen, redirect to sign-in
    if(!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)/sign-in")
    }
      
    // If signed in and in auth screen, redirect to home
    else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)")
    }
  
    }, [isLoaded, isSignedIn, router, segments])

    if (!isLoaded) return null;
    
    return <Stack screenOptions={{ headerShown: false }} />;
}
