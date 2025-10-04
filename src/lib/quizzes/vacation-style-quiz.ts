import { QuizConfig } from './types'

export const vacationStyleQuiz: QuizConfig = {
  id: 'vacation-style',
  title: 'What\'s Your Vacation Style?',
  description: 'Discover how you really like to travel!',
  type: 'story-matrix',
  
  theme: {
    primaryColor: '#00b4d8',
    secondaryColor: '#90e0ef',
    backgroundColor: '#f8f9fa',
    textColor: '#212529',
    backgroundImage: '/quiz/vacation-style/background.png'
  },
  
  questions: [
    // Question 1 - Opening (no branching)
    {
      id: 'q1',
      text: 'You just booked a spontaneous weekend trip. First thing you do?',
      options: [
        { label: 'Start making a list of must-dos', value: 'plan' },
        { label: 'Text everyone "who wants to join?"', value: 'social' },
        { label: 'Research hidden local spots', value: 'research' }
      ],
      allowCustomInput: true
    },
    
    // BRANCHING TRIO 1: Questions 2-4 (Planning → Adaptation → Execution)
    // Question 2 - Branches based on Q1
    {
      id: 'q2-plan',
      text: 'Your list is getting long. How do you decide what makes the cut?',
      options: [
        { label: 'Prioritize top-rated attractions', value: 'popular', nextQuestionId: 'q3-structured' },
        { label: 'Whatever fits the schedule', value: 'efficient', nextQuestionId: 'q3-structured' },
        { label: 'Keep it flexible, see how you feel', value: 'flexible', nextQuestionId: 'q3-adaptive' }
      ],
      allowCustomInput: true
    },
    {
      id: 'q2-social',
      text: 'A friend says yes! How do you coordinate?',
      options: [
        { label: 'Create a shared doc with options', value: 'organized', nextQuestionId: 'q3-structured' },
        { label: 'Send a quick poll for activities', value: 'collaborative', nextQuestionId: 'q3-adaptive' },
        { label: '"Let\'s figure it out when we get there"', value: 'spontaneous', nextQuestionId: 'q3-adaptive' }
      ],
      allowCustomInput: true
    },
    {
      id: 'q2-research',
      text: 'You find an incredible local blog. What catches your eye?',
      options: [
        { label: 'Secret spots locals love', value: 'authentic', nextQuestionId: 'q3-adaptive' },
        { label: 'Most photogenic locations', value: 'aesthetic', nextQuestionId: 'q3-structured' },
        { label: 'Best value recommendations', value: 'practical', nextQuestionId: 'q3-structured' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Two variants based on Q2
    {
      id: 'q3-structured',
      text: 'Day 1: Your top restaurant is fully booked. What happens?',
      options: [
        { label: 'Find the next best backup option', value: 'pivot', nextQuestionId: 'q4-recovery' },
        { label: 'Check if they have bar seating or waitlist', value: 'persist', nextQuestionId: 'q4-recovery' },
        { label: 'Wander until something looks good', value: 'explore', nextQuestionId: 'q4-discovery' }
      ],
      allowCustomInput: true
    },
    {
      id: 'q3-adaptive',
      text: 'Day 1: You stumble on a street festival. Your move?',
      options: [
        { label: 'Jump right in, this is perfect', value: 'embrace', nextQuestionId: 'q4-discovery' },
        { label: 'Check out for 20min then move on', value: 'sample', nextQuestionId: 'q4-discovery' },
        { label: 'Snap a photo but stick to the plan', value: 'focused', nextQuestionId: 'q4-recovery' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Converges back
    {
      id: 'q4-recovery',
      text: 'Your travel buddy wants to skip tomorrow\'s main activity. You...',
      options: [
        { label: 'Need a good reason—you planned this', value: 'committed' },
        { label: 'Hear them out and find a compromise', value: 'diplomatic' },
        { label: 'Sure, let\'s do what feels right', value: 'easygoing' }
      ],
      allowCustomInput: true
    },
    {
      id: 'q4-discovery',
      text: 'A local invites you to a neighborhood hangout tomorrow night. You...',
      options: [
        { label: 'Absolutely yes—this is what travel is about', value: 'open' },
        { label: 'Ask what to expect first', value: 'curious' },
        { label: 'Politely decline, you have other plans', value: 'selective' }
      ],
      allowCustomInput: true
    },
    
    // Question 5 - Reset, new topic
    {
      id: 'q5',
      text: 'Packing your suitcase the night before. How\'s it going?',
      options: [
        { label: 'Already done—packed days ago with a checklist', value: 'prepared' },
        { label: 'Throwing in essentials and winging it', value: 'minimal' },
        { label: 'Overpacking "just in case"', value: 'cautious' }
      ],
      allowCustomInput: true
    },
    
    // BRANCHING TRIO 2: Questions 6-8 (Social → Discovery → Reflection)
    // Question 6 - Branches
    {
      id: 'q6',
      text: 'At the airport, you notice someone reading a book about where you\'re going. You...',
      options: [
        { label: 'Strike up a conversation', value: 'outgoing', nextQuestionId: 'q7-social' },
        { label: 'Smile but keep to yourself', value: 'reserved', nextQuestionId: 'q7-solo' },
        { label: 'Ask them for recommendations', value: 'resourceful', nextQuestionId: 'q7-social' }
      ],
      allowCustomInput: true
    },
    
    // Question 7 - Two variants
    {
      id: 'q7-social',
      text: 'You meet other travelers at your hostel/hotel. They invite you to join their plans. You...',
      options: [
        { label: 'Join immediately—the more the merrier', value: 'social', nextQuestionId: 'q8-shared' },
        { label: 'Join for part of it, then do your own thing', value: 'balanced', nextQuestionId: 'q8-shared' },
        { label: 'Politely decline, you prefer solo exploring', value: 'independent', nextQuestionId: 'q8-solo' }
      ],
      allowCustomInput: true
    },
    {
      id: 'q7-solo',
      text: 'You have a full afternoon free. What sounds best?',
      options: [
        { label: 'Find a cozy café and people-watch', value: 'observer', nextQuestionId: 'q8-solo' },
        { label: 'Rent a bike and explore aimlessly', value: 'wanderer', nextQuestionId: 'q8-solo' },
        { label: 'Visit a museum or cultural site', value: 'cultural', nextQuestionId: 'q8-shared' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - Final question, converges
    {
      id: 'q8-shared',
      text: 'Last day of the trip. What made it memorable?',
      options: [
        { label: 'The people I met along the way', value: 'connections' },
        { label: 'The unexpected moments and surprises', value: 'serendipity' },
        { label: 'Seeing everything I wanted to see', value: 'completion' }
      ],
      allowCustomInput: true
    },
    {
      id: 'q8-solo',
      text: 'Last day of the trip. What are you taking home?',
      options: [
        { label: 'A deeper understanding of the place', value: 'insight' },
        { label: 'Recharged and ready for life', value: 'renewal' },
        { label: 'Stories and memories to share', value: 'stories' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 20 first words × 20 second words = 400 combinations
  wordMatrix: {
    firstWords: [
      'Spontaneous', 'Methodical', 'Bold', 'Thoughtful', 'Energetic',
      'Relaxed', 'Curious', 'Practical', 'Adventurous', 'Cautious',
      'Social', 'Independent', 'Flexible', 'Structured', 'Creative',
      'Analytical', 'Intuitive', 'Deliberate', 'Impulsive', 'Balanced'
    ],
    secondWords: [
      'Explorer', 'Planner', 'Wanderer', 'Connector', 'Dreamer',
      'Organizer', 'Adventurer', 'Observer', 'Seeker', 'Settler',
      'Networker', 'Soloist', 'Optimizer', 'Curator', 'Free Spirit',
      'Strategist', 'Enthusiast', 'Collector', 'Navigator', 'Voyager'
    ],
    selectionPrompt: `You are analyzing a traveler's vacation style based on their quiz responses.

Your task: Select ONE combination of words that best captures this person's travel personality.

Available words:
FIRST WORDS (descriptors): {{firstWords}}
SECOND WORDS (archetypes): {{secondWords}}

User's answers:
{{answers}}

Instructions:
1. Consider the full story their answers tell - what they DO, how they adapt, what they value
2. Look for patterns in planning style, social preferences, flexibility, and what makes travel meaningful to them
3. Choose the FIRST WORD that describes their approach (e.g., how structured, spontaneous, social, etc.)
4. Choose the SECOND WORD that describes their traveler archetype (e.g., their core travel identity)
5. All words are positive - find the best match, not the perfect one

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "reasoning": "2-3 sentence explanation connecting their answers to this combination"
}`
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a travel expert. Based on this traveler's quiz responses, they've been identified as a "{{archetype}}".

Write a warm, engaging 200-word explanation that:
1. Validates their travel style with enthusiasm
2. Highlights 2-3 specific patterns from their answers that reveal this archetype
3. Gives 1-2 practical tips that match their style
4. Ends with an inspiring line about their next adventure

Their answers:
{{answers}}

Be personal, energetic, and make them feel seen. Use "you" throughout. Format as flowing paragraphs, not bullet points.`
  }
}
