import { QuizConfig } from './types'

export const crushQuiz: QuizConfig = {
  id: 'crush-quiz',
  title: 'Do I Have a Crush?',
  description: 'The most honest 8 minutes of your feelings. Let\'s figure out what\'s really going on in your heart.',
  type: 'story-matrix',
  
  theme: {
    primaryColor: '#ec4899',
    secondaryColor: '#fbcfe8',
    backgroundColor: '#fdf2f8',
    textColor: '#831843',
    backgroundImage: 'linear-gradient(135deg, #ec4899 0%, #fbcfe8 50%, #fdf2f8 100%)'
  },
  
  questions: [
    // Question 1 - Physical Response
    {
      id: 'q1-notification',
      text: 'Their name pops up on your phone. What happens in your body?',
      options: [
        { label: 'Instant smile, maybe a little heart skip', value: 'excited_rush' },
        { label: 'Comfortable warmth, like hearing from a close friend', value: 'warm_comfort' },
        { label: 'Nervous energy - what do they want?', value: 'anxious_spike' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - Jealousy Test
    {
      id: 'q2-dating-others',
      text: 'They casually mention going on a date with someone else. Your honest reaction?',
      options: [
        { label: 'Feel a weird pang in my chest I can\'t explain', value: 'jealous_hurt' },
        { label: 'Genuinely happy for them, hope it goes well', value: 'platonic_support' },
        { label: 'Suddenly realize... oh no, I care more than I thought', value: 'realization_moment' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Mental Real Estate
    {
      id: 'q3-thinking-about-them',
      text: 'How often do they randomly pop into your head throughout the day?',
      options: [
        { label: 'Constantly. Embarrassingly often.', value: 'obsessive_thoughts' },
        { label: 'Sometimes, like any friend I care about', value: 'normal_frequency' },
        { label: 'Only when something reminds me of them', value: 'situational_thoughts' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Social Behavior
    {
      id: 'q4-social-situations',
      text: 'You\'re at a party. They walk in. What happens?',
      options: [
        { label: 'I\'m immediately aware of where they are in the room', value: 'hyper_aware' },
        { label: 'I\'ll probably go say hi, but no rush', value: 'casual_greeting' },
        { label: 'I find a reason to be near them without being obvious', value: 'strategic_proximity' }
      ],
      allowCustomInput: true
    },
    
    // Question 5 - Late Night Energy
    {
      id: 'q5-late-night-texts',
      text: 'It\'s 11:47pm. You\'re texting them about nothing important. How do you feel?',
      options: [
        { label: 'Like this is exactly where I want to be right now', value: 'content_connection' },
        { label: 'Wondering if I\'m reading too much into this', value: 'overthinking_signals' },
        { label: 'Normal. We talk like this all the time.', value: 'comfortable_routine' }
      ],
      allowCustomInput: true
    },
    
    // Question 6 - Physical Proximity
    {
      id: 'q6-touch-proximity',
      text: 'They sit really close to you, arms almost touching. You...',
      options: [
        { label: 'Am VERY aware of every millimeter between us', value: 'electric_tension' },
        { label: 'Feel comfortable and relaxed', value: 'natural_closeness' },
        { label: 'Wonder if they\'re doing this on purpose', value: 'analyzing_intent' }
      ],
      allowCustomInput: true
    },
    
    // Question 7 - Future Thoughts
    {
      id: 'q7-future-scenarios',
      text: 'When you imagine the future, where are they in that picture?',
      options: [
        { label: 'Right there next to me, specifically', value: 'romantic_future' },
        { label: 'In my life somehow, but the details are fuzzy', value: 'vague_presence' },
        { label: 'Haven\'t really thought about it that way', value: 'not_considered' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - Attention Competition
    {
      id: 'q8-others-interested',
      text: 'Someone else in your life expresses romantic interest in you. Your first thought is...',
      options: [
        { label: 'But what about [their name]?', value: 'comparing_to_crush' },
        { label: 'This could be really great actually', value: 'open_to_others' },
        { label: 'I feel guilty even though nothing happened with [their name]', value: 'emotional_commitment' }
      ],
      allowCustomInput: true
    },
    
    // Question 9 - Vulnerability Test
    {
      id: 'q9-sharing-feelings',
      text: 'You have big news (good or bad). How quickly do you want to tell them?',
      options: [
        { label: 'They\'re literally the first person I think of', value: 'priority_person' },
        { label: 'They\'re in the group of close people I\'d tell', value: 'inner_circle' },
        { label: 'I\'d tell them eventually, when it comes up', value: 'casual_sharing' }
      ],
      allowCustomInput: true
    },
    
    // Question 10 - The Honest Question
    {
      id: 'q10-gut-feeling',
      text: 'Be honest with yourself: If they wanted to kiss you right now, you\'d...',
      options: [
        { label: 'Yes. Absolutely yes.', value: 'definite_yes' },
        { label: 'I... don\'t know? Maybe? This is confusing.', value: 'uncertain_maybe' },
        { label: 'No, I don\'t see them that way', value: 'platonic_feelings' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 distinct crush types
  wordMatrix: {
    firstWords: [
      'Intense',           // All-consuming feelings
      'Subtle',            // Quiet, underneath the surface
      'Confusing',         // Mixed signals from self
      'Playful',           // Light, flirty energy
      'Deep',              // Profound emotional connection
      'Hesitant',          // Afraid to admit it
      'Electric',          // Physical chemistry focus
      'Comfortable',       // Easy, natural feeling
      'Undeniable',        // Can't ignore it anymore
      'Questioning'        // Still figuring it out
    ],
    secondWords: [
      'Romantic Crush',              // Classic crush feelings
      'Physical Attraction',         // Body-focused interest
      'Emotional Connection',        // Heart-centered bond
      'Friendship Blur',             // Can't tell friend vs more
      'Late-Night Feelings',         // Hits different at night
      'Fantasy Projection',          // In love with the idea
      'Growing Attachment',          // Slowly developing
      'Comfortable Love',            // Beyond crush, real love
      'Unavailable Person Fixation', // Complicated situation
      'Self-Discovery Journey'       // Learning about yourself
    ],
    selectionPrompt: `You are analyzing someone's romantic feelings based on their quiz responses about a specific person.

Your task: Select ONE combination that best captures the TYPE and NATURE of their feelings.

Available words:
FIRST WORDS (intensity/quality): {{firstWords}}
SECOND WORDS (type of feeling): {{secondWords}}

User's answers about this person:
{{answers}}

Instructions:
1. Look at the full picture of their feelings - physical reactions, jealousy, mental space, behavior changes
2. Consider patterns: Are they obsessive or casual? Clear or confused? Physical or emotional? New or deepening?
3. Choose the FIRST WORD that describes the INTENSITY/QUALITY of their feelings (e.g., Intense vs Subtle, Confusing vs Undeniable)
4. Choose the SECOND WORD that describes the TYPE/NATURE of their feelings (e.g., Romantic Crush, Friendship Blur, Physical Attraction)
5. Each word is DISTINCT - there's clear separation between them
6. All combinations are valid - no judgment, just accuracy
7. Create a tagline that makes them feel SEEN (e.g., "You're not imagining it - your body knows before your brain does" or "You're trying to logic your way out of feelings that won't listen to reason")
8. Identify 2 alternative combinations they were close to (not 3, just 2)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy, deeply personal subtitle that captures their specific situation (use 'you' language, make it feel like you're reading their mind)",
  "reasoning": "2-3 sentences explaining why this combination fits their answers. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names or terms.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason why this was close based on their answers"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason why this was close based on their answers"}
  ]
}

CRITICAL: Do NOT make up names like "Real Crush" or "True Love" or "Strong Feelings". Only use exact words from the lists provided. The combination is literally [FirstWord] + [SecondWord], nothing else.`,
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a warm, insightful friend helping someone understand their feelings. They're experiencing "{{archetype}}" - {{tagline}}.

Write an honest, personal explanation with these sections:

## What's Actually Happening Here

Start with "You're experiencing {{archetype}}, and here's what that means..." Write 2-3 sentences about what this TYPE of feeling is like. Make sure it connects to their tagline: "{{tagline}}". Reference their actual quiz answers to show you get their specific situation.

## The Signs I'm Seeing

Highlight 3 specific patterns from their actual answers that reveal they're experiencing {{archetype}}:
- When you said [specific answer], that tells me [insight about their feelings]
- Your response about [specific answer] shows [what's really going on]
- The fact that [another specific answer] is classic {{archetype}}

## You Were Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative explaining why they showed hints of it based on their answers.

## So... Do You Have a Crush?

Give them a direct, honest answer about whether this is a crush, based on {{archetype}}. Be kind but real. If it's complicated, say so.

## What to Do With This

Offer 2-3 practical suggestions tailored to {{archetype}}. Could be: sit with the feelings, talk to them, give it time, explore it, be careful, enjoy it, etc. Be specific to their situation.

## The Real Question

End with a reflective question or insight that helps them think about what they actually WANT here, given that they're experiencing {{archetype}}.

Their full answers:
{{answers}}

Use "{{archetype}}" consistently throughout (never shorten or modify it). Be warm, honest, specific to their answers, and non-judgmental. Use markdown with ## for headers. Make them feel understood.`
  }
}

