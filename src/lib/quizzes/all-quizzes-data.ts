/**
 * All Quizzes Data
 * Central repository for all quiz metadata used in the All Quizzes page
 */

export interface QuizItem {
  id: string
  title: string
  description: string
  category: 'life' | 'work' | 'love'
  route: string
  backgroundImage: string
}

export const ALL_QUIZZES: QuizItem[] = [
  // LOVE QUIZZES
  {
    id: 'crush-quiz',
    title: 'Do I Have a Crush?',
    description: 'The most honest 8 minutes of your feelings',
    category: 'love',
    route: '/quiz/crush-quiz',
    backgroundImage: 'url(/quiz/crush-quiz/background.jpg)'
  },
  {
    id: 'flirting-style',
    title: "What's Your Flirting Style?",
    description: 'Find out how you really show interest when you\'re into someone',
    category: 'love',
    route: '/quiz/flirting-style',
    backgroundImage: 'url(/quiz/flirting-style/background.jpg)'
  },
  {
    id: 'how-do-you-fall',
    title: 'How Do You Fall in Love?',
    description: 'Discover your patterns in falling for someone',
    category: 'love',
    route: '/quiz/how-do-you-fall',
    backgroundImage: 'url(/quiz/how-do-you-fall/background.jpg)'
  },
  {
    id: 'dating-texting-style',
    title: "What's Your Dating Texting Style?",
    description: 'Discover how you communicate when you\'re interested',
    category: 'love',
    route: '/quiz/dating-texting-style',
    backgroundImage: 'url(/quiz/dating-texting-style/background.jpg)'
  },
  {
    id: 'first-date-energy',
    title: "What's Your First Date Energy?",
    description: 'Find out what vibe you bring to first dates',
    category: 'love',
    route: '/quiz/first-date-energy',
    backgroundImage: 'url(/quiz/first-date-energy/background.jpg)'
  },
  {
    id: 'relationship-communication',
    title: "What's Your Relationship Communication Style?",
    description: 'Understand how you express yourself in relationships',
    category: 'love',
    route: '/quiz/relationship-communication',
    backgroundImage: 'url(/quiz/relationship-communication/background.jpg)'
  },

  // WORK QUIZZES
  {
    id: 'feedback-style',
    title: "What's Your Feedback Style?",
    description: 'Discover how you really give and receive feedback at work',
    category: 'work',
    route: '/quiz/feedback-style',
    backgroundImage: 'url(/quiz/feedback-style/background.jpg)'
  },
  {
    id: 'manager-style',
    title: "What's Your Manager Style?",
    description: 'Discover how you really lead and what makes you effective',
    category: 'work',
    route: '/quiz/manager-style',
    backgroundImage: 'url(/quiz/manager-style/background.jpg)'
  },
  {
    id: 'ai-model',
    title: 'Which AI Model Are You?',
    description: 'Discover your work personality through AI model archetypes',
    category: 'work',
    route: '/quiz/ai-model',
    backgroundImage: 'url(/quiz/ai-model/background.jpg)'
  },
  {
    id: 'pm-pressure-style',
    title: "What's Your PM Under Pressure Style?",
    description: 'How do you handle high-stakes product decisions?',
    category: 'work',
    route: '/quiz/pm-pressure-style',
    backgroundImage: 'url(/quiz/pm-pressure-style/background.jpg)'
  },
  {
    id: 'pm-tradeoff-style',
    title: "What's Your PM Tradeoff Style?",
    description: 'Discover how you navigate product tradeoffs',
    category: 'work',
    route: '/quiz/pm-tradeoff-style',
    backgroundImage: 'url(/quiz/pm-tradeoff-style/background.jpg)'
  },
  {
    id: 'product-decision-style',
    title: "What's Your Product Decision Style?",
    description: 'How do you make product choices?',
    category: 'work',
    route: '/quiz/product-decision-style',
    backgroundImage: 'url(/quiz/product-decision-style/background.jpg)'
  },
  {
    id: 'elevate',
    title: 'What Kind of Elevate Attendee Are You?',
    description: 'Discover your conference style',
    category: 'work',
    route: '/elevate',
    backgroundImage: 'linear-gradient(135deg, #ff9a56 0%, #ffcc33 50%, #ff6b35 100%)'
  },

  // LIFE QUIZZES
  {
    id: 'vacation-style',
    title: "What's Your Vacation Style?",
    description: 'Discover how you really like to travel and recharge',
    category: 'life',
    route: '/quiz/vacation-style',
    backgroundImage: 'url(/quiz/vacation-style/background.jpg)'
  },
  {
    id: 'genshin',
    title: "What's Your Genshin Impact Home Nation?",
    description: 'Discover which Teyvat nation is your true home',
    category: 'life',
    route: '/genshin',
    backgroundImage: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 50%, #667eea 100%)'
  }
]

export type QuizCategory = 'all' | 'life' | 'work' | 'love'

export const QUIZ_CATEGORIES: { value: QuizCategory; label: string }[] = [
  { value: 'all', label: 'All Quizzes' },
  { value: 'life', label: 'Life' },
  { value: 'work', label: 'Work' },
  { value: 'love', label: 'Love' }
]

export function getQuizzesByCategory(category: QuizCategory): QuizItem[] {
  if (category === 'all') {
    return ALL_QUIZZES
  }
  return ALL_QUIZZES.filter(quiz => quiz.category === category)
}
