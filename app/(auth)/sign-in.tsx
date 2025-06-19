import React from 'react';
import {
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import GoogleSignInButton from '@/assets/svgs/google-ctn-logo.svg';
import { styles } from '@/assets/styles/auth-styles/sign-in';

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setError(''); setLoading(true);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Please complete additional verification steps.');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      const { createdSessionId, setActive: activate } = await startSSOFlow({ strategy: 'oauth_google' });
      if (activate && createdSessionId) {
        activate({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch {
      Alert.alert('Error', 'Google sign in failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Logos */}
      <View style={styles.orgLogosContainer}>
        <View style={styles.orgLogo}>
          <Image
            source={require('../../assets/images/cho-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.orgText}>CITY HEALTH OFFICE</Text>
        </View>
        <View style={styles.orgLogo}>
          <Image
            source={require('../../assets/images/davao-city-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.orgText}>DAVAO CITY</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>eMediCard</Text>
      <Text style={styles.subtitle}>
        A Mobile-Base Health Card{'\n'}Management System
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
            <Ionicons name={showPwd ? 'eye' : 'eye-off'} size={styles.eyeIcon.size} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.errorForgotContainer}>
          <View style={styles.errorContainer}>
            {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
          </View>
          <Link href="/">
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Link>
        </View>

        <TouchableOpacity
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={onSignIn}
          disabled={loading || !email || !password}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'Signing In…' : 'Log in'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or Login with</Text>

        <TouchableOpacity style={styles.googleButton} onPress={onGoogle}>
          <GoogleSignInButton
            width={styles.googleIcon.width}
            height={styles.googleIcon.height}
          />
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Dont have an account? </Text>
          <Link href="/(auth)/sign-up" replace>
            <Text style={styles.signUpLinkText}>Sign up</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
