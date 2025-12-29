import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  
  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    titleOpacity.value = withDelay(200, withSpring(1));
    subtitleOpacity.value = withDelay(400, withSpring(1));
    buttonOpacity.value = withDelay(600, withSpring(1));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleGetStarted = async () => {
    const isAuth = await storage.isAuthenticated();
    if (isAuth) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    } else {
      navigation.navigate("Auth");
    }
  };

  return (
    <LinearGradient
      colors={[AppColors.primary, AppColors.primaryDark]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + Spacing["4xl"] }]}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.textContainer}>
          <Animated.View style={titleStyle}>
            <ThemedText type="h1" style={styles.title}>
              NederLearn
            </ThemedText>
          </Animated.View>

          <Animated.View style={subtitleStyle}>
            <ThemedText type="body" style={styles.subtitle}>
              Learn Dutch step by step
            </ThemedText>
          </Animated.View>
        </View>
      </View>

      <Animated.View
        style={[
          styles.buttonContainer,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
          buttonStyle,
        ]}
      >
        <Button
          onPress={handleGetStarted}
          style={styles.button}
        >
          Get Started
        </Button>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    backgroundColor: AppColors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    color: AppColors.white,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: Spacing["2xl"],
  },
  button: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.md,
  },
});
