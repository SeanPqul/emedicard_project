import React from 'react';
import { useRouter } from 'expo-router';

// Redirect to camelCase version
export default function InspectorDashboardRedirect() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.replace('/(tabs)/inspectorDashboard');
  }, []);
  
  return null;
}
