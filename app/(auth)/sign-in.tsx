import { useSignIn, useSSO } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert,
  Image
} from 'react-native'
import { styles } from '../../assets/styles/sign-in'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import GoogleSignInButton from '../../assets/svgs/google-ctn-logo.svg'

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startSSOFlow } = useSSO()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Clear any previous errors
    setErrorMessage('')
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
        setErrorMessage('Please complete additional verification steps.')
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
      // Generic error message for security
      setErrorMessage('Invalid email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ 
        strategy: "oauth_google" 
      })
      
      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId })
        router.replace("/(tabs)")
      }
    } catch (error) {
      console.error("OAuth error:", error)
      Alert.alert('Error', 'Google sign in failed. Please try again.')
    }
  }

  return (
    <>
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
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Error Message and Forgot Password Row */}
          <View style={styles.errorForgotContainer}>
            <View style={styles.errorContainer}>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
            </View>
            <Link href="/" style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Link>
          </View>

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

          {/* Google Sign In with Complete SVG */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <GoogleSignInButton width={200} height={50}/>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Dont have an account? </Text>
            <Link href="/sign-up" style={styles.signUpLink}>
              <Text style={styles.signUpLinkText}>Sign up</Text>
            </Link>
          </View>
        </View>
      </View>
    </>
  )
}