export interface ImageValidationRules {
  singleObject: boolean;
  neutralBackground: boolean;
  realisticStyle: boolean;
  noText: boolean;
  noLogos: boolean;
  noPeople: boolean;
  boundToWord: boolean;
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

const NEGATIVE_KEYWORDS = [
  "text",
  "logo",
  "watermark",
  "cartoon",
  "illustration",
  "drawing",
  "clipart",
  "meme",
  "collage",
];

export function generateImageUrlFromWhitelistPrompt(imagePrompt: string): string {
  if (!imagePrompt || imagePrompt.trim() === "") {
    return "";
  }
  
  const cleanPrompt = imagePrompt
    .toLowerCase()
    .replace(/on white background/gi, "")
    .replace(/on background/gi, "")
    .replace(/white background/gi, "")
    .trim();
  
  const searchQuery = encodeURIComponent(cleanPrompt);
  return `https://source.unsplash.com/400x400/?${searchQuery}`;
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
  
  if (containsBlockedContent(imageUrl)) {
    issues.push("Image may contain blocked content (text, logos, or cartoons)");
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

function containsBlockedContent(imageUrl: string): boolean {
  const urlLower = imageUrl.toLowerCase();
  
  for (const keyword of NEGATIVE_KEYWORDS) {
    if (urlLower.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

export const IMAGE_GENERATION_GUIDELINES = {
  source: "whitelist.vocab.json ONLY",
  rules: [
    "ONLY use image_prompt field from whitelist items",
    "NEVER generate or create custom prompts",
    "Skip items if image_prompt is missing",
    "All images must match the vocabulary word exactly",
  ],
  prompt: {
    structure: "Use image_prompt from whitelist item directly",
    requirements: [
      "One clear, identifiable object only",
      "Neutral or white background",
      "Realistic photographic style (not illustration)",
      "No text, labels, or watermarks",
      "No logos or brand identifiers",
      "Object must clearly represent the vocabulary word",
    ],
  },
  validation: {
    autoRegenerate: false,
    skipOnMissing: true,
    strictWhitelistEnforcement: true,
  },
  suitability: {
    targetAudience: "beginner language learners",
    clarity: "high - object must be immediately recognizable",
    context: "educational vocabulary learning",
  },
};
