import { QuizConfig } from './types'

export const feedbackStyleQuiz: QuizConfig = {
  id: 'feedback-style',
  title: 'What\'s Your Feedback Style?',
  description: 'Discover how you really give and receive feedback at work!',
  type: 'story-matrix',
  
  theme: {
    primaryColor: '#8b7355',
    secondaryColor: '#c9b8a3',
    backgroundColor: '#fafafa',
    textColor: '#2c2c2c',
    backgroundImage: '/quiz/feedback-style/background.png'
  },
  
  questions: [
    // Question 1 - Giving critical feedback approach
    {
      id: 'q1',
      text: 'Your teammate just presented work that completely missed the mark. They ask what you think. You say...',
      options: [
        { label: 'Be honest: "This isn\'t quite there yet, here\'s why..."', value: 'direct_honest' },
        { label: 'Start with what worked, then share the gaps', value: 'balanced_sandwich' },
        { label: 'Ask questions to help them see it themselves', value: 'coaching_questions' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - Receiving feedback that's hard to hear
    {
      id: 'q2',
      text: 'Your manager just told you your communication has been unclear lately. Your first reaction?',
      options: [
        { label: 'Ask for specific examples so I can understand', value: 'clarifying_examples' },
        { label: 'Feel defensive but try to listen', value: 'emotional_processing' },
        { label: 'Immediately brainstorm how to improve', value: 'action_oriented' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - In-the-moment feedback
    {
      id: 'q3',
      text: 'You\'re in a meeting. Your colleague just said something inaccurate. Everyone else is nodding. You...',
      options: [
        { label: 'Speak up right then: "Actually, I think..."', value: 'immediate_correction' },
        { label: 'Let it go for now, mention it privately after', value: 'private_later' },
        { label: 'Drop a clarification in the meeting chat', value: 'indirect_correction' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Feedback on interpersonal behavior
    {
      id: 'q4',
      text: 'A team member has been interrupting people constantly. It\'s becoming a problem. Your approach?',
      options: [
        { label: 'Pull them aside: "Hey, I noticed you\'ve been cutting people off..."', value: 'direct_behavior' },
        { label: 'Bring it up in the next 1:1 gently', value: 'scheduled_gentle' },
        { label: 'Address it in the moment: "Hold on, let Sarah finish"', value: 'real_time_redirect' }
      ],
      allowCustomInput: true
    },
    
    // Question 5 - Asking for feedback
    {
      id: 'q5',
      text: 'You just finished a big presentation. You want feedback. What do you do?',
      options: [
        { label: 'Ask immediately: "How did that go? What could be better?"', value: 'proactive_immediate' },
        { label: 'Wait to see if anyone volunteers feedback first', value: 'passive_waiting' },
        { label: 'Ask specific people for specific feedback later', value: 'targeted_strategic' }
      ],
      allowCustomInput: true
    },
    
    // Question 6 - Feedback delivery method
    {
      id: 'q6',
      text: 'You need to give someone constructive feedback. How do you do it?',
      options: [
        { label: 'Schedule a 1:1 video call to talk it through', value: 'synchronous_conversation' },
        { label: 'Write it out in a thoughtful message with examples', value: 'written_detailed' },
        { label: 'Mention it casually in your next check-in', value: 'informal_organic' }
      ],
      allowCustomInput: true
    },
    
    // Question 7 - Feedback frequency preference
    {
      id: 'q7',
      text: 'Your new manager asks how you like to receive feedback. You tell them...',
      options: [
        { label: '"In the moment when you notice something"', value: 'continuous_real_time' },
        { label: '"Let\'s do regular 1:1s where we can discuss"', value: 'structured_scheduled' },
        { label: '"However feels natural to you"', value: 'flexible_adaptive' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - Feedback on sensitive topic
    {
      id: 'q8',
      text: 'Someone on your team has been showing up late to everything. You need to address it. You...',
      options: [
        { label: 'Name it directly: "I\'ve noticed you\'ve been late, what\'s going on?"', value: 'direct_concerned' },
        { label: 'Start with empathy: "Hey, is everything okay? You seem stretched..."', value: 'empathetic_check_in' },
        { label: 'Frame it around impact: "When you\'re late, the team waits..."', value: 'impact_focused' }
      ],
      allowCustomInput: true
    },
    
    // Question 9 - Receiving vague feedback
    {
      id: 'q9',
      text: 'Someone tells you: "Your work is good but could be more strategic." That\'s all they say. You...',
      options: [
        { label: 'Push for specifics: "Can you give me an example of what that looks like?"', value: 'clarity_seeker' },
        { label: 'Thank them and try to figure it out on my own', value: 'independent_interpreter' },
        { label: 'Ask: "What would \'more strategic\' look like in this case?"', value: 'collaborative_understanding' }
      ],
      allowCustomInput: true
    },
    
    // Question 10 - Feedback to someone more senior
    {
      id: 'q10',
      text: 'Your manager made a decision that you think is a mistake. You...',
      options: [
        { label: 'Speak up: "Can I share a different perspective?"', value: 'candid_upward' },
        { label: 'Ask questions to understand their thinking first', value: 'curious_respectful' },
        { label: 'Let it play out unless it\'s critical', value: 'deferential_selective' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 distinct feedback styles
  wordMatrix: {
    firstWords: [
      'Direct',          // Straight to the point
      'Thoughtful',      // Carefully considered
      'Empathetic',      // Feelings-first
      'Candid',          // Brutally honest
      'Diplomatic',      // Tactful & careful
      'Continuous',      // In the moment
      'Structured',      // Formal settings
      'Collaborative',   // Two-way dialogue
      'Supportive',      // Encouraging focus
      'Data-Driven'      // Evidence-based
    ],
    secondWords: [
      'Growth-Pusher',      // Development focused
      'Relationship-Keeper', // Preserve connection
      'Truth-Teller',       // Honesty above all
      'Behavior-Focused',   // Specific actions
      'Coach',              // Teaching approach
      'Mirror',             // Reflection helper
      'Encourager',         // Positive reinforcement
      'Standards-Holder',   // High bar maintained
      'Problem-Solver',     // Solution-oriented
      'Context-Builder'     // Understanding why
    ],
    selectionPrompt: `You are analyzing someone's feedback style based on their quiz responses.

Your task: Select ONE combination of words that best captures this person's approach to feedback.

Available words:
FIRST WORDS (descriptors): {{firstWords}}
SECOND WORDS (priorities): {{secondWords}}

User's answers:
{{answers}}

Instructions:
1. Consider the full story their answers tell - how they give feedback, how they receive it, what they value in feedback conversations
2. Look for patterns in directness, timing, emotional awareness, and what they're trying to achieve with feedback
3. Choose the FIRST WORD that describes their feedback approach (e.g., Direct vs Diplomatic, Continuous vs Structured)
4. Choose the SECOND WORD that describes what they prioritize in feedback (e.g., Growth-Pusher, Relationship-Keeper, Truth-Teller)
5. Each word is DISTINCT - there's clear daylight between them
6. All words are positive - find the best match, not the perfect one
7. Also identify 2 alternative combinations they were close to (not 3, just 2)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy, evocative subtitle that makes them feel SEEN (e.g., 'You say what everyone's thinking—with receipts' or 'People leave your feedback sessions feeling capable, not criticized')",
  "reasoning": "2-3 sentence explanation. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason why this was close"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason why this was close"}
  ]
}

IMPORTANT: Do NOT make up names like "Direct Communicator" or "Honest Coach". Only use exact words from the lists provided.`
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're a feedback and communication expert analyzing someone's feedback style. They are a "{{archetype}}" - {{tagline}}.

Write a warm, engaging explanation with these sections:

## Your Feedback DNA
Start with "As {{archetype}}, you..." and write 2-3 sentences about their core feedback approach. Make sure the description aligns with their tagline: "{{tagline}}". Reference their actual quiz answers.

## What I Noticed
Highlight 2-3 specific patterns from their actual answers that show they're {{archetype}}:
- When they answered [specific answer], that shows [insight about {{archetype}}]
- Their choice of [specific answer] reveals [trait]
- [Another answer-to-trait connection]

## You Were Also Close To...
{{alternatives}}

Write 1 engaging sentence for each alternative style explaining why they showed hints of it.

## Tips for Your Growth as {{archetype}}
Give 2 practical tips tailored to {{archetype}}. Format: "As {{archetype}}, consider..."

## Your Feedback Superpower
End with an inspiring sentence about the unique value they bring as {{archetype}} when giving and receiving feedback.

Their answers:
{{answers}}

Use "{{archetype}}" consistently throughout. Be personal, insightful, and specific. Use markdown with ## for headers.`
  }
}

