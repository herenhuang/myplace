import { QuizConfig } from './types'

export const wednesdayBouncerQuiz: QuizConfig = {
  id: 'wednesday-bouncer-quiz',
  title: 'Wednesday Vibe Check',
  description: 'Tell us about yourself. We\'re listening.',
  type: 'story-matrix',

  theme: {
    primaryColor: '#000000',
    secondaryColor: '#FFD700',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    backgroundImage: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)'
  },

  personalizationForm: {
    instructions: 'First, let us know who you are.',
    fields: [
      {
        id: 'email',
        question: 'Email',
        type: 'text',
        placeholder: 'your@email.com',
        required: true
      },
      {
        id: 'name',
        question: 'Name (optional)',
        type: 'text',
        placeholder: 'How should we call you?',
        required: false
      }
    ]
  },

  questions: [
    {
      id: 'q1-energy',
      text: 'What kind of energy are you bringing to Wednesday night?',
      options: [], // No predefined options - open-ended only
      allowCustomInput: true
    },

    {
      id: 'q2-excitement',
      text: 'What gets you most excited about coming to this?',
      options: [],
      allowCustomInput: true
    },

    {
      id: 'q3-conversation',
      text: 'Tell me about the best conversation you\'ve had recently.',
      options: [],
      allowCustomInput: true
    },

    {
      id: 'q4-curiosity',
      text: 'What\'s something you\'ve been curious about or thinking about lately?',
      options: [],
      allowCustomInput: true
    },

    {
      id: 'q5-contribution',
      text: 'What do you think you\'ll bring to the room on Wednesday?',
      options: [],
      allowCustomInput: true
    }
  ],

  // Word Matrix for generating decision + archetype
  wordMatrix: {
    firstWords: [
      'Radiant',      // High energy, infectious enthusiasm
      'Thoughtful',   // Deep, contemplative energy
      'Playful',      // Light, fun vibes
      'Genuine',      // Authentic, real
      'Magnetic',     // Draws people in
      'Curious',      // Question-asker, explorer
      'Bold',         // Confident, unafraid
      'Warm',         // Kind, welcoming energy
      'Creative',     // Brings unique perspective
      'Electric'      // High voltage presence
    ],
    secondWords: [
      'Conversationalist',    // Great at dialogue
      'Connector',            // Brings people together
      'Observer',             // Thoughtful watcher
      'Catalyst',             // Makes things happen
      'Explorer',             // Always learning
      'Storyteller',          // Shares experiences
      'Listener',             // Really hears people
      'Enthusiast',           // Genuinely excited
      'Philosopher',          // Big thinker
      'Collaborator'          // Team player
    ],
    selectionPrompt: `You're a bouncer evaluating someone for Wednesday night. Based on their 5 conversational responses, you need to:

1. Make a decision: APPROVED or REJECTED (but make rejection feel kind - "maybe we read you wrong")
2. Assign a likelihood percentage (0-100%) of them having a good time on Wednesday
3. If APPROVED, give them an archetype that describes what kind of participant they'll be
4. Evaluate on: genuine enthusiasm, authenticity, vibe alignment, interestingness

Here are the words for archetypes:
FIRST WORDS (their energy): {{firstWords}}
SECOND WORDS (their role): {{secondWords}}

Their responses:
{{answers}}

CRITICAL EVALUATION CRITERIA:
- Genuine enthusiasm: Do they actually care about this? Or just saying what they think we want to hear?
- Authenticity: Are they being real? Do their answers feel honest and human?
- Vibe alignment: Would they actually vibe with an intimate, thoughtful gathering?
- Interestingness: Do they bring curiosity, depth, or unique perspective?

RED FLAGS (lean toward REJECTED):
- Generic, templated responses ("I'm excited to network and meet new people!")
- Zero specificity or personal detail
- Overly professional/corporate language
- Responses that feel AI-generated or copy-pasted
- No curiosity or depth
- Can't articulate what they'd bring

GREEN FLAGS (lean toward APPROVED):
- Specific, personal stories or examples
- Genuine curiosity about something
- Self-awareness and honesty
- Interesting perspective or way of thinking
- Real enthusiasm that comes through in their voice
- Clear sense of what they'd contribute

Respond in JSON:
{
  "decision": "APPROVED" or "REJECTED",
  "likelihood": 75,
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A warm, validating observation about them. Even if rejected, make them feel seen. Use 'you' language.",
  "reasoning": "2-3 sentences explaining your decision. If REJECTED, end with: 'But maybe we read you wrong - feel free to try again.' Keep it kind and validating.",
  "specificObservations": [
    "One specific thing you noticed about their energy/answers",
    "Another specific observation that stood out",
    "A third detail that informed your decision"
  ]
}

IMPORTANT:
- All feedback must be kind and validating, even for rejection
- Make them feel seen and understood
- If rejected, it should NOT feel like they're not good enough
- Focus on fit and vibe, not worthiness
- Include "maybe we read you wrong" for rejections to keep door open`
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're delivering the verdict from the bouncer evaluation. Be warm, specific, and make them feel truly seen.

CONTEXT FROM EVALUATION:
- Decision: {{decision}}
- Likelihood of good time: {{likelihood}}%
- Archetype: {{archetype}}
- Tagline: {{tagline}}
- Reasoning: {{reasoning}}
- Specific Observations: {{specificObservations}}

Their full responses:
{{answers}}

Now write the results page. Structure it exactly like this:

<section>
# [If APPROVED: "You're In ✨" | If REJECTED: "Not Quite The Vibe (But Maybe We're Wrong?)"]

{{tagline}}

{{reasoning}}
</section>

<section>
## What We Noticed About You

Based on your responses, here's what stood out:

[List the specific observations from the evaluation. Reference actual things they said. Make it feel personal.]

These aren't judgments - just observations about your energy and how you show up.
</section>

[ONLY IF APPROVED - include these sections:]
<section>
## Your Wednesday Archetype: {{archetype}}

You're coming in as a {{archetype}}. Here's what that means for Wednesday night:

[Write 2-3 sentences about what this archetype brings to the room. Be specific to their actual answers - reference things they said. Make it feel personal and true.]

[Add 1-2 sentences about what they'll probably get out of the night, based on their archetype.]
</section>

<section>
## Likelihood of a Good Time: {{likelihood}}%

[Explain why this percentage in 2-3 sentences. Be honest and specific. Reference their actual vibe/answers. If it's lower than 80%, be kind about why - maybe they seemed hesitant, or their interests might not fully align, but there's still potential.]
</section>

<section>
## What to Expect

[Give them 2-3 specific things to expect on Wednesday night based on their archetype and responses. Make it feel real and grounded, not generic.]
</section>

[ONLY IF REJECTED - include these sections instead:]
<section>
## The Honest Truth

[Explain gently why the vibe didn't quite match. Be specific but kind. Maybe their energy seemed off, or their answers felt surface-level, or something just didn't click. Make it about fit, not worthiness.]

But here's the thing: we might have totally read you wrong. These questions are just one snapshot. If you feel like you didn't show your real self, **try again**. Answer differently. Let us see more of who you actually are.

This isn't a rejection of YOU - it's just a vibe check that didn't fully align. And that's okay.
</section>

<section>
## If You Try Again

[Give them 1-2 kind suggestions about what would help them get approved. Be specific and constructive, not preachy. Maybe: be more specific, share a real story, let personality come through, etc.]
</section>

<section>
## Bottom Line

[If APPROVED: We're genuinely excited to have you Wednesday. Your {{archetype}} energy is exactly what makes these nights special. See you there.]

[If REJECTED: You seem interesting - we just didn't quite catch the full picture. If you want to try again and show us more of your real self, we're here for it. No hard feelings either way.]
</section>

TONE GUIDELINES:
- Direct and warm, never corporate
- Make them feel validated and seen
- If rejected, emphasize it's about FIT not WORTH
- Use contractions, keep it conversational
- Be specific to their actual answers - quote or reference them
- No generic platitudes - make it feel real and personal`
  }
}
