import { QuizConfig } from './types'

export const pmPressureStyleQuiz: QuizConfig = {
  id: 'pm-pressure-style',
  title: 'What\'s Your PM Pressure Style?',
  description: 'Discover how you really handle competing demands, tight deadlines, and high-stakes decisions.',
  type: 'story-matrix',

  theme: {
    primaryColor: '#7c3aed',
    secondaryColor: '#c4b5fd',
    backgroundColor: '#faf5ff',
    textColor: '#5b21b6',
    backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #c4b5fd 50%, #faf5ff 100%)'
  },

  questions: [
    // Question 1 - Conflicting stakeholder requests
    {
      id: 'q1',
      text: 'Engineering wants to focus on tech debt. Sales wants a new feature. Leadership wants both. You...',
      options: [
        { label: 'Schedule meetings with each to understand priorities and find alignment', value: 'diplomatic_mediator' },
        { label: 'Make the call based on what I think is right for the product', value: 'decisive_autonomous' },
        { label: 'Escalate to leadership - they need to align on this', value: 'escalating_delegator' }
      ],
      allowCustomInput: true
    },

    // Question 2 - Impossible deadline
    {
      id: 'q2',
      text: 'Leadership just committed to a launch date that engineering says is impossible. What do you do?',
      options: [
        { label: 'Push back hard - explain why it can\'t happen and negotiate timeline', value: 'assertive_pushback' },
        { label: 'Work with eng to cut scope and ship something by the deadline', value: 'pragmatic_scope_cutter' },
        { label: 'Rally the team to make it happen - find a way to deliver', value: 'optimistic_hustler' }
      ],
      allowCustomInput: true
    },

    // Question 3 - Critical bug vs new feature
    {
      id: 'q3',
      text: 'A critical bug is blocking users. But you also promised a new feature this sprint. You...',
      options: [
        { label: 'Bug wins - pause the feature, fix what\'s broken first', value: 'quality_prioritizer' },
        { label: 'Split the team - some on bug, some on feature', value: 'parallel_juggler' },
        { label: 'Assess impact and make the call based on affected users', value: 'analytical_triager' }
      ],
      allowCustomInput: true
    },

    // Question 4 - Last-minute design change request
    {
      id: 'q4',
      text: 'Design wants a major UX change 3 days before launch. It\'s better, but risky. You...',
      options: [
        { label: 'Say no - too late, we ship what we have', value: 'firm_deadline_holder' },
        { label: 'Bring eng in to assess feasibility and make a team decision', value: 'collaborative_assessor' },
        { label: 'Push the launch if the change is genuinely better for users', value: 'quality_delayer' }
      ],
      allowCustomInput: true
    },

    // Question 5 - Conflicting data and user feedback
    {
      id: 'q5',
      text: 'Analytics say one thing. User interviews say the opposite. You need to decide today. You...',
      options: [
        { label: 'Go with the data - it\'s more reliable than anecdotes', value: 'data_driven' },
        { label: 'Trust the qualitative feedback - users know what they need', value: 'user_empathy_driven' },
        { label: 'Run a quick experiment to get more signal before deciding', value: 'experimental_validator' }
      ],
      allowCustomInput: true
    },

    // Question 6 - Competing priorities from CEO
    {
      id: 'q6',
      text: 'CEO drops a "quick win" project on you mid-sprint. Your roadmap is already packed. You...',
      options: [
        { label: 'Add it to the backlog and explain the tradeoffs of prioritizing it now', value: 'transparent_educator' },
        { label: 'Find a way to squeeze it in - CEO requests are high priority', value: 'accommodating_scrambler' },
        { label: 'Push back with data on what we\'d have to cut to make room', value: 'evidence_based_negotiator' }
      ],
      allowCustomInput: true
    },

    // Question 7 - Team disagreement in planning
    {
      id: 'q7',
      text: 'Your team is split 50/50 on which direction to take. Everyone has strong opinions. You...',
      options: [
        { label: 'Make the final call - someone needs to decide', value: 'authoritative_decider' },
        { label: 'Facilitate discussion until we reach consensus', value: 'consensus_builder' },
        { label: 'Run a lightweight test of both approaches to see what works', value: 'testing_validator' }
      ],
      allowCustomInput: true
    },

    // Question 8 - Launch day crisis
    {
      id: 'q8',
      text: 'Launch day. A major issue surfaces. Users are confused. Team is panicking. You...',
      options: [
        { label: 'Stay calm, triage the issue, delegate fixes, communicate clearly', value: 'composed_leader' },
        { label: 'Roll back immediately - fix it properly before re-launching', value: 'cautious_reverter' },
        { label: 'Jump in to help fix it - all hands on deck', value: 'hands_on_firefighter' }
      ],
      allowCustomInput: true
    }
  ],

  wordMatrix: {
    firstWords: [
      'Diplomatic',       // Seeks alignment
      'Decisive',         // Makes calls quickly
      'Analytical',       // Data-driven approach
      'Empathetic',       // User/team-focused
      'Assertive',        // Pushes back confidently
      'Pragmatic',        // Practical solutions
      'Collaborative',    // Team-based decisions
      'Firm',             // Holds boundaries
      'Adaptive',         // Flexible, adjusts
      'Steady'            // Calm under pressure
    ],
    secondWords: [
      'Mediator',         // Resolves conflicts
      'Decider',          // Makes final calls
      'Prioritizer',      // Focuses on what matters
      'Negotiator',       // Trades and compromises
      'Leader',           // Takes charge
      'Validator',        // Tests before committing
      'Firefighter',      // Handles crises
      'Educator',         // Explains tradeoffs
      'Juggler',          // Manages multiple things
      'Protector'         // Shields team/scope
    ],
    selectionPrompt: `You are analyzing a PM's pressure style based on how they handle high-stakes situations.

Your task: Select ONE combination that captures how this PM operates under pressure.

Available words:
FIRST WORDS (approach/energy): {{firstWords}}
SECOND WORDS (method/role): {{secondWords}}

PM's behavior under pressure:
{{answers}}

IMPORTANT WARNINGS:
⚠️ DO NOT use quiz title to create obvious combinations like "Pressure Handler"
⚠️ AVOID generic combinations - be specific to their actual patterns
⚠️ SECOND WORD must grammatically complete "What's Your PM Pressure Style?" → "What's Your [SecondWord]?" must sound natural
⚠️ CREATE UNEXPECTED COMBINATIONS that reveal insight

Instructions:
1. Analyze their patterns across 8 high-pressure scenarios:
   - Conflicting stakeholders (mediate vs decide vs escalate)
   - Impossible deadlines (push back vs cut scope vs hustle)
   - Quality vs speed tradeoffs (quality first vs pragmatic vs analytical)
   - Last-minute changes (firm vs collaborative vs flexible)
   - Data vs intuition (data-driven vs user-driven vs experimental)
   - Executive demands (educate vs accommodate vs negotiate)
   - Team disagreements (decide vs consensus vs test)
   - Crisis management (composed vs cautious vs hands-on)

2. Identify PRIMARY patterns:
   - Decision style: decisive/autonomous OR collaborative OR analytical
   - Boundary setting: firm/assertive OR flexible/adaptive
   - Stakeholder handling: diplomatic OR direct OR escalating
   - Problem solving: pragmatic OR quality-focused OR experimental
   - Crisis response: calm leader OR cautious protector OR hands-on firefighter

3. Choose FIRST WORD for their APPROACH/ENERGY under pressure
4. Choose SECOND WORD for their primary ROLE/METHOD
5. Test grammar: "What's Your [SecondWord]?" - natural?
6. Tagline must be specific (e.g., "You hold the line when everyone's pushing" NOT "You handle pressure well")
7. Find 2 alternatives

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific subtitle about their pressure style (use 'you' language)",
  "reasoning": "2-3 sentences explaining why this fits their patterns. Reference specific scenarios.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason based on their answers"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason based on their answers"}
  ]
}

CRITICAL: Only use exact words from lists. Combination is [FirstWord] + [SecondWord].`,
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a seasoned PM coach who's seen it all. This person is a "{{archetype}}" - {{tagline}}.

Write an insightful, practical explanation. IMPORTANT: Do NOT use "{{archetype}}" as a header.

<section>
## Your Pressure Blueprint

2-3 sentences about their natural approach under pressure using "you" language. Connect to their tagline. Reference their actual decisions.
</section>

<section>
## What I Noticed

Highlight 3 specific patterns from their actual answers:
- When you answered [specific scenario], that shows [insight about their style]
- Your response to [specific pressure point] reveals [trait]
- [Another answer-to-trait connection]
</section>

<section>
## You're Also Close To...

{{alternatives}}

Write 1-2 sentences for each alternative style explaining why they showed hints of it based on their answers.
</section>

<section>
## What Works For You

Give 2-3 strengths of being a {{archetype}} under pressure. What makes this style effective? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy

Share 1-2 honest observations about common pitfalls or challenges for a {{archetype}} under pressure. Be supportive, not critical.
</section>

<section>
## Tips For Your Growth

Give 2-3 practical tips for thriving under pressure using "you" language. Be encouraging and actionable.
</section>

<section>
## Bottom Line

End with one empowering sentence about owning their {{archetype}} style under pressure.
</section>

Their full pressure scenarios:
{{answers}}

Use "{{archetype}}" throughout. Be practical, honest, specific. Use markdown ## for headers.`
  }
}
