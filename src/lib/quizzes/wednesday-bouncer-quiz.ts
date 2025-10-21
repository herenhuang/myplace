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
    "Almost done...",
    "Or is it...",
    "Ready to judge..."
  ],

  personalizationForm: {
    instructions: 'I\'m Bouncer Blob, here to figure out whether you should actually get into Helen\'s whatever the heck it is.',
    fields: [
      {
        id: 'email',
        question: '',
        type: 'text',
        placeholder: 'your@email.com',
        required: true
      }
    ]
  },

  // Custom branding for Wednesday quiz
  customImages: {
    analyzingScreen: '/bouncerblob.png',
    questionBubble: '/bouncerblob2.png'
  },

  // Email validation against Luma guest list
  emailValidation: {
    enabled: true,
    endpoint: '/api/luma/check-email',
    errorMessage: 'Hmm, I don\'t see this email on the Luma list. Can you double-check?'
  },

  // Use approval-rejection results layout
  resultsLayout: 'approval-rejection',

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
        coreSetup: 'Howdy {{lumaName}}! You\'re on the Luma list... but to get in... I\'ma need to ask you some more questions. There are no *right* answers though, there\'s just *your* answers.\n\nAnyhow! The event starts at 5:45 and folks will start being told to leave latest by 8:30. When are you gonna show up? Tell me a bit about why that time works for you.'
      },
      options: [], // No predefined options - open-ended only
      allowCustomInput: true
    },

    {
      id: 'q2-social-style',
      baseScenario: {
        timeMarker: "Question 2",
        dimension: "social-approach",
        coreSetup: 'You\'re standing there, there\'s like {{crowd_size}} people there. What happens? Are you the type to approach someone new or wait for someone to come to you? Walk me through how you usually vibe at these things.'
      },
      options: [],
      allowCustomInput: true
    },

    {
      id: 'q3-interesting-thing',
      baseScenario: {
        timeMarker: "Question 3",
        dimension: "depth",
        coreSetup: 'OK what\'s something about you that you\'d want someone else to know? Can be anything - give me a little story or detail.'
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
        coreSetup: 'Last question. Are you going to bring anything? Slippers? Don\'t forget it\'s a no shoe space! You gonna bring snacks or drinks to share cause it\'s potluck style? What\'s your vibe here?'
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
    model: 'claude-3-5-sonnet-20241022',
    promptTemplate: `You're Bouncer Blob delivering the verdict! You're fun, whimsical, sassy but never mean. Think velvet rope vibes meets warm personality with a little bite.

TARGET LENGTH: Keep it brief and punchy - 300-500 words max for approvals, 2-3 sentences for rejections.

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

FORMAT FOR APPROVED:

{{tagline}}

{{reasoning}}

---

## What to Expect

[Write 1-2 SHORT sentences about what this archetype means for Wednesday night. IMPORTANT: Reference specific details from their answers ONLY ONCE - don't repeat the same facts. Keep it brief and punchy. Focus on the vibe they'll bring.]

---

## Bottom Line

[Write 1-2 sentences max. Keep it warm but concise. Make it about the OVERALL impression, NOT repeating specific details you already mentioned. Focus on the energy/vibe.]

FORMAT FOR REJECTED (use this if decision is REJECTED):

## Maybe We Read You Wrong?

[Write EXACTLY 2-3 sentences. MAX 350 characters total. Brief, kind, and warm. Note their answers felt a bit light on details/energy, invite them to try again. NO extra sections, NO bullet points, NO additional commentary. JUST the rejection message.]

Example rejection (good):
"Your answers were pretty brief and didn't give us much to go on. We're looking for folks who are genuinely excited to show up and connect. But hey, maybe we read you wrong - feel free to give it another shot with a bit more of your personality!"

CRITICAL RULES FOR REJECTION:
- ONLY write the 2-3 sentence rejection message
- DO NOT add tagline, observations, or any other sections
- MAX 350 characters
- Keep it warm and encouraging
- Focus on lack of detail/effort, not content
- Always end with invitation to try again

IMPORTANT: Short, punchy sentences. No fluff - if you can cut a word, cut it. Make every word earn its place. Use contractions (you're, don't, can't, it's). Keep it conversational and light.`
  }
}
