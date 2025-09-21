import { Stack } from 'expo-router';
import { theme } from '@shared/styles/theme';

export default function InspectorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen 
        name="inspector-dashboard" 
        options={{ 
          title: 'Inspector Dashboard',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="review-applications" 
        options={{ 
          title: 'Review Applications',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="inspection-queue" 
        options={{ 
          title: 'Inspection Queue',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="scanner" 
        options={{ 
          title: 'QR Scanner',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}
