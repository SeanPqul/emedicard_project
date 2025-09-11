import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function InitialLayout() {
  const { isLoaded } = useAuth();

  // Show loading only while Clerk is initializing
  // Navigation logic is now handled in app/index.tsx
  // User setup logic is now handled in ClerkAndConvexProvider
  if (!isLoaded) {
    return (
      <LoadingSpinner 
        visible={true} 
        message="Initializing..." 
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