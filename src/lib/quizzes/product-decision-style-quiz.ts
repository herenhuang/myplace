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
    selectionPrompt: `You are analyzing a PM's product decision-making style.

Your task: Select ONE combination that captures how this PM makes product calls.

Available words:
FIRST WORDS (decision approach): {{firstWords}}
SECOND WORDS (decision role): {{secondWords}}

PM's decision patterns:
{{answers}}

IMPORTANT WARNINGS:
⚠️ DO NOT use quiz title to create obvious combinations
⚠️ AVOID generic combinations - be specific to their patterns
⚠️ SECOND WORD must grammatically complete "What's Your Product Decision Style?" → "What's Your [SecondWord]?" must sound natural
⚠️ CREATE UNEXPECTED COMBINATIONS that reveal their true style

Instructions:
1. Analyze their decision patterns across 8 scenarios:
   - Customer requests (vision vs customer-driven vs problem-focused)
   - Unclear data (intuition vs iterate vs research more)
   - Competition (strategic vs reactive vs user-focused)
   - Technical constraints (MVP vs quality vs collaborative)
   - New opportunities (explore vs stay focused vs validate)
   - Conflicting feedback (majority vs power users vs data)
   - Roadmap changes (commitment vs adaptive vs cautious)
   - Data vs gut conflicts (data vs instinct vs experimental)

2. Identify PRIMARY patterns:
   - Input preference: data-driven OR intuitive OR user-obsessed
   - Decision speed: bold/fast OR cautious/careful OR experimental/testing
   - Strategy adherence: disciplined/focused OR adaptive/flexible
   - Quality vs speed: ships fast OR waits for quality OR collaborative middle
   - Vision: strategic protector OR pragmatic builder OR opportunistic explorer

3. Choose FIRST WORD for their DECISION APPROACH
4. Choose SECOND WORD for their DECISION ROLE/TYPE
5. Test grammar: "What's Your [SecondWord]?" - natural?
6. Tagline must be specific (e.g., "You trust the numbers over your gut, every time" NOT "You make good decisions")
7. Find 2 alternatives

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
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a product leader who understands decision-making. This person is a "{{archetype}}" - {{tagline}}.

Write a practical, insightful explanation with these sections.

<section>
# {{archetype}}
{{tagline}}

## Your Decision-Making Blueprint

2-3 sentences about their natural decision-making style using "you" language. Reference their actual choices.
</section>

<section>
## What I Noticed

Highlight 3 specific patterns from their actual answers:
- When you answered [specific scenario], that shows [insight about their decision style]
- Your choice in [specific situation] reveals [trait]
- [Another answer-to-trait connection]
</section>

<section>
## You're Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative style explaining why they showed hints of it based on their answers.
</section>

<section>
## What Works For You

Give 2-3 strengths of being a {{archetype}}. What makes this decision-making style effective? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy

Share 1-2 honest observations about common pitfalls or challenges for a {{archetype}}. Be supportive, not critical.
</section>

<section>
## Tips For Your Growth

Give 2-3 practical tips for improving your decision-making using "you" language. Be encouraging and actionable.
</section>

<section>
## Bottom Line

End with one empowering sentence about owning their {{archetype}} decision-making style.
</section>

Their full decision patterns:
{{answers}}

Use "{{archetype}}" throughout. Be practical and specific. Use markdown ## for headers.`
  }
}
