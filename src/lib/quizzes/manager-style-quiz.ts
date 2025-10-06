import { QuizConfig } from './types'

export const managerStyleQuiz: QuizConfig = {
  id: 'manager-style',
  title: 'What\'s Your Manager Style?',
  description: 'Discover how you really lead and what makes you effective!',
  type: 'story-matrix',
  
  theme: {
    primaryColor: '#6366f1',
    secondaryColor: '#a5b4fc',
    backgroundColor: '#fafafa',
    textColor: '#1e293b',
    backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #a5b4fc 50%, #fafafa 100%)'
  },
  
  questions: [
    // Question 1 - Decision Making Style (Decisive vs Collaborative vs Flexible)
    {
      id: 'q1',
      text: 'Your team is split 50/50 on which direction to take. What happens next?',
      options: [
        { label: 'I make the final call and explain why', value: 'decisive_leader' },
        { label: 'We keep discussing until consensus emerges', value: 'collaborative_consensus' },
        { label: 'I pick the approach we can test fastest', value: 'flexible_experimental' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - Core Priority (People-First vs Results vs Innovation vs Process)
    {
      id: 'q2',
      text: 'It\'s Monday morning. What\'s the first thing you check or do?',
      options: [
        { label: 'See how everyone is doing personally', value: 'people_first' },
        { label: 'Review progress on key deliverables', value: 'results_focused' },
        { label: 'Check if any process needs adjusting', value: 'process_optimizer' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Communication Style (Direct vs Supportive vs Strategic)
    {
      id: 'q3',
      text: 'A team member\'s work isn\'t meeting expectations. Your approach?',
      options: [
        { label: 'Schedule 1:1 - be direct about the gap', value: 'direct_honest' },
        { label: 'Ask what support they need to improve', value: 'supportive_coach' },
        { label: 'Review their workload and priorities first', value: 'strategic_context' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Crisis Management (Calm vs Action vs Collaborative)
    {
      id: 'q4',
      text: 'Major issue drops Friday at 4pm. Customer is upset. Your first move?',
      options: [
        { label: 'Jump in and start solving it myself', value: 'hands_on_solver' },
        { label: 'Rally the team and coordinate response', value: 'collaborative_coordinator' },
        { label: 'Stay calm, assess impact, then delegate', value: 'calm_strategic' }
      ],
      allowCustomInput: true
    },

    // Question 5 - Development Focus (Coach vs Autonomy vs Performance)
    {
      id: 'q5',
      text: 'Team member asks: "How should I approach this project?"',
      options: [
        { label: 'I walk them through my thinking process', value: 'teaching_coach' },
        { label: 'I ask questions to help them figure it out', value: 'empowering_autonomy' },
        { label: 'I share the goal and let them own the path', value: 'delegating_trust' }
      ],
      allowCustomInput: true
    },
    
    // Question 6 - Feedback Style (Continuous vs Structured vs Balanced)
    {
      id: 'q6',
      text: 'Your teammate just wrapped a presentation that went sideways. They\'re walking back to their desk. You...',
      options: [
        { label: 'Pull them aside right now: "Hey, can we talk?"', value: 'continuous_real_time' },
        { label: 'Add it to the agenda for your next 1:1', value: 'structured_formal' },
        { label: 'Read the room - if they seem open, mention it now', value: 'balanced_contextual' }
      ],
      allowCustomInput: true
    },

    // Question 7 - Team Culture (Accountability vs Psychological Safety vs Achievement)
    {
      id: 'q7',
      text: 'Your team member asks to push a deadline to improve the quality. The client is waiting. You...',
      options: [
        { label: 'No - we committed, we deliver on time', value: 'accountability_results' },
        { label: 'Let\'s talk through what you need and find a way', value: 'psychological_safety' },
        { label: 'What could you learn by trying something new here?', value: 'growth_development' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - Conflict Resolution (Mediator vs Direct vs Process)
    {
      id: 'q8',
      text: 'Two team members have an ongoing tension. You...',
      options: [
        { label: 'Bring them together to talk it through', value: 'mediating_facilitator' },
        { label: 'Talk to each separately, then address it', value: 'diplomatic_individual' },
        { label: 'Name the issue directly in team meeting', value: 'transparent_direct' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 distinct management styles
  wordMatrix: {
    firstWords: [
      'Decisive',        // Makes calls quickly
      'Collaborative',   // Values team input
      'Flexible',        // Adapts to situations
      'Structured',      // Organized & planned
      'Empowering',      // Delegates authority
      'Hands-On',        // Involved in details
      'Strategic',       // Long-term thinker
      'Supportive',      // Nurturing approach
      'Direct',          // Clear & honest
      'Visionary'        // Big picture focused
    ],
    secondWords: [
      'Coach',           // Develops people
      'Strategist',      // Focused on planning
      'People Champion', // Team wellbeing priority
      'Achiever',        // Outcomes focused
      'Systematizer',    // Systems & efficiency
      'Innovator',       // New ideas & experiments
      'Facilitator',     // Enables team success
      'Mentor',          // Guides & teaches
      'Perfectionist',   // High standards
      'Culture Architect' // Team dynamics focus
    ],
    selectionPrompt: `You're figuring out someone's management style from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (how they lead): {{firstWords}}
SECOND WORDS (what they prioritize): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - how do they actually lead when things get real?
2. Look for patterns: Are they hands-on or hands-off? Do they decide fast or build consensus? What are they trying to create with their team?
3. Pick the FIRST WORD that matches their natural leadership approach (their style, their energy)
4. Pick the SECOND WORD that matches what they care about most (their priority, their goal)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy, evocative subtitle that makes them feel SEEN. Must be a complete sentence ending with punctuation (e.g., 'Your team knows exactly where they stand—and they respect it.' or 'People leave your 1:1s feeling like they can conquer anything.')",
  "reasoning": "2-3 sentence explanation. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason why this was close"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason why this was close"}
  ]
}

IMPORTANT: Do NOT make up names like "Empowering Leader" or "Strategic Manager". Only use exact words from the lists provided.`
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're talking to a friend about their leadership style. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Leadership Blueprint
Talk about how they naturally lead and manage people. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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
Share 2-3 things that are genuinely great about being a {{archetype}} leader. Be specific and real - no corporate fluff. What actually makes this work?
</section>

<section>
## Where It Gets Messy
Here's the honest part: share 1-2 ways this leadership style can backfire or get tricky. Be kind but real - like a friend would tell you.
</section>

<section>
## Tips For Your Growth
Give 2-3 practical, doable tips. Talk like you're giving actual advice to a friend, not writing a professional development plan.
</section>

<section>
## Bottom Line
One real, empowering sentence about what makes their {{archetype}} style valuable as a leader. No fluff - just truth.
</section>

Their answers:
{{answers}}

IMPORTANT: Use contractions (you're, don't, can't, it's). Keep sentences short and punchy. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}

