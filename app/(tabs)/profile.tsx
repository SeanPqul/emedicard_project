import { View, Text } from 'react-native'
import React from 'react'
import { SignOutButton } from '@/src/components/SignOutButton'


export default function Profile() {
  return (
    <View>
      <Text>profile screen</Text>
      <SignOutButton />
    </View>
  )
}