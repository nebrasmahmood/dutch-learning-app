# NederLearn - Dutch Vocabulary Learning App

## Overview
NederLearn is an educational mobile app designed to help new residents in the Netherlands learn basic Dutch vocabulary step-by-step using images, quizzes, and a final exam.

## Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: Express.js (serving API and landing page)
- **Language**: TypeScript
- **State Management**: React Query + AsyncStorage for persistence
- **Navigation**: React Navigation 7+
- **Styling**: StyleSheet with custom design system

## Project Structure
```
├── client/                    # Expo React Native app
│   ├── components/           # Reusable UI components
│   │   ├── AnswerButton.tsx  # Quiz answer buttons with animations
│   │   ├── Button.tsx        # Primary button component
│   │   ├── Card.tsx          # Card component with elevation
│   │   ├── ProgressBar.tsx   # Animated progress bar
│   │   ├── SectionCard.tsx   # Section grid cards
│   │   ├── XPIndicator.tsx   # XP gain animation
│   │   └── ...
│   ├── constants/
│   │   └── theme.ts          # Design tokens (colors, spacing, etc.)
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── mockData.ts       # Vocabulary data and quiz generation
│   │   ├── storage.ts        # AsyncStorage persistence layer
│   │   └── query-client.ts   # React Query configuration
│   ├── navigation/
│   │   └── RootStackNavigator.tsx  # Main navigation stack
│   ├── screens/              # App screens
│   │   ├── SplashScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── SectionCompleteScreen.tsx
│   │   ├── FinalExamScreen.tsx
│   │   ├── ResultScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── App.tsx               # App entry point
├── server/                   # Express backend
│   ├── index.ts              # Server entry
│   ├── routes.ts             # API routes
│   └── templates/            # Landing page HTML
├── assets/                   # Static assets
└── app.json                  # Expo configuration
```

## Key Features
1. **Vocabulary Sections**: Fruits, Vegetables, Animals, Numbers
2. **Quiz System**: Multiple choice questions with images
3. **XP & Leveling**: Earn XP for correct answers, level up every 100 XP
4. **Section Progression**: Sequential unlocking of sections
5. **Final Exam**: Text-based answers with spelling tolerance
6. **Profile & Badges**: Track progress and earn achievements

## Design System
- **Primary Blue**: #1E88E5
- **Success Green**: #43A047
- **Error Red**: #E53935
- **Accent Orange**: #FB8C00
- **Background**: #F5F7FA
- **Border Radius**: 16px for cards
- **Button Height**: 52px

## Running the App
- The Expo app runs on port 8081
- The Express backend runs on port 5000
- Use `npm run dev` to start both servers
- Scan QR code in Expo Go to test on physical device

## Data Persistence
- User data stored in AsyncStorage
- Progress saved automatically after each quiz
- Auth state persisted across sessions
