import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppLanguage = "en" | "ar";

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LANGUAGE_KEY = "@nederlearn_language";

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    "app.name": "NederLearn",
    "home.title": "Learn Dutch",
    "home.continue": "Continue Learning",
    "home.level": "Level",
    "home.xp": "XP",
    "home.progress": "Progress",
    "quiz.question": "What is the Dutch word for:",
    "quiz.questionOf": "Question {current} of {total}",
    "quiz.score": "Score",
    "quiz.correct": "Correct!",
    "quiz.incorrect": "Incorrect",
    "section.complete": "Section Complete!",
    "section.score": "Your Score",
    "section.xpEarned": "XP Earned",
    "section.continue": "Continue",
    "profile.title": "Profile",
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
    "settings.language": "App Language",
    "settings.english": "English",
    "settings.arabic": "العربية",
    "auth.getStarted": "Get Started",
    "auth.signIn": "Sign In",
    "auth.email": "Email",
    "auth.password": "Password",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.retry": "Retry",
    "common.back": "Back",
    "common.next": "Next",
    "common.done": "Done",
  },
  ar: {
    "app.name": "NederLearn",
    "home.title": "تعلم الهولندية",
    "home.continue": "تابع التعلم",
    "home.level": "المستوى",
    "home.xp": "نقاط الخبرة",
    "home.progress": "التقدم",
    "quiz.question": "ما معنى هذه الكلمة باللغة الهولندية؟",
    "quiz.questionOf": "السؤال {current} من {total}",
    "quiz.score": "النتيجة",
    "quiz.correct": "صحيح!",
    "quiz.incorrect": "خطأ",
    "section.complete": "تم إكمال القسم!",
    "section.score": "نتيجتك",
    "section.xpEarned": "نقاط الخبرة المكتسبة",
    "section.continue": "متابعة",
    "profile.title": "الملف الشخصي",
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
    "settings.language": "لغة التطبيق",
    "settings.english": "English",
    "settings.arabic": "العربية",
    "auth.getStarted": "ابدأ الآن",
    "auth.signIn": "تسجيل الدخول",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.retry": "إعادة المحاولة",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.done": "تم",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((savedLang) => {
      if (savedLang === "en" || savedLang === "ar") {
        setLanguageState(savedLang);
      }
    });
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang);
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
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
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
