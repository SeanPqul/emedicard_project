import { styles } from "@/assets/styles/auth-styles/sign-in";
import GoogleSignInButton from "@/assets/svgs/google-ctn-logo.svg";
import { moderateScale } from "@/src/utils/scaling-utils";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError("Please complete additional verification steps.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      const { createdSessionId, setActive: activate } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (activate && createdSessionId) {
        activate({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch {
      Alert.alert("Error", "Google sign in failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logos */}
      <View style={styles.orgLogosContainer}>
        <View style={styles.orgLogo}>
          <Image
            source={require("../../assets/images/cho-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.orgText}>CITY HEALTH OFFICE</Text>
        </View>
        <View style={styles.orgLogo}>
          <Image
            source={require("../../assets/images/davao-city-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.orgText}>DAVAO CITY</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>eMediCard</Text>
      <Text style={styles.subtitle}>
        A Mobile-Base Health Card{"\n"}Management System
      </Text>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.input}>
          <Ionicons
            name="mail-outline"
            size={moderateScale(20)}
            color="#9CA3AF"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Enter email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError("");
            }}
          />
        </View>

        <View style={styles.input}>
          <Ionicons
            name="lock-closed-outline"
            size={moderateScale(20)}
            color="#9CA3AF"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (error) setError("");
            }}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPwd((v) => !v)}
          >
            <Ionicons
              name={showPwd ? "eye" : "eye-off"}
              size={23}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.errorForgotContainer}>
          <View style={styles.errorContainer}>
            {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
          </View>
          <Link href="/(auth)/reset-password" replace>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Link>
        </View>

        <TouchableOpacity
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={onSignIn}
          disabled={loading || !email || !password}
        >
          <Text style={styles.signInButtonText}>
            {loading ? "Signing In…" : "Log in"}
          </Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or Login with</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={onGoogle}>
          <GoogleSignInButton width={wp("50%")} height={hp("6%")} />
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Dont have an account? </Text>
          <Link href="/(auth)/sign-up" replace>
            <Text style={styles.signUpLinkText}>Sign up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
