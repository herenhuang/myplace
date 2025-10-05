import { QuizConfig } from './types'

export const communicationStyleQuiz: QuizConfig = {
  id: 'communication-style',
  title: 'What\'s Your Communication Style?',
  description: 'Discover how you really talk, listen, and connect in relationships.',
  type: 'story-matrix',

  theme: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#c4b5fd',
    backgroundColor: '#faf5ff',
    textColor: '#5b21b6',
    backgroundImage: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 50%, #faf5ff 100%)'
  },

  questions: [
    // Question 1 - Opening up
    {
      id: 'q1',
      text: 'Your partner asks "How are you really doing?" after a hard day. You...',
      options: [
        { label: 'Launch into the full story - every detail, every feeling', value: 'expressive_open' },
        { label: 'Give them the headline: "Rough. Here\'s what happened..."', value: 'direct_concise' },
        { label: 'Deflect: "I\'m fine. How was YOUR day?"', value: 'avoidant_deflecting' }
      ],
      allowCustomInput: true
    },

    // Question 2 - Noticing they're upset
    {
      id: 'q2',
      text: 'They seem off but haven\'t said anything. What do you actually do?',
      options: [
        { label: 'Ask directly: "Something\'s wrong. What is it?"', value: 'direct_confronting' },
        { label: 'Wait quietly for them to bring it up on their own', value: 'passive_patient' },
        { label: 'Observe gently: "You seem quiet. I\'m here when you\'re ready."', value: 'gentle_inviting' }
      ],
      allowCustomInput: true
    },

    // Question 3 - They share a problem
    {
      id: 'q3',
      text: 'They tell you about something stressing them out. Your first instinct?',
      options: [
        { label: 'Start problem-solving: "Have you tried...?"', value: 'solving_fixing' },
        { label: 'Listen fully and validate: "That sounds really hard."', value: 'validating_holding' },
        { label: 'Share your own similar experience to relate', value: 'relating_sharing' }
      ],
      allowCustomInput: true
    },

    // Question 4 - Minor disagreement
    {
      id: 'q4',
      text: 'You disagree about plans. The tension is building. What happens?',
      options: [
        { label: 'State my case clearly and ask what they actually want', value: 'direct_assertive' },
        { label: 'Back down to keep the peace: "Your way is fine."', value: 'accommodating_yielding' },
        { label: 'Look for middle ground: "What if we compromise?"', value: 'compromising_mediating' }
      ],
      allowCustomInput: true
    },

    // Question 5 - Conflict escalates
    {
      id: 'q5',
      text: 'The argument gets heated. They say something that stings. You...',
      options: [
        { label: 'Call it out immediately: "That hurt. Why would you say that?"', value: 'confronting_direct' },
        { label: 'Shut down and withdraw - I need space to process this', value: 'withdrawing_protecting' },
        { label: 'Pause the whole thing: "We\'re both upset. Let\'s take a break."', value: 'pausing_regulating' }
      ],
      allowCustomInput: true
    },

    // Question 6 - After the fight
    {
      id: 'q6',
      text: 'An hour later, you\'ve both cooled down. What do you do?',
      options: [
        { label: 'Bring it back up: "Can we talk about what happened?"', value: 'initiating_resolving' },
        { label: 'Wait for them to apologize or re-open it first', value: 'waiting_receiving' },
        { label: 'Let it go - we both know it got messy, moving on', value: 'releasing_moving' }
      ],
      allowCustomInput: true
    },

    // Question 7 - Relationship check-in
    {
      id: 'q7',
      text: 'They want to talk about "where we are" in the relationship. How do you feel?',
      options: [
        { label: 'Ready - I\'ve been wanting this conversation too', value: 'eager_open' },
        { label: 'Cautious - need to gauge where they\'re at first', value: 'guarded_reading' },
        { label: 'Anxious - these talks make me nervous but I\'ll try', value: 'nervous_willing' }
      ],
      allowCustomInput: true
    },

    // Question 8 - Receiving vulnerability
    {
      id: 'q8',
      text: 'They share a deep fear or insecurity with you. What do you do?',
      options: [
        { label: 'Reassure immediately: "You don\'t need to worry about that."', value: 'reassuring_comforting' },
        { label: 'Ask gentle questions to understand more deeply', value: 'curious_exploring' },
        { label: 'Share something vulnerable back to match their openness', value: 'reciprocating_matching' }
      ],
      allowCustomInput: true
    }
  ],

  wordMatrix: {
    firstWords: [
      'Direct',           // Says it straight
      'Gentle',           // Soft, careful
      'Expressive',       // Open, shares freely
      'Thoughtful',       // Considered, deliberate
      'Emotional',        // Feelings-first
      'Diplomatic',       // Tactful, balanced
      'Guarded',          // Protected, cautious
      'Intense',          // Deep, serious
      'Playful',          // Light, humorous
      'Quiet'             // Reserved, subtle
    ],
    secondWords: [
      'Communicator',     // General style
      'Listener',         // Focuses on hearing
      'Sharer',           // Opens up easily
      'Processor',        // Needs time to think
      'Resolver',         // Fixes/solves
      'Validator',        // Makes others feel heard
      'Questioner',       // Asks to understand
      'Observer',         // Watches and reads
      'Initiator',        // Starts conversations
      'Responder'         // Reacts to others
    ],
    selectionPrompt: `You are analyzing someone's communication style in relationships based on their quiz responses.

Your task: Select ONE combination that best captures how this person communicates.

Available words:
FIRST WORDS (approach/energy): {{firstWords}}
SECOND WORDS (method/role): {{secondWords}}

User's communication patterns:
{{answers}}

IMPORTANT WARNINGS:
⚠️ DO NOT use the quiz title to create obvious combinations like "Direct Communicator"
⚠️ AVOID generic/boring combinations - be specific to their actual patterns
⚠️ SECOND WORD must grammatically complete the quiz title: "What's Your Communication Style?" → "What's Your [SecondWord]?" must make sense
⚠️ CREATE UNEXPECTED COMBINATIONS that feel fresh and insightful

Instructions:
1. Analyze their patterns across ALL 8 scenarios:
   - How they share about themselves (open vs private, detailed vs brief)
   - How they respond to others' emotions (fix vs listen, engage vs withdraw)
   - How they handle conflict (direct vs avoidant, emotional vs logical)
   - How they navigate vulnerability (eager vs cautious, reciprocal vs holding space)

2. Look for their PRIMARY pattern (not just one answer):
   - Energy: direct/blunt OR gentle/diplomatic OR guarded/cautious
   - Emotion: feelings-first OR thoughtful/analytical
   - Role: initiator OR responder OR listener OR resolver
   - Intensity: intense/deep OR playful/light OR quiet/subtle

3. Choose FIRST WORD for their core ENERGY/APPROACH
4. Choose SECOND WORD for their primary ROLE/METHOD
5. Test: Does "What's Your [SecondWord]?" sound natural? If no, pick different word
6. Tagline must be specific and resonant (e.g., "You feel everything before you find the words" NOT "You communicate well")
7. Identify 2 alternatives they showed hints of

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific, resonant subtitle about their communication (use 'you' language)",
  "reasoning": "2-3 sentences explaining why this combination fits their specific answers.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason based on their answers"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason based on their answers"}
  ]
}

CRITICAL: Only use exact words from the lists provided. The combination is [FirstWord] + [SecondWord].`,
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're an insightful relationship expert. This person is a "{{archetype}}" - {{tagline}}.

Write a warm, personal explanation. IMPORTANT: Do NOT use "{{archetype}}" as a header.

## How You Communicate

Write 2-3 sentences about their natural communication approach. Use "you" language and reference their actual answers to make it feel personal.

## I See It In Your Answers

Highlight 3 specific patterns from their responses:
- When [specific situation], you [their choice] - that's {{archetype}} energy
- Your response to [specific moment] shows you're someone who [insight]
- The way you handled [specific scenario] tells me [understanding]

## You Also Have Hints Of...

{{alternatives}}

Write 1-2 sentences for each alternative explaining when these other modes show up.

## Your Communication Superpowers

2-3 strengths of being a {{archetype}}:
- What your style brings to relationships
- When your approach shines
- What partners appreciate

## Where It Gets Tricky

1-2 gentle observations about challenges:
- Common misunderstandings
- When your style might not land well
- Growth edges

## How To Communicate With You

2-3 specific things partners should know. Be actionable.

## Bottom Line

One empowering sentence about owning their {{archetype}} style.

Their full answers:
{{answers}}

Use "{{archetype}}" throughout. Be warm, insightful, specific. Use markdown with ## for headers.`
  }
}
