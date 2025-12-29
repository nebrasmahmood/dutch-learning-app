import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ProgressBar } from "@/components/ProgressBar";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { generateExamQuestions, checkSpelling, ExamQuestion } from "@/lib/mockData";
import { storage } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const XP_PER_CORRECT = 20;

export default function FinalExamScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const examQuestions = generateExamQuestions();
    setQuestions(examQuestions);
    setLoading(false);
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    const isCorrect = checkSpelling(answer, currentQuestion.correctAnswer);
    setFeedback(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount((prev) => prev + 1);
      await storage.addXP(XP_PER_CORRECT);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setAnswer("");
        setFeedback(null);
        setSubmitting(false);
        setImageLoading(true);
      } else {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const progress = storage.getProgress();
        progress.then((p) => {
          p.examCompleted = true;
          p.examScore = finalCorrect / questions.length;
          storage.setProgress(p);
        });

        navigation.replace("Result", {
          score: finalCorrect,
          totalQuestions: questions.length,
          isExam: true,
        });
      }
    }, 1500);
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <ThemedText type="small" style={styles.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </ThemedText>
          <ThemedText type="small" style={styles.scoreText}>
            Score: {correctCount}/{currentIndex + (feedback ? 1 : 0)}
          </ThemedText>
        </View>
        <ProgressBar
          progress={progress}
          height={6}
          fillColor={AppColors.accent}
        />
      </View>

      <View style={styles.imageContainer}>
        {imageLoading ? (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="large" color={AppColors.primary} />
          </View>
        ) : null}
        <Image
          source={{ uri: currentQuestion.imageUrl }}
          style={[styles.image, imageLoading && styles.imageHidden]}
          resizeMode="cover"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
      </View>

      <View style={styles.questionContainer}>
        <ThemedText type="h3" style={styles.question}>
          {currentQuestion.question}
        </ThemedText>
        <ThemedText type="small" style={styles.hint}>
          Type your answer in Dutch
        </ThemedText>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            feedback === "correct" && styles.inputCorrect,
            feedback === "incorrect" && styles.inputIncorrect,
          ]}
          placeholder="Your answer..."
          placeholderTextColor={AppColors.gray}
          value={answer}
          onChangeText={setAnswer}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitting}
        />
        {feedback === "incorrect" ? (
          <ThemedText type="small" style={styles.correctAnswer}>
            Correct answer: {currentQuestion.correctAnswer}
          </ThemedText>
        ) : null}
      </View>

      <Button
        onPress={handleSubmit}
        disabled={!answer.trim() || submitting}
        style={styles.submitButton}
      >
        {submitting ? "Checking..." : "Submit Answer"}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: Spacing.lg,
    flexGrow: 1,
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
    color: AppColors.accent,
    fontWeight: "600",
  },
  imageContainer: {
    height: 180,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    backgroundColor: AppColors.white,
    marginBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.grayLight,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageHidden: {
    opacity: 0,
  },
  questionContainer: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  question: {
    color: AppColors.textDark,
    textAlign: "center",
  },
  hint: {
    color: AppColors.gray,
    marginTop: Spacing.sm,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  input: {
    height: Spacing.buttonHeight,
    backgroundColor: AppColors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    color: AppColors.textDark,
    borderWidth: 2,
    borderColor: AppColors.grayLight,
    textAlign: "center",
  },
  inputCorrect: {
    borderColor: AppColors.success,
    backgroundColor: "rgba(67, 160, 71, 0.1)",
  },
  inputIncorrect: {
    borderColor: AppColors.error,
    backgroundColor: "rgba(229, 57, 53, 0.1)",
  },
  correctAnswer: {
    color: AppColors.error,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  submitButton: {
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.md,
    marginTop: "auto",
  },
});
