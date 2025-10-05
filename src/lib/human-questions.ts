export interface HumanQuestion {
  id: string // Unique identifier for each question
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
    id: 'adaptability-schedule',
    stepNumber: 1,
    type: 'forced-choice',
    question: "How do you typically handle unexpected changes in your schedule?",
    choices: [
      "I adapt quickly and find alternative solutions",
      "I feel stressed but manage to adjust over time", 
      "I prefer to stick to my original plan and find it hard to change",
      "I seek advice from others to decide the best course of action"
    ]
  },
  {
    id: 'team-role-preference',
    stepNumber: 2,
    type: 'forced-choice',
    question: "When working in a team, what role do you naturally assume?",
    choices: [
      "Leader: I take charge and guide the team towards goals",
      "Facilitator: I ensure smooth communication and collaboration",
      "Contributor: I focus on completing my assigned tasks efficiently",
      "Observer: I prefer to stay in the background and support when needed"
    ]
  },
  {
    id: 'problem-solving-approach',
    stepNumber: 3,
    type: 'forced-choice',
    question: "Which statement best describes your approach to problem-solving?",
    choices: [
      "I rely on logical analysis and data to find solutions",
      "I trust my intuition and past experiences to guide me",
      "I brainstorm creatively and consider unconventional ideas",
      "I consult with others to gather diverse perspectives before deciding"
    ]
  },
  {
    id: 'bag-contents-scenario',
    stepNumber: 4,
    type: 'scenario',
    context: "You reach for your phone to snap a photo of the impressive installation ahead. As you back up to frame the perfect shot, you suddenly trip, dropping your bag and scattering its contents everywhere!",
    question: "What ends up falling out?",
    placeholder: "Your Response...",
  },
  {
    id: 'word-association-simultaneous',
    stepNumber: 5,
    type: 'word-association',
    question: "What's the first word that comes to mind?",
    context: "Simultaneous",
    placeholder: "Type one word...",
    characterLimit: 30
  },
  {
    id: 'word-association-randomly',
    stepNumber: 6,
    type: 'word-association',
    question: "What's the first word that comes to mind?",
    context: "Randomly",
    placeholder: "Type one word...",
    characterLimit: 30
  },
  {
    id: 'word-association-ostentatious',
    stepNumber: 7,
    type: 'word-association',
    question: "What's the first word that comes to mind?",
    context: "Ostentatious",
    placeholder: "Type one word...",
    characterLimit: 30
  },
  {
    id: 'image-description-clouds',
    stepNumber: 8,
    type: 'image-description',
    question: "Describe the following image in < 150 characters.",
    imageUrl: '/clouds.png', // You'll need to add these images
    characterLimit: 150,
    placeholder: "Your Response...",
  },
  {
    id: 'word-combination-telescope-sandwich-melancholy',
    stepNumber: 9,
    type: 'word-combination',
    question: "Create a sentence using all three words:",
    requiredWords: ['telescope', 'sandwich', 'melancholy'],
    placeholder: "Write a sentence using all three words...",
    characterLimit: 200
  },
  {
    id: 'word-combination-bicycle-thunderstorm-nostalgia',
    stepNumber: 10,
    type: 'word-combination',
    question: "Create a sentence using all three words:",
    requiredWords: ['bicycle', 'thunderstorm', 'nostalgia'],
    placeholder: "Write a sentence using all three words...",
    characterLimit: 200
  },
  {
    id: 'word-combination-library-clockwork-whimsical',
    stepNumber: 11,
    type: 'word-combination',
    question: "Create a sentence using all three words:",
    requiredWords: ['library', 'clockwork', 'whimsical'],
    placeholder: "Write a sentence using all three words...",
    characterLimit: 200
  },
  {
    id: 'coffee-shop-scenario',
    stepNumber: 12,
    type: 'scenario',
    question: "How would you handle this?",
    context: "You're at a coffee shop and overhear someone loudly discussing very personal details on their phone. Everyone around looks uncomfortable.",
    placeholder: "Your response...",
    characterLimit: 150,
    minCharacterLength: 30
  },
  {
    id: 'shape-sorting-task',
    stepNumber: 13,
    type: 'shape-sorting',
    question: "Sort the shapes into 3 categories",
    context: "Drag and drop the 9 shapes below into the 3 categories. Each shape has different properties: color (red, blue, green), shape (circle, square, triangle), and border (with or without border). Organize them however makes sense to you.",
  },
  {
    id: 'shape-ordering-task',
    stepNumber: 14,
    type: 'shape-ordering',
    question: "Order these shapes",
    context: "You are presented with 9 unique shapes. Drag them into the sequence row below in whatever order you believe is best. There is no right or wrong answer.",
  },
  {
    id: 'bubble-popper-task',
    stepNumber: 15,
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

