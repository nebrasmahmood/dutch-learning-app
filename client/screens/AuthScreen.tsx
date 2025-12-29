import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Image, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as AppleAuthentication from "expo-apple-authentication";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type AuthProvider = "email" | "google" | "apple";

interface AuthService {
  signInWithEmail: (email: string, password: string) => Promise<{ email: string }>;
  signInWithGoogle: () => Promise<{ email: string }>;
  signInWithApple: (credential: AppleAuthentication.AppleAuthenticationCredential) => Promise<{ email: string }>;
}

const mockAuthService: AuthService = {
  signInWithEmail: async (email: string, _password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { email };
  },
  signInWithGoogle: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { email: "google.user@gmail.com" };
  },
  signInWithApple: async (credential) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { email: credential.email || "apple.user@icloud.com" };
  },
};

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const navigateToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  const handleEmailSignIn = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setLoadingProvider("email");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await mockAuthService.signInWithEmail(email, password);
      await storage.initUser(result.email);
      navigateToHome();
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLoadingProvider("google");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await mockAuthService.signInWithGoogle();
      await storage.initUser(result.email);
      navigateToHome();
    } catch (error) {
      Alert.alert("Error", "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setLoadingProvider("apple");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const result = await mockAuthService.signInWithApple(credential);
      await storage.initUser(result.email);
      navigateToHome();
    } catch (error: any) {
      if (error.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Error", "Apple Sign-In failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <LinearGradient
      colors={[AppColors.primary, AppColors.primaryDark]}
      style={styles.container}
    >
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <ThemedText type="h2" style={styles.title}>
            Welcome to NederLearn
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            Master Dutch vocabulary with fun quizzes
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.socialButtons}>
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={({ pressed }) => [
                styles.socialButton,
                styles.googleButton,
                pressed && styles.socialButtonPressed,
                loading && styles.socialButtonDisabled,
              ]}
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.googleIconContainer}>
                  <ThemedText style={styles.googleG}>G</ThemedText>
                </View>
                <ThemedText type="body" style={styles.socialButtonText}>
                  {loadingProvider === "google" ? "Signing in..." : "Continue with Google"}
                </ThemedText>
              </View>
            </Pressable>

            {Platform.OS === "ios" ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={BorderRadius.md}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            ) : (
              <Pressable
                onPress={handleAppleSignIn}
                disabled={loading}
                style={({ pressed }) => [
                  styles.socialButton,
                  styles.appleButtonWeb,
                  pressed && styles.socialButtonPressed,
                  loading && styles.socialButtonDisabled,
                ]}
              >
                <View style={styles.socialButtonContent}>
                  <Feather name="smartphone" size={20} color={AppColors.white} />
                  <ThemedText type="body" style={styles.appleButtonText}>
                    {loadingProvider === "apple" ? "Signing in..." : "Continue with Apple"}
                  </ThemedText>
                </View>
              </Pressable>
            )}
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText type="small" style={styles.dividerText}>or</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.label}>
              Email
            </ThemedText>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={AppColors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={AppColors.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.label}>
              Password
            </ThemedText>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={AppColors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={AppColors.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeButton}
              >
                <Feather 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={18} 
                  color={AppColors.gray} 
                />
              </Pressable>
            </View>
          </View>

          <Button
            onPress={handleEmailSignIn}
            disabled={loading}
            style={styles.button}
          >
            {loadingProvider === "email" ? "Signing in..." : "Continue with Email"}
          </Button>

          <ThemedText type="small" style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.lg,
    backgroundColor: AppColors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  title: {
    color: AppColors.white,
    textAlign: "center",
    marginBottom: Spacing.sm,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    fontSize: 15,
  },
  form: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  socialButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  socialButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  googleButton: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.grayLight,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: AppColors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  googleG: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
  },
  socialButtonText: {
    color: AppColors.textDark,
    fontWeight: "600",
    fontSize: 15,
  },
  appleButton: {
    height: 52,
    width: "100%",
  },
  appleButtonWeb: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  appleButtonText: {
    color: AppColors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.grayLight,
  },
  dividerText: {
    color: AppColors.gray,
    marginHorizontal: Spacing.lg,
    fontSize: 13,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    color: AppColors.textDark,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.grayLight,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: Spacing.inputHeight,
    fontSize: 16,
    color: AppColors.textDark,
  },
  eyeButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
  },
  button: {
    marginTop: Spacing.sm,
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.md,
    height: 52,
  },
  termsText: {
    color: AppColors.gray,
    textAlign: "center",
    marginTop: Spacing.lg,
    fontSize: 12,
    lineHeight: 18,
  },
});
