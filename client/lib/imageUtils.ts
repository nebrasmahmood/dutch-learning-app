export interface ImageValidationRules {
  singleObject: boolean;
  neutralBackground: boolean;
  realisticStyle: boolean;
  noText: boolean;
  noLogos: boolean;
  noPeople: boolean;
  boundToWord: boolean;
}

export interface ImageGenerationConfig {
  word: string;
  englishWord: string;
  category: string;
  maxRetries?: number;
}

const DEFAULT_VALIDATION_RULES: ImageValidationRules = {
  singleObject: true,
  neutralBackground: true,
  realisticStyle: true,
  noText: true,
  noLogos: true,
  noPeople: true,
  boundToWord: true,
};

const CATEGORY_KEYWORDS: Record<string, string> = {
  fruits: "fresh fruit isolated white background studio photo",
  vegetables: "fresh vegetable isolated white background studio photo",
  animals: "animal portrait isolated clean background wildlife photo",
  numbers: "number symbol minimal clean design",
  colors: "solid color swatch paint gradient minimal",
  food_drinks: "food dish isolated white background culinary photo",
  places: "building location architecture exterior clean photo",
  daily_actions: "action activity illustration minimal clean",
  family: "family relationship symbol icon minimal",
  jobs: "profession work equipment tools isolated photo",
  transportation: "vehicle transport isolated white background photo",
};

const NEGATIVE_KEYWORDS = [
  "text",
  "logo",
  "watermark",
  "person",
  "people",
  "human",
  "face",
  "crowd",
  "group",
  "cartoon",
  "illustration",
  "drawing",
  "clipart",
  "meme",
  "collage",
];

export function generateImagePrompt(config: ImageGenerationConfig): string {
  const { englishWord, category } = config;
  const categoryContext = CATEGORY_KEYWORDS[category] || "isolated white background photo";
  
  const prompt = `${englishWord} ${categoryContext}`;
  
  return prompt;
}

export function generateSearchableImageUrl(
  englishWord: string,
  category: string
): string {
  const cleanWord = englishWord.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const categoryKeywords = getCategorySearchTerms(category);
  
  const searchQuery = encodeURIComponent(`${cleanWord} ${categoryKeywords}`);
  
  return `https://source.unsplash.com/400x400/?${searchQuery}`;
}

function getCategorySearchTerms(category: string): string {
  const terms: Record<string, string> = {
    fruits: "fruit,fresh,isolated",
    vegetables: "vegetable,fresh,produce",
    animals: "animal,wildlife,nature",
    numbers: "number,digit,symbol",
    colors: "color,solid,abstract",
    food_drinks: "food,drink,cuisine",
    places: "place,building,location",
    daily_actions: "action,activity",
    family: "family,relationship",
    jobs: "profession,work,career",
    transportation: "vehicle,transport,travel",
  };
  
  return terms[category] || "object,isolated";
}

export function validateImageForLearning(
  imageUrl: string,
  word: string,
  rules: ImageValidationRules = DEFAULT_VALIDATION_RULES
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!imageUrl || imageUrl.trim() === "") {
    issues.push("Image URL is empty");
    return { isValid: false, issues };
  }
  
  if (!isValidImageUrl(imageUrl)) {
    issues.push("Invalid image URL format");
    return { isValid: false, issues };
  }
  
  if (rules.boundToWord && !isWordRelevantToImage(word, imageUrl)) {
    issues.push(`Image may not represent "${word}" correctly`);
  }
  
  if (containsBlockedContent(imageUrl)) {
    issues.push("Image may contain blocked content (text, logos, or people)");
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isWordRelevantToImage(word: string, imageUrl: string): boolean {
  const urlLower = imageUrl.toLowerCase();
  const wordLower = word.toLowerCase();
  
  if (urlLower.includes(wordLower)) {
    return true;
  }
  
  const queryMatch = imageUrl.match(/\?(.+)/);
  if (queryMatch) {
    const decodedQuery = decodeURIComponent(queryMatch[1]).toLowerCase();
    if (decodedQuery.includes(wordLower)) {
      return true;
    }
  }
  
  return true;
}

function containsBlockedContent(imageUrl: string): boolean {
  const urlLower = imageUrl.toLowerCase();
  
  for (const keyword of NEGATIVE_KEYWORDS) {
    if (urlLower.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

export async function getValidatedImageUrl(
  config: ImageGenerationConfig,
  currentUrl: string
): Promise<string> {
  const { maxRetries = 3 } = config;
  
  const validation = validateImageForLearning(currentUrl, config.englishWord);
  
  if (validation.isValid) {
    return currentUrl;
  }
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const newUrl = generateSearchableImageUrl(config.englishWord, config.category);
    const newValidation = validateImageForLearning(newUrl, config.englishWord);
    
    if (newValidation.isValid) {
      return newUrl;
    }
  }
  
  return generateFallbackImageUrl(config.englishWord, config.category);
}

function generateFallbackImageUrl(englishWord: string, category: string): string {
  const cleanWord = englishWord.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `https://source.unsplash.com/400x400/?${encodeURIComponent(cleanWord)}`;
}

export function buildOptimizedImageUrl(
  englishWord: string,
  category: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): string {
  const { width = 400, height = 400, quality = 80 } = options;
  
  const cleanWord = englishWord.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const categoryTerms = getCategorySearchTerms(category);
  
  const searchTerms = `${cleanWord},${categoryTerms}`;
  
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerms)}`;
}

export const IMAGE_GENERATION_GUIDELINES = {
  prompt: {
    structure: "Single [object] on [neutral background], realistic photographic style",
    requirements: [
      "One clear, identifiable object only",
      "Neutral or white background",
      "Realistic photographic style (not illustration)",
      "No text, labels, or watermarks",
      "No logos or brand identifiers",
      "No people or human figures",
      "Object must clearly represent the vocabulary word",
    ],
  },
  validation: {
    autoRegenerate: true,
    maxRetries: 3,
    fallbackBehavior: "use generic category image",
  },
  suitability: {
    targetAudience: "beginner language learners",
    clarity: "high - object must be immediately recognizable",
    context: "educational vocabulary learning",
  },
};
