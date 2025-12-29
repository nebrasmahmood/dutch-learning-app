import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

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
    navigation.navigate("Profile");
  };

  const handleFinalExamPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("FinalExam");
  };

  const xpProgress = user ? (user.totalXP % 100) / 100 : 0;
  const xpToNextLevel = user ? 100 - (user.totalXP % 100) : 100;
  const canTakeExam = progress && progress.completedSections.length >= SECTIONS.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="h2" style={styles.greeting}>
            NederLearn
          </ThemedText>
          <View style={styles.levelContainer}>
            <Feather name="award" size={16} color={AppColors.accent} />
            <ThemedText type="small" style={styles.levelText}>
              Level {user?.level || 1}
            </ThemedText>
          </View>
        </View>
        <Pressable onPress={handleProfilePress} style={styles.profileButton}>
          <Feather name="user" size={24} color={AppColors.textDark} />
        </Pressable>
      </View>

      <View style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <View style={styles.xpInfo}>
            <Feather name="zap" size={20} color={AppColors.accent} />
            <ThemedText type="body" style={styles.xpText}>
              {user?.totalXP || 0} XP
            </ThemedText>
          </View>
          <ThemedText type="small" style={styles.xpRemaining}>
            {xpToNextLevel} XP to next level
          </ThemedText>
        </View>
        <ProgressBar
          progress={xpProgress}
          height={10}
          fillColor={AppColors.accent}
          backgroundColor={AppColors.grayLight}
        />
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Vocabulary Sections
        </ThemedText>
        <ThemedText type="small" style={styles.sectionSubtitle}>
          {progress?.completedSections.length || 0} of {SECTIONS.length} completed
        </ThemedText>
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
        <ThemedText type="h4" style={styles.sectionTitle}>
          Final Exam
        </ThemedText>
        <Pressable
          onPress={canTakeExam ? handleFinalExamPress : undefined}
          style={[
            styles.examCard,
            { backgroundColor: canTakeExam ? AppColors.accent : AppColors.locked },
          ]}
        >
          <View style={styles.examContent}>
            <Feather
              name={canTakeExam ? "award" : "lock"}
              size={32}
              color={AppColors.white}
            />
            <View style={styles.examText}>
              <ThemedText type="h4" style={styles.examTitle}>
                {canTakeExam ? "Ready for the Exam!" : "Complete All Sections"}
              </ThemedText>
              <ThemedText type="small" style={styles.examSubtitle}>
                {canTakeExam
                  ? "Test your Dutch vocabulary knowledge"
                  : `Complete ${SECTIONS.length - (progress?.completedSections.length || 0)} more sections`}
              </ThemedText>
            </View>
          </View>
          {canTakeExam ? (
            <Feather name="chevron-right" size={24} color={AppColors.white} />
          ) : null}
        </Pressable>
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
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: AppColors.textDark,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  levelText: {
    color: AppColors.accent,
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: AppColors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  xpCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  xpInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  xpText: {
    color: AppColors.textDark,
    fontWeight: "700",
    marginLeft: Spacing.sm,
  },
  xpRemaining: {
    color: AppColors.gray,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: AppColors.textDark,
  },
  sectionSubtitle: {
    color: AppColors.gray,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  gridItem: {
    width: "50%",
  },
  examSection: {
    marginTop: Spacing.md,
  },
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginTop: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  examContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  examText: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  examTitle: {
    color: AppColors.white,
  },
  examSubtitle: {
    color: "rgba(255,255,255,0.8)",
    marginTop: Spacing.xs,
  },
});
