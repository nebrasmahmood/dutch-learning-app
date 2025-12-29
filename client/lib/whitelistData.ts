import whitelistVocab from "../../whitelist.vocab.json";

export interface WhitelistItem {
  id: string;
  word_nl: string;
  word_en: string;
  word_ar: string;
  image_prompt: string;
}

export interface WhitelistSection {
  id: string;
  title: string;
  difficulty: string;
  maxQuestionsPerSession: number;
  items: WhitelistItem[];
}

export interface VocabItem {
  id: string;
  dutch: string;
  english: string;
  arabic: string;
  imageUrl: string;
  imagePrompt: string;
}

export interface Section {
  id: string;
  name: string;
  icon: string;
  items: VocabItem[];
}

export interface QuizQuestion {
  id: string;
  imageUrl: string;
  correctAnswer: string;
  options: string[];
  dutch: string;
  english: string;
  arabic: string;
}

const SECTION_ICONS: Record<string, string> = {
  vegetables: "leaf",
  animals: "heart",
  colors: "droplet",
  food_drinks: "coffee",
  transportation: "truck",
  places: "map-pin",
  family: "users",
  jobs: "briefcase",
  fruits: "circle",
  numbers: "hash",
  daily_actions: "activity",
};

function generateImageUrlFromPrompt(imagePrompt: string, englishWord: string): string {
  return "";
}

function convertWhitelistItem(item: WhitelistItem): VocabItem {
  return {
    id: item.id,
    dutch: item.word_nl,
    english: item.word_en,
    arabic: item.word_ar || item.word_en,
    imageUrl: generateImageUrlFromPrompt(item.image_prompt, item.word_en),
    imagePrompt: item.image_prompt,
  };
}

function convertWhitelistSection(section: WhitelistSection): Section {
  return {
    id: section.id,
    name: section.title,
    icon: SECTION_ICONS[section.id] || "book",
    items: section.items.map(convertWhitelistItem),
  };
}

const whitelistData = whitelistVocab as { sections: WhitelistSection[] };

export const SECTIONS: Section[] = whitelistData.sections.map(convertWhitelistSection);

export function getSectionById(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

const QUESTIONS_PER_SESSION = 30;

export function generateQuizQuestions(section: Section, count: number = QUESTIONS_PER_SESSION): QuizQuestion[] {
  if (!section || !section.items || section.items.length === 0) {
    console.warn(`Section ${section?.id} has no items or is invalid`);
    return [];
  }

  const MIN_ITEMS_FOR_QUIZ = 4;
  if (section.items.length < MIN_ITEMS_FOR_QUIZ) {
    console.warn(`Section ${section.id} has fewer than ${MIN_ITEMS_FOR_QUIZ} items, cannot generate quiz`);
    return [];
  }

  const shuffledItems = [...section.items].sort(() => Math.random() - 0.5);
  const selectedItems = shuffledItems.slice(0, Math.min(count, section.items.length));
  
  return selectedItems.map((item) => {
    const otherItems = section.items.filter((i) => i.id !== item.id);
    const shuffled = [...otherItems].sort(() => Math.random() - 0.5);
    let wrongAnswers = shuffled.slice(0, 3).map((i) => i.dutch);
    
    if (wrongAnswers.length < 3) {
      const allOtherSectionItems = SECTIONS
        .filter(s => s.id !== section.id)
        .flatMap(s => s.items)
        .filter(i => i.dutch !== item.dutch && !wrongAnswers.includes(i.dutch));
      
      const shuffledOther = [...allOtherSectionItems].sort(() => Math.random() - 0.5);
      const needed = 3 - wrongAnswers.length;
      wrongAnswers = [...wrongAnswers, ...shuffledOther.slice(0, needed).map(i => i.dutch)];
    }
    
    const uniqueOptions = new Set([item.dutch, ...wrongAnswers]);
    const options = Array.from(uniqueOptions).slice(0, 4).sort(() => Math.random() - 0.5);
    
    return {
      id: item.id,
      imageUrl: item.imageUrl,
      correctAnswer: item.dutch,
      options,
      dutch: item.dutch,
      english: item.english,
      arabic: item.arabic,
    };
  });
}

export function getImagePromptForItem(itemId: string): string | null {
  for (const section of SECTIONS) {
    const item = section.items.find(i => i.id === itemId);
    if (item) {
      return item.imagePrompt;
    }
  }
  return null;
}

export function validateVocabItem(itemId: string): boolean {
  for (const section of SECTIONS) {
    if (section.items.some(i => i.id === itemId)) {
      return true;
    }
  }
  return false;
}

export function getSectionStats() {
  return SECTIONS.map(section => ({
    id: section.id,
    name: section.name,
    itemCount: section.items.length,
  }));
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGES: Badge[] = [
  {
    id: "first_section",
    name: "First Steps",
    description: "Complete your first section",
    icon: "star",
  },
  {
    id: "exam_passed",
    name: "Exam Master",
    description: "Pass the final exam",
    icon: "award",
  },
  {
    id: "level_5",
    name: "Rising Star",
    description: "Reach level 5",
    icon: "trending-up",
  },
  {
    id: "perfect_score",
    name: "Perfectionist",
    description: "Get a perfect score on any section",
    icon: "check-circle",
  },
];
