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
    backgroundImage: 'url(/quiz/crush-quiz/crush-quiz-background.webp), linear-gradient(135deg, #ff6b9d 0%, #c06c84 50%, #f67280 100%)'
  },
  {
    id: 'flirting-style',
    title: "What's Your Flirting Style?",
    description: 'Find out how you really show interest when you\'re into someone',
    category: 'love',
    route: '/quiz/flirting-style',
    backgroundImage: 'url(/quiz/flirting-style/background.jpg), linear-gradient(135deg, #ff758c 0%, #ff7eb3 50%, #fa709a 100%)'
  },
  {
    id: 'how-do-you-fall',
    title: 'How Do You Fall in Love?',
    description: 'Discover your patterns in falling for someone',
    category: 'love',
    route: '/quiz/how-do-you-fall',
    backgroundImage: 'url(/quiz/how-do-you-fall/background.jpg), linear-gradient(135deg,rgb(255, 164, 216) 0%,rgb(255, 236, 125) 50%,rgb(255, 199, 177) 100%)'
  },
  {
    id: 'dating-texting-style',
    title: "What's Your Dating Texting Style?",
    description: 'Discover how you communicate when you\'re interested',
    category: 'love',
    route: '/quiz/dating-texting-style',
    backgroundImage: 'url(/quiz/dating-texting-style/background.jpg), linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ff9a9e 100%)'
  },
  {
    id: 'first-date-energy',
    title: "What's Your First Date Energy?",
    description: 'Find out what vibe you bring to first dates',
    category: 'love',
    route: '/quiz/first-date-energy',
    backgroundImage: 'url(/quiz/first-date-energy/background.jpg), linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)'
  },
  {
    id: 'relationship-communication',
    title: "What's Your Relationship Communication Style?",
    description: 'Understand how you express yourself in relationships',
    category: 'love',
    route: '/quiz/relationship-communication',
    backgroundImage: 'url(/quiz/relationship-communication/background.jpg), linear-gradient(135deg, #ffd1ff 0%, #ff9a9e 50%, #fecfef 100%)'
  },

  // WORK QUIZZES
  {
    id: 'feedback-style',
    title: "What's Your Feedback Style?",
    description: 'Discover how you really give and receive feedback at work',
    category: 'work',
    route: '/quiz/feedback-style',
    backgroundImage: 'url(/quiz/feedback-style/background.jpg), linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
  },
  {
    id: 'manager-style',
    title: "What's Your Manager Style?",
    description: 'Discover how you really lead and what makes you effective',
    category: 'work',
    route: '/quiz/manager-style',
    backgroundImage: 'url(/quiz/manager-style/background.jpg), linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)'
  },
  {
    id: 'ai-model',
    title: 'Which AI Model Are You?',
    description: 'Discover your work personality through AI model archetypes',
    category: 'work',
    route: '/quiz/ai-model',
    backgroundImage: 'url(/quiz/ai-model/background.jpg), linear-gradient(135deg, #ff6b35 0%, #ffa500 50%, #ffcc70 100%)'
  },
  {
    id: 'pm-pressure-style',
    title: "What's Your PM Under Pressure Style?",
    description: 'How do you handle high-stakes product decisions?',
    category: 'work',
    route: '/quiz/pm-pressure-style',
    backgroundImage: 'url(/quiz/pm-pressure-style/background.jpg), linear-gradient(135deg, #fa8bff 0%, #2bd2ff 50%, #2bff88 100%)'
  },
  {
    id: 'pm-tradeoff-style',
    title: "What's Your PM Tradeoff Style?",
    description: 'Discover how you navigate product tradeoffs',
    category: 'work',
    route: '/quiz/pm-tradeoff-style',
    backgroundImage: 'url(/quiz/pm-tradeoff-style/background.jpg), linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #fbc2eb 100%)'
  },
  {
    id: 'product-decision-style',
    title: "What's Your Product Decision Style?",
    description: 'How do you make product choices?',
    category: 'work',
    route: '/quiz/product-decision-style',
    backgroundImage: 'url(/quiz/product-decision-style/background.jpg), linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #a8edea 100%)'
  },
  {
    id: 'elevate',
    title: 'What Kind of Elevate Attendee Are You?',
    description: 'Navigate a day at Elevate and discover your style',
    category: 'work',
    route: '/quiz/elevate',
    backgroundImage: 'url(/elevate/orange.png), linear-gradient(135deg, #ff9a56 0%, #ffcc33 50%, #ff6b35 100%)'
  },

  // LIFE QUIZZES
  {
    id: 'wednesday-bouncer-quiz',
    title: 'Wednesday Vibe Check',
    description: 'Tell us about yourself. We\'re listening.',
    category: 'life',
    route: '/quiz/wednesday-bouncer-quiz',
    backgroundImage: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)'
  },
  {
    id: 'vacation-style',
    title: "What's Your Vacation Style?",
    description: 'Discover how you really like to travel and recharge',
    category: 'life',
    route: '/quiz/vacation-style',
    backgroundImage: 'url(/quiz/vacation-style/background.jpg), linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 50%, #c2e9fb 100%)'
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
