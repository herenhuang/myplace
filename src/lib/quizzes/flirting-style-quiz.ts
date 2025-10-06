import { QuizConfig } from './types'

export const flirtingStyleQuiz: QuizConfig = {
  id: 'flirting-style',
  title: 'What\'s Your Flirting Style?',
  description: 'Find out how you really show interest when you\'re into someone. (No judgment, just vibes.)',
  type: 'story-matrix',
  
  theme: {
    primaryColor: '#f97316',
    secondaryColor: '#fed7aa',
    backgroundColor: '#fff7ed',
    textColor: '#7c2d12',
    backgroundImage: 'linear-gradient(135deg, #f97316 0%, #fed7aa 50%, #fff7ed 100%)'
  },
  
  questions: [
    // Question 1 - Initial Approach
    {
      id: 'q1',
      text: 'You\'re at a party. Someone across the room catches your eye. What happens next?',
      options: [
        { label: 'Walk over and start talking - "Hey, I had to come say hi"', value: 'bold_direct' },
        { label: 'Casually position myself nearby and wait for a natural opening', value: 'subtle_strategic' },
        { label: 'Make eye contact and smile, hoping they come to me', value: 'passive_hopeful' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - Conversation Style
    {
      id: 'q2',
      text: 'You\'re in the middle of a conversation with someone you\'re into. What are you doing?',
      options: [
        { label: 'Teasing them playfully and keeping the banter going', value: 'teasing_playful' },
        { label: 'Asking deep questions - "What\'s something you\'re passionate about?"', value: 'deep_genuine' },
        { label: 'Making them laugh and keeping things light and easy', value: 'light_humorous' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Physical Touch
    {
      id: 'q3',
      text: 'When it comes to physical touch while flirting, you...',
      options: [
        { label: 'Find reasons to touch - arm, shoulder, playful shove', value: 'tactile_toucher' },
        { label: 'Let the moment dictate - if it feels right, sure', value: 'natural_reader' },
        { label: 'Avoid touch until I\'m SURE they\'re into it', value: 'cautious_respectful' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Compliment Style
    {
      id: 'q4',
      text: 'Your compliment game looks like...',
      options: [
        { label: 'Specific and bold - "That smile is dangerous"', value: 'bold_flirty' },
        { label: 'Thoughtful and genuine - notice little things', value: 'genuine_observer' },
        { label: 'Casual and indirect - "Cool shirt" counts, right?', value: 'subtle_casual' }
      ],
      allowCustomInput: true
    },
    
    // Question 5 - Text/Message Energy
    {
      id: 'q5',
      text: 'In your text conversations with someone you like, you...',
      options: [
        { label: 'Flirty emojis, playful innuendos, keep it spicy', value: 'flirty_texter' },
        { label: 'Thoughtful messages, ask real questions, build connection', value: 'meaningful_connector' },
        { label: 'Casual and chill - don\'t want to seem too eager', value: 'casual_cool' }
      ],
      allowCustomInput: true
    },
    
    // Question 6 - Eye Contact
    {
      id: 'q6',
      text: 'When making eye contact with someone you\'re attracted to...',
      options: [
        { label: 'Hold it with a little smile - let them know I see them', value: 'confident_holder' },
        { label: 'Quick glances then look away (but do it multiple times)', value: 'shy_repeater' },
        { label: 'Full intense eye contact - no games', value: 'intense_direct' }
      ],
      allowCustomInput: true
    },
    
    // Question 7 - Vulnerability Level
    {
      id: 'q7',
      text: 'They just shared something personal. How do you respond?',
      options: [
        { label: 'Match their vulnerability - share something real about myself', value: 'open_authentic' },
        { label: 'Listen and empathize, but keep my own cards close for now', value: 'guarded_protective' },
        { label: 'Test the waters with a small personal detail, see how it lands', value: 'balanced_tester' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - Escalation Style
    {
      id: 'q8',
      text: 'When it comes to escalating from flirting to something more, you...',
      options: [
        { label: 'Make it clear what I want - "Want to grab a drink?"', value: 'clear_initiator' },
        { label: 'Drop hints and hope they pick up on them', value: 'hint_dropper' },
        { label: 'Wait for them to make the first real move', value: 'receiver_waiter' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 distinct flirting styles
  wordMatrix: {
    firstWords: [
      'Bold',              // Unafraid, goes for it
      'Subtle',            // Understated, indirect
      'Playful',           // Fun, teasing energy
      'Genuine',           // Authentic, real connection
      'Confident',         // Self-assured approach
      'Shy',               // Hesitant, nervous energy
      'Strategic',         // Calculated, thoughtful moves
      'Natural',           // Effortless, flows easily
      'Intense',           // Deep, serious energy
      'Casual'             // Laid-back, no pressure
    ],
    secondWords: [
      'Charmer',           // Smooth talker
      'Teaser',            // Playful banter expert
      'Romantic',          // Classic romantic gestures
      'Connector',         // Emotional bond builder
      'Flirt',             // Traditional flirty energy
      'Admirer',           // Appreciator from afar
      'Conversationalist', // Talk-focused
      'Initiator',         // Active first-mover
      'Gazer',             // Non-verbal eye contact expert
      'Builder'            // Takes time to develop connection
    ],
    selectionPrompt: `You are analyzing someone's flirting style based on their quiz responses.

Your task: Select ONE combination that best captures how this person flirts and shows romantic interest.

Available words:
FIRST WORDS (approach/energy): {{firstWords}}
SECOND WORDS (method/style): {{secondWords}}

User's flirting patterns:
{{answers}}

Instructions:
1. Consider their full flirting personality - approach (bold vs subtle), communication style, physical vs verbal, confidence level, vulnerability, risk tolerance
2. Look for patterns across answers: Are they direct or indirect? Verbal or physical? Confident or cautious? Playful or serious?
3. Choose the FIRST WORD that describes their overall APPROACH/ENERGY when flirting (e.g., Bold vs Shy, Playful vs Intense)
4. Choose the SECOND WORD that describes their primary METHOD/STYLE (e.g., Charmer, Teaser, Connector)
5. Each word is DISTINCT - there's clear separation between them
6. All combinations are valid flirting styles - no judgment
7. Create a tagline that makes them feel SEEN and maybe laugh (e.g., "You're not subtle, but that's kind of your thing" or "They'll wonder if you like them or just really love eye contact")
8. Identify 2 alternative combinations they showed hints of (not 3, just 2)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A fun, punchy subtitle that captures their flirting vibe (use 'you' language, be playful and honest)",
  "reasoning": "2-3 sentences explaining why this combination fits their answers. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names or terms.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason why this was close based on their answers"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason why this was close based on their answers"}
  ]
}

CRITICAL: Do NOT make up names like "Bold Flirt" or "Smooth Operator" unless those EXACT words are in the lists. Only use exact words from the lists provided. The combination is literally [FirstWord] + [SecondWord], nothing else.`,
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a fun, insightful friend analyzing someone's flirting style. They're a "{{archetype}}" - {{tagline}}.

Write an engaging, playful explanation with these sections. IMPORTANT: Do NOT include "{{archetype}}" or "The {{archetype}}" as a header - the name is already displayed above.

<section>
## Your Flirting Blueprint

Write 2-3 sentences about how they navigate the romantic landscape with their unique style. Use "you" language (not "As a {{archetype}}, you..."). Make it feel personal and connect to their tagline. Reference their actual quiz answers to show you get their specific vibe.
</section>

<section>
## What I Noticed

Highlight 3 specific patterns from their actual answers that reveal their style:
- When you answered [specific answer], that shows [insight about their flirting style]
- Your approach to [specific situation] reveals [trait]
- [Another answer-to-trait connection]
</section>

<section>
## You're Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative explaining why they showed hints of that style based on their answers.
</section>

<section>
## What Works For You

Give 2-3 strengths of being a {{archetype}}. What makes this flirting style effective? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy

Share 1-2 honest observations about common pitfalls or challenges for a {{archetype}}. Be supportive, not critical.
</section>

<section>
## Dating Advice For You

Give 2-3 practical tips for showing interest using "you" language. Be encouraging and actionable.
</section>

<section>
## Bottom Line

End with one empowering sentence about owning their {{archetype}} style and being confident in how they show interest.
</section>

Their full answers:
{{answers}}

When referring to their style, use the exact term "{{archetype}}" (never shorten or modify it). Be fun, playful, specific to their answers, and encouraging. Use markdown with ## for section headers. Make them feel seen and maybe laugh a little.`
  }
}

