import { QuizConfig } from './types'

export const managerStyleQuiz: QuizConfig = {
  id: 'manager-style',
  title: 'What\'s Your Manager Style?',
  description: 'Discover your unique leadership approach!',
  type: 'story-matrix',
  
  theme: {
    primaryColor: '#7c3aed',
    secondaryColor: '#a78bfa',
    backgroundColor: '#faf5ff',
    textColor: '#1f2937',
    backgroundImage: '/elevate/marble.png'
  },
  
  questions: [
    // Question 1 - Decision making approach
    {
      id: 'q1',
      text: 'A major decision needs to be made quickly. What\'s your move?',
      options: [
        { label: 'Gather input from the team, then decide', value: 'collaborative_input' },
        { label: 'Trust my gut and decide fast', value: 'decisive_quick' },
        { label: 'Analyze data thoroughly before choosing', value: 'analytical_data' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - Team conflict
    {
      id: 'q2',
      text: 'Two team members are in conflict. How do you handle it?',
      options: [
        { label: 'Mediate immediately - get everyone talking', value: 'facilitator_mediate' },
        { label: 'Coach each person individually first', value: 'coach_individual' },
        { label: 'Set clear expectations and let them work it out', value: 'empowering_autonomous' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Communication style
    {
      id: 'q3',
      text: 'You need to communicate a new initiative. Your approach?',
      options: [
        { label: 'Paint the big picture vision first', value: 'visionary_inspire' },
        { label: 'Explain the why, the what, and the how', value: 'structured_detail' },
        { label: 'Share the goal and let teams figure out how', value: 'delegator_trust' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Delegation habits
    {
      id: 'q4',
      text: 'A critical project needs an owner. What do you do?',
      options: [
        { label: 'Pick the best person and give them autonomy', value: 'empowering_trust' },
        { label: 'Delegate but stay closely involved', value: 'hands_on_guide' },
        { label: 'Create clear milestones and check-ins', value: 'structured_track' }
      ],
      allowCustomInput: true
    },
    
    // Question 5 - Feedback approach
    {
      id: 'q5',
      text: 'Time for performance reviews. Your style?',
      options: [
        { label: 'Focus on growth opportunities and potential', value: 'coach_develop' },
        { label: 'Give direct, clear feedback - no sugar coating', value: 'driver_direct' },
        { label: 'Balance praise with constructive feedback', value: 'supporter_balance' }
      ],
      allowCustomInput: true
    },
    
    // Question 6 - Crisis handling
    {
      id: 'q6',
      text: 'Everything is on fire. What\'s your instinct?',
      options: [
        { label: 'Jump in and help solve it hands-on', value: 'hands_on_action' },
        { label: 'Step back, assess, then strategize', value: 'strategic_assess' },
        { label: 'Rally the team and coordinate response', value: 'facilitator_organize' }
      ],
      allowCustomInput: true
    },
    
    // Question 7 - Team development
    {
      id: 'q7',
      text: 'You have budget for team development. What do you prioritize?',
      options: [
        { label: 'Skills training for immediate needs', value: 'organizer_practical' },
        { label: 'Leadership development for future growth', value: 'mentor_future' },
        { label: 'Innovation time - let them explore', value: 'innovator_explore' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - Management philosophy
    {
      id: 'q8',
      text: 'What makes you proudest as a manager?',
      options: [
        { label: 'When my team exceeds their goals', value: 'driver_results' },
        { label: 'When someone I mentored gets promoted', value: 'mentor_growth' },
        { label: 'When the team solves problems without me', value: 'empowering_independence' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 distinct combinations
  wordMatrix: {
    firstWords: [
      'Decisive',       // Makes quick, clear decisions
      'Collaborative',  // Values team input heavily
      'Strategic',      // Big picture thinker
      'Hands-on',       // Gets involved in details
      'Empowering',     // Trusts and delegates
      'Analytical',     // Data-driven decisions
      'Intuitive',      // Gut-feel decisions
      'Structured',     // Process and systems oriented
      'Flexible',       // Adapts approach as needed
      'Visionary'       // Future-focused inspiration
    ],
    secondWords: [
      'Coach',          // Develops people through guidance
      'Delegator',      // Assigns and trusts
      'Mentor',         // Long-term people development
      'Driver',         // Results and goal focused
      'Facilitator',    // Enables team collaboration
      'Strategist',     // Plans and positions
      'Supporter',      // Backs the team emotionally
      'Innovator',      // Encourages new ideas
      'Organizer',      // Creates structure and clarity
      'Motivator'       // Energizes and inspires
    ],
    selectionPrompt: `You are analyzing a manager's leadership style based on their quiz responses.

Your task: Select ONE combination of words that best captures this person's management personality.

Available words:
FIRST WORDS (descriptors): {{firstWords}}
SECOND WORDS (archetypes): {{secondWords}}

User's answers:
{{answers}}

Instructions:
1. Consider the full story their answers tell - how they make decisions, handle people, and approach problems
2. Look for patterns in their decision-making, communication, delegation, and what they value as a leader
3. Choose the FIRST WORD that describes their leadership approach (e.g., Decisive vs Collaborative, Strategic vs Hands-on)
4. Choose the SECOND WORD that describes their primary leadership focus (e.g., Coach, Driver, Facilitator)
5. Each word is DISTINCT - there's clear daylight between them
6. All words are positive - find the best match, not the perfect one
7. Also identify 2 alternative combinations they were close to (not 3, just 2)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "reasoning": "2-3 sentence explanation. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason why this was close"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason why this was close"}
  ]
}

IMPORTANT: Do NOT make up names like "Transformational Leader" or "Visionary Manager". Only use exact words from the lists provided.`
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a leadership expert analyzing someone's management style. They are a "{{archetype}}".

Write a warm, engaging explanation with these sections:

## Your Leadership DNA
Start with "As {{archetype}}, you..." and write 2-3 sentences about their core leadership approach. Reference their actual quiz answers.

## What I Noticed
Highlight 2-3 specific patterns from their actual answers that show they're {{archetype}}:
- When they answered [specific answer], that shows [insight about {{archetype}}]
- Their choice of [specific answer] reveals [trait]
- [Another answer-to-trait connection]

## You Were Also Close To...
{{alternatives}}

Write 1 engaging sentence for each alternative style explaining why they showed hints of it.

## Tips for Your Leadership
Give 1-2 practical tips for {{archetype}}. Format: "As {{archetype}}, you should..."

## Where This Takes You
End with an inspiring sentence about their leadership journey as {{archetype}}.

Their answers:
{{answers}}

Use "{{archetype}}" consistently throughout. Be personal and energetic. Use markdown with ## for headers.`
  }
}

