export interface HumanQuestion {
  stepNumber: number
  type: 'open-ended' | 'word-association' | 'image-description' | 'forced-choice' | 'scenario' | 'word-combination' | 'shape-sorting' | 'shape-ordering' | 'bubble-popper'
  question: string
  context?: string      
  imageUrl?: string
  choices?: string[]
  characterLimit?: number
  minCharacterLength?: number // Minimum character threshold for paragraph-length inputs
  placeholder?: string
  requiredWords?: string[] // For word-combination questions
}

export const HUMAN_QUESTIONS: HumanQuestion[] = [
  {
    stepNumber: 1,
    type: 'scenario',
    context: "You reach for your phone to snap a photo of the impressive installation ahead. As you back up to frame the perfect shot, you suddenly trip, dropping your bag and scattering its contents everywhere!",
    question: "What ends up falling out?",
    placeholder: "Your Response...",
  },
  {
    stepNumber: 2,
    type: 'word-association',
    question: "What's the first word that comes to mind?",
    context: "Simultaneous",
    placeholder: "Type one word...",
    characterLimit: 30
  },
  {
    stepNumber: 3,
    type: 'word-association',
    question: "What's the first word that comes to mind?",
    context: "Randomly",
    placeholder: "Type one word...",
    characterLimit: 30
  },
  {
    stepNumber: 4,
    type: 'word-association',
    question: "What's the first word that comes to mind?",
    context: "Ostentatious",
    placeholder: "Type one word...",
    characterLimit: 30
  },
  {
    stepNumber: 5,
    type: 'image-description',
    question: "Describe the following image in < 150 characters.",
    imageUrl: '/clouds.png', // You'll need to add these images
    characterLimit: 150,
    placeholder: "Your Response...",
  },
  {
    stepNumber: 6,
    type: 'word-combination',
    question: "Create a sentence using all three words:",
    requiredWords: ['telescope', 'sandwich', 'melancholy'],
    placeholder: "Write a sentence using all three words...",
    characterLimit: 200
  },
  {
    stepNumber: 7,
    type: 'word-combination',
    question: "Create a sentence using all three words:",
    requiredWords: ['bicycle', 'thunderstorm', 'nostalgia'],
    placeholder: "Write a sentence using all three words...",
    characterLimit: 200
  },
  {
    stepNumber: 8,
    type: 'word-combination',
    question: "Create a sentence using all three words:",
    requiredWords: ['library', 'clockwork', 'whimsical'],
    placeholder: "Write a sentence using all three words...",
    characterLimit: 200
  },
  {
    stepNumber: 9,
    type: 'scenario',
    question: "How would you handle this?",
    context: "You're at a coffee shop and overhear someone loudly discussing very personal details on their phone. Everyone around looks uncomfortable.",
    placeholder: "Your response...",
    characterLimit: 150,
    minCharacterLength: 30
  },
  {
    stepNumber: 10,
    type: 'shape-sorting',
    question: "Sort the shapes into 3 categories",
    context: "Drag and drop the 9 shapes below into the 3 categories. Each shape has different properties: color (red, blue, green), shape (circle, square, triangle), and border (with or without border). Organize them however makes sense to you.",
  },
  {
    stepNumber: 11,
    type: 'shape-ordering',
    question: "Order these shapes",
    context: "You are presented with 9 unique shapes. Drag them into the sequence row below in whatever order you believe is best. There is no right or wrong answer.",
  },
  {
    stepNumber: 12,
    type: 'bubble-popper',
    question: "Pop the bubbles",
    context: "Take as much or as little time as you'd like. There is no goal. End the game when you're ready.",
  }
]

// Archetype definitions for Human Assessment
export const HUMAN_ARCHETYPES = {
  'The Floater': {
    tagline: 'You embrace spontaneity and unpredictability.',
    emoji: '🎈',
    traits: ['high_spontaneity', 'low_planning', 'creative']
  },
  'The Anchor': {
    tagline: 'You\'re steady, consistent, and reliably human.',
    emoji: '⚓',
    traits: ['consistent', 'grounded', 'authentic']
  },
  'The Planner': {
    tagline: 'You structure your thoughts but with human warmth.',
    emoji: '📋',
    traits: ['organized', 'thoughtful', 'deliberate']
  },
  'The Creative': {
    tagline: 'Your mind goes to unexpected, original places.',
    emoji: '🎨',
    traits: ['highly_creative', 'unpredictable', 'original']
  },
  'The Pragmatist': {
    tagline: 'You cut through noise with practical, real-world logic.',
    emoji: '🔧',
    traits: ['practical', 'context_aware', 'efficient']
  },
  'The Comedian': {
    tagline: 'You find humor where others find routine.',
    emoji: '😄',
    traits: ['humorous', 'witty', 'playful']
  },
  'The Philosopher': {
    tagline: 'You see deeper meaning in simple moments.',
    emoji: '🤔',
    traits: ['reflective', 'deep', 'contemplative']
  },
  'The Rebel': {
    tagline: 'You question norms and embrace the unconventional.',
    emoji: '🔥',
    traits: ['non_conformist', 'bold', 'challenging']
  }
}

// Validation function for word-combination questions
export function validateWordCombination(response: string, requiredWords: string[]): boolean {
  if (!response || !requiredWords) return false
  
  const lowercaseResponse = response.toLowerCase()
  return requiredWords.every(word => 
    lowercaseResponse.includes(word.toLowerCase())
  )
}

