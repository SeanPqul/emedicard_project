import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import RoleBasedTabLayout from '../../src/features/navigation/ui/RoleBasedTabLayout';
import { LoadingSpinner } from '../../src/shared/components/feedback/LoadingSpinner';

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const userProfile = useQuery(api.users.getCurrentUser.getCurrentUserQuery);

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

  // Wait for user profile to load
  if (userProfile === undefined) {
    return (
      <LoadingSpinner
        visible={true}
        message="Loading tabs..."
        fullScreen
        type="pulse"
        icon="compass"
      />
    );
  }

  // Only applicants should access tab navigation
  // Inspectors should be redirected to their Stack-based navigation
  if (userProfile?.role === 'inspector') {
    return <Redirect href="/(screens)/(inspector)/dashboard" />;
  }

  // Render tab navigation for authenticated users
  return <RoleBasedTabLayout />;
}
