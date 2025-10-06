import { QuizConfig } from './types'

export const crushQuiz: QuizConfig = {
  id: 'crush-quiz',
  title: 'Do I Have a Crush?',
  description: 'The most honest 8 minutes of your feelings. Let\'s figure out what\'s really going on in your heart.',
  type: 'story-matrix',
  
  theme: {
    primaryColor: '#ec4899',
    secondaryColor: '#fbcfe8',
    backgroundColor: '#fdf2f8',
    textColor: '#831843',
    backgroundImage: 'url(/quiz/crush-quiz/crush-quiz-background.webp), linear-gradient(135deg, #ec4899 0%, #fbcfe8 50%, #fdf2f8 100%)'
  },
  
  questions: [
    // Question 1 - Physical Response
    {
      id: 'q1-notification',
      text: 'Their name pops up on your phone. What happens in your body?',
      options: [
        { label: 'Instant smile, maybe a little heart skip', value: 'excited_rush' },
        { label: 'Comfortable warmth, like hearing from a close friend', value: 'warm_comfort' },
        { label: 'Nervous energy - what do they want?', value: 'anxious_spike' }
      ],
      allowCustomInput: true
    },
    
    // Question 2 - Jealousy Test
    {
      id: 'q2-dating-others',
      text: 'They casually mention going on a date with someone else. Your honest reaction?',
      options: [
        { label: 'Feel a weird pang in my chest I can\'t explain', value: 'jealous_hurt' },
        { label: 'Genuinely happy for them, hope it goes well', value: 'platonic_support' },
        { label: 'Suddenly realize... oh no, I care more than I thought', value: 'realization_moment' }
      ],
      allowCustomInput: true
    },
    
    // Question 3 - Mental Real Estate
    {
      id: 'q3-thinking-about-them',
      text: 'How often do they randomly pop into your head throughout the day?',
      options: [
        { label: 'Constantly. Embarrassingly often.', value: 'obsessive_thoughts' },
        { label: 'Sometimes, like any friend I care about', value: 'normal_frequency' },
        { label: 'Only when something reminds me of them', value: 'situational_thoughts' }
      ],
      allowCustomInput: true
    },
    
    // Question 4 - Social Behavior
    {
      id: 'q4-social-situations',
      text: 'You\'re at a party. They walk in. What happens?',
      options: [
        { label: 'I\'m immediately aware of where they are in the room', value: 'hyper_aware' },
        { label: 'I\'ll probably go say hi, but no rush', value: 'casual_greeting' },
        { label: 'I find a reason to be near them without being obvious', value: 'strategic_proximity' }
      ],
      allowCustomInput: true
    },
    
    // Question 5 - Late Night Energy
    {
      id: 'q5-late-night-texts',
      text: 'It\'s 11:47pm. You\'re texting them about nothing important. How do you feel?',
      options: [
        { label: 'Like this is exactly where I want to be right now', value: 'content_connection' },
        { label: 'Wondering if I\'m reading too much into this', value: 'overthinking_signals' },
        { label: 'Normal. We talk like this all the time.', value: 'comfortable_routine' }
      ],
      allowCustomInput: true
    },
    
    // Question 6 - Physical Proximity
    {
      id: 'q6-touch-proximity',
      text: 'They sit really close to you, arms almost touching. You...',
      options: [
        { label: 'Am VERY aware of every millimeter between us', value: 'electric_tension' },
        { label: 'Feel comfortable and relaxed', value: 'natural_closeness' },
        { label: 'Wonder if they\'re doing this on purpose', value: 'analyzing_intent' }
      ],
      allowCustomInput: true
    },
    
    // Question 7 - Vulnerability Test
    {
      id: 'q7-sharing-feelings',
      text: 'You have big news (good or bad). How quickly do you want to tell them?',
      options: [
        { label: 'They\'re literally the first person I think of', value: 'priority_person' },
        { label: 'They\'re in the group of close people I\'d tell', value: 'inner_circle' },
        { label: 'I\'d tell them eventually, when it comes up', value: 'casual_sharing' }
      ],
      allowCustomInput: true
    },

    // Question 8 - The Honest Question
    {
      id: 'q8-gut-feeling',
      text: 'Be honest with yourself: If they wanted to kiss you right now, you\'d...',
      options: [
        { label: 'Yes. Absolutely yes.', value: 'definite_yes' },
        { label: 'I... don\'t know? Maybe? This is confusing.', value: 'uncertain_maybe' },
        { label: 'No, I don\'t see them that way', value: 'platonic_feelings' }
      ],
      allowCustomInput: true
    }
  ],
  
  // Word Matrix: 10 first words × 10 second words = 100 distinct crush types
  wordMatrix: {
    firstWords: [
      'Intense',           // All-consuming feelings
      'Subtle',            // Quiet, underneath the surface
      'Confusing',         // Mixed signals from self
      'Playful',           // Light, flirty energy
      'Deep',              // Profound emotional connection
      'Hesitant',          // Afraid to admit it
      'Electric',          // Physical chemistry focus
      'Comfortable',       // Easy, natural feeling
      'Undeniable',        // Can't ignore it anymore
      'Questioning'        // Still figuring it out
    ],
    secondWords: [
      'Romantic Crush',              // Classic crush feelings
      'Physical Attraction',         // Body-focused interest
      'Emotional Connection',        // Heart-centered bond
      'Friendship Blur',             // Can't tell friend vs more
      'Late-Night Feelings',         // Hits different at night
      'Fantasy Projection',          // In love with the idea
      'Growing Attachment',          // Slowly developing
      'Comfortable Love',            // Beyond crush, real love
      'Unavailable Person Fixation', // Complicated situation
      'Self-Discovery Journey'       // Learning about yourself
    ],
    selectionPrompt: `You're figuring out someone's crush situation from their quiz answers. Your job: pick ONE combination that actually fits them.

Here are your words:
FIRST WORDS (how intense it feels): {{firstWords}}
SECOND WORDS (what it actually is): {{secondWords}}

What they said:
{{answers}}

How to do this:
1. Read their answers like you're getting to know a real person - what's actually happening with their feelings for this person?
2. Look for patterns: Are they obsessed or just curious? Clear or confused? Is it physical, emotional, or both? New feelings or old ones coming up?
3. Pick the FIRST WORD that matches how their feelings actually feel (the intensity, the quality)
4. Pick the SECOND WORD that matches what this actually is (the type, the nature)
5. Each word means something specific - don't blur them together
6. All options are valid - just find the best fit
7. Find 2 alternatives they were close to (just 2, not more)

Respond in JSON:
{
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A punchy, deeply personal subtitle that captures their specific situation. Must be a complete sentence ending with punctuation. Use 'you' language, make it feel like you're reading their mind.",
  "reasoning": "2-3 sentences explaining why this combination fits their answers. ONLY use the exact combination [FirstWord SecondWord] - do NOT create any other names or terms.",
  "alternatives": [
    {"firstWord": "word1", "secondWord": "word1", "reason": "Brief reason why this was close based on their answers"},
    {"firstWord": "word2", "secondWord": "word2", "reason": "Brief reason why this was close based on their answers"}
  ]
}

CRITICAL: Do NOT make up names like "Real Crush" or "True Love" or "Strong Feelings". Only use exact words from the lists provided. The combination is literally [FirstWord] + [SecondWord], nothing else.`,
  },
  
  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're talking to a friend about their feelings. You get it, you see them, and you're here to help them understand themselves better. They're experiencing "{{archetype}}" - {{tagline}}.

Write like you're having a real conversation - warm, direct, no corporate BS. Think Brené Brown vibes: honest, grounded, human.

<section>
# {{archetype}}
{{tagline}}

## Your Feelings Blueprint
Talk about what they're experiencing. Keep it real and conversational - like you're explaining something you noticed about them over coffee. Reference specific things they said in the quiz.
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
## So... Do You Have a Crush?
Give them straight talk about whether this is a crush, based on what you're seeing. Be kind but real - like a friend would tell you. If it's complicated, say that.
</section>

<section>
## What Works For You
Share 2-3 things that are genuinely great about experiencing {{archetype}}. Be specific and real - no corporate fluff. What actually makes this beautiful or natural?
</section>

<section>
## Where It Gets Messy
Here's the honest part: share 1-2 ways this can get tricky or complicated. Be kind but real - like a friend would tell you.
</section>

<section>
## Dating Advice For You
Give 2-3 practical, doable suggestions. Talk like you're giving actual advice to a friend, not writing a professional development plan. Could be: sit with it, talk to them, give it time, explore it, be careful, enjoy it - whatever fits their situation.
</section>

<section>
## Personality Predictions

Based on how they approach crushes and quiz answers, here's your read on their personality:

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
One real question or insight that helps them think about what they actually want here. No fluff - just truth.
</section>

Their full answers:
{{answers}}

IMPORTANT: Use contractions (you're, don't, can't, it's). Keep sentences short and punchy. Read it out loud - if it sounds weird to say, rewrite it. Use "{{archetype}}" exactly as written. Make them feel seen, not evaluated.`
  }
}

