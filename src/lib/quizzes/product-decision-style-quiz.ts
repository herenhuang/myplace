import { QuizConfig } from './types'

export const productDecisionStyleQuiz: QuizConfig = {
  id: 'product-decision-style',
  title: 'What\'s Your Product Decision Style?',
  description: 'Discover how you actually make product calls - data, gut, users, or something else.',
  type: 'story-matrix',

  theme: {
    primaryColor: '#0891b2',
    secondaryColor: '#a5f3fc',
    backgroundColor: '#ecfeff',
    textColor: '#164e63',
    backgroundImage: 'linear-gradient(135deg, #0891b2 0%, #a5f3fc 50%, #ecfeff 100%)'
  },

  questions: [
    // Question 1 - Feature request decision
    {
      id: 'q1',
      text: 'A major customer asks for a specific feature. Your gut says it\'s not right for the product. You...',
      options: [
        { label: 'Say no - protect the product vision even if it costs the deal', value: 'vision_protector' },
        { label: 'Dig deeper - understand the underlying need and find a better solution', value: 'problem_excavator' },
        { label: 'Build it - paying customers know what they need', value: 'customer_driven' }
      ],
      allowCustomInput: true
    },

    // Question 2 - Unclear metrics
    {
      id: 'q2',
      text: 'You need to decide between two features. The data is inconclusive. What do you do?',
      options: [
        { label: 'Go with my intuition about what users will love', value: 'intuition_led' },
        { label: 'Ship the simpler one first and learn from real usage', value: 'iterative_learner' },
        { label: 'Talk to more users until I have a clear signal', value: 'research_gatherer' }
      ],
      allowCustomInput: true
    },

    // Question 3 - Competitive pressure
    {
      id: 'q3',
      text: 'A competitor just launched a feature your users are asking about. You...',
      options: [
        { label: 'Analyze if it fits our strategy before reacting', value: 'strategic_analyzer' },
        { label: 'Move fast to build our version - can\'t fall behind', value: 'competitive_reactor' },
        { label: 'Talk to users about why they want it and what problem it solves', value: 'user_investigator' }
      ],
      allowCustomInput: true
    },

    // Question 4 - Technical constraint
    {
      id: 'q4',
      text: 'Engineering says your ideal solution will take 3 months. A simpler version takes 2 weeks. You...',
      options: [
        { label: 'Ship the 2-week version and iterate based on feedback', value: 'mvp_shipper' },
        { label: 'Wait for the 3-month version - do it right the first time', value: 'quality_waiter' },
        { label: 'Workshop with eng to find a middle ground solution', value: 'collaborative_optimizer' }
      ],
      allowCustomInput: true
    },

    // Question 5 - New opportunity
    {
      id: 'q5',
      text: 'Someone pitches an exciting idea that\'s completely off your roadmap. You...',
      options: [
        { label: 'Get excited and explore it - good ideas can come from anywhere', value: 'opportunistic_explorer' },
        { label: 'Thank them but stay focused on current priorities', value: 'disciplined_focuser' },
        { label: 'Validate it against strategy and user needs before deciding', value: 'strategic_validator' }
      ],
      allowCustomInput: true
    },

    // Question 6 - Mixed user feedback
    {
      id: 'q6',
      text: 'Power users love a feature. Casual users find it confusing. What wins?',
      options: [
        { label: 'Optimize for the majority - simplify for casual users', value: 'majority_optimizer' },
        { label: 'Serve the power users - they\'re our most engaged segment', value: 'power_user_focuser' },
        { label: 'Look at usage data to see which group drives more value', value: 'data_arbiter' }
      ],
      allowCustomInput: true
    },

    // Question 7 - Roadmap conflict
    {
      id: 'q7',
      text: 'Your roadmap says Feature A. But you just learned something that makes Feature B seem more important. You...',
      options: [
        { label: 'Stick with A - we made a commitment and need to execute', value: 'commitment_keeper' },
        { label: 'Switch to B - new information should change our plans', value: 'adaptive_pivotter' },
        { label: 'Timebox research on B to validate before changing course', value: 'cautious_investigator' }
      ],
      allowCustomInput: true
    },

    // Question 8 - Gut vs data conflict
    {
      id: 'q8',
      text: 'Your instinct screams one direction. The data suggests another. Final call time. You...',
      options: [
        { label: 'Follow the data - it\'s more reliable than intuition', value: 'data_follower' },
        { label: 'Trust my gut - I know this product and these users', value: 'instinct_truster' },
        { label: 'Run a small experiment to test both hypotheses', value: 'experimental_tester' }
      ],
      allowCustomInput: true
    }
  ],

  wordMatrix: {
    firstWords: [
      'Data-Driven',      // Relies on metrics
      'Intuitive',        // Trusts gut
      'User-Obsessed',    // User feedback first
      'Strategic',        // Vision/strategy led
      'Adaptive',         // Flexible, pivots
      'Disciplined',      // Stays focused
      'Experimental',     // Tests hypotheses
      'Collaborative',    // Team-based decisions
      'Bold',             // Takes big bets
      'Cautious'          // Measured, careful
    ],
    secondWords: [
      'Decision-Maker',   // General style
      'Validator',        // Tests before committing
      'Builder',          // Ships and learns
      'Researcher',       // Gathers info first
      'Strategist',       // Thinks long-term
      'Optimizer',        // Maximizes outcomes
      'Explorer',         // Tries new things
      'Protector',        // Guards vision/quality
      'Pragmatist',       // Practical solutions
      'Visionary'         // Big picture thinker
    ],
    selectionPrompt: `You're figuring out someone's product decision style from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (how they make decisions): {{firstWords}}
SECOND WORDS (what they're really about): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - how do they actually make product calls when it matters?
2. Look for patterns: Do they follow data or gut? Do they ship fast or wait? Do they protect the vision or adapt? What do they trust most?
3. Pick the FIRST WORD that matches their natural decision approach (their style, their instinct)
4. Pick the SECOND WORD that matches what they care about most (their role, their priority)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific subtitle about their decision style. Must be a complete sentence ending with punctuation. Use 'you' language.",
  "reasoning": "2-3 sentences why this fits. Reference specific scenarios.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason"}
  ]
}

CRITICAL: Only use exact words from lists. Combination is [FirstWord] + [SecondWord].`,
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-5-sonnet-20241022',
    promptTemplate: `You're talking to a friend about their product decision style. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

TARGET LENGTH: ~1500-2000 words total. Be conversational but economical with words.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Decision-Making Blueprint
Talk about how they naturally make product decisions. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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
## Tips For Your Growth
Give 2-3 practical, doable tips. Talk like you're giving actual advice to a friend, not writing a professional development plan.
</section>

<section>
## Personality Predictions

Based on their decision style and quiz answers, here's your read on their personality:

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

Their full decision patterns:
{{answers}}

IMPORTANT: 2-3 sentences per section MAX. Use contractions (you're, don't, can't, it's). Short, punchy sentences. No fluff - if you can cut a word, cut it. Make every word earn its place. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}
