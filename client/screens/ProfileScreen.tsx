import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ProgressBar } from "@/components/ProgressBar";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { storage, UserData, ProgressData } from "@/lib/storage";
import { SECTIONS, BADGES } from "@/lib/mockData";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
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

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? Your progress will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await storage.setAuthenticated(false);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Splash" }],
              })
            );
          },
        },
      ]
    );
  };

  const getEarnedBadges = () => {
    const earned: string[] = [];
    if (progress?.completedSections.length && progress.completedSections.length > 0) {
      earned.push("first_section");
    }
    if (progress?.examCompleted && progress.examScore >= 0.6) {
      earned.push("exam_passed");
    }
    if (user?.level && user.level >= 5) {
      earned.push("level_5");
    }
    const hasPerfect = Object.values(progress?.sectionProgress || {}).some(
      (s) => s.score === 1
    );
    if (hasPerfect) {
      earned.push("perfect_score");
    }
    return earned;
  };

  const xpProgress = user ? (user.totalXP % 100) / 100 : 0;
  const xpToNextLevel = user ? 100 - (user.totalXP % 100) : 100;
  const earnedBadges = getEarnedBadges();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing["3xl"] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Feather name="user" size={48} color={AppColors.white} />
        </View>
        <ThemedText type="h3" style={styles.email}>
          {user?.email || "User"}
        </ThemedText>
        <ThemedText type="small" style={styles.joinDate}>
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "today"}
        </ThemedText>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Feather name="award" size={24} color={AppColors.accent} />
            <ThemedText type="h2" style={styles.statValue}>
              {user?.level || 1}
            </ThemedText>
            <ThemedText type="small" style={styles.statLabel}>
              Level
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Feather name="zap" size={24} color={AppColors.accent} />
            <ThemedText type="h2" style={styles.statValue}>
              {user?.totalXP || 0}
            </ThemedText>
            <ThemedText type="small" style={styles.statLabel}>
              Total XP
            </ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Feather name="check-circle" size={24} color={AppColors.success} />
            <ThemedText type="h2" style={styles.statValue}>
              {progress?.completedSections.length || 0}
            </ThemedText>
            <ThemedText type="small" style={styles.statLabel}>
              Sections
            </ThemedText>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText type="body" style={styles.progressTitle}>
              Progress to Level {(user?.level || 1) + 1}
            </ThemedText>
            <ThemedText type="small" style={styles.progressXP}>
              {xpToNextLevel} XP remaining
            </ThemedText>
          </View>
          <ProgressBar
            progress={xpProgress}
            height={10}
            fillColor={AppColors.primary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Badges
        </ThemedText>
        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <View
                key={badge.id}
                style={[
                  styles.badgeItem,
                  !isEarned && styles.badgeLocked,
                ]}
              >
                <View
                  style={[
                    styles.badgeIcon,
                    { backgroundColor: isEarned ? AppColors.accent : AppColors.locked },
                  ]}
                >
                  <Feather
                    name={badge.icon as any}
                    size={24}
                    color={AppColors.white}
                  />
                </View>
                <ThemedText
                  type="small"
                  style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}
                >
                  {badge.name}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Section Progress
        </ThemedText>
        {SECTIONS.map((section) => {
          const sectionProgress = progress?.sectionProgress[section.id];
          const isCompleted = progress?.completedSections.includes(section.id);
          return (
            <View key={section.id} style={styles.progressItem}>
              <View style={styles.progressItemHeader}>
                <View style={styles.progressItemLeft}>
                  <Feather
                    name={isCompleted ? "check-circle" : "circle"}
                    size={20}
                    color={isCompleted ? AppColors.success : AppColors.gray}
                  />
                  <ThemedText type="body" style={styles.progressItemName}>
                    {section.name}
                  </ThemedText>
                </View>
                {sectionProgress ? (
                  <ThemedText type="small" style={styles.progressItemScore}>
                    {Math.round(sectionProgress.score * 100)}%
                  </ThemedText>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <Button onPress={handleLogout} style={styles.logoutButton}>
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: AppColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  email: {
    color: AppColors.textDark,
    marginBottom: Spacing.xs,
  },
  joinDate: {
    color: AppColors.gray,
  },
  statsCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.xl,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    color: AppColors.textDark,
    marginTop: Spacing.sm,
  },
  statLabel: {
    color: AppColors.gray,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: AppColors.grayLight,
  },
  progressSection: {},
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    color: AppColors.textDark,
    fontWeight: "600",
  },
  progressXP: {
    color: AppColors.gray,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    color: AppColors.textDark,
    marginBottom: Spacing.lg,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.sm,
  },
  badgeItem: {
    width: "25%",
    alignItems: "center",
    padding: Spacing.sm,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  badgeName: {
    color: AppColors.textDark,
    textAlign: "center",
  },
  badgeNameLocked: {
    color: AppColors.gray,
  },
  progressItem: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  progressItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressItemName: {
    color: AppColors.textDark,
    marginLeft: Spacing.md,
  },
  progressItemScore: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: AppColors.error,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
});
