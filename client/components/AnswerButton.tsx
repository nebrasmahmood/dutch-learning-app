import React, { useEffect } from "react";
import { StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  WithSpringConfig,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { AppColors, BorderRadius, Spacing } from "@/constants/theme";

type AnswerState = "default" | "correct" | "incorrect" | "disabled";

interface AnswerButtonProps {
  text: string;
  state: AnswerState;
  onPress?: () => void;
  showIcon?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnswerButton({
  text,
  state,
  onPress,
  showIcon = true,
}: AnswerButtonProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (state === "incorrect") {
      translateX.value = withSequence(
        withSpring(-10, { damping: 2, stiffness: 400 }),
        withSpring(10, { damping: 2, stiffness: 400 }),
        withSpring(-5, { damping: 2, stiffness: 400 }),
        withSpring(5, { damping: 2, stiffness: 400 }),
        withSpring(0, { damping: 10, stiffness: 400 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (state === "correct") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  const handlePressIn = () => {
    if (state === "default") {
      scale.value = withSpring(0.98, springConfig);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const getBackgroundColor = () => {
    switch (state) {
      case "correct":
        return AppColors.success;
      case "incorrect":
        return AppColors.error;
      case "disabled":
        return AppColors.grayLight;
      default:
        return AppColors.white;
    }
  };

  const getTextColor = () => {
    switch (state) {
      case "correct":
      case "incorrect":
        return AppColors.white;
      case "disabled":
        return AppColors.gray;
      default:
        return AppColors.textDark;
    }
  };

  const getBorderColor = () => {
    switch (state) {
      case "correct":
        return AppColors.success;
      case "incorrect":
        return AppColors.error;
      default:
        return AppColors.grayLight;
    }
  };

  return (
    <AnimatedPressable
      onPress={state === "default" ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={state !== "default"}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="body"
        style={[styles.text, { color: getTextColor() }]}
      >
        {text}
      </ThemedText>
      {showIcon && state === "correct" ? (
        <Feather name="check" size={24} color={AppColors.white} />
      ) : null}
      {showIcon && state === "incorrect" ? (
        <Feather name="x" size={24} color={AppColors.white} />
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  text: {
    fontWeight: "600",
    flex: 1,
  },
});
