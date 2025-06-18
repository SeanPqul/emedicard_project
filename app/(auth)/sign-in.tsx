import { useSignIn, useSSO } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { styles } from '@/assets/styles/auth-styles/sign-in'
import { ViewStyle, TextStyle, ImageStyle } from 'react-native'
import GoogleSignInButton from '@/assets/svgs/google-ctn-logo.svg'


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
        router.replace('/(tabs)')
      } 
      else {
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
    
    <View style={styles.container as ViewStyle}>
      {/* Organization Logos */}
      <View style={styles.orgLogosContainer as ViewStyle}>
        <View style={styles.orgLogo as ViewStyle}>
          <View style={styles.healthLogo as ViewStyle}>
            <Image 
              source={require('../../assets/images/cho-logo.png')} 
              style={styles.logoImage as ImageStyle}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.orgText as TextStyle}>CITY HEALTH OFFICE</Text>
        </View>
        
        <View style={styles.orgLogo as ViewStyle}>
          <View style={styles.cityLogo as ViewStyle}>
            <Image 
              source={require('../../assets/images/davao-city-logo.png')} 
              style={styles.logoImage as ImageStyle}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.orgText as TextStyle}>DAVAO CITY</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title as TextStyle}>eMediCard</Text>
      <Text style={styles.subtitle as TextStyle}>A Mobile-Base Health Card{'\n'}Management System</Text>

      {/* Sign In Form */}
      <View style={styles.formContainer as ViewStyle}>
        <TextInput
          style={styles.input as TextStyle}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#9CA3AF"
          onChangeText={(email) => {
            setEmailAddress(email);
            // Clear error when user starts typing
            if (errorMessage) setErrorMessage('');
          }}
          keyboardType="email-address"
        />
        
        <View style={styles.passwordContainer as ViewStyle}>
          <TextInput
            style={styles.passwordInput as TextStyle}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            onChangeText={(password) => {
              setPassword(password);
              // Clear error when user starts typing
              if (errorMessage) setErrorMessage('');
            }}
          />
          <TouchableOpacity
            style={styles.eyeIcon as ViewStyle}
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
        <View style={styles.errorForgotContainer as ViewStyle}>
          <View style={styles.errorContainer as ViewStyle}>
            {errorMessage ? (
              <Text style={styles.errorText as TextStyle}>{errorMessage}</Text>
            ) : null}
          </View>
          <Link href="/" style={styles.forgotPasswordLink as TextStyle}>
            <Text style={styles.forgotPasswordText as TextStyle}>Forgot password?</Text>
          </Link>
        </View>

        <TouchableOpacity 
          style={[styles.signInButton as ViewStyle, isLoading && styles.buttonDisabled as ViewStyle]} 
          onPress={onSignInPress}
          disabled={isLoading || !emailAddress || !password}
        >
          <Text style={styles.signInButtonText as TextStyle}>
            {isLoading ? 'Signing In...' : 'Log in'}
          </Text>
        </TouchableOpacity>

        {/* Or Login With */}
        <Text style={styles.orText as TextStyle}>or Login with</Text>

        {/* Google Sign In with Complete SVG */}
        <TouchableOpacity style={styles.googleButton as ViewStyle} onPress={handleGoogleSignIn}>
          <GoogleSignInButton width={200} height={50}/>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer as ViewStyle}>
          <Text style={styles.signUpText as TextStyle}>Dont have an account? </Text>
          <Link href="/(auth)/sign-up" replace>
            <Text style={styles.signUpLinkText as TextStyle}>Sign up</Text>
          </Link>
        </View>
      </View>
    </View>
  )
}