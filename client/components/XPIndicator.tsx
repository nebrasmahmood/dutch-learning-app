import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";

interface XPIndicatorProps {
  amount: number;
  visible: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function XPIndicator({ amount, visible }: XPIndicatorProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 200 })
      );
      translateY.value = withSequence(
        withSpring(0),
        withTiming(-30, { duration: 800, easing: Easing.out(Easing.ease) })
      );
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!visible) return null;

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <Feather name="zap" size={20} color={AppColors.accent} />
      <ThemedText type="h4" style={styles.text}>
        +{amount} XP
      </ThemedText>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    color: AppColors.accent,
    marginLeft: Spacing.sm,
    fontWeight: "700",
  },
});
