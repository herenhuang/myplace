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
    selectionPrompt: `You're figuring out someone's PM pressure style from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (how they handle pressure): {{firstWords}}
SECOND WORDS (what they actually do): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - how do they actually handle it when things get intense at work?
2. Look for patterns: Do they stay calm or jump in? Make calls fast or build consensus? Push back or accommodate? What's their move when it's all on fire?
3. Pick the FIRST WORD that matches their natural approach under pressure (their energy, their style)
4. Pick the SECOND WORD that matches what they care about most (their role, their method)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific subtitle about their pressure style. Must be a complete sentence ending with punctuation. Use 'you' language.",
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
    promptTemplate: `You're talking to a friend about their PM pressure style. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Pressure Blueprint
Talk about how they naturally handle pressure. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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

Based on their PM pressure style and quiz answers, here's your read on their personality:

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

Their full pressure scenarios:
{{answers}}

IMPORTANT: Use contractions (you're, don't, can't, it's). Keep sentences short and punchy. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}
