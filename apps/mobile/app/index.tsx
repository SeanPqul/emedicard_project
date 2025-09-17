import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from 'expo-router';
import { LoadingSpinner } from '../src/components/common';
import { useUsers } from '../src/hooks/useUsers';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: { currentUser }, isLoading } = useUsers();
  
  // Wait for BOTH Clerk and user data to be fully loaded
  if (!isLoaded || (isSignedIn && (isLoading || !currentUser))) {
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

  // If not signed in, redirect to auth
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  
  // Role-based routing - ensure currentUser exists before checking role
  if (currentUser && currentUser.role === 'inspector') {
    return <Redirect href="/(screens)/(inspector)/inspector-dashboard" />;
  }
  
  // Default to applicant dashboard - redirect to tabs group, not specific index
  return <Redirect href="/(tabs)" />;
}
