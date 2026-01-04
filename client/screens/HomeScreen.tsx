import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Image, Alert, Platform } from "react-native"; //nebras
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
import { useLanguage } from "@/lib/LanguageContext";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SectionState = "locked" | "active" | "completed";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { t, isRTL } = useLanguage();
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

  const UNLOCK_COST = 300;

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
    
    if (progress.unlockedSections?.includes(sectionId)) {
      return "active";
    }
    
    return "locked";
  };

  const handleSectionPress = (sectionId: string, index: number) => {
    const state = getSectionState(sectionId, index);
    
    if (state === "locked") {
      handleUnlockSection(sectionId);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Quiz", { sectionId });
  };

  const handleUnlockSection = async (sectionId: string) => {
    const userXP = user?.totalXP || 0;
    
    if (userXP < UNLOCK_COST) {
      if (Platform.OS === "web") {
        window.alert(`${t("section.notEnoughXP")}\n${t("section.needXP", { xp: UNLOCK_COST })}`);
      } else {
        Alert.alert(
          t("section.notEnoughXP"),
          t("section.needXP", { xp: UNLOCK_COST }),
          [{ text: "OK" }]
        );
      }
      return;
    }
    
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`${t("section.unlockSection")}\n${t("section.unlockCost", { xp: UNLOCK_COST })}`);
      if (confirmed) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const success = await storage.unlockSection(sectionId);
        if (success) {
          await loadData();
        }
      }
    } else {
      Alert.alert(
        t("section.unlockSection"),
        t("section.unlockCost", { xp: UNLOCK_COST }),
        [
          { text: t("profile.cancel"), style: "cancel" },
          {
            text: t("section.unlock", { xp: UNLOCK_COST }),
            onPress: async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const success = await storage.unlockSection(sectionId);
              if (success) {
                await loadData();
              }
            },
          },
        ]
      );
    }
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

          <View style={[styles.statsRow, isRTL && styles.rtlRow]}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Feather name="award" size={16} color={AppColors.accent} />
              </View>
              <ThemedText type="small" style={styles.statLabel} numberOfLines={2}>{t("home.level")}</ThemedText>
              <ThemedText type="h4" style={styles.statValue}>{user?.level || 1}</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <Animated.View style={[styles.statIconContainer, xpStyle]}>
                <Feather name="zap" size={16} color={AppColors.accent} />
              </Animated.View>
              <ThemedText type="small" style={styles.statLabel} numberOfLines={2}>{t("home.totalXP")}</ThemedText>
              <ThemedText type="h4" style={styles.statValue}>{user?.totalXP || 0}</ThemedText>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Feather name="check-circle" size={16} color={AppColors.success} />
              </View>
              <ThemedText type="small" style={styles.statLabel} numberOfLines={2}>{t("home.progress")}</ThemedText>
              <ThemedText type="h4" style={styles.statValue}>{progressPercent}%</ThemedText>
            </View>
          </View>

          <View style={styles.xpProgressContainer}>
            <View style={[styles.xpProgressHeader, isRTL && styles.rtlRow]}>
              <ThemedText type="small" style={[styles.xpProgressLabel, isRTL && styles.rtlText]}>
                {t("home.progressToLevel", { level: (user?.level || 1) + 1 })}
              </ThemedText>
              <ThemedText type="small" style={[styles.xpProgressValue, isRTL && styles.rtlText]}>
                {t("home.xpNeeded", { xp: xpToNextLevel })}
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
            <ThemedText type="h3" style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              {t("home.vocabularySections")}
            </ThemedText>
            <ThemedText type="small" style={[styles.sectionSubtitle, isRTL && styles.rtlText]}>
              {t("home.sectionsCompleted", { completed: completedCount, total: SECTIONS.length })}
            </ThemedText>
          </View>
        </View>

        <View style={styles.grid}>
          {SECTIONS.map((section, index) => {
            const sectionState = getSectionState(section.id, index);
            const getSectionName = () => {
              const nameMap: Record<string, string> = {
                fruits: t("section.fruits"),
                vegetables: t("section.vegetables"),
                animals: t("section.animals"),
                numbers: t("section.numbers"),
                colors: t("section.colors"),
                food_drinks: t("section.food"),
                places: t("section.places"),
                daily_actions: t("section.actions"),
                family: t("section.family"),
                jobs: t("section.jobs"),
                transportation: t("section.transport"),
              };
              return nameMap[section.id] || section.name;
            };
            const getLocalizedStatus = () => {
              if (sectionState === "locked") return t("home.locked");
              if (sectionState === "completed") return t("section.completed");
              return t("app.startLearning");
            };
            return (
              <View key={section.id} style={styles.gridItem}>
                <SectionCard
                  name={getSectionName()}
                  icon={section.icon}
                  state={sectionState}
                  onPress={() => handleSectionPress(section.id, index)}
                  statusText={getLocalizedStatus()}
                  isRTL={isRTL}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.examSection}>
          <ThemedText type="h3" style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {t("home.finalExam")}
          </ThemedText>
          <ThemedText type="small" style={[styles.sectionSubtitle, isRTL && styles.rtlText]}>
            {t("home.testKnowledge")}
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
              style={[styles.examCard, isRTL && styles.rtlRow]}
            >
              <View style={styles.examIconContainer}>
                <Feather
                  name={canTakeExam ? "award" : "lock"}
                  size={32}
                  color={AppColors.white}
                />
              </View>
              <View style={styles.examText}>
                <ThemedText type="h4" style={[styles.examTitle, isRTL && styles.rtlText]}>
                  {canTakeExam ? t("home.readyForExam") : t("home.completeFirst")}
                </ThemedText>
                <ThemedText type="small" style={[styles.examSubtitle, isRTL && styles.rtlText]}>
                  {canTakeExam
                    ? t("home.questionsFromTopics")
                    : t("home.completeMore", { count: SECTIONS.length - completedCount })}
                </ThemedText>
              </View>
              {canTakeExam ? (
                <View style={styles.examArrow}>
                  <Feather name={isRTL ? "arrow-left" : "arrow-right"} size={24} color={AppColors.white} />
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
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
    minWidth: 0,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    textAlign: "center",
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
  rtlRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
