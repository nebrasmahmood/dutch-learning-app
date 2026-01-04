import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_DATA: "@nederlearn_user",
  PROGRESS: "@nederlearn_progress",
  AUTH: "@nederlearn_auth",
  QUIZ_STATE: "@nederlearn_quiz_state",
};

export interface UserData {
  id: string;
  name: string;
  level: number;
  totalXP: number;
  badges: string[];
  createdAt: string;
}

export interface SectionProgress {
  sectionId: string;
  completed: boolean;
  score: number;
  attempts: number;
}

export interface QuizState {
  sectionId: string;
  currentIndex: number;
  correctCount: number;
  answeredQuestions: string[];
  questionIds: string[];
}

export interface ProgressData {
  completedSections: string[];
  sectionProgress: Record<string, SectionProgress>;
  examCompleted: boolean;
  examScore: number;
  unlockedSections: string[];
}

export const storage = {
  async getUser(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  },

  async getProgress(): Promise<ProgressData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) return JSON.parse(data);
    } catch {
      // Return default
    }
    return {
      completedSections: [],
      sectionProgress: {},
      examCompleted: false,
      examScore: 0,
      unlockedSections: [],
    };
  },

  async setProgress(progress: ProgressData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const auth = await AsyncStorage.getItem(STORAGE_KEYS.AUTH);
      return auth === "true";
    } catch {
      return false;
    }
  },

  async setAuthenticated(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH, value ? "true" : "false");
    } catch (error) {
      console.error("Failed to save auth:", error);
    }
  },

  async addXP(amount: number): Promise<UserData | null> {
    const user = await this.getUser();
    if (!user) return null;

    user.totalXP += amount;
    const newLevel = Math.floor(user.totalXP / 100) + 1;
    user.level = newLevel;

    await this.setUser(user);
    return user;
  },

  async completeSection(sectionId: string, score: number): Promise<void> {
    const progress = await this.getProgress();
    if (!progress.completedSections.includes(sectionId)) {
      progress.completedSections.push(sectionId);
    }
    progress.sectionProgress[sectionId] = {
      sectionId,
      completed: true,
      score,
      attempts: (progress.sectionProgress[sectionId]?.attempts || 0) + 1,
    };
    await this.setProgress(progress);
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.PROGRESS,
        STORAGE_KEYS.AUTH,
      ]);
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  },

  async initUser(name: string): Promise<UserData> {
    const user: UserData = {
      id: Date.now().toString(),
      name,
      level: 1,
      totalXP: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };
    await this.setUser(user);
    await this.setAuthenticated(true);
    await this.setProgress({
      completedSections: [],
      sectionProgress: {},
      examCompleted: false,
      examScore: 0,
      unlockedSections: [],
    });
    return user;
  },

  async getQuizState(sectionId: string): Promise<QuizState | null> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.QUIZ_STATE}_${sectionId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveQuizState(state: QuizState): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.QUIZ_STATE}_${state.sectionId}`,
        JSON.stringify(state)
      );
    } catch (error) {
      console.error("Failed to save quiz state:", error);
    }
  },

  async clearQuizState(sectionId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.QUIZ_STATE}_${sectionId}`);
    } catch (error) {
      console.error("Failed to clear quiz state:", error);
    }
  },

  async unlockSection(sectionId: string): Promise<boolean> {
    const UNLOCK_COST = 300;
    const user = await this.getUser();
    if (!user || user.totalXP < UNLOCK_COST) return false;

    user.totalXP -= UNLOCK_COST;
    user.level = Math.floor(user.totalXP / 100) + 1;
    await this.setUser(user);

    const progress = await this.getProgress();
    if (!progress.unlockedSections) {
      progress.unlockedSections = [];
    }
    if (!progress.unlockedSections.includes(sectionId)) {
      progress.unlockedSections.push(sectionId);
    }
    await this.setProgress(progress);
    return true;
  },

  async isSectionUnlocked(sectionId: string): Promise<boolean> {
    const progress = await this.getProgress();
    return progress.unlockedSections?.includes(sectionId) || false;
  },
};
