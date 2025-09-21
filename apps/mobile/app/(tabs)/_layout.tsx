import { useUsers } from '@/src/hooks/useUsers';
import { Redirect } from 'expo-router';
import RoleBasedTabLayout from '@/src/core/navigation/components/RoleBasedTabLayout';
import { LoadingSpinner } from '@/src/shared/components';

export default function TabLayout() {
  const { data: { currentUser }, isLoading } = useUsers();
  
  // Wait for user data to load before making routing decisions
  if (isLoading || !currentUser) {
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
  if (currentUser.role === 'inspector') {
    return <Redirect href="/(screens)/(inspector)/inspector-dashboard" />;
  }
  
  return <RoleBasedTabLayout />;
}
