import { Stack } from 'expo-router'

export default function ScreensLayout() {
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
        name="(shared)/upload-documents" 
        options={{
          title: 'Upload Documents',
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="(shared)/payment" 
        options={{
          title: 'Payment',
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="(shared)/orientation" 
        options={{
          title: 'Orientation',
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="(shared)/health-cards" 
        options={{
          title: 'Health Cards',
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="(shared)/document-requirements" 
        options={{
          title: 'Document Requirements',
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="(shared)/activity" 
        options={{
          title: 'Activity',
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="(shared)/qr-code" 
        options={{
          title: 'QR Code',
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="(shared)/qr-scanner" 
        options={{
          title: 'QR Scanner',
          presentation: 'card'
        }}
      />
    </Stack>
  )
}
