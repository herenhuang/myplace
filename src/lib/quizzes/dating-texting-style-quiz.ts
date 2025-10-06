import { QuizConfig } from './types'

export const datingTextingStyleQuiz: QuizConfig = {
  id: 'dating-texting-style',
  title: 'What\'s Your Dating Texting Style?',
  description: 'Discover how you really text when you like someone romantically.',
  type: 'story-matrix',

  theme: {
    primaryColor: '#06b6d4',
    secondaryColor: '#a5f3fc',
    backgroundColor: '#ecfeff',
    textColor: '#164e63',
    backgroundImage: 'linear-gradient(135deg, #06b6d4 0%, #a5f3fc 50%, #ecfeff 100%)'
  },

  questions: [
    // Question 1 - First text timing
    {
      id: 'q1',
      text: 'You just got their number. When do you actually text?',
      options: [
        { label: 'Within an hour - strike while the iron is hot', value: 'eager_immediate' },
        { label: 'That evening - interested but not too eager', value: 'balanced_measured' },
        { label: 'Next day or when I think of something good to say', value: 'strategic_patient' }
      ],
      allowCustomInput: true
    },

    // Question 2 - Response style
    {
      id: 'q2',
      text: 'You\'re texting back and forth. What does your style look like?',
      options: [
        { label: 'Quick responses, keeping it flowing, some emojis', value: 'responsive_engaged' },
        { label: 'Short and casual - "haha yeah" "same" vibes', value: 'brief_chill' },
        { label: 'Thoughtful replies - taking time to craft good messages', value: 'careful_deliberate' }
      ],
      allowCustomInput: true
    },

    // Question 3 - No response anxiety
    {
      id: 'q3',
      text: 'You texted 4 hours ago. No response. What are you doing?',
      options: [
        { label: 'Totally fine - they\'re busy, not checking my phone', value: 'secure_unbothered' },
        { label: 'Checking periodically, wondering if I said something wrong', value: 'anxious_monitoring' },
        { label: 'Sending a follow-up - meme or new question to keep it going', value: 'persistent_double_texting' }
      ],
      allowCustomInput: true
    },

    // Question 4 - Conversation vibe
    {
      id: 'q4',
      text: 'Good text conversation is happening. What\'s your energy?',
      options: [
        { label: 'Flirty and playful - teasing, innuendos, that vibe', value: 'flirty_teasing' },
        { label: 'Asking real questions - actually trying to know them', value: 'substantive_curious' },
        { label: 'Fun and light - jokes, memes, banter', value: 'entertaining_casual' }
      ],
      allowCustomInput: true
    },

    // Question 5 - Late night text
    {
      id: 'q5',
      text: 'They text at 11pm: "you up?" What do you do?',
      options: [
        { label: 'Respond naturally - yeah I\'m up, what\'s up?', value: 'open_straightforward' },
        { label: 'Flirt back - "depends who\'s asking 😏"', value: 'bold_playful' },
        { label: 'Overthink it - is this a booty call? What do they want?', value: 'analytical_cautious' }
      ],
      allowCustomInput: true
    },

    // Question 6 - Emoji usage
    {
      id: 'q6',
      text: 'Looking at your texts with them. Your emoji situation is...',
      options: [
        { label: '😂❤️✨ everywhere - I use them constantly', value: 'expressive_heavy' },
        { label: 'Strategic emoji drops - well-placed 😏 or 😊 when needed', value: 'selective_intentional' },
        { label: 'Barely any - my words are enough', value: 'minimal_restrained' }
      ],
      allowCustomInput: true
    },

    // Question 7 - Planning hangout
    {
      id: 'q7',
      text: 'The "we should hang out" text happens. What do you do?',
      options: [
        { label: 'Take the lead - suggest specific time and place', value: 'decisive_planning' },
        { label: 'Enthusiastic but vague - "yes! when works for you?"', value: 'eager_flexible' },
        { label: 'Play it cool - "yeah for sure, lmk what works"', value: 'casual_noncommittal' }
      ],
      allowCustomInput: true
    },

    // Question 8 - End of day
    {
      id: 'q8',
      text: 'End of the night. How does your texting day with them end?',
      options: [
        { label: 'Sweet goodnight - "sleep well ✨" something cute', value: 'sweet_intentional' },
        { label: 'Naturally fades - conversation just ends when it ends', value: 'organic_natural' },
        { label: 'Leave them wanting more - end on a high note, bit of mystery', value: 'strategic_playful' }
      ],
      allowCustomInput: true
    }
  ],

  wordMatrix: {
    firstWords: [
      'Eager',            // Quick, responsive
      'Strategic',        // Calculated timing
      'Casual',           // Chill, low-key
      'Anxious',          // Overthinking
      'Playful',          // Fun, flirty
      'Genuine',          // Real, straightforward
      'Expressive',       // Emoji-heavy, open
      'Careful',          // Thoughtful, crafted
      'Bold',             // Confident, direct
      'Chill'             // Relaxed, easygoing
    ],
    secondWords: [
      'Texter',           // General style
      'Flirt',            // Romantic energy
      'Double-Texter',    // Sends multiple
      'Overthinker',      // Analyzes everything
      'Responder',        // Reactive, follows
      'Initiator',        // Starts convos
      'Emoji-Artist',     // Heavy emoji user
      'Conversationalist',// Keeps it going
      'Player',           // Cool, mysterious
      'Analyzer'          // Reads into things
    ],
    selectionPrompt: `You are analyzing someone's texting chemistry based on how they text someone they like.

Your task: Select ONE combination that captures how this person texts romantically.

Available words:
FIRST WORDS (texting energy): {{firstWords}}
SECOND WORDS (texting behavior): {{secondWords}}

User's texting patterns:
{{answers}}

IMPORTANT WARNINGS:
⚠️ DO NOT use quiz title to create obvious combinations like "Eager Texter"
⚠️ AVOID boring combinations - be specific to their actual behavior
⚠️ SECOND WORD must grammatically complete "What's Your Dating Texting Style?" → "What's Your [SecondWord]?" must sound natural
⚠️ CREATE UNEXPECTED, SPECIFIC COMBINATIONS

Instructions:
1. Analyze their texting across 8 scenarios:
   - First text timing (immediate vs measured vs strategic)
   - Response style (quick vs brief vs thoughtful)
   - No-response handling (secure vs anxious vs persistent)
   - Conversation content (flirty vs substantive vs casual)
   - Late night response (open vs bold vs analytical)
   - Emoji usage (heavy vs selective vs minimal)
   - Planning approach (decisive vs eager vs casual)
   - Day ending (sweet vs organic vs strategic)

2. Identify PRIMARY patterns:
   - Speed: eager/immediate OR strategic/patient OR chill/natural
   - Anxiety: secure/unbothered OR anxious/monitoring OR overthinking
   - Expression: expressive/emoji-heavy OR careful/crafted OR minimal/restrained
   - Confidence: bold/playful OR casual/cool OR anxious/cautious
   - Approach: initiating OR responding OR double-texting OR analyzing

3. Choose FIRST WORD for core TEXTING ENERGY
4. Choose SECOND WORD for primary BEHAVIOR/PATTERN
5. Test grammar: "What's Your [SecondWord]?" - natural?
6. Tagline must be specific (e.g., "You check your phone more than you'd admit" NOT "You text well")
7. Find 2 alternatives

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific, relatable subtitle about their texting. Must be a complete sentence ending with punctuation. Use 'you' language.",
  "reasoning": "2-3 sentences why this fits their texting patterns. Reference specific behaviors.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Why this was close"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Why this was close"}
  ]
}

CRITICAL: Only use exact words from lists. Combination is [FirstWord] + [SecondWord].`,
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a texting behavior expert. This person is a "{{archetype}}" - {{tagline}}.

Write a fun, honest take with these sections. IMPORTANT: Do NOT include "{{archetype}}" or "The {{archetype}}" as a header - the name is already displayed above.

<section>
## Your Texting Blueprint

2-3 sentences about how they text when into someone using "you" language. Connect to their tagline. Reference actual patterns. Maybe call them out a little (lovingly).
</section>

<section>
## What I Noticed

Highlight 3 specific patterns from their actual answers:
- When you answered [specific answer], that shows [insight about their texting style]
- Your response to [specific scenario] reveals [trait]
- [Another answer-to-trait connection]
</section>

<section>
## You're Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative explaining why they showed hints of it based on their answers.
</section>

<section>
## What Works For You

Give 2-3 strengths of being a {{archetype}}. What makes this texting style effective? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy

Share 1-2 honest observations about common pitfalls or challenges for a {{archetype}}. Be supportive, not critical.
</section>

<section>
## Dating Advice For You

Give 2-3 practical texting tips using "you" language. Be encouraging and actionable.
</section>

<section>
## Bottom Line

End with one empowering (or playfully calling out) sentence about owning their {{archetype}} style.
</section>

Their full texting patterns:
{{answers}}

Use "{{archetype}}" throughout. Be playful, a bit cheeky, specific. Make them laugh at themselves. Use markdown ## for headers.`
  }
}
