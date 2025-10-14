import { QuizConfig } from './types'

export const wednesdayBouncerQuiz: QuizConfig = {
  id: 'wednesday-bouncer-quiz',
  title: 'Are you really in?',
  description: 'You need the address for Helen\'s event on Wednesday? Let\'s see if Bouncer Blob lets you in.',
  type: 'narrative', // Changed to narrative for conversational flow

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

  // Minimal story setup needed for adaptive narrative to work (not displayed as separate screen)
  storySetup: {
    premise: 'Bouncer Blob is evaluating you for Helen\'s Wednesday event.',
    characters: []
  },

  questions: [
    {
      id: 'q1-arrival',
      baseScenario: {
        timeMarker: "Question 1",
        dimension: "timing",
        coreSetup: 'So, the event starts at 5:45 and folks will start being told to leave latest by 8:30. When are you gonna show up?'
      },
      options: [], // No predefined options - open-ended only
      allowCustomInput: true
    },

    {
      id: 'q2-social-style',
      baseScenario: {
        timeMarker: "Question 2",
        dimension: "social-approach",
        coreSetup: 'You\'re standing there, there\'s only like {{crowd_size}} people there. What happens? Are you the type to approach someone new or wait for someone to come to you?'
      },
      options: [],
      allowCustomInput: true
    },

    {
      id: 'q3-interesting-thing',
      baseScenario: {
        timeMarker: "Question 3",
        dimension: "depth",
        coreSetup: 'OK what\'s an interesting thing about you that you\'d want someone else to know?'
      },
      options: [],
      allowCustomInput: true
    },

    {
      id: 'q4-followup',
      baseScenario: {
        timeMarker: "Question 4",
        dimension: "followup",
        coreSetup: '[This will be AI-generated based on Q3 answer - a natural conversational follow-up]'
      },
      options: [],
      allowCustomInput: true
    },

    {
      id: 'q5-contribution',
      baseScenario: {
        timeMarker: "Question 5",
        dimension: "contribution",
        coreSetup: 'Last question. Are you going to bring anything? Slippers? Don\'t forget it\'s a no shoe space! You gonna bring snacks or drinks to share cause it\'s potluck style? There\'s no right or wrong answer here.'
      },
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

Here are the words for archetypes:
FIRST WORDS (their energy): {{firstWords}}
SECOND WORDS (their role): {{secondWords}}

Their responses:
{{answers}}

CRITICAL EVALUATION PHILOSOPHY:
This is about EFFORT and GENUINE INTEREST, not "right answers." The bar is: are they actually interested in coming and willing to engage? Did they put in real effort across MOST of their answers?

RED FLAGS (REJECT - low effort or disengaged):
- Most answers are one-word or extremely minimal (e.g., "6pm", "Yes", "Idk")
- Generic, templated responses with no personality ("I'm excited to network!")
- Feels like they're not actually interested or just going through the motions
- Copy-pasted or AI-generated sounding (no human voice)
- Overall vibe: phoning it in, disconnected, not really trying

GREEN FLAGS (APPROVE - genuine interest + effort):
- MOST responses show thought, personality, or engagement (not just one)
- Personal details, specifics, or honest answers coming through
- Showing up as themselves - can be casual, silly, or serious, but it's THEM
- Genuine interest in coming to the event (doesn't need to be effusive, just real)
- Overall vibe: they're trying, they care, they want to be there

THE BAR: You need to see genuine effort and interest across MOST of their 5 answers. A couple short answers is fine if the others show engagement. But if most answers are minimal or generic, reject them. They can always try again with more effort.

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
    promptTemplate: `You're Bouncer Blob delivering the verdict! You're fun, whimsical, a bit sassy but never mean. Think velvet rope vibes meets warm personality.

YOUR PERSONALITY:
- Conversational and warm, like telling a friend the verdict
- A little playful sass (but never harsh)
- Direct but fun about it
- Use phrases like "Okay so here's the thing...", "Look...", "Real talk:", "Not gonna lie..."
- Keep it light and whimsical - you're Bouncer Blob!
- Make them feel seen and validated, even if rejected

CONTEXT FROM EVALUATION:
- Decision: {{decision}}
- Likelihood of good time: {{likelihood}}%
- Archetype: {{archetype}}
- Tagline: {{tagline}}
- Reasoning: {{reasoning}}
- Specific Observations: {{specificObservations}}

Their full responses:
{{answers}}

Now write the results page. Structure it with these sections:

<section>
# You're In ✨

{{tagline}}

{{reasoning}}
</section>

<section>
## What We Noticed About You

Based on your responses, here's what stood out:

[List the specific observations from the evaluation - bullet points are fine. Reference actual things they said. Make it feel personal.]

These aren't judgments - just observations about your energy and how you show up.
</section>

<section>
## Your Wednesday Archetype: {{archetype}}

You're coming in as a {{archetype}}. Here's what that means for Wednesday night:

[Write 2-3 sentences about what this archetype brings to the room. Be specific to their actual answers - reference things they said. Make it feel personal and true.]

[Add 1-2 sentences about what they'll probably get out of the night, based on their archetype.]
</section>

<section>
## What to Expect Wednesday

Here's the vibe:
- **Shoes off, cozy vibes**: This is an intimate living room gathering, not a formal event
- **Deep conversations**: People come ready to talk about ideas, curiosities, what they're working on
- **Unstructured mingling**: No agenda, no presentations - just good people connecting organically
- **Bring your curiosity**: The best nights happen when people are genuinely interested in each other

Based on your {{likelihood}}% likelihood and your {{archetype}} energy, you'll probably vibe well with this format. Come ready to be yourself.
</section>

<section>
## Bottom Line

We're genuinely excited to have you Wednesday. Your {{archetype}} energy is exactly what makes these nights special. See you there.
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
