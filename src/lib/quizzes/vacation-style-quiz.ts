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
    backgroundImage: 'linear-gradient(135deg, #00b4d8 0%, #90e0ef 50%, #f8f9fa 100%)'
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
      text: 'You have one free day in a new city. No plans. You...',
      options: [
        { label: 'Find the best-rated local restaurant on my phone', value: 'foodie' },
        { label: 'Head to the nearest trail or beach', value: 'nature' },
        { label: 'Walk to the historic district or main museum', value: 'culture' }
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
      text: 'You\'re at dinner. The menu is pricey but everything looks amazing. You...',
      options: [
        { label: 'Order what I want - I\'m on vacation', value: 'comfort_spender' },
        { label: 'Find the affordable option so I can travel longer', value: 'budgeteer' },
        { label: 'Get one nice thing + one budget thing', value: 'balanced_spend' }
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
      text: 'You\'re packing for the trip. What\'s the one thing you absolutely cannot forget?',
      options: [
        { label: 'My camera - I need to capture everything', value: 'photographer' },
        { label: 'Skincare/comfort items - I need to feel good', value: 'comfort_seeker' },
        { label: 'Phrasebook or translation app - I want to connect', value: 'culture_authentic' }
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
      'Thrill Seeker',  // Extreme/adventurous activities
      'Relaxer',        // Nice hotels & spas
      'Saver',          // Frugal & savvy
      'Documentarian'   // Capturing everything
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
  "tagline": "A punchy, evocative subtitle that makes them feel SEEN (e.g., 'You've got 3 backup itineraries just in case' or 'The friend who befriends the entire hostel by day 2')",
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
    promptTemplate: `You're a travel expert analyzing someone's vacation style. They are a "{{archetype}}" - {{tagline}}.

Write a warm, engaging explanation with these sections. IMPORTANT: Do NOT include "{{archetype}}" or "The {{archetype}}" as a header - the name is already displayed above.

<section>
## Your Travel Blueprint
Write 2-3 sentences about their core travel approach using "you" language (not "As {{archetype}}, you..."). Make it feel personal and connect to their tagline. Reference their actual quiz answers to show you get their specific vibe.
</section>

<section>
## What I Noticed
Highlight 3 specific patterns from their actual answers that show their travel style:
- When you answered [specific answer], that shows [insight about their style]
- Your choice of [specific answer] reveals [trait]
- [Another answer-to-trait connection]
</section>

<section>
## You're Also Close To...
{{alternatives}}

Write 1-2 sentences for each alternative style explaining why they showed hints of it based on their answers.
</section>

<section>
## What Works For You
Give 2-3 strengths of being a {{archetype}} traveler. What makes this style effective? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy
Share 1-2 honest observations about common pitfalls or challenges for a {{archetype}}. Be supportive, not critical.
</section>

<section>
## Tips For Your Next Trip
Give 2-3 practical tips using "you" language. Be encouraging and actionable.
</section>

<section>
## Bottom Line
End with one empowering sentence about owning their {{archetype}} travel style and embracing their next adventure.
</section>

Their answers:
{{answers}}

When referring to their style, use the exact term "{{archetype}}" (never shorten or modify it). Be personal and energetic. Use markdown with ## for section headers.`
  }
}
