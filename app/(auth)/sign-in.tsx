import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter, Stack } from 'expo-router'
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Alert,
  Image
} from 'react-native'
import React from 'react'

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    setIsLoading(true)
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
        Alert.alert('Error', 'Please complete additional verification steps.')
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
      Alert.alert('Sign In Failed', 'Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    // Google OAuth with Clerk
    try {
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/',
        redirectUrlComplete: '/'
      })
    } catch (err) {
      console.error('Google sign in error:', err)
      Alert.alert('Error', 'Google sign in failed. Please try again.')
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#10B981" barStyle="light-content" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Organization Logos */}
        <View style={styles.orgLogosContainer}>
          <View style={styles.orgLogo}>
            <View style={styles.healthLogo}>
              <Image 
                source={require('../../assets/images/cho-logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.orgText}>CITY HEALTH OFFICE</Text>
          </View>
          
          <View style={styles.orgLogo}>
            <View style={styles.cityLogo}>
              <Image 
                source={require('../../assets/images/davao-city-logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.orgText}>DAVAO CITY</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>eMediCard</Text>
        <Text style={styles.subtitle}>A Mobile-Base Health Card{'\n'}Management System</Text>

        {/* Sign In Form */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#9CA3AF"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={true}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
            style={[styles.signInButton, isLoading && styles.buttonDisabled]} 
            onPress={onSignInPress}
            disabled={isLoading || !emailAddress || !password}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing In...' : 'Log in'}
            </Text>
          </TouchableOpacity>

          {/* Or Login With */}
          <Text style={styles.orText}>or Login with</Text>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <View style={styles.googleContent}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Google</Text>
            </View>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Dont have an account?</Text>
            <Link href="/sign-up" style={styles.signUpLink}>
              <Text style={styles.signUpLinkText}>Sign up</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  orgLogosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  orgLogo: {
    alignItems: 'center',
  },
  healthLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 8,
  },
  cityLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 8,
  },
  healthLogoText: {
    fontSize: 32,
  },
  cityLogoText: {
    fontSize: 32,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  orgText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  signInButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginRight: 8,
    backgroundColor: 'white',
    width: 28,
    height: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 14,
  },
  googleText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signUpLink: {
    // Link styling handled by Link component
  },
  signUpLinkText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
})