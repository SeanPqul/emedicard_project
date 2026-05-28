import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { useUsers } from '@/src/features/profile/hooks/useUsers'
import { LoadingSpinner } from '@/src/shared/components/feedback/LoadingSpinner'
import { useEffect } from 'react'

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const { data: { currentUser }, isLoading } = useUsers()
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || isLoading) return;

    if (isSignedIn && currentUser) {
      const status = currentUser.registrationStatus;
      const inAuthGroup = segments[0] === '(auth)';
      const currentRoute = segments[segments.length - 1];

      if (status === 'approved') {
        if (inAuthGroup) {
           router.replace('/(tabs)');
        }
      } else if (status === 'pending' || status === 'rejected') {
        if (currentRoute !== 'pending-approval') {
           router.replace('/(auth)/pending-approval');
        }
      } else {
        // Status is missing or something else (e.g. just signed up)
        // If they are just verifying email, they might not have metadata yet.
        // We should allow them to be in verification or upload-documents.
        
        const allowedRoutes = ['verification', 'upload-documents', 'sign-in', 'sign-up'];
        if (!currentRoute || !allowedRoutes.includes(currentRoute)) {
           router.replace('/(auth)/upload-documents');
        }
      }
    }
  }, [isLoaded, isLoading, isSignedIn, currentUser, segments, router]);

  if (!isLoaded || (isSignedIn && isLoading)) {
    return <LoadingSpinner visible={true} message="Checking account status..." fullScreen />
  }

  return <Stack screenOptions={{headerShown : false}}/>
}