import { useUsers } from '@shared/hooks/useUsers';
import { Redirect, Stack } from 'expo-router';
import { LoadingSpinner } from '@/src/shared/components';

export default function InspectorScreensLayout() {
  const { data: { currentUser }, isLoading } = useUsers();
  
  // Wait for user data to load
  if (isLoading || !currentUser) {
    return (
      <LoadingSpinner 
        visible={true} 
        message="Loading inspector area..." 
        fullScreen 
        type="pulse" 
        icon="shield"
      />
    );
  }
  
  // Check if user has inspector role
  if (currentUser.role !== 'inspector') {
    // Redirect non-inspectors to tabs
    return <Redirect href="/(tabs)" />;
  }
  
  // Render inspector screens
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
