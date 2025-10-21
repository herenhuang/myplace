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
    selectionPrompt: `You're figuring out someone's PM trade-off style from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (what they value most): {{firstWords}}
SECOND WORDS (how they make the call): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - when they have to choose between impossible options, what wins?
2. Look for patterns: Do they pick speed or quality? Users or business? Do they cut scope or push deadlines? What do they protect?
3. Pick the FIRST WORD that matches what they actually value most (their priority, their north star)
4. Pick the SECOND WORD that matches what they care about most (their method, their approach)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific subtitle revealing their priorities. Must be a complete sentence ending with punctuation. Use 'you' language.",
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
    model: 'claude-3-5-sonnet-20241022',
    promptTemplate: `You're talking to a friend about their PM trade-off style. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

TARGET LENGTH: ~1500-2000 words total. Be conversational but economical with words.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Trade-off Blueprint
Talk about how they naturally make trade-offs. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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

Based on their tradeoff style and quiz answers, here's your read on their personality:

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

Their full trade-off patterns:
{{answers}}

IMPORTANT: 2-3 sentences per section MAX. Use contractions (you're, don't, can't, it's). Short, punchy sentences. No fluff - if you can cut a word, cut it. Make every word earn its place. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}
