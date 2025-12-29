# NederLearn Design Guidelines

## App Overview
**App Name:** NederLearn  
**Purpose:** Educational mobile app to help new residents in the Netherlands learn basic Dutch vocabulary through images, quizzes, and exams  
**Platforms:** iOS & Android (cross-platform)

---

## Design System

### Color Palette
- **Primary Blue:** #1E88E5
- **Success Green:** #43A047
- **Error Red:** #E53935
- **Accent Orange:** #FB8C00
- **Background:** #F5F7FA
- **Text Dark:** #263238
- **White Cards:** #FFFFFF

### Typography
- Use modern sans-serif font family
- Clear hierarchy across headings, body text, and buttons
- Ensure readability optimized for mobile screens

### Visual Style
- **Border Radius:** 16px on all cards and containers
- **Shadows:** Soft drop shadows on cards for depth
- **Button Height:** 52px (large, touch-friendly)
- **Design Philosophy:** Friendly, minimal, educational, clutter-free
- **Layout Approach:** Mobile-first with generous spacing

---

## Authentication

**Type:** Email + Password authentication  
**Flow:** Simple validation on email and password fields  
**Note:** Mock backend initially, ready for Firebase integration later

---

## Navigation Architecture

**Structure:** Stack-based navigation with section-based progression

**Screen Flow:**
1. Splash Screen (entry point)
2. Authentication Screen
3. Home Screen (hub)
4. Quiz Screen (per section)
5. Feedback Screens (correct answer, section complete)
6. Final Exam Screen
7. Result Screen
8. Profile Screen (accessible from Home)

**Navigation Pattern:** Sequential unlocking - users progress linearly through sections

---

## Screen Specifications

### 1. Splash Screen
- **Background:** Gradient blue
- **Content:** 
  - App name "NederLearn" (large, centered)
  - Subtitle "Learn Dutch step by step"
  - "Get Started" button (52px height, primary blue)
- **Layout:** Vertically centered with branding at top 2/3, button at bottom

### 2. Authentication Screen
- **Fields:** Email and Password text inputs
- **Button:** "Continue" (52px height, full width)
- **Validation:** Simple client-side validation
- **Layout:** Clean form layout with white card container

### 3. Home Screen
- **Top Bar:**
  - User level indicator
  - XP progress bar (visual representation of current progress)
- **Main Content:** 
  - 2-column grid layout
  - Section cards: Fruits, Vegetables, Animals, Numbers (expandable)
- **Card States:**
  - **Locked:** Gray background + lock icon
  - **Active:** Primary blue background
  - **Completed:** Success green background + star icon
- **Layout:** Grid with equal spacing, rounded card corners

### 4. Quiz Screen
- **Top Section:** Large image display (vocabulary item)
- **Question:** Clear text below image
- **Answers:** 3 full-width answer buttons (52px each)
- **Interaction Feedback:**
  - **Correct:** Button turns green + checkmark + "+10 XP" indicator
  - **Incorrect:** Button turns red + shake animation
- **Flow:** Auto-advance to next question after feedback
- **Layout:** Vertical stack with image taking 40% of screen height

### 5. Correct Answer Feedback
- **Visual:** Green animated checkmark (large, centered)
- **Text:** "Correct! +10 XP"
- **Duration:** Auto-dismiss after 1 second
- **Style:** Overlay or modal presentation

### 6. Section Complete Screen
- **Icon:** Trophy/achievement icon (large, centered)
- **Summary Display:**
  - Correct answers count
  - XP gained
- **Button:** "Next Section" (52px height)
- **Layout:** Centered vertically with celebration design

### 7. Final Exam Screen
- **Top Section:** Image display
- **Question:** Text prompt
- **Input:** Text input field (NOT multiple choice)
- **Button:** "Submit Answer" (52px height)
- **Validation:** Tolerate minor spelling mistakes
- **Note:** Unlocks after completing 10 sections

### 8. Result Screen
- **Score Display:** Large percentage (e.g., "85%")
- **Feedback Text:** 
  - "Excellent!" (>80%)
  - "Good" (60-80%)
  - "Needs Practice" (<60%)
- **Buttons:** 
  - "Review" (to see mistakes)
  - "Back to Home"
- **Layout:** Centered with clear visual hierarchy

### 9. Profile Screen
- **Content:**
  - User avatar
  - Current level
  - Total XP
  - Earned badges display
- **Layout:** Card-based with white background containers

---

## Interaction Design

### Touch Feedback
- All buttons provide visual feedback on press
- Use scaling or opacity changes for touch states
- Animations should feel responsive (200-300ms)

### Animations
- **Shake animation** for incorrect answers
- **Checkmark animation** for correct answers (smooth, celebratory)
- **Progress bar** smoothly animates XP gains
- **Card state transitions** animate when unlocking sections

### XP & Progression
- **XP Award:** +10 XP per correct answer only
- **Visual Feedback:** Animate progress bar when XP increases
- **Section Unlocking:** Sequential - next section unlocks after current completion
- **Final Exam:** Unlocks after 10 completed sections
- **Client-Side Protection:** Prevent XP manipulation through validation

---

## Assets & Content

### Mock Data
- Vocabulary images for: Fruits, Vegetables, Animals, Numbers
- Use placeholder images initially
- Each section contains multiple vocabulary items with corresponding images

### Icons
- Lock icon (for locked sections)
- Star icon (for completed sections)
- Trophy icon (for achievements)
- Checkmark (for correct answers)
- Use system icons or Feather icons from @expo/vector-icons

---

## Accessibility

- Large touch targets (52px minimum)
- High contrast text for readability
- Clear visual feedback for all interactions
- Ensure text inputs have proper labels

---

## Technical Notes

- Use functional components throughout
- Modular, scalable code structure
- Mock backend logic (Firebase-ready architecture)
- Runs immediately after build with mock data
- Production-ready for App Store & Google Play deployment