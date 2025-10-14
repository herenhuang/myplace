/**
 * Quiz Metadata for AI Recommendations
 *
 * Provides context about each quiz to help AI generate personalized recommendations
 */

export interface QuizMetadata {
  id: string
  title: string
  description: string
  theme: string
  emotionalContext: string[]
  typicalUseCase: string
  keyDimensions: string[]
}

export const quizMetadata: Record<string, QuizMetadata> = {
  'feedback-style': {
    id: 'feedback-style',
    title: "What's Your Feedback Style?",
    description: 'Discover how you really give and receive feedback at work',
    theme: 'workplace communication',
    emotionalContext: ['professional growth', 'communication clarity', 'workplace relationships'],
    typicalUseCase: 'Understanding communication patterns in professional settings',
    keyDimensions: ['directness', 'empathy', 'timing', 'vulnerability', 'coaching approach']
  },

  'manager-style': {
    id: 'manager-style',
    title: "What's Your Manager Style?",
    description: 'Discover how you really lead and what makes you effective',
    theme: 'leadership and management',
    emotionalContext: ['leadership identity', 'team dynamics', 'decision-making'],
    typicalUseCase: 'Exploring leadership approach and management philosophy',
    keyDimensions: ['decision-making', 'people development', 'communication', 'planning', 'crisis handling']
  },

  'ai-model': {
    id: 'ai-model',
    title: 'Which AI Model Are You?',
    description: 'Discover your work personality through AI model archetypes',
    theme: 'work personality and thinking style',
    emotionalContext: ['self-awareness', 'work identity', 'cognitive style'],
    typicalUseCase: 'Understanding how you think and work',
    keyDimensions: ['processing style', 'creativity', 'attention to detail', 'collaboration', 'speed vs quality']
  },

  'crush-quiz': {
    id: 'crush-quiz',
    title: 'Do I Have a Crush?',
    description: 'The most honest 8 minutes of your feelings',
    theme: 'romantic feelings clarity',
    emotionalContext: ['confusion', 'curiosity', 'romantic interest', 'self-discovery'],
    typicalUseCase: 'Figuring out if feelings are platonic or romantic',
    keyDimensions: ['physical response', 'jealousy', 'mental real estate', 'future imagination', 'vulnerability']
  },

  'flirting-style': {
    id: 'flirting-style',
    title: "What's Your Flirting Style?",
    description: 'Find out how you really show interest when you\'re into someone',
    theme: 'romantic expression',
    emotionalContext: ['attraction', 'confidence', 'risk-taking', 'self-expression'],
    typicalUseCase: 'Understanding how you communicate romantic interest',
    keyDimensions: ['boldness', 'directness', 'physical vs verbal', 'vulnerability', 'risk tolerance']
  },

  'how-do-you-fall': {
    id: 'how-do-you-fall',
    title: 'How Do You Fall in Love?',
    description: 'Discover your patterns in falling for someone',
    theme: 'relationship patterns and emotional development',
    emotionalContext: ['love patterns', 'emotional awareness', 'relationship history'],
    typicalUseCase: 'Understanding deeper romantic attachment patterns',
    keyDimensions: ['pace', 'emotional openness', 'trust building', 'intimacy progression', 'vulnerability timing']
  },

  'vacation-style': {
    id: 'vacation-style',
    title: "What's Your Vacation Style?",
    description: 'Discover how you really like to travel and recharge',
    theme: 'leisure and self-care',
    emotionalContext: ['rest', 'adventure', 'self-care', 'lifestyle preferences'],
    typicalUseCase: 'Understanding how you recharge and find joy',
    keyDimensions: ['activity level', 'planning vs spontaneity', 'social vs solo', 'comfort vs adventure']
  },

  'wednesday-bouncer-quiz': {
    id: 'wednesday-bouncer-quiz',
    title: 'Wednesday Vibe Check',
    description: 'Tell us about yourself. We\'re listening.',
    theme: 'event screening and vibe assessment',
    emotionalContext: ['authenticity', 'enthusiasm', 'curiosity', 'self-expression'],
    typicalUseCase: 'Evaluating fit for intimate gatherings and events',
    keyDimensions: ['genuine enthusiasm', 'authenticity', 'vibe alignment', 'interestingness', 'contribution']
  },

  'relationship-communication': {
    id: 'relationship-communication',
    title: "What's Your Relationship Communication Style?",
    description: 'Discover how you really talk, listen, and connect when you\'re dating someone.',
    theme: 'relationship communication',
    emotionalContext: ['relationship dynamics', 'communication patterns', 'vulnerability', 'emotional intimacy'],
    typicalUseCase: 'Understanding communication patterns in romantic relationships',
    keyDimensions: ['openness', 'directness', 'listening style', 'conflict handling', 'emotional sharing']
  },

  'first-date-energy': {
    id: 'first-date-energy',
    title: "What's Your First Date Energy?",
    description: 'Discover how you really show up when you\'re trying to make a good impression on a date.',
    theme: 'first date behavior and impression',
    emotionalContext: ['dating anxiety', 'impression management', 'authenticity', 'first impressions'],
    typicalUseCase: 'Understanding dating behavior and first date dynamics',
    keyDimensions: ['confidence level', 'nervousness', 'authenticity', 'conversation style', 'openness']
  },

  'dating-texting-style': {
    id: 'dating-texting-style',
    title: "What's Your Dating Texting Style?",
    description: 'Discover how you really text when you like someone romantically.',
    theme: 'dating communication via text',
    emotionalContext: ['dating anxiety', 'messaging patterns', 'interest signaling', 'digital communication'],
    typicalUseCase: 'Understanding texting behavior when romantically interested',
    keyDimensions: ['response timing', 'message style', 'anxiety management', 'interest expression', 'texting frequency']
  },

  'pm-pressure-style': {
    id: 'pm-pressure-style',
    title: "What's Your PM Pressure Style?",
    description: 'Discover how you really handle competing demands, tight deadlines, and high-stakes decisions.',
    theme: 'product management under pressure',
    emotionalContext: ['stress management', 'decision-making under pressure', 'stakeholder conflict'],
    typicalUseCase: 'Understanding how you handle high-pressure product situations',
    keyDimensions: ['conflict resolution', 'deadline negotiation', 'prioritization', 'stakeholder management', 'stress response']
  },

  'product-decision-style': {
    id: 'product-decision-style',
    title: "What's Your Product Decision Style?",
    description: 'Discover how you actually make product calls - data, gut, users, or something else.',
    theme: 'product decision-making approach',
    emotionalContext: ['decision confidence', 'data vs intuition', 'user-centricity', 'product vision'],
    typicalUseCase: 'Understanding product decision-making philosophy',
    keyDimensions: ['data reliance', 'intuition', 'user research', 'vision adherence', 'risk tolerance']
  },

  'pm-tradeoff-style': {
    id: 'pm-tradeoff-style',
    title: "What's Your PM Trade-off Style?",
    description: 'Discover how you navigate the impossible choices between speed, quality, scope, and stakeholders.',
    theme: 'product trade-off navigation',
    emotionalContext: ['prioritization', 'constraint management', 'stakeholder balance', 'decision frameworks'],
    typicalUseCase: 'Understanding approach to product trade-offs and prioritization',
    keyDimensions: ['speed vs quality', 'breadth vs depth', 'user segments', 'technical vs business', 'scope management']
  }
}

/**
 * Get metadata for a specific quiz
 */
export function getQuizMetadata(quizId: string): QuizMetadata | null {
  return quizMetadata[quizId] || null
}

/**
 * Get all available quiz metadata as array
 */
export function getAllQuizMetadata(): QuizMetadata[] {
  return Object.values(quizMetadata)
}

/**
 * Get quiz metadata formatted for AI prompt
 */
export function formatQuizMetadataForAI(quizIds?: string[]): string {
  const quizzesToFormat = quizIds
    ? quizIds.map(id => quizMetadata[id]).filter(Boolean)
    : Object.values(quizMetadata)

  return quizzesToFormat
    .map(q => `- ${q.title} (${q.id}): ${q.description}\n  Theme: ${q.theme}\n  Best for: ${q.typicalUseCase}`)
    .join('\n\n')
}
