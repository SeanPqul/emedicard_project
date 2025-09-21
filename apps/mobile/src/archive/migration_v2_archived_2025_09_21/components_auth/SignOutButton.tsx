import { useClerk } from '@clerk/clerk-expo'
import { Text, TouchableOpacity, Alert, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export const SignOutButton = () => {
  const { signOut } = useClerk()
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
              router.replace('/(auth)/sign-in')
            } catch (err) {
              console.error('Sign out error:', JSON.stringify(err, null, 2))
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            }
          },
        },
      ],
      { cancelable: true }
    )
  }
  
  return (
    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
      <View style={styles.signOutContent}>
        <Ionicons name="log-out-outline" size={24} color="#DC3545" />
        <View style={styles.signOutTextContainer}>
          <Text style={styles.signOutTitle}>Sign Out</Text>
          <Text style={styles.signOutDescription}>Sign out of your account</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ADB5BD" />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE6E6', // Light red border for warning
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  signOutTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  signOutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC3545', // Red color for destructive action
    marginBottom: 2,
  },
  signOutDescription: {
    fontSize: 14,
    color: '#6C757D',
  },
})
