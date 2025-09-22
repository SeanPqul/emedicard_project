import { Stack } from 'expo-router';

export default function PaymentLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        gestureEnabled: false, // Disable gesture for payment screens to prevent accidental dismissal
        presentation: 'card'
      }}
    >
      <Stack.Screen 
        name="success" 
        options={{
          title: 'Payment Success',
          gestureEnabled: false // Critical payment result screen
        }}
      />
      <Stack.Screen 
        name="failed" 
        options={{
          title: 'Payment Failed',
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="cancelled" 
        options={{
          title: 'Payment Cancelled',
          gestureEnabled: true // Allow dismissing cancelled payment
        }}
      />
    </Stack>
  );
}
