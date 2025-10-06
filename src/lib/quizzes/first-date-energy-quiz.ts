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
    selectionPrompt: `You're figuring out someone's first date energy from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (their natural energy on dates): {{firstWords}}
SECOND WORDS (what they're really doing): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - how do they actually show up when they're on a first date?
2. Look for patterns: Are they confident or nervous? Performing or genuine? Do they ask questions or tell stories? What are they trying to create?
3. Pick the FIRST WORD that matches their natural dating energy (their vibe, how they feel inside)
4. Pick the SECOND WORD that matches what they care about most (their approach, their role)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

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
    promptTemplate: `You're talking to a friend about their first date energy. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Dating Blueprint
Talk about how they naturally show up on dates. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
</section>

<section>
## What I Noticed
Point out 3 specific patterns from their actual answers. Be direct and warm:
- When you said [specific answer], I saw [what this means about them]
- The way you approached [specific scenario] tells me [insight]
- [Another connection between what they said and who they are]
</section>

<section>
## You're Also Close To...
{{alternatives}}

For each alternative, explain in 1-2 sentences why they've got some of this energy too. Keep it conversational - "You've also got some [style] in you when..."
</section>

<section>
## What Works For You
Share 2-3 things that are genuinely great about being a {{archetype}}. Be specific and real - no corporate fluff. What actually makes this work?
</section>

<section>
## Where It Gets Messy
Here's the honest part: share 1-2 ways this style can backfire or get tricky. Be kind but real - like a friend would tell you.
</section>

<section>
## Dating Advice For You
Give 2-3 practical, doable tips. Talk like you're giving actual advice to a friend, not writing a professional development plan.
</section>

<section>
## Bottom Line
One real, empowering sentence about what makes their {{archetype}} style valuable. No fluff - just truth.
</section>

Their full date:
{{answers}}

IMPORTANT: Use contractions (you're, don't, can't, it's). Keep sentences short and punchy. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}
