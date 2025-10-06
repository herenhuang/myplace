import { QuizConfig } from './types'

export const pmTradeoffStyleQuiz: QuizConfig = {
  id: 'pm-tradeoff-style',
  title: 'What\'s Your PM Trade-off Style?',
  description: 'Discover how you navigate the impossible choices between speed, quality, scope, and stakeholders.',
  type: 'story-matrix',

  theme: {
    primaryColor: '#dc2626',
    secondaryColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    textColor: '#991b1b',
    backgroundImage: 'linear-gradient(135deg, #dc2626 0%, #fca5a5 50%, #fef2f2 100%)'
  },

  questions: [
    // Question 1 - Speed vs Quality
    {
      id: 'q1',
      text: 'Engineering says they can ship fast but it\'ll be scrappy, or slow but polished. You choose...',
      options: [
        { label: 'Fast and scrappy - ship it, learn, iterate', value: 'speed_prioritizer' },
        { label: 'Slow and polished - quality matters more than timing', value: 'quality_prioritizer' },
        { label: 'Middle ground - cut scope to ship faster without sacrificing quality', value: 'scope_cutter' }
      ],
      allowCustomInput: true
    },

    // Question 2 - Feature breadth vs depth
    {
      id: 'q2',
      text: 'You can build 5 okay features or 1 amazing feature. Same effort. You pick...',
      options: [
        { label: 'One amazing feature - depth over breadth always', value: 'depth_focuser' },
        { label: 'Five okay features - cover more use cases and learn faster', value: 'breadth_explorer' },
        { label: 'Two great features - balance impact and coverage', value: 'balanced_optimizer' }
      ],
      allowCustomInput: true
    },

    // Question 3 - New users vs power users
    {
      id: 'q3',
      text: 'A feature will delight power users but confuse new users. What wins?',
      options: [
        { label: 'New user experience - growth and onboarding are critical', value: 'growth_focuser' },
        { label: 'Power user needs - retain and monetize engaged users', value: 'retention_focuser' },
        { label: 'Build it with progressive disclosure - serve both', value: 'complexity_balancer' }
      ],
      allowCustomInput: true
    },

    // Question 4 - Technical debt vs new features
    {
      id: 'q4',
      text: 'Engineering wants a sprint for tech debt. Sales wants new features. You decide...',
      options: [
        { label: 'Tech debt wins - invest in foundation now to move faster later', value: 'foundation_investor' },
        { label: 'Features win - we need revenue and user value', value: 'value_prioritizer' },
        { label: 'Split it - some debt paydown, some new features', value: 'parallel_balancer' }
      ],
      allowCustomInput: true
    },

    // Question 5 - Scope vs deadline
    {
      id: 'q5',
      text: 'You\'re behind schedule. You can cut scope or push the deadline. You...',
      options: [
        { label: 'Cut scope - ship something smaller on time', value: 'deadline_keeper' },
        { label: 'Push deadline - ship what we promised, even if late', value: 'commitment_keeper' },
        { label: 'Negotiate both - small cut and small delay', value: 'flexible_negotiator' }
      ],
      allowCustomInput: true
    },

    // Question 6 - Revenue vs user experience
    {
      id: 'q6',
      text: 'Leadership wants a feature that\'ll drive revenue but hurt user experience. You...',
      options: [
        { label: 'Push back hard - don\'t compromise on UX', value: 'ux_protector' },
        { label: 'Find a way to meet the revenue goal without hurting UX', value: 'creative_reconciler' },
        { label: 'Ship it - revenue keeps the lights on', value: 'business_pragmatist' }
      ],
      allowCustomInput: true
    },

    // Question 7 - Build vs buy
    {
      id: 'q7',
      text: 'You can build a custom solution (3 months) or integrate a third-party tool (2 weeks). You...',
      options: [
        { label: 'Build custom - own the experience and IP', value: 'ownership_builder' },
        { label: 'Integrate third-party - ship faster and focus on core product', value: 'speed_integrator' },
        { label: 'Start with third-party, plan to build later if needed', value: 'pragmatic_starter' }
      ],
      allowCustomInput: true
    },

    // Question 8 - Stakeholder satisfaction
    {
      id: 'q8',
      text: 'You can\'t make everyone happy. Engineering, Sales, and Design all want different things. You...',
      options: [
        { label: 'Make the call that\'s best for users, regardless of politics', value: 'user_advocate' },
        { label: 'Prioritize the stakeholder with the strongest business case', value: 'business_optimizer' },
        { label: 'Find a solution that gives everyone something', value: 'political_balancer' }
      ],
      allowCustomInput: true
    }
  ],

  wordMatrix: {
    firstWords: [
      'Speed-Focused',    // Ships fast
      'Quality-Driven',   // Won't compromise
      'User-First',       // UX over everything
      'Business-Minded',  // Revenue focused
      'Balanced',         // Finds middle ground
      'Pragmatic',        // Practical solutions
      'Bold',             // Makes hard cuts
      'Political',        // Manages stakeholders
      'Strategic',        // Long-term thinking
      'Flexible'          // Adapts based on context
    ],
    secondWords: [
      'Prioritizer',      // Makes clear choices
      'Negotiator',       // Finds compromises
      'Protector',        // Guards something
      'Optimizer',        // Maximizes outcomes
      'Builder',          // Creates solutions
      'Balancer',         // Juggles competing needs
      'Decider',          // Cuts through ambiguity
      'Advocate',         // Champions a cause
      'Integrator',       // Brings together
      'Strategist'        // Thinks ahead
    ],
    selectionPrompt: `You are analyzing a PM's trade-off style based on impossible choices they make.

Your task: Select ONE combination that captures how this PM navigates trade-offs.

Available words:
FIRST WORDS (value/priority): {{firstWords}}
SECOND WORDS (method/approach): {{secondWords}}

PM's trade-off patterns:
{{answers}}

IMPORTANT WARNINGS:
⚠️ DO NOT use quiz title to create obvious combinations
⚠️ AVOID generic combinations - be specific to their patterns
⚠️ SECOND WORD must grammatically complete "What's Your PM Trade-off Style?" → "What's Your [SecondWord]?" must sound natural
⚠️ CREATE UNEXPECTED COMBINATIONS that reveal priorities

Instructions:
1. Analyze their trade-off patterns across 8 scenarios:
   - Speed vs Quality (fast scrappy vs slow polished vs scope cut)
   - Breadth vs Depth (many features vs few great ones)
   - New users vs Power users (growth vs retention vs both)
   - Tech debt vs Features (foundation vs value vs split)
   - Scope vs Deadline (cut scope vs push deadline vs negotiate)
   - Revenue vs UX (protect UX vs reconcile vs business first)
   - Build vs Buy (ownership vs speed vs pragmatic)
   - Stakeholder conflicts (user advocate vs business optimizer vs political balancer)

2. Identify PRIMARY patterns:
   - Core value: speed OR quality OR users OR business OR balance
   - Decision style: bold/decisive OR flexible/negotiating OR protective
   - Optimization: maximizes one thing OR balances multiple OR finds creative solutions
   - Stakeholder approach: user advocate OR business-minded OR political balancer

3. Choose FIRST WORD for their PRIMARY VALUE/PRIORITY
4. Choose SECOND WORD for their APPROACH/METHOD
5. Test grammar: "What's Your [SecondWord]?" - natural?
6. Tagline must reveal priorities (e.g., "You'll cut scope before you cut quality" NOT "You make trade-offs")
7. Find 2 alternatives

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific subtitle revealing their priorities (use 'you' language)",
  "reasoning": "2-3 sentences why this fits. Reference specific trade-offs.",
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
    promptTemplate: `You're a product veteran who knows trade-offs are everything. This person is a "{{archetype}}" - {{tagline}}.

Write a clear, honest explanation. IMPORTANT: Do NOT use "{{archetype}}" as a header.

<section>
## Your Trade-off Blueprint

2-3 sentences about their priorities and approach using "you" language. Connect to their tagline. Reference their actual choices.
</section>

<section>
## What I Noticed

Highlight 3 specific patterns from their actual answers:
- When you answered [specific scenario], that shows [insight about their priorities]
- Your choice in [specific trade-off] reveals [trait]
- [Another answer-to-trait connection]
</section>

<section>
## You're Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative style explaining why they showed hints of it based on their answers.
</section>

<section>
## What Works For You

Give 2-3 strengths of being a {{archetype}}. What makes this trade-off style effective? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy

Share 1-2 honest observations about common pitfalls or challenges for a {{archetype}}. Be supportive, not critical.
</section>

<section>
## Tips For Your Growth

Give 2-3 practical tips for making better trade-offs using "you" language. Be encouraging and actionable.
</section>

<section>
## Bottom Line

End with one empowering sentence about owning their {{archetype}} priorities and approach.
</section>

Their full trade-off patterns:
{{answers}}

Use "{{archetype}}" throughout. Be honest about priorities. Use markdown ## for headers.`
  }
}
