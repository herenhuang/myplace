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
    selectionPrompt: `You are analyzing a manager's leadership style based on their quiz responses.

Your task: Select ONE combination of words that best captures this person's management approach.

Available words:
FIRST WORDS (descriptors): {{firstWords}}
SECOND WORDS (priorities): {{secondWords}}

User's answers:
{{answers}}

Instructions:
1. Consider the full story their answers tell - how they lead, what they prioritize, how they handle challenges
2. Look for patterns in decision-making, communication style, team development, and what drives them
3. Choose the FIRST WORD that describes their leadership approach (e.g., Decisive vs Collaborative, Direct vs Supportive)
4. Choose the SECOND WORD that describes what they prioritize as a manager (e.g., Coach, Results Driver, Culture Builder)
5. Each word is DISTINCT - there's clear daylight between them
6. All words are positive - find the best match, not the perfect one
7. Also identify 2 alternative combinations they were close to (not 3, just 2)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy, evocative subtitle that makes them feel SEEN (e.g., 'Your team knows exactly where they stand—and they respect it' or 'People leave your 1:1s feeling like they can conquer anything')",
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
    promptTemplate: `You're a leadership expert analyzing someone's management style. They are a "{{archetype}}" - {{tagline}}.

Write a warm, engaging explanation with these sections. IMPORTANT: Do NOT include "{{archetype}}" or "The {{archetype}}" as a header - the name is already displayed above.

<section>
## Your Leadership Blueprint
Write 2-3 sentences about their core leadership approach using "you" language (not "As {{archetype}}, you..."). Make it feel personal and connect to their tagline. Reference their actual quiz answers to show you get their specific vibe.
</section>

<section>
## What I Noticed
Highlight 3 specific patterns from their actual answers that show their management style:
- When you answered [specific answer], that shows [insight about their style]
- Your choice of [specific answer] reveals [trait]
- [Another answer-to-trait connection]
</section>

<section>
## You're Also Close To...
{{alternatives}}

Write 1-2 sentences for each alternative style explaining why they showed hints of it based on their answers.
</section>

<section>
## What Works For You
Give 2-3 strengths of being a {{archetype}}. What makes this leadership style effective? Be encouraging and specific.
</section>

<section>
## Where It Gets Messy
Share 1-2 honest observations about common pitfalls or challenges for a {{archetype}}. Be supportive, not critical.
</section>

<section>
## Tips For Your Growth
Give 2-3 practical tips for growth using "you" language. Be encouraging and actionable.
</section>

<section>
## Bottom Line
End with one empowering sentence about owning their {{archetype}} style and the unique impact they bring as a leader.
</section>

Their answers:
{{answers}}

When referring to their style, use the exact term "{{archetype}}" (never shorten or modify it). Be personal, insightful, and specific. Use markdown with ## for section headers.`
  }
}

