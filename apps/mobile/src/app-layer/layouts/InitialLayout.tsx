import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { LoadingSpinner } from "@shared/components/feedback";

export default function InitialLayout() {
  const { isLoaded } = useAuth();

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