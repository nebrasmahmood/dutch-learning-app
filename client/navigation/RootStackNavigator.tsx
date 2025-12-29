import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";

import SplashScreen from "@/screens/SplashScreen";
import AuthScreen from "@/screens/AuthScreen";
import HomeScreen from "@/screens/HomeScreen";
import QuizScreen from "@/screens/QuizScreen";
import SectionCompleteScreen from "@/screens/SectionCompleteScreen";
import FinalExamScreen from "@/screens/FinalExamScreen";
import ResultScreen from "@/screens/ResultScreen";
import ProfileScreen from "@/screens/ProfileScreen";

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Home: undefined;
  Quiz: { sectionId: string };
  SectionComplete: { sectionId: string; correctAnswers: number; totalQuestions: number; xpGained: number };
  FinalExam: undefined;
  Result: { score: number; totalQuestions: number; isExam: boolean };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Quiz",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="SectionComplete"
        component={SectionCompleteScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FinalExam"
        component={FinalExamScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Final Exam",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          ...opaqueScreenOptions,
          headerTitle: "Profile",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
}
