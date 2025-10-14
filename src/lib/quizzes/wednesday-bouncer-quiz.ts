import { QuizConfig } from './types'

export const wednesdayBouncerQuiz: QuizConfig = {
  id: 'wednesday-bouncer-quiz',
  title: 'Are you really in? 🎟️ ',
  description: 'You need the address for Helen\'s mingle session x mini launch right? Well first you\'ll have to see what Bouncer Blob thinks.',
  type: 'narrative', // Changed to narrative for conversational flow

  theme: {
    primaryColor: '#000000',
    secondaryColor: '#FFD700',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    backgroundImage: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)'
  },

  analyzingMessages: [
    "Bouncer Blob is thinking...",
    "Busy deciding...",
    "Should you be let in?",
    "Almost done..."
  ],

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
    title: '',
    timeframe: '',
    premise: 'Bouncer Blob is evaluating you for Helen\'s Wednesday event.',
    characters: []
  },

  questions: [
    {
      id: 'q1-arrival',
      baseScenario: {
        timeMarker: "Question 1",
        dimension: "timing",
        coreSetup: 'Hey {{lumaName}}, all you need to do is answer truthfully. There are no right answers! The event starts at 5:45 and folks will start being told to leave latest by 8:30. When are you gonna show up?'
      },
      options: [], // No predefined options - open-ended only
      allowCustomInput: true
    },

    {
      id: 'q2-social-style',
      baseScenario: {
        timeMarker: "Question 2",
        dimension: "social-approach",
        coreSetup: 'You\'re standing there, there\'s like {{crowd_size}} people there. What happens? Are you the type to approach someone new or wait for someone to come to you?'
      },
      options: [],
      allowCustomInput: true
    },

    {
      id: 'q3-interesting-thing',
      baseScenario: {
        timeMarker: "Question 3",
        dimension: "depth",
        coreSetup: 'OK what\'s something about you that you\'d want someone else to know?'
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
This is about EFFORT and GENUINE INTEREST, not "right answers." The bar is LOW - if they're putting in ANY real effort and seem interested, approve them. We're looking for people who are clearly NOT trying, not filtering for perfect answers.

RED FLAGS (REJECT - these are the ONLY reasons to reject):
- ALL answers are one-word or extremely minimal with zero personality (e.g., just "6pm", "Yes", "Idk", "Nothing" across the board)
- All responses are generic templates with no human voice ("I'm excited to network!" repeated in different ways)
- Clearly copy-pasted or AI-generated sounding across all answers
- Overall vibe: actively phoning it in, completely disconnected, zero effort

GREEN FLAGS (APPROVE - if you see ANY of these, approve them):
- ANY specific details mentioned (marathon training, startup work, specific interests)
- ANY personality coming through (humor, honesty, casual tone, real voice)
- ANY genuine engagement with the questions (not just one-word answers)
- Showing up as themselves - doesn't need to be elaborate, just REAL
- Even brief answers are fine if they feel genuine and human

THE BAR IS LOW: If someone mentions even ONE specific thing about themselves, shows ANY personality, or gives thoughtful responses to even HALF the questions, APPROVE THEM. Only reject if it's truly zero-effort across the board.

IMPORTANT - DON'T PENALIZE THESE:
- Arriving late or leaving early - timing preferences are totally fine
- Being introverted or waiting to be approached - all social styles welcome
- Not bringing anything to the potluck - no pressure, it's optional
- These are NOT red flags. Only reject if they're clearly not putting in effort to engage.

Respond in JSON:
{
  "decision": "APPROVED" or "REJECTED",
  "likelihood": 75,
  "firstWord": "chosen word from first list",
  "secondWord": "chosen word from second list",
  "tagline": "A warm, funny observation about them. Keep it genuine and light - not kiss-ass, just real.",
  "reasoning": "2-3 sentences that ONLY call out the GOOD parts of their answers. Be specific, funny, and warm. What did you like about their vibe? If REJECTED, end with: 'But maybe we read you wrong - feel free to try again.'",
  "specificObservations": [
    "One specific POSITIVE thing you noticed about their energy/answers",
    "Another POSITIVE observation that stood out",
    "A third POSITIVE detail (even for rejections, find something good to say)"
  ]
}

IMPORTANT:
- Even rejections should call out what was good, then gently note they need to give us more
- Don't list what's WRONG - focus on what's RIGHT (or could be right with more effort)
- Make it feel fun and light, not serious or judgy`
  },

  aiExplanation: {
    enabled: true,
    model: 'claude-3-7-sonnet-latest',
    promptTemplate: `You're Bouncer Blob delivering the verdict! You're fun, whimsical, sassy but never mean. Think velvet rope vibes meets warm personality with a little bite.

YOUR PERSONALITY:
- Conversational and warm, like a friend who tells it like it is
- Playful sass with a bit of edge (but never harsh or judgy)
- Direct, fun, and a little cheeky about it
- Use phrases like "Okay so here's the thing...", "Look...", "Real talk:", "Not gonna lie...", "Listen...", "Alright alright..."
- Add occasional light teasing or observations ("You said X but then Y - I see you")
- Keep it light and whimsical - you're Bouncer Blob!
- Make them feel seen and validated, even if you're being a little sassy

CONTEXT FROM EVALUATION:
- Decision: {{decision}}
- Likelihood of good time: {{likelihood}}%
- Archetype: {{archetype}}
- Tagline: {{tagline}}
- Reasoning: {{reasoning}}
- Specific Observations: {{specificObservations}}

Their full responses:
{{answers}}

Now write the results explanation.

CRITICAL FORMATTING RULES:
- Use ONLY plain text and markdown (paragraphs, ## headers, **bold**)
- DO NOT use <section>, <div>, or ANY HTML tags
- Use --- to separate sections (this will create visual cards)
- Keep it simple and clean

FORMAT (follow this EXACTLY):

{{tagline}}

{{reasoning}}

---

## What to Expect

You're coming in as a {{archetype}}. [Write 1-2 SHORT sentences about what this archetype means for Wednesday night. Be specific to their actual answers. Keep it brief and punchy.]

---

## Bottom Line

[Write 1-2 sentences max. Keep it warm but concise. Reference their {{archetype}} energy.]

TONE GUIDELINES:
- Direct and warm, never corporate
- Make them feel validated and seen
- If rejected, emphasize it's about FIT not WORTH
- Use contractions, keep it conversational
- Be specific to their actual answers - quote or reference them
- No generic platitudes - make it feel real and personal`
  }
}
