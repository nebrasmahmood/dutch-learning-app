import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppLanguage = "en" | "ar";

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  resetLanguageChoice: () => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  hasLanguageBeenSet: boolean;
  isLoading: boolean;
}

const LANGUAGE_KEY = "@nederlearn_language";

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    "app.name": "NederLearn",
    "app.subtitle": "Learn Dutch step by step",
    "app.startLearning": "Start Learning",
    "home.title": "Learn Dutch",
    "home.continue": "Continue Learning",
    "home.level": "Level",
    "home.xp": "XP",
    "home.totalXP": "Total XP",
    "home.progress": "Progress",
    "home.progressToLevel": "Progress to Level {level}",
    "home.xpNeeded": "{xp} XP needed",
    "home.vocabularySections": "Vocabulary Sections",
    "home.sectionsCompleted": "{completed} of {total} sections completed",
    "home.finalExam": "Final Exam",
    "home.testKnowledge": "Test your knowledge across all sections",
    "home.readyForExam": "Ready for the Exam!",
    "home.completeFirst": "Complete All Sections First",
    "home.questionsFromTopics": "20 questions from all topics",
    "home.completeMore": "Complete {count} more sections",
    "home.locked": "Locked",
    "quiz.question": "What is the Dutch word for:",
    "quiz.questionOf": "Question {current} of {total}",
    "quiz.score": "Score",
    "quiz.correct": "Correct!",
    "quiz.incorrect": "Incorrect",
    "section.complete": "Section Complete!",
    "section.completed": "Completed",
    "section.score": "Your Score",
    "section.xpEarned": "XP Earned",
    "section.continue": "Continue",
    "section.fruits": "Fruits",
    "section.vegetables": "Vegetables",
    "section.animals": "Animals",
    "section.numbers": "Numbers",
    "section.colors": "Colors",
    "section.food": "Food & Drinks",
    "section.places": "Places",
    "section.actions": "Daily Actions",
    "section.family": "Family",
    "section.jobs": "Jobs",
    "section.transport": "Transportation",
    "section.nextSection": "Next: {name}",
    "section.backToHome": "Back to Home",
    "section.correctAnswers": "Correct",
    "section.sectionFailed": "Section Not Passed",
    "section.needMore": "You need at least 15 correct answers to complete this section",
    "section.tryAgain": "Try Again",
    "section.unlockSection": "Unlock Section",
    "section.unlockCost": "Unlock this section for {xp} XP",
    "section.notEnoughXP": "Not Enough XP",
    "section.needXP": "You need {xp} XP to unlock this section",
    "section.unlock": "Unlock for {xp} XP",
    "profile.title": "Profile",
    "profile.displayName": "Learner",
    "profile.level": "Level",
    "profile.totalXP": "Total XP",
    "profile.sections": "Sections",
    "profile.sectionsCompleted": "Sections Completed",
    "profile.language": "Language",
    "profile.badges": "Badges",
    "profile.progressToLevel": "Progress to Level {level}",
    "profile.xpRemaining": "{xp} XP remaining",
    "profile.memberSince": "Member since {date}",
    "profile.logout": "Logout",
    "profile.logoutConfirm": "Are you sure you want to logout? Your progress will be saved.",
    "profile.cancel": "Cancel",
    "profile.changeLanguage": "Change Language",
    "settings.language": "App Language",
    "settings.english": "English",
    "settings.arabic": "العربية",
    "auth.getStarted": "Get Started",
    "auth.signIn": "Sign In",
    "auth.email": "Email",
    "auth.password": "Password",
    "language.select": "Select Your Language",
    "language.chooseLanguage": "Choose the language for the app",
    "language.continue": "Continue",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.retry": "Retry",
    "common.back": "Back",
    "common.next": "Next",
    "common.done": "Done",
    "nav.quiz": "Quiz",
    "nav.finalExam": "Final Exam",
    "nav.profile": "Profile",
  },
  ar: {
    "app.name": "NederLearn",
    "app.subtitle": "تعلّم الهولندية خطوة بخطوة",
    "app.startLearning": "ابدأ التعلّم",
    "home.title": "تعلم الهولندية",
    "home.continue": "تابع التعلم",
    "home.level": "المستوى",
    "home.xp": "نقاط الخبرة",
    "home.totalXP": "إجمالي نقاط الخبرة",
    "home.progress": "التقدم",
    "home.progressToLevel": "التقدم نحو المستوى {level}",
    "home.xpNeeded": "{xp} نقطة خبرة مطلوبة",
    "home.vocabularySections": "أقسام المفردات",
    "home.sectionsCompleted": "{completed} من {total} أقسام مكتملة",
    "home.finalExam": "الامتحان النهائي",
    "home.testKnowledge": "اختبر معرفتك في جميع الأقسام",
    "home.readyForExam": "جاهز للامتحان!",
    "home.completeFirst": "أكمل جميع الأقسام أولاً",
    "home.questionsFromTopics": "20 سؤالاً من جميع المواضيع",
    "home.completeMore": "أكمل {count} أقسام إضافية",
    "home.locked": "مغلق",
    "quiz.question": "ما معنى هذه الكلمة باللغة الهولندية؟",
    "quiz.questionOf": "السؤال {current} من {total}",
    "quiz.score": "النتيجة",
    "quiz.correct": "صحيح!",
    "quiz.incorrect": "خطأ",
    "section.complete": "تم إكمال القسم!",
    "section.completed": "مكتمل",
    "section.score": "نتيجتك",
    "section.xpEarned": "نقاط الخبرة المكتسبة",
    "section.continue": "متابعة",
    "section.fruits": "الفواكه",
    "section.vegetables": "الخضروات",
    "section.animals": "الحيوانات",
    "section.numbers": "الأرقام",
    "section.colors": "الألوان",
    "section.food": "الطعام والمشروبات",
    "section.places": "الأماكن",
    "section.actions": "الأفعال اليومية",
    "section.family": "العائلة",
    "section.jobs": "المهن",
    "section.transport": "المواصلات",
    "section.nextSection": "التالي: {name}",
    "section.backToHome": "العودة للرئيسية",
    "section.correctAnswers": "الإجابات الصحيحة",
    "section.sectionFailed": "لم يتم اجتياز القسم",
    "section.needMore": "تحتاج إلى 15 إجابة صحيحة على الأقل لإكمال هذا القسم",
    "section.tryAgain": "حاول مرة أخرى",
    "section.unlockSection": "فتح القسم",
    "section.unlockCost": "افتح هذا القسم مقابل {xp} نقطة خبرة",
    "section.notEnoughXP": "نقاط الخبرة غير كافية",
    "section.needXP": "تحتاج إلى {xp} نقطة خبرة لفتح هذا القسم",
    "section.unlock": "فتح مقابل {xp} نقطة خبرة",
    "profile.title": "الملف الشخصي",
    "profile.displayName": "متعلم",
    "profile.level": "المستوى",
    "profile.totalXP": "إجمالي نقاط الخبرة",
    "profile.sections": "الأقسام",
    "profile.sectionsCompleted": "الأقسام المكتملة",
    "profile.language": "اللغة",
    "profile.badges": "الشارات",
    "profile.progressToLevel": "التقدم نحو المستوى {level}",
    "profile.xpRemaining": "{xp} نقطة خبرة متبقية",
    "profile.memberSince": "عضو منذ {date}",
    "profile.logout": "تسجيل الخروج",
    "profile.logoutConfirm": "هل أنت متأكد أنك تريد تسجيل الخروج؟ سيتم حفظ تقدمك.",
    "profile.cancel": "إلغاء",
    "profile.changeLanguage": "تغيير اللغة",
    "settings.language": "لغة التطبيق",
    "settings.english": "English",
    "settings.arabic": "العربية",
    "auth.getStarted": "ابدأ الآن",
    "auth.signIn": "تسجيل الدخول",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "language.select": "اختر لغتك",
    "language.chooseLanguage": "اختر لغة التطبيق",
    "language.continue": "متابعة",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.retry": "إعادة المحاولة",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.done": "تم",
    "nav.quiz": "الاختبار",
    "nav.finalExam": "الامتحان النهائي",
    "nav.profile": "الملف الشخصي",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [hasLanguageBeenSet, setHasLanguageBeenSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((savedLang) => {
      if (savedLang === "en" || savedLang === "ar") {
        setLanguageState(savedLang);
        setHasLanguageBeenSet(true);
      }
      setIsLoading(false);
    });
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    setHasLanguageBeenSet(true);
    AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  const resetLanguageChoice = async () => {
    await AsyncStorage.removeItem(LANGUAGE_KEY);
    setHasLanguageBeenSet(false);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, String(value));
      });
    }
    return text;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, resetLanguageChoice, t, isRTL, hasLanguageBeenSet, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
