import { QuizConfig } from './types'

export const relationshipCommunicationQuiz: QuizConfig = {
  id: 'relationship-communication',
  title: 'What\'s Your Relationship Communication Style?',
  description: 'Discover how you really talk, listen, and connect when you\'re dating someone.',
  type: 'story-matrix',

  theme: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#c4b5fd',
    backgroundColor: '#faf5ff',
    textColor: '#5b21b6',
    backgroundImage: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 50%, #faf5ff 100%)'
  },

  questions: [
    // Question 1 - Opening up
    {
      id: 'q1',
      text: 'Your partner asks "How are you really doing?" after a hard day. You...',
      options: [
        { label: 'Launch into the full story - every detail, every feeling', value: 'expressive_open' },
        { label: 'Give them the headline: "Rough. Here\'s what happened..."', value: 'direct_concise' },
        { label: 'Deflect: "I\'m fine. How was YOUR day?"', value: 'avoidant_deflecting' }
      ],
      allowCustomInput: true
    },

    // Question 2 - Noticing they're upset
    {
      id: 'q2',
      text: 'They seem off but haven\'t said anything. What do you actually do?',
      options: [
        { label: 'Ask directly: "Something\'s wrong. What is it?"', value: 'direct_confronting' },
        { label: 'Wait quietly for them to bring it up on their own', value: 'passive_patient' },
        { label: 'Observe gently: "You seem quiet. I\'m here when you\'re ready."', value: 'gentle_inviting' }
      ],
      allowCustomInput: true
    },

    // Question 3 - They share a problem
    {
      id: 'q3',
      text: 'They tell you about something stressing them out. Your first instinct?',
      options: [
        { label: 'Start problem-solving: "Have you tried...?"', value: 'solving_fixing' },
        { label: 'Listen fully and validate: "That sounds really hard."', value: 'validating_holding' },
        { label: 'Share your own similar experience to relate', value: 'relating_sharing' }
      ],
      allowCustomInput: true
    },

    // Question 4 - Minor disagreement
    {
      id: 'q4',
      text: 'You disagree about plans. The tension is building. What happens?',
      options: [
        { label: 'State my case clearly and ask what they actually want', value: 'direct_assertive' },
        { label: 'Back down to keep the peace: "Your way is fine."', value: 'accommodating_yielding' },
        { label: 'Look for middle ground: "What if we compromise?"', value: 'compromising_mediating' }
      ],
      allowCustomInput: true
    },

    // Question 5 - Conflict escalates
    {
      id: 'q5',
      text: 'The argument gets heated. They say something that stings. You...',
      options: [
        { label: 'Call it out immediately: "That hurt. Why would you say that?"', value: 'confronting_direct' },
        { label: 'Shut down and withdraw - I need space to process this', value: 'withdrawing_protecting' },
        { label: 'Pause the whole thing: "We\'re both upset. Let\'s take a break."', value: 'pausing_regulating' }
      ],
      allowCustomInput: true
    },

    // Question 6 - After the fight
    {
      id: 'q6',
      text: 'An hour later, you\'ve both cooled down. What do you do?',
      options: [
        { label: 'Bring it back up: "Can we talk about what happened?"', value: 'initiating_resolving' },
        { label: 'Wait for them to apologize or re-open it first', value: 'waiting_receiving' },
        { label: 'Let it go - we both know it got messy, moving on', value: 'releasing_moving' }
      ],
      allowCustomInput: true
    },

    // Question 7 - Relationship check-in
    {
      id: 'q7',
      text: 'They want to talk about "where we are" in the relationship. How do you feel?',
      options: [
        { label: 'Ready - I\'ve been wanting this conversation too', value: 'eager_open' },
        { label: 'Cautious - need to gauge where they\'re at first', value: 'guarded_reading' },
        { label: 'Anxious - these talks make me nervous but I\'ll try', value: 'nervous_willing' }
      ],
      allowCustomInput: true
    },

    // Question 8 - Receiving vulnerability
    {
      id: 'q8',
      text: 'They share a deep fear or insecurity with you. What do you do?',
      options: [
        { label: 'Reassure immediately: "You don\'t need to worry about that."', value: 'reassuring_comforting' },
        { label: 'Ask gentle questions to understand more deeply', value: 'curious_exploring' },
        { label: 'Share something vulnerable back to match their openness', value: 'reciprocating_matching' }
      ],
      allowCustomInput: true
    }
  ],

  wordMatrix: {
    firstWords: [
      'Direct',           // Says it straight
      'Gentle',           // Soft, careful
      'Expressive',       // Open, shares freely
      'Thoughtful',       // Considered, deliberate
      'Emotional',        // Feelings-first
      'Diplomatic',       // Tactful, balanced
      'Guarded',          // Protected, cautious
      'Intense',          // Deep, serious
      'Playful',          // Light, humorous
      'Quiet'             // Reserved, subtle
    ],
    secondWords: [
      'Communicator',     // General style
      'Listener',         // Focuses on hearing
      'Sharer',           // Opens up easily
      'Processor',        // Needs time to think
      'Resolver',         // Fixes/solves
      'Validator',        // Makes others feel heard
      'Questioner',       // Asks to understand
      'Observer',         // Watches and reads
      'Initiator',        // Starts conversations
      'Responder'         // Reacts to others
    ],
    selectionPrompt: `You're figuring out someone's relationship communication style from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (how they communicate): {{firstWords}}
SECOND WORDS (what they're really about): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - how do they actually communicate when they're in a relationship?
2. Look for patterns: Are they direct or gentle? Do they open up or hold back? How do they handle conflict? What happens when things get vulnerable?
3. Pick the FIRST WORD that matches their natural communication approach (their style, their energy)
4. Pick the SECOND WORD that matches what they care about most (their role, their priority)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A specific, resonant subtitle about their communication. Must be a complete sentence ending with punctuation. Use 'you' language.",
  "reasoning": "2-3 sentences explaining why this combination fits their specific answers.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason based on their answers"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason based on their answers"}
  ]
}

CRITICAL: Only use exact words from the lists provided. The combination is [FirstWord] + [SecondWord].`,
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-5-sonnet-20241022',
    promptTemplate: `You're talking to a friend about their relationship communication style. You get it, you see them, and you're here to help them understand themselves better. They're a "{{archetype}}" - {{tagline}}.

TARGET LENGTH: ~1500-2000 words total. Be conversational but economical with words.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Communication Blueprint
Talk about how they naturally communicate in relationships. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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
## Personality Predictions

Based on their communication style and quiz answers, here's your read on their personality:

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

Their full answers:
{{answers}}

IMPORTANT: 2-3 sentences per section MAX. Use contractions (you're, don't, can't, it's). Short, punchy sentences. No fluff - if you can cut a word, cut it. Make every word earn its place. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}
