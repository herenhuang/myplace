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
    selectionPrompt: `You're figuring out someone's dating texting style from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (their texting energy): {{firstWords}}
SECOND WORDS (what they actually do): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - how do they actually text when they like someone?
2. Look for patterns: Are they quick or slow? Anxious or chill? Do they double-text? What's their emoji situation? How do they handle silence?
3. Pick the FIRST WORD that matches their natural texting energy (their vibe, their speed)
4. Pick the SECOND WORD that matches what they care about most (their behavior, their pattern)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

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
    model: 'claude-3-5-sonnet-20241022',
    promptTemplate: `You're talking to a friend about their dating texting style. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

TARGET LENGTH: ~1500-2000 words total. Be conversational but economical with words.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Texting Blueprint
Talk about how they naturally text when they like someone. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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
## Personality Predictions

Based on their texting style and quiz answers, here's your read on their personality:

**MBTI Type: [4-LETTER TYPE] ([XX]% confident)**
In 1-2 conversational sentences, explain why this MBTI type fits based on how they answered. Reference specific behaviors they showed. Be honest about confidence - if it's their first quiz or answers were mixed, use lower percentages (15-40%). If patterns are clear, go higher (60-85%).

**Big Five Traits:**
Output EXACTLY in this format (just the numbers, 0-100 scale):
- Openness: [0-100]
- Conscientiousness: [0-100]
- Extraversion: [0-100]
- Agreeableness: [0-100]
- Neuroticism: [0-100]

Then add 1-2 conversational sentences about what stands out in their Big Five profile.
</section>

<section>
## Bottom Line
One real, empowering sentence about what makes their {{archetype}} style valuable. No fluff - just truth.
</section>

Their full texting patterns:
{{answers}}

IMPORTANT: 2-3 sentences per section MAX. Use contractions (you're, don't, can't, it's). Short, punchy sentences. No fluff - if you can cut a word, cut it. Make every word earn its place. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}
