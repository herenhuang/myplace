import { QuizConfig } from './types'

export const firstDateEnergyQuiz: QuizConfig = {
  id: 'first-date-energy',
  title: 'What\'s Your First Date Energy?',
  description: 'Discover how you really show up when you\'re trying to make a good impression on a date.',
  type: 'story-matrix',

  theme: {
    primaryColor: '#f43f5e',
    secondaryColor: '#fda4af',
    backgroundColor: '#fff1f2',
    textColor: '#9f1239',
    backgroundImage: 'linear-gradient(135deg, #f43f5e 0%, #fda4af 50%, #fff1f2 100%)'
  },

  questions: [
    // Question 1 - Pre-date mindset
    {
      id: 'q1',
      text: 'Getting ready for the date. What\'s actually going through your head?',
      options: [
        { label: 'Hyping myself up - they\'re lucky to meet me', value: 'confident_self_assured' },
        { label: 'Spiraling about what to talk about and what could go wrong', value: 'anxious_overthinking' },
        { label: 'Genuinely curious and excited to see what happens', value: 'curious_open' }
      ],
      allowCustomInput: true
    },

    // Question 2 - Arrival
    {
      id: 'q2',
      text: 'You arrive first. They\'re running 5 minutes late. What are you doing?',
      options: [
        { label: 'Sitting confidently, casually scrolling my phone', value: 'composed_relaxed' },
        { label: 'Checking my reflection, rereading our texts nervously', value: 'nervous_fidgeting' },
        { label: 'Ordering a drink and settling in - might as well get comfortable', value: 'easygoing_natural' }
      ],
      allowCustomInput: true
    },

    // Question 3 - First impression
    {
      id: 'q3',
      text: 'They walk in. First 30 seconds. What actually happens?',
      options: [
        { label: 'Big smile and greeting: "Hey! So good to see you!"', value: 'warm_enthusiastic' },
        { label: 'Casual wave, play it cool - don\'t want to seem too eager', value: 'guarded_reserved' },
        { label: 'Genuine but awkward - smile, maybe a nervous laugh', value: 'authentic_awkward' }
      ],
      allowCustomInput: true
    },

    // Question 4 - Conversation flow
    {
      id: 'q4',
      text: 'First real conversation. What are you actually doing?',
      options: [
        { label: 'Asking them questions - genuinely curious about their life', value: 'curious_engaged' },
        { label: 'Telling stories, making them laugh, showing my personality', value: 'performing_entertaining' },
        { label: 'Matching their vibe - giving what I\'m getting', value: 'adaptive_mirroring' }
      ],
      allowCustomInput: true
    },

    // Question 5 - Awkward moment
    {
      id: 'q5',
      text: 'Awkward silence hits. What do you do?',
      options: [
        { label: 'Jump in with a new question - can\'t let it be weird', value: 'rescuing_filling' },
        { label: 'Make a joke about the silence and laugh it off', value: 'deflecting_humoring' },
        { label: 'Just smile and let it breathe - silences are okay', value: 'comfortable_allowing' }
      ],
      allowCustomInput: true
    },

    // Question 6 - Connection moment
    {
      id: 'q6',
      text: 'You find common ground. The energy shifts. What happens with you?',
      options: [
        { label: 'Light up - fully animated, excited, big energy', value: 'expressive_animated' },
        { label: 'Lean in closer, get more focused and engaged', value: 'intimate_attentive' },
        { label: 'Start playfully teasing or bantering', value: 'playful_flirty' }
      ],
      allowCustomInput: true
    },

    // Question 7 - Future mention
    {
      id: 'q7',
      text: 'They casually mention "next time we hang out." What do you think?',
      options: [
        { label: 'Excited - already into this and planning when', value: 'eager_forward' },
        { label: 'Cautiously hopeful - let\'s see how tonight ends first', value: 'measured_realistic' },
        { label: 'Playing it cool internally even though I\'m interested', value: 'guarded_protected' }
      ],
      allowCustomInput: true
    },

    // Question 8 - Goodbye
    {
      id: 'q8',
      text: 'Date ending. Time to say goodbye. What do you actually do?',
      options: [
        { label: 'Make the move: "This was great. When can I see you again?"', value: 'direct_initiating' },
        { label: 'Keep it light: "Let\'s do this again!" and see how they respond', value: 'casual_open' },
        { label: 'Wait for them to say something first about next steps', value: 'passive_receiving' }
      ],
      allowCustomInput: true
    }
  ],

  wordMatrix: {
    firstWords: [
      'Confident',        // Self-assured
      'Nervous',          // Anxious energy
      'Curious',          // Genuinely interested
      'Playful',          // Light, fun
      'Guarded',          // Protected, careful
      'Authentic',        // Real, genuine
      'Strategic',        // Calculated, thoughtful
      'Enthusiastic',     // High energy, excited
      'Chill',            // Relaxed, easygoing
      'Intense'           // Serious, deep
    ],
    secondWords: [
      'Dater',            // General approach
      'Flirt',            // Romantic energy
      'Connector',        // Seeks connection
      'Performer',        // Shows off personality
      'Observer',         // Watches and reads
      'Questioner',       // Asks questions
      'Storyteller',      // Shares stories
      'Overthinker',      // In their head
      'Initiator',        // Takes the lead
      'Matcher'           // Mirrors energy
    ],
    selectionPrompt: `You are analyzing someone's dating energy based on their first date behavior.

Your task: Select ONE combination that captures how this person shows up on dates.

Available words:
FIRST WORDS (core energy): {{firstWords}}
SECOND WORDS (dating approach): {{secondWords}}

User's dating patterns across the date:
{{answers}}

IMPORTANT WARNINGS:
⚠️ DO NOT use quiz title to create obvious combinations like "Confident Dater"
⚠️ AVOID boring combinations - be specific to their actual patterns
⚠️ SECOND WORD must grammatically complete "What's Your First Date Energy?" → "What's Your [SecondWord]?" must sound natural
⚠️ CREATE UNEXPECTED, INSIGHTFUL COMBINATIONS

Instructions:
1. Analyze their full date arc (8 moments):
   - Pre-date mindset (confident vs anxious vs curious)
   - Arrival behavior (composed vs nervous vs natural)
   - First impression (warm vs guarded vs awkward)
   - Conversation style (questioner vs performer vs matcher)
   - Awkward moment handling (rescuer vs deflector vs comfortable)
   - Connection expression (animated vs intimate vs playful)
   - Future thinking (eager vs cautious vs guarded)
   - Goodbye approach (initiator vs casual vs passive)

2. Identify PRIMARY patterns:
   - Confidence: self-assured OR anxious OR playing it cool
   - Authenticity: genuine/real OR performing OR guarded
   - Energy: high/enthusiastic OR chill/relaxed OR intense
   - Approach: initiating OR responding OR questioning OR performing
   - Emotional state: curious/open OR nervous/overthinking OR strategic/calculating

3. Choose FIRST WORD for core DATING ENERGY
4. Choose SECOND WORD for primary APPROACH/ROLE
5. Test grammar: "What's Your [SecondWord]?" - must sound natural
6. Tagline must be specific (e.g., "You overthink before but relax once you're there" NOT "You're good at dates")
7. Find 2 alternatives they showed hints of

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific, relatable subtitle about their dating energy. Must be a complete sentence ending with punctuation. Use 'you' language.",
  "reasoning": "2-3 sentences why this fits their date journey. Reference specific moments.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Why this was close based on their answers"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Why this was close based on their answers"}
  ]
}

CRITICAL: Only use exact words from the lists. Combination is [FirstWord] + [SecondWord].`,
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a dating coach who gets it. This person is a "{{archetype}}" - {{tagline}}.

Write a fun, honest explanation with these sections.

<section>
# {{archetype}}
{{tagline}}

## Your Dating Blueprint

2-3 sentences about how they show up on dates using "you" language. Reference their actual journey.
</section>

<section>
## What I Noticed

Highlight 3 specific patterns from their actual answers:
- When you answered [specific answer], that shows [insight about their dating energy]
- Your response to [specific moment] reveals [trait]
- [Another answer-to-trait connection]
</section>

<section>
## You're Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative explaining why they showed hints of it based on their answers.
</section>

<section>
## What Works For You

Give 2-3 strengths of being a {{archetype}} on dates. What makes this energy effective? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy

Share 1-2 honest observations about common pitfalls or challenges for a {{archetype}}. Be supportive, not critical.
</section>

<section>
## Dating Advice For You

Give 2-3 practical tips for better dates using "you" language. Be encouraging and actionable.
</section>

<section>
## Bottom Line

End with one empowering sentence about owning their {{archetype}} energy on dates.
</section>

Their full date:
{{answers}}

Use "{{archetype}}" throughout. Be playful, honest, specific. Use markdown ## for headers.`
  }
}
