// Question bank for the Human Assessment
// Each question is designed to elicit responses that differentiate human from AI behavior

export interface HumanQuestion {
  stepNumber: number
  type: 'open-ended' | 'word-association' | 'image-description' | 'forced-choice' | 'scenario'
  question: string
  context?: string // Additional context or scenario description
  imageUrl?: string // For image description questions
  choices?: string[] // For multiple choice or forced choice questions
  characterLimit?: number // For limited character responses
  placeholder?: string
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
    type: 'scenario',
    question: "How do you respond?",
    context: "A stranger approaches you on the street and asks: 'Excuse me, do you have the time?' But they're wearing a watch.",
    placeholder: "Your Response...",
  },
  {
    stepNumber: 7,
    type: 'forced-choice',
    question: "Which would you rather experience?",
    choices: [
      "Win the lottery but lose all your memories from the past year",
      "Keep your memories but never win anything by chance again"
    ]
  },
  {
    stepNumber: 8,
    type: 'scenario',
    question: "What do you do?",
    context: "You're in a crowded elevator. Someone farts. Nobody acknowledges it.",
    placeholder: "Your Response...",
  },
  {
    stepNumber: 9,
    type: 'open-ended',
    question: "Complete this thought:",
    context: "The thing about reality is...",
    placeholder: "Your Response...",
  }
]

// AI behavioral markers to detect
export const AI_MARKERS = {
  tooFormal: [
    'I would',
    'I apologize',
    'thank you for',
    'it is important to',
    'in my experience',
    'as an AI'
  ],
  tooComprehensive: [
    'firstly',
    'secondly',
    'in conclusion',
    'furthermore',
    'additionally',
    'moreover'
  ],
  genericPoliteness: [
    'please note',
    'kindly',
    'I hope this helps',
    'feel free to',
    'don\'t hesitate to'
  ],
  overExplanation: [
    'this is because',
    'the reason being',
    'to clarify',
    'in other words',
    'what I mean is'
  ]
}

// Human behavioral markers to detect
export const HUMAN_MARKERS = {
  casual: ['lol', 'haha', 'lmao', 'omg', 'tbh', 'ngl', 'fr', 'bruh'],
  emotional: ['!', '...', '???', '!!', 'ugh', 'yikes', 'oof', 'damn'],
  personal: ['my', 'I\'d', 'I\'m', 'honestly', 'probably', 'maybe', 'idk'],
  colloquial: ['gonna', 'wanna', 'kinda', 'sorta', 'yeah', 'nah', 'dunno']
}

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

