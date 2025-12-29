import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { useLanguage, AppLanguage } from "@/lib/LanguageContext";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LanguageSelectionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { setLanguage, language } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage | null>(null);

  const logoScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  React.useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    contentOpacity.value = withDelay(300, withSpring(1));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleLanguageSelect = (lang: AppLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguage(lang);
  };

  const handleContinue = () => {
    if (!selectedLanguage) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLanguage(selectedLanguage);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Splash" }],
      })
    );
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

        <Animated.View style={[styles.textContainer, contentStyle]}>
          <ThemedText type="h2" style={styles.title}>
            Select Your Language
          </ThemedText>
          <ThemedText type="h2" style={styles.titleAr}>
            اختر لغتك
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            Choose the language for the app
          </ThemedText>
          <ThemedText type="body" style={styles.subtitleAr}>
            اختر لغة التطبيق
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.languageOptions, contentStyle]}>
          <Pressable
            style={[
              styles.languageCard,
              selectedLanguage === "en" && styles.languageCardSelected,
            ]}
            onPress={() => handleLanguageSelect("en")}
          >
            <View style={styles.languageContent}>
              <ThemedText type="h3" style={styles.languageLabel}>
                English
              </ThemedText>
              <ThemedText type="small" style={styles.languageNative}>
                English
              </ThemedText>
            </View>
            {selectedLanguage === "en" ? (
              <View style={styles.checkIcon}>
                <Feather name="check" size={20} color={AppColors.white} />
              </View>
            ) : null}
          </Pressable>

          <Pressable
            style={[
              styles.languageCard,
              selectedLanguage === "ar" && styles.languageCardSelected,
            ]}
            onPress={() => handleLanguageSelect("ar")}
          >
            <View style={styles.languageContent}>
              <ThemedText type="h3" style={styles.languageLabel}>
                العربية
              </ThemedText>
              <ThemedText type="small" style={styles.languageNative}>
                Arabic
              </ThemedText>
            </View>
            {selectedLanguage === "ar" ? (
              <View style={styles.checkIcon}>
                <Feather name="check" size={20} color={AppColors.white} />
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.buttonContainer,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
          contentStyle,
        ]}
      >
        <Button
          onPress={handleContinue}
          style={[
            styles.button,
            !selectedLanguage && styles.buttonDisabled,
          ]}
          disabled={!selectedLanguage}
        >
          {selectedLanguage === "ar" ? "متابعة" : "Continue"}
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
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
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
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    color: AppColors.white,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  titleAr: {
    color: AppColors.white,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  subtitleAr: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  languageOptions: {
    width: "100%",
    gap: Spacing.md,
  },
  languageCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageCardSelected: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderColor: AppColors.white,
  },
  languageContent: {
    flex: 1,
  },
  languageLabel: {
    color: AppColors.white,
    fontWeight: "700",
    marginBottom: 4,
  },
  languageNative: {
    color: "rgba(255,255,255,0.7)",
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: AppColors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    paddingHorizontal: Spacing["2xl"],
  },
  button: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
