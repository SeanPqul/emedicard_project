import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from 'expo-router';
import { LoadingSpinner } from '../../src/shared/components';

export default function ScreensLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  
  // Wait for auth state to load
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
  
  // Redirect to auth if not signed in
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  
  // Render screens with stack navigation
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
