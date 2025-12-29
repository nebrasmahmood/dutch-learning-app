import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionCard } from "@/components/SectionCard";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserData, ProgressData } from "@/lib/storage";
import { SECTIONS } from "@/lib/mockData";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SectionState = "locked" | "active" | "completed";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  
  const xpPulse = useSharedValue(1);
  const avatarScale = useSharedValue(1);

  useEffect(() => {
    xpPulse.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 10 }),
        withSpring(1, { damping: 10 })
      ),
      -1,
      true
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const userData = await storage.getUser();
    const progressData = await storage.getProgress();
    setUser(userData);
    setProgress(progressData);
  };

  const getSectionState = (sectionId: string, index: number): SectionState => {
    if (!progress) return index === 0 ? "active" : "locked";
    
    if (progress.completedSections.includes(sectionId)) {
      return "completed";
    }
    
    if (index === 0) return "active";
    
    const prevSection = SECTIONS[index - 1];
    if (progress.completedSections.includes(prevSection.id)) {
      return "active";
    }
    
    return "locked";
  };

  const handleSectionPress = (sectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Quiz", { sectionId });
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    avatarScale.value = withSpring(0.9, {}, () => {
      avatarScale.value = withSpring(1);
    });
    navigation.navigate("Profile");
  };

  const handleFinalExamPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("FinalExam");
  };

  const xpProgress = user ? (user.totalXP % 100) / 100 : 0;
  const xpToNextLevel = user ? 100 - (user.totalXP % 100) : 100;
  const canTakeExam = progress && progress.completedSections.length >= SECTIONS.length;
  const completedCount = progress?.completedSections.length || 0;
  const progressPercent = Math.round((completedCount / SECTIONS.length) * 100);

  const xpStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpPulse.value }],
  }));

  const avatarAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const getInitials = (email?: string) => {
    if (!email) return "NL";
    return email.charAt(0).toUpperCase();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[AppColors.primary, AppColors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroHeader, { paddingTop: insets.top + Spacing.xl }]}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroTop}>
            <View style={styles.brandContainer}>
              <Image
                source={require("../../assets/images/icon.png")}
                style={styles.brandIcon}
                resizeMode="contain"
              />
              <ThemedText type="h3" style={styles.brandTitle}>
                NederLearn
              </ThemedText>
            </View>
            <Pressable onPress={handleProfilePress}>
              <Animated.View style={[styles.avatarContainer, avatarAnimStyle]}>
                <LinearGradient
                  colors={[AppColors.accent, "#F57C00"]}
                  style={styles.avatar}
                >
                  <ThemedText type="h4" style={styles.avatarText}>
                    {getInitials(user?.email)}
                  </ThemedText>
                </LinearGradient>
                <View style={styles.levelBadge}>
                  <ThemedText type="small" style={styles.levelBadgeText}>
                    {user?.level || 1}
                  </ThemedText>
                </View>
              </Animated.View>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Feather name="award" size={18} color={AppColors.accent} />
              </View>
              <View>
                <ThemedText type="small" style={styles.statLabel}>Level</ThemedText>
                <ThemedText type="h4" style={styles.statValue}>{user?.level || 1}</ThemedText>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <Animated.View style={[styles.statIconContainer, xpStyle]}>
                <Feather name="zap" size={18} color={AppColors.accent} />
              </Animated.View>
              <View>
                <ThemedText type="small" style={styles.statLabel}>Total XP</ThemedText>
                <ThemedText type="h4" style={styles.statValue}>{user?.totalXP || 0}</ThemedText>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Feather name="check-circle" size={18} color={AppColors.success} />
              </View>
              <View>
                <ThemedText type="small" style={styles.statLabel}>Progress</ThemedText>
                <ThemedText type="h4" style={styles.statValue}>{progressPercent}%</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.xpProgressContainer}>
            <View style={styles.xpProgressHeader}>
              <ThemedText type="small" style={styles.xpProgressLabel}>
                Progress to Level {(user?.level || 1) + 1}
              </ThemedText>
              <ThemedText type="small" style={styles.xpProgressValue}>
                {xpToNextLevel} XP needed
              </ThemedText>
            </View>
            <ProgressBar
              progress={xpProgress}
              height={8}
              fillColor={AppColors.accent}
              backgroundColor="rgba(255,255,255,0.2)"
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.mainContent}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Vocabulary Sections
            </ThemedText>
            <ThemedText type="small" style={styles.sectionSubtitle}>
              {completedCount} of {SECTIONS.length} sections completed
            </ThemedText>
          </View>
        </View>

        <View style={styles.grid}>
          {SECTIONS.map((section, index) => (
            <View key={section.id} style={styles.gridItem}>
              <SectionCard
                name={section.name}
                icon={section.icon}
                state={getSectionState(section.id, index)}
                onPress={() => handleSectionPress(section.id)}
              />
            </View>
          ))}
        </View>

        <View style={styles.examSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Final Exam
          </ThemedText>
          <ThemedText type="small" style={styles.sectionSubtitle}>
            Test your knowledge across all sections
          </ThemedText>
          
          <Pressable
            onPress={canTakeExam ? handleFinalExamPress : undefined}
            style={({ pressed }) => [
              styles.examCardWrapper,
              pressed && canTakeExam && { opacity: 0.9, transform: [{ scale: 0.98 }] }
            ]}
          >
            <LinearGradient
              colors={canTakeExam ? [AppColors.accent, "#F57C00"] : [AppColors.locked, "#9E9E9E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.examCard}
            >
              <View style={styles.examIconContainer}>
                <Feather
                  name={canTakeExam ? "award" : "lock"}
                  size={32}
                  color={AppColors.white}
                />
              </View>
              <View style={styles.examText}>
                <ThemedText type="h4" style={styles.examTitle}>
                  {canTakeExam ? "Ready for the Exam!" : "Complete All Sections First"}
                </ThemedText>
                <ThemedText type="small" style={styles.examSubtitle}>
                  {canTakeExam
                    ? "20 questions from all topics"
                    : `Complete ${SECTIONS.length - completedCount} more sections`}
                </ThemedText>
              </View>
              {canTakeExam ? (
                <View style={styles.examArrow}>
                  <Feather name="arrow-right" size={24} color={AppColors.white} />
                </View>
              ) : null}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flexGrow: 1,
  },
  heroHeader: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    paddingHorizontal: Spacing.xl,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  brandTitle: {
    color: AppColors.white,
    fontWeight: "700",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    color: AppColors.white,
    fontWeight: "700",
  },
  levelBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.full,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  levelBadgeText: {
    color: AppColors.primary,
    fontWeight: "700",
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
  statValue: {
    color: AppColors.white,
    fontWeight: "700",
  },
  xpProgressContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  xpProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  xpProgressLabel: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  xpProgressValue: {
    color: "rgba(255,255,255,0.7)",
  },
  mainContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: AppColors.textDark,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: AppColors.gray,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.sm,
    marginBottom: Spacing.xl,
  },
  gridItem: {
    width: "50%",
  },
  examSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  examCardWrapper: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    overflow: "hidden",
  },
  examIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  examText: {
    flex: 1,
  },
  examTitle: {
    color: AppColors.white,
    fontWeight: "700",
    marginBottom: 4,
  },
  examSubtitle: {
    color: "rgba(255,255,255,0.8)",
  },
  examArrow: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
