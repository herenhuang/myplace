// Social Simulation (Small Talk) Prompts - HEXACO Extraversion (Sociability) Measurement

export const SOCIAL_INITIAL_PROMPT = () => `
You are creating the opening scene for a small talk simulation that measures social comfort naturally.

# Scenario: Doctor's Office Waiting Room
It's 2:15 PM on a Tuesday. You're at your doctor's office for a routine checkup, arrived 15 minutes early. The waiting room is mostly empty - just you, an older man reading a magazine, and someone you recognize from earlier today sitting a few seats away.

You remember seeing this person at the coffee shop this morning - they were in line ahead of you, ordered the same drink. Now they're here, looking at their phone, occasionally glancing around the room.

After a few minutes of comfortable silence, they turn to you with a friendly smile.

# Your Task
Write the opening moment where they initiate conversation. End with them making the classic small talk opener about the weather. Keep it natural and realistic - not forced or awkward.

Write 2-3 sentences in second person present tense ("You're sitting..."). Make it feel like a real waiting room moment.

Return ONLY the opening scene - no formatting, no explanations.
`;

export const SOCIAL_CONTINUE_PROMPT = (userResponse: string, turnNumber: number, conversationContext: string) => `
You are continuing a small talk scenario in a doctor's office waiting room.

# Context So Far
${conversationContext}

# User's Response
"${userResponse}"

# Turn ${turnNumber} Requirements
Turn 2: Show their reaction to your response and naturally continue the conversation
Turn 3: Create the phone buzz moment - their phone lights up with a notification during conversation  
Turn 4: They're being called by the nurse - final goodbye/connection moment

# Continuation Guidelines
- Keep it realistic and natural - this is just normal waiting room small talk
- Show appropriate social reactions to the user's response
- If user was minimal/brief, they might try once more or respect the signal
- If user was engaging, they continue more confidently
- Physical details: glancing at phone, shifting in seats, nurse calling names, etc.
- End with a natural moment requiring user response

Write 2-3 sentences in second person present tense. Keep the social dynamics realistic.

Return ONLY the story continuation - no formatting, no explanations.
`;

export const SOCIAL_PHONE_CHOICE_PROMPT = () => `
You are creating the phone buzz choice moment in a small talk simulation.

# Setup
During your conversation with this person, your phone lights up on your lap with a notification. You can see it's a text message from a friend or family member. The person you're talking with notices the phone light up but continues their sentence about weekend plans or the wait time.

# Your Task  
Create a clear choice moment where the user must decide their priority:

Option 1: "Check your phone"
Option 2: "Keep listening to them"

Write this as a natural moment where both choices feel valid. Don't make either choice seem obviously right or wrong.

Write 2-3 sentences setting up the choice moment in second person present tense.

Return ONLY the choice setup - no formatting, no explanations.
`;

export const SOCIAL_PHONE_CONSEQUENCE_PROMPT = (choice: string, conversationContext: string) => `
You are showing the consequence of the user's phone choice in a small talk scenario.

# Context
${conversationContext}

# User's Choice
${choice}

# Your Task
Show what happens based on their choice:

If "Check your phone":
- Brief transition to phone interface (they look down)
- Show the other person's reaction (pauses mid-sentence, looks away, checks their own phone)
- Set up return to conversation

If "Keep listening":
- Show they ignore the phone and maintain eye contact
- Other person notices and appreciates the attention
- Phone buzzes again but they resist looking

Keep it realistic - these are normal social dynamics, not dramatic consequences.

Write 2-3 sentences in second person present tense.

Return ONLY the consequence narrative - no formatting, no explanations.
`;

export const SOCIAL_GOODBYE_PROMPT = (userResponse: string, conversationContext: string, engagementLevel: string) => `
You are creating the goodbye moment in a small talk simulation.

# Full Context
${conversationContext}

# Latest User Response
"${userResponse}"

# Engagement Level
${engagementLevel} (based on their conversation pattern)

# Goodbye Scenario
The nurse calls their name: "Jennifer Martinez?" They gather their things and stand up. This is the natural ending moment.

Based on the engagement level:
- High engagement: They might suggest staying in touch, ask about social media
- Medium engagement: Friendly but standard goodbye  
- Low engagement: Brief, polite farewell

# Your Task
Create the goodbye moment that feels natural given their conversation style. Show how they handle this social closure - do they extend the connection or keep it contained?

Write 2-3 sentences in second person present tense.

Return ONLY the goodbye scene - no formatting, no explanations.
`;

