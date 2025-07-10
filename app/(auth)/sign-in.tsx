import { styles } from "@/assets/styles/auth-styles/sign-in";
import GoogleSignInButton from "@/assets/svgs/google-ctn-logo.svg";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Alert, Image, Text, View } from "react-native";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import {
    CustomButton,
    CustomTextInput,
    Divider
} from "../../src/components";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const clearError = () => {
    if (error) setError("");
  };

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

  const onGoogleSignIn = async () => {
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

  const isFormValid = email && password;

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
        <CustomTextInput
          leftIcon="mail-outline"
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearError();
          }}
          containerStyle={styles.input}
        />

        <CustomTextInput
          leftIcon="lock-closed-outline"
          rightIcon={showPassword ? "eye" : "eye-off"}
          onRightIconPress={() => setShowPassword(!showPassword)}
          placeholder="Enter password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearError();
          }}
          containerStyle={styles.input}
        />

        <View style={styles.errorForgotContainer}>
          <View style={styles.errorContainer}>
            {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
          </View>
          <Link href="/(auth)/reset-password" replace>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Link>
        </View>

        <CustomButton
          title="Log in"
          loadingText="Signing In…"
          loading={loading}
          disabled={!isFormValid || loading}
          onPress={onSignIn}
          buttonStyle={styles.signInButton}
          textStyle={styles.signInButtonText}
        />

        <Divider text="or Login with" />

        <CustomButton
          variant="none"
          onPress={onGoogleSignIn}
          buttonStyle={styles.googleButton}
        >
          <GoogleSignInButton width={wp("50%")} height={hp("6%")} />
        </CustomButton>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
          <Link href="/(auth)/sign-up" replace>
            <Text style={styles.signUpLinkText}>Sign up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
