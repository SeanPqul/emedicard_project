import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from 'expo-router';
import RoleBasedTabLayout from '../../src/shared/navigation/RoleBasedTabLayout';
import { LoadingSpinner } from '../../src/shared/components';

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  
  // Check authentication
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
  
  // Render tab navigation for authenticated users
  return <RoleBasedTabLayout />;
}