export const SOCIAL_BEHAVIOR_ANALYSIS = (userResponses: Array<{turn: number, response: string, choice?: string}>) => `
You are a wise, supportive friend analyzing someone's social interaction patterns. Be encouraging and frame insights positively while staying authentic to what you observe.

# User Responses Throughout Social Scenario
${userResponses.map(r => `Turn ${r.turn}: ${r.choice ? `[Choice: ${r.choice}] ` : ""}"${r.response}"`).join('\n')}

# Your Approach as a Supportive Observer
- Start insights with observational language like "It feels like you..." "You seem to have..." "What comes across is..."
- Frame patterns as natural tendencies first, then growth areas as exciting opportunities
- Be genuine - only highlight what you actually observe
- Use warm, conversational tone throughout
- Focus on their unique social style rather than comparing to "ideal" behavior

# Analysis Framework - Social Comfort & Connection Style
Look for their natural approach to social interaction:
- How they handle unexpected social moments
- Their energy and comfort in conversation
- How they balance social needs with personal boundaries
- Their authentic way of connecting (or not connecting) with others

# Your Task
Generate a warm, supportive social style analysis:

{
  "socialStyle": "Social Energizer" | "Thoughtful Connector" | "Independent Operator",
  "extraversionScore": 1-9,
  "personalityHighlights": [
    "It feels like you... [specific observed strength]",
    "You seem to have... [another authentic quality]"  
  ],
  "socialPatterns": {
    "socialOpening": "What comes across is how you handle unexpected social moments...",
    "conversationFlow": "Your approach to conversation suggests...", 
    "priorityManagement": "It feels like you balance social interaction with...",
    "socialClosure": "Your style for ending interactions suggests..."
  },
  "socialInsights": {
    "strengths": [
      "What stands out is your...",
      "You seem to have this natural ability to..."
    ],
    "watchOutFor": [
      "One thing to keep in mind is...",
      "Sometimes you might want to consider..."  
    ],
    "dailyTips": [
      "You could try... [practical suggestion that builds on their strengths]",
      "Given your natural style, you might enjoy..."
    ]
  },
  "developmentAreas": [
    "An exciting opportunity for you would be...",
    "If you wanted to expand your comfort zone, you could..."
  ]
}

Remember: Frame everything through the lens of a supportive friend who genuinely appreciates their unique social approach.

Return ONLY the JSON - no other text or formatting.
`;

export const SOCIAL_ACTION_INSIGHTS = (userResponses: Array<{turn: number, response: string, choice?: string}>) => `
You are a supportive friend analyzing each social interaction response with encouraging insights.

# User Responses
${userResponses.map(r => `Turn ${r.turn}: ${r.choice ? `[Choice: ${r.choice}] ` : ""}"${r.response}"`).join('\n')}

# Your Approach as a Supportive Observer
- Use warm, observational language like "It feels like you..." "What comes across is..." "You seem to have this way of..."
- Frame each response as showing their unique social style
- Be genuine - only highlight what you actually observe
- Focus on their authentic approach rather than judging it

# Your Task
For each turn, provide ONE encouraging insight about their social interaction pattern:

Generate a JSON array of supportive insights:

[
  "What comes across in your response to their weather comment is... [specific authentic observation]",
  "Your approach to continuing the conversation suggests... [supportive insight about their style]", 
  "It feels like you handled the phone moment in a way that shows... [encouraging observation]",
  "Your way of ending the interaction suggests... [positive insight about their social approach]"
]

Remember: Write as a friend who genuinely appreciates their unique social style.

Return ONLY the JSON array - no other text or formatting.
`;

// Helper function to determine social style from extraversion score
export function getSocialStyleFromScore(score: number): {
  style: string
  title: string
  description: string
} {
  if (score <= 3) {
    return {
      style: "Independent Operator",
      title: "Independent Operator", 
      description: "You value focused, meaningful interactions and are comfortable with your own company. You prefer quality over quantity in social connections."
    }
  } else if (score <= 6) {
    return {
      style: "Thoughtful Connector",
      title: "Thoughtful Connector",
      description: "You engage selectively in social situations, choosing when and how to connect based on your energy and interest. You balance social interaction with personal space."
    }
  } else {
    return {
      style: "Social Energizer", 
      title: "Social Energizer",
      description: "You naturally engage with people and often find energy in social interactions. You're comfortable initiating and maintaining conversations with different types of people."
    }
  }
}