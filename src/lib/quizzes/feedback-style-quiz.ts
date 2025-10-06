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
    backgroundImage: 'linear-gradient(135deg, #8b7355 0%, #c9b8a3 50%, #fafafa 100%)'
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
    
    // Question 7 - Receiving vague feedback
    {
      id: 'q7',
      text: 'Someone tells you: "Your work is good but could be more strategic." That\'s all they say. You...',
      options: [
        { label: 'Push for specifics: "Can you give me an example of what that looks like?"', value: 'clarity_seeker' },
        { label: 'Thank them and try to figure it out on my own', value: 'independent_interpreter' },
        { label: 'Ask: "What would \'more strategic\' look like in this case?"', value: 'collaborative_understanding' }
      ],
      allowCustomInput: true
    },

    // Question 8 - Feedback to someone more senior
    {
      id: 'q8',
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
      'Growth Catalyst',    // Development focused
      'Relationship Builder', // Preserve connection
      'Truth-Teller',       // Honesty above all
      'Pragmatist',         // Specific actions focus
      'Coach',              // Teaching approach
      'Mirror',             // Reflection helper
      'Validator',          // Positive reinforcement
      'Perfectionist',      // High bar maintained
      'Problem-Solver',     // Solution-oriented
      'Storyteller'         // Understanding why/context
    ],
    selectionPrompt: `You're figuring out someone's feedback style from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (how they approach feedback): {{firstWords}}
SECOND WORDS (what they're really about): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - how do they actually give and get feedback?
2. Look for patterns: Are they direct or careful? Do they think before speaking or speak to think? What are they trying to create in feedback conversations?
3. Pick the FIRST WORD that matches their natural approach (their style, their energy)
4. Pick the SECOND WORD that matches what they care about most (their priority, their goal)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy, evocative subtitle that makes them feel SEEN. Must be a complete sentence ending with punctuation (e.g., 'You say what everyone's thinking—with receipts.' or 'People leave your feedback sessions feeling capable, not criticized.')",
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
    promptTemplate: `You're talking to a friend about their feedback style. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Feedback Blueprint
Talk about how they naturally give and get feedback. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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

Based on their feedback style and quiz answers, here's your read on their personality:

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

Their answers:
{{answers}}

IMPORTANT: Use contractions (you're, don't, can't, it's). Keep sentences short and punchy. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}

