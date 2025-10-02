import { Archetype } from '../types';

export const SCENARIO_CONTEXT = "The user's company is having a major product crisis on launch day, and customers cannot use the product.";

export const GUARD_RAIL_PROMPT = (userInput: string) => `System: You are a simple safety filter. Your only job is to identify responses that are harmful, abusive, spam, or complete nonsense.

Task: Is this response harmful, abusive, spam, or complete nonsense? Respond with "YES" if it's harmful/spam/nonsense that should be blocked, or "NO" if it's fine to proceed. Accept all casual language, short responses, and normal human reactions.

# Scenario Context:
${SCENARIO_CONTEXT}

# User's Response:
"${userInput}"

# Your Verdict (YES or NO):`;

export const ENGINE_PROMPT = (userInput: string, storySoFar: string, nextStoryBeat: string | null = null) => `System: You are a master storyteller and behavioral psychologist creating a realistic simulation. Your job is to analyze the user's response, classify their core approach, and continue the story in a way that feels natural and flows smoothly into the next story development.

# 1. The Axis of Analysis
You must classify the user's approach as one of two types:
- 🔥 Momentum: This approach prioritizes immediate action to change the situation now. It's about acting quickly to seize opportunities or address challenges directly.
- ⚡️ Method: This approach prioritizes careful analysis and understanding before acting. It's about gathering information and planning to ensure the next move is well-informed.

# 2. Story Context
So far, the story is:
${storySoFar}

# 3. The User's Latest Action
"${userInput}"

${nextStoryBeat ? `# 4. Next Story Development
After your response, the story will develop as follows: "${nextStoryBeat}"
Your continuation should flow naturally toward this development without directly stating it.

# 5. Your Task` : `# 4. Your Task`}
Based on all the above, perform three actions and return them in a single JSON object.
1.  **classify:** Classify the user's philosophical approach in their latest action as either "Momentum" or "Method".
2.  **continue_story:** Write the next 2-3 sentences of the story, continuing the narrative naturally in the same tone and context as established.
3.  **summarize_action:** Write a brief, active summary of the user's core action in this turn.

Return your response ONLY as a valid JSON object with three keys: "classification", "next_scene_text", and "action_summary".

Example Output:
{
  "classification": "Momentum",
  "next_scene_text": "You decide to take action immediately. The situation begins to shift...",
  "action_summary": "taking immediate action to address the situation"
}`;

export const CONCLUSION_PROMPT = (storySoFar: string, userActions: string[]) => `You're concluding someone's product crisis story. Write their ending in a professional but authentic way that feels real to startup/business environments.

# Their Journey
User's choices: ${userActions.join('. ')}

# Writing Instructions
- Write in second person ("you") - you're telling THEIR story
- Keep it professional but conversational, like a colleague recapping what happened
- 2 short paragraphs, about 600 characters total
- If there are consequences, show how things work out or what was learned
- End on a realistic but not overly negative note
- This is about YOUR individual leadership and decision-making

# Format
PARAGRAPH1: [~300 chars - what happened next]
PARAGRAPH2: [~300 chars - how it settled/what you learned/moving forward]

Write a natural conclusion to their crisis management story.`;

// The four crisis archetypes based on Momentum vs Method
export const ARCHETYPES: Record<string, Archetype> = {
  "crisis_catalyst": {
    name: "The Crisis Catalyst",
    emoji: "🔥🔥🔥",
    subtitle: "You act when others freeze. Chaos sharpens your focus.",
    flavorText: "You turn chaos into momentum. When everything's breaking, you're the one who gets it moving again. You have an instinct for triage—you know what needs immediate attention and what can wait. Teams rely on you because you don't freeze under pressure; you channel it into action. Your superpower is creating forward motion when others are paralyzed by uncertainty. Just watch out for burnout—sometimes the fire you're putting out could have been prevented with a bit more planning upfront."
  },
  "rapid_strategist": {
    name: "The Rapid Strategist", 
    emoji: "🔥🔥⚡️",
    subtitle: "You move fast - without losing the bigger picture.",
    flavorText: "You move fast but think two steps ahead. Speed with direction. You're the rare person who can act decisively without being reckless—you see the immediate problem AND the bigger picture. Teams love working with you because you keep projects moving while actually making them better. You excel in environments where both urgency and quality matter. Your challenge is communicating your rapid thinking to teammates who need more time to process. Remember: not everyone can keep up with your mental pace."
  },
  "systematic_solver": {
    name: "The Systematic Solver",
    emoji: "⚡️⚡️🔥", 
    subtitle: "You fix what broke - and the pattern that broke it.",
    flavorText: "You fix the problem and the process that created it. One crisis at a time, you make things better permanently. You have the discipline to resist quick fixes when you know they'll create bigger problems later. Teams appreciate that you don't just put band-aids on issues—you actually solve them. You're building towards something sustainable, not just getting through today. Your weakness? Sometimes the perfect solution takes too long, and good enough would have been better. Learn to recognize when speed trumps perfection."
  },
  "systems_architect": {
    name: "The Systems Architect",
    emoji: "⚡️⚡️⚡️",
    subtitle: "You think beyond today - and build to prevent tomorrow's fires.",
    flavorText: "You build the infrastructure that prevents tomorrow's fires. Long-term thinking, lasting impact. You see patterns others miss and design solutions that scale. While others are fighting today's crisis, you're preventing next month's. Teams benefit enormously from your foresight—the problems that never happen because you anticipated them. Your challenge is staying relevant when the building is actually on fire. Sometimes the team needs you to grab a hose instead of redesigning the sprinkler system. Balance your vision with present needs."
  }
};

// Static questions for the three turns
export const QUESTIONS = [
  "Your Director of Product DMs you. The message has only five words: 'What is our immediate response?'",
  "It's now 11:30 AM. You're on an emergency Zoom with leads from Marketing, Comms, and Engineering. The Head of Marketing says, 'We need to send an email to all users now. What is the single, most important message we need to communicate?'",
  "It's a week later. The Project Orion crisis is over. The team is gathered for the official retrospective. The conversation turns from what happened to how to prevent it from happening again. Your Director turns to you and says, 'I want one new rule for our launch playbook that will prevent this kind of failure. What is it?'"
];

// Initial scene text
export const INITIAL_SCENE = "It's 9:00 AM on launch day for Project Orion. The announcement just went live. You're watching the real-time analytics when your stomach drops. The main dashboard lights up with red alerts. Simultaneously, the #customer-support channel explodes. A lead support agent tags you directly: '@here - We're getting flooded with tickets. Users are saying they can't log in to their new accounts after creation. This is a P0 issue.'";

// Scenario metadata
export const SCENARIO_INFO = {
  title: "The 9 AM Catastrophe",
  description: "A crisis simulation testing your problem-solving approach during a product launch emergency.",
  path: "/crisis-simulation"
};

// Function to determine archetype from user path
export function getArchetypeFromPath(userPath: string[]): Archetype {
  const momentumCount = userPath.filter(classification => classification === "Momentum").length;
  
  if (momentumCount === 3) {
    return ARCHETYPES.crisis_catalyst;
  } else if (momentumCount === 2) {
    return ARCHETYPES.rapid_strategist;
  } else if (momentumCount === 1) {
    return ARCHETYPES.systematic_solver;
  } else {
    return ARCHETYPES.systems_architect;
  }
}
