import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import GoogleSignInButton from '@/assets/svgs/google-ctn-logo.svg';
import { styles } from '@/assets/styles/auth-styles/sign-up';

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onSignUp = async () => {
    if (!isLoaded) return;
    setError(''); setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      router.replace({ pathname: '/(auth)/verification', params: { email } });
    } catch (err: any) {
      // your existing error parsing…
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: 'oauth_google' });
      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch {
      Alert.alert('Error', 'Google sign up failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logos */}
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
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>
        Register in app to manage{'\n'}your health card applications
      </Text>

      {/* Form */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={t => { setEmail(t); if (error) setError(''); }}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={t => { setPassword(t); if (error) setError(''); }}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPwd(v => !v)}>
            <Ionicons
              name={showPwd ? 'eye' : 'eye-off'}
              size={styles.eyeIcon.size}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.errorContainer}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Password must contain:</Text>
          <Text style={styles.requirementItem}>• At least 8 characters</Text>
          <Text style={styles.requirementItem}>• One uppercase letter (A-Z)</Text>
          <Text style={styles.requirementItem}>• One lowercase letter (a-z)</Text>
          <Text style={styles.requirementItem}>• One number (0-9)</Text>
        </View>

        <TouchableOpacity
          style={[styles.signUpButton, loading && styles.buttonDisabled]}
          onPress={onSignUp}
          disabled={loading || !email || !password}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? 'Signing Up…' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or Sign up with</Text>

        <TouchableOpacity style={styles.googleButton} onPress={onGoogle}>
          <GoogleSignInButton
            width={styles.googleIcon.width}
            height={styles.googleIcon.height}
          />
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" replace>
            <Text style={styles.signInLinkText}>Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}