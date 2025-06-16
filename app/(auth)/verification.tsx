import { useSignUp } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { styles } from '../../assets/styles/verification'

export default function VerificationPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [code, setCode] = React.useState('')
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [error, setError] = React.useState('')

  const onVerifyPress = async () => {
    if (!isLoaded) return
    setIsVerifying(true)
    setError('')
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code })
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId })
        router.replace('/(tabs)') // or home
      } else {
        setError('Verification incomplete. Try again.')
      }
    } catch (err) {
      // Optionally parse for expired code etc.
      setError('Invalid or expired code. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  // Optional: handle "Resend Code" button
  const onResendCode = async () => {
    if (!isLoaded) return
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      Alert.alert('Verification code resent!')
    } catch (err) {
      Alert.alert('Error', 'Could not resend code.')
    }
  }

  return (
    <View style={styles.content}>
      {/* Organization Logos, title, etc. */}
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>Enter the verification code sent to your email</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter verification code"
          placeholderTextColor="#9CA3AF"
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={onVerifyPress}
          disabled={isVerifying || code.length < 1}
        >
          <Text style={styles.signUpButtonText}>{isVerifying ? 'Verifying...' : 'Verify Email'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.resendButton}
          onPress={onResendCode}
        >
          <Text style={styles.resendButtonText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}