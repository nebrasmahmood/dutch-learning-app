import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { useLanguage } from "@/lib/LanguageContext";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLanguage();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigateToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  const handleStartLearning = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(
        t("auth.error"),
        t("auth.nameRequired")
      );
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert(
        t("auth.error"),
        t("auth.nameTooShort")
      );
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await storage.initUser(trimmedName);
      navigateToHome();
    } catch (error) {
      Alert.alert(t("auth.error"), t("auth.errorMessage"));
    } finally {
      setLoading(false);
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
            {t("auth.welcome")}
          </ThemedText>
          <ThemedText type="body" style={styles.subtitle}>
            {t("auth.subtitle")}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText type="small" style={[styles.label, isRTL && styles.rtlText]}>
              {t("auth.nameLabel")}
            </ThemedText>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={18} color={AppColors.gray} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, isRTL && styles.rtlInput]}
                placeholder={t("auth.namePlaceholder")}
                placeholderTextColor={AppColors.gray}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>
          </View>

          <Button
            onPress={handleStartLearning}
            disabled={loading}
            style={styles.button}
          >
            {loading ? t("auth.loading") : t("auth.startLearning")}
          </Button>

          <ThemedText type="small" style={styles.infoText}>
            {t("auth.localStorageInfo")}
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
    justifyContent: "center",
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
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  label: {
    color: AppColors.textDark,
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  rtlText: {
    textAlign: "right",
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
  rtlInput: {
    textAlign: "right",
  },
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.md,
    height: 52,
  },
  infoText: {
    color: AppColors.gray,
    textAlign: "center",
    marginTop: Spacing.lg,
    fontSize: 12,
    lineHeight: 18,
  },
});
