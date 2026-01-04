import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  progress?: number;
  questionsCompleted?: number;
  totalQuestions?: number;
  onPress?: () => void;
  statusText?: string;
  isRTL?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SectionCard({ 
  name, 
  icon, 
  state, 
  progress = 0,
  questionsCompleted = 0,
  totalQuestions = 50,
  onPress,
  statusText: providedStatusText,
  isRTL = false,
}: SectionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (state !== "locked") {
      scale.value = withSpring(0.96, springConfig);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const getGradientColors = (): [string, string] => {
    switch (state) {
      case "locked":
        return [AppColors.locked, "#9E9E9E"];
      case "active":
        return [AppColors.primary, AppColors.primaryDark];
      case "completed":
        return [AppColors.success, "#2E7D32"];
    }
  };

  const getIconName = (): keyof typeof Feather.glyphMap => {
    if (state === "locked") return "lock";
    return icon as keyof typeof Feather.glyphMap;
  };

  const getStatusText = () => {
    return providedStatusText || "";
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.cardWrapper, animatedStyle]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topSection}>
          <View style={styles.iconContainer}>
            <Feather name={getIconName()} size={28} color={AppColors.white} />
          </View>
          {state === "completed" ? (
            <View style={styles.completedBadge}>
              <Feather name="check-circle" size={20} color={AppColors.white} />
            </View>
          ) : null}
        </View>

        <View style={styles.bottomSection}>
          <ThemedText type="h4" style={[styles.name, isRTL && styles.rtlText]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
            {name}
          </ThemedText>
          <ThemedText type="small" style={[styles.statusText, isRTL && styles.rtlText]}>
            {getStatusText()}
          </ThemedText>
          
          {state !== "locked" ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${state === "completed" ? 100 : progress * 100}%` }
                  ]} 
                />
              </View>
              <ThemedText type="small" style={styles.progressText}>
                {state === "completed" ? `${totalQuestions}/${totalQuestions}` : `${questionsCompleted}/${totalQuestions}`}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: Spacing.sm,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    flex: 1,
    minHeight: 140,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  bottomSection: {
    marginTop: Spacing.md,
  },
  name: {
    color: AppColors.white,
    fontWeight: "700",
    marginBottom: 2,
  },
  statusText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: BorderRadius.full,
  },
  progressText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
