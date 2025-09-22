import { Stack } from 'expo-router';

export default function ApplicationLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal'
      }}
    >
      <Stack.Screen 
        name="[id]" 
        options={{
          title: 'Application Details',
          presentation: 'card'
        }}
      />
    </Stack>
  );
}
