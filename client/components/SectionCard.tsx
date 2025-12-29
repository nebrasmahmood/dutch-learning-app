import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { AppColors, BorderRadius, Spacing } from "@/constants/theme";

type SectionState = "locked" | "active" | "completed";

interface SectionCardProps {
  name: string;
  icon: string;
  state: SectionState;
  onPress?: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SectionCard({ name, icon, state, onPress }: SectionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (state !== "locked") {
      scale.value = withSpring(0.95, springConfig);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const getBackgroundColor = () => {
    switch (state) {
      case "locked":
        return AppColors.locked;
      case "active":
        return AppColors.primary;
      case "completed":
        return AppColors.success;
    }
  };

  const getIconName = (): keyof typeof Feather.glyphMap => {
    if (state === "locked") return "lock";
    if (state === "completed") return "star";
    return icon as keyof typeof Feather.glyphMap;
  };

  return (
    <AnimatedPressable
      onPress={state === "locked" ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: getBackgroundColor() },
        animatedStyle,
      ]}
    >
      <View style={styles.iconContainer}>
        <Feather name={getIconName()} size={32} color={AppColors.white} />
      </View>
      <ThemedText
        type="body"
        style={[styles.name, { color: AppColors.white }]}
      >
        {name}
      </ThemedText>
      {state === "completed" ? (
        <View style={styles.completedBadge}>
          <Feather name="check" size={14} color={AppColors.white} />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    margin: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  name: {
    fontWeight: "600",
    textAlign: "center",
  },
  completedBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: BorderRadius.full,
    padding: 4,
  },
});
