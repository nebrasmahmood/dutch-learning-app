import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from "react-native-reanimated";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { getSectionById, SECTIONS } from "@/lib/mockData";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "SectionComplete">;

export default function SectionCompleteScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { sectionId, correctAnswers, totalQuestions, xpGained } = route.params;

  const trophyScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    trophyScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    contentOpacity.value = withDelay(300, withSpring(1));
    buttonOpacity.value = withDelay(600, withSpring(1));
  }, []);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const section = getSectionById(sectionId);
  const currentIndex = SECTIONS.findIndex((s) => s.id === sectionId);
  const nextSection = currentIndex < SECTIONS.length - 1 ? SECTIONS[currentIndex + 1] : null;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  const handleNextSection = () => {
    if (nextSection) {
      navigation.replace("Quiz", { sectionId: nextSection.id });
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    }
  };

  const handleBackToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.trophyContainer, trophyStyle]}>
          <Feather name="award" size={80} color={AppColors.accent} />
        </Animated.View>

        <Animated.View style={[styles.textContainer, contentStyle]}>
          <ThemedText type="h2" style={styles.title}>
            Section Complete!
          </ThemedText>
          <ThemedText type="body" style={styles.sectionName}>
            {section?.name || "Section"}
          </ThemedText>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText type="h1" style={styles.statValue}>
                {scorePercentage}%
              </ThemedText>
              <ThemedText type="small" style={styles.statLabel}>
                Score
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText type="h1" style={styles.statValue}>
                {correctAnswers}/{totalQuestions}
              </ThemedText>
              <ThemedText type="small" style={styles.statLabel}>
                Correct
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.xpContainer}>
                <Feather name="zap" size={24} color={AppColors.accent} />
                <ThemedText type="h1" style={[styles.statValue, styles.xpValue]}>
                  {xpGained}
                </ThemedText>
              </View>
              <ThemedText type="small" style={styles.statLabel}>
                XP Earned
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        <Button onPress={handleNextSection} style={styles.primaryButton}>
          {nextSection ? `Next: ${nextSection.name}` : "Back to Home"}
        </Button>
        {nextSection ? (
          <Button onPress={handleBackToHome} style={styles.secondaryButton}>
            Back to Home
          </Button>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: Spacing["2xl"],
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  trophyContainer: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius["2xl"],
    backgroundColor: AppColors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    color: AppColors.success,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  sectionName: {
    color: AppColors.gray,
    marginBottom: Spacing["3xl"],
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  statValue: {
    color: AppColors.primary,
  },
  statLabel: {
    color: AppColors.gray,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: AppColors.grayLight,
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpValue: {
    color: AppColors.accent,
    marginLeft: Spacing.xs,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.md,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: AppColors.primary,
    borderRadius: BorderRadius.md,
  },
});
