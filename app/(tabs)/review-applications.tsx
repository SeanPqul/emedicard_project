import React from 'react';
import { useRouter } from 'expo-router';

// Redirect to camelCase version
export default function ReviewApplicationsRedirect() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.replace('/(tabs)/reviewApplications');
  }, []);
  
  return null;
}
