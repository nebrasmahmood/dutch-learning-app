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
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "Result">;

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { score, totalQuestions, isExam } = route.params;

  const iconScale = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const percentage = Math.round((score / totalQuestions) * 100);

  useEffect(() => {
    if (percentage >= 60) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    iconScale.value = withSequence(
      withSpring(1.3, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );
    scoreOpacity.value = withDelay(200, withSpring(1));
    contentOpacity.value = withDelay(400, withSpring(1));
    buttonOpacity.value = withDelay(600, withSpring(1));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: scoreOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const getFeedback = () => {
    if (percentage >= 80) {
      return {
        title: "Excellent!",
        subtitle: "You've mastered this material!",
        icon: "award" as const,
        color: AppColors.success,
      };
    } else if (percentage >= 60) {
      return {
        title: "Good Job!",
        subtitle: "You're making great progress!",
        icon: "thumbs-up" as const,
        color: AppColors.primary,
      };
    } else {
      return {
        title: "Keep Practicing!",
        subtitle: "Review and try again for better results.",
        icon: "book-open" as const,
        color: AppColors.accent,
      };
    }
  };

  const feedback = getFeedback();
  const xpEarned = score * (isExam ? 20 : 10);

  const handleBackToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  };

  const handleTryAgain = () => {
    if (isExam) {
      navigation.replace("FinalExam");
    } else {
      navigation.goBack();
    }
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
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: feedback.color },
            iconStyle,
          ]}
        >
          <Feather name={feedback.icon} size={64} color={AppColors.white} />
        </Animated.View>

        <Animated.View style={[styles.scoreContainer, scoreStyle]}>
          <ThemedText type="h1" style={[styles.percentage, { color: feedback.color }]}>
            {percentage}%
          </ThemedText>
          <ThemedText type="body" style={styles.scoreText}>
            {score} of {totalQuestions} correct
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.feedbackContainer, contentStyle]}>
          <ThemedText type="h2" style={styles.feedbackTitle}>
            {feedback.title}
          </ThemedText>
          <ThemedText type="body" style={styles.feedbackSubtitle}>
            {feedback.subtitle}
          </ThemedText>

          <View style={styles.xpBadge}>
            <Feather name="zap" size={24} color={AppColors.accent} />
            <ThemedText type="h3" style={styles.xpText}>
              +{xpEarned} XP
            </ThemedText>
          </View>

          {isExam && percentage >= 60 ? (
            <View style={styles.examPassedBadge}>
              <Feather name="check-circle" size={20} color={AppColors.success} />
              <ThemedText type="body" style={styles.examPassedText}>
                Exam Passed!
              </ThemedText>
            </View>
          ) : null}
        </Animated.View>
      </View>

      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        {percentage < 80 ? (
          <Button onPress={handleTryAgain} style={styles.retryButton}>
            Try Again
          </Button>
        ) : null}
        <Button onPress={handleBackToHome} style={styles.homeButton}>
          Back to Home
        </Button>
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
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius["2xl"],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  percentage: {
    fontSize: 72,
    fontWeight: "800",
  },
  scoreText: {
    color: AppColors.gray,
    marginTop: Spacing.sm,
  },
  feedbackContainer: {
    alignItems: "center",
  },
  feedbackTitle: {
    color: AppColors.textDark,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  feedbackSubtitle: {
    color: AppColors.gray,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  xpText: {
    color: AppColors.accent,
    marginLeft: Spacing.sm,
    fontWeight: "700",
  },
  examPassedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  examPassedText: {
    color: AppColors.success,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  retryButton: {
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.md,
  },
  homeButton: {
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.md,
  },
});
