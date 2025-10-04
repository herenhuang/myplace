import { QuizConfig } from './types'

export const vacationStyleQuiz: QuizConfig = {
  id: 'vacation-style',
  title: 'What\'s Your Vacation Style?',
  description: 'Discover how you really like to travel!',
  
  theme: {
    primaryColor: '#00b4d8',
    secondaryColor: '#90e0ef',
    backgroundColor: '#f8f9fa',
    textColor: '#212529',
    backgroundImage: '/quiz/vacation-style/background.png'
  },
  
  questions: [
    {
      text: 'Your ideal vacation starts with...',
      options: [
        { label: '🗓️ A detailed itinerary planned months ahead', value: 'planner' },
        { label: '✈️ A one-way ticket and good vibes', value: 'spontaneous' },
        { label: '📚 Research on the best local spots', value: 'researcher' },
        { label: '🤝 Asking locals where they hang out', value: 'social' }
      ]
    },
    {
      text: 'When choosing accommodation, you prioritize...',
      options: [
        { label: '⭐ Reviews and ratings', value: 'safe' },
        { label: '💰 Best bang for your buck', value: 'budget' },
        { label: '✨ Unique and Instagram-worthy', value: 'aesthetic' },
        { label: '📍 Central location near everything', value: 'convenient' }
      ]
    },
    {
      text: 'Your perfect day involves...',
      options: [
        { label: '🏛️ Hitting all the must-see attractions', value: 'tourist' },
        { label: '🏖️ Chilling by the pool with a book', value: 'relaxer' },
        { label: '🥾 Finding hidden gems off the beaten path', value: 'explorer' },
        { label: '🍽️ Trying every local food spot', value: 'foodie' }
      ]
    },
    {
      text: 'Something goes wrong (flight delay, closed restaurant). You...',
      options: [
        { label: '😤 Get frustrated - this ruins the plan', value: 'stressed' },
        { label: '🤷 Roll with it - it\'s an adventure', value: 'flexible' },
        { label: '📱 Immediately find a backup option', value: 'solver' },
        { label: '😊 See it as a chance to discover something new', value: 'optimist' }
      ]
    },
    {
      text: 'You pack your suitcase...',
      options: [
        { label: '📋 Days ahead with a checklist', value: 'organized' },
        { label: '⏰ The night before, last minute', value: 'procrastinator' },
        { label: '🎒 Light - you can buy what you need', value: 'minimalist' },
        { label: '👗 Everything you might possibly need', value: 'overpacker' }
      ]
    },
    {
      text: 'Your travel buddy wants to change plans mid-trip. You...',
      options: [
        { label: '🤔 Need a good reason to deviate', value: 'cautious' },
        { label: '✅ Sure! I\'m down for anything', value: 'easygoing' },
        { label: '💡 Suggest a compromise', value: 'diplomatic' },
        { label: '📊 Weigh the pros and cons first', value: 'analytical' }
      ]
    }
  ],
  
  personalities: [
    {
      id: 'the-planner',
      name: 'The Planner',
      tagline: 'Organized, prepared, efficient',
      image: '/quiz/vacation-style/the-planner.png',
      description: 'You love having everything figured out in advance. Your trips are well-researched, perfectly timed, and nothing is left to chance.'
    },
    {
      id: 'the-adventurer',
      name: 'The Adventurer',
      tagline: 'Spontaneous, flexible, bold',
      image: '/quiz/vacation-style/the-adventurer.png',
      description: 'You thrive on spontaneity and unexpected experiences. For you, the best moments are the unplanned ones.'
    },
    {
      id: 'the-relaxer',
      name: 'The Relaxer',
      tagline: 'Chill, easygoing, present',
      image: '/quiz/vacation-style/the-relaxer.png',
      description: 'Vacation means truly unplugging. You\'re all about rest, relaxation, and taking it slow.'
    },
    {
      id: 'the-explorer',
      name: 'The Explorer',
      tagline: 'Curious, thorough, authentic',
      image: '/quiz/vacation-style/the-explorer.png',
      description: 'You want to really understand a place - its culture, hidden gems, and local secrets. Tourist traps aren\'t your thing.'
    }
  ],
  
  scoring: {
    questions: [
      {
        questionIndex: 0,
        rules: {
          'planner': { 'the-planner': 3, 'the-explorer': 1 },
          'spontaneous': { 'the-adventurer': 3, 'the-relaxer': 2 },
          'researcher': { 'the-explorer': 3, 'the-planner': 2 },
          'social': { 'the-adventurer': 2, 'the-explorer': 3 }
        }
      },
      {
        questionIndex: 1,
        rules: {
          'safe': { 'the-planner': 3, 'the-explorer': 1 },
          'budget': { 'the-adventurer': 2, 'the-planner': 2 },
          'aesthetic': { 'the-adventurer': 3, 'the-relaxer': 2 },
          'convenient': { 'the-planner': 3, 'the-explorer': 1 }
        }
      },
      {
        questionIndex: 2,
        rules: {
          'tourist': { 'the-planner': 3, 'the-explorer': 0 },
          'relaxer': { 'the-relaxer': 3, 'the-adventurer': 0 },
          'explorer': { 'the-explorer': 3, 'the-adventurer': 2 },
          'foodie': { 'the-explorer': 3, 'the-adventurer': 2 }
        }
      },
      {
        questionIndex: 3,
        rules: {
          'stressed': { 'the-planner': 3, 'the-relaxer': 0 },
          'flexible': { 'the-adventurer': 3, 'the-relaxer': 2 },
          'solver': { 'the-planner': 3, 'the-explorer': 2 },
          'optimist': { 'the-adventurer': 3, 'the-relaxer': 2 }
        }
      },
      {
        questionIndex: 4,
        rules: {
          'organized': { 'the-planner': 3, 'the-explorer': 1 },
          'procrastinator': { 'the-adventurer': 3, 'the-relaxer': 2 },
          'minimalist': { 'the-adventurer': 3, 'the-explorer': 2 },
          'overpacker': { 'the-planner': 3, 'the-relaxer': 1 }
        }
      },
      {
        questionIndex: 5,
        rules: {
          'cautious': { 'the-planner': 3, 'the-explorer': 1 },
          'easygoing': { 'the-relaxer': 3, 'the-adventurer': 2 },
          'diplomatic': { 'the-explorer': 2, 'the-planner': 2 },
          'analytical': { 'the-planner': 3, 'the-explorer': 2 }
        }
      }
    ]
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a travel expert. The user matched with {{personality}} based on their vacation preferences. 

Write a fun, engaging 250-word explanation that:
1. Validates their travel style
2. Connects 2-3 of their specific quiz answers to this personality
3. Gives 1-2 practical tips for their next trip
4. Includes a fun destination recommendation

Be warm, personal, and encouraging. Format as markdown with sections.

Their answers:
{{answers}}`
  }
}

