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
    // Question 1 - Planning style (Planner vs Free Spirit)
    {
      id: 'q1',
      text: 'You just booked a trip. What does your prep look like?',
      options: [
        { label: 'Detailed itinerary with backups', value: 'structured_planner' },
        { label: 'Book flights, figure out the rest there', value: 'spontaneous_free' },
        { label: 'Research but stay flexible', value: 'flexible_general' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - What you prioritize (Foodie, Culture, Nature, Photography, Comfort)
    {
      id: 'q2',
      text: 'What is the highlight of any trip for you?',
      options: [
        { label: 'Finding the best local food spots', value: 'foodie' },
        { label: 'Hiking trails or beaches', value: 'nature' },
        { label: 'Museums, history, and architecture', value: 'culture' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Social vs Independent
    {
      id: 'q3',
      text: 'You are at a hostel common area. What is your move?',
      options: [
        { label: 'Start chatting with everyone', value: 'social_connector' },
        { label: 'Smile but keep to myself', value: 'independent_soloist' },
        { label: 'Join if someone talks to me first', value: 'flexible_social' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Energy level (Energetic vs Relaxed)
    {
      id: 'q4',
      text: 'Your ideal vacation day looks like...',
      options: [
        { label: 'Packed schedule, see everything possible', value: 'energetic_goer' },
        { label: 'Chill morning, one activity, then relax', value: 'relaxed_chill' },
        { label: 'Mix of both depending on mood', value: 'flexible_energy' }
      ],
      allowCustomInput: true
    },
    
    // Question 5 - Budget consciousness (Budgeteer)
    {
      id: 'q5',
      text: 'When it comes to spending on vacation...',
      options: [
        { label: 'I splurge—treat yourself', value: 'comfort_spender' },
        { label: 'Budget smart to travel longer/more', value: 'budgeteer' },
        { label: 'Mix of cheap eats and nice hotels', value: 'balanced_spend' }
      ],
      allowCustomInput: true
    },
    
    // Question 6 - Risk tolerance (Bold vs Cautious)
    {
      id: 'q6',
      text: 'Trying street food in a new country. Your approach?',
      options: [
        { label: 'Yes! Most adventurous thing I can find', value: 'bold_risk' },
        { label: 'If it is recommended and looks clean', value: 'cautious_safe' },
        { label: 'Stick to restaurants for safety', value: 'very_cautious' }
      ],
      allowCustomInput: true
    },
    
    // Question 7 - Decision making (Decisive vs Flexible)
    {
      id: 'q7',
      text: 'Plans change last minute. Your reaction?',
      options: [
        { label: 'Make a quick call and move forward', value: 'decisive_quick' },
        { label: 'Roll with it, whatever happens', value: 'flexible_adapt' },
        { label: 'Frustrated—I had this planned out', value: 'structured_rigid' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - What makes it successful (Photography, Comfort, etc.)
    {
      id: 'q8',
      text: 'What would make this trip a total win?',
      options: [
        { label: 'Amazing photos for the memories', value: 'photographer' },
        { label: 'Feeling totally recharged and pampered', value: 'comfort_seeker' },
        { label: 'Authentic local experiences', value: 'culture_authentic' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 truly distinct combinations
  wordMatrix: {
    firstWords: [
      'Spontaneous',    // Wing it, no plans
      'Structured',     // Everything organized
      'Social',         // People-focused
      'Independent',    // Prefers solo
      'Flexible',       // Adapts easily
      'Decisive',       // Quick decisions
      'Relaxed',        // Low-key, chill
      'Energetic',      // High energy, go-go
      'Cautious',       // Safety first
      'Bold'            // Takes risks
    ],
    secondWords: [
      'Planner',        // Itineraries & lists
      'Free Spirit',    // No schedule
      'Connector',      // Makes friends everywhere
      'Soloist',        // Happy alone
      'Foodie',         // All about eating
      'Culture Seeker', // Museums & history
      'Nature Lover',   // Outdoors & hiking
      'Comfort Seeker', // Nice hotels & spas
      'Budgeteer',      // Frugal & savvy
      'Photographer'    // Documenting everything
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
3. Choose the FIRST WORD that describes their approach (e.g., Spontaneous vs Structured, Social vs Independent)
4. Choose the SECOND WORD that describes what they prioritize in travel (e.g., Foodie, Nature Lover, Culture Seeker)
5. Each word is DISTINCT - there's clear daylight between them
6. All words are positive - find the best match, not the perfect one
7. Also identify 2 alternative combinations they were close to (not 3, just 2)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "reasoning": "2-3 sentence explanation. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason why this was close"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason why this was close"}
  ]
}

IMPORTANT: Do NOT make up names like "Natural Explorer" or "Adventurous Soul". Only use exact words from the lists provided.`
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a travel expert. Based on this traveler's quiz responses, they are a "{{archetype}}".

⚠️ CRITICAL RULES - READ CAREFULLY:
1. You must ONLY use the term "{{archetype}}" - this is their ONLY identity
2. Do NOT create ANY other names, nicknames, or variations (NO "Natural Explorer", "Adventurous Soul", etc.)
3. Do NOT add articles like "The" or "A" before {{archetype}}
4. Every time you refer to their travel style, use EXACTLY "{{archetype}}" and nothing else
5. You will be penalized if you make up any new names

Write a warm, engaging explanation with these sections:

## Your Travel DNA
Start with "As an {{archetype}}, you..." (use {{archetype}} EXACTLY as given). Write 2-3 sentences validating this style with enthusiasm. Do NOT write "You're a [something else]" - only use {{archetype}}.

## What I Noticed
Highlight 2-3 specific patterns from their answers that reveal why they're a "{{archetype}}".

## You Were Also Close To...
{{alternatives}}

Write 1 engaging sentence for each alternative explaining why they showed hints of this style.

## Tips for Your Next Trip
1-2 practical, actionable tips that match the {{archetype}} style. Use "As an {{archetype}}, you should..." format.

## Where This Takes You
End with an inspiring sentence about their next adventure. Use "{{archetype}}" EXACTLY - no substitutions or creative variations.

Their answers:
{{answers}}

Be personal, energetic, and make them feel seen. Use "you" throughout. Use markdown formatting with ## for headers.`
  }
}
