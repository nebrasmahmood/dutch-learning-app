export interface VocabItem {
  id: string;
  dutch: string;
  english: string;
  imageUrl: string;
}

export interface Section {
  id: string;
  name: string;
  icon: string;
  items: VocabItem[];
}

const fruitImages = {
  apple: "https://images.unsplash.com/photo-1568702846914-96b305d2uj64?w=400",
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
  orange: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400",
  strawberry: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
  grape: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400",
};

const vegetableImages = {
  carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
  tomato: "https://images.unsplash.com/photo-1546470427-f5e9c085e7ff?w=400",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400",
  onion: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400",
  broccoli: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400",
};

const animalImages = {
  dog: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
  cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
  bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400",
  fish: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400",
  horse: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400",
};

const numberImages = {
  one: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
  two: "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?w=400",
  three: "https://images.unsplash.com/photo-1533628635777-112b2239b1c7?w=400",
  four: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400",
  five: "https://images.unsplash.com/photo-1502982899975-893c9cf39028?w=400",
};

export const SECTIONS: Section[] = [
  {
    id: "fruits",
    name: "Fruits",
    icon: "target",
    items: [
      { id: "f1", dutch: "Appel", english: "Apple", imageUrl: fruitImages.apple },
      { id: "f2", dutch: "Banaan", english: "Banana", imageUrl: fruitImages.banana },
      { id: "f3", dutch: "Sinaasappel", english: "Orange", imageUrl: fruitImages.orange },
      { id: "f4", dutch: "Aardbei", english: "Strawberry", imageUrl: fruitImages.strawberry },
      { id: "f5", dutch: "Druif", english: "Grape", imageUrl: fruitImages.grape },
    ],
  },
  {
    id: "vegetables",
    name: "Vegetables",
    icon: "sun",
    items: [
      { id: "v1", dutch: "Wortel", english: "Carrot", imageUrl: vegetableImages.carrot },
      { id: "v2", dutch: "Tomaat", english: "Tomato", imageUrl: vegetableImages.tomato },
      { id: "v3", dutch: "Aardappel", english: "Potato", imageUrl: vegetableImages.potato },
      { id: "v4", dutch: "Ui", english: "Onion", imageUrl: vegetableImages.onion },
      { id: "v5", dutch: "Broccoli", english: "Broccoli", imageUrl: vegetableImages.broccoli },
    ],
  },
  {
    id: "animals",
    name: "Animals",
    icon: "heart",
    items: [
      { id: "a1", dutch: "Hond", english: "Dog", imageUrl: animalImages.dog },
      { id: "a2", dutch: "Kat", english: "Cat", imageUrl: animalImages.cat },
      { id: "a3", dutch: "Vogel", english: "Bird", imageUrl: animalImages.bird },
      { id: "a4", dutch: "Vis", english: "Fish", imageUrl: animalImages.fish },
      { id: "a5", dutch: "Paard", english: "Horse", imageUrl: animalImages.horse },
    ],
  },
  {
    id: "numbers",
    name: "Numbers",
    icon: "hash",
    items: [
      { id: "n1", dutch: "Een", english: "One", imageUrl: numberImages.one },
      { id: "n2", dutch: "Twee", english: "Two", imageUrl: numberImages.two },
      { id: "n3", dutch: "Drie", english: "Three", imageUrl: numberImages.three },
      { id: "n4", dutch: "Vier", english: "Four", imageUrl: numberImages.four },
      { id: "n5", dutch: "Vijf", english: "Five", imageUrl: numberImages.five },
    ],
  },
];

export function getSectionById(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function generateQuizQuestions(section: Section): QuizQuestion[] {
  return section.items.map((item) => {
    const otherItems = section.items.filter((i) => i.id !== item.id);
    const shuffled = [...otherItems].sort(() => Math.random() - 0.5);
    const wrongAnswers = shuffled.slice(0, 2).map((i) => i.dutch);
    const options = [...wrongAnswers, item.dutch].sort(() => Math.random() - 0.5);

    return {
      id: item.id,
      imageUrl: item.imageUrl,
      question: `What is "${item.english}" in Dutch?`,
      correctAnswer: item.dutch,
      options,
    };
  });
}

export interface QuizQuestion {
  id: string;
  imageUrl: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

export function generateExamQuestions(): ExamQuestion[] {
  const allItems = SECTIONS.flatMap((s) => s.items);
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10).map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    question: `What is "${item.english}" in Dutch?`,
    correctAnswer: item.dutch,
  }));
}

export interface ExamQuestion {
  id: string;
  imageUrl: string;
  question: string;
  correctAnswer: string;
}

export function checkSpelling(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (s: string) => s.toLowerCase().trim();
  const user = normalize(userAnswer);
  const correct = normalize(correctAnswer);

  if (user === correct) return true;

  const distance = levenshteinDistance(user, correct);
  return distance <= 2;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export const BADGES = [
  { id: "first_section", name: "First Steps", description: "Complete your first section", icon: "award" },
  { id: "perfect_score", name: "Perfect Score", description: "Get 100% on a quiz", icon: "star" },
  { id: "exam_passed", name: "Exam Master", description: "Pass the final exam", icon: "check-circle" },
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: "trending-up" },
];
