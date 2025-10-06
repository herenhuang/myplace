import { QuizConfig } from './types'

export const flirtingStyleQuiz: QuizConfig = {
  id: 'flirting-style',
  title: 'What\'s Your Flirting Style?',
  description: 'Find out how you really show interest when you\'re into someone. (No judgment, just vibes.)',
  type: 'story-matrix',
  
  theme: {
    primaryColor: '#f97316',
    secondaryColor: '#fed7aa',
    backgroundColor: '#fff7ed',
    textColor: '#7c2d12',
    backgroundImage: 'linear-gradient(135deg, #f97316 0%, #fed7aa 50%, #fff7ed 100%)'
  },
  
  questions: [
    // Question 1 - Initial Approach
    {
      id: 'q1',
      text: 'You\'re at a party. Someone across the room catches your eye. What happens next?',
      options: [
        { label: 'Walk over and start talking - "Hey, I had to come say hi"', value: 'bold_direct' },
        { label: 'Casually position myself nearby and wait for a natural opening', value: 'subtle_strategic' },
        { label: 'Make eye contact and smile, hoping they come to me', value: 'passive_hopeful' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - Conversation Style
    {
      id: 'q2',
      text: 'You\'re in the middle of a conversation with someone you\'re into. What are you doing?',
      options: [
        { label: 'Teasing them playfully and keeping the banter going', value: 'teasing_playful' },
        { label: 'Asking deep questions - "What\'s something you\'re passionate about?"', value: 'deep_genuine' },
        { label: 'Making them laugh and keeping things light and easy', value: 'light_humorous' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Physical Touch
    {
      id: 'q3',
      text: 'When it comes to physical touch while flirting, you...',
      options: [
        { label: 'Find reasons to touch - arm, shoulder, playful shove', value: 'tactile_toucher' },
        { label: 'Let the moment dictate - if it feels right, sure', value: 'natural_reader' },
        { label: 'Avoid touch until I\'m SURE they\'re into it', value: 'cautious_respectful' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Compliment Style
    {
      id: 'q4',
      text: 'Your compliment game looks like...',
      options: [
        { label: 'Specific and bold - "That smile is dangerous"', value: 'bold_flirty' },
        { label: 'Thoughtful and genuine - notice little things', value: 'genuine_observer' },
        { label: 'Casual and indirect - "Cool shirt" counts, right?', value: 'subtle_casual' }
      ],
      allowCustomInput: true
    },
    
    // Question 5 - Text/Message Energy
    {
      id: 'q5',
      text: 'In your text conversations with someone you like, you...',
      options: [
        { label: 'Flirty emojis, playful innuendos, keep it spicy', value: 'flirty_texter' },
        { label: 'Thoughtful messages, ask real questions, build connection', value: 'meaningful_connector' },
        { label: 'Casual and chill - don\'t want to seem too eager', value: 'casual_cool' }
      ],
      allowCustomInput: true
    },
    
    // Question 6 - Eye Contact
    {
      id: 'q6',
      text: 'When making eye contact with someone you\'re attracted to...',
      options: [
        { label: 'Hold it with a little smile - let them know I see them', value: 'confident_holder' },
        { label: 'Quick glances then look away (but do it multiple times)', value: 'shy_repeater' },
        { label: 'Full intense eye contact - no games', value: 'intense_direct' }
      ],
      allowCustomInput: true
    },
    
    // Question 7 - Vulnerability Level
    {
      id: 'q7',
      text: 'They just shared something personal. How do you respond?',
      options: [
        { label: 'Match their vulnerability - share something real about myself', value: 'open_authentic' },
        { label: 'Listen and empathize, but keep my own cards close for now', value: 'guarded_protective' },
        { label: 'Test the waters with a small personal detail, see how it lands', value: 'balanced_tester' }
      ],
      allowCustomInput: true
    },
    
    // Question 8 - Escalation Style
    {
      id: 'q8',
      text: 'When it comes to escalating from flirting to something more, you...',
      options: [
        { label: 'Make it clear what I want - "Want to grab a drink?"', value: 'clear_initiator' },
        { label: 'Drop hints and hope they pick up on them', value: 'hint_dropper' },
        { label: 'Wait for them to make the first real move', value: 'receiver_waiter' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 distinct flirting styles
  wordMatrix: {
    firstWords: [
      'Bold',              // Unafraid, goes for it
      'Subtle',            // Understated, indirect
      'Playful',           // Fun, teasing energy
      'Genuine',           // Authentic, real connection
      'Confident',         // Self-assured approach
      'Shy',               // Hesitant, nervous energy
      'Strategic',         // Calculated, thoughtful moves
      'Natural',           // Effortless, flows easily
      'Intense',           // Deep, serious energy
      'Casual'             // Laid-back, no pressure
    ],
    secondWords: [
      'Charmer',           // Smooth talker
      'Teaser',            // Playful banter expert
      'Romantic',          // Classic romantic gestures
      'Connector',         // Emotional bond builder
      'Flirt',             // Traditional flirty energy
      'Admirer',           // Appreciator from afar
      'Conversationalist', // Talk-focused
      'Initiator',         // Active first-mover
      'Gazer',             // Non-verbal eye contact expert
      'Builder'            // Takes time to develop connection
    ],
    selectionPrompt: `You're figuring out someone's flirting style from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (their natural energy when flirting): {{firstWords}}
SECOND WORDS (what they actually do): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - how do they actually flirt when they like someone?
2. Look for patterns: Are they bold or shy? Physical or verbal? Do they go for it or drop hints? What's their actual move?
3. Pick the FIRST WORD that matches their natural flirting energy (their vibe, their confidence level)
4. Pick the SECOND WORD that matches what they're really about (their method, their signature move)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A fun, punchy subtitle that captures their flirting vibe. Must be a complete sentence ending with punctuation. Use 'you' language, be playful and honest.",
  "reasoning": "2-3 sentences explaining why this combination fits their answers. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names or terms.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason why this was close based on their answers"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason why this was close based on their answers"}
  ]
}

CRITICAL: Do NOT make up names like "Bold Flirt" or "Smooth Operator" unless those EXACT words are in the lists. Only use exact words from the lists provided. The combination is literally [FirstWord] + [SecondWord], nothing else.`,
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're talking to a friend about their flirting style. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Flirting Blueprint
Talk about how they naturally flirt and show interest. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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
## Dating Advice For You
Give 2-3 practical, doable tips. Talk like you're giving actual advice to a friend, not writing a professional development plan.
</section>

<section>
## Bottom Line
One real, empowering sentence about what makes their {{archetype}} style valuable. No fluff - just truth.
</section>

Their full answers:
{{answers}}

IMPORTANT: Use contractions (you're, don't, can't, it's). Keep sentences short and punchy. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}

