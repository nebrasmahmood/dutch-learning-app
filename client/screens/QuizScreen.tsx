import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { AnswerButton } from "@/components/AnswerButton";
import { ProgressBar } from "@/components/ProgressBar";
import { XPIndicator } from "@/components/XPIndicator";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { getSectionById, generateQuizQuestions, QuizQuestion } from "@/lib/mockData";
import { storage } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "Quiz">;

const XP_PER_CORRECT = 10;

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { sectionId } = route.params;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const section = getSectionById(sectionId);
    if (section) {
      const quizQuestions = generateQuizQuestions(section);
      setQuestions(quizQuestions);
      navigation.setOptions({ headerTitle: section.name });
    }
    setLoading(false);
  }, [sectionId]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const handleAnswerPress = useCallback(async (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      setShowXP(true);
      await storage.addXP(XP_PER_CORRECT);
      
      setTimeout(() => {
        setShowXP(false);
      }, 1000);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        const xpGained = (correctCount + (correct ? 1 : 0)) * XP_PER_CORRECT;
        storage.completeSection(sectionId, (correctCount + (correct ? 1 : 0)) / questions.length);
        navigation.replace("SectionComplete", {
          sectionId,
          correctAnswers: correctCount + (correct ? 1 : 0),
          totalQuestions: questions.length,
          xpGained,
        });
      }
    }, 1500);
  }, [selectedAnswer, currentQuestion, currentIndex, questions.length, correctCount, sectionId, navigation]);

  const getAnswerState = (answer: string) => {
    if (!selectedAnswer) return "default";
    if (answer === selectedAnswer) {
      return isCorrect ? "correct" : "incorrect";
    }
    if (answer === currentQuestion.correctAnswer && !isCorrect) {
      return "correct";
    }
    return "disabled";
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.xl }]}>
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <ThemedText type="small" style={styles.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </ThemedText>
          <ThemedText type="small" style={styles.scoreText}>
            Score: {correctCount}/{currentIndex + (selectedAnswer ? 1 : 0)}
          </ThemedText>
        </View>
        <ProgressBar
          progress={progress}
          height={6}
          fillColor={AppColors.primary}
        />
      </View>

      <View style={styles.questionContainer}>
        <View style={styles.wordCard}>
          <ThemedText type="small" style={styles.questionLabel}>
            What is the Dutch word for:
          </ThemedText>
          <ThemedText type="h1" style={styles.questionWord}>
            {currentQuestion.english}
          </ThemedText>
        </View>
      </View>

      <View style={styles.answersContainer}>
        {currentQuestion.options.map((option, index) => (
          <AnswerButton
            key={`${currentQuestion.id}-${index}`}
            text={option}
            state={getAnswerState(option)}
            onPress={() => handleAnswerPress(option)}
          />
        ))}
      </View>

      <XPIndicator amount={XP_PER_CORRECT} visible={showXP} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressText: {
    color: AppColors.gray,
  },
  scoreText: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  questionContainer: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  wordCard: {
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    paddingVertical: Spacing["2xl"],
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  questionLabel: {
    color: AppColors.gray,
    marginBottom: Spacing.md,
  },
  questionWord: {
    color: AppColors.primary,
    textAlign: "center",
    fontWeight: "700",
  },
  answersContainer: {
    flex: 1,
  },
});
