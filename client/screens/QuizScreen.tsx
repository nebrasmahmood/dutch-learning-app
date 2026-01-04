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
import { useLanguage } from "@/lib/LanguageContext";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, "Quiz">;

const XP_PER_CORRECT = 10;
const MINIMUM_CORRECT_TO_PASS = 15;

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { sectionId } = route.params;
  const { language, t, isRTL } = useLanguage();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [loading, setLoading] = useState(true);

  const getSourceWord = (question: QuizQuestion) => {
    return language === "ar" ? question.arabic : question.english;
  };

  useEffect(() => {
    const loadQuiz = async () => {
      const section = getSectionById(sectionId);
      if (section) {
        const savedState = await storage.getQuizState(sectionId);
        const quizQuestions = generateQuizQuestions(section);
        
        if (savedState && savedState.questionIds.length === quizQuestions.length) {
          const orderedQuestions = savedState.questionIds
            .map(id => quizQuestions.find(q => q.id === id))
            .filter((q): q is QuizQuestion => q !== undefined);
          
          if (orderedQuestions.length === quizQuestions.length) {
            setQuestions(orderedQuestions);
            setCurrentIndex(savedState.currentIndex);
            setCorrectCount(savedState.correctCount);
          } else {
            setQuestions(quizQuestions);
          }
        } else {
          setQuestions(quizQuestions);
        }
        navigation.setOptions({ headerTitle: section.name });
      }
      setLoading(false);
    };
    loadQuiz();
  }, [sectionId]);

  useEffect(() => {
    if (questions.length > 0 && !loading) {
      storage.saveQuizState({
        sectionId,
        currentIndex,
        correctCount,
        answeredQuestions: [],
        questionIds: questions.map(q => q.id),
      });
    }
  }, [currentIndex, correctCount, questions, sectionId, loading]);

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

    setTimeout(async () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        const finalCorrectCount = correctCount + (correct ? 1 : 0);
        const xpGained = finalCorrectCount * XP_PER_CORRECT;
        const score = finalCorrectCount / questions.length;
        
        if (finalCorrectCount >= MINIMUM_CORRECT_TO_PASS) {
          await storage.completeSection(sectionId, score);
        }
        
        await storage.clearQuizState(sectionId);
        
        navigation.replace("SectionComplete", {
          sectionId,
          correctAnswers: finalCorrectCount,
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
          <ThemedText type="small" style={[styles.progressText, isRTL && styles.rtlText]}>
            {t("quiz.questionOf", { current: currentIndex + 1, total: questions.length })}
          </ThemedText>
          <ThemedText type="small" style={[styles.scoreText, isRTL && styles.rtlText]}>
            {t("quiz.score")}: {correctCount}/{currentIndex + (selectedAnswer ? 1 : 0)}
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
          <ThemedText type="small" style={[styles.questionLabel, isRTL && styles.rtlText]}>
            {t("quiz.question")}
          </ThemedText>
          <ThemedText type="h1" style={[styles.questionWord, isRTL && styles.rtlText]}>
            {getSourceWord(currentQuestion)}
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
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
