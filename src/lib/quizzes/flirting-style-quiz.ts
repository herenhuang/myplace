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
    backgroundImage: '/quiz/flirting-style/background.png'
  },
  
  questions: [
    // Question 1 - Initial Approach
    {
      id: 'q1-first-move',
      text: 'You\'re interested in someone. How do you let them know?',
      options: [
        { label: 'Direct approach - "Hey, I think you\'re interesting"', value: 'bold_direct' },
        { label: 'Strategic proximity - engineer reasons to be around them', value: 'subtle_strategic' },
        { label: 'Wait and hope they notice me noticing them', value: 'passive_hopeful' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - Conversation Style
    {
      id: 'q2-conversation',
      text: 'When talking to someone you like, your conversation style is...',
      options: [
        { label: 'Playful teasing with lots of banter', value: 'teasing_playful' },
        { label: 'Deep questions - I want to know who they really are', value: 'deep_genuine' },
        { label: 'Light and fun - keep it easy and laugh a lot', value: 'light_humorous' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Physical Touch
    {
      id: 'q3-touch',
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
      id: 'q4-compliments',
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
      id: 'q5-texting',
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
      id: 'q6-eye-contact',
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
      id: 'q7-vulnerability',
      text: 'How vulnerable do you get when you\'re flirting?',
      options: [
        { label: 'I share real stuff early - let them see the real me', value: 'open_authentic' },
        { label: 'Keep it surface level until I know they\'re interested', value: 'guarded_protective' },
        { label: 'Mix of both - test the waters with small vulnerabilities', value: 'balanced_tester' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - Rejection Handling
    {
      id: 'q8-rejection-risk',
      text: 'When it comes to the risk of rejection, you...',
      options: [
        { label: 'Go for it anyway - rejection is part of the game', value: 'brave_shooter' },
        { label: 'Need pretty clear signals before making a move', value: 'careful_reader' },
        { label: 'Avoid putting myself in rejection territory at all', value: 'risk_avoider' }
      ],
      allowCustomInput: true
    },
    
    // Question 9 - Group vs Solo
    {
      id: 'q9-social-context',
      text: 'You flirt better when...',
      options: [
        { label: 'It\'s just the two of us - less pressure, more real', value: 'one_on_one' },
        { label: 'In a group - I can be playful and show my social side', value: 'social_performer' },
        { label: 'Doesn\'t matter - I adapt to the situation', value: 'flexible_adapter' }
      ],
      allowCustomInput: true
    },
    
    // Question 10 - Escalation Style
    {
      id: 'q10-escalation',
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
      'Pursuer',           // Active chaser
      'Eye Contact Master',// Non-verbal communicator
      'Slow Burner'        // Takes time to warm up
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

Write an engaging, playful explanation with these sections:

## Your Flirting DNA

Start with "As a {{archetype}}, you..." and write 2-3 sentences about how they show interest. Make sure it connects to their tagline: "{{tagline}}". Reference their actual quiz answers to show you get their specific vibe.

## What I'm Seeing In Action

Highlight 3 specific patterns from their actual answers that reveal they're a {{archetype}}:
- When you said [specific answer], that's textbook {{archetype}} energy
- Your approach to [specific situation] shows [characteristic of their style]
- The fact that you [another specific answer] tells me [insight]

## You Were Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative explaining why they showed hints of that style based on their answers.

## What Works For You

Give 2-3 strengths of being a {{archetype}}. What makes this style effective? Be encouraging and specific.

## Your Growth Edge

Offer 1-2 gentle suggestions for how a {{archetype}} could expand their range or avoid common pitfalls. Be supportive, not critical.

## Bottom Line

End with one empowering sentence about owning their {{archetype}} style and being confident in how they show interest.

Their full answers:
{{answers}}

Use "{{archetype}}" consistently throughout (never shorten or modify it). Be fun, playful, specific to their answers, and encouraging. Use markdown with ## for headers. Make them feel seen and maybe laugh a little.`
  }
}

